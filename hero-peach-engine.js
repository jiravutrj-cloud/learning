/* ============================================================================
 * organ cloud 2.0 — Ultra-Realism Moonlit Peach Cliff Matte-Painting Engine
 * File: hero-peach-engine.js (Zero-Build Standalone Production Module)
 * Public Exports: window.RJCLOUD_HERO_PEACH
 *
 * องค์ประกอบระดับภาพยนตร์ครบชุด (60/120FPS Offscreen-Baked + Real-Time):
 * 1. ท้องฟ้าทางช้างเผือก + ดาวฤกษ์หลายอุณหภูมิสี (พร้อมประกายแฉก) + ดาวตก 4 สาย
 * 2. ดวงจันทร์เสี้ยวสมจริง (Lunar Maria, หลุมอุกกาบาต, แสง Earthshine, วงทรงกลด 22°)
 * 3. กลุ่มเมฆพายุ Volumetric (Anvil Cumulonimbus / Billow / Cirrus) + ฟ้าแลบแตกแขนง
 *    พร้อมแสงเรืองทะลุกลีบเมฆจากด้านในและแสงสะท้อนเชื่อมทั้งท้องฟ้า ทะเล และพุ่มดอกท้อ
 * 4. นกกระเรียนเงิน 3 ตัว กระพือปีก 2 ข้อต่ออ่อนช้อยพร้อมทางแสงละอองดาว
 * 5. ทิวเขาสลับซับซ้อน 3 ระยะ + ทะเลแสงจันทร์แบบ Perspective & Fresnel Specular
 * 6. หน้าผาหินชั้น (Rock Strata, รอยแยก, หญ้าลู่ลม) + ไอหมอกเย็นรินลงขอบผา
 * 7. ต้นดอกท้อโบราณ 4 ระดับ (เปลือกไม้แตก, รากเกาะหิน, กิ่งฝอย, ดอกท้อ 5 กลีบมีเกสร,
 *    แสงปราณไหลผ่านกิ่ง, กลีบดอกพลิกหมุน 3 มิติ) + มิติ 3D Mouse Parallax
 * ============================================================================ */

(function (global) {
  'use strict';

  // ============================================================================
  // 1. DETERMINISTIC PRNG, 1D VALUE NOISE / fBm & BEZIER MATH
  // ============================================================================
  function createRng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function createNoise1D(seed, size) {
    const rng = createRng(seed);
    const tbl = new Float32Array(size || 256);
    for (let i = 0; i < tbl.length; i++) tbl[i] = rng();
    return function (x) {
      const xi = Math.floor(x);
      const xf = x - xi;
      const u = xf * xf * (3 - 2 * xf);
      const a = tbl[((xi % tbl.length) + tbl.length) % tbl.length];
      const b = tbl[(((xi + 1) % tbl.length) + tbl.length) % tbl.length];
      return a + (b - a) * u;
    };
  }

  function fbm1D(noiseFn, x, octaves) {
    let val = 0;
    let amp = 0.5;
    let freq = 1;
    let norm = 0;
    for (let i = 0; i < octaves; i++) {
      val += noiseFn(x * freq) * amp;
      norm += amp;
      amp *= 0.5;
      freq *= 2.08;
    }
    return val / norm;
  }

  function evalCubic(p0, p1, p2, p3, u) {
    const inv = 1 - u;
    return [
      inv * inv * inv * p0[0] + 3 * inv * inv * u * p1[0] + 3 * inv * u * u * p2[0] + u * u * u * p3[0],
      inv * inv * inv * p0[1] + 3 * inv * inv * u * p1[1] + 3 * inv * u * u * p2[1] + u * u * u * p3[1]
    ];
  }

  // ============================================================================
  // 2. SHARED PRE-RENDERED SPRITES (MOON, BOTANICAL BLOSSOMS, MIST, STORM CLOUDS)
  // ============================================================================
  let sharedAssets = null;

  function buildUltraMoonSprite() {
    const size = 340;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const mc = c.getContext('2d');
    const cx = size / 2;
    const cy = size / 2;
    const r = 52;
    const rng = createRng(90210);

    // 22-degree atmospheric ice-crystal corona ring
    const ringGrad = mc.createRadialGradient(cx, cy, r * 2.15, cx, cy, r * 3.15);
    ringGrad.addColorStop(0, 'rgba(186, 230, 253, 0)');
    ringGrad.addColorStop(0.45, 'rgba(186, 230, 253, 0.055)');
    ringGrad.addColorStop(0.62, 'rgba(224, 242, 254, 0.08)');
    ringGrad.addColorStop(0.80, 'rgba(253, 230, 138, 0.03)');
    ringGrad.addColorStop(1, 'rgba(147, 197, 253, 0)');
    mc.fillStyle = ringGrad;
    mc.beginPath();
    mc.arc(cx, cy, r * 3.15, 0, Math.PI * 2);
    mc.fill();

    // Mie scattering bloom
    const bloom = mc.createRadialGradient(cx + 8, cy + 6, r * 0.25, cx, cy, r * 2.55);
    bloom.addColorStop(0, 'rgba(240, 249, 255, 0.48)');
    bloom.addColorStop(0.32, 'rgba(186, 230, 253, 0.22)');
    bloom.addColorStop(0.65, 'rgba(125, 185, 245, 0.06)');
    bloom.addColorStop(1, 'rgba(56, 130, 220, 0)');
    mc.fillStyle = bloom;
    mc.beginPath();
    mc.arc(cx, cy, r * 2.55, 0, Math.PI * 2);
    mc.fill();

    // Full lunar disc with Maria & craters
    const disc = document.createElement('canvas');
    disc.width = size;
    disc.height = size;
    const dc = disc.getContext('2d');

    dc.save();
    dc.beginPath();
    dc.arc(cx, cy, r, 0, Math.PI * 2);
    dc.clip();

    const baseG = dc.createRadialGradient(cx + r * 0.45, cy + r * 0.35, r * 0.1, cx, cy, r * 1.15);
    baseG.addColorStop(0, '#ffffff');
    baseG.addColorStop(0.55, '#edf4fb');
    baseG.addColorStop(0.85, '#cfdce9');
    baseG.addColorStop(1, '#9fb5cc');
    dc.fillStyle = baseG;
    dc.fillRect(cx - r, cy - r, r * 2, r * 2);

    // Lunar Maria basalt plains
    for (let i = 0; i < 26; i++) {
      const mx = cx + (rng() - 0.46) * r * 1.5;
      const my = cy + (rng() - 0.5) * r * 1.45;
      const mr = 7 + rng() * 19;
      const mg = dc.createRadialGradient(mx, my, 1, mx, my, mr);
      mg.addColorStop(0, 'rgba(82, 104, 130, ' + (0.14 + rng() * 0.16).toFixed(2) + ')');
      mg.addColorStop(0.65, 'rgba(104, 126, 152, 0.07)');
      mg.addColorStop(1, 'rgba(104, 126, 152, 0)');
      dc.fillStyle = mg;
      dc.beginPath();
      dc.arc(mx, my, mr, 0, Math.PI * 2);
      dc.fill();
    }

    // Crisp micro-craters with sunlit rims
    for (let i = 0; i < 42; i++) {
      const crX = cx + (rng() - 0.5) * r * 1.7;
      const crY = cy + (rng() - 0.5) * r * 1.7;
      const crR = 1.2 + rng() * 4.2;
      dc.fillStyle = 'rgba(72, 92, 118, 0.14)';
      dc.beginPath();
      dc.arc(crX, crY, crR, 0, Math.PI * 2);
      dc.fill();
      dc.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      dc.lineWidth = 0.7;
      dc.beginPath();
      dc.arc(crX + 0.5, crY + 0.5, crR, -0.4, 1.4);
      dc.stroke();
    }
    dc.restore();

    // Subtle Earthshine dark side
    mc.save();
    mc.globalAlpha = 0.13;
    mc.drawImage(disc, 0, 0);
    mc.restore();

    // Luminous waxing crescent carved with soft terminator
    const lit = document.createElement('canvas');
    lit.width = size;
    lit.height = size;
    const lc = lit.getContext('2d');
    lc.drawImage(disc, 0, 0);

    lc.globalCompositeOperation = 'destination-out';
    const shX = cx - r * 0.36;
    const shY = cy - r * 0.24;
    const shR = r * 0.96;
    const termGrad = lc.createRadialGradient(shX, shY, shR * 0.80, shX, shY, shR * 1.04);
    termGrad.addColorStop(0, 'rgba(0,0,0,1)');
    termGrad.addColorStop(0.86, 'rgba(0,0,0,0.96)');
    termGrad.addColorStop(1, 'rgba(0,0,0,0)');
    lc.fillStyle = termGrad;
    lc.beginPath();
    lc.arc(shX, shY, shR * 1.04, 0, Math.PI * 2);
    lc.fill();

    mc.save();
    mc.shadowColor = 'rgba(219, 240, 255, 0.95)';
    mc.shadowBlur = 14;
    mc.drawImage(lit, 0, 0);
    mc.restore();

    return c;
  }

  function drawSingleBotanicalBlossom(bc, fx, fy, sc, rot, tone) {
    // Occasional young slender peach leaf tucked behind mid-canopy clusters
    if (tone === 'mid' && Math.sin(rot * 5) > 0.55) {
      bc.save();
      bc.translate(fx, fy);
      bc.rotate(rot + 1.1);
      const lg = bc.createLinearGradient(0, 0, 14 * sc, 0);
      lg.addColorStop(0, '#1e3a32');
      lg.addColorStop(0.6, '#2f5e4e');
      lg.addColorStop(1, '#5d8f72');
      bc.fillStyle = lg;
      bc.beginPath();
      bc.moveTo(2 * sc, 0);
      bc.quadraticCurveTo(9 * sc, -3.5 * sc, 16 * sc, 0);
      bc.quadraticCurveTo(9 * sc, 3.5 * sc, 2 * sc, 0);
      bc.fill();
      bc.restore();
    }

    // 5 notched peach petals
    for (let p = 0; p < 5; p++) {
      const ang = rot + (p * Math.PI * 2) / 5 + (p % 2 ? 0.04 : -0.04);
      bc.save();
      bc.translate(fx, fy);
      bc.rotate(ang);
      const pg = bc.createRadialGradient(3 * sc, 0, 0.6 * sc, 8 * sc, 0, 11 * sc);
      if (tone === 'sss') {
        pg.addColorStop(0, '#fff7ed');
        pg.addColorStop(0.28, '#ffe4e6');
        pg.addColorStop(0.68, '#fbcfe8');
        pg.addColorStop(1, 'rgba(244, 114, 182, 0.85)');
      } else if (tone === 'light') {
        pg.addColorStop(0, '#be185d');
        pg.addColorStop(0.18, '#f9a8d4');
        pg.addColorStop(0.58, '#fdf2f8');
        pg.addColorStop(0.90, '#ffffff');
        pg.addColorStop(1, '#fbcfe8');
      } else {
        pg.addColorStop(0, '#831843');
        pg.addColorStop(0.25, '#db2777');
        pg.addColorStop(0.65, '#f9a8d4');
        pg.addColorStop(0.92, '#fce7f3');
        pg.addColorStop(1, '#ec4899');
      }
      bc.fillStyle = pg;
      bc.beginPath();
      bc.moveTo(0, 0);
      bc.bezierCurveTo(3.5 * sc, -5.2 * sc, 11.2 * sc, -5.8 * sc, 13.0 * sc, -1.2 * sc);
      bc.quadraticCurveTo(11.8 * sc, 0, 13.0 * sc, 1.2 * sc);
      bc.bezierCurveTo(11.2 * sc, 5.8 * sc, 3.5 * sc, 5.2 * sc, 0, 0);
      bc.fill();
      bc.restore();
    }

    // Crimson calyx + stamens & golden anthers
    bc.fillStyle = tone === 'sss' ? '#fb7185' : '#9d174d';
    bc.beginPath();
    bc.arc(fx, fy, 2.3 * sc, 0, Math.PI * 2);
    bc.fill();

    for (let s = 0; s < 7; s++) {
      const sa = rot + (s * Math.PI * 2) / 7;
      const sl = (3.8 + (s % 2) * 1.4) * sc;
      const sx = fx + Math.cos(sa) * sl;
      const sy = fy + Math.sin(sa) * sl;
      bc.strokeStyle = 'rgba(255, 241, 242, 0.72)';
      bc.lineWidth = 0.6 * sc;
      bc.beginPath();
      bc.moveTo(fx, fy);
      bc.lineTo(sx, sy);
      bc.stroke();
      bc.fillStyle = '#fef08a';
      bc.beginPath();
      bc.arc(sx, sy, 0.9 * sc, 0, Math.PI * 2);
      bc.fill();
    }
  }

  function createBotanicalClusterSprite(mode, seed) {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const bc = c.getContext('2d');
    const rng = createRng(seed);

    if (mode === 'shadow') {
      for (let i = 0; i < 12; i++) {
        const px = 64 + (rng() - 0.5) * 62;
        const py = 64 + (rng() - 0.5) * 44;
        const rad = 16 + rng() * 18;
        const g = bc.createRadialGradient(px, py, 2, px, py, rad);
        g.addColorStop(0, 'rgba(58, 16, 46, 0.90)');
        g.addColorStop(0.55, 'rgba(34, 12, 38, 0.62)');
        g.addColorStop(1, 'rgba(14, 8, 26, 0)');
        bc.fillStyle = g;
        bc.beginPath();
        bc.arc(px, py, rad, 0, Math.PI * 2);
        bc.fill();
      }
      return c;
    }

    const aura = bc.createRadialGradient(64, 64, 6, 64, 64, 56);
    if (mode === 'sss' || mode === 'light') {
      aura.addColorStop(0, 'rgba(255, 242, 248, 0.44)');
      aura.addColorStop(0.5, 'rgba(249, 168, 212, 0.18)');
      aura.addColorStop(1, 'rgba(244, 114, 182, 0)');
    } else {
      aura.addColorStop(0, 'rgba(219, 39, 119, 0.28)');
      aura.addColorStop(0.6, 'rgba(157, 23, 77, 0.10)');
      aura.addColorStop(1, 'rgba(131, 24, 67, 0)');
    }
    bc.fillStyle = aura;
    bc.beginPath();
    bc.arc(64, 64, 56, 0, Math.PI * 2);
    bc.fill();

    // Unopened deep-pink buds
    for (let b = 0; b < 4; b++) {
      const bx = 64 + (rng() - 0.5) * 68;
      const by = 64 + (rng() - 0.5) * 52;
      bc.save();
      bc.translate(bx, by);
      bc.rotate(rng() * Math.PI * 2);
      bc.fillStyle = '#be185d';
      bc.beginPath();
      bc.ellipse(0, 0, 4.2, 2.6, 0, 0, Math.PI * 2);
      bc.fill();
      bc.fillStyle = '#fbcfe8';
      bc.beginPath();
      bc.ellipse(1.2, -0.4, 2.2, 1.3, 0, 0, Math.PI * 2);
      bc.fill();
      bc.restore();
    }

    const cnt = mode === 'hero' ? 4 : mode === 'sss' ? 5 : 7;
    for (let f = 0; f < cnt; f++) {
      const fx = 64 + (rng() - 0.5) * 58;
      const fy = 64 + (rng() - 0.5) * 44;
      const sc = (mode === 'hero' ? 0.82 : 0.65) + rng() * 0.42;
      drawSingleBotanicalBlossom(bc, fx, fy, sc, rng() * Math.PI * 2, mode === 'hero' ? 'light' : mode);
    }
    return c;
  }

  function createColdMistSprite(seed, variant) {
    const c = document.createElement('canvas');
    const isPlume = variant === 'plume';
    const isWisp = variant === 'wisp';
    c.width = isPlume ? 200 : isWisp ? 540 : 500;
    c.height = isPlume ? 360 : isWisp ? 230 : 300;
    const mc = c.getContext('2d');
    const rng = createRng(seed);

    const puffs = isPlume ? 26 : isWisp ? 34 : 44;
    for (let i = 0; i < puffs; i++) {
      const u = i / Math.max(1, puffs - 1);
      const dome = Math.sin(u * Math.PI);
      let px, py, rx, ry;
      if (isPlume) {
        px = c.width * 0.5 + (rng() - 0.5) * (36 + u * 60);
        py = 36 + u * (c.height - 80) + (rng() - 0.5) * 20;
        rx = 26 + u * 30 + rng() * 20;
        ry = 34 + rng() * 32;
      } else {
        px = 82 + u * (c.width - 164) + (rng() - 0.5) * (isWisp ? 42 : 70);
        py = c.height * 0.54 - dome * (isWisp ? 12 : 22) + (rng() - 0.5) * (isWisp ? 34 : 80);
        rx = (isWisp ? 56 : 70) + rng() * (isWisp ? 64 : 86) * (0.62 + dome * 0.48);
        ry = (isWisp ? 23 : 38) + rng() * (isWisp ? 26 : 50) * (0.62 + dome * 0.48);
      }

      const roll = rng();
      const rgb =
        roll < 0.36
          ? '234, 246, 255'
          : roll < 0.72
            ? '182, 220, 248'
            : '132, 184, 226';
      const peak = isPlume ? 0.055 + rng() * 0.045 : isWisp ? 0.044 + rng() * 0.036 : 0.052 + rng() * 0.042;

      mc.save();
      mc.translate(px, py);
      mc.scale(1, ry / Math.max(1, rx));
      const g = mc.createRadialGradient(0, -rx * 0.06, rx * 0.04, 0, 0, rx);
      g.addColorStop(0, 'rgba(' + rgb + ',' + peak.toFixed(3) + ')');
      g.addColorStop(0.48, 'rgba(' + rgb + ',' + (peak * 0.52).toFixed(3) + ')');
      g.addColorStop(0.80, 'rgba(' + rgb + ',' + (peak * 0.14).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(' + rgb + ',0)');
      mc.fillStyle = g;
      mc.beginPath();
      mc.arc(0, 0, rx, 0, Math.PI * 2);
      mc.fill();
      mc.restore();
    }
    return c;
  }

  function buildCinematicCloudPair(seed, shape) {
    const isCirrus = shape === 'cirrus';
    const isAnvil = shape === 'anvil';
    const cw = isCirrus ? 620 : isAnvil ? 680 : 560;
    const ch = isCirrus ? 180 : isAnvil ? 330 : 280;

    const baseCanvas = document.createElement('canvas');
    baseCanvas.width = cw;
    baseCanvas.height = ch;
    const bc = baseCanvas.getContext('2d');

    const litCanvas = document.createElement('canvas');
    litCanvas.width = cw;
    litCanvas.height = ch;
    const lc = litCanvas.getContext('2d');

    const rng = createRng(seed);
    const puffs = [];
    const count = isCirrus ? 28 : isAnvil ? 62 : 46;

    for (let i = 0; i < count; i++) {
      const u = i / Math.max(1, count - 1);
      const dome = Math.sin(u * Math.PI);
      let px, py, rx, ry;
      if (isCirrus) {
        px = 70 + u * (cw - 140) + (rng() - 0.5) * 40;
        py = ch * 0.52 + (rng() - 0.5) * 34;
        rx = 58 + rng() * 72 * (0.55 + dome * 0.5);
        ry = 14 + rng() * 18;
      } else if (isAnvil) {
        const inTop = i > count * 0.42;
        const spread = inTop ? 0.72 : 0.88;
        px = cw * (0.5 + (u - 0.5) * spread) + (rng() - 0.5) * 70;
        py = inTop ? ch * (0.52 - dome * 0.28) + (rng() - 0.5) * 44 : ch * 0.67 + (rng() - 0.5) * 28;
        rx = (inTop ? 46 : 68) + rng() * (inTop ? 58 : 74) * (0.65 + dome * 0.45);
        ry = (inTop ? 38 : 30) + rng() * (inTop ? 44 : 30) * (0.65 + dome * 0.45);
      } else {
        px = 86 + u * (cw - 172) + (rng() - 0.5) * 62;
        py = ch * 0.58 - dome * 42 + (rng() - 0.5) * 50;
        rx = 52 + rng() * 64 * (0.62 + dome * 0.48);
        ry = 32 + rng() * 38 * (0.62 + dome * 0.48);
      }
      puffs.push({ px: px, py: py, rx: rx, ry: ry, rand: rng() });
    }

    // Pass 1: Heavy Storm Underside & Volumetric Core Shadow
    for (let i = 0; i < puffs.length; i++) {
      const p = puffs[i];
      bc.save();
      bc.translate(p.px, p.py + (isCirrus ? 0 : 10));
      bc.scale(1, p.ry / Math.max(1, p.rx));
      const g = bc.createRadialGradient(0, p.rx * 0.12, p.rx * 0.05, 0, 0, p.rx);
      if (isCirrus) {
        g.addColorStop(0, 'rgba(148, 196, 238, 0.14)');
        g.addColorStop(0.55, 'rgba(92, 144, 200, 0.06)');
        g.addColorStop(1, 'rgba(30, 58, 108, 0)');
      } else {
        const darkA = 0.24 + p.rand * 0.16;
        g.addColorStop(0, 'rgba(6, 13, 30, ' + darkA.toFixed(3) + ')');
        g.addColorStop(0.52, 'rgba(11, 24, 50, ' + (darkA * 0.68).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(11, 24, 50, 0)');
      }
      bc.fillStyle = g;
      bc.beginPath();
      bc.arc(0, 0, p.rx, 0, Math.PI * 2);
      bc.fill();
      bc.restore();
    }

    // Pass 2: Moonlit Silver Lining on Upper Crests
    if (!isCirrus) {
      for (let i = 0; i < puffs.length; i++) {
        const p = puffs[i];
        bc.save();
        bc.translate(p.px - 6, p.py - 8);
        bc.scale(1, (p.ry * 0.88) / Math.max(1, p.rx * 0.90));
        const r = p.rx * 0.90;
        const g = bc.createRadialGradient(-r * 0.22, -r * 0.24, r * 0.04, 0, 0, r);
        const rimA = p.py < ch * 0.56 ? 0.14 + p.rand * 0.10 : 0.05;
        g.addColorStop(0, 'rgba(196, 228, 255, ' + rimA.toFixed(3) + ')');
        g.addColorStop(0.32, 'rgba(66, 106, 158, ' + (0.14 + p.rand * 0.08).toFixed(3) + ')');
        g.addColorStop(0.68, 'rgba(20, 40, 76, 0.11)');
        g.addColorStop(1, 'rgba(10, 20, 44, 0)');
        bc.fillStyle = g;
        bc.beginPath();
        bc.arc(0, 0, r, 0, Math.PI * 2);
        bc.fill();
        bc.restore();
      }
    }

    // Pass 3: Matching Internal Lightning Subsurface Glow Sprite
    for (let i = 0; i < puffs.length; i++) {
      const p = puffs[i];
      const distFromHeart = Math.hypot((p.px - cw * 0.52) / (cw * 0.42), (p.py - ch * 0.54) / (ch * 0.42));
      const heat = Math.max(0.08, 1 - distFromHeart * 0.85);
      lc.save();
      lc.translate(p.px, p.py);
      lc.scale(1, p.ry / Math.max(1, p.rx));
      const r = p.rx * 1.04;
      const g = lc.createRadialGradient(0, 0, r * 0.05, 0, 0, r);
      const a = (isCirrus ? 0.12 : 0.20) * heat * (0.65 + p.rand * 0.5);
      g.addColorStop(0, 'rgba(240, 248, 255, ' + a.toFixed(3) + ')');
      g.addColorStop(0.36, 'rgba(165, 214, 255, ' + (a * 0.72).toFixed(3) + ')');
      g.addColorStop(0.72, 'rgba(139, 156, 248, ' + (a * 0.34).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(99, 102, 241, 0)');
      lc.fillStyle = g;
      lc.beginPath();
      lc.arc(0, 0, r, 0, Math.PI * 2);
      lc.fill();
      lc.restore();
    }

    return { base: baseCanvas, lit: litCanvas };
  }

  function getSharedAssets() {
    if (sharedAssets) return sharedAssets;
    sharedAssets = {
      moon: buildUltraMoonSprite(),
      blShadow: createBotanicalClusterSprite('shadow', 1001),
      blMidA: createBotanicalClusterSprite('mid', 2002),
      blMidB: createBotanicalClusterSprite('mid', 2029),
      blLight: createBotanicalClusterSprite('light', 3003),
      blHero: createBotanicalClusterSprite('hero', 4004),
      blSss: createBotanicalClusterSprite('sss', 5005),
      mistCloud: createColdMistSprite(7711, 'cloud'),
      mistWisp: createColdMistSprite(8822, 'wisp'),
      mistPlume: createColdMistSprite(9933, 'plume'),
      clouds: {
        anvilA: buildCinematicCloudPair(61011, 'anvil'),
        anvilB: buildCinematicCloudPair(62023, 'anvil'),
        billowA: buildCinematicCloudPair(63047, 'billow'),
        billowB: buildCinematicCloudPair(64089, 'billow'),
        cirrusA: buildCinematicCloudPair(65103, 'cirrus'),
        cirrusB: buildCinematicCloudPair(66137, 'cirrus')
      }
    };
    return sharedAssets;
  }

  // Fractal Midpoint-Displacement Lightning Bolt Generator
  function buildFractalLightningPath(x0, y0, x1, y1, jaggedness, depth) {
    let pts = [[x0, y0], [x1, y1]];
    let disp = jaggedness;
    for (let iter = 0; iter < depth; iter++) {
      const next = [pts[0]];
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        const mx = (a[0] + b[0]) * 0.5;
        const my = (a[1] + b[1]) * 0.5;
        const dx = b[0] - a[0];
        const dy = b[1] - a[1];
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;
        const offset = (Math.random() - 0.5) * 2 * disp;
        next.push([mx + nx * offset, my + ny * offset]);
        next.push(b);
      }
      pts = next;
      disp *= 0.54;
    }
    return pts;
  }

  // ============================================================================
  // 3. MAIN MOUNTABLE ULTRA-REALISM ENGINE (CALLED BY index.html)
  // ============================================================================
  function mount(refs) {
    const stage = refs && refs.stage;
    const canvas = refs && (refs.canvas || refs.bgCanvas);
    if (!stage || !canvas) return { destroy: function () {} };

    const ctx = canvas.getContext('2d');
    if (!ctx) return { destroy: function () {} };

    const assets = getSharedAssets();
    let W = stage.clientWidth || global.innerWidth || 1280;
    let H = stage.clientHeight || global.innerHeight || 720;
    let DPR = Math.min(global.devicePixelRatio || 1, 2);
    let disposed = false;
    let rafId = null;
    let resizeTimer = null;

    // Interactive 3D Pointer Parallax
    let ptrTargetX = 0;
    let ptrTargetY = 0;
    let ptrX = 0;
    let ptrY = 0;
    const onPointerMove = function (e) {
      if (W <= 0 || H <= 0) return;
      ptrTargetX = (e.clientX / W - 0.5) * 2;
      ptrTargetY = (e.clientY / H - 0.5) * 2;
    };
    global.addEventListener('pointermove', onPointerMove, { passive: true });

    // Optional external bloom & storm controls (default 1.0 = full majestic bloom on landing)
    let bloomTarget = typeof (refs && refs.initialBloom) === 'number' ? refs.initialBloom : 1.0;
    let bloomCurrent = bloomTarget;
    let stormEnabled = !(refs && refs.stormEnabled === false);

    // --------------------------------------------------------------------------
    // A. BOTANICAL 4-LEVEL ANCIENT PEACH TREE SKELETON & CANOPY
    // --------------------------------------------------------------------------
    const trunkCurve = [[0.045, 0.032], [-0.012, -0.092], [-0.082, -0.215], [-0.112, -0.348]];
    const cliffRoots = [
      [[0.025, 0.008], [-0.04, 0.015], [-0.11, 0.022], [-0.175, 0.032]],
      [[0.048, 0.010], [0.10, 0.018], [0.165, 0.024], [0.22, 0.032]],
      [[0.032, 0.012], [0.01, 0.024], [-0.035, 0.036], [-0.075, 0.044]]
    ];

    const primaryBoughs = [
      { id: 0, trunkT: 0.60, w0: 0.038, w1: 0.007, pts: [[-0.06, -0.20], [-0.28, -0.26], [-0.55, -0.27], [-0.85, -0.20]] },
      { id: 1, trunkT: 0.76, w0: 0.034, w1: 0.007, pts: [[-0.09, -0.27], [-0.29, -0.41], [-0.52, -0.47], [-0.73, -0.41]] },
      { id: 2, trunkT: 0.90, w0: 0.029, w1: 0.006, pts: [[-0.10, -0.32], [-0.23, -0.51], [-0.37, -0.64], [-0.52, -0.62]] },
      { id: 3, trunkT: 1.00, w0: 0.027, w1: 0.006, pts: [[-0.11, -0.34], [-0.15, -0.55], [-0.17, -0.71], [-0.19, -0.78]] },
      { id: 4, trunkT: 0.98, w0: 0.026, w1: 0.006, pts: [[-0.10, -0.33], [0.02, -0.53], [0.13, -0.68], [0.24, -0.75]] },
      { id: 5, trunkT: 0.87, w0: 0.028, w1: 0.006, pts: [[-0.08, -0.30], [0.13, -0.47], [0.32, -0.58], [0.50, -0.57]] },
      { id: 6, trunkT: 0.72, w0: 0.031, w1: 0.007, pts: [[-0.06, -0.24], [0.17, -0.35], [0.40, -0.42], [0.61, -0.36]] }
    ];

    const secondaryTwigs = [
      { parentId: 0, w0: 0.015, w1: 0.0035, pts: [[-0.36, -0.26], [-0.47, -0.36], [-0.58, -0.39], [-0.69, -0.35]] },
      { parentId: 0, w0: 0.013, w1: 0.0030, pts: [[-0.56, -0.26], [-0.68, -0.23], [-0.79, -0.26], [-0.91, -0.23]] },
      { parentId: 0, w0: 0.012, w1: 0.0030, pts: [[-0.24, -0.24], [-0.35, -0.18], [-0.45, -0.17], [-0.55, -0.21]] },
      { parentId: 1, w0: 0.015, w1: 0.0035, pts: [[-0.35, -0.42], [-0.46, -0.53], [-0.56, -0.57], [-0.65, -0.53]] },
      { parentId: 1, w0: 0.012, w1: 0.0030, pts: [[-0.49, -0.45], [-0.60, -0.45], [-0.70, -0.48], [-0.80, -0.45]] },
      { parentId: 2, w0: 0.013, w1: 0.0030, pts: [[-0.26, -0.54], [-0.32, -0.66], [-0.37, -0.73], [-0.44, -0.72]] },
      { parentId: 2, w0: 0.012, w1: 0.0030, pts: [[-0.35, -0.61], [-0.46, -0.66], [-0.55, -0.65], [-0.62, -0.59]] },
      { parentId: 3, w0: 0.013, w1: 0.0030, pts: [[-0.15, -0.57], [-0.06, -0.68], [-0.02, -0.76], [-0.02, -0.82]] },
      { parentId: 3, w0: 0.012, w1: 0.0030, pts: [[-0.16, -0.65], [-0.25, -0.73], [-0.32, -0.77], [-0.38, -0.75]] },
      { parentId: 4, w0: 0.013, w1: 0.0030, pts: [[0.06, -0.57], [0.17, -0.66], [0.26, -0.71], [0.35, -0.69]] },
      { parentId: 4, w0: 0.012, w1: 0.0030, pts: [[0.02, -0.51], [0.06, -0.64], [0.09, -0.74], [0.11, -0.81]] },
      { parentId: 5, w0: 0.014, w1: 0.0035, pts: [[0.23, -0.52], [0.34, -0.62], [0.43, -0.66], [0.53, -0.63]] },
      { parentId: 5, w0: 0.012, w1: 0.0030, pts: [[0.36, -0.57], [0.46, -0.55], [0.55, -0.53], [0.62, -0.49]] },
      { parentId: 6, w0: 0.014, w1: 0.0035, pts: [[0.25, -0.37], [0.38, -0.46], [0.49, -0.49], [0.59, -0.46]] },
      { parentId: 6, w0: 0.012, w1: 0.0030, pts: [[0.42, -0.40], [0.53, -0.37], [0.62, -0.38], [0.70, -0.35]] }
    ];

    const fineTwigs = [];
    (function generateFineBotanicalTwigs() {
      const rng = createRng(77419);
      const sources = primaryBoughs.concat(secondaryTwigs);
      for (let sIdx = 0; sIdx < sources.length; sIdx++) {
        const br = sources[sIdx];
        const count = br.w0 > 0.02 ? 4 : 3;
        for (let i = 0; i < count; i++) {
          const u = 0.48 + (i / count) * 0.48;
          const p0 = evalCubic(br.pts[0], br.pts[1], br.pts[2], br.pts[3], u);
          const pNext = evalCubic(br.pts[0], br.pts[1], br.pts[2], br.pts[3], Math.min(1, u + 0.05));
          const baseAng = Math.atan2(pNext[1] - p0[1], pNext[0] - p0[0]);
          const spread = (i % 2 === 0 ? 1 : -1) * (0.35 + rng() * 0.55);
          const ang = baseAng + spread;
          const len = 0.085 + rng() * 0.085;
          const p1 = [p0[0] + Math.cos(ang) * len * 0.45, p0[1] + Math.sin(ang) * len * 0.45 - 0.012];
          const p2 = [p0[0] + Math.cos(ang + spread * 0.25) * len * 0.78, p0[1] + Math.sin(ang + spread * 0.25) * len * 0.78 - 0.018];
          const p3 = [p0[0] + Math.cos(ang + spread * 0.35) * len, p0[1] + Math.sin(ang + spread * 0.35) * len - 0.010];
          fineTwigs.push({
            parentId: br.parentId !== undefined ? br.parentId : br.id,
            w0: 0.0052,
            w1: 0.0014,
            pts: [p0, p1, p2, p3]
          });
        }
      }
    })();

    const qiPaths = primaryBoughs.map(function (bough) {
      const samples = [];
      for (let i = 0; i <= 22; i++) {
        samples.push(evalCubic(trunkCurve[0], trunkCurve[1], trunkCurve[2], trunkCurve[3], (i / 22) * bough.trunkT));
      }
      for (let i = 1; i <= 34; i++) {
        samples.push(evalCubic(bough.pts[0], bough.pts[1], bough.pts[2], bough.pts[3], i / 34));
      }
      return samples;
    });

    function samplePathAt(pts, tNorm) {
      const c = Math.max(0, Math.min(1, tNorm));
      const idxF = c * (pts.length - 1);
      const i0 = Math.floor(idxF);
      const i1 = Math.min(pts.length - 1, i0 + 1);
      const fr = idxF - i0;
      return [
        pts[i0][0] + (pts[i1][0] - pts[i0][0]) * fr,
        pts[i0][1] + (pts[i1][1] - pts[i0][1]) * fr
      ];
    }

    const canopyClusters = [];
    (function seedUltraCanopy() {
      const rng = createRng(202788);
      function addRing(pts, pid, startU, cnt, sp, sm) {
        for (let k = 0; k < cnt; k++) {
          const u = startU + (k / Math.max(1, cnt - 1)) * (1 - startU);
          const bp = evalCubic(pts[0], pts[1], pts[2], pts[3], u);
          const pu = 0.42 + u * 0.58;
          canopyClusters.push({
            layer: 0, parentId: pid, pathU: pu, sprite: assets.blShadow,
            lx: bp[0] + (rng() - 0.5) * sp * 1.4, ly: bp[1] + 0.024 + (rng() - 0.5) * sp * 0.78,
            size: (46 + rng() * 26) * sm, rot: rng() * Math.PI * 2, ph: rng() * Math.PI * 2,
            bloom: 0.90, glow: 0, order: rng()
          });
          canopyClusters.push({
            layer: 1, parentId: pid, pathU: pu, sprite: k % 2 === 0 ? assets.blMidA : assets.blMidB,
            lx: bp[0] + (rng() - 0.5) * sp * 1.65, ly: bp[1] - 0.006 + (rng() - 0.5) * sp * 0.92,
            size: (38 + rng() * 24) * sm, rot: rng() * Math.PI * 2, ph: rng() * Math.PI * 2,
            bloom: 0.86, glow: 0, order: rng()
          });
          if (rng() > 0.20) {
            canopyClusters.push({
              layer: 2, parentId: pid, pathU: pu, sprite: bp[0] < -0.15 ? assets.blSss : assets.blLight,
              lx: bp[0] - 0.012 + (rng() - 0.5) * sp * 1.45, ly: bp[1] - 0.028 + (rng() - 0.5) * sp * 0.72,
              size: (30 + rng() * 22) * sm, rot: rng() * Math.PI * 2, ph: rng() * Math.PI * 2,
              bloom: 0.82, glow: 0, order: rng()
            });
          }
        }
      }
      primaryBoughs.forEach(function (b) { addRing(b.pts, b.id, 0.52, 6, 0.072, 1.05); });
      secondaryTwigs.forEach(function (tw) { addRing(tw.pts, tw.parentId, 0.40, 4, 0.064, 0.94); });
      fineTwigs.forEach(function (ft, idx) {
        const tip = ft.pts[3];
        canopyClusters.push({
          layer: 3, parentId: ft.parentId, pathU: 0.92, sprite: idx % 3 === 0 ? assets.blSss : assets.blHero,
          lx: tip[0], ly: tip[1],
          size: 24 + rng() * 14, rot: rng() * Math.PI * 2, ph: rng() * Math.PI * 2,
          bloom: 0.88, glow: 0, order: rng()
        });
      });
      canopyClusters.sort(function (a, b) { return a.layer - b.layer; });
    })();

    const qiWaves = primaryBoughs.map(function (b, idx) {
      return { pathIdx: b.id, prog: (idx * 0.145) % 1, speed: 0.052 + (idx % 3) * 0.007, tailLen: 0.25 };
    });

    // --------------------------------------------------------------------------
    // B. STORM CLOUD DECK & LIGHTNING STATE
    // --------------------------------------------------------------------------
    const skyCloudDeck = [
      { pair: assets.clouds.cirrusA, layer: 'high',  x: 0.20, y: 0.14, w: 0.52, h: 0.18, vx: 0.0042, alpha: 0.70, ph: 0.4, parallax: 5 },
      { pair: assets.clouds.cirrusB, layer: 'high',  x: 0.68, y: 0.11, w: 0.56, h: 0.19, vx: 0.0036, alpha: 0.62, ph: 2.1, parallax: 5 },
      { pair: assets.clouds.cirrusA, layer: 'high',  x: 0.95, y: 0.19, w: 0.48, h: 0.16, vx: 0.0048, alpha: 0.54, ph: 4.3, parallax: 6 },
      { pair: assets.clouds.anvilA,  layer: 'storm', x: 0.79, y: 0.21, w: 0.56, h: 0.34, vx: 0.0024, alpha: 0.90, ph: 1.1, parallax: 7, isStormCore: true },
      { pair: assets.clouds.billowA, layer: 'storm', x: 0.58, y: 0.25, w: 0.44, h: 0.27, vx: 0.0028, alpha: 0.78, ph: 2.7, parallax: 7, isStormCore: true },
      { pair: assets.clouds.anvilB,  layer: 'storm', x: 0.06, y: 0.29, w: 0.46, h: 0.28, vx: 0.0030, alpha: 0.82, ph: 3.9, parallax: 7, isStormCore: true },
      { pair: assets.clouds.billowB, layer: 'storm', x: 0.96, y: 0.29, w: 0.46, h: 0.26, vx: 0.0022, alpha: 0.84, ph: 5.2, parallax: 7, isStormCore: true },
      { pair: assets.clouds.billowB, layer: 'mid',   x: 0.34, y: 0.40, w: 0.42, h: 0.18, vx: 0.0050, alpha: 0.50, ph: 0.9, parallax: 9 },
      { pair: assets.clouds.billowA, layer: 'mid',   x: 0.84, y: 0.39, w: 0.46, h: 0.20, vx: 0.0044, alpha: 0.56, ph: 3.4, parallax: 9 }
    ];

    const stormState = {
      active: null,
      nextStrikeAt: 2.4,
      ambientFlashX: 0.78,
      ambientFlashY: 0.22
    };

    function triggerLightning(forceBolt) {
      if (!stormEnabled) return;
      const cores = skyCloudDeck.filter(function (c) { return c.isStormCore && c.x > 0.02 && c.x < 0.98; });
      const hostCloud = cores.length > 0 ? cores[Math.floor(Math.random() * cores.length)] : skyCloudDeck[3];
      const strikeX = Math.max(0.06, Math.min(0.94, hostCloud.x + (Math.random() - 0.5) * 0.14));
      const strikeY = Math.max(0.14, Math.min(0.32, hostCloud.y + 0.03));
      const isForkedBolt = forceBolt ? true : Math.random() < 0.68;
      const bolts = [];

      if (isForkedBolt) {
        const endX = strikeX + (Math.random() - 0.5) * 0.14;
        const endY = 0.535 + Math.random() * 0.02;
        const mainPts = buildFractalLightningPath(strikeX, strikeY, endX, endY, 0.032, 5);
        bolts.push({ pts: mainPts, width: 2.2, alpha: 1.0 });

        const branchCount = 3 + Math.floor(Math.random() * 2);
        for (let b = 0; b < branchCount; b++) {
          const pickIdx = Math.floor((0.18 + (b / branchCount) * 0.52) * (mainPts.length - 1));
          const origin = mainPts[pickIdx];
          const side = b % 2 === 0 ? 1 : -1;
          const subPts = buildFractalLightningPath(
            origin[0], origin[1],
            origin[0] + side * (0.035 + Math.random() * 0.065),
            Math.min(0.54, origin[1] + 0.07 + Math.random() * 0.12),
            0.014, 4
          );
          bolts.push({ pts: subPts, width: 1.1, alpha: 0.76 });

          if (b < 2 && subPts.length > 4) {
            const subOrigin = subPts[Math.floor(subPts.length * 0.48)];
            const tinyPts = buildFractalLightningPath(
              subOrigin[0], subOrigin[1],
              subOrigin[0] + side * (0.018 + Math.random() * 0.03),
              Math.min(0.54, subOrigin[1] + 0.04 + Math.random() * 0.05),
              0.008, 3
            );
            bolts.push({ pts: tinyPts, width: 0.65, alpha: 0.50 });
          }
        }
      }

      const doubleRestrike = Math.random() < 0.72;
      stormState.active = {
        xNorm: strikeX,
        yNorm: strikeY,
        isBolt: isForkedBolt,
        bolts: bolts,
        age: 0,
        duration: doubleRestrike ? 0.58 + Math.random() * 0.22 : 0.36 + Math.random() * 0.14,
        doubleRestrike: doubleRestrike
      };
    }

    function evalLightningEnvelope(st) {
      const u = Math.min(1, st.age / st.duration);
      const peak1 = Math.exp(-Math.pow((u - 0.08) / 0.065, 2));
      const peak2 = st.doubleRestrike ? 0.84 * Math.exp(-Math.pow((u - 0.34) / 0.085, 2)) : 0;
      const peak3 = st.doubleRestrike ? 0.36 * Math.exp(-Math.pow((u - 0.58) / 0.11, 2)) : 0;
      const afterglow = Math.max(0, 1 - u) * 0.22 * Math.exp(-u * 2.8);
      return Math.min(1, peak1 + peak2 + peak3 + afterglow);
    }

    // --------------------------------------------------------------------------
    // C. OFFSCREEN BAKED MATTE LAYERS (SKY, MOUNTAINS, CLIFF, TREE WOOD)
    // --------------------------------------------------------------------------
    const bakedSkyCanvas = document.createElement('canvas');
    const bakedMountainsCanvas = document.createElement('canvas');
    const bakedCliffCanvas = document.createElement('canvas');
    const bakedTreeWoodCanvas = document.createElement('canvas');

    function drawTaperedBarkLimb(targetCtx, ptsScreen, wStart, wEnd, barkSeed, isPrimary) {
      const steps = isPrimary ? 22 : 14;
      const leftSide = [];
      const rightSide = [];
      for (let i = 0; i <= steps; i++) {
        const u = i / steps;
        const p = evalCubic(ptsScreen[0], ptsScreen[1], ptsScreen[2], ptsScreen[3], u);
        const pNext = evalCubic(ptsScreen[0], ptsScreen[1], ptsScreen[2], ptsScreen[3], Math.min(1, u + 0.015));
        const pPrev = evalCubic(ptsScreen[0], ptsScreen[1], ptsScreen[2], ptsScreen[3], Math.max(0, u - 0.015));
        const dx = pNext[0] - pPrev[0];
        const dy = pNext[1] - pPrev[1];
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;
        const knot = isPrimary ? 1 + Math.sin(u * 14 + barkSeed) * 0.06 : 1;
        const halfW = (wStart * Math.pow(1 - u, 0.82) + wEnd * u) * 0.5 * knot;
        leftSide.push([p[0] + nx * halfW, p[1] + ny * halfW]);
        rightSide.push([p[0] - nx * halfW, p[1] - ny * halfW]);
      }

      targetCtx.save();
      targetCtx.beginPath();
      targetCtx.moveTo(leftSide[0][0], leftSide[0][1]);
      for (let i = 1; i <= steps; i++) targetCtx.lineTo(leftSide[i][0], leftSide[i][1]);
      for (let i = steps; i >= 0; i--) targetCtx.lineTo(rightSide[i][0], rightSide[i][1]);
      targetCtx.closePath();

      const p0 = ptsScreen[0];
      const p3 = ptsScreen[3];
      const grad = targetCtx.createLinearGradient(p0[0] - wStart, p0[1], p3[0] + wStart, p3[1]);
      grad.addColorStop(0, '#3a243d');
      grad.addColorStop(0.35, '#1d1424');
      grad.addColorStop(0.72, '#110d1a');
      grad.addColorStop(1, '#26172d');
      targetCtx.fillStyle = grad;
      targetCtx.fill();

      if (isPrimary && wStart > 4) {
        targetCtx.clip();
        const rng = createRng(barkSeed);
        targetCtx.lineCap = 'round';
        for (let f = 0; f < 5; f++) {
          const offsetNorm = (f / 4 - 0.5) * 1.15;
          targetCtx.strokeStyle =
            f === 0
              ? 'rgba(186, 224, 255, 0.24)'
              : f === 4
                ? 'rgba(249, 168, 212, 0.16)'
                : 'rgba(6, 4, 12, ' + (0.45 + rng() * 0.30).toFixed(2) + ')';
          targetCtx.lineWidth = Math.max(0.8, wStart * (f === 0 ? 0.11 : 0.08));
          targetCtx.beginPath();
          for (let i = 0; i <= steps; i++) {
            const lx = leftSide[i][0] + (rightSide[i][0] - leftSide[i][0]) * (0.5 + offsetNorm * 0.45);
            const ly = leftSide[i][1] + (rightSide[i][1] - leftSide[i][1]) * (0.5 + offsetNorm * 0.45);
            const jx = (rng() - 0.5) * 1.4;
            if (i === 0) targetCtx.moveTo(lx + jx, ly);
            else targetCtx.lineTo(lx + jx, ly);
          }
          targetCtx.stroke();
        }
      }
      targetCtx.restore();
    }

    function bakeAllMatteLayers() {
      const bw = Math.max(1, Math.round(W * DPR));
      const bh = Math.max(1, Math.round(H * DPR));
      const horizonY = H * 0.54;
      const isNarrow = W < 640;
      const moonX = W * (isNarrow ? 0.22 : 0.185);
      const moonY = H * (isNarrow ? 0.13 : 0.145);

      // 1. Night Sky + Milky Way + Horizon Haze
      bakedSkyCanvas.width = bw;
      bakedSkyCanvas.height = bh;
      const sc = bakedSkyCanvas.getContext('2d');
      sc.setTransform(DPR, 0, 0, DPR, 0, 0);

      const skyGrad = sc.createLinearGradient(0, 0, 0, horizonY + 30);
      skyGrad.addColorStop(0, '#020510');
      skyGrad.addColorStop(0.28, '#061126');
      skyGrad.addColorStop(0.62, '#0f254b');
      skyGrad.addColorStop(0.88, '#1a3b6a');
      skyGrad.addColorStop(1, '#254d7e');
      sc.fillStyle = skyGrad;
      sc.fillRect(0, 0, W, H);

      const skyMoonScatter = sc.createRadialGradient(moonX, moonY, 12, moonX, moonY, Math.max(W, H) * 0.52);
      skyMoonScatter.addColorStop(0, 'rgba(186, 230, 253, 0.24)');
      skyMoonScatter.addColorStop(0.35, 'rgba(125, 185, 245, 0.10)');
      skyMoonScatter.addColorStop(0.70, 'rgba(56, 110, 190, 0.03)');
      skyMoonScatter.addColorStop(1, 'rgba(0,0,0,0)');
      sc.fillStyle = skyMoonScatter;
      sc.fillRect(0, 0, W, horizonY + 40);

      sc.save();
      sc.translate(W * 0.62, H * 0.20);
      sc.rotate(-0.34);
      const mwGrad = sc.createRadialGradient(0, 0, 10, 0, 0, W * 0.44);
      mwGrad.addColorStop(0, 'rgba(196, 218, 255, 0.085)');
      mwGrad.addColorStop(0.38, 'rgba(164, 182, 238, 0.045)');
      mwGrad.addColorStop(0.72, 'rgba(216, 180, 232, 0.022)');
      mwGrad.addColorStop(1, 'rgba(0,0,0,0)');
      sc.scale(1.6, 0.42);
      sc.fillStyle = mwGrad;
      sc.beginPath();
      sc.arc(0, 0, W * 0.44, 0, Math.PI * 2);
      sc.fill();
      sc.restore();

      const horHaze = sc.createLinearGradient(0, horizonY - H * 0.14, 0, horizonY + 24);
      horHaze.addColorStop(0, 'rgba(147, 197, 253, 0)');
      horHaze.addColorStop(0.78, 'rgba(186, 224, 255, 0.18)');
      horHaze.addColorStop(1, 'rgba(147, 197, 253, 0.04)');
      sc.fillStyle = horHaze;
      sc.fillRect(0, horizonY - H * 0.14, W, H * 0.18);

      // 2. 3-Layer Fractal Mountain Ranges
      bakedMountainsCanvas.width = bw;
      bakedMountainsCanvas.height = bh;
      const mc = bakedMountainsCanvas.getContext('2d');
      mc.setTransform(DPR, 0, 0, DPR, 0, 0);

      const mRanges = [
        { seed: 3101, startX: 0.16, peakH: 0.36, freq: 5.5, topCol: 'rgba(14, 30, 58, 0.72)', botCol: 'rgba(38, 78, 126, 0.24)', rim: 'rgba(186, 230, 253, 0.16)' },
        { seed: 5209, startX: 0.30, peakH: 0.42, freq: 6.8, topCol: 'rgba(9, 21, 44, 0.88)', botCol: 'rgba(26, 58, 98, 0.36)', rim: 'rgba(186, 230, 253, 0.22)' },
        { seed: 7417, startX: 0.50, peakH: 0.30, freq: 8.2, topCol: 'rgba(5, 13, 29, 0.96)', botCol: 'rgba(15, 36, 66, 0.55)', rim: 'rgba(147, 210, 252, 0.18)' }
      ];

      mRanges.forEach(function (rg) {
        const nFn = createNoise1D(rg.seed, 256);
        const pts = [];
        const segs = 120;
        for (let i = 0; i <= segs; i++) {
          const u = i / segs;
          const x = W * (rg.startX + u * (1.06 - rg.startX));
          const ramp = Math.pow(u, 0.72);
          const ridge = fbm1D(nFn, u * rg.freq, 5);
          const crag = Math.pow(ridge, 1.25) * H * rg.peakH * ramp;
          pts.push([x, horizonY + 8 - crag]);
        }

        mc.beginPath();
        mc.moveTo(pts[0][0], horizonY + 14);
        for (let i = 0; i < pts.length; i++) mc.lineTo(pts[i][0], pts[i][1]);
        mc.lineTo(W * 1.06, horizonY + 14);
        mc.closePath();

        const g = mc.createLinearGradient(0, horizonY - H * rg.peakH, 0, horizonY + 10);
        g.addColorStop(0, rg.topCol);
        g.addColorStop(0.75, rg.botCol);
        g.addColorStop(1, 'rgba(28, 62, 104, 0.12)');
        mc.fillStyle = g;
        mc.fill();

        mc.save();
        mc.strokeStyle = rg.rim;
        mc.lineWidth = 1.2;
        mc.beginPath();
        for (let i = 1; i < pts.length; i++) {
          if (pts[i][1] < pts[i - 1][1]) {
            mc.moveTo(pts[i - 1][0], pts[i - 1][1]);
            mc.lineTo(pts[i][0], pts[i][1]);
          }
        }
        mc.stroke();
        mc.restore();
      });

      // 3. Geological Cliff with Rock Strata, Fissures & Grass
      bakedCliffCanvas.width = bw;
      bakedCliffCanvas.height = bh;
      const cc = bakedCliffCanvas.getContext('2d');
      cc.setTransform(DPR, 0, 0, DPR, 0, 0);

      const leftEdge = isNarrow ? 0.13 : 0.28;
      const cliffNoise = createNoise1D(8831, 128);
      const rimPts = [];
      for (let i = 0; i <= 40; i++) {
        const u = i / 40;
        const rx = W * (leftEdge + 0.008 + u * (1.03 - leftEdge));
        const micro = (fbm1D(cliffNoise, u * 11, 4) - 0.5) * H * 0.014;
        const riseRight = u > 0.68 ? -Math.pow((u - 0.68) / 0.32, 1.5) * H * 0.08 : 0;
        rimPts.push([rx, H * 0.534 + micro + riseRight]);
      }

      const wallPts = [
        [W * (leftEdge + 0.048), H * 1.03],
        [W * (leftEdge + 0.036), H * 0.89],
        [W * (leftEdge + 0.022), H * 0.77],
        [W * (leftEdge + 0.008), H * 0.68],
        [W * (leftEdge - 0.006), H * 0.60],
        [W * (leftEdge + 0.004), H * 0.555]
      ];

      cc.beginPath();
      cc.moveTo(wallPts[0][0], wallPts[0][1]);
      for (let i = 1; i < wallPts.length; i++) cc.lineTo(wallPts[i][0], wallPts[i][1]);
      for (let i = 0; i < rimPts.length; i++) cc.lineTo(rimPts[i][0], rimPts[i][1]);
      cc.lineTo(W * 1.04, H * 1.03);
      cc.closePath();

      const cliffBaseG = cc.createLinearGradient(W * leftEdge, H * 0.52, W * 0.78, H);
      cliffBaseG.addColorStop(0, '#1e3954');
      cliffBaseG.addColorStop(0.24, '#112338');
      cliffBaseG.addColorStop(0.54, '#071222');
      cliffBaseG.addColorStop(1, '#02060e');
      cc.fillStyle = cliffBaseG;
      cc.fill();

      cc.save();
      cc.clip();

      const rRng = createRng(44921);
      for (let f = 0; f < 34; f++) {
        const fx = W * (leftEdge - 0.02 + rRng() * 0.85);
        const fy = H * (0.53 + rRng() * 0.48);
        const fw = W * (0.04 + rRng() * 0.14);
        const fh = H * (0.03 + rRng() * 0.12);
        const isLitFace = fx < W * (leftEdge + 0.20) && rRng() > 0.45;
        cc.fillStyle = isLitFace
          ? 'rgba(84, 152, 198, ' + (0.06 + rRng() * 0.10).toFixed(3) + ')'
          : 'rgba(2, 7, 16, ' + (0.28 + rRng() * 0.42).toFixed(3) + ')';
        cc.beginPath();
        cc.moveTo(fx, fy);
        cc.lineTo(fx + fw * (0.6 + rRng() * 0.4), fy - fh * 0.25);
        cc.lineTo(fx + fw, fy + fh * 0.75);
        cc.lineTo(fx + fw * 0.2, fy + fh);
        cc.closePath();
        cc.fill();
      }

      cc.strokeStyle = 'rgba(2, 6, 14, 0.72)';
      for (let k = 0; k < 22; k++) {
        let cx = W * (leftEdge + rRng() * 0.72);
        let cy = H * (0.54 + rRng() * 0.40);
        cc.lineWidth = 0.8 + rRng() * 1.8;
        cc.beginPath();
        cc.moveTo(cx, cy);
        for (let s = 0; s < 5; s++) {
          cx += (rRng() - 0.35) * W * 0.055;
          cy += (0.02 + rRng() * 0.045) * H;
          cc.lineTo(cx, cy);
        }
        cc.stroke();
      }

      const textShadowG = cc.createLinearGradient(W * 0.32, H * 0.55, W * 0.88, H);
      textShadowG.addColorStop(0, 'rgba(6, 15, 30, 0.35)');
      textShadowG.addColorStop(0.45, 'rgba(3, 9, 20, 0.82)');
      textShadowG.addColorStop(1, 'rgba(2, 5, 13, 0.96)');
      cc.fillStyle = textShadowG;
      cc.fillRect(W * (isNarrow ? 0.08 : 0.33), H * 0.54, W * 0.92, H * 0.48);

      const seaBounce = cc.createRadialGradient(W * (leftEdge + 0.04), H * 0.65, 6, W * (leftEdge + 0.04), H * 0.68, W * 0.16);
      seaBounce.addColorStop(0, 'rgba(116, 214, 240, 0.26)');
      seaBounce.addColorStop(0.5, 'rgba(56, 152, 204, 0.09)');
      seaBounce.addColorStop(1, 'rgba(0,0,0,0)');
      cc.fillStyle = seaBounce;
      cc.fillRect(W * leftEdge, H * 0.52, W * 0.32, H * 0.46);

      const rootX = W * (isNarrow ? 0.54 : 0.495);
      const rootY = H * 0.533;
      const treeBounce = cc.createRadialGradient(rootX, rootY, 6, rootX, rootY + H * 0.025, W * 0.22);
      treeBounce.addColorStop(0, 'rgba(253, 186, 210, 0.28)');
      treeBounce.addColorStop(0.48, 'rgba(253, 224, 71, 0.09)');
      treeBounce.addColorStop(1, 'rgba(0,0,0,0)');
      cc.fillStyle = treeBounce;
      cc.fillRect(W * leftEdge, H * 0.49, W * 0.55, H * 0.25);

      cc.restore();

      cc.save();
      cc.strokeStyle = 'rgba(206, 236, 255, 0.58)';
      cc.lineWidth = 2.0;
      cc.beginPath();
      for (let i = 0; i < rimPts.length; i++) {
        if (i === 0) cc.moveTo(rimPts[i][0], rimPts[i][1]);
        else cc.lineTo(rimPts[i][0], rimPts[i][1]);
      }
      cc.stroke();
      cc.restore();

      const grassRng = createRng(99104);
      cc.save();
      cc.lineCap = 'round';
      for (let i = 0; i < 42; i++) {
        const idx = Math.floor(2 + grassRng() * (rimPts.length - 6));
        const gp = rimPts[idx];
        const gx = gp[0] + (grassRng() - 0.5) * 18;
        const gy = gp[1] + 2;
        const blades = 3 + Math.floor(grassRng() * 4);
        for (let b = 0; b < blades; b++) {
          const h = 6 + grassRng() * 14;
          const lean = -(4 + grassRng() * 10);
          cc.strokeStyle = b === 0 ? 'rgba(148, 198, 218, 0.45)' : 'rgba(14, 34, 48, 0.86)';
          cc.lineWidth = 1.0 + grassRng() * 0.8;
          cc.beginPath();
          cc.moveTo(gx, gy);
          cc.quadraticCurveTo(gx + lean * 0.4, gy - h * 0.65, gx + lean, gy - h);
          cc.stroke();
        }
      }
      cc.restore();

      // 4. Baked 4-Level Botanical Ancient Peach Tree Wood
      bakedTreeWoodCanvas.width = bw;
      bakedTreeWoodCanvas.height = bh;
      const tc = bakedTreeWoodCanvas.getContext('2d');
      tc.setTransform(DPR, 0, 0, DPR, 0, 0);

      const S = Math.min(W * (isNarrow ? 0.62 : 0.45), H * (isNarrow ? 0.41 : 0.50));
      const toScreen = function (pt) { return [rootX + pt[0] * S, rootY + pt[1] * S]; };

      const aoGrad = tc.createRadialGradient(rootX + 0.02 * S, rootY + 3, 4, rootX + 0.02 * S, rootY + 5, S * 0.28);
      aoGrad.addColorStop(0, 'rgba(2, 6, 14, 0.94)');
      aoGrad.addColorStop(0.55, 'rgba(4, 10, 22, 0.54)');
      aoGrad.addColorStop(1, 'rgba(4, 10, 22, 0)');
      tc.save();
      tc.translate(rootX + 0.02 * S, rootY + 3);
      tc.scale(1, 0.22);
      tc.fillStyle = aoGrad;
      tc.beginPath();
      tc.arc(0, 0, S * 0.28, 0, Math.PI * 2);
      tc.fill();
      tc.restore();

      cliffRoots.forEach(function (rt, idx) {
        drawTaperedBarkLimb(tc, rt.map(toScreen), S * 0.028, S * 0.004, 300 + idx * 17, true);
      });
      drawTaperedBarkLimb(tc, trunkCurve.map(toScreen), S * 0.080, S * 0.028, 101, true);
      primaryBoughs.forEach(function (br, idx) {
        drawTaperedBarkLimb(tc, br.pts.map(toScreen), S * br.w0, S * br.w1, 200 + idx * 29, true);
      });
      secondaryTwigs.forEach(function (sb, idx) {
        drawTaperedBarkLimb(tc, sb.pts.map(toScreen), S * sb.w0, S * sb.w1, 400 + idx * 19, false);
      });
      fineTwigs.forEach(function (ft, idx) {
        drawTaperedBarkLimb(tc, ft.pts.map(toScreen), S * ft.w0, S * ft.w1, 600 + idx, false);
      });

      tc.save();
      tc.beginPath();
      tc.moveTo(rootX - 0.16 * S, rootY + 7);
      tc.quadraticCurveTo(rootX - 0.01 * S, rootY - 0.022 * S, rootX + 0.18 * S, rootY + 7);
      tc.closePath();
      const collarG = tc.createLinearGradient(0, rootY - 0.024 * S, 0, rootY + 8);
      collarG.addColorStop(0, '#173042');
      collarG.addColorStop(0.6, '#0c1a2a');
      collarG.addColorStop(1, '#060f1d');
      tc.fillStyle = collarG;
      tc.fill();
      tc.restore();
    }

    // --------------------------------------------------------------------------
    // D. DYNAMIC REAL-TIME ELEMENTS
    // --------------------------------------------------------------------------
    const stars = Array.from({ length: 120 }, function (_, i) {
      const tempRoll = Math.random();
      const rgb = tempRoll < 0.25 ? '196, 226, 255' : tempRoll < 0.80 ? '242, 248, 255' : '255, 238, 206';
      return {
        x: Math.random(),
        y: Math.random() * 0.48,
        r: (i < 9 ? 1.35 : 0.45) + Math.random() * (i < 9 ? 0.75 : 0.95),
        hero: i < 9,
        rgb: rgb,
        tw: 1.1 + Math.random() * 2.8,
        ph: Math.random() * Math.PI * 2
      };
    });

    const shootingStars = [
      { active: false, x: 0.78, y: 0.08, vx: -0.26, vy: 0.13, life: 0, maxLife: 1.45, nextAt: 1.5, tint: '254, 243, 199' },
      { active: false, x: 0.92, y: 0.15, vx: -0.30, vy: 0.15, life: 0, maxLife: 1.30, nextAt: 5.2, tint: '224, 242, 254' },
      { active: false, x: 0.62, y: 0.06, vx: -0.24, vy: 0.12, life: 0, maxLife: 1.55, nextAt: 9.0, tint: '251, 207, 232' },
      { active: false, x: 0.86, y: 0.22, vx: -0.28, vy: 0.14, life: 0, maxLife: 1.35, nextAt: 12.6, tint: '255, 251, 235' }
    ];

    const oceanWaveRows = Array.from({ length: 42 }, function (_, i) {
      const d = Math.pow(i / 41, 1.52);
      return { depth: d, phase: Math.random() * Math.PI * 2, speed: 0.85 + d * 1.45, amp: 1.0 + d * 3.8, freq: 22 - d * 14 };
    });

    const fresnelGlints = Array.from({ length: 135 }, function () {
      const d = Math.random();
      return { depth: d, spread: (Math.random() - 0.5) * 2, len: 6 + d * 42 + Math.random() * 14, speed: 1.4 + Math.random() * 2.4, ph: Math.random() * Math.PI * 2, warm: Math.random() < 0.26 };
    });

    const silverCranes = [
      { x: 0.76, y: 0.18, vx: -0.020, vy: -0.0018, scale: 1.08, wingSpd: 3.0, ph: 0.0, trail: [] },
      { x: 0.92, y: 0.13, vx: -0.016, vy: -0.0012, scale: 0.78, wingSpd: 3.4, ph: 2.2, trail: [] },
      { x: 0.44, y: 0.25, vx: -0.023, vy: -0.0015, scale: 0.62, wingSpd: 3.7, ph: 4.1, trail: [] }
    ];

    const tumblingPetals = Array.from({ length: 36 }, function (_, i) {
      return {
        x: 0.14 + (i / 36) * 0.60,
        y: 0.16 + Math.random() * 0.44,
        vx: -(0.012 + Math.random() * 0.018),
        vy: 0.011 + Math.random() * 0.018,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 1.8,
        flipPh: Math.random() * Math.PI * 2,
        flipSpd: 2.2 + Math.random() * 2.8,
        sz: 2.8 + Math.random() * 2.6,
        ph: Math.random() * Math.PI * 2
      };
    });

    const cliffPlumes = Array.from({ length: 18 }, function (_, i) {
      const cleft = i % 3;
      return {
        baseX: cleft === 0 ? 0.29 + (Math.random() - 0.5) * 0.045 : cleft === 1 ? 0.48 + (Math.random() - 0.5) * 0.06 : 0.38 + (Math.random() - 0.5) * 0.055,
        topY: cleft === 0 ? 0.535 : 0.545,
        dropLen: 0.24 + Math.random() * 0.22,
        speed: 0.038 + Math.random() * 0.035,
        prog: i / 18,
        w: 0.075 + Math.random() * 0.065,
        h: 0.17 + Math.random() * 0.12,
        driftX: -(0.010 + Math.random() * 0.016),
        alpha: 0.22 + Math.random() * 0.18,
        ph: Math.random() * Math.PI * 2
      };
    });

    const seaMistLayers = Array.from({ length: 12 }, function (_, i) {
      return {
        x: -0.35 + (i / 12) * 1.7 + (Math.random() - 0.5) * 0.08,
        y: 0.38 + (i % 4) * 0.042 + Math.random() * 0.025,
        w: 0.44 + Math.random() * 0.34,
        h: 0.17 + Math.random() * 0.12,
        vx: 0.005 + Math.random() * 0.007,
        alpha: 0.28 + Math.random() * 0.18,
        bobAmp: 4 + Math.random() * 6,
        bobSpd: 0.24 + Math.random() * 0.22,
        ph: Math.random() * Math.PI * 2,
        sprite: i % 2 === 0 ? assets.mistCloud : assets.mistWisp
      };
    });

    const foregroundFrostVeil = Array.from({ length: 9 }, function (_, i) {
      return {
        x: -0.35 + (i / 9) * 1.7,
        y: 0.65 + (i % 3) * 0.075 + Math.random() * 0.03,
        w: 0.46 + Math.random() * 0.34,
        h: 0.17 + Math.random() * 0.12,
        vx: 0.008 + Math.random() * 0.010,
        alpha: 0.20 + Math.random() * 0.15,
        bobAmp: 5 + Math.random() * 6,
        bobSpd: 0.20 + Math.random() * 0.18,
        ph: Math.random() * Math.PI * 2,
        sprite: i % 3 === 0 ? assets.mistCloud : assets.mistWisp
      };
    });

    const chillCrystals = Array.from({ length: 28 }, function () {
      return {
        x: Math.random(),
        y: 0.32 + Math.random() * 0.56,
        vx: 0.006 + Math.random() * 0.010,
        vy: (Math.random() - 0.5) * 0.004,
        r: 0.7 + Math.random() * 1.1,
        tw: 1.4 + Math.random() * 2.2,
        ph: Math.random() * Math.PI * 2
      };
    });

    function resize(immediate) {
      const rect = stage.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      DPR = Math.min(global.devicePixelRatio || 1, 2);
      W = rect.width;
      H = rect.height;
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      if (immediate) {
        bakeAllMatteLayers();
      } else {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () { if (!disposed) bakeAllMatteLayers(); }, 100);
      }
    }
    resize(true);

    let ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(function () { resize(false); });
      ro.observe(stage);
    }
    const onWinResize = function () { resize(false); };
    global.addEventListener('resize', onWinResize);

    // --------------------------------------------------------------------------
    // E. RENDER HELPERS (CLOUDS, LIGHTNING, PERSPECTIVE OCEAN, MIST)
    // --------------------------------------------------------------------------
    function drawCloudBankLayer(layerFilter, t, dt, flashAmt, flashX, flashY) {
      for (let i = 0; i < skyCloudDeck.length; i++) {
        const cl = skyCloudDeck[i];
        if (cl.layer !== layerFilter) continue;

        cl.x += cl.vx * dt;
        if (cl.x > 1.38) cl.x = -0.38;

        const edgeNorm = (cl.x + 0.38) / 1.76;
        const edgeFade = Math.min(1, Math.sin(Math.max(0, Math.min(1, edgeNorm)) * Math.PI) * 2.4);
        const breath = 0.90 + 0.10 * Math.sin(t * 0.24 + cl.ph);
        const alpha = cl.alpha * edgeFade * breath;
        if (alpha < 0.01) continue;

        const cw = cl.w * W;
        const ch = cl.h * H;
        const cx = cl.x * W - ptrX * cl.parallax;
        const cy = cl.y * H + Math.sin(t * 0.22 + cl.ph) * 4 - ptrY * (cl.parallax * 0.45);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.drawImage(cl.pair.base, cx - cw / 2, cy - ch / 2, cw, ch);
        ctx.restore();

        if (flashAmt > 0.015) {
          const dist = Math.hypot(cl.x - flashX, (cl.y - flashY) * 1.6);
          const proximity = Math.max(0, 1 - dist * 1.45);
          if (proximity > 0.03) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = Math.min(0.96, flashAmt * proximity * (cl.layer === 'storm' ? 1.15 : 0.72));
            ctx.drawImage(cl.pair.lit, cx - cw / 2, cy - ch / 2, cw, ch);
            ctx.restore();
          }
        }
      }
    }

    function drawFractalLightningBolts(st, flashAmt) {
      if (!st || !st.isBolt || flashAmt < 0.04) return;
      const pxShift = -ptrX * 7;
      const pyShift = -ptrY * 3;

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const sx = st.xNorm * W + pxShift;
      const sy = st.yNorm * H + pyShift;
      const bloomR = Math.max(W, H) * 0.34;
      const bg = ctx.createRadialGradient(sx, sy, 6, sx, sy, bloomR);
      bg.addColorStop(0, 'rgba(224, 244, 255, ' + (0.56 * flashAmt).toFixed(3) + ')');
      bg.addColorStop(0.32, 'rgba(147, 197, 253, ' + (0.26 * flashAmt).toFixed(3) + ')');
      bg.addColorStop(0.68, 'rgba(129, 140, 248, ' + (0.09 * flashAmt).toFixed(3) + ')');
      bg.addColorStop(1, 'rgba(99, 102, 241, 0)');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(sx, sy, bloomR, 0, Math.PI * 2);
      ctx.fill();

      for (let b = 0; b < st.bolts.length; b++) {
        const bolt = st.bolts[b];
        const pts = bolt.pts;
        if (pts.length < 2) continue;

        const tracePath = function () {
          ctx.beginPath();
          ctx.moveTo(pts[0][0] * W + pxShift, pts[0][1] * H + pyShift);
          for (let k = 1; k < pts.length; k++) {
            ctx.lineTo(pts[k][0] * W + pxShift, pts[k][1] * H + pyShift);
          }
          ctx.stroke();
        };

        const ba = flashAmt * bolt.alpha;
        ctx.strokeStyle = 'rgba(129, 162, 255, ' + (0.30 * ba).toFixed(3) + ')';
        ctx.lineWidth = bolt.width * 7.2;
        tracePath();

        ctx.strokeStyle = 'rgba(186, 230, 253, ' + (0.66 * ba).toFixed(3) + ')';
        ctx.lineWidth = bolt.width * 2.7;
        tracePath();

        ctx.strokeStyle = 'rgba(255, 255, 255, ' + (0.98 * ba).toFixed(3) + ')';
        ctx.lineWidth = Math.max(0.7, bolt.width * 0.95);
        tracePath();
      }
      ctx.restore();
    }

    function drawPerspectiveOcean(t, horizonY, moonX, pxShift, flashAmt, flashX) {
      const seaH = H - horizonY;
      const seaGrad = ctx.createLinearGradient(0, horizonY, 0, H);
      seaGrad.addColorStop(0, '#1e4273');
      seaGrad.addColorStop(0.22, '#132d54');
      seaGrad.addColorStop(0.62, '#091832');
      seaGrad.addColorStop(1, '#030816');
      ctx.fillStyle = seaGrad;
      ctx.fillRect(0, horizonY, W, seaH);

      const reflectCenter = moonX * 0.90 + pxShift * 0.4;
      const poolG = ctx.createRadialGradient(
        reflectCenter, horizonY + seaH * 0.28, 10,
        reflectCenter, horizonY + seaH * 0.46, Math.max(W * 0.24, 180)
      );
      poolG.addColorStop(0, 'rgba(230, 240, 255, 0.36)');
      poolG.addColorStop(0.42, 'rgba(176, 212, 252, 0.16)');
      poolG.addColorStop(1, 'rgba(12, 30, 62, 0)');
      ctx.fillStyle = poolG;
      ctx.fillRect(0, horizonY, W * 0.62, seaH);

      if (flashAmt > 0.02) {
        const lx = flashX * W + pxShift * 0.5;
        const stormPool = ctx.createRadialGradient(
          lx, horizonY + seaH * 0.14, 12,
          lx, horizonY + seaH * 0.36, Math.max(W * 0.36, 260)
        );
        stormPool.addColorStop(0, 'rgba(224, 244, 255, ' + (0.46 * flashAmt).toFixed(3) + ')');
        stormPool.addColorStop(0.38, 'rgba(147, 197, 253, ' + (0.22 * flashAmt).toFixed(3) + ')');
        stormPool.addColorStop(1, 'rgba(56, 110, 210, 0)');
        ctx.fillStyle = stormPool;
        ctx.fillRect(0, horizonY, W, seaH);
      }

      ctx.save();
      for (let i = 0; i < oceanWaveRows.length; i++) {
        const row = oceanWaveRows[i];
        const py = horizonY + 4 + row.depth * (seaH - 8);
        const alpha = 0.05 + row.depth * 0.14;
        ctx.strokeStyle = i % 2 === 0
          ? 'rgba(186, 224, 255, ' + alpha.toFixed(3) + ')'
          : 'rgba(3, 10, 24, ' + (alpha * 1.45).toFixed(3) + ')';
        ctx.lineWidth = 0.7 + row.depth * 1.9;
        ctx.beginPath();
        const spanW = W * 0.56;
        for (let x = 0; x <= spanW; x += 26) {
          const wy = py + Math.sin((x / W) * row.freq + t * row.speed + row.phase) * row.amp;
          if (x === 0) ctx.moveTo(x, wy);
          else ctx.lineTo(x, wy);
        }
        ctx.stroke();
      }
      ctx.restore();

      for (let i = 0; i < fresnelGlints.length; i++) {
        const g = fresnelGlints[i];
        const py = horizonY + 6 + Math.pow(g.depth, 1.40) * (seaH - 12);
        const halfSpan = (0.032 + g.depth * 0.135) * W;
        const sway = Math.sin(t * g.speed + g.ph) * (4 + g.depth * 13);
        const px = reflectCenter + g.spread * halfSpan + sway;
        const fade = Math.max(0.10, 1 - Math.abs(g.spread) * 0.86);
        const sparkle = 0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(t * g.speed * 1.25 + g.ph), 2);
        const alpha = (0.14 + 0.64 * sparkle) * fade;
        const thick = 0.9 + g.depth * 1.8;

        ctx.fillStyle = g.warm
          ? 'rgba(255, 240, 248, ' + alpha.toFixed(2) + ')'
          : 'rgba(226, 242, 255, ' + Math.min(0.98, alpha + flashAmt * 0.28).toFixed(2) + ')';
        ctx.fillRect(px - g.len / 2, py, g.len, thick);
      }
    }

    function drawColdMistLayer(list, t, dt, dimRightSide) {
      for (let i = 0; i < list.length; i++) {
        const m = list[i];
        m.x += m.vx * dt;
        if (m.x > 1.38) m.x = -0.38;
        const edgeNorm = (m.x + 0.38) / 1.76;
        const edgeFade = Math.min(1, Math.sin(Math.max(0, Math.min(1, edgeNorm)) * Math.PI) * 2.2);
        const breath = 0.86 + 0.14 * Math.sin(t * m.bobSpd + m.ph);
        const textGuard = dimRightSide && m.x > 0.46 ? 0.50 : 1.0;
        const alpha = m.alpha * edgeFade * breath * textGuard;
        if (alpha < 0.008) continue;

        const mw = m.w * W;
        const mh = m.h * H;
        const mx = m.x * W - ptrX * 12;
        const my = m.y * H + Math.sin(t * m.bobSpd + m.ph) * m.bobAmp - ptrY * 4;

        ctx.save();
        ctx.globalAlpha = Math.min(0.74, alpha);
        ctx.drawImage(m.sprite, mx - mw / 2, my - mh / 2, mw, mh);
        ctx.restore();
      }
    }

    // --------------------------------------------------------------------------
    // F. MAIN 60/120FPS RENDER LOOP
    // --------------------------------------------------------------------------
    let lastTs = performance.now();
    function render(now) {
      if (disposed) return;
      rafId = requestAnimationFrame(render);
      if (document.hidden || W <= 0 || H <= 0) return;

      const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) * 0.001));
      lastTs = now;
      const t = now * 0.001;

      ctx.clearRect(0, 0, W, H);

      ptrX += (ptrTargetX - ptrX) * (1 - Math.exp(-dt * 3.2));
      ptrY += (ptrTargetY - ptrY) * (1 - Math.exp(-dt * 3.2));
      bloomCurrent += (bloomTarget - bloomCurrent) * (1 - Math.exp(-dt * 1.8));

      // Storm Lightning Cadence
      let flashAmt = 0;
      let flashX = stormState.ambientFlashX;
      let flashY = stormState.ambientFlashY;
      if (stormEnabled) {
        if (!stormState.active && t >= stormState.nextStrikeAt) {
          triggerLightning(false);
        }
        if (stormState.active) {
          stormState.active.age += dt;
          if (stormState.active.age >= stormState.active.duration) {
            stormState.active = null;
            stormState.nextStrikeAt = t + 4.8 + Math.random() * 5.8;
          } else {
            flashAmt = evalLightningEnvelope(stormState.active);
            flashX = stormState.active.xNorm;
            flashY = stormState.active.yNorm;
            stormState.ambientFlashX = flashX;
            stormState.ambientFlashY = flashY;
          }
        }
      }

      const horizonY = H * 0.54;
      const isNarrow = W < 640;
      const moonX = W * (isNarrow ? 0.22 : 0.185) - ptrX * 6;
      const moonY = H * (isNarrow ? 0.13 : 0.145) - ptrY * 4;

      // 1. Baked Night Sky & Milky Way
      ctx.drawImage(bakedSkyCanvas, 0, 0, W, H);

      // 1.2 Upper-Atmosphere Lightning Flash Wash
      if (stormEnabled && flashAmt > 0.015) {
        const sx = flashX * W - ptrX * 6;
        const sy = flashY * H - ptrY * 3;
        const skyFlash = ctx.createRadialGradient(sx, sy, 14, sx, sy, Math.max(W, H) * 0.78);
        skyFlash.addColorStop(0, 'rgba(214, 238, 255, ' + (0.34 * flashAmt).toFixed(3) + ')');
        skyFlash.addColorStop(0.35, 'rgba(136, 182, 246, ' + (0.17 * flashAmt).toFixed(3) + ')');
        skyFlash.addColorStop(0.75, 'rgba(92, 124, 210, ' + (0.06 * flashAmt).toFixed(3) + ')');
        skyFlash.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = skyFlash;
        ctx.fillRect(0, 0, W, horizonY + 30);
        ctx.restore();
      }

      // 2. Twinkling Multi-Temperature Stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const tw = 0.22 + 0.78 * (0.5 + 0.5 * Math.sin(t * s.tw + s.ph));
        const sx = s.x * W - ptrX * 4;
        const sy = s.y * H - ptrY * 3;
        ctx.fillStyle = 'rgba(' + s.rgb + ',' + tw.toFixed(2) + ')';
        ctx.beginPath();
        ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
        ctx.fill();

        if (s.hero && tw > 0.55) {
          const spk = s.r * (4.2 + tw * 2.5);
          ctx.strokeStyle = 'rgba(' + s.rgb + ',' + (tw * 0.42).toFixed(2) + ')';
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(sx - spk, sy);
          ctx.lineTo(sx + spk, sy);
          ctx.moveTo(sx, sy - spk);
          ctx.lineTo(sx, sy + spk);
          ctx.stroke();
        }
      }

      // 3. Staggered Shooting Stars (4 Trails)
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      for (let i = 0; i < shootingStars.length; i++) {
        const st = shootingStars[i];
        if (!st.active && t > st.nextAt) {
          st.active = true;
          st.x = 0.42 + Math.random() * 0.54;
          st.y = 0.04 + Math.random() * 0.20;
          st.vx = -(0.22 + Math.random() * 0.14);
          st.vy = 0.10 + Math.random() * 0.07;
          st.life = 0;
        }
        if (!st.active) continue;
        st.life += dt;
        const norm = Math.min(1, st.life / st.maxLife);
        const fade = Math.sin(norm * Math.PI);
        const px = (st.x + st.vx * st.life) * W;
        const py = (st.y + st.vy * st.life) * H;
        const tx = (st.x + st.vx * Math.max(0, st.life - 0.22)) * W;
        const ty = (st.y + st.vy * Math.max(0, st.life - 0.22)) * H;

        const sg = ctx.createLinearGradient(px, py, tx, ty);
        sg.addColorStop(0, 'rgba(255,255,255,' + (0.95 * fade).toFixed(2) + ')');
        sg.addColorStop(0.35, 'rgba(' + st.tint + ',' + (0.58 * fade).toFixed(2) + ')');
        sg.addColorStop(1, 'rgba(' + st.tint + ',0)');
        ctx.strokeStyle = sg;
        ctx.lineWidth = 1.9;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        if (st.life >= st.maxLife) {
          st.active = false;
          st.nextAt = t + 5.2 + Math.random() * 7.2;
        }
      }
      ctx.restore();

      // 4. Photorealistic Crescent Moon (Lunar Maria + Earthshine + 22° Halo)
      const moonDraw = Math.min(W, H) * (isNarrow ? 0.34 : 0.31);
      ctx.drawImage(assets.moon, moonX - moonDraw / 2, moonY - moonDraw / 2, moonDraw, moonDraw);

      // 4.5 High Cirrus, Fractal Lightning Bolts & Cumulonimbus Storm Clouds
      if (stormEnabled) {
        drawCloudBankLayer('high', t, dt, flashAmt, flashX, flashY);
        drawFractalLightningBolts(stormState.active, flashAmt);
        drawCloudBankLayer('storm', t, dt, flashAmt, flashX, flashY);
      }

      // 5. Articulated Silver Spirit Cranes (3 Cranes)
      for (let i = 0; i < silverCranes.length; i++) {
        const cr = silverCranes[i];
        cr.x += cr.vx * dt;
        cr.y += (cr.vy + Math.sin(t * 0.85 + cr.ph) * 0.0035) * dt;
        if (cr.x < -0.14 || cr.y < 0.04) {
          cr.x = 1.08 + Math.random() * 0.16;
          cr.y = 0.12 + Math.random() * 0.22;
          cr.trail.length = 0;
        }
        const cx = cr.x * W - ptrX * 9;
        const cy = cr.y * H - ptrY * 5;
        const sc = cr.scale * Math.min(1.08, Math.max(0.64, W / 1180));

        cr.trail.push([cx + 12 * sc, cy + 2 * sc]);
        if (cr.trail.length > 24) cr.trail.shift();
        if (cr.trail.length > 2) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          for (let k = 1; k < cr.trail.length; k++) {
            ctx.strokeStyle = 'rgba(224,242,254,' + ((k / cr.trail.length) * 0.26).toFixed(3) + ')';
            ctx.lineWidth = (k / cr.trail.length) * 1.8 * sc;
            ctx.beginPath();
            ctx.moveTo(cr.trail[k - 1][0], cr.trail[k - 1][1]);
            ctx.lineTo(cr.trail[k][0], cr.trail[k][1]);
            ctx.stroke();
          }
          ctx.restore();
        }

        const flap = Math.sin(t * cr.wingSpd + cr.ph);
        const outerLag = Math.sin(t * cr.wingSpd + cr.ph - 0.72);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(sc, sc);

        ctx.strokeStyle = 'rgba(186, 206, 228, 0.72)';
        ctx.lineWidth = 1.9;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-2, -1);
        ctx.quadraticCurveTo(5, -10 - flap * 8, 16, -13 - outerLag * 11);
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.ellipse(0, 0, 10.5, 3.0, -0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.1;
        ctx.beginPath();
        ctx.moveTo(-8, -0.5);
        ctx.quadraticCurveTo(-15, -2.8, -22, -1.8);
        ctx.stroke();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(-22, -1.8);
        ctx.lineTo(-27, -1.3);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(226, 232, 240, 0.76)';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(9, 1);
        ctx.lineTo(23, 3.6);
        ctx.moveTo(9, 2);
        ctx.lineTo(20, 5.2);
        ctx.stroke();

        const wg = ctx.createLinearGradient(0, 0, 16, -18 * flap);
        wg.addColorStop(0, '#ffffff');
        wg.addColorStop(0.68, '#e0f2fe');
        wg.addColorStop(1, '#334155');
        ctx.fillStyle = wg;
        ctx.beginPath();
        ctx.moveTo(-4, 0);
        ctx.quadraticCurveTo(3, -12 * flap - 2, 17, -17 * outerLag - 4);
        ctx.quadraticCurveTo(9, -4 * flap + 2, 7, 1.6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // 6. Baked 3-Range Fractal Mountains
      ctx.save();
      ctx.translate(-ptrX * 8, -ptrY * 3);
      ctx.drawImage(bakedMountainsCanvas, 0, 0, W, H);
      ctx.restore();

      // 6.5 Mid-Layer Valley Storm Cloud Tendrils
      if (stormEnabled) {
        drawCloudBankLayer('mid', t, dt, flashAmt, flashX, flashY);
      }

      // 7. Perspective Moonlit Ocean + Fresnel Glitter + Lightning Reflection
      drawPerspectiveOcean(t, horizonY, moonX, -ptrX * 10, stormEnabled ? flashAmt : 0, flashX);

      // 7.5 Distant Horizon Cold Sea Mist
      drawColdMistLayer(seaMistLayers, t, dt, false);

      // 8. Foreground Geological Cliff + 4-Level Botanical Peach Tree
      const fgPx = -ptrX * 16;
      const fgPy = -ptrY * 7;
      ctx.save();
      ctx.translate(fgPx, fgPy);
      ctx.drawImage(bakedCliffCanvas, 0, 0, W, H);

      // Cascading cold vapor plumes down cliff rock
      for (let i = 0; i < cliffPlumes.length; i++) {
        const p = cliffPlumes[i];
        p.prog = (p.prog + p.speed * dt) % 1;
        const fade = Math.pow(Math.sin(p.prog * Math.PI), 1.15);
        if (fade < 0.01) continue;
        const baseShift = isNarrow ? p.baseX - 0.12 : p.baseX;
        const px = (baseShift + p.driftX * p.prog) * W + Math.sin(t * 0.45 + p.ph) * 7;
        const py = (p.topY + p.dropLen * p.prog) * H;
        const pw = p.w * W * (0.85 + p.prog * 0.65);
        const ph = p.h * H * (0.88 + p.prog * 0.45);
        ctx.save();
        ctx.globalAlpha = Math.min(0.60, p.alpha * fade);
        ctx.drawImage(assets.mistPlume, px - pw / 2, py - ph * 0.45, pw, ph);
        ctx.restore();
      }

      const rootX = W * (isNarrow ? 0.54 : 0.495);
      const rootY = H * 0.533;
      const S = Math.min(W * (isNarrow ? 0.62 : 0.45), H * (isNarrow ? 0.41 : 0.50));
      const toScreen = function (pt) { return [rootX + pt[0] * S, rootY + pt[1] * S]; };
      const sizeScale = Math.min(1.08, Math.max(0.60, S / 345));

      // Canopy Backlight Aura
      const crownCx = rootX - 0.12 * S;
      const crownCy = rootY - 0.50 * S;
      const auraR = S * 0.92;
      const auraGrad = ctx.createRadialGradient(crownCx, crownCy, S * 0.08, crownCx, crownCy, auraR);
      auraGrad.addColorStop(0, 'rgba(249, 168, 212, ' + ((0.22 * bloomCurrent) + (stormEnabled ? flashAmt * 0.14 : 0)).toFixed(3) + ')');
      auraGrad.addColorStop(0.50, 'rgba(216, 180, 232, ' + ((0.09 * bloomCurrent) + (stormEnabled ? flashAmt * 0.08 : 0)).toFixed(3) + ')');
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(crownCx, crownCy, auraR, 0, Math.PI * 2);
      ctx.fill();

      // Layer 0: Deep underside occlusion foliage
      const windWaveBase = Math.sin(t * 0.85) * 0.6 + Math.sin(t * 1.45) * 0.4;
      for (let i = 0; i < canopyClusters.length; i++) {
        const cl = canopyClusters[i];
        if (cl.layer !== 0) continue;
        const vis = Math.max(0, Math.min(1, (bloomCurrent - cl.order * 0.85) / 0.18));
        if (vis <= 0.01) continue;
        const pos = toScreen([cl.lx, cl.ly]);
        const swayX = (Math.sin(t * 1.05 + cl.ph) * 2.1 + windWaveBase * 1.6) * (0.6 + Math.abs(cl.lx));
        const swayY = Math.cos(t * 0.82 + cl.ph) * 1.4;
        const sz = cl.size * sizeScale * (0.4 + 0.6 * vis);
        ctx.save();
        ctx.globalAlpha = vis;
        ctx.translate(pos[0] + swayX, pos[1] + swayY);
        ctx.rotate(cl.rot);
        ctx.drawImage(cl.sprite, -sz / 2, -sz / 2, sz, sz);
        ctx.restore();
      }

      // Baked 4-Level Botanical Wood
      ctx.drawImage(bakedTreeWoodCanvas, 0, 0, W, H);

      // Subsurface Spirit Qi Ribbons
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (let q = 0; q < qiWaves.length; q++) {
        const qw = qiWaves[q];
        qw.prog = (qw.prog + qw.speed * dt) % 1;
        const path = qiPaths[qw.pathIdx];
        const env = Math.pow(Math.sin(qw.prog * Math.PI), 0.72);
        if (env < 0.02) continue;

        const headU = qw.prog;
        const tailU = Math.max(0, headU - qw.tailLen);
        const segs = 18;
        const ribbonPts = [];
        for (let s = 0; s <= segs; s++) {
          ribbonPts.push(toScreen(samplePathAt(path, tailU + (headU - tailU) * (s / segs))));
        }

        if (headU > 0.36) {
          for (let ci = 0; ci < canopyClusters.length; ci++) {
            const cl = canopyClusters[ci];
            if (cl.layer > 0 && cl.parentId === qw.pathIdx && Math.abs(cl.pathU - headU) < 0.085) {
              cl.bloom = Math.min(1.14, cl.bloom + dt * 1.45);
              cl.glow = Math.min(1.0, cl.glow + dt * 2.6);
            }
          }
        }

        const pTail = ribbonPts[0];
        const pHead = ribbonPts[ribbonPts.length - 1];

        const auraRibbon = ctx.createLinearGradient(pTail[0], pTail[1], pHead[0], pHead[1]);
        auraRibbon.addColorStop(0, 'rgba(244, 114, 182, 0)');
        auraRibbon.addColorStop(0.55, 'rgba(249, 168, 212, ' + (0.28 * env).toFixed(3) + ')');
        auraRibbon.addColorStop(0.88, 'rgba(253, 224, 71, ' + (0.42 * env).toFixed(3) + ')');
        auraRibbon.addColorStop(1, 'rgba(255, 251, 235, ' + (0.55 * env).toFixed(3) + ')');
        ctx.strokeStyle = auraRibbon;
        ctx.lineWidth = Math.max(6.5, S * 0.026);
        ctx.beginPath();
        ctx.moveTo(ribbonPts[0][0], ribbonPts[0][1]);
        for (let s = 1; s < ribbonPts.length; s++) ctx.lineTo(ribbonPts[s][0], ribbonPts[s][1]);
        ctx.stroke();

        const silkRibbon = ctx.createLinearGradient(pTail[0], pTail[1], pHead[0], pHead[1]);
        silkRibbon.addColorStop(0, 'rgba(253, 186, 210, 0)');
        silkRibbon.addColorStop(0.45, 'rgba(253, 224, 71, ' + (0.44 * env).toFixed(3) + ')');
        silkRibbon.addColorStop(0.85, 'rgba(255, 248, 220, ' + (0.78 * env).toFixed(3) + ')');
        silkRibbon.addColorStop(1, 'rgba(255, 255, 255, ' + (0.94 * env).toFixed(3) + ')');
        ctx.strokeStyle = silkRibbon;
        ctx.lineWidth = Math.max(2.4, S * 0.010);
        ctx.beginPath();
        ctx.moveTo(ribbonPts[0][0], ribbonPts[0][1]);
        for (let s = 1; s < ribbonPts.length; s++) ctx.lineTo(ribbonPts[s][0], ribbonPts[s][1]);
        ctx.stroke();

        const orbR = Math.max(7.5, S * 0.034);
        const orbGrad = ctx.createRadialGradient(pHead[0], pHead[1], 0.8, pHead[0], pHead[1], orbR);
        orbGrad.addColorStop(0, 'rgba(255, 255, 255, ' + (0.92 * env).toFixed(3) + ')');
        orbGrad.addColorStop(0.35, 'rgba(254, 240, 138, ' + (0.58 * env).toFixed(3) + ')');
        orbGrad.addColorStop(0.70, 'rgba(249, 168, 212, ' + (0.24 * env).toFixed(3) + ')');
        orbGrad.addColorStop(1, 'rgba(244, 114, 182, 0)');
        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(pHead[0], pHead[1], orbR, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Canopy Layers 1-3: Botanical Peach Blossoms
      for (let i = 0; i < canopyClusters.length; i++) {
        const cl = canopyClusters[i];
        if (cl.layer === 0) continue;

        const vis = Math.max(0, Math.min(1, (bloomCurrent - cl.order * 0.85) / 0.18));
        if (vis <= 0.01) continue;

        const baseBloom = cl.layer === 1 ? 0.88 : cl.layer === 2 ? 0.84 : 0.90;
        cl.bloom += (baseBloom - cl.bloom) * (1 - Math.exp(-dt * 1.4));
        cl.glow = Math.max(0, cl.glow - dt * 0.65);

        const pos = toScreen([cl.lx, cl.ly]);
        const windMul = 0.65 + Math.abs(cl.lx) * 0.85;
        const swayX = (Math.sin(t * 1.12 + cl.ph) * 2.5 + windWaveBase * 2.1) * windMul;
        const swayY = Math.cos(t * 0.88 + cl.ph) * 1.7;
        const px = pos[0] + swayX;
        const py = pos[1] + swayY;
        const sz = cl.size * sizeScale * cl.bloom * (0.35 + 0.65 * vis);

        ctx.save();
        ctx.globalAlpha = vis;
        ctx.translate(px, py);
        ctx.rotate(cl.rot + Math.sin(t * 0.55 + cl.ph) * 0.065);
        ctx.drawImage(cl.sprite, -sz / 2, -sz / 2, sz, sz);

        const stormCatch = stormEnabled && cl.layer >= 2 && flashAmt > 0.12 ? flashAmt * 0.34 : 0;
        if (cl.glow > 0.03 || stormCatch > 0.03) {
          ctx.globalCompositeOperation = 'lighter';
          const gRad = sz * 0.66;
          const gg = ctx.createRadialGradient(0, 0, 2, 0, 0, gRad);
          if (stormCatch > cl.glow) {
            gg.addColorStop(0, 'rgba(224, 244, 255, ' + (0.48 * stormCatch).toFixed(3) + ')');
            gg.addColorStop(0.55, 'rgba(249, 168, 212, ' + (0.24 * stormCatch).toFixed(3) + ')');
            gg.addColorStop(1, 'rgba(147, 197, 253, 0)');
          } else {
            gg.addColorStop(0, 'rgba(255, 248, 220, ' + (0.42 * cl.glow).toFixed(3) + ')');
            gg.addColorStop(0.55, 'rgba(249, 168, 212, ' + (0.22 * cl.glow).toFixed(3) + ')');
            gg.addColorStop(1, 'rgba(244, 114, 182, 0)');
          }
          ctx.fillStyle = gg;
          ctx.beginPath();
          ctx.arc(0, 0, gRad, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 3D Tumbling Moonlit Peach Petals
      const activePetals = Math.round(tumblingPetals.length * Math.max(0.15, bloomCurrent));
      for (let i = 0; i < activePetals; i++) {
        const pt = tumblingPetals[i];
        pt.x += (pt.vx + Math.sin(t * 0.95 + pt.ph) * 0.007) * dt;
        pt.y += (pt.vy + Math.cos(t * 0.72 + pt.ph) * 0.005) * dt;
        pt.rot += pt.vr * dt;
        pt.flipPh += pt.flipSpd * dt;

        if (pt.x < -0.05 || pt.y > 0.94) {
          pt.x = (rootX + (-0.68 + Math.random() * 1.18) * S) / W;
          pt.y = (rootY + (-0.74 + Math.random() * 0.46) * S) / H;
        }

        const pitchScale = 0.28 + 0.72 * Math.abs(Math.cos(pt.flipPh));
        ctx.save();
        ctx.translate(pt.x * W, pt.y * H);
        ctx.rotate(pt.rot);
        ctx.scale(1, pitchScale);
        const pg = ctx.createLinearGradient(-pt.sz, 0, pt.sz, 0);
        pg.addColorStop(0, 'rgba(255, 255, 255, 0.94)');
        pg.addColorStop(0.55, 'rgba(252, 224, 240, 0.88)');
        pg.addColorStop(1, 'rgba(244, 114, 182, 0.78)');
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.ellipse(0, 0, pt.sz, pt.sz * 0.58, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Subtle Optical Atmospheric Rim Flash on Foreground during Lightning Peak
      if (stormEnabled && flashAmt > 0.08) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const rimWash = ctx.createLinearGradient(0, 0, 0, H);
        rimWash.addColorStop(0, 'rgba(206, 236, 255, ' + (0.08 * flashAmt).toFixed(3) + ')');
        rimWash.addColorStop(0.55, 'rgba(186, 230, 253, ' + (0.05 * flashAmt).toFixed(3) + ')');
        rimWash.addColorStop(1, 'rgba(147, 197, 253, 0)');
        ctx.fillStyle = rimWash;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      ctx.restore();

      // 9. Foreground Translucent Icy Frost Veil & Delicate Frost Crystals
      drawColdMistLayer(foregroundFrostVeil, t, dt, true);

      for (let i = 0; i < chillCrystals.length; i++) {
        const cr = chillCrystals[i];
        cr.x += cr.vx * dt;
        cr.y += (cr.vy + Math.sin(t * 0.6 + cr.ph) * 0.0025) * dt;
        if (cr.x > 1.04) cr.x = -0.04;
        if (cr.y < 0.28) cr.y = 0.86;
        if (cr.y > 0.88) cr.y = 0.30;

        const glint = 0.18 + 0.56 * (0.5 + 0.5 * Math.sin(t * cr.tw + cr.ph));
        const cx = cr.x * W;
        const cy = cr.y * H;
        const cg = ctx.createRadialGradient(cx, cy, 0.2, cx, cy, cr.r * 3.0);
        cg.addColorStop(0, 'rgba(235, 248, 255, ' + glint.toFixed(2) + ')');
        cg.addColorStop(0.5, 'rgba(186, 230, 253, ' + (glint * 0.36).toFixed(2) + ')');
        cg.addColorStop(1, 'rgba(125, 211, 252, 0)');
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.arc(cx, cy, cr.r * 3.0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    rafId = requestAnimationFrame(render);

    return {
      setBloomProgress: function (ratio) {
        bloomTarget = Math.max(0, Math.min(1, Number(ratio) || 0));
      },
      setStormEnabled: function (enabled) {
        stormEnabled = Boolean(enabled);
      },
      triggerLightning: function () {
        triggerLightning(true);
      },
      triggerQiSurge: function () {
        for (let q = 0; q < qiWaves.length; q++) {
          qiWaves[q].prog = (q * 0.06) % 0.35;
        }
      },
      destroy: function () {
        disposed = true;
        clearTimeout(resizeTimer);
        if (rafId) cancelAnimationFrame(rafId);
        if (ro) {
          try { ro.disconnect(); } catch (_) {}
        }
        global.removeEventListener('resize', onWinResize);
        global.removeEventListener('pointermove', onPointerMove);
      }
    };
  }

  global.RJCLOUD_HERO_PEACH = {
    version: '2027.17-ultrareal-matte',
    mount: mount
  };
})(typeof window !== 'undefined' ? window : globalThis);
