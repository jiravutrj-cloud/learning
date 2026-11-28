/* ============================================================================
 * organ cloud 2.0 — Cinema Masterpiece Moonlit Peach Cliff Engine
 * File: hero-peach-engine.js (Zero-Build Standalone Production Module)
 * Version: 2027.21-masterpiece-cinema
 * Public Exports: window.RJCLOUD_HERO_PEACH
 *
 * ยกระดับความสมจริงระดับภาพยนตร์ (60/120FPS Offscreen-Baked + Real-Time):
 * 1. ท้องฟ้าทางช้างเผือกเนื้อละเอียด + กระจุกดาวฤกษ์หลายอุณหภูมิสี (ประกายแฉก) + ดาวตก 4 สาย
 * 2. ดวงจันทร์เสี้ยวสมจริง (Lunar Maria, หลุมอุกกาบาต, แสง Earthshine, วงทรงกลด 22°,
 *    ประกาย Anamorphic และลำแสงจันทร์ Volumetric God Rays ส่องทะลุช่องเมฆ)
 * 3. เมฆพายุ Volumetric 3 ชั้น + ฟ้าแลบแตกแขนง (Fractal Lightning) พร้อมแสงเรืองทะลุกลีบเมฆ
 *    และแสงสะท้อนเชื่อมทั้งท้องฟ้า ทิวเขา ทะเล และพุ่มดอกท้อ
 * 4. นกกระเรียนเงิน 3 ตัว กระพือปีก 2 ข้อต่ออ่อนช้อยพร้อมทางแสงละอองดาว
 * 5. ทิวเขาสลับซับซ้อน 3 ระยะ + ทะเลแสงจันทร์แบบ Perspective & Fresnel + ฟองคลื่นซัดโคนผา
 * 6. หน้าผาหินชั้น (Rock Strata, รอยแยก, หญ้าขอบผาลู่ลมแบบเรียลไทม์) + ไอหมอกเย็นรินลงขอบผา
 * 7. ต้นดอกท้อโบราณ 5 ระดับความลึก (เปลือกไม้แตก+มอส, รากเกาะหิน, กิ่งฝอย 90+ กิ่ง,
 *    ช่อดอกท้อ 160px มีรอยหยักกลีบ-เส้นใยกลีบ-เกสรสีทอง-ดอกตูม-ใบอ่อน, แสงปราณไหลผ่านกิ่ง,
 *    หิ่งห้อยแสงปราณ, กลีบดอกพลิกหมุน 3 มิติ + กลีบ Bokeh ระยะใกล้เลนส์) + 3D Mouse Parallax
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
  // 2. SHARED HIGH-RESOLUTION CINEMA SPRITES
  // ============================================================================
  let sharedAssets = null;

  function applySoftEllipticalFeather(targetCanvas) {
    const tc = targetCanvas.getContext('2d');
    if (!tc) return;
    const cw = targetCanvas.width;
    const ch = targetCanvas.height;
    tc.save();
    tc.globalCompositeOperation = 'destination-in';
    tc.translate(cw * 0.5, ch * 0.5);
    tc.scale(1, ch / Math.max(1, cw));
    const rMax = cw * 0.49;
    const mask = tc.createRadialGradient(0, 0, rMax * 0.44, 0, 0, rMax);
    mask.addColorStop(0, 'rgba(0,0,0,1)');
    mask.addColorStop(0.70, 'rgba(0,0,0,0.88)');
    mask.addColorStop(0.90, 'rgba(0,0,0,0.26)');
    mask.addColorStop(1, 'rgba(0,0,0,0)');
    tc.fillStyle = mask;
    tc.beginPath();
    tc.arc(0, 0, rMax, 0, Math.PI * 2);
    tc.fill();
    tc.restore();
  }

  function buildUltraMoonSprite() {
    const size = 380;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const mc = c.getContext('2d');
    const cx = size / 2;
    const cy = size / 2;
    const r = 56;
    const rng = createRng(90210);

    // 22-degree atmospheric ice-crystal corona ring
    const ringGrad = mc.createRadialGradient(cx, cy, r * 2.15, cx, cy, r * 3.25);
    ringGrad.addColorStop(0, 'rgba(186, 230, 253, 0)');
    ringGrad.addColorStop(0.45, 'rgba(186, 230, 253, 0.06)');
    ringGrad.addColorStop(0.62, 'rgba(224, 242, 254, 0.09)');
    ringGrad.addColorStop(0.80, 'rgba(253, 230, 138, 0.035)');
    ringGrad.addColorStop(1, 'rgba(147, 197, 253, 0)');
    mc.fillStyle = ringGrad;
    mc.beginPath();
    mc.arc(cx, cy, r * 3.25, 0, Math.PI * 2);
    mc.fill();

    // Subtle cinema anamorphic horizontal lens shimmer
    mc.save();
    mc.translate(cx + 12, cy + 8);
    mc.scale(3.4, 0.16);
    const flare = mc.createRadialGradient(0, 0, 2, 0, 0, r * 1.0);
    flare.addColorStop(0, 'rgba(224, 244, 255, 0.24)');
    flare.addColorStop(0.45, 'rgba(147, 197, 253, 0.08)');
    flare.addColorStop(1, 'rgba(147, 197, 253, 0)');
    mc.fillStyle = flare;
    mc.beginPath();
    mc.arc(0, 0, r * 1.0, 0, Math.PI * 2);
    mc.fill();
    mc.restore();

    // Mie scattering inner atmospheric bloom
    const bloom = mc.createRadialGradient(cx + 9, cy + 6, r * 0.22, cx, cy, r * 2.6);
    bloom.addColorStop(0, 'rgba(245, 251, 255, 0.54)');
    bloom.addColorStop(0.30, 'rgba(186, 230, 253, 0.24)');
    bloom.addColorStop(0.65, 'rgba(125, 185, 245, 0.07)');
    bloom.addColorStop(1, 'rgba(56, 130, 220, 0)');
    mc.fillStyle = bloom;
    mc.beginPath();
    mc.arc(cx, cy, r * 2.6, 0, Math.PI * 2);
    mc.fill();

    // Full lunar disc with Maria, Tycho rays & micro-craters
    const disc = document.createElement('canvas');
    disc.width = size;
    disc.height = size;
    const dc = disc.getContext('2d');

    dc.save();
    dc.beginPath();
    dc.arc(cx, cy, r, 0, Math.PI * 2);
    dc.clip();

    const baseG = dc.createRadialGradient(cx + r * 0.45, cy + r * 0.35, r * 0.1, cx, cy, r * 1.18);
    baseG.addColorStop(0, '#ffffff');
    baseG.addColorStop(0.52, '#f0f6fc');
    baseG.addColorStop(0.84, '#cddbe9');
    baseG.addColorStop(1, '#98b0c9');
    dc.fillStyle = baseG;
    dc.fillRect(cx - r, cy - r, r * 2, r * 2);

    // Lunar Maria basalt plains
    for (let i = 0; i < 30; i++) {
      const mx = cx + (rng() - 0.46) * r * 1.55;
      const my = cy + (rng() - 0.5) * r * 1.48;
      const mr = 7 + rng() * 20;
      const mg = dc.createRadialGradient(mx, my, 1, mx, my, mr);
      mg.addColorStop(0, 'rgba(74, 96, 124, ' + (0.14 + rng() * 0.17).toFixed(2) + ')');
      mg.addColorStop(0.65, 'rgba(104, 126, 152, 0.07)');
      mg.addColorStop(1, 'rgba(104, 126, 152, 0)');
      dc.fillStyle = mg;
      dc.beginPath();
      dc.arc(mx, my, mr, 0, Math.PI * 2);
      dc.fill();
    }

    // Crisp micro-craters with sunlit rims
    for (let i = 0; i < 52; i++) {
      const crX = cx + (rng() - 0.5) * r * 1.72;
      const crY = cy + (rng() - 0.5) * r * 1.72;
      const crR = 1.1 + rng() * 4.4;
      dc.fillStyle = 'rgba(68, 88, 114, 0.16)';
      dc.beginPath();
      dc.arc(crX, crY, crR, 0, Math.PI * 2);
      dc.fill();
      dc.strokeStyle = 'rgba(255, 255, 255, 0.28)';
      dc.lineWidth = 0.7;
      dc.beginPath();
      dc.arc(crX + 0.5, crY + 0.5, crR, -0.4, 1.4);
      dc.stroke();
    }
    dc.restore();

    // Subtle Earthshine dark side
    mc.save();
    mc.globalAlpha = 0.14;
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
    const termGrad = lc.createRadialGradient(shX, shY, shR * 0.78, shX, shY, shR * 1.05);
    termGrad.addColorStop(0, 'rgba(0,0,0,1)');
    termGrad.addColorStop(0.86, 'rgba(0,0,0,0.96)');
    termGrad.addColorStop(1, 'rgba(0,0,0,0)');
    lc.fillStyle = termGrad;
    lc.beginPath();
    lc.arc(shX, shY, shR * 1.05, 0, Math.PI * 2);
    lc.fill();

    mc.save();
    mc.shadowColor = 'rgba(219, 240, 255, 0.98)';
    mc.shadowBlur = 16;
    mc.drawImage(lit, 0, 0);
    mc.restore();

    return c;
  }

  function drawSingleBotanicalBlossom(bc, fx, fy, sc, rot, tone) {
    // Slender young jade-emerald peach leaves tucked organically behind selected blossoms
    if ((tone === 'mid' || tone === 'light') && Math.sin(rot * 5) > 0.45) {
      bc.save();
      bc.translate(fx, fy);
      bc.rotate(rot + 1.15);
      const lg = bc.createLinearGradient(0, 0, 16 * sc, 0);
      lg.addColorStop(0, '#163029');
      lg.addColorStop(0.55, '#2b5949');
      lg.addColorStop(1, '#689c7f');
      bc.fillStyle = lg;
      bc.beginPath();
      bc.moveTo(2 * sc, 0);
      bc.quadraticCurveTo(9.5 * sc, -3.6 * sc, 17.5 * sc, 0);
      bc.quadraticCurveTo(9.5 * sc, 3.6 * sc, 2 * sc, 0);
      bc.fill();
      // Delicate leaf midrib highlight
      bc.strokeStyle = 'rgba(186, 230, 200, 0.35)';
      bc.lineWidth = 0.5 * sc;
      bc.beginPath();
      bc.moveTo(3 * sc, 0);
      bc.lineTo(14.5 * sc, 0);
      bc.stroke();
      bc.restore();
    }

    // 5 authentic notched heart-shaped peach petals with delicate inner veining
    for (let p = 0; p < 5; p++) {
      const ang = rot + (p * Math.PI * 2) / 5 + (p % 2 ? 0.04 : -0.04);
      bc.save();
      bc.translate(fx, fy);
      bc.rotate(ang);
      const pg = bc.createRadialGradient(2.8 * sc, 0, 0.5 * sc, 8.2 * sc, 0, 11.8 * sc);
      if (tone === 'sss') {
        pg.addColorStop(0, '#fff9f2');
        pg.addColorStop(0.24, '#ffe4ec');
        pg.addColorStop(0.65, '#fbcfe8');
        pg.addColorStop(0.92, '#ffffff');
        pg.addColorStop(1, 'rgba(244, 114, 182, 0.85)');
      } else if (tone === 'light') {
        pg.addColorStop(0, '#be185d');
        pg.addColorStop(0.16, '#f9a8d4');
        pg.addColorStop(0.52, '#fdf2f8');
        pg.addColorStop(0.88, '#ffffff');
        pg.addColorStop(1, '#fbcfe8');
      } else {
        pg.addColorStop(0, '#7c133e');
        pg.addColorStop(0.24, '#db2777');
        pg.addColorStop(0.62, '#f9a8d4');
        pg.addColorStop(0.90, '#fce7f3');
        pg.addColorStop(1, '#ec4899');
      }
      bc.fillStyle = pg;
      bc.beginPath();
      bc.moveTo(0, 0);
      bc.bezierCurveTo(3.6 * sc, -5.5 * sc, 11.8 * sc, -6.1 * sc, 13.8 * sc, -1.2 * sc);
      bc.quadraticCurveTo(12.2 * sc, 0, 13.8 * sc, 1.2 * sc);
      bc.bezierCurveTo(11.8 * sc, 6.1 * sc, 3.6 * sc, 5.5 * sc, 0, 0);
      bc.fill();

      // Whisper-fine translucent petal veins
      bc.strokeStyle = tone === 'mid' ? 'rgba(190, 24, 93, 0.18)' : 'rgba(244, 114, 182, 0.16)';
      bc.lineWidth = 0.45 * sc;
      bc.beginPath();
      bc.moveTo(2 * sc, 0);
      bc.quadraticCurveTo(7 * sc, -1.2 * sc, 11 * sc, -1.8 * sc);
      bc.moveTo(2 * sc, 0);
      bc.quadraticCurveTo(7 * sc, 1.2 * sc, 11 * sc, 1.8 * sc);
      bc.stroke();
      bc.restore();
    }

    // Crimson calyx + delicate radiating stamens & luminous golden anthers
    bc.fillStyle = tone === 'sss' ? '#fb7185' : '#9d174d';
    bc.beginPath();
    bc.arc(fx, fy, 2.4 * sc, 0, Math.PI * 2);
    bc.fill();

    for (let s = 0; s < 8; s++) {
      const sa = rot + (s * Math.PI * 2) / 8;
      const sl = (4.0 + (s % 2) * 1.6) * sc;
      const sx = fx + Math.cos(sa) * sl;
      const sy = fy + Math.sin(sa) * sl;
      bc.strokeStyle = 'rgba(255, 244, 246, 0.78)';
      bc.lineWidth = 0.58 * sc;
      bc.beginPath();
      bc.moveTo(fx, fy);
      bc.lineTo(sx, sy);
      bc.stroke();
      bc.fillStyle = '#fef08a';
      bc.beginPath();
      bc.arc(sx, sy, 0.95 * sc, 0, Math.PI * 2);
      bc.fill();
    }
  }

  function createBotanicalClusterSprite(mode, seed) {
    const sz = 160;
    const half = sz / 2;
    const c = document.createElement('canvas');
    c.width = sz;
    c.height = sz;
    const bc = c.getContext('2d');
    const rng = createRng(seed);

    if (mode === 'shadow') {
      for (let i = 0; i < 14; i++) {
        const px = half + (rng() - 0.5) * 76;
        const py = half + (rng() - 0.5) * 54;
        const rad = 20 + rng() * 22;
        const g = bc.createRadialGradient(px, py, 2, px, py, rad);
        g.addColorStop(0, 'rgba(54, 14, 44, 0.92)');
        g.addColorStop(0.55, 'rgba(30, 10, 36, 0.64)');
        g.addColorStop(1, 'rgba(12, 7, 24, 0)');
        bc.fillStyle = g;
        bc.beginPath();
        bc.arc(px, py, rad, 0, Math.PI * 2);
        bc.fill();
      }
      return c;
    }

    const aura = bc.createRadialGradient(half, half, 8, half, half, 70);
    if (mode === 'sss' || mode === 'light' || mode === 'hero') {
      aura.addColorStop(0, 'rgba(255, 244, 250, 0.46)');
      aura.addColorStop(0.5, 'rgba(249, 168, 212, 0.19)');
      aura.addColorStop(1, 'rgba(244, 114, 182, 0)');
    } else {
      aura.addColorStop(0, 'rgba(219, 39, 119, 0.30)');
      aura.addColorStop(0.6, 'rgba(157, 23, 77, 0.11)');
      aura.addColorStop(1, 'rgba(131, 24, 67, 0)');
    }
    bc.fillStyle = aura;
    bc.beginPath();
    bc.arc(half, half, 70, 0, Math.PI * 2);
    bc.fill();

    // Unopened deep-rose buds around cluster perimeter
    for (let b = 0; b < 5; b++) {
      const bx = half + (rng() - 0.5) * 84;
      const by = half + (rng() - 0.5) * 64;
      const bang = rng() * Math.PI * 2;
      bc.save();
      bc.translate(bx, by);
      bc.rotate(bang);
      bc.fillStyle = '#9d174d';
      bc.beginPath();
      bc.ellipse(0, 0, 4.8, 3.0, 0, 0, Math.PI * 2);
      bc.fill();
      bc.fillStyle = '#fbcfe8';
      bc.beginPath();
      bc.ellipse(1.5, -0.5, 2.6, 1.5, 0, 0, Math.PI * 2);
      bc.fill();
      bc.restore();
    }

    // Full 5-petal detailed botanical blossoms
    const cnt = mode === 'hero' ? 4 : mode === 'sss' ? 6 : 8;
    for (let f = 0; f < cnt; f++) {
      const fx = half + (rng() - 0.5) * 72;
      const fy = half + (rng() - 0.5) * 54;
      const sc = (mode === 'hero' ? 0.96 : 0.76) + rng() * 0.48;
      drawSingleBotanicalBlossom(
        bc,
        fx,
        fy,
        sc,
        rng() * Math.PI * 2,
        mode === 'hero' ? 'light' : mode
      );
    }
    return c;
  }

  function createBokehPetalSprite() {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 44;
    const pc = c.getContext('2d');
    pc.save();
    pc.translate(32, 22);
    const g = pc.createRadialGradient(-4, -2, 2, 0, 0, 26);
    g.addColorStop(0, 'rgba(255, 245, 250, 0.72)');
    g.addColorStop(0.45, 'rgba(251, 207, 232, 0.44)');
    g.addColorStop(0.80, 'rgba(244, 114, 182, 0.16)');
    g.addColorStop(1, 'rgba(244, 114, 182, 0)');
    pc.scale(1, 0.66);
    pc.fillStyle = g;
    pc.beginPath();
    pc.arc(0, 0, 26, 0, Math.PI * 2);
    pc.fill();
    pc.restore();
    return c;
  }

  function createColdMistSprite(seed, variant) {
    const c = document.createElement('canvas');
    const isPlume = variant === 'plume';
    const isWisp = variant === 'wisp';
    c.width = isPlume ? 240 : isWisp ? 600 : 560;
    c.height = isPlume ? 400 : isWisp ? 260 : 340;
    const mc = c.getContext('2d');
    const rng = createRng(seed);

    const puffs = isPlume ? 28 : isWisp ? 36 : 46;
    for (let i = 0; i < puffs; i++) {
      const u = i / Math.max(1, puffs - 1);
      const dome = Math.sin(u * Math.PI);
      let px, py, rx, ry;
      if (isPlume) {
        px = c.width * 0.5 + (rng() - 0.5) * (32 + u * 44);
        py = 56 + u * (c.height - 112) + (rng() - 0.5) * 16;
        rx = 24 + u * 24 + rng() * 14;
        ry = 32 + rng() * 24;
      } else {
        px = 128 + u * (c.width - 256) + (rng() - 0.5) * (isWisp ? 34 : 52);
        py = c.height * 0.52 - dome * (isWisp ? 10 : 18) + (rng() - 0.5) * (isWisp ? 28 : 58);
        rx = (isWisp ? 48 : 60) + rng() * (isWisp ? 50 : 66) * (0.62 + dome * 0.44);
        ry = (isWisp ? 20 : 32) + rng() * (isWisp ? 22 : 38) * (0.62 + dome * 0.44);
      }

      const roll = rng();
      const rgb =
        roll < 0.38
          ? '236, 247, 255'
          : roll < 0.74
            ? '182, 222, 250'
            : '132, 184, 226';
      const peak = isPlume ? 0.056 + rng() * 0.044 : isWisp ? 0.044 + rng() * 0.036 : 0.052 + rng() * 0.042;

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
    applySoftEllipticalFeather(c);
    return c;
  }

  function buildCinematicCloudPair(seed, shape) {
    const isCirrus = shape === 'cirrus';
    const isAnvil = shape === 'anvil';
    const cw = isCirrus ? 720 : isAnvil ? 780 : 660;
    const ch = isCirrus ? 230 : isAnvil ? 400 : 340;

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
    const count = isCirrus ? 28 : isAnvil ? 64 : 48;

    for (let i = 0; i < count; i++) {
      const u = i / Math.max(1, count - 1);
      const dome = Math.sin(u * Math.PI);
      let px, py, rx, ry;
      if (isCirrus) {
        px = 140 + u * (cw - 280) + (rng() - 0.5) * 32;
        py = ch * 0.50 + (rng() - 0.5) * 28;
        rx = 50 + rng() * 58 * (0.55 + dome * 0.45);
        ry = 14 + rng() * 16;
      } else if (isAnvil) {
        const inTop = i > count * 0.42;
        const spread = inTop ? 0.54 : 0.64;
        px = cw * (0.5 + (u - 0.5) * spread) + (rng() - 0.5) * 48;
        py = inTop ? ch * (0.48 - dome * 0.20) + (rng() - 0.5) * 34 : ch * 0.59 + (rng() - 0.5) * 24;
        rx = (inTop ? 40 : 56) + rng() * (inTop ? 46 : 56) * (0.62 + dome * 0.42);
        ry = (inTop ? 32 : 26) + rng() * (inTop ? 34 : 24) * (0.62 + dome * 0.42);
      } else {
        px = 136 + u * (cw - 272) + (rng() - 0.5) * 46;
        py = ch * 0.54 - dome * 32 + (rng() - 0.5) * 38;
        rx = 46 + rng() * 52 * (0.60 + dome * 0.44);
        ry = 28 + rng() * 32 * (0.60 + dome * 0.44);
      }
      puffs.push({ px: px, py: py, rx: rx, ry: ry, rand: rng() });
    }

    // Pass 1: Heavy Storm Underside & Volumetric Core Shadow
    for (let i = 0; i < puffs.length; i++) {
      const p = puffs[i];
      bc.save();
      bc.translate(p.px, p.py + (isCirrus ? 0 : 8));
      bc.scale(1, p.ry / Math.max(1, p.rx));
      const g = bc.createRadialGradient(0, p.rx * 0.12, p.rx * 0.05, 0, 0, p.rx);
      if (isCirrus) {
        g.addColorStop(0, 'rgba(154, 202, 242, 0.15)');
        g.addColorStop(0.55, 'rgba(92, 144, 200, 0.06)');
        g.addColorStop(1, 'rgba(30, 58, 108, 0)');
      } else {
        const darkA = 0.25 + p.rand * 0.16;
        g.addColorStop(0, 'rgba(5, 11, 26, ' + darkA.toFixed(3) + ')');
        g.addColorStop(0.52, 'rgba(11, 24, 50, ' + (darkA * 0.68).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(11, 24, 50, 0)');
      }
      bc.fillStyle = g;
      bc.beginPath();
      bc.arc(0, 0, p.rx, 0, Math.PI * 2);
      bc.fill();
      bc.restore();
    }

    // Pass 2: Moonlit Silver Lining on Left-Upper Cloud Crests
    if (!isCirrus) {
      for (let i = 0; i < puffs.length; i++) {
        const p = puffs[i];
        bc.save();
        bc.translate(p.px - 6, p.py - 8);
        bc.scale(1, (p.ry * 0.88) / Math.max(1, p.rx * 0.90));
        const r = p.rx * 0.90;
        const g = bc.createRadialGradient(-r * 0.24, -r * 0.26, r * 0.04, 0, 0, r);
        const rimA = p.py < ch * 0.56 ? 0.16 + p.rand * 0.11 : 0.05;
        g.addColorStop(0, 'rgba(208, 234, 255, ' + rimA.toFixed(3) + ')');
        g.addColorStop(0.32, 'rgba(68, 110, 164, ' + (0.15 + p.rand * 0.08).toFixed(3) + ')');
        g.addColorStop(0.68, 'rgba(20, 40, 76, 0.11)');
        g.addColorStop(1, 'rgba(10, 20, 44, 0)');
        bc.fillStyle = g;
        bc.beginPath();
        bc.arc(0, 0, r, 0, Math.PI * 2);
        bc.fill();
        bc.restore();
      }
    }

    // Pass 3: Internal Lightning Subsurface Illumination Sprite
    for (let i = 0; i < puffs.length; i++) {
      const p = puffs[i];
      const distFromHeart = Math.hypot((p.px - cw * 0.52) / (cw * 0.42), (p.py - ch * 0.54) / (ch * 0.42));
      const heat = Math.max(0.08, 1 - distFromHeart * 0.85);
      lc.save();
      lc.translate(p.px, p.py);
      lc.scale(1, p.ry / Math.max(1, p.rx));
      const r = p.rx * 1.04;
      const g = lc.createRadialGradient(0, 0, r * 0.05, 0, 0, r);
      const a = (isCirrus ? 0.12 : 0.22) * heat * (0.65 + p.rand * 0.5);
      g.addColorStop(0, 'rgba(244, 250, 255, ' + a.toFixed(3) + ')');
      g.addColorStop(0.36, 'rgba(165, 214, 255, ' + (a * 0.74).toFixed(3) + ')');
      g.addColorStop(0.72, 'rgba(139, 156, 248, ' + (a * 0.35).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(99, 102, 241, 0)');
      lc.fillStyle = g;
      lc.beginPath();
      lc.arc(0, 0, r, 0, Math.PI * 2);
      lc.fill();
      lc.restore();
    }

    applySoftEllipticalFeather(baseCanvas);
    applySoftEllipticalFeather(litCanvas);
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
      bokehPetal: createBokehPetalSprite(),
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
  // 3. MAIN MOUNTABLE CINEMA MASTERPIECE ENGINE
  // ============================================================================
  function mount(refs) {
    const stage = refs && refs.stage;
    const canvas = refs && (refs.canvas || refs.bgCanvas);
    if (!stage || !canvas) return { destroy: function () {} };

    const ctx = canvas.getContext('2d');
    if (!ctx) return { destroy: function () {} };

    const assets = getSharedAssets();
    let W = Math.max(320, Math.round(stage.clientWidth || global.innerWidth || 1280));
    let H = Math.max(480, Math.round(stage.clientHeight || global.innerHeight || 720));
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

    // External bloom & storm controls (default 1.0 = full majestic bloom on landing)
    let bloomTarget = typeof (refs && refs.initialBloom) === 'number' ? refs.initialBloom : 1.0;
    let bloomCurrent = bloomTarget;
    let stormEnabled = !(refs && refs.stormEnabled === false);

    // --------------------------------------------------------------------------
    // A. BOTANICAL 5-LEVEL ANCIENT PEACH TREE SKELETON & LUSH CANOPY
    // --------------------------------------------------------------------------
    const trunkCurve = [[0.048, 0.036], [-0.015, -0.095], [-0.088, -0.222], [-0.118, -0.356]];
    const cliffRoots = [
      [[0.024, 0.008], [-0.045, 0.015], [-0.12, 0.023], [-0.19, 0.034]],
      [[0.052, 0.010], [0.11, 0.019], [0.18, 0.025], [0.24, 0.034]],
      [[0.032, 0.012], [0.005, 0.025], [-0.04, 0.038], [-0.085, 0.046]],
      [[0.040, 0.014], [0.068, 0.028], [0.095, 0.040], [0.13, 0.048]]
    ];

    const primaryBoughs = [
      { id: 0, trunkT: 0.58, w0: 0.040, w1: 0.007, pts: [[-0.06, -0.20], [-0.29, -0.26], [-0.57, -0.27], [-0.88, -0.19]] },
      { id: 1, trunkT: 0.75, w0: 0.036, w1: 0.007, pts: [[-0.09, -0.27], [-0.30, -0.42], [-0.54, -0.48], [-0.76, -0.42]] },
      { id: 2, trunkT: 0.90, w0: 0.030, w1: 0.006, pts: [[-0.10, -0.32], [-0.24, -0.52], [-0.38, -0.66], [-0.54, -0.64]] },
      { id: 3, trunkT: 1.00, w0: 0.028, w1: 0.006, pts: [[-0.11, -0.35], [-0.15, -0.56], [-0.17, -0.73], [-0.19, -0.80]] },
      { id: 4, trunkT: 0.98, w0: 0.027, w1: 0.006, pts: [[-0.10, -0.34], [0.02, -0.54], [0.14, -0.70], [0.26, -0.77]] },
      { id: 5, trunkT: 0.87, w0: 0.029, w1: 0.006, pts: [[-0.08, -0.30], [0.14, -0.48], [0.34, -0.59], [0.53, -0.58]] },
      { id: 6, trunkT: 0.72, w0: 0.032, w1: 0.007, pts: [[-0.06, -0.24], [0.18, -0.36], [0.42, -0.43], [0.64, -0.36]] }
    ];

    const secondaryTwigs = [
      { parentId: 0, w0: 0.016, w1: 0.0035, pts: [[-0.36, -0.26], [-0.48, -0.36], [-0.59, -0.40], [-0.71, -0.36]] },
      { parentId: 0, w0: 0.014, w1: 0.0030, pts: [[-0.57, -0.26], [-0.70, -0.23], [-0.82, -0.26], [-0.94, -0.22]] },
      { parentId: 0, w0: 0.013, w1: 0.0030, pts: [[-0.24, -0.24], [-0.36, -0.18], [-0.47, -0.17], [-0.58, -0.22]] },
      { parentId: 1, w0: 0.015, w1: 0.0035, pts: [[-0.35, -0.43], [-0.47, -0.54], [-0.57, -0.58], [-0.67, -0.54]] },
      { parentId: 1, w0: 0.013, w1: 0.0030, pts: [[-0.50, -0.46], [-0.62, -0.46], [-0.72, -0.49], [-0.83, -0.46]] },
      { parentId: 2, w0: 0.014, w1: 0.0030, pts: [[-0.26, -0.55], [-0.33, -0.68], [-0.38, -0.75], [-0.46, -0.74]] },
      { parentId: 2, w0: 0.013, w1: 0.0030, pts: [[-0.36, -0.62], [-0.48, -0.68], [-0.57, -0.67], [-0.64, -0.61]] },
      { parentId: 3, w0: 0.014, w1: 0.0030, pts: [[-0.15, -0.58], [-0.06, -0.70], [-0.02, -0.78], [-0.02, -0.84]] },
      { parentId: 3, w0: 0.013, w1: 0.0030, pts: [[-0.16, -0.66], [-0.26, -0.75], [-0.33, -0.79], [-0.40, -0.77]] },
      { parentId: 4, w0: 0.014, w1: 0.0030, pts: [[0.06, -0.58], [0.18, -0.68], [0.27, -0.73], [0.37, -0.71]] },
      { parentId: 4, w0: 0.013, w1: 0.0030, pts: [[0.02, -0.52], [0.06, -0.66], [0.09, -0.76], [0.12, -0.83]] },
      { parentId: 5, w0: 0.015, w1: 0.0035, pts: [[0.24, -0.53], [0.35, -0.64], [0.45, -0.68], [0.55, -0.65]] },
      { parentId: 5, w0: 0.013, w1: 0.0030, pts: [[0.38, -0.58], [0.48, -0.56], [0.58, -0.54], [0.66, -0.49]] },
      { parentId: 6, w0: 0.015, w1: 0.0035, pts: [[0.26, -0.38], [0.39, -0.47], [0.51, -0.50], [0.62, -0.47]] },
      { parentId: 6, w0: 0.013, w1: 0.0030, pts: [[0.44, -0.41], [0.56, -0.38], [0.65, -0.39], [0.74, -0.35]] },
      { parentId: 6, w0: 0.011, w1: 0.0028, pts: [[0.20, -0.35], [0.30, -0.29], [0.40, -0.28], [0.48, -0.30]] }
    ];

    const fineTwigs = [];
    (function generateFineBotanicalTwigs() {
      const rng = createRng(77419);
      const sources = primaryBoughs.concat(secondaryTwigs);
      for (let sIdx = 0; sIdx < sources.length; sIdx++) {
        const br = sources[sIdx];
        const count = br.w0 > 0.02 ? 5 : 4;
        for (let i = 0; i < count; i++) {
          const u = 0.44 + (i / count) * 0.52;
          const p0 = evalCubic(br.pts[0], br.pts[1], br.pts[2], br.pts[3], u);
          const pNext = evalCubic(br.pts[0], br.pts[1], br.pts[2], br.pts[3], Math.min(1, u + 0.05));
          const baseAng = Math.atan2(pNext[1] - p0[1], pNext[0] - p0[0]);
          const spread = (i % 2 === 0 ? 1 : -1) * (0.34 + rng() * 0.56);
          const ang = baseAng + spread;
          const len = 0.08 + rng() * 0.09;
          const p1 = [p0[0] + Math.cos(ang) * len * 0.45, p0[1] + Math.sin(ang) * len * 0.45 - 0.012];
          const p2 = [p0[0] + Math.cos(ang + spread * 0.25) * len * 0.78, p0[1] + Math.sin(ang + spread * 0.25) * len * 0.78 - 0.018];
          const p3 = [p0[0] + Math.cos(ang + spread * 0.35) * len, p0[1] + Math.sin(ang + spread * 0.35) * len - 0.010];
          fineTwigs.push({
            parentId: br.parentId !== undefined ? br.parentId : br.id,
            w0: 0.0052,
            w1: 0.0013,
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
          const pu = 0.40 + u * 0.60;
          canopyClusters.push({
            layer: 0, parentId: pid, pathU: pu, sprite: assets.blShadow,
            lx: bp[0] + (rng() - 0.5) * sp * 1.45, ly: bp[1] + 0.025 + (rng() - 0.5) * sp * 0.78,
            size: (50 + rng() * 28) * sm, rot: rng() * Math.PI * 2, ph: rng() * Math.PI * 2,
            bloom: 0.90, glow: 0, order: rng()
          });
          canopyClusters.push({
            layer: 1, parentId: pid, pathU: pu, sprite: k % 2 === 0 ? assets.blMidA : assets.blMidB,
            lx: bp[0] + (rng() - 0.5) * sp * 1.68, ly: bp[1] - 0.006 + (rng() - 0.5) * sp * 0.92,
            size: (42 + rng() * 25) * sm, rot: rng() * Math.PI * 2, ph: rng() * Math.PI * 2,
            bloom: 0.86, glow: 0, order: rng()
          });
          if (rng() > 0.16) {
            canopyClusters.push({
              layer: 2, parentId: pid, pathU: pu, sprite: bp[0] < -0.10 ? assets.blSss : assets.blLight,
              lx: bp[0] - 0.014 + (rng() - 0.5) * sp * 1.48, ly: bp[1] - 0.030 + (rng() - 0.5) * sp * 0.72,
              size: (34 + rng() * 22) * sm, rot: rng() * Math.PI * 2, ph: rng() * Math.PI * 2,
              bloom: 0.82, glow: 0, order: rng()
            });
          }
        }
      }
      primaryBoughs.forEach(function (b) { addRing(b.pts, b.id, 0.50, 7, 0.074, 1.08); });
      secondaryTwigs.forEach(function (tw) { addRing(tw.pts, tw.parentId, 0.38, 4, 0.066, 0.96); });
      fineTwigs.forEach(function (ft, idx) {
        const tip = ft.pts[3];
        canopyClusters.push({
          layer: 3, parentId: ft.parentId, pathU: 0.92, sprite: idx % 3 === 0 ? assets.blSss : assets.blHero,
          lx: tip[0], ly: tip[1],
          size: 26 + rng() * 16, rot: rng() * Math.PI * 2, ph: rng() * Math.PI * 2,
          bloom: 0.88, glow: 0, order: rng()
        });
      });
      canopyClusters.sort(function (a, b) { return a.layer - b.layer; });
    })();

    const qiWaves = primaryBoughs.map(function (b, idx) {
      return { pathIdx: b.id, prog: (idx * 0.145) % 1, speed: 0.050 + (idx % 3) * 0.007, tailLen: 0.26 };
    });

    // --------------------------------------------------------------------------
    // B. STORM CLOUD DECK & LIGHTNING STATE
    // --------------------------------------------------------------------------
    const skyCloudDeck = [
      { pair: assets.clouds.cirrusA, layer: 'high',  x: 0.20, y: 0.14, w: 0.54, h: 0.18, vx: 0.0040, alpha: 0.70, ph: 0.4, parallax: 5 },
      { pair: assets.clouds.cirrusB, layer: 'high',  x: 0.68, y: 0.11, w: 0.56, h: 0.19, vx: 0.0034, alpha: 0.62, ph: 2.1, parallax: 5 },
      { pair: assets.clouds.cirrusA, layer: 'high',  x: 0.95, y: 0.19, w: 0.48, h: 0.16, vx: 0.0046, alpha: 0.54, ph: 4.3, parallax: 6 },
      { pair: assets.clouds.anvilA,  layer: 'storm', x: 0.79, y: 0.21, w: 0.58, h: 0.35, vx: 0.0024, alpha: 0.90, ph: 1.1, parallax: 7, isStormCore: true },
      { pair: assets.clouds.billowA, layer: 'storm', x: 0.58, y: 0.25, w: 0.46, h: 0.28, vx: 0.0028, alpha: 0.78, ph: 2.7, parallax: 7, isStormCore: true },
      { pair: assets.clouds.anvilB,  layer: 'storm', x: 0.06, y: 0.29, w: 0.48, h: 0.29, vx: 0.0030, alpha: 0.82, ph: 3.9, parallax: 7, isStormCore: true },
      { pair: assets.clouds.billowB, layer: 'storm', x: 0.96, y: 0.29, w: 0.46, h: 0.26, vx: 0.0022, alpha: 0.84, ph: 5.2, parallax: 7, isStormCore: true },
      { pair: assets.clouds.billowB, layer: 'mid',   x: 0.34, y: 0.40, w: 0.42, h: 0.18, vx: 0.0050, alpha: 0.50, ph: 0.9, parallax: 9 },
      { pair: assets.clouds.billowA, layer: 'mid',   x: 0.84, y: 0.39, w: 0.46, h: 0.20, vx: 0.0044, alpha: 0.56, ph: 3.4, parallax: 9 }
    ];

    const stormState = {
      active: null,
      nextStrikeAt: 2.2,
      ambientFlashX: 0.78,
      ambientFlashY: 0.22
    };

    function triggerLightning(forceBolt) {
      if (!stormEnabled) return;
      const cores = skyCloudDeck.filter(function (c) { return c.isStormCore && c.x > 0.02 && c.x < 0.98; });
      const hostCloud = cores.length > 0 ? cores[Math.floor(Math.random() * cores.length)] : skyCloudDeck[3];
      const strikeX = Math.max(0.06, Math.min(0.94, hostCloud.x + (Math.random() - 0.5) * 0.14));
      const strikeY = Math.max(0.14, Math.min(0.32, hostCloud.y + 0.03));
      const isForkedBolt = forceBolt ? true : Math.random() < 0.70;
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
    let liveGrassTufts = [];

    function drawTaperedBarkLimb(targetCtx, ptsScreen, wStart, wEnd, barkSeed, isPrimary) {
      const steps = isPrimary ? 24 : 14;
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
        const knot = isPrimary ? 1 + Math.sin(u * 15 + barkSeed) * 0.075 : 1;
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
      grad.addColorStop(0, '#3e2742');
      grad.addColorStop(0.34, '#1e1426');
      grad.addColorStop(0.72, '#100c18');
      grad.addColorStop(1, '#281830');
      targetCtx.fillStyle = grad;
      targetCtx.fill();

      if (isPrimary && wStart > 4) {
        targetCtx.clip();
        const rng = createRng(barkSeed);
        targetCtx.lineCap = 'round';
        // Fissured dark bark channels + moonlight silver rim + warm rose canopy bounce
        for (let f = 0; f < 6; f++) {
          const offsetNorm = (f / 5 - 0.5) * 1.18;
          targetCtx.strokeStyle =
            f === 0
              ? 'rgba(196, 232, 255, 0.28)'
              : f === 5
                ? 'rgba(249, 168, 212, 0.18)'
                : 'rgba(5, 3, 10, ' + (0.48 + rng() * 0.32).toFixed(2) + ')';
          targetCtx.lineWidth = Math.max(0.8, wStart * (f === 0 ? 0.12 : 0.08));
          targetCtx.beginPath();
          for (let i = 0; i <= steps; i++) {
            const lx = leftSide[i][0] + (rightSide[i][0] - leftSide[i][0]) * (0.5 + offsetNorm * 0.45);
            const ly = leftSide[i][1] + (rightSide[i][1] - leftSide[i][1]) * (0.5 + offsetNorm * 0.45);
            const jx = (rng() - 0.5) * 1.6;
            if (i === 0) targetCtx.moveTo(lx + jx, ly);
            else targetCtx.lineTo(lx + jx, ly);
          }
          targetCtx.stroke();
        }
        // Subtle ancient cliff lichen / moss flecks on moon-facing lower bark
        for (let m = 0; m < 8; m++) {
          const idx = Math.floor(rng() * (steps * 0.65));
          const mx = leftSide[idx][0] + (rightSide[idx][0] - leftSide[idx][0]) * (0.12 + rng() * 0.35);
          const my = leftSide[idx][1] + (rightSide[idx][1] - leftSide[idx][1]) * (0.12 + rng() * 0.35);
          targetCtx.fillStyle = 'rgba(116, 178, 168, ' + (0.12 + rng() * 0.14).toFixed(2) + ')';
          targetCtx.beginPath();
          targetCtx.ellipse(mx, my, 1.5 + rng() * 2.5, 1.0 + rng() * 1.6, rng() * Math.PI, 0, Math.PI * 2);
          targetCtx.fill();
        }
      }
      targetCtx.restore();
    }

    function bakeAllMatteLayers() {
      const bw = Math.max(320, Math.round(W * DPR));
      const bh = Math.max(480, Math.round(H * DPR));
      const horizonY = H * 0.54;
      const isNarrow = W < 640;
      const moonX = W * (isNarrow ? 0.22 : 0.185);
      const moonY = H * (isNarrow ? 0.13 : 0.145);

      // 1. Night Sky + Detailed Milky Way Nebula + Micro-Star Dust + Airglow
      bakedSkyCanvas.width = bw;
      bakedSkyCanvas.height = bh;
      const sc = bakedSkyCanvas.getContext('2d');
      sc.setTransform(DPR, 0, 0, DPR, 0, 0);

      const skyGrad = sc.createLinearGradient(0, 0, 0, horizonY + 30);
      skyGrad.addColorStop(0, '#01040d');
      skyGrad.addColorStop(0.24, '#051025');
      skyGrad.addColorStop(0.56, '#0d2247');
      skyGrad.addColorStop(0.84, '#193b6b');
      skyGrad.addColorStop(1, '#265084');
      sc.fillStyle = skyGrad;
      sc.fillRect(0, 0, W, H);

      // Moon Mie Scattering Halo in Sky
      const skyMoonScatter = sc.createRadialGradient(moonX, moonY, 12, moonX, moonY, Math.max(W, H) * 0.54);
      skyMoonScatter.addColorStop(0, 'rgba(196, 234, 255, 0.26)');
      skyMoonScatter.addColorStop(0.32, 'rgba(125, 185, 245, 0.11)');
      skyMoonScatter.addColorStop(0.68, 'rgba(56, 110, 190, 0.035)');
      skyMoonScatter.addColorStop(1, 'rgba(0,0,0,0)');
      sc.fillStyle = skyMoonScatter;
      sc.fillRect(0, 0, W, horizonY + 40);

      // Multi-layered Milky Way Galaxy Band + Micro-Star Cluster Stippling
      const mwRng = createRng(13579);
      sc.save();
      sc.translate(W * 0.60, H * 0.21);
      sc.rotate(-0.34);
      sc.scale(1.65, 0.44);
      const mwGrad = sc.createRadialGradient(0, 0, 10, 0, 0, W * 0.46);
      mwGrad.addColorStop(0, 'rgba(206, 224, 255, 0.10)');
      mwGrad.addColorStop(0.35, 'rgba(164, 184, 242, 0.055)');
      mwGrad.addColorStop(0.68, 'rgba(224, 182, 238, 0.028)');
      mwGrad.addColorStop(1, 'rgba(0,0,0,0)');
      sc.fillStyle = mwGrad;
      sc.beginPath();
      sc.arc(0, 0, W * 0.46, 0, Math.PI * 2);
      sc.fill();
      sc.restore();

      // Baked subtle micro-starfield dust (240 pinpoint background stars at zero runtime cost!)
      for (let i = 0; i < 240; i++) {
        const sx = mwRng() * W;
        const sy = mwRng() * horizonY * 0.92;
        const alpha = 0.12 + mwRng() * 0.34;
        const rad = 0.35 + mwRng() * 0.55;
        sc.fillStyle = i % 5 === 0
          ? 'rgba(255, 236, 200, ' + alpha.toFixed(2) + ')'
          : 'rgba(218, 236, 255, ' + alpha.toFixed(2) + ')';
        sc.beginPath();
        sc.arc(sx, sy, rad, 0, Math.PI * 2);
        sc.fill();
      }

      // Subtle Teal-Silver Horizon Airglow
      const horHaze = sc.createLinearGradient(0, horizonY - H * 0.15, 0, horizonY + 26);
      horHaze.addColorStop(0, 'rgba(147, 197, 253, 0)');
      horHaze.addColorStop(0.72, 'rgba(165, 224, 252, 0.16)');
      horHaze.addColorStop(0.88, 'rgba(196, 234, 255, 0.22)');
      horHaze.addColorStop(1, 'rgba(147, 197, 253, 0.05)');
      sc.fillStyle = horHaze;
      sc.fillRect(0, horizonY - H * 0.15, W, H * 0.19);

      // 2. 3-Layer Fractal Mountain Ranges with Moonlit Slopes
      bakedMountainsCanvas.width = bw;
      bakedMountainsCanvas.height = bh;
      const mc = bakedMountainsCanvas.getContext('2d');
      mc.setTransform(DPR, 0, 0, DPR, 0, 0);

      const mRanges = [
        { seed: 3101, startX: 0.15, peakH: 0.36, freq: 5.5, topCol: 'rgba(14, 30, 58, 0.72)', botCol: 'rgba(38, 78, 126, 0.24)', rim: 'rgba(186, 230, 253, 0.18)' },
        { seed: 5209, startX: 0.29, peakH: 0.43, freq: 6.8, topCol: 'rgba(9, 21, 44, 0.88)', botCol: 'rgba(26, 58, 98, 0.36)', rim: 'rgba(196, 234, 255, 0.24)' },
        { seed: 7417, startX: 0.49, peakH: 0.31, freq: 8.4, topCol: 'rgba(5, 13, 29, 0.96)', botCol: 'rgba(15, 36, 66, 0.55)', rim: 'rgba(147, 210, 252, 0.20)' }
      ];

      mRanges.forEach(function (rg) {
        const nFn = createNoise1D(rg.seed, 256);
        const pts = [];
        const segs = 124;
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
        mc.lineWidth = 1.25;
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

      // 3. Geological Cliff with Rock Strata, Fissures & Seed Live Swaying Grass
      bakedCliffCanvas.width = bw;
      bakedCliffCanvas.height = bh;
      const cc = bakedCliffCanvas.getContext('2d');
      cc.setTransform(DPR, 0, 0, DPR, 0, 0);

      const leftEdge = isNarrow ? 0.13 : 0.28;
      const cliffNoise = createNoise1D(8831, 128);
      const rimPts = [];
      for (let i = 0; i <= 42; i++) {
        const u = i / 42;
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
      cliffBaseG.addColorStop(0, '#1f3d59');
      cliffBaseG.addColorStop(0.24, '#11243a');
      cliffBaseG.addColorStop(0.54, '#071222');
      cliffBaseG.addColorStop(1, '#02060e');
      cc.fillStyle = cliffBaseG;
      cc.fill();

      cc.save();
      cc.clip();

      const rRng = createRng(44921);
      for (let f = 0; f < 38; f++) {
        const fx = W * (leftEdge - 0.02 + rRng() * 0.85);
        const fy = H * (0.53 + rRng() * 0.48);
        const fw = W * (0.04 + rRng() * 0.14);
        const fh = H * (0.03 + rRng() * 0.12);
        const isLitFace = fx < W * (leftEdge + 0.22) && rRng() > 0.42;
        cc.fillStyle = isLitFace
          ? 'rgba(92, 162, 210, ' + (0.07 + rRng() * 0.11).toFixed(3) + ')'
          : 'rgba(2, 7, 16, ' + (0.28 + rRng() * 0.42).toFixed(3) + ')';
        cc.beginPath();
        cc.moveTo(fx, fy);
        cc.lineTo(fx + fw * (0.6 + rRng() * 0.4), fy - fh * 0.25);
        cc.lineTo(fx + fw, fy + fh * 0.75);
        cc.lineTo(fx + fw * 0.2, fy + fh);
        cc.closePath();
        cc.fill();
      }

      cc.strokeStyle = 'rgba(2, 6, 14, 0.75)';
      for (let k = 0; k < 26; k++) {
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
      textShadowG.addColorStop(0, 'rgba(6, 15, 30, 0.34)');
      textShadowG.addColorStop(0.45, 'rgba(3, 9, 20, 0.82)');
      textShadowG.addColorStop(1, 'rgba(2, 5, 13, 0.96)');
      cc.fillStyle = textShadowG;
      cc.fillRect(W * (isNarrow ? 0.08 : 0.33), H * 0.54, W * 0.92, H * 0.48);

      const seaBounce = cc.createRadialGradient(W * (leftEdge + 0.04), H * 0.65, 6, W * (leftEdge + 0.04), H * 0.68, W * 0.16);
      seaBounce.addColorStop(0, 'rgba(126, 222, 246, 0.28)');
      seaBounce.addColorStop(0.5, 'rgba(56, 152, 204, 0.10)');
      seaBounce.addColorStop(1, 'rgba(0,0,0,0)');
      cc.fillStyle = seaBounce;
      cc.fillRect(W * leftEdge, H * 0.52, W * 0.32, H * 0.46);

      const rootX = W * (isNarrow ? 0.54 : 0.495);
      const rootY = H * 0.533;
      const treeBounce = cc.createRadialGradient(rootX, rootY, 6, rootX, rootY + H * 0.025, W * 0.24);
      treeBounce.addColorStop(0, 'rgba(253, 186, 210, 0.32)');
      treeBounce.addColorStop(0.48, 'rgba(253, 224, 71, 0.11)');
      treeBounce.addColorStop(1, 'rgba(0,0,0,0)');
      cc.fillStyle = treeBounce;
      cc.fillRect(W * leftEdge, H * 0.49, W * 0.55, H * 0.26);
      cc.restore();

      // Damp Moonlit Rim Highlight on Cliff Edge
      cc.save();
      cc.strokeStyle = 'rgba(216, 240, 255, 0.62)';
      cc.lineWidth = 2.1;
      cc.beginPath();
      for (let i = 0; i < rimPts.length; i++) {
        if (i === 0) cc.moveTo(rimPts[i][0], rimPts[i][1]);
        else cc.lineTo(rimPts[i][0], rimPts[i][1]);
      }
      cc.stroke();
      cc.restore();

      // Seed real-time animated wind-swaying mountain grass tufts along cliff rim
      const grassRng = createRng(99104);
      liveGrassTufts = [];
      for (let i = 0; i < 42; i++) {
        const idx = Math.floor(2 + grassRng() * (rimPts.length - 6));
        const gp = rimPts[idx];
        const gx = gp[0] + (grassRng() - 0.5) * 18;
        const gy = gp[1] + 2;
        const blades = [];
        const cnt = 3 + Math.floor(grassRng() * 3);
        for (let b = 0; b < cnt; b++) {
          blades.push({
            h: 6 + grassRng() * 14,
            lean: -(4 + grassRng() * 9),
            w: 1.0 + grassRng() * 0.75,
            lit: b === 0
          });
        }
        liveGrassTufts.push({ x: gx, y: gy, ph: grassRng() * Math.PI * 2, blades: blades });
      }

      // 4. Baked 5-Level Botanical Ancient Peach Tree Wood
      bakedTreeWoodCanvas.width = bw;
      bakedTreeWoodCanvas.height = bh;
      const tc = bakedTreeWoodCanvas.getContext('2d');
      tc.setTransform(DPR, 0, 0, DPR, 0, 0);

      const S = Math.min(W * (isNarrow ? 0.64 : 0.46), H * (isNarrow ? 0.42 : 0.52));
      const toScreen = function (pt) { return [rootX + pt[0] * S, rootY + pt[1] * S]; };

      const aoGrad = tc.createRadialGradient(rootX + 0.02 * S, rootY + 3, 4, rootX + 0.02 * S, rootY + 5, S * 0.30);
      aoGrad.addColorStop(0, 'rgba(2, 6, 14, 0.95)');
      aoGrad.addColorStop(0.55, 'rgba(4, 10, 22, 0.56)');
      aoGrad.addColorStop(1, 'rgba(4, 10, 22, 0)');
      tc.save();
      tc.translate(rootX + 0.02 * S, rootY + 3);
      tc.scale(1, 0.22);
      tc.fillStyle = aoGrad;
      tc.beginPath();
      tc.arc(0, 0, S * 0.30, 0, Math.PI * 2);
      tc.fill();
      tc.restore();

      cliffRoots.forEach(function (rt, idx) {
        drawTaperedBarkLimb(tc, rt.map(toScreen), S * 0.028, S * 0.004, 300 + idx * 17, true);
      });
      drawTaperedBarkLimb(tc, trunkCurve.map(toScreen), S * 0.084, S * 0.029, 101, true);
      primaryBoughs.forEach(function (br, idx) {
        drawTaperedBarkLimb(tc, br.pts.map(toScreen), S * br.w0, S * br.w1, 200 + idx * 29, true);
      });
      secondaryTwigs.forEach(function (sb, idx) {
        drawTaperedBarkLimb(tc, sb.pts.map(toScreen), S * sb.w0, S * sb.w1, 400 + idx * 19, false);
      });
      fineTwigs.forEach(function (ft, idx) {
        drawTaperedBarkLimb(tc, ft.pts.map(toScreen), S * ft.w0, S * ft.w1, 600 + idx, false);
      });

      // Mossy cliff earth collar anchoring trunk base cleanly into rock
      tc.save();
      tc.beginPath();
      tc.moveTo(rootX - 0.17 * S, rootY + 7);
      tc.quadraticCurveTo(rootX - 0.01 * S, rootY - 0.024 * S, rootX + 0.19 * S, rootY + 7);
      tc.closePath();
      const collarG = tc.createLinearGradient(0, rootY - 0.024 * S, 0, rootY + 8);
      collarG.addColorStop(0, '#183346');
      collarG.addColorStop(0.6, '#0c1a2a');
      collarG.addColorStop(1, '#060f1d');
      tc.fillStyle = collarG;
      tc.fill();
      tc.restore();
    }

    // --------------------------------------------------------------------------
    // D. DYNAMIC REAL-TIME CINEMA ELEMENTS
    // --------------------------------------------------------------------------
    const stars = Array.from({ length: 140 }, function (_, i) {
      const tempRoll = Math.random();
      const rgb = tempRoll < 0.26 ? '196, 226, 255' : tempRoll < 0.78 ? '245, 250, 255' : '255, 236, 198';
      return {
        x: Math.random(),
        y: Math.random() * 0.48,
        r: (i < 12 ? 1.4 : 0.45) + Math.random() * (i < 12 ? 0.75 : 0.95),
        hero: i < 12,
        rgb: rgb,
        tw: 1.1 + Math.random() * 2.8,
        ph: Math.random() * Math.PI * 2
      };
    });

    const shootingStars = [
      { active: false, x: 0.78, y: 0.08, vx: -0.26, vy: 0.13, life: 0, maxLife: 1.45, nextAt: 1.5, tint: '254, 243, 199' },
      { active: false, x: 0.92, y: 0.15, vx: -0.30, vy: 0.15, life: 0, maxLife: 1.30, nextAt: 5.0, tint: '224, 242, 254' },
      { active: false, x: 0.62, y: 0.06, vx: -0.24, vy: 0.12, life: 0, maxLife: 1.55, nextAt: 8.8, tint: '251, 207, 232' },
      { active: false, x: 0.86, y: 0.22, vx: -0.28, vy: 0.14, life: 0, maxLife: 1.35, nextAt: 12.4, tint: '255, 251, 235' }
    ];

    const oceanWaveRows = Array.from({ length: 46 }, function (_, i) {
      const d = Math.pow(i / 45, 1.52);
      return { depth: d, phase: Math.random() * Math.PI * 2, speed: 0.85 + d * 1.45, amp: 1.0 + d * 3.8, freq: 22 - d * 14 };
    });

    const fresnelGlints = Array.from({ length: 150 }, function () {
      const d = Math.random();
      return { depth: d, spread: (Math.random() - 0.5) * 2, len: 6 + d * 44 + Math.random() * 14, speed: 1.4 + Math.random() * 2.4, ph: Math.random() * Math.PI * 2, warm: Math.random() < 0.28 };
    });

    const silverCranes = [
      { x: 0.76, y: 0.18, vx: -0.020, vy: -0.0018, scale: 1.10, wingSpd: 3.0, ph: 0.0, trail: [] },
      { x: 0.92, y: 0.13, vx: -0.016, vy: -0.0012, scale: 0.78, wingSpd: 3.4, ph: 2.2, trail: [] },
      { x: 0.44, y: 0.25, vx: -0.023, vy: -0.0015, scale: 0.62, wingSpd: 3.7, ph: 4.1, trail: [] }
    ];

    // Mid-ground sharp 3D tumbling petals
    const tumblingPetals = Array.from({ length: 42 }, function (_, i) {
      return {
        x: 0.14 + (i / 42) * 0.62,
        y: 0.16 + Math.random() * 0.44,
        vx: -(0.012 + Math.random() * 0.018),
        vy: 0.011 + Math.random() * 0.018,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 1.9,
        flipPh: Math.random() * Math.PI * 2,
        flipSpd: 2.2 + Math.random() * 2.8,
        sz: 2.8 + Math.random() * 2.6,
        ph: Math.random() * Math.PI * 2
      };
    });

    // Foreground cinematic out-of-focus bokeh petals (shallow depth-of-field!)
    const bokehPetals = Array.from({ length: 10 }, function (_, i) {
      return {
        x: (i / 10) * 1.1,
        y: 0.18 + Math.random() * 0.65,
        vx: -(0.022 + Math.random() * 0.026),
        vy: 0.014 + Math.random() * 0.020,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 1.2,
        scale: 0.65 + Math.random() * 0.85,
        alpha: 0.26 + Math.random() * 0.26,
        ph: Math.random() * Math.PI * 2
      };
    });

    // Warm spirit fireflies & rising Qi embers around the ancient peach tree
    const spiritFireflies = Array.from({ length: 24 }, function (_, i) {
      return {
        x: 0.24 + Math.random() * 0.46,
        y: 0.28 + Math.random() * 0.34,
        vy: 0.008 + Math.random() * 0.014,
        r: 1.1 + Math.random() * 1.6,
        ph: Math.random() * Math.PI * 2,
        rose: i % 2 === 0
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
        alpha: 0.19 + Math.random() * 0.14,
        bobAmp: 5 + Math.random() * 6,
        bobSpd: 0.20 + Math.random() * 0.18,
        ph: Math.random() * Math.PI * 2,
        sprite: i % 3 === 0 ? assets.mistCloud : assets.mistWisp
      };
    });

    const chillCrystals = Array.from({ length: 30 }, function () {
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
      DPR = Math.min(global.devicePixelRatio || 1, 2);
      W = Math.max(320, Math.round(rect.width || stage.clientWidth || global.innerWidth || 1280));
      H = Math.max(480, Math.round(rect.height || stage.clientHeight || global.innerHeight || 720));
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
    // E. CINEMATIC RENDER HELPERS (GOD RAYS, CLOUDS, LIGHTNING, OCEAN + SURF, MIST)
    // --------------------------------------------------------------------------
    function drawVolumetricGodRays(moonX, moonY, t) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const rays = [
        { ang: 0.62, spread: 0.14, len: 0.88, alpha: 0.048, ph: 0.2 },
        { ang: 0.88, spread: 0.18, len: 0.96, alpha: 0.056, ph: 1.6 },
        { ang: 1.18, spread: 0.13, len: 0.82, alpha: 0.042, ph: 3.1 },
        { ang: 1.46, spread: 0.11, len: 0.74, alpha: 0.036, ph: 4.5 }
      ];
      const maxDim = Math.max(W, H);
      for (let i = 0; i < rays.length; i++) {
        const r = rays[i];
        const pulse = 0.68 + 0.32 * Math.sin(t * 0.35 + r.ph);
        const a = r.alpha * pulse;
        const dist = maxDim * r.len;
        const a1 = r.ang - r.spread * 0.5 + Math.sin(t * 0.18 + r.ph) * 0.015;
        const a2 = r.ang + r.spread * 0.5 + Math.sin(t * 0.18 + r.ph) * 0.015;
        const g = ctx.createLinearGradient(
          moonX, moonY,
          moonX + Math.cos(r.ang) * dist, moonY + Math.sin(r.ang) * dist
        );
        g.addColorStop(0, 'rgba(224, 244, 255, ' + (a * 1.4).toFixed(3) + ')');
        g.addColorStop(0.45, 'rgba(186, 226, 255, ' + (a * 0.65).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(147, 197, 253, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(moonX, moonY);
        ctx.lineTo(moonX + Math.cos(a1) * dist, moonY + Math.sin(a1) * dist);
        ctx.lineTo(moonX + Math.cos(a2) * dist, moonY + Math.sin(a2) * dist);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

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
            ctx.globalAlpha = Math.min(0.96, flashAmt * proximity * (cl.layer === 'storm' ? 1.18 : 0.72));
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
      const bloomR = Math.max(W, H) * 0.36;
      const bg = ctx.createRadialGradient(sx, sy, 6, sx, sy, bloomR);
      bg.addColorStop(0, 'rgba(224, 244, 255, ' + (0.58 * flashAmt).toFixed(3) + ')');
      bg.addColorStop(0.32, 'rgba(147, 197, 253, ' + (0.28 * flashAmt).toFixed(3) + ')');
      bg.addColorStop(0.68, 'rgba(129, 140, 248, ' + (0.10 * flashAmt).toFixed(3) + ')');
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
        ctx.strokeStyle = 'rgba(129, 162, 255, ' + (0.32 * ba).toFixed(3) + ')';
        ctx.lineWidth = bolt.width * 7.4;
        tracePath();

        ctx.strokeStyle = 'rgba(186, 230, 253, ' + (0.68 * ba).toFixed(3) + ')';
        ctx.lineWidth = bolt.width * 2.7;
        tracePath();

        ctx.strokeStyle = 'rgba(255, 255, 255, ' + (0.98 * ba).toFixed(3) + ')';
        ctx.lineWidth = Math.max(0.7, bolt.width * 0.95);
        tracePath();
      }
      ctx.restore();
    }

    function drawPerspectiveOcean(t, horizonY, moonX, pxShift, flashAmt, flashX, isNarrow) {
      const seaH = H - horizonY;
      const seaGrad = ctx.createLinearGradient(0, horizonY, 0, H);
      seaGrad.addColorStop(0, '#1f4476');
      seaGrad.addColorStop(0.22, '#132d55');
      seaGrad.addColorStop(0.62, '#081730');
      seaGrad.addColorStop(1, '#020714');
      ctx.fillStyle = seaGrad;
      ctx.fillRect(0, horizonY, W, seaH);

      // Moonlit Luminance Path
      const reflectCenter = moonX * 0.90 + pxShift * 0.4;
      const poolG = ctx.createRadialGradient(
        reflectCenter, horizonY + seaH * 0.28, 10,
        reflectCenter, horizonY + seaH * 0.46, Math.max(W * 0.25, 190)
      );
      poolG.addColorStop(0, 'rgba(232, 242, 255, 0.38)');
      poolG.addColorStop(0.42, 'rgba(176, 212, 252, 0.17)');
      poolG.addColorStop(1, 'rgba(12, 30, 62, 0)');
      ctx.fillStyle = poolG;
      ctx.fillRect(0, horizonY, W * 0.62, seaH);

      // Subtle Pink Peach-Blossom Reflection Shimmering on Left Sea
      const pinkWaterG = ctx.createRadialGradient(
        W * 0.24, horizonY + seaH * 0.20, 8,
        W * 0.24, horizonY + seaH * 0.34, Math.max(W * 0.18, 120)
      );
      pinkWaterG.addColorStop(0, 'rgba(249, 168, 212, ' + (0.14 * bloomCurrent).toFixed(3) + ')');
      pinkWaterG.addColorStop(0.55, 'rgba(244, 114, 182, ' + (0.05 * bloomCurrent).toFixed(3) + ')');
      pinkWaterG.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = pinkWaterG;
      ctx.fillRect(0, horizonY, W * 0.48, seaH);

      if (flashAmt > 0.02) {
        const lx = flashX * W + pxShift * 0.5;
        const stormPool = ctx.createRadialGradient(
          lx, horizonY + seaH * 0.14, 12,
          lx, horizonY + seaH * 0.36, Math.max(W * 0.38, 260)
        );
        stormPool.addColorStop(0, 'rgba(224, 244, 255, ' + (0.48 * flashAmt).toFixed(3) + ')');
        stormPool.addColorStop(0.38, 'rgba(147, 197, 253, ' + (0.24 * flashAmt).toFixed(3) + ')');
        stormPool.addColorStop(1, 'rgba(56, 110, 210, 0)');
        ctx.fillStyle = stormPool;
        ctx.fillRect(0, horizonY, W, seaH);
      }

      // Perspective Ocean Swells
      ctx.save();
      for (let i = 0; i < oceanWaveRows.length; i++) {
        const row = oceanWaveRows[i];
        const py = horizonY + 4 + row.depth * (seaH - 8);
        const alpha = 0.05 + row.depth * 0.15;
        ctx.strokeStyle = i % 2 === 0
          ? 'rgba(192, 228, 255, ' + alpha.toFixed(3) + ')'
          : 'rgba(2, 9, 22, ' + (alpha * 1.48).toFixed(3) + ')';
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

      // Fresnel Specular Moonlight Ripples
      for (let i = 0; i < fresnelGlints.length; i++) {
        const g = fresnelGlints[i];
        const py = horizonY + 6 + Math.pow(g.depth, 1.40) * (seaH - 12);
        const halfSpan = (0.032 + g.depth * 0.135) * W;
        const sway = Math.sin(t * g.speed + g.ph) * (4 + g.depth * 13);
        const px = reflectCenter + g.spread * halfSpan + sway;
        const fade = Math.max(0.10, 1 - Math.abs(g.spread) * 0.86);
        const sparkle = 0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(t * g.speed * 1.25 + g.ph), 2);
        const alpha = (0.14 + 0.66 * sparkle) * fade;
        const thick = 0.9 + g.depth * 1.8;

        ctx.fillStyle = g.warm
          ? 'rgba(255, 240, 248, ' + alpha.toFixed(2) + ')'
          : 'rgba(228, 244, 255, ' + Math.min(0.98, alpha + flashAmt * 0.28).toFixed(2) + ')';
        ctx.fillRect(px - g.len / 2, py, g.len, thick);
      }

      // Soft Animated Shoreline Surf & Sea Foam Breathing Against Cliff Base
      const cliffShoreX = W * (isNarrow ? 0.14 : 0.29) + pxShift;
      ctx.save();
      for (let s = 0; s < 5; s++) {
        const surge = 0.5 + 0.5 * Math.sin(t * (0.95 + s * 0.14) + s * 1.4);
        const sy = H * (0.66 + s * 0.075);
        const sw = (26 + s * 10) * (0.75 + surge * 0.45);
        const sh = 6 + s * 2.2;
        const fg = ctx.createRadialGradient(cliffShoreX - sw * 0.2, sy, 2, cliffShoreX - sw * 0.2, sy, sw);
        fg.addColorStop(0, 'rgba(226, 246, 255, ' + (0.28 * surge).toFixed(3) + ')');
        fg.addColorStop(0.55, 'rgba(165, 224, 248, ' + (0.12 * surge).toFixed(3) + ')');
        fg.addColorStop(1, 'rgba(125, 211, 252, 0)');
        ctx.save();
        ctx.translate(cliffShoreX - sw * 0.2, sy);
        ctx.scale(1, sh / Math.max(1, sw));
        ctx.fillStyle = fg;
        ctx.beginPath();
        ctx.arc(0, 0, sw, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }

    function drawColdMistLayer(list, t, dt, dimRightSide) {
      for (let i = 0; i < list.length; i++) {
        const m = list[i];
        m.x += m.vx * dt;
        if (m.x > 1.38) m.x = -0.38;
        const edgeNorm = (m.x + 0.38) / 1.76;
        const edgeFade = Math.min(1, Math.sin(Math.max(0, Math.min(1, edgeNorm)) * Math.PI) * 2.2);
        const breath = 0.86 + 0.14 * Math.sin(t * m.bobSpd + m.ph);
        const textGuard = dimRightSide && m.x > 0.46 ? 0.48 : 1.0;
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
    // F. MAIN 60/120FPS CINEMA RENDER LOOP
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
      const windGust = Math.sin(t * 0.85) * 0.65 + Math.sin(t * 1.62) * 0.35;

      // 1. Baked Night Sky, Milky Way & Micro-Stars
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

      // 2. Twinkling Multi-Temperature Stars + Diffraction Spikes
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const tw = 0.22 + 0.78 * (0.5 + 0.5 * Math.sin(t * s.tw + s.ph));
        const sx = s.x * W - ptrX * 4;
        const sy = s.y * H - ptrY * 3;
        ctx.fillStyle = 'rgba(' + s.rgb + ',' + tw.toFixed(2) + ')';
        ctx.beginPath();
        ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
        ctx.fill();

        if (s.hero && tw > 0.52) {
          const spk = s.r * (4.4 + tw * 2.6);
          ctx.strokeStyle = 'rgba(' + s.rgb + ',' + (tw * 0.44).toFixed(2) + ')';
          ctx.lineWidth = 0.72;
          ctx.beginPath();
          ctx.moveTo(sx - spk, sy);
          ctx.lineTo(sx + spk, sy);
          ctx.moveTo(sx, sy - spk);
          ctx.lineTo(sx, sy + spk);
          ctx.stroke();
        }
      }

      // 3. Staggered Shooting Stars (4 Trails with Luminous Starburst Head)
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
        const tx = (st.x + st.vx * Math.max(0, st.life - 0.23)) * W;
        const ty = (st.y + st.vy * Math.max(0, st.life - 0.23)) * H;

        const sg = ctx.createLinearGradient(px, py, tx, ty);
        sg.addColorStop(0, 'rgba(255,255,255,' + (0.96 * fade).toFixed(2) + ')');
        sg.addColorStop(0.35, 'rgba(' + st.tint + ',' + (0.60 * fade).toFixed(2) + ')');
        sg.addColorStop(1, 'rgba(' + st.tint + ',0)');
        ctx.strokeStyle = sg;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(tx, ty);
        ctx.stroke();

        const hg = ctx.createRadialGradient(px, py, 0.3, px, py, 6.5);
        hg.addColorStop(0, 'rgba(255,255,255,' + (0.95 * fade).toFixed(2) + ')');
        hg.addColorStop(1, 'rgba(' + st.tint + ',0)');
        ctx.fillStyle = hg;
        ctx.beginPath();
        ctx.arc(px, py, 6.5, 0, Math.PI * 2);
        ctx.fill();

        if (st.life >= st.maxLife) {
          st.active = false;
          st.nextAt = t + 5.0 + Math.random() * 7.0;
        }
      }
      ctx.restore();

      // 4. Photorealistic Crescent Moon + Volumetric Moonlight God Rays
      const moonDraw = Math.min(W, H) * (isNarrow ? 0.36 : 0.33);
      ctx.drawImage(assets.moon, moonX - moonDraw / 2, moonY - moonDraw / 2, moonDraw, moonDraw);
      drawVolumetricGodRays(moonX, moonY, t);

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
        const sc = cr.scale * Math.min(1.10, Math.max(0.64, W / 1180));

        cr.trail.push([cx + 12 * sc, cy + 2 * sc]);
        if (cr.trail.length > 24) cr.trail.shift();
        if (cr.trail.length > 2) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          for (let k = 1; k < cr.trail.length; k++) {
            ctx.strokeStyle = 'rgba(224,242,254,' + ((k / cr.trail.length) * 0.28).toFixed(3) + ')';
            ctx.lineWidth = (k / cr.trail.length) * 1.9 * sc;
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

        ctx.strokeStyle = 'rgba(186, 206, 228, 0.74)';
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

      // 7. Perspective Moonlit Ocean + Fresnel Glitter + Shoreline Surf Foam
      drawPerspectiveOcean(t, horizonY, moonX, -ptrX * 10, stormEnabled ? flashAmt : 0, flashX, isNarrow);

      // 7.5 Distant Horizon Cold Sea Mist
      drawColdMistLayer(seaMistLayers, t, dt, false);

      // 8. Foreground Geological Cliff + Live Grass + 5-Level Botanical Peach Tree
      const fgPx = -ptrX * 16;
      const fgPy = -ptrY * 7;
      ctx.save();
      ctx.translate(fgPx, fgPy);
      ctx.drawImage(bakedCliffCanvas, 0, 0, W, H);

      // Real-time wind-swaying mountain grass blades along cliff edge
      ctx.save();
      ctx.lineCap = 'round';
      for (let i = 0; i < liveGrassTufts.length; i++) {
        const gt = liveGrassTufts[i];
        const sway = (Math.sin(t * 2.1 + gt.ph) * 2.2 + windGust * 3.4);
        for (let b = 0; b < gt.blades.length; b++) {
          const bl = gt.blades[b];
          ctx.strokeStyle = bl.lit ? 'rgba(164, 214, 232, 0.50)' : 'rgba(14, 34, 48, 0.88)';
          ctx.lineWidth = bl.w;
          ctx.beginPath();
          ctx.moveTo(gt.x, gt.y);
          ctx.quadraticCurveTo(
            gt.x + (bl.lean + sway * 0.5) * 0.45,
            gt.y - bl.h * 0.65,
            gt.x + bl.lean + sway,
            gt.y - bl.h
          );
          ctx.stroke();
        }
      }
      ctx.restore();

      // Cascading cold vapor plumes pouring slowly down cliff rock
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
      const S = Math.min(W * (isNarrow ? 0.64 : 0.46), H * (isNarrow ? 0.42 : 0.52));
      const toScreen = function (pt) { return [rootX + pt[0] * S, rootY + pt[1] * S]; };
      const sizeScale = Math.min(1.12, Math.max(0.60, S / 345));

      // Luminous Canopy Backlight Aura
      const crownCx = rootX - 0.12 * S;
      const crownCy = rootY - 0.52 * S;
      const auraR = S * 0.98;
      const auraGrad = ctx.createRadialGradient(crownCx, crownCy, S * 0.08, crownCx, crownCy, auraR);
      auraGrad.addColorStop(0, 'rgba(249, 168, 212, ' + ((0.25 * bloomCurrent) + (stormEnabled ? flashAmt * 0.16 : 0)).toFixed(3) + ')');
      auraGrad.addColorStop(0.48, 'rgba(216, 180, 232, ' + ((0.11 * bloomCurrent) + (stormEnabled ? flashAmt * 0.09 : 0)).toFixed(3) + ')');
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(crownCx, crownCy, auraR, 0, Math.PI * 2);
      ctx.fill();

      // Layer 0: Deep underside occlusion foliage
      for (let i = 0; i < canopyClusters.length; i++) {
        const cl = canopyClusters[i];
        if (cl.layer !== 0) continue;
        const vis = Math.max(0, Math.min(1, (bloomCurrent - cl.order * 0.85) / 0.18));
        if (vis <= 0.01) continue;
        const pos = toScreen([cl.lx, cl.ly]);
        const swayX = (Math.sin(t * 1.05 + cl.ph) * 2.1 + windGust * 2.0) * (0.6 + Math.abs(cl.lx));
        const swayY = Math.cos(t * 0.82 + cl.ph) * 1.4;
        const sz = cl.size * sizeScale * (0.4 + 0.6 * vis);
        ctx.save();
        ctx.globalAlpha = vis;
        ctx.translate(pos[0] + swayX, pos[1] + swayY);
        ctx.rotate(cl.rot);
        ctx.drawImage(cl.sprite, -sz / 2, -sz / 2, sz, sz);
        ctx.restore();
      }

      // Baked 5-Level Botanical Wood (Fissured Bark, Lichen, Roots, Fine Twigs)
      ctx.drawImage(bakedTreeWoodCanvas, 0, 0, W, H);

      // Subsurface Spirit Qi Silk Ribbons Flowing Up Trunk & Out Every Bough
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

        if (headU > 0.34) {
          for (let ci = 0; ci < canopyClusters.length; ci++) {
            const cl = canopyClusters[ci];
            if (cl.layer > 0 && cl.parentId === qw.pathIdx && Math.abs(cl.pathU - headU) < 0.09) {
              cl.bloom = Math.min(1.16, cl.bloom + dt * 1.55);
              cl.glow = Math.min(1.0, cl.glow + dt * 2.8);
            }
          }
        }

        const pTail = ribbonPts[0];
        const pHead = ribbonPts[ribbonPts.length - 1];

        const auraRibbon = ctx.createLinearGradient(pTail[0], pTail[1], pHead[0], pHead[1]);
        auraRibbon.addColorStop(0, 'rgba(244, 114, 182, 0)');
        auraRibbon.addColorStop(0.55, 'rgba(249, 168, 212, ' + (0.30 * env).toFixed(3) + ')');
        auraRibbon.addColorStop(0.88, 'rgba(253, 224, 71, ' + (0.45 * env).toFixed(3) + ')');
        auraRibbon.addColorStop(1, 'rgba(255, 251, 235, ' + (0.58 * env).toFixed(3) + ')');
        ctx.strokeStyle = auraRibbon;
        ctx.lineWidth = Math.max(7.0, S * 0.028);
        ctx.beginPath();
        ctx.moveTo(ribbonPts[0][0], ribbonPts[0][1]);
        for (let s = 1; s < ribbonPts.length; s++) ctx.lineTo(ribbonPts[s][0], ribbonPts[s][1]);
        ctx.stroke();

        const silkRibbon = ctx.createLinearGradient(pTail[0], pTail[1], pHead[0], pHead[1]);
        silkRibbon.addColorStop(0, 'rgba(253, 186, 210, 0)');
        silkRibbon.addColorStop(0.45, 'rgba(253, 224, 71, ' + (0.46 * env).toFixed(3) + ')');
        silkRibbon.addColorStop(0.85, 'rgba(255, 248, 220, ' + (0.82 * env).toFixed(3) + ')');
        silkRibbon.addColorStop(1, 'rgba(255, 255, 255, ' + (0.96 * env).toFixed(3) + ')');
        ctx.strokeStyle = silkRibbon;
        ctx.lineWidth = Math.max(2.5, S * 0.010);
        ctx.beginPath();
        ctx.moveTo(ribbonPts[0][0], ribbonPts[0][1]);
        for (let s = 1; s < ribbonPts.length; s++) ctx.lineTo(ribbonPts[s][0], ribbonPts[s][1]);
        ctx.stroke();

        const orbR = Math.max(8.0, S * 0.036);
        const orbGrad = ctx.createRadialGradient(pHead[0], pHead[1], 0.8, pHead[0], pHead[1], orbR);
        orbGrad.addColorStop(0, 'rgba(255, 255, 255, ' + (0.95 * env).toFixed(3) + ')');
        orbGrad.addColorStop(0.35, 'rgba(254, 240, 138, ' + (0.60 * env).toFixed(3) + ')');
        orbGrad.addColorStop(0.70, 'rgba(249, 168, 212, ' + (0.26 * env).toFixed(3) + ')');
        orbGrad.addColorStop(1, 'rgba(244, 114, 182, 0)');
        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(pHead[0], pHead[1], orbR, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Canopy Layers 1–3: High-Resolution 160px Botanical Peach Blossoms
      for (let i = 0; i < canopyClusters.length; i++) {
        const cl = canopyClusters[i];
        if (cl.layer === 0) continue;

        const vis = Math.max(0, Math.min(1, (bloomCurrent - cl.order * 0.85) / 0.18));
        if (vis <= 0.01) continue;

        const baseBloom = cl.layer === 1 ? 0.89 : cl.layer === 2 ? 0.85 : 0.92;
        cl.bloom += (baseBloom - cl.bloom) * (1 - Math.exp(-dt * 1.4));
        cl.glow = Math.max(0, cl.glow - dt * 0.65);

        const pos = toScreen([cl.lx, cl.ly]);
        const windMul = 0.65 + Math.abs(cl.lx) * 0.90;
        const waveLag = Math.sin(t * 1.15 + cl.ph + cl.lx * 2.2) * 2.6;
        const swayX = (waveLag + windGust * 2.4) * windMul;
        const swayY = Math.cos(t * 0.88 + cl.ph) * 1.7;
        const px = pos[0] + swayX;
        const py = pos[1] + swayY;
        const sz = cl.size * sizeScale * cl.bloom * (0.35 + 0.65 * vis);

        ctx.save();
        ctx.globalAlpha = vis;
        ctx.translate(px, py);
        ctx.rotate(cl.rot + Math.sin(t * 0.55 + cl.ph) * 0.07);
        ctx.drawImage(cl.sprite, -sz / 2, -sz / 2, sz, sz);

        const stormCatch = stormEnabled && cl.layer >= 2 && flashAmt > 0.12 ? flashAmt * 0.36 : 0;
        if (cl.glow > 0.03 || stormCatch > 0.03) {
          ctx.globalCompositeOperation = 'lighter';
          const gRad = sz * 0.68;
          const gg = ctx.createRadialGradient(0, 0, 2, 0, 0, gRad);
          if (stormCatch > cl.glow) {
            gg.addColorStop(0, 'rgba(224, 244, 255, ' + (0.50 * stormCatch).toFixed(3) + ')');
            gg.addColorStop(0.55, 'rgba(249, 168, 212, ' + (0.25 * stormCatch).toFixed(3) + ')');
            gg.addColorStop(1, 'rgba(147, 197, 253, 0)');
          } else {
            gg.addColorStop(0, 'rgba(255, 248, 220, ' + (0.45 * cl.glow).toFixed(3) + ')');
            gg.addColorStop(0.55, 'rgba(249, 168, 212, ' + (0.24 * cl.glow).toFixed(3) + ')');
            gg.addColorStop(1, 'rgba(244, 114, 182, 0)');
          }
          ctx.fillStyle = gg;
          ctx.beginPath();
          ctx.arc(0, 0, gRad, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Warm Luminous Spirit Fireflies Rising Gently Around the Peach Tree
      if (bloomCurrent > 0.15) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < spiritFireflies.length; i++) {
          const ff = spiritFireflies[i];
          ff.y -= ff.vy * dt;
          if (ff.y < 0.16) {
            ff.y = 0.56 + Math.random() * 0.08;
            ff.x = 0.24 + Math.random() * 0.44;
          }
          const pulse = 0.30 + 0.70 * (0.5 + 0.5 * Math.sin(t * 2.6 + ff.ph));
          const px = ff.x * W + Math.sin(t * 1.1 + ff.ph) * 12;
          const py = ff.y * H;
          const rad = ff.r * (2.6 + pulse * 1.6);
          const fg = ctx.createRadialGradient(px, py, 0.3, px, py, rad);
          if (ff.rose) {
            fg.addColorStop(0, 'rgba(255, 244, 248, ' + (0.85 * pulse * bloomCurrent).toFixed(3) + ')');
            fg.addColorStop(0.45, 'rgba(251, 182, 206, ' + (0.42 * pulse * bloomCurrent).toFixed(3) + ')');
            fg.addColorStop(1, 'rgba(244, 114, 182, 0)');
          } else {
            fg.addColorStop(0, 'rgba(255, 252, 232, ' + (0.85 * pulse * bloomCurrent).toFixed(3) + ')');
            fg.addColorStop(0.45, 'rgba(253, 224, 71, ' + (0.38 * pulse * bloomCurrent).toFixed(3) + ')');
            fg.addColorStop(1, 'rgba(251, 191, 36, 0)');
          }
          ctx.fillStyle = fg;
          ctx.beginPath();
          ctx.arc(px, py, rad, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Mid-Ground Sharp 3D Tumbling Moonlit Peach Petals
      const activePetals = Math.round(tumblingPetals.length * Math.max(0.18, bloomCurrent));
      for (let i = 0; i < activePetals; i++) {
        const pt = tumblingPetals[i];
        pt.x += (pt.vx + Math.sin(t * 0.95 + pt.ph) * 0.007 + windGust * 0.004) * dt;
        pt.y += (pt.vy + Math.cos(t * 0.72 + pt.ph) * 0.005) * dt;
        pt.rot += pt.vr * dt;
        pt.flipPh += pt.flipSpd * dt;

        if (pt.x < -0.05 || pt.y > 0.94) {
          pt.x = (rootX + (-0.72 + Math.random() * 1.24) * S) / W;
          pt.y = (rootY + (-0.76 + Math.random() * 0.46) * S) / H;
        }

        const pitchScale = 0.26 + 0.74 * Math.abs(Math.cos(pt.flipPh));
        ctx.save();
        ctx.translate(pt.x * W, pt.y * H);
        ctx.rotate(pt.rot);
        ctx.scale(1, pitchScale);
        const pg = ctx.createLinearGradient(-pt.sz, 0, pt.sz, 0);
        pg.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
        pg.addColorStop(0.52, 'rgba(252, 224, 240, 0.90)');
        pg.addColorStop(1, 'rgba(244, 114, 182, 0.80)');
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.ellipse(0, 0, pt.sz, pt.sz * 0.58, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Subtle Optical Atmospheric Rim Flash during Lightning Peak
      if (stormEnabled && flashAmt > 0.08) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const rimWash = ctx.createLinearGradient(0, 0, 0, H);
        rimWash.addColorStop(0, 'rgba(206, 236, 255, ' + (0.09 * flashAmt).toFixed(3) + ')');
        rimWash.addColorStop(0.55, 'rgba(186, 230, 253, ' + (0.05 * flashAmt).toFixed(3) + ')');
        rimWash.addColorStop(1, 'rgba(147, 197, 253, 0)');
        ctx.fillStyle = rimWash;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      ctx.restore();

      // 9. Foreground Translucent Icy Frost Veil, Frost Crystals & Out-of-Focus Bokeh Petals
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

      // Shallow Depth-of-Field Foreground Bokeh Petals drifting gently across camera lens
      if (bloomCurrent > 0.25) {
        const bkCount = Math.round(bokehPetals.length * bloomCurrent);
        for (let i = 0; i < bkCount; i++) {
          const bp = bokehPetals[i];
          bp.x += (bp.vx + windGust * 0.006) * dt;
          bp.y += (bp.vy + Math.sin(t * 0.8 + bp.ph) * 0.005) * dt;
          bp.rot += bp.vr * dt;
          if (bp.x < -0.10 || bp.y > 1.08) {
            bp.x = 0.55 + Math.random() * 0.55;
            bp.y = -0.06 + Math.random() * 0.35;
          }
          const bw = 38 * bp.scale;
          const bh = 26 * bp.scale;
          ctx.save();
          ctx.globalAlpha = bp.alpha * bloomCurrent;
          ctx.translate(bp.x * W - ptrX * 26, bp.y * H - ptrY * 12);
          ctx.rotate(bp.rot);
          ctx.drawImage(assets.bokehPetal, -bw / 2, -bh / 2, bw, bh);
          ctx.restore();
        }
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
    version: '2027.21-masterpiece-cinema',
    mount: mount
  };
})(typeof window !== 'undefined' ? window : globalThis);
