/**
 * ============================================================================
 * rjcloud.organ 2.0 — Celestial Peach Blossom & AI Hologram Hero Engine
 * ไฟล์ที่ 1/2 (hero-peach-engine.js • Zero-Build Standalone Module)
 * เผยแพร่ผ่าน window.RJCLOUD_HERO_PEACH สำหรับใช้งานคู่กับ index.html
 *
 * ความสามารถครบชุดภายในโมดูล:
 * 1. จันทราหยกทองเอียงซ้ายเหนือเรือนยอด + วงแหวนแสงคู่ + ลำแสงสวรรค์สาดทแยง
 * 2. ทิวเขาหมึกจีน 4 ระยะ (Shan-Shui) สลับร่างเป็น AI Hologram อัลต้าสมูท
 *    ผสานทะเลหมอกเย็นฟุ้งเนื้อละเอียด Procedural 4-Octave fBm ไร้เส้นขอบ
 * 3. เอฟเฟกต์ที่คัดเลือกครบ 4 รายการ (1, 2, 3, 6):
 *    - ข้อ 1: โคมลอยอธิษฐานสีทองอุ่นลอยแทรกระหว่างทิวเขากับม่านหมอกเย็น
 *    - ข้อ 2: นกกระเรียนแสง 3 ตัวโบยบินโค้งผ่านดวงจันทราพร้อมละอองแสงหยก
 *    - ข้อ 3: ผิวน้ำทะเลสาบกระจกสะท้อนแสงจันทร์-ดอกท้อ-AI Hologram + วงคลื่นกลีบดอกท้อ
 *    - ข้อ 6: ระลอกสายลมโปรยฝนกลีบดอกท้อและใบหยกทุก ~13.5 วินาที
 * 4. แสงปราณแอมเบียนไหลช้าอัลต้าสมูท (13.2–16.0 วิ) จากกรอบกระจกซ้าย–ขวาขึ้นสู่ 12 กิ่ง
 *    ปลุกช่อดอกท้อ 5 กลีบ 185+ ช่อให้ผลิบานสะสมจนเต็มพุ่ม โดยไม่บังกรอบกระจก 100%
 * 5. ออกแบบให้ลื่นไหล 60fps บนมือถือ: คุม DPR ≤ 1.5, หยุดวาดเมื่อพ้นจอ (IntersectionObserver)
 *    และแยกการแตะ (Tap) ออกจากจังหวะไถนิ้วเลื่อนหน้าจอ (Scroll)
 * ============================================================================
 */
(function (global) {
  'use strict';

  // พิกัดใบท้อสีหยก 16 ใบสำหรับแซมตามกิ่งบน SVG ต้นดอกท้อ (viewBox 0 0 640 420)
  const JADE_LEAVES = [
    { cx: 112, cy: 220, rx: 11, ry: 4.5, rot: -22 },
    { cx: 184, cy: 212, rx: 10, ry: 4.0, rot: -10 },
    { cx: 92,  cy: 176, rx: 11, ry: 4.4, rot: 12 },
    { cx: 168, cy: 172, rx: 10, ry: 4.0, rot: 18 },
    { cx: 140, cy: 132, rx: 10, ry: 4.2, rot: 28 },
    { cx: 212, cy: 118, rx: 9.5, ry: 4.0, rot: 36 },
    { cx: 188, cy: 84,  rx: 9.5, ry: 4.0, rot: 46 },
    { cx: 254, cy: 64,  rx: 9.0, ry: 3.8, rot: 58 },
    { cx: 528, cy: 220, rx: 11, ry: 4.5, rot: 22 },
    { cx: 456, cy: 212, rx: 10, ry: 4.0, rot: 10 },
    { cx: 548, cy: 176, rx: 11, ry: 4.4, rot: -12 },
    { cx: 472, cy: 172, rx: 10, ry: 4.0, rot: -18 },
    { cx: 500, cy: 132, rx: 10, ry: 4.2, rot: -28 },
    { cx: 428, cy: 118, rx: 9.5, ry: 4.0, rot: -36 },
    { cx: 452, cy: 84,  rx: 9.5, ry: 4.0, rot: -46 },
    { cx: 386, cy: 64,  rx: 9.0, ry: 3.8, rot: -58 }
  ];

  // ============================================================================
  // 1. PROCEDURAL NOISE & MATH HELPERS
  // ============================================================================
  function hash2D(ix, iy) {
    const n = Math.sin(ix * 127.1 + iy * 311.7) * 43758.5453123;
    return n - Math.floor(n);
  }

  function valueNoise2D(x, y) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);
    const a = hash2D(ix, iy);
    const b = hash2D(ix + 1, iy);
    const c = hash2D(ix, iy + 1);
    const d = hash2D(ix + 1, iy + 1);
    return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
  }

  function fbm4(x, y) {
    let v = 0;
    let amp = 0.5;
    let freq = 1;
    for (let i = 0; i < 4; i++) {
      v += amp * valueNoise2D(x * freq, y * freq);
      freq *= 2.04;
      amp *= 0.5;
    }
    return v;
  }

  function ridged1D(x, seed) {
    let sum = 0;
    let amp = 0.55;
    let freq = 1;
    for (let i = 0; i < 4; i++) {
      const n = valueNoise2D(x * freq + seed * 3.1, seed * 1.7 + i * 2.3);
      const r = 1 - Math.abs(n * 2 - 1);
      sum += r * r * amp;
      freq *= 2.15;
      amp *= 0.48;
    }
    return sum;
  }

  function smoothstep(e0, e1, x) {
    const t = Math.max(0, Math.min(1, (x - e0) / Math.max(0.0001, e1 - e0)));
    return t * t * (3 - 2 * t);
  }

  function hash3D(x, y, z) {
    const n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453123;
    return n - Math.floor(n);
  }

  function noise3D(x, y, z) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const iz = Math.floor(z);
    const fx = x - ix;
    const fy = y - iy;
    const fz = z - iz;
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);
    const uz = fz * fz * (3 - 2 * fz);

    const n000 = hash3D(ix, iy, iz);
    const n100 = hash3D(ix + 1, iy, iz);
    const n010 = hash3D(ix, iy + 1, iz);
    const n110 = hash3D(ix + 1, iy + 1, iz);
    const n001 = hash3D(ix, iy, iz + 1);
    const n101 = hash3D(ix + 1, iy, iz + 1);
    const n011 = hash3D(ix, iy + 1, iz + 1);
    const n111 = hash3D(ix + 1, iy + 1, iz + 1);

    const nx00 = n000 + (n100 - n000) * ux;
    const nx10 = n010 + (n110 - n010) * ux;
    const nx01 = n001 + (n101 - n001) * ux;
    const nx11 = n011 + (n111 - n011) * ux;
    const nxy0 = nx00 + (nx10 - nx00) * uy;
    const nxy1 = nx01 + (nx11 - nx01) * uy;
    return nxy0 + (nxy1 - nxy0) * uz;
  }

  function fbm3D(x, y, z, octaves) {
    let sum = 0;
    let amp = 0.5;
    let freq = 1.0;
    for (let i = 0; i < octaves; i++) {
      sum += amp * noise3D(x * freq, y * freq, z * freq);
      freq *= 2.08;
      amp *= 0.5;
    }
    return sum;
  }

  // ============================================================================
  // 2. PRE-BAKED OFFSCREEN SPRITE FACTORIES (อบครั้งเดียวใช้ได้ตลอด ลื่น 60FPS)
  // ============================================================================
  function bakeMistSprite(opts) {
    const width = opts.width;
    const height = opts.height;
    const freqX = opts.freqX;
    const freqY = opts.freqY;
    const seed = opts.seed;
    const domes = opts.domes;
    const shadowRGB = opts.shadowRGB;
    const midRGB = opts.midRGB;
    const hiRGB = opts.hiRGB;
    const maxAlpha = opts.maxAlpha;
    const threshold = opts.threshold !== undefined ? opts.threshold : 0.15;
    const softness = opts.softness !== undefined ? opts.softness : 0.62;

    const off = document.createElement('canvas');
    off.width = width;
    off.height = height;
    const octx = off.getContext('2d');
    const img = octx.createImageData(width, height);
    const data = img.data;

    for (let py = 0; py < height; py++) {
      const v = py / (height - 1);
      const edgeY = smoothstep(0.0, 0.28, v) * smoothstep(1.0, 0.74, v);
      if (edgeY <= 0.001) continue;
      for (let px = 0; px < width; px++) {
        const u = px / (width - 1);
        const edgeX = smoothstep(0.0, 0.22, u) * smoothstep(1.0, 0.78, u);
        if (edgeX <= 0.001) continue;

        let dome = 0;
        for (let k = 0; k < domes.length; k++) {
          const dm = domes[k];
          const dx = (u - dm.x) / dm.rx;
          const dy = (v - dm.y) / dm.ry;
          const val = Math.exp(-0.5 * (dx * dx + dy * dy)) * dm.w;
          dome = val > dome ? (dome + val * (1 - dome * 0.62)) : (dome + val * 0.34);
        }
        if (dome <= 0.02) continue;

        const qx = fbm4(u * freqX + seed, v * freqY + seed * 0.7);
        const qy = fbm4(u * freqX + seed + 6.3, v * freqY + seed + 2.9);
        const n = fbm4(u * freqX + qx * 1.25 + 3.1, v * freqY + qy * 0.92 + 1.7);
        const nUp = fbm4(u * freqX + qx * 1.25 + 3.1, (v - 0.05) * freqY + qy * 0.92 + 1.7);

        const rawDensity = dome * (0.24 + 1.26 * n);
        const alpha = smoothstep(threshold, threshold + softness, rawDensity) * edgeX * edgeY * maxAlpha;
        if (alpha <= 0.004) continue;

        const ridgeLight = Math.max(0, Math.min(1, (n - nUp) * 3.9 + (1 - v) * 0.56 + 0.24));
        const hi = Math.pow(ridgeLight, 1.45);
        let r, g, b;
        if (hi < 0.55) {
          const f = hi / 0.55;
          r = shadowRGB[0] + (midRGB[0] - shadowRGB[0]) * f;
          g = shadowRGB[1] + (midRGB[1] - shadowRGB[1]) * f;
          b = shadowRGB[2] + (midRGB[2] - shadowRGB[2]) * f;
        } else {
          const f = (hi - 0.55) / 0.45;
          r = midRGB[0] + (hiRGB[0] - midRGB[0]) * f;
          g = midRGB[1] + (hiRGB[1] - midRGB[1]) * f;
          b = midRGB[2] + (hiRGB[2] - midRGB[2]) * f;
        }
        const idx = (py * width + px) * 4;
        data[idx] = Math.round(r);
        data[idx + 1] = Math.round(g);
        data[idx + 2] = Math.round(b);
        data[idx + 3] = Math.round(Math.min(255, alpha * 255));
      }
    }
    octx.putImageData(img, 0, 0);
    return off;
  }

  function createSoftGlowSprite(stops) {
    const sc = document.createElement('canvas');
    sc.width = 64;
    sc.height = 64;
    const sctx = sc.getContext('2d');
    const g = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    for (let i = 0; i < stops.length; i++) g.addColorStop(stops[i][0], stops[i][1]);
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, 64, 64);
    return sc;
  }

  function bakeLanternSprite() {
    const sc = document.createElement('canvas');
    sc.width = 96;
    sc.height = 112;
    const c = sc.getContext('2d');
    const cx = 48, cy = 54;

    const halo = c.createRadialGradient(cx, cy, 4, cx, cy, 46);
    halo.addColorStop(0, 'rgba(255, 236, 168, 0.72)');
    halo.addColorStop(0.38, 'rgba(251, 146, 60, 0.30)');
    halo.addColorStop(0.72, 'rgba(245, 158, 11, 0.08)');
    halo.addColorStop(1, 'rgba(245, 158, 11, 0)');
    c.fillStyle = halo;
    c.beginPath();
    c.arc(cx, cy, 46, 0, Math.PI * 2);
    c.fill();

    const bodyG = c.createLinearGradient(cx, cy - 18, cx, cy + 16);
    bodyG.addColorStop(0, '#f59e0b');
    bodyG.addColorStop(0.45, '#fcd34d');
    bodyG.addColorStop(0.82, '#fffbeb');
    bodyG.addColorStop(1, '#fb923c');
    c.fillStyle = bodyG;
    c.beginPath();
    c.moveTo(cx - 8, cy - 16);
    c.quadraticCurveTo(cx - 15, cy - 4, cx - 10, cy + 14);
    c.lineTo(cx + 10, cy + 14);
    c.quadraticCurveTo(cx + 15, cy - 4, cx + 8, cy - 16);
    c.closePath();
    c.fill();

    const flame = c.createRadialGradient(cx, cy + 10, 1, cx, cy + 10, 10);
    flame.addColorStop(0, '#ffffff');
    flame.addColorStop(0.45, 'rgba(254, 240, 138, 0.9)');
    flame.addColorStop(1, 'rgba(251, 146, 60, 0)');
    c.fillStyle = flame;
    c.beginPath();
    c.arc(cx, cy + 10, 10, 0, Math.PI * 2);
    c.fill();
    return sc;
  }

  function bakeMoonSprite() {
    // ดวงจันทร์สมจริง 3 มิติ โทน "ทองอุ่นคู่โคมลอย (Warm Harvest Moon)" — 384px คมกริบและเบาเครื่องบนมือถือ
    const sz = 384;
    const sc = document.createElement('canvas');
    sc.width = sz;
    sc.height = sz;
    const c = sc.getContext('2d');
    const img = c.createImageData(sz, sz);
    const data = img.data;

    const cx = sz * 0.5;
    const cy = sz * 0.5;
    const R = sz * 0.455;

    const hiRGB = [255, 244, 214];
    const midRGB = [242, 206, 148];
    const mariaRGB = [144, 108, 76];
    const rimRGB = [254, 235, 182];

    const mariaBasins = [
      { x: -0.26, y: -0.24, r: 0.36, d: 0.85 },
      { x:  0.14, y: -0.24, r: 0.25, d: 0.78 },
      { x:  0.30, y:  0.00, r: 0.27, d: 0.82 },
      { x:  0.48, y: -0.14, r: 0.14, d: 0.72 },
      { x: -0.46, y:  0.04, r: 0.34, d: 0.76 },
      { x: -0.16, y:  0.18, r: 0.24, d: 0.68 },
      { x:  0.34, y:  0.22, r: 0.20, d: 0.65 },
      { x: -0.02, y: -0.44, r: 0.22, d: 0.55 }
    ];

    const craters = [
      { x: -0.12, y:  0.62, r: 0.068, ray: true,  depth: 0.90 },
      { x: -0.28, y: -0.04, r: 0.056, ray: true,  depth: 0.75 },
      { x: -0.48, y:  0.08, r: 0.036, ray: true,  depth: 0.55 },
      { x:  0.22, y:  0.38, r: 0.045, ray: false, depth: 0.45 },
      { x:  0.05, y:  0.46, r: 0.052, ray: false, depth: 0.40 },
      { x: -0.34, y:  0.38, r: 0.042, ray: false, depth: 0.42 },
      { x:  0.44, y:  0.36, r: 0.038, ray: false, depth: 0.38 },
      { x: -0.04, y: -0.58, r: 0.040, ray: false, depth: 0.42 },
      { x:  0.36, y: -0.42, r: 0.036, ray: false, depth: 0.38 },
      { x: -0.56, y: -0.26, r: 0.034, ray: false, depth: 0.35 }
    ];
    for (let i = 0; i < 20; i++) {
      const ang = i * 2.39996;
      const rad = 0.22 + ((i * 37) % 66) / 100;
      craters.push({
        x: Math.cos(ang) * rad,
        y: Math.sin(ang) * rad,
        r: 0.016 + ((i * 19) % 24) / 1000,
        ray: false,
        depth: 0.26 + ((i * 13) % 22) / 100
      });
    }

    const lx = -0.32;
    const ly = -0.28;
    const lz = 0.905;

    for (let py = 0; py < sz; py++) {
      const ny = (py - cy) / R;
      const ny2 = ny * ny;
      for (let px = 0; px < sz; px++) {
        const nx = (px - cx) / R;
        const r2 = nx * nx + ny2;
        if (r2 > 1.03) continue;

        const dist = Math.sqrt(r2);
        const edgeAlpha = dist <= 0.985 ? 1.0 : Math.max(0, (1.008 - dist) / 0.023);
        if (edgeAlpha <= 0.001) continue;

        const nz = Math.sqrt(Math.max(0, 1.0 - Math.min(1, r2)));
        const warpX = fbm3D(nx * 2.2 + 4.1, ny * 2.2, nz * 2.2, 3) * 0.24;
        const warpY = fbm3D(nx * 2.2, ny * 2.2 + 7.3, nz * 2.2, 3) * 0.24;
        const macroNoise = fbm3D((nx + warpX) * 2.6, (ny + warpY) * 2.6, nz * 2.6, 4);
        const microNoise = fbm3D(nx * 14.5 + 2.1, ny * 14.5 - 1.4, nz * 14.5, 4);
        const fineGrain = fbm3D(nx * 34.0, ny * 34.0, nz * 34.0, 2);

        let mariaMask = 0;
        for (let m = 0; m < mariaBasins.length; m++) {
          const mb = mariaBasins[m];
          const dx = nx - mb.x + (macroNoise - 0.5) * 0.16;
          const dy = ny - mb.y + (macroNoise - 0.5) * 0.14;
          const d = Math.hypot(dx, dy) / mb.r;
          if (d < 1.35) {
            const v = Math.exp(-d * d * 2.2) * mb.d;
            if (v > mariaMask) mariaMask = v;
          }
        }
        mariaMask = Math.min(1, mariaMask * (0.65 + macroNoise * 0.72));

        let craterShade = 0;
        let ejectaBright = 0;
        for (let k = 0; k < craters.length; k++) {
          const cr = craters[k];
          const dx = nx - cr.x;
          const dy = ny - cr.y;
          const d = Math.hypot(dx, dy);
          if (d < cr.r * 1.45) {
            const u = d / cr.r;
            if (u < 0.85) {
              const slope = (dx * lx + dy * ly) / (cr.r + 0.001);
              craterShade += (-0.12 + slope * 0.24) * cr.depth * (1 - u * 0.4);
            } else {
              const rimBell = Math.exp(-Math.pow((u - 1.0) / 0.22, 2));
              const slope = -(dx * lx + dy * ly) / (cr.r + 0.001);
              craterShade += (0.14 + slope * 0.18) * rimBell * cr.depth;
            }
          }
          if (cr.ray && d < 0.72 && d > cr.r * 0.7) {
            const ang = Math.atan2(dy, dx);
            const streak = Math.pow(0.5 + 0.5 * Math.sin(ang * 11 + cr.x * 20) * Math.cos(ang * 5 - 1.2), 2.6);
            ejectaBright += streak * Math.exp(-d * 3.8) * 0.26 * cr.depth;
          }
        }

        const terrain = Math.max(0, Math.min(1,
          0.78 - mariaMask * 0.44 + (microNoise - 0.5) * 0.24 + (fineGrain - 0.5) * 0.10 + craterShade + ejectaBright
        ));

        const ndotl = Math.max(0, nx * lx + ny * ly + nz * lz);
        const diffuse = 0.62 + 0.38 * Math.pow(ndotl, 0.55);
        const limb = 0.76 + 0.24 * Math.pow(nz, 0.32);
        const rimGlow = Math.pow(1 - nz, 3.2) * Math.max(0, ndotl) * 0.18;

        let r, g, b;
        if (terrain < 0.48) {
          const f = terrain / 0.48;
          r = mariaRGB[0] + (midRGB[0] - mariaRGB[0]) * f;
          g = mariaRGB[1] + (midRGB[1] - mariaRGB[1]) * f;
          b = mariaRGB[2] + (midRGB[2] - mariaRGB[2]) * f;
        } else {
          const f = (terrain - 0.48) / 0.52;
          r = midRGB[0] + (hiRGB[0] - midRGB[0]) * f;
          g = midRGB[1] + (hiRGB[1] - midRGB[1]) * f;
          b = midRGB[2] + (hiRGB[2] - midRGB[2]) * f;
        }

        const lightMul = diffuse * limb;
        const idx = (py * sz + px) * 4;
        data[idx] = Math.round(Math.min(255, r * lightMul + rimRGB[0] * rimGlow));
        data[idx + 1] = Math.round(Math.min(255, g * lightMul + rimRGB[1] * rimGlow));
        data[idx + 2] = Math.round(Math.min(255, b * lightMul + rimRGB[2] * rimGlow));
        data[idx + 3] = Math.round(edgeAlpha * 255);
      }
    }

    c.putImageData(img, 0, 0);
    return sc;
  }

  function createCanopyClusterSprite(c1, c2) {
    const sc = document.createElement('canvas');
    sc.width = 112;
    sc.height = 112;
    const c = sc.getContext('2d');
    const puffs = [
      { x: -16, y: -10, r: 26 },
      { x: 18,  y: -12, r: 24 },
      { x: 0,   y: 12,  r: 28 },
      { x: -20, y: 14,  r: 20 },
      { x: 20,  y: 12,  r: 22 }
    ];
    for (let i = 0; i < puffs.length; i++) {
      const p = puffs[i];
      const g = c.createRadialGradient(56 + p.x, 56 + p.y, 2, 56 + p.x, 56 + p.y, p.r);
      g.addColorStop(0, c1);
      g.addColorStop(0.55, c2);
      g.addColorStop(1, 'rgba(244, 114, 182, 0)');
      c.fillStyle = g;
      c.beginPath();
      c.arc(56 + p.x, 56 + p.y, p.r, 0, Math.PI * 2);
      c.fill();
    }
    return sc;
  }

  function createPeachBlossomSprite(outerCol, midCol, coreCol) {
    const sc = document.createElement('canvas');
    sc.width = 96;
    sc.height = 96;
    const c = sc.getContext('2d');
    const cx = 48, cy = 48;

    const halo = c.createRadialGradient(cx, cy, 2, cx, cy, 45);
    halo.addColorStop(0, 'rgba(255, 240, 246, 0.56)');
    halo.addColorStop(0.52, 'rgba(244, 114, 182, 0.24)');
    halo.addColorStop(1, 'rgba(244, 114, 182, 0)');
    c.fillStyle = halo;
    c.beginPath();
    c.arc(cx, cy, 45, 0, Math.PI * 2);
    c.fill();

    for (let i = 0; i < 5; i++) {
      c.save();
      c.translate(cx, cy);
      c.rotate((i * Math.PI * 2) / 5 - Math.PI / 2);
      const pg = c.createLinearGradient(0, -4, 0, -35);
      pg.addColorStop(0, coreCol);
      pg.addColorStop(0.46, midCol);
      pg.addColorStop(1, outerCol);
      c.fillStyle = pg;
      c.beginPath();
      c.moveTo(0, -3);
      c.bezierCurveTo(-13.5, -10, -16.5, -28.5, -4.5, -35);
      c.quadraticCurveTo(0, -30, 4.5, -35);
      c.bezierCurveTo(16.5, -28.5, 13.5, -10, 0, -3);
      c.closePath();
      c.fill();
      c.strokeStyle = 'rgba(255, 255, 255, 0.48)';
      c.lineWidth = 0.85;
      c.stroke();
      c.restore();
    }

    for (let i = 0; i < 5; i++) {
      c.save();
      c.translate(cx, cy);
      c.rotate(((i + 0.5) * Math.PI * 2) / 5 - Math.PI / 2);
      const ig = c.createLinearGradient(0, -2, 0, -21);
      ig.addColorStop(0, 'rgba(255, 250, 240, 0.86)');
      ig.addColorStop(0.55, midCol);
      ig.addColorStop(1, 'rgba(255, 245, 250, 0.72)');
      c.fillStyle = ig;
      c.beginPath();
      c.moveTo(0, -2);
      c.bezierCurveTo(-8, -7, -10, -18, -2.6, -21.5);
      c.quadraticCurveTo(0, -18.5, 2.6, -21.5);
      c.bezierCurveTo(10, -18, 8, -7, 0, -2);
      c.closePath();
      c.fill();
      c.restore();
    }

    for (let s = 0; s < 7; s++) {
      const a = (s * Math.PI * 2) / 7;
      const sx = cx + Math.cos(a) * 10.5;
      const sy = cy + Math.sin(a) * 10.5;
      c.strokeStyle = 'rgba(254, 243, 199, 0.9)';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(cx, cy);
      c.lineTo(sx, sy);
      c.stroke();
      c.fillStyle = '#fde68a';
      c.beginPath();
      c.arc(sx, sy, 1.9, 0, Math.PI * 2);
      c.fill();
    }
    c.fillStyle = '#fffbeb';
    c.beginPath();
    c.arc(cx, cy, 3.8, 0, Math.PI * 2);
    c.fill();
    return sc;
  }

  function createBudSprite() {
    const sc = document.createElement('canvas');
    sc.width = 36;
    sc.height = 36;
    const c = sc.getContext('2d');
    const g = c.createRadialGradient(18, 18, 1, 18, 18, 12);
    g.addColorStop(0, 'rgba(255, 241, 246, 0.9)');
    g.addColorStop(0.5, 'rgba(244, 114, 182, 0.5)');
    g.addColorStop(1, 'rgba(244, 114, 182, 0)');
    c.fillStyle = g;
    c.beginPath();
    c.arc(18, 18, 12, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#f9a8d4';
    c.beginPath();
    c.ellipse(18, 18, 3.6, 5.4, 0.25, 0, Math.PI * 2);
    c.fill();
    return sc;
  }

  // แคชชุด Sprite ส่วนกลางไว้ครั้งเดียวเพื่อความเร็วเมื่อสลับหน้าไป-กลับใน SPA
  let sharedSprites = null;
  function getSharedSprites() {
    if (sharedSprites) return sharedSprites;
    sharedSprites = {
      mist: {
        coolFar: bakeMistSprite({
          width: 240, height: 108, freqX: 5.0, freqY: 2.8, seed: 3.1,
          domes: [
            { x: 0.20, y: 0.58, rx: 0.26, ry: 0.28, w: 0.92 },
            { x: 0.50, y: 0.54, rx: 0.30, ry: 0.30, w: 0.96 },
            { x: 0.80, y: 0.58, rx: 0.26, ry: 0.28, w: 0.92 }
          ],
          shadowRGB: [18, 56, 112], midRGB: [122, 194, 238], hiRGB: [224, 248, 255], maxAlpha: 0.72
        }),
        coolMidL: bakeMistSprite({
          width: 220, height: 118, freqX: 4.5, freqY: 3.1, seed: 8.7,
          domes: [
            { x: 0.28, y: 0.60, rx: 0.26, ry: 0.28, w: 0.96 },
            { x: 0.60, y: 0.52, rx: 0.25, ry: 0.28, w: 0.88 }
          ],
          shadowRGB: [22, 66, 126], midRGB: [148, 212, 246], hiRGB: [240, 252, 255], maxAlpha: 0.74
        }),
        coolMidR: bakeMistSprite({
          width: 220, height: 118, freqX: 4.6, freqY: 3.0, seed: 14.4,
          domes: [
            { x: 0.40, y: 0.52, rx: 0.25, ry: 0.28, w: 0.88 },
            { x: 0.72, y: 0.60, rx: 0.26, ry: 0.28, w: 0.96 }
          ],
          shadowRGB: [20, 68, 128], midRGB: [142, 216, 245], hiRGB: [238, 254, 252], maxAlpha: 0.74
        }),
        coolVeil: bakeMistSprite({
          width: 215, height: 96, freqX: 5.4, freqY: 3.2, seed: 22.9,
          domes: [
            { x: 0.34, y: 0.50, rx: 0.25, ry: 0.26, w: 0.90 },
            { x: 0.66, y: 0.52, rx: 0.25, ry: 0.26, w: 0.86 }
          ],
          shadowRGB: [40, 96, 160], midRGB: [182, 230, 252], hiRGB: [248, 254, 255], maxAlpha: 0.54, threshold: 0.18, softness: 0.60
        })
      },
      glow: {
        peach: createSoftGlowSprite([[0, 'rgba(255,248,252,0.96)'], [0.24, 'rgba(251,207,232,0.64)'], [0.58, 'rgba(244,114,182,0.24)'], [1, 'rgba(244,114,182,0)']]),
        gold:  createSoftGlowSprite([[0, 'rgba(255,254,244,0.98)'], [0.25, 'rgba(254,240,178,0.60)'], [0.60, 'rgba(251,191,36,0.20)'], [1, 'rgba(251,191,36,0)']]),
        jade:  createSoftGlowSprite([[0, 'rgba(244,255,250,0.94)'], [0.25, 'rgba(167,243,208,0.58)'], [0.58, 'rgba(56,189,248,0.20)'], [1, 'rgba(56,189,248,0)']])
      },
      lantern: bakeLanternSprite(),
      moon: bakeMoonSprite(),
      canopyClusters: [
        createCanopyClusterSprite('rgba(251, 207, 232, 0.72)', 'rgba(236, 72, 153, 0.34)'),
        createCanopyClusterSprite('rgba(255, 228, 242, 0.68)', 'rgba(219, 39, 119, 0.28)')
      ],
      blossoms: [
        createPeachBlossomSprite('#fff5f9', '#fbcfe8', '#f472b6'),
        createPeachBlossomSprite('#fff8fb', '#f9a8d4', '#ec4899'),
        createPeachBlossomSprite('#fffbeb', '#fde2f3', '#f472b6'),
        createPeachBlossomSprite('#ffffff', '#fce7f3', '#f9a8d4')
      ],
      bud: createBudSprite()
    };
    return sharedSprites;
  }

  // ============================================================================
  // 3. 4-PLANE MOUNTAIN + AI HOLOGRAM GENERATOR
  // ============================================================================
  function bakeMountainLayer(w, h, cfg) {
    const rw = Math.max(2, Math.round(w));
    const rh = Math.max(2, Math.round(h));
    const steps = Math.max(96, Math.round(w / 7));
    const ridgePts = [];

    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const valleyDip = 1 - cfg.valleyDepth * Math.exp(-Math.pow((u - 0.5) / cfg.valleyWidth, 2));
      let spire = 0;
      for (let s = 0; s < cfg.spires.length; s++) {
        const sp = cfg.spires[s];
        spire += sp.h * Math.exp(-Math.pow(Math.abs(u - sp.x) / sp.w, 1.55));
      }
      const crag = ridged1D(u * cfg.freq, cfg.seed) * cfg.roughness;
      const normElev = Math.max(0.02, (cfg.baseElev + spire + crag) * valleyDip);
      ridgePts.push({ x: u * rw, y: rh * (cfg.horizonY - normElev) });
    }

    // ชั้น A: ภูเขาหมึกจีนยามค่ำคืน (Normal Shan-Shui)
    const normalOff = document.createElement('canvas');
    normalOff.width = rw;
    normalOff.height = rh;
    const c = normalOff.getContext('2d');
    const bodyGrad = c.createLinearGradient(0, rh * (cfg.horizonY - cfg.maxElev), 0, rh * 0.88);
    bodyGrad.addColorStop(0, cfg.topCol);
    bodyGrad.addColorStop(0.56, cfg.midCol);
    bodyGrad.addColorStop(0.88, cfg.fogCol);
    bodyGrad.addColorStop(1, 'rgba(8, 26, 56, 0)');

    c.beginPath();
    c.moveTo(0, rh * 0.88);
    for (let i = 0; i < ridgePts.length; i++) c.lineTo(ridgePts[i].x, ridgePts[i].y);
    c.lineTo(rw, rh * 0.88);
    c.closePath();
    c.fillStyle = bodyGrad;
    c.fill();

    c.strokeStyle = 'rgba(' + cfg.rimRGB + ', ' + (cfg.rimAlpha * 0.45).toFixed(3) + ')';
    c.lineWidth = 1.1;
    c.beginPath();
    for (let i = 0; i < ridgePts.length; i++) {
      if (i === 0) c.moveTo(ridgePts[i].x, ridgePts[i].y);
      else c.lineTo(ridgePts[i].x, ridgePts[i].y);
    }
    c.stroke();

    // ชั้น B: ภูเขา AI Hologram โครงเส้นระดับความสูง + Wireframe + โหนดข้อมูล
    const holoOff = document.createElement('canvas');
    holoOff.width = rw;
    holoOff.height = rh;
    const hc = holoOff.getContext('2d');

    const drawPath = function (ctx2) {
      ctx2.beginPath();
      ctx2.moveTo(0, rh * 0.88);
      for (let i = 0; i < ridgePts.length; i++) ctx2.lineTo(ridgePts[i].x, ridgePts[i].y);
      ctx2.lineTo(rw, rh * 0.88);
      ctx2.closePath();
    };

    const holoFill = hc.createLinearGradient(0, rh * (cfg.horizonY - cfg.maxElev), 0, rh * 0.88);
    holoFill.addColorStop(0, 'rgba(56, 189, 248, 0.28)');
    holoFill.addColorStop(0.40, 'rgba(45, 212, 191, 0.14)');
    holoFill.addColorStop(0.82, 'rgba(56, 189, 248, 0.04)');
    holoFill.addColorStop(1, 'rgba(14, 165, 233, 0)');
    drawPath(hc);
    hc.fillStyle = holoFill;
    hc.fill();

    hc.save();
    drawPath(hc);
    hc.clip();
    for (let lv = 1; lv <= 7; lv++) {
      const frac = lv / 7;
      const dropY = frac * rh * 0.22;
      const alpha = (1 - frac * 0.72) * 0.34;
      hc.strokeStyle = lv % 2 === 0
        ? 'rgba(110, 231, 183, ' + alpha.toFixed(3) + ')'
        : 'rgba(56, 189, 248, ' + alpha.toFixed(3) + ')';
      hc.lineWidth = lv === 1 ? 1.1 : 0.8;
      hc.beginPath();
      for (let i = 0; i < ridgePts.length; i++) {
        const px = ridgePts[i].x;
        const py = ridgePts[i].y + dropY + Math.sin(i * 0.25 + lv) * 2.2;
        if (i === 0) hc.moveTo(px, py);
        else hc.lineTo(px, py);
      }
      hc.stroke();
    }

    const stride = Math.max(4, Math.round(ridgePts.length / 26));
    hc.lineWidth = 0.75;
    for (let i = 0; i < ridgePts.length; i += stride) {
      const p = ridgePts[i];
      const pNext = ridgePts[Math.min(ridgePts.length - 1, i + stride)];
      const vGrad = hc.createLinearGradient(p.x, p.y, p.x, p.y + rh * 0.22);
      vGrad.addColorStop(0, 'rgba(103, 232, 249, 0.36)');
      vGrad.addColorStop(0.55, 'rgba(56, 189, 248, 0.14)');
      vGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      hc.strokeStyle = vGrad;
      hc.beginPath();
      hc.moveTo(p.x, p.y);
      hc.lineTo(p.x, p.y + rh * 0.22);
      hc.stroke();
      hc.strokeStyle = 'rgba(110, 231, 183, 0.14)';
      hc.beginPath();
      hc.moveTo(p.x, p.y);
      hc.lineTo(pNext.x, pNext.y + rh * 0.08);
      hc.stroke();
    }
    hc.restore();

    hc.lineJoin = 'round';
    hc.strokeStyle = 'rgba(56, 189, 248, 0.28)';
    hc.lineWidth = 4.8;
    hc.beginPath();
    for (let i = 0; i < ridgePts.length; i++) {
      if (i === 0) hc.moveTo(ridgePts[i].x, ridgePts[i].y);
      else hc.lineTo(ridgePts[i].x, ridgePts[i].y);
    }
    hc.stroke();
    hc.strokeStyle = 'rgba(165, 243, 252, 0.88)';
    hc.lineWidth = 1.45;
    hc.stroke();

    for (let i = stride; i < ridgePts.length - stride; i += stride) {
      const p = ridgePts[i];
      const isPeak = p.y < ridgePts[Math.max(0, i - 2)].y && p.y <= ridgePts[Math.min(ridgePts.length - 1, i + 2)].y;
      const nr = isPeak ? 3.2 : 1.9;
      const ng = hc.createRadialGradient(p.x, p.y, 0, p.x, p.y, nr * 4.2);
      ng.addColorStop(0, isPeak ? 'rgba(236, 253, 245, 0.95)' : 'rgba(186, 230, 253, 0.85)');
      ng.addColorStop(0.35, isPeak ? 'rgba(110, 231, 183, 0.55)' : 'rgba(56, 189, 248, 0.42)');
      ng.addColorStop(1, 'rgba(56, 189, 248, 0)');
      hc.fillStyle = ng;
      hc.beginPath();
      hc.arc(p.x, p.y, nr * 4.2, 0, Math.PI * 2);
      hc.fill();
    }

    // เก็บพิกัดยอดเขาจริงของภูเขาลูกนี้ (ฝั่งซ้ายและฝั่งขวา) เพื่อใช้เป็นจุดกำเนิดแสงลมปราณไหลลงมาจากยอดเขา
    const leftPeaks = [];
    const rightPeaks = [];
    for (let s = 0; s < cfg.spires.length; s++) {
      const sp = cfg.spires[s];
      const centerIdx = Math.round(sp.x * steps);
      const searchRad = Math.max(2, Math.round(sp.w * steps * 0.45));
      let bestPt = ridgePts[Math.max(0, Math.min(steps, centerIdx))];
      for (let j = Math.max(0, centerIdx - searchRad); j <= Math.min(steps, centerIdx + searchRad); j++) {
        if (ridgePts[j] && ridgePts[j].y < bestPt.y) bestPt = ridgePts[j];
      }
      if (bestPt) {
        if (sp.x < 0.5) leftPeaks.push({ x: bestPt.x, y: bestPt.y });
        else rightPeaks.push({ x: bestPt.x, y: bestPt.y });
      }
    }

    return { normal: normalOff, holo: holoOff, leftPeaks: leftPeaks, rightPeaks: rightPeaks };
  }

  function buildFourMountainPlanes(w, h) {
    return [
      bakeMountainLayer(w, h, {
        horizonY: 0.70, baseElev: 0.04, maxElev: 0.34, valleyDepth: 0.45, valleyWidth: 0.28,
        freq: 7.2, seed: 1.4, roughness: 0.085,
        spires: [{ x: 0.14, h: 0.21, w: 0.09 }, { x: 0.28, h: 0.14, w: 0.08 }, { x: 0.73, h: 0.15, w: 0.08 }, { x: 0.87, h: 0.23, w: 0.09 }],
        topCol: 'rgba(19, 48, 92, 0.58)', midCol: 'rgba(28, 72, 128, 0.36)', fogCol: 'rgba(116, 182, 228, 0.12)',
        rimRGB: '214, 240, 255', rimAlpha: 0.22
      }),
      bakeMountainLayer(w, h, {
        horizonY: 0.75, baseElev: 0.04, maxElev: 0.32, valleyDepth: 0.62, valleyWidth: 0.30,
        freq: 6.4, seed: 5.9, roughness: 0.09,
        spires: [{ x: 0.08, h: 0.24, w: 0.08 }, { x: 0.22, h: 0.17, w: 0.07 }, { x: 0.79, h: 0.18, w: 0.075 }, { x: 0.93, h: 0.25, w: 0.085 }],
        topCol: 'rgba(10, 29, 64, 0.80)', midCol: 'rgba(18, 52, 102, 0.56)', fogCol: 'rgba(92, 162, 218, 0.16)',
        rimRGB: '254, 240, 195', rimAlpha: 0.30
      }),
      bakeMountainLayer(w, h, {
        horizonY: 0.81, baseElev: 0.03, maxElev: 0.27, valleyDepth: 0.78, valleyWidth: 0.34,
        freq: 5.5, seed: 11.3, roughness: 0.08,
        spires: [{ x: 0.05, h: 0.21, w: 0.08 }, { x: 0.16, h: 0.13, w: 0.065 }, { x: 0.84, h: 0.14, w: 0.07 }, { x: 0.96, h: 0.22, w: 0.085 }],
        topCol: 'rgba(5, 16, 40, 0.92)', midCol: 'rgba(11, 34, 72, 0.72)', fogCol: 'rgba(72, 138, 198, 0.14)',
        rimRGB: '167, 243, 208', rimAlpha: 0.26
      }),
      bakeMountainLayer(w, h, {
        horizonY: 0.86, baseElev: 0.01, maxElev: 0.21, valleyDepth: 0.96, valleyWidth: 0.42,
        freq: 4.8, seed: 17.8, roughness: 0.055,
        spires: [{ x: 0.02, h: 0.17, w: 0.075 }, { x: 0.98, h: 0.18, w: 0.075 }],
        topCol: 'rgba(3, 9, 24, 0.95)', midCol: 'rgba(6, 18, 44, 0.76)', fogCol: 'rgba(56, 112, 174, 0)',
        rimRGB: '186, 230, 253', rimAlpha: 0.18
      })
    ];
  }

  // ============================================================================
  // 4. SPLINE & DRAWING HELPERS
  // ============================================================================
  function sampleCatmullRomArc(pts, samples) {
    if (!pts || pts.length < 2) return [];
    const totalSamples = samples || 180;
    const dense = [];
    const segs = pts.length - 1;
    for (let i = 0; i < segs; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(segs, i + 2)];
      for (let s = 0; s < 18; s++) {
        const t = s / 18;
        const t2 = t * t;
        const t3 = t2 * t;
        dense.push({
          x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
          y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
        });
      }
    }
    dense.push(pts[pts.length - 1]);

    const cum = [0];
    for (let i = 1; i < dense.length; i++) {
      cum.push(cum[i - 1] + Math.hypot(dense[i].x - dense[i - 1].x, dense[i].y - dense[i - 1].y));
    }
    const totalLen = Math.max(1, cum[cum.length - 1]);
    const out = [];
    let cursor = 0;
    for (let k = 0; k <= totalSamples; k++) {
      const target = (k / totalSamples) * totalLen;
      while (cursor < cum.length - 2 && cum[cursor + 1] < target) cursor++;
      const f = (target - cum[cursor]) / Math.max(0.0001, cum[cursor + 1] - cum[cursor]);
      out.push({
        x: dense[cursor].x + (dense[cursor + 1].x - dense[cursor].x) * f,
        y: dense[cursor].y + (dense[cursor + 1].y - dense[cursor].y) * f
      });
    }
    return out;
  }

  function sampleRoutePoint(pts, u) {
    const maxIdx = pts.length - 1;
    const clamped = Math.max(0, Math.min(1, u)) * maxIdx;
    const i0 = Math.floor(clamped);
    const i1 = Math.min(maxIdx, i0 + 1);
    const f = clamped - i0;
    return {
      x: pts[i0].x + (pts[i1].x - pts[i0].x) * f,
      y: pts[i0].y + (pts[i1].y - pts[i0].y) * f
    };
  }

  function drawSoftOrb(c, x, y, r, stops) {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    for (let i = 0; i < stops.length; i++) g.addColorStop(stops[i][0], stops[i][1]);
    c.fillStyle = g;
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.fill();
  }

  function drawSoftLightBeam(c, ox, oy, ang, len, halfW, colInner, colMid) {
    c.save();
    c.translate(ox, oy);
    c.rotate(ang);
    c.scale(1, halfW / len);
    const g = c.createRadialGradient(len * 0.36, 0, 0, len * 0.36, 0, len * 0.64);
    g.addColorStop(0, colInner);
    g.addColorStop(0.45, colMid);
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    c.fillStyle = g;
    c.beginPath();
    c.arc(len * 0.36, 0, len * 0.64, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }

  function drawCelestialCrane(c, jadeGlow, x, y, scale, flapPhase, headingAngle, alpha) {
    const wingY = Math.sin(flapPhase) * 14;
    const wingBackY = Math.sin(flapPhase - 0.55) * 10;
    c.save();
    c.translate(x, y);
    c.rotate(headingAngle);
    c.scale(scale, scale);

    c.globalCompositeOperation = 'lighter';
    c.globalAlpha = alpha * 0.45;
    c.drawImage(jadeGlow, -28, -22, 56, 44);

    c.globalAlpha = alpha * 0.92;
    c.fillStyle = 'rgba(186, 230, 253, 0.58)';
    c.beginPath();
    c.moveTo(-2, -1);
    c.quadraticCurveTo(-12, -14 + wingBackY, -24, -10 + wingBackY * 1.25);
    c.quadraticCurveTo(-10, -2, 3, -1);
    c.closePath();
    c.fill();

    c.strokeStyle = 'rgba(255, 254, 246, 0.94)';
    c.lineWidth = 2.0;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(-18, 2);
    c.quadraticCurveTo(-4, 0, 10, -2);
    c.lineTo(22, -4);
    c.stroke();

    const wg = c.createLinearGradient(-20, -14, 10, 8);
    wg.addColorStop(0, 'rgba(110, 231, 183, 0.85)');
    wg.addColorStop(0.5, 'rgba(240, 253, 255, 0.96)');
    wg.addColorStop(1, 'rgba(254, 240, 178, 0.88)');
    c.fillStyle = wg;
    c.beginPath();
    c.moveTo(4, -1);
    c.quadraticCurveTo(-6, -18 + wingY, -22, -12 + wingY * 1.35);
    c.quadraticCurveTo(-10, 2, -6, 2);
    c.closePath();
    c.fill();
    c.restore();
  }

  function fitLineToWidth(el, targetW, minPx, maxPx) {
    if (!el || targetW <= 0) return;
    const curSize = parseFloat(global.getComputedStyle(el).fontSize) || 20;
    const measured = el.scrollWidth;
    if (!measured) return;
    const nextSize = Math.max(minPx, Math.min(maxPx, (targetW / measured) * curSize));
    if (Math.abs(nextSize - curSize) > 0.4) {
      el.style.fontSize = nextSize.toFixed(2) + 'px';
    }
  }

  // ============================================================================
  // 5. MAIN ENGINE MOUNT CONTROLLER (MOUNT / DESTROY / TRIGGER GUST)
  // ============================================================================
  function mount(refs) {
    const stage = refs && refs.stage;
    const bgCanvas = refs && refs.bgCanvas;
    const fxCanvas = refs && refs.fxCanvas;
    if (!stage || !bgCanvas || !fxCanvas) {
      return { destroy: function () {}, triggerWindGust: function () {}, syncLayout: function () {} };
    }
    const bgCtx = bgCanvas.getContext('2d');
    const fxCtx = fxCanvas.getContext('2d');
    if (!bgCtx || !fxCtx) {
      return { destroy: function () {}, triggerWindGust: function () {}, syncLayout: function () {} };
    }

    const sprites = getSharedSprites();
    const reducedMotion = Boolean(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);

    const state = {
      targetMouseX: 0,
      targetMouseY: 0,
      mouseX: 0,
      mouseY: 0,
      w: 0,
      h: 0,
      lastFitW: 0,
      inView: true,
      moonX: global.innerWidth * 0.21,
      moonY: global.innerHeight * 0.16,
      treeLeft: 0,
      treeTop: 0,
      treeW: 420,
      treeH: 310,
      waterY: global.innerHeight * 0.84
    };

    let mountainLayers = [];
    let ambientRoutes = [];
    let blossomNodes = [];

    // ข้อ 1: โคมลอยอธิษฐาน 18 ดวง ไล่ระดับความลึก 3 ชั้น ลอยเอื่อยสูงขึ้นไปถึงดวงจันทร์และขอบฟ้าด้านบน
    const skyLanterns = [];
    for (let i = 0; i < 18; i++) {
      const plane = (i % 3) + 1; // 1 = ไกล, 2 = กลาง, 3 = ใกล้หุบเขา
      const baseScale = plane === 1 ? 0.28 : (plane === 2 ? 0.44 : 0.60);
      // กระจายทั้งฝั่งซ้าย (ผ่านแนวพระจันทร์ 0.14–0.28), กลางบน และฝั่งขวา
      const xPos = i % 3 === 0
        ? (0.06 + ((i * 0.043) % 0.28))
        : (i % 3 === 1 ? (0.64 + ((i * 0.045) % 0.32)) : (0.14 + ((i * 0.058) % 0.72)));
      skyLanterns.push({
        xFrac: xPos,
        yFrac: 0.02 + ((i * 0.088) % 0.80),
        speed: (0.0065 + plane * 0.0032) + (i % 3) * 0.0016,
        scale: baseScale + (i % 3) * 0.07,
        plane: plane,
        swaySeed: i * 1.65,
        flickerSeed: i * 2.35
      });
    }

    // ข้อ 2: นกกระเรียนแสง 3 ตัว โบยบินโค้งผ่านดวงจันทราหยกทองด้านบนซ้าย
    const spiritCranes = [
      { prog: 0.08, speed: 0.032, baseYFrac: 0.18, ampY: 0.045, scale: 1.02, flapSpeed: 4.8, phase: 0.0 },
      { prog: 0.16, speed: 0.030, baseYFrac: 0.22, ampY: 0.038, scale: 0.78, flapSpeed: 5.3, phase: 1.8 },
      { prog: 0.64, speed: 0.026, baseYFrac: 0.14, ampY: 0.032, scale: 0.68, flapSpeed: 5.0, phase: 3.4 }
    ];
    const craneTrails = [];

    // ข้อ 3: วงคลื่นน้ำเรืองแสงเมื่อกลีบดอกท้อตกแตะผิวน้ำ
    const waterRipples = [];
    function spawnWaterRipple(x, y, maxR) {
      if (waterRipples.length >= 16) waterRipples.shift();
      waterRipples.push({
        x: x,
        y: y,
        r: 3,
        maxR: maxR || 42,
        life: 0,
        maxLife: 1.9 + Math.random() * 0.7
      });
    }

    // ข้อ 6: ระลอกสายลมโปรยฝนกลีบดอกท้อทุก ~13.5 วินาที
    const windGustState = {
      active: false,
      elapsed: 0,
      duration: 3.6,
      nextCountdown: 7.5,
      strength: 0
    };

    const driftingPetals = [];
    const fireflies = [];
    const bloomRipples = [];

    function spawnWindParticle(x, y, boosted, forceLeaf) {
      const maxCap = state.w < 768 ? 50 : 88;
      if (driftingPetals.length >= maxCap) driftingPetals.shift();
      const isLeaf = Boolean(forceLeaf) || Math.random() < 0.14;
      driftingPetals.push({
        isLeaf: isLeaf,
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 12,
        vx: boosted ? (1.1 + Math.random() * 1.8) : (0.42 + Math.random() * 0.72),
        vy: boosted ? (0.18 + Math.random() * 0.62) : (0.26 + Math.random() * 0.48),
        size: isLeaf ? (5.2 + Math.random() * 3.0) : (4.3 + Math.random() * 3.2),
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.075,
        flipSeed: Math.random() * Math.PI * 2,
        life: 0,
        maxLife: 4.8 + Math.random() * 3.4,
        color: isLeaf
          ? (Math.random() > 0.5 ? '#5eead4' : '#6ee7b7')
          : (Math.random() > 0.42 ? '#fbcfe8' : (Math.random() > 0.5 ? '#f9a8d4' : '#fff5f8'))
      });
    }

    function triggerWindGust() {
      windGustState.active = true;
      windGustState.elapsed = 0;
      windGustState.nextCountdown = 13.5;
      const bloomed = blossomNodes.filter(function (b) { return b.kind === 'blossom' && b.bloom > 0.35; });
      const pool = bloomed.length > 0 ? bloomed : blossomNodes;
      const burstCount = state.w < 768 ? 14 : 22;
      for (let i = 0; i < burstCount; i++) {
        if (pool.length > 0) {
          const pick = pool[Math.floor(Math.random() * pool.length)];
          spawnWindParticle(pick.x, pick.y, true, i % 7 === 0);
        }
      }
    }

    function spawnFirefly(x, y, boosted, fixedSprite) {
      if (fireflies.length >= 44) fireflies.shift();
      const angle = Math.random() * Math.PI * 2;
      const speed = boosted ? (0.55 + Math.random() * 1.35) : (0.14 + Math.random() * 0.36);
      fireflies.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (boosted ? 0.6 : 0.32),
        r: boosted ? (5.4 + Math.random() * 4.8) : (4.0 + Math.random() * 3.6),
        life: 0,
        maxLife: 1.15 + Math.random() * 0.8,
        twinkle: Math.random() * Math.PI * 2,
        sprite: fixedSprite || (Math.random() > 0.45 ? 'gold' : 'peach')
      });
    }

    function rebuildRoutesAndBlossoms(heroRect) {
      if (state.treeW <= 0 || state.treeH <= 0) return;
      const svgPt = function (sx, sy) {
        return {
          x: state.treeLeft + (sx / 640) * state.treeW,
          y: state.treeTop + (sy / 420) * state.treeH
        };
      };

      const isDesktop = state.w >= 768;
      const glassEl = isDesktop ? refs.glassStage : refs.mobileGlass;
      let glassTopSafeY = heroRect.height * 0.62;

      if (glassEl) {
        const gr = glassEl.getBoundingClientRect();
        if (gr.width > 0 && gr.height > 0) {
          glassTopSafeY = (gr.top - heroRect.top) - 14;
        }
      }

      // รวบรวมพิกัดยอดเขาจริงของภูเขาแต่ละลูก (ทั้งฝั่งซ้ายและฝั่งขวา)
      const allLeftPeaks = [];
      const allRightPeaks = [];
      for (let m = 0; m < mountainLayers.length; m++) {
        const ly = mountainLayers[m];
        if (ly && Array.isArray(ly.leftPeaks)) {
          for (let k = 0; k < ly.leftPeaks.length; k++) allLeftPeaks.push(ly.leftPeaks[k]);
        }
        if (ly && Array.isArray(ly.rightPeaks)) {
          for (let k = 0; k < ly.rightPeaks.length; k++) allRightPeaks.push(ly.rightPeaks[k]);
        }
      }
      if (allLeftPeaks.length === 0) allLeftPeaks.push({ x: state.w * 0.12, y: state.h * 0.48 });
      if (allRightPeaks.length === 0) allRightPeaks.push({ x: state.w * 0.88, y: state.h * 0.48 });

      // สร้างเส้นทางแสงลมปราณไหลลงมาจากยอดเขาแต่ละลูก -> ผ่านสันเขา/หมอกหุบเขา -> รวมเข้าสู่โคนต้นดอกท้อ
      const leftRoot = svgPt(262, 382);
      const rightRoot = svgPt(378, 382);
      const buildPeakCascadeArc = function (peakPt, rootPt, sideSign, arcIdx) {
        const midX1 = peakPt.x + (rootPt.x - peakPt.x) * 0.30;
        const midY1 = peakPt.y + (rootPt.y - peakPt.y) * 0.38 + (arcIdx % 2 === 0 ? 14 : -12);
        const midX2 = peakPt.x + (rootPt.x - peakPt.x) * 0.68;
        const midY2 = Math.min(state.waterY - 16, peakPt.y + (rootPt.y - peakPt.y) * 0.85 + 8);
        return [
          { x: peakPt.x, y: peakPt.y - 6 },
          { x: midX1, y: midY1 },
          { x: midX2, y: midY2 },
          { x: rootPt.x + sideSign * 6, y: rootPt.y }
        ];
      };

      const leftTrunk = [svgPt(292, 336), svgPt(308, 282), svgPt(312, 232)];
      const rightTrunk = [svgPt(348, 336), svgPt(332, 282), svgPt(328, 232)];

      // แสงลมปราณ 12 สาย ไหลช้าอัลตร้าสมูท (24–30 วิ) ลงมาจากยอดเขาของแต่ละลูกเข้าสู่ลำต้นและแผ่ขึ้นปลุก 12 กิ่งดอกท้อ
      const branchDefs = [
        { peakArc: buildPeakCascadeArc(allLeftPeaks[0 % allLeftPeaks.length], leftRoot, -1, 0),  trunk: leftTrunk,  bPts: [svgPt(308, 224), svgPt(236, 212), svgPt(148, 216), svgPt(64,  234)], sprite: 'peach', dur: 24.5, phase: 0.00 },
        { peakArc: buildPeakCascadeArc(allLeftPeaks[1 % allLeftPeaks.length], leftRoot, -1, 1),  trunk: leftTrunk,  bPts: [svgPt(306, 202), svgPt(222, 180), svgPt(132, 174), svgPt(46,  188)], sprite: 'gold',  dur: 26.0, phase: 0.14 },
        { peakArc: buildPeakCascadeArc(allLeftPeaks[2 % allLeftPeaks.length], leftRoot, -1, 2),  trunk: leftTrunk,  bPts: [svgPt(308, 178), svgPt(232, 146), svgPt(156, 128), svgPt(84,  136)], sprite: 'peach', dur: 27.5, phase: 0.28 },
        { peakArc: buildPeakCascadeArc(allLeftPeaks[3 % allLeftPeaks.length], leftRoot, -1, 3),  trunk: leftTrunk,  bPts: [svgPt(312, 154), svgPt(254, 114), svgPt(194, 86),  svgPt(136, 82)],  sprite: 'jade',  dur: 28.8, phase: 0.42 },
        { peakArc: buildPeakCascadeArc(allLeftPeaks[4 % allLeftPeaks.length], leftRoot, -1, 4),  trunk: leftTrunk,  bPts: [svgPt(316, 134), svgPt(280, 86),  svgPt(242, 54),  svgPt(206, 44)],  sprite: 'gold',  dur: 26.6, phase: 0.56 },
        { peakArc: buildPeakCascadeArc(allLeftPeaks[5 % allLeftPeaks.length], leftRoot, -1, 5),  trunk: leftTrunk,  bPts: [svgPt(248, 198), svgPt(202, 166), svgPt(168, 146), svgPt(134, 152)], sprite: 'peach', dur: 27.2, phase: 0.70 },
        { peakArc: buildPeakCascadeArc(allRightPeaks[0 % allRightPeaks.length], rightRoot, 1, 0), trunk: rightTrunk, bPts: [svgPt(332, 224), svgPt(404, 212), svgPt(492, 216), svgPt(576, 234)], sprite: 'peach', dur: 25.2, phase: 0.08 },
        { peakArc: buildPeakCascadeArc(allRightPeaks[1 % allRightPeaks.length], rightRoot, 1, 1), trunk: rightTrunk, bPts: [svgPt(334, 202), svgPt(418, 180), svgPt(508, 174), svgPt(594, 188)], sprite: 'jade',  dur: 26.8, phase: 0.22 },
        { peakArc: buildPeakCascadeArc(allRightPeaks[2 % allRightPeaks.length], rightRoot, 1, 2), trunk: rightTrunk, bPts: [svgPt(332, 178), svgPt(408, 146), svgPt(484, 128), svgPt(556, 136)], sprite: 'peach', dur: 28.2, phase: 0.36 },
        { peakArc: buildPeakCascadeArc(allRightPeaks[3 % allRightPeaks.length], rightRoot, 1, 3), trunk: rightTrunk, bPts: [svgPt(328, 154), svgPt(386, 114), svgPt(446, 86),  svgPt(504, 82)],  sprite: 'gold',  dur: 29.4, phase: 0.50 },
        { peakArc: buildPeakCascadeArc(allRightPeaks[4 % allRightPeaks.length], rightRoot, 1, 4), trunk: rightTrunk, bPts: [svgPt(324, 134), svgPt(360, 86),  svgPt(398, 54),  svgPt(434, 44)],  sprite: 'peach', dur: 26.2, phase: 0.64 },
        { peakArc: buildPeakCascadeArc(allRightPeaks[5 % allRightPeaks.length], rightRoot, 1, 5), trunk: rightTrunk, bPts: [svgPt(320, 152), svgPt(318, 106), svgPt(320, 62),  svgPt(320, 26)],  sprite: 'gold',  dur: 24.0, phase: 0.80 }
      ];

      ambientRoutes = branchDefs.map(function (b) {
        const gtSamples = sampleCatmullRomArc(b.peakArc.concat(b.trunk), 72);
        const fullSamples = sampleCatmullRomArc(b.peakArc.concat(b.trunk, b.bPts), 260);
        let gtLen = 0;
        let fullLen = 0;
        for (let i = 1; i < gtSamples.length; i++) {
          gtLen += Math.hypot(gtSamples[i].x - gtSamples[i - 1].x, gtSamples[i].y - gtSamples[i - 1].y);
        }
        for (let i = 1; i < fullSamples.length; i++) {
          fullLen += Math.hypot(fullSamples[i].x - fullSamples[i - 1].x, fullSamples[i].y - fullSamples[i - 1].y);
        }
        return {
          pts: fullSamples,
          branchStartU: Math.max(0.52, Math.min(0.76, (gtLen / Math.max(1, fullLen)) + 0.03)),
          sprite: b.sprite,
          dur: b.dur,
          phase: b.phase
        };
      });

      const prevStates = blossomNodes;
      const nextNodes = [];
      const scaleRef = Math.max(0.64, Math.min(1.18, state.treeW / 700));
      const stopsPerBranch = state.w < 768 ? 10 : 14;

      ambientRoutes.forEach(function (rt, rIdx) {
        for (let k = 0; k < stopsPerBranch; k++) {
          const frac = k / Math.max(1, stopsPerBranch - 1);
          const u = rt.branchStartU + frac * (1 - rt.branchStartU);
          const pt = sampleRoutePoint(rt.pts, u);
          const seed = rIdx * 31 + k * 17;

          if (k % 2 === 0 && pt.y < glassTopSafeY - 12) {
            const prevC = prevStates[nextNodes.length];
            nextNodes.push({
              kind: 'cluster',
              routeIdx: rIdx,
              u: u,
              x: pt.x + Math.sin(seed * 1.9) * 18 * scaleRef,
              y: Math.min(glassTopSafeY - 16, pt.y + Math.cos(seed * 1.3) * 14 * scaleRef),
              baseSize: (34 + (seed % 4) * 7) * scaleRef,
              rot: (seed * 0.5) % (Math.PI * 2),
              spriteIdx: seed % sprites.canopyClusters.length,
              bloomed: prevC ? prevC.bloomed : false,
              bloom: prevC ? prevC.bloom : 0,
              haloFlash: prevC ? prevC.haloFlash : 0,
              lastWaveTs: prevC ? prevC.lastWaveTs : 0
            });
          }

          const subCount = (k >= 2 && k % 3 === 1) ? 2 : 1;
          for (let sc = 0; sc < subCount; sc++) {
            const s2 = seed + sc * 43;
            const spread = (14 + frac * 18) * scaleRef;
            const bx = pt.x + Math.sin(s2 * 2.3) * spread;
            const by = pt.y + Math.cos(s2 * 1.7) * (spread * 0.78);
            if (by > glassTopSafeY) continue;
            const prev = prevStates[nextNodes.length];
            nextNodes.push({
              kind: 'blossom',
              routeIdx: rIdx,
              u: Math.min(0.995, u + sc * 0.012),
              x: bx,
              y: by,
              baseSize: (11.5 + ((s2 % 6) * 2.6) + frac * 3.5) * scaleRef,
              rot: (s2 * 0.85) % (Math.PI * 2),
              spriteIdx: s2 % sprites.blossoms.length,
              bloomed: prev ? prev.bloomed : false,
              bloom: prev ? prev.bloom : 0.05,
              haloFlash: prev ? prev.haloFlash : 0,
              lastWaveTs: prev ? prev.lastWaveTs : 0
            });
          }
        }
      });
      blossomNodes = nextNodes;
    }

    function syncLayout(forceTextRefit) {
      const heroRect = stage.getBoundingClientRect();
      const nw = Math.max(1, Math.round(heroRect.width));
      const nh = Math.max(1, Math.round(heroRect.height));

      const widthChanged = Math.abs(nw - state.w) > 3;
      const majorHeightChanged = Math.abs(nh - state.h) > 120;
      if (state.w === 0 || widthChanged || majorHeightChanged || forceTextRefit) {
        const dpr = Math.min(global.devicePixelRatio || 1, 1.5);
        state.w = nw;
        state.h = nh;
        state.waterY = nh * (nw < 768 ? 0.85 : 0.835);
        bgCanvas.width = Math.round(nw * dpr);
        bgCanvas.height = Math.round(nh * dpr);
        fxCanvas.width = Math.round(nw * dpr);
        fxCanvas.height = Math.round(nh * dpr);
        bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        fxCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

        mountainLayers = buildFourMountainPlanes(nw, nh);

        if (refs.treeSvg) {
          const tr = refs.treeSvg.getBoundingClientRect();
          if (tr.width > 0 && tr.height > 0) {
            state.treeLeft = tr.left - heroRect.left;
            state.treeTop = tr.top - heroRect.top;
            state.treeW = tr.width;
            state.treeH = tr.height;
            // วางดวงจันทราหยกทองด้านบนซ้ายเหนือเรือนยอดต้นดอกท้อ
            if (nw < 768) {
              state.moonX = nw * 0.21;
              state.moonY = Math.max(58, Math.min(nh * 0.15, state.treeTop + tr.height * 0.02));
            } else {
              state.moonX = Math.max(nw * 0.14, Math.min(nw * 0.27, state.treeLeft + tr.width * 0.10));
              state.moonY = Math.max(72, Math.min(nh * 0.21, state.treeTop + tr.height * 0.05));
            }
          }
        }

        if (forceTextRefit || Math.abs(nw - state.lastFitW) > 3) {
          state.lastFitW = nw;
          if (refs.textFitBox && refs.fitLine1 && refs.textFitBox.clientWidth > 0) {
            const tw = refs.textFitBox.clientWidth * 0.98;
            fitLineToWidth(refs.fitLine1, tw, 16, 36);
            if (refs.fitLine2) {
              const cw = refs.centerCta && refs.centerCta.clientWidth ? refs.centerCta.clientWidth * 0.94 : tw * 0.49;
              fitLineToWidth(refs.fitLine2, Math.min(tw * 0.49, cw), 16, 34);
            }
          }
          if (refs.mTextFitBox && refs.mFitLine1 && refs.mFitLine2 && refs.mTextFitBox.clientWidth > 0) {
            const mw = refs.mTextFitBox.clientWidth * 0.96;
            fitLineToWidth(refs.mFitLine1, mw, 13, 21);
            fitLineToWidth(refs.mFitLine2, mw * 0.54, 17, 26);
          }
        }

        rebuildRoutesAndBlossoms(heroRect);
      }
    }

    function drawMirrorLake(c, w, h, t, mx, holoMixAvg, dt) {
      const wy = state.waterY;
      const lakeH = Math.max(10, h - wy);

      c.save();
      const waterGrad = c.createLinearGradient(0, wy, 0, h);
      waterGrad.addColorStop(0, 'rgba(11, 34, 72, 0.78)');
      waterGrad.addColorStop(0.32, 'rgba(6, 20, 48, 0.88)');
      waterGrad.addColorStop(1, 'rgba(2, 8, 22, 0.96)');
      c.fillStyle = waterGrad;
      c.fillRect(0, wy, w, lakeH);

      const shoreG = c.createLinearGradient(0, wy, w, wy);
      shoreG.addColorStop(0, 'rgba(125, 211, 252, 0.08)');
      shoreG.addColorStop(0.24, 'rgba(254, 240, 178, 0.30)');
      shoreG.addColorStop(0.52, 'rgba(251, 207, 232, 0.24)');
      shoreG.addColorStop(0.80, 'rgba(110, 231, 183, 0.22)');
      shoreG.addColorStop(1, 'rgba(125, 211, 252, 0.08)');
      c.strokeStyle = shoreG;
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(0, wy);
      c.lineTo(w, wy);
      c.stroke();

      c.globalCompositeOperation = 'lighter';
      const shimmerRows = 14;
      for (let r = 0; r < shimmerRows; r++) {
        const frac = (r + 0.5) / shimmerRows;
        const sy = wy + frac * lakeH;
        const waveShift = Math.sin(t * 2.1 + r * 0.9) * (10 + frac * 14);
        const fadeY = 1 - frac * 0.65;

        const moonSpan = (28 + (1 - frac) * 44) * (0.85 + 0.15 * Math.sin(t * 3 + r));
        c.fillStyle = 'rgba(254, 243, 199, ' + (0.14 * fadeY).toFixed(3) + ')';
        c.fillRect(mx - moonSpan * 0.5 + waveShift, sy, moonSpan, 1.5 + frac * 1.4);

        const peachSpan = 70 + frac * 90;
        c.fillStyle = 'rgba(249, 168, 212, ' + (0.075 * fadeY).toFixed(3) + ')';
        c.fillRect(w * 0.5 - peachSpan * 0.5 - waveShift * 0.7, sy + 1, peachSpan, 1.4 + frac);

        if (holoMixAvg > 0.06) {
          const holoA = 0.11 * holoMixAvg * fadeY;
          c.fillStyle = 'rgba(56, 189, 248, ' + holoA.toFixed(3) + ')';
          c.fillRect(w * 0.08 + waveShift * 0.5, sy, w * 0.16, 1.2);
          c.fillRect(w * 0.76 - waveShift * 0.5, sy, w * 0.16, 1.2);
        }
      }

      for (let i = waterRipples.length - 1; i >= 0; i--) {
        const rp = waterRipples[i];
        rp.life += dt;
        const prog = rp.life / rp.maxLife;
        if (prog >= 1) {
          waterRipples.splice(i, 1);
          continue;
        }
        const curR = rp.r + (rp.maxR - rp.r) * (1 - Math.pow(1 - prog, 2.2));
        const alpha = (1 - prog) * 0.48;
        c.strokeStyle = 'rgba(251, 207, 232, ' + alpha.toFixed(3) + ')';
        c.lineWidth = 1.25 * (1 - prog * 0.5);
        c.beginPath();
        c.ellipse(rp.x, rp.y, curR, curR * 0.24, 0, 0, Math.PI * 2);
        c.stroke();

        if (curR > 12) {
          c.strokeStyle = 'rgba(167, 243, 208, ' + (alpha * 0.55).toFixed(3) + ')';
          c.beginPath();
          c.ellipse(rp.x, rp.y, curR * 0.62, curR * 0.15, 0, 0, Math.PI * 2);
          c.stroke();
        }
      }
      c.restore();
    }

    // ============================================================================
    // 6. MAIN 60FPS RENDER LOOP
    // ============================================================================
    let alive = true;
    let rafId = null;
    let prevFrameTs = performance.now();
    let breezeTimer = 0;

    function renderLoop(now) {
      if (!alive) return;
      rafId = requestAnimationFrame(renderLoop);
      if (document.hidden || !state.inView || state.w <= 0) return;

      const dt = Math.min(0.05, Math.max(0.001, (now - prevFrameTs) / 1000));
      prevFrameTs = now;
      breezeTimer += dt;

      const w = state.w;
      const h = state.h;
      const minDim = Math.min(w, h);
      const t = reducedMotion ? 0 : now * 0.001;
      const k = 0.90 * (0.94 + 0.06 * Math.sin(t * 0.8));

      state.mouseX += (state.targetMouseX - state.mouseX) * 0.045;
      state.mouseY += (state.targetMouseY - state.mouseY) * 0.045;

      // ข้อ 6: อัปเดตจังหวะระลอกสายลมฝนกลีบดอกท้อ
      if (!reducedMotion) {
        if (windGustState.active) {
          windGustState.elapsed += dt;
          const p = windGustState.elapsed / windGustState.duration;
          if (p >= 1) {
            windGustState.active = false;
            windGustState.strength = 0;
          } else {
            windGustState.strength = Math.sin(p * Math.PI);
          }
        } else {
          windGustState.nextCountdown -= dt;
          windGustState.strength *= Math.exp(-dt * 4);
          if (windGustState.nextCountdown <= 0) triggerWindGust();
        }
      }

      const holoMixAvg = Math.pow(0.5 - 0.5 * Math.cos(t * 0.56 - 0.72), 1.55);

      // ==================== LAYER 1 (bgCtx • z-12) ====================
      bgCtx.clearRect(0, 0, w, h);

      // ดวงจันทร์สมจริงโทนทองอุ่นคู่โคมลอย (Warm Harvest Moon) เอียงซ้ายเหนือต้นดอกท้อ
      const mx = state.moonX + state.mouseX * 14;
      const my = state.moonY + state.mouseY * 7;
      const moonR = Math.min(w * 0.145, minDim * 0.155, 102);

      bgCtx.save();
      bgCtx.globalCompositeOperation = 'lighter';
      drawSoftOrb(bgCtx, mx, my, moonR * 3.25, [
        [0, 'rgba(255, 236, 178, ' + (0.42 * k).toFixed(3) + ')'],
        [0.24, 'rgba(255, 224, 152, ' + (0.22 * k).toFixed(3) + ')'],
        [0.52, 'rgba(251, 146, 60, ' + (0.10 * k).toFixed(3) + ')'],
        [0.80, 'rgba(56, 189, 248, ' + (0.05 * k).toFixed(3) + ')'],
        [1, 'rgba(0, 0, 0, 0)']
      ]);
      // วงแหวนทรงกลดทองอุ่นจางๆ รอบดวงจันทร์
      const lunarRing = bgCtx.createRadialGradient(mx, my, moonR * 1.42, mx, my, moonR * 1.82);
      lunarRing.addColorStop(0, 'rgba(0, 0, 0, 0)');
      lunarRing.addColorStop(0.5, 'rgba(255, 230, 168, ' + (0.08 * k).toFixed(3) + ')');
      lunarRing.addColorStop(1, 'rgba(0, 0, 0, 0)');
      bgCtx.fillStyle = lunarRing;
      bgCtx.beginPath();
      bgCtx.arc(mx, my, moonR * 1.82, 0, Math.PI * 2);
      bgCtx.fill();
      bgCtx.restore();

      bgCtx.save();
      bgCtx.globalAlpha = 0.98;
      bgCtx.drawImage(sprites.moon, mx - moonR * 1.10, my - moonR * 1.10, moonR * 2.20, moonR * 2.20);
      bgCtx.restore();

      bgCtx.save();
      bgCtx.globalCompositeOperation = 'lighter';
      bgCtx.translate(mx, my);
      bgCtx.rotate(t * 0.06);
      bgCtx.strokeStyle = 'rgba(254, 224, 152, ' + (0.16 * k).toFixed(3) + ')';
      bgCtx.lineWidth = 1.25;
      bgCtx.setLineDash([28, 16, 8, 18]);
      bgCtx.beginPath();
      bgCtx.arc(0, 0, moonR * 1.18, 0, Math.PI * 2);
      bgCtx.stroke();
      bgCtx.rotate(-t * 0.11);
      bgCtx.strokeStyle = 'rgba(251, 186, 116, ' + (0.11 * k).toFixed(3) + ')';
      bgCtx.setLineDash([14, 24]);
      bgCtx.beginPath();
      bgCtx.arc(0, 0, moonR * 1.42, 0, Math.PI * 2);
      bgCtx.stroke();
      bgCtx.setLineDash([]);
      bgCtx.restore();

      // ข้อ 2: นกกระเรียนแสง 3 ตัว บินโค้งผ่านดวงจันทราหยกทอง
      for (let i = 0; i < spiritCranes.length; i++) {
        const cr = spiritCranes[i];
        if (!reducedMotion) cr.prog = (cr.prog + dt * cr.speed) % 1;
        const cx = -60 + cr.prog * (w + 120);
        const cy = h * cr.baseYFrac - Math.sin(cr.prog * Math.PI) * (h * cr.ampY) + Math.sin(t * 1.4 + cr.phase) * 7;
        const heading = Math.atan2(-Math.cos(cr.prog * Math.PI) * cr.ampY * 0.9, 1) * 0.35;
        const edgeFade = Math.sin(cr.prog * Math.PI);
        drawCelestialCrane(bgCtx, sprites.glow.jade, cx, cy, cr.scale * (w < 768 ? 0.72 : 1.0), t * cr.flapSpeed + cr.phase, heading, edgeFade);

        if (!reducedMotion && Math.random() < 0.24 && edgeFade > 0.15) {
          if (craneTrails.length >= 26) craneTrails.shift();
          craneTrails.push({ x: cx - 14 * cr.scale, y: cy + 2, life: 0, maxLife: 1.1, r: 4.5 * cr.scale });
        }
      }
      bgCtx.save();
      bgCtx.globalCompositeOperation = 'lighter';
      for (let i = craneTrails.length - 1; i >= 0; i--) {
        const tr = craneTrails[i];
        tr.life += dt;
        const p = tr.life / tr.maxLife;
        if (p >= 1) { craneTrails.splice(i, 1); continue; }
        bgCtx.globalAlpha = (1 - p) * 0.45;
        bgCtx.drawImage(sprites.glow.jade, tr.x - tr.r, tr.y - tr.r, tr.r * 2, tr.r * 2);
      }
      bgCtx.restore();

      // ข้อ 1 Helper: วาดโคมลอยแยกชั้นความลึก 3 ระยะ (ลอยสูงขึ้นไปถึงดวงจันทร์และขอบฟ้าด้านบน)
      const drawLanternsForPlane = function (planeId) {
        bgCtx.save();
        bgCtx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < skyLanterns.length; i++) {
          const ln = skyLanterns[i];
          if (ln.plane !== planeId) continue;
          if (!reducedMotion) ln.yFrac -= dt * ln.speed;
          if (ln.yFrac < -0.10) {
            ln.yFrac = 0.84 + Math.random() * 0.10;
            ln.xFrac = i % 3 === 0
              ? (0.06 + Math.random() * 0.28)
              : (i % 3 === 1 ? (0.64 + Math.random() * 0.32) : (0.14 + Math.random() * 0.72));
          }
          const parallax = planeId === 1 ? 5 : (planeId === 2 ? 11 : 17);
          const lx = ln.xFrac * w + Math.sin(t * 0.48 + ln.swaySeed) * (14 + planeId * 4) + state.mouseX * parallax;
          const ly = ln.yFrac * h;
          // คงความสว่างชัดไปจนถึงระดับดวงจันทร์และขอบฟ้าด้านบนสุด (-0.08 ถึง 0.02 ค่อยๆ จางหาย)
          const fade = smoothstep(-0.08, 0.02, ln.yFrac) * smoothstep(0.86, 0.70, ln.yFrac);
          const flicker = 0.86 + 0.14 * Math.sin(t * 4.6 + ln.flickerSeed);
          const dw = 48 * ln.scale * (w < 768 ? 0.78 : 1.0);
          const dh = 56 * ln.scale * (w < 768 ? 0.78 : 1.0);
          const planeAlpha = planeId === 1 ? 0.68 : (planeId === 2 ? 0.86 : 0.96);
          bgCtx.globalAlpha = Math.max(0, fade * flicker * planeAlpha);
          bgCtx.drawImage(sprites.lantern, lx - dw * 0.5, ly - dh * 0.5, dw, dh);
        }
        bgCtx.restore();
      };

      const drawSmartMountainPlane = function (idx, parallaxX, normalBaseAlpha, holoPeakAlpha) {
        const layer = mountainLayers[idx];
        if (!layer) return;
        const wavePhase = t * 0.56 - idx * 0.48;
        const holoMix = Math.pow(0.5 - 0.5 * Math.cos(wavePhase), 1.55);
        const holoBreath = 0.86 + 0.14 * Math.sin(t * 3.6 + idx * 1.7);

        bgCtx.save();
        bgCtx.globalCompositeOperation = 'source-over';
        bgCtx.globalAlpha = normalBaseAlpha * (1 - holoMix * 0.48);
        bgCtx.drawImage(layer.normal, parallaxX, 0, w, h);

        if (holoMix > 0.008) {
          bgCtx.globalCompositeOperation = 'lighter';
          bgCtx.globalAlpha = Math.min(0.95, holoMix * holoBreath * holoPeakAlpha);
          bgCtx.drawImage(layer.holo, parallaxX, 0, w, h);

          const scanFrac = (t * 0.24 + idx * 0.19) % 1;
          const scanY = h * (0.42 + scanFrac * 0.42);
          const scanA = Math.sin(scanFrac * Math.PI) * holoMix * 0.14;
          if (scanA > 0.004) {
            const scanGrad = bgCtx.createLinearGradient(0, scanY - 26, 0, scanY + 26);
            scanGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
            scanGrad.addColorStop(0.5, 'rgba(103, 232, 249, ' + scanA.toFixed(3) + ')');
            scanGrad.addColorStop(1, 'rgba(110, 231, 183, 0)');
            bgCtx.fillStyle = scanGrad;
            bgCtx.fillRect(0, scanY - 26, w, 52);
          }
        }
        bgCtx.restore();
      };

      // สลับชั้นทิวเขา 4 ระยะ + โคมลอย + ทะเลหมอกเย็นฟุ้ง 4-Octave fBm
      const drift1 = ((t * 11) % (w * 1.35)) - w * 0.35;
      const drift2 = w - (((t * 14) % (w * 1.40)));

      drawSmartMountainPlane(0, state.mouseX * 4, 0.88, 0.72);
      drawLanternsForPlane(1);

      bgCtx.save();
      bgCtx.globalAlpha = 0.54;
      bgCtx.drawImage(sprites.mist.coolFar, -w * 0.12 + Math.sin(t * 0.14) * 26, h * 0.48, w * 1.24, h * 0.34);
      bgCtx.restore();

      drawSmartMountainPlane(1, state.mouseX * 9, 0.94, 0.84);
      drawLanternsForPlane(2);

      bgCtx.save();
      bgCtx.globalAlpha = 0.64;
      bgCtx.drawImage(sprites.mist.coolMidL, -w * 0.16 + Math.sin(t * 0.19) * 22, h * 0.52, w * 0.78, h * 0.36);
      bgCtx.drawImage(sprites.mist.coolMidR, w * 0.38 - Math.sin(t * 0.17 + 1.1) * 22, h * 0.51, w * 0.78, h * 0.37);
      bgCtx.restore();

      drawSmartMountainPlane(2, state.mouseX * 15, 0.96, 0.92);
      drawLanternsForPlane(3);

      bgCtx.save();
      bgCtx.globalAlpha = 0.44;
      bgCtx.drawImage(sprites.mist.coolVeil, drift1 - w * 0.32, h * 0.55, w * 0.86, h * 0.26);
      bgCtx.restore();

      drawSmartMountainPlane(3, state.mouseX * 22, 0.98, 0.96);

      // ข้อ 3: ผิวน้ำทะเลสาบกระจก & วงคลื่นสะท้อนแสงยามค่ำคืนใต้หุบเขา
      drawMirrorLake(bgCtx, w, h, t, mx, holoMixAvg, dt);

      bgCtx.save();
      bgCtx.globalAlpha = 0.34;
      bgCtx.drawImage(sprites.mist.coolVeil, drift2 - w * 0.38, h * 0.68, w * 0.84, h * 0.22);
      bgCtx.restore();

      // ลำแสงสวรรค์สาดทแยงจากดวงจันทราหยกทองด้านบนซ้ายผ่านเรือนยอดดอกท้อ
      bgCtx.save();
      bgCtx.globalCompositeOperation = 'lighter';
      const targetTreeX = state.treeLeft + state.treeW * 0.52;
      const targetTreeY = state.treeTop + state.treeH * 0.46;
      const baseRayAng = Math.atan2(targetTreeY - my, targetTreeX - mx);
      const rayOffsets = [-0.34, -0.17, -0.02, 0.14, 0.31, 0.50];
      const rayLen = Math.hypot(w * 0.78, h * 0.78);
      for (let i = 0; i < rayOffsets.length; i++) {
        const sway = Math.sin(t * 0.28 + i * 1.3) * 0.026 + state.mouseX * 0.018;
        const pulse = 0.038 + 0.015 * Math.sin(t * 0.62 + i * 1.5);
        drawSoftLightBeam(
          bgCtx, mx, my, baseRayAng + rayOffsets[i] + sway, rayLen, minDim * 0.14,
          'rgba(254, 249, 212, ' + (pulse * 1.45 * k).toFixed(3) + ')',
          i % 2 === 0
            ? 'rgba(110, 231, 183, ' + (pulse * 0.70 * k).toFixed(3) + ')'
            : 'rgba(147, 210, 252, ' + (pulse * 0.68 * k).toFixed(3) + ')'
        );
      }
      bgCtx.restore();

      // ==================== LAYER 2 (fxCtx • z-18) ====================
      fxCtx.clearRect(0, 0, w, h);

      const activeHeads = [];
      const tailSteps = w < 768 ? 36 : 52;
      const tailSpan = 0.34;
      const baseGlowRadius = w < 768 ? 15 : 20;

      fxCtx.save();
      fxCtx.globalCompositeOperation = 'lighter';
      for (let r = 0; r < ambientRoutes.length; r++) {
        const rt = ambientRoutes[r];
        if (!rt.pts || rt.pts.length < 4) continue;
        const rawP = ((t / rt.dur) + rt.phase) % 1;
        const headU = rawP - 0.012 * Math.sin(rawP * Math.PI * 2);
        const envFade = Math.pow(Math.sin(Math.min(1, Math.max(0, rawP)) * Math.PI), 0.68);
        const spriteImg = sprites.glow[rt.sprite] || sprites.glow.peach;
        activeHeads.push(headU);

        for (let s = 0; s < tailSteps; s++) {
          const frac = s / (tailSteps - 1);
          const u = headU - frac * tailSpan;
          if (u < 0 || u > 1) continue;
          const pt = sampleRoutePoint(rt.pts, u);
          const taper = Math.pow(1 - frac, 1.42);
          const rad = baseGlowRadius * (0.44 + taper * 0.92);
          fxCtx.globalAlpha = Math.max(0, Math.min(0.42, taper * envFade * 0.28));
          fxCtx.drawImage(spriteImg, pt.x - rad, pt.y - rad, rad * 2, rad * 2);
        }
        if (headU >= 0 && headU <= 1) {
          const hp = sampleRoutePoint(rt.pts, headU);
          const headR = baseGlowRadius * 1.42;
          fxCtx.globalAlpha = Math.max(0, Math.min(0.74, envFade * 0.62));
          fxCtx.drawImage(sprites.glow.gold, hp.x - headR, hp.y - headR, headR * 2, headR * 2);
        }
      }
      fxCtx.restore();

      // วาดพุ่มดอกท้อใหญ่เต็มต้น (ผลิบานสะสมตามแสงแอมเบียนและเอนไหวตามสายลม)
      const gustPushX = windGustState.strength * 14;
      const drawBlossomPass = function (passKind) {
        for (let i = 0; i < blossomNodes.length; i++) {
          const b = blossomNodes[i];
          if (b.kind !== passKind) continue;
          const rHeadU = activeHeads[b.routeIdx] !== undefined ? activeHeads[b.routeIdx] : -1;
          if (reducedMotion) {
            b.bloomed = true;
            b.bloom = 1;
          } else if (rHeadU >= b.u - 0.015 && rHeadU <= b.u + 0.065 && now - b.lastWaveTs > 2600) {
            b.bloomed = true;
            b.lastWaveTs = now;
            b.haloFlash = 1.0;
            if (b.kind === 'blossom' && Math.random() < 0.24) {
              spawnWindParticle(b.x, b.y, false, false);
            }
          }

          const breath = b.bloomed ? (0.94 + 0.08 * Math.sin(t * 1.4 + i * 0.7)) : 0;
          const targetBloom = b.bloomed ? breath : 0.06;
          b.bloom += (targetBloom - b.bloom) * (1 - Math.exp(-dt * (targetBloom > b.bloom ? 4.4 : 1.6)));
          b.haloFlash = Math.max(0, b.haloFlash - dt * 0.95);

          const bx = b.x + Math.sin(t * 1.25 + i * 0.8) * (2.2 + b.u * 1.4) + gustPushX * b.u;
          const by = b.y + Math.cos(t * 1.0 + i * 1.1) * 1.5 + windGustState.strength * 2.5;

          if (b.kind === 'cluster') {
            if (b.bloom > 0.12) {
              const sz = b.baseSize * (0.45 + b.bloom * 0.65);
              fxCtx.globalAlpha = Math.min(0.74, b.bloom * 0.66);
              fxCtx.drawImage(sprites.canopyClusters[b.spriteIdx], bx - sz, by - sz, sz * 2, sz * 2);
            }
            continue;
          }

          if (b.haloFlash > 0.03) {
            fxCtx.save();
            fxCtx.globalCompositeOperation = 'lighter';
            fxCtx.globalAlpha = b.haloFlash * 0.55;
            const hr = b.baseSize * (1.45 + (1 - b.haloFlash) * 0.85);
            fxCtx.drawImage(sprites.glow.peach, bx - hr, by - hr, hr * 2, hr * 2);
            fxCtx.restore();
          }
          if (b.bloom < 0.28) {
            const budR = b.baseSize * 0.56;
            fxCtx.globalAlpha = 0.75;
            fxCtx.drawImage(sprites.bud, bx - budR, by - budR, budR * 2, budR * 2);
          }
          if (b.bloom > 0.14) {
            const openFrac = Math.min(1, (b.bloom - 0.14) / 0.86);
            const drawSz = b.baseSize * (0.34 + openFrac * 0.88 + b.haloFlash * 0.14);
            fxCtx.save();
            fxCtx.translate(bx, by);
            fxCtx.rotate(b.rot + Math.sin(t * 0.9 + i) * 0.08 + windGustState.strength * 0.22 + (1 - openFrac) * 0.5);
            fxCtx.globalAlpha = Math.min(0.98, 0.22 + openFrac * 0.76);
            fxCtx.drawImage(sprites.blossoms[b.spriteIdx], -drawSz, -drawSz, drawSz * 2, drawSz * 2);
            fxCtx.restore();
          }
        }
      };
      drawBlossomPass('cluster');
      drawBlossomPass('blossom');
      fxCtx.globalAlpha = 1;

      if (!reducedMotion && breezeTimer > 0.22 && blossomNodes.length > 0) {
        breezeTimer = 0;
        const pick = blossomNodes[Math.floor(Math.random() * blossomNodes.length)];
        if (pick && pick.bloomed) spawnWindParticle(pick.x, pick.y, false, Math.random() < 0.18);
      }

      // แถบสายลมบางๆ ช่วงระลอกสายลมฝนกลีบดอกท้อ (ข้อ 6)
      if (windGustState.strength > 0.05) {
        fxCtx.save();
        fxCtx.globalCompositeOperation = 'lighter';
        const gProg = windGustState.elapsed / windGustState.duration;
        const gx = -w * 0.2 + gProg * w * 1.4;
        const gy = h * 0.34;
        const wg = fxCtx.createLinearGradient(gx - 180, gy - 40, gx + 180, gy + 40);
        wg.addColorStop(0, 'rgba(255, 240, 248, 0)');
        wg.addColorStop(0.5, 'rgba(251, 207, 232, ' + (windGustState.strength * 0.16).toFixed(3) + ')');
        wg.addColorStop(1, 'rgba(186, 230, 253, 0)');
        fxCtx.strokeStyle = wg;
        fxCtx.lineWidth = 2.2;
        for (let s = 0; s < 3; s++) {
          fxCtx.beginPath();
          fxCtx.moveTo(gx - 160 + s * 35, gy - 65 + s * 55);
          fxCtx.quadraticCurveTo(gx + s * 20, gy - 90 + s * 55 + Math.sin(t * 3 + s) * 18, gx + 170 + s * 35, gy - 45 + s * 55);
          fxCtx.stroke();
        }
        fxCtx.restore();
      }

      // วาดกลีบดอกท้อและใบหยกปลิวตามลม -> ตกแตะผิวน้ำเกิดวงคลื่นเรืองแสง (เชื่อมข้อ 3 + ข้อ 6)
      for (let i = driftingPetals.length - 1; i >= 0; i--) {
        const p = driftingPetals[i];
        p.life += dt;
        const prog = p.life / p.maxLife;
        if (prog >= 1 || p.x > w + 56) { driftingPetals.splice(i, 1); continue; }

        const windPush = 0.35 + 0.28 * Math.sin(t * 0.9 + p.flipSeed) + windGustState.strength * 1.85;
        p.x += (p.vx + windPush) * (dt * 60);
        p.y += (p.vy + Math.sin(t * 2.1 + p.flipSeed) * 0.16) * (dt * 60);
        p.vy = Math.min(0.72, p.vy + dt * 0.14);
        p.rot += (p.vRot + windGustState.strength * 0.04) * (dt * 60);

        if (p.y >= state.waterY + 8 && p.y <= h - 10) {
          spawnWaterRipple(p.x, p.y, 28 + Math.random() * 24);
          driftingPetals.splice(i, 1);
          continue;
        }
        if (p.y > h + 24) { driftingPetals.splice(i, 1); continue; }

        const fade = Math.sin(prog * Math.PI);
        const tiltScale = 0.36 + 0.64 * Math.abs(Math.cos(t * 2.5 + p.flipSeed));
        fxCtx.save();
        fxCtx.translate(p.x, p.y);
        fxCtx.rotate(p.rot);
        fxCtx.scale(1, tiltScale);
        fxCtx.globalAlpha = Math.max(0, fade * 0.90);
        fxCtx.fillStyle = p.color;
        fxCtx.beginPath();
        if (p.isLeaf) {
          fxCtx.moveTo(-p.size, 0);
          fxCtx.quadraticCurveTo(0, -p.size * 0.56, p.size, 0);
          fxCtx.quadraticCurveTo(0, p.size * 0.56, -p.size, 0);
        } else {
          fxCtx.moveTo(-p.size * 0.8, 0);
          fxCtx.bezierCurveTo(-p.size * 0.3, -p.size * 0.85, p.size * 0.75, -p.size * 0.65, p.size, -p.size * 0.15);
          fxCtx.quadraticCurveTo(p.size * 0.65, 0, p.size, p.size * 0.15);
          fxCtx.bezierCurveTo(p.size * 0.75, p.size * 0.65, -p.size * 0.3, p.size * 0.85, -p.size * 0.8, 0);
        }
        fxCtx.closePath();
        fxCtx.fill();
        fxCtx.restore();
      }

      // ระลอกคลื่นปราณ Touch-to-Bloom และละอองหิ่งห้อยทอง
      fxCtx.save();
      fxCtx.globalCompositeOperation = 'lighter';
      for (let i = bloomRipples.length - 1; i >= 0; i--) {
        const rp = bloomRipples[i];
        rp.life += dt;
        const prog = rp.life / rp.maxLife;
        if (prog >= 1) { bloomRipples.splice(i, 1); continue; }
        const curR = rp.r + (rp.maxR - rp.r) * (1 - Math.pow(1 - prog, 2.4));
        drawSoftOrb(fxCtx, rp.x, rp.y, curR, [
          [0, 'rgba(0,0,0,0)'],
          [0.68, 'rgba(251,207,232,0)'],
          [0.86, 'rgba(251,207,232,' + ((1 - prog) * 0.36).toFixed(3) + ')'],
          [1, 'rgba(254,240,178,0)']
        ]);
      }
      for (let i = fireflies.length - 1; i >= 0; i--) {
        const f = fireflies[i];
        f.life += dt;
        const prog = f.life / f.maxLife;
        if (prog >= 1) { fireflies.splice(i, 1); continue; }
        f.x += f.vx * (dt * 60) + Math.sin(t * 3.4 + f.twinkle) * 0.22;
        f.y += f.vy * (dt * 60);
        f.vy *= 0.986;
        const glowR = f.r * (1.2 + 0.3 * Math.sin(t * 6.5 + f.twinkle));
        fxCtx.globalAlpha = Math.max(0, Math.sin(prog * Math.PI) * 0.72);
        fxCtx.drawImage(sprites.glow[f.sprite] || sprites.glow.gold, f.x - glowR, f.y - glowR, glowR * 2, glowR * 2);
      }
      fxCtx.restore();
    }

    // ============================================================================
    // 7. POINTER & TOUCH INTERACTION (แยกการแตะออกจากการไถเลื่อนหน้าจอ)
    // ============================================================================
    let lastTrailTs = 0;
    let tapStartX = 0;
    let tapStartY = 0;

    function handleTapBurst(clientX, clientY) {
      const rect = stage.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;

      if (y >= state.waterY - 6) {
        spawnWaterRipple(x, Math.max(state.waterY + 8, y), 68);
        for (let i = 0; i < 6; i++) spawnFirefly(x, y, true, 'jade');
        return;
      }

      if (bloomRipples.length >= 5) bloomRipples.shift();
      bloomRipples.push({
        x: x,
        y: y,
        r: 12,
        maxR: Math.min(rect.width, rect.height) * 0.28 + 60,
        life: 0,
        maxLife: 1.2
      });
      for (let i = 0; i < 10; i++) spawnFirefly(x, y, true);
      for (let i = 0; i < 8; i++) spawnWindParticle(x, y, true, i === 0);

      const wakeR = Math.max(170, state.treeW * 0.46);
      const nowTs = performance.now();
      for (let i = 0; i < blossomNodes.length; i++) {
        const b = blossomNodes[i];
        if (Math.hypot(b.x - x, b.y - y) < wakeR) {
          b.bloomed = true;
          b.lastWaveTs = nowTs;
          b.haloFlash = 1.0;
        }
      }
    }

    const onMouseMove = function (e) {
      state.targetMouseX = (e.clientX / Math.max(1, global.innerWidth) - 0.5) * 2;
      state.targetMouseY = (e.clientY / Math.max(1, global.innerHeight) - 0.5) * 2;
      const nowTs = performance.now();
      if (nowTs - lastTrailTs > 46) {
        lastTrailTs = nowTs;
        const sRect = stage.getBoundingClientRect();
        if (e.clientX >= sRect.left && e.clientX <= sRect.right && e.clientY >= sRect.top && e.clientY <= sRect.bottom) {
          spawnFirefly(e.clientX - sRect.left, e.clientY - sRect.top, false);
        }
      }
      if (refs.glassStage) {
        const rect = refs.glassStage.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
          refs.glassStage.style.setProperty('--gx', (((e.clientX - rect.left) / rect.width) * 100).toFixed(1) + '%');
          refs.glassStage.style.setProperty('--gy', (((e.clientY - rect.top) / rect.height) * 100).toFixed(1) + '%');
        }
      }
    };

    const onMouseDown = function (e) {
      if (e.target && e.target.closest && e.target.closest('button, a, input, select')) return;
      handleTapBurst(e.clientX, e.clientY);
    };

    const onTouchStart = function (e) {
      if (e.touches && e.touches[0]) {
        tapStartX = e.touches[0].clientX;
        tapStartY = e.touches[0].clientY;
      }
    };

    const onTouchEnd = function (e) {
      if (e.target && e.target.closest && e.target.closest('button, a, input, select')) return;
      const pt = e.changedTouches && e.changedTouches[0];
      if (pt && Math.hypot(pt.clientX - tapStartX, pt.clientY - tapStartY) < 12) {
        handleTapBurst(pt.clientX, pt.clientY);
      }
    };

    let resizeTm = null;
    const onResize = function () {
      clearTimeout(resizeTm);
      resizeTm = setTimeout(function () { syncLayout(false); }, 140);
    };

    let io = null;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(function (entries) {
        state.inView = Boolean(entries[0] && entries[0].isIntersecting);
      }, { threshold: 0.02 });
      io.observe(stage);
    }

    syncLayout(true);
    rafId = requestAnimationFrame(renderLoop);
    global.addEventListener('resize', onResize);
    global.addEventListener('mousemove', onMouseMove);
    stage.addEventListener('mousedown', onMouseDown);
    stage.addEventListener('touchstart', onTouchStart, { passive: true });
    stage.addEventListener('touchend', onTouchEnd, { passive: true });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { if (alive) syncLayout(true); }).catch(function () {});
    }

    return {
      triggerWindGust: triggerWindGust,
      syncLayout: syncLayout,
      destroy: function () {
        alive = false;
        clearTimeout(resizeTm);
        if (rafId) cancelAnimationFrame(rafId);
        if (io) io.disconnect();
        global.removeEventListener('resize', onResize);
        global.removeEventListener('mousemove', onMouseMove);
        stage.removeEventListener('mousedown', onMouseDown);
        stage.removeEventListener('touchstart', onTouchStart);
        stage.removeEventListener('touchend', onTouchEnd);
      }
    };
  }

  global.RJCLOUD_HERO_PEACH = {
    JADE_LEAVES: JADE_LEAVES,
    mount: mount
  };
})(window);
