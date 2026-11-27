/* ============================================================================
 * rjcloud.organ 2.0 — Moonlit Peach Cliff Sanctuary Engine (Ultra-Smooth 60/120FPS)
 * File: hero-peach-engine.js (Zero-Build Standalone Production Module)
 * Public Exports: window.RJCLOUD_HERO_PEACH
 *
 * องค์ประกอบฉากระดับภาพยนตร์ทั้งหมด (คำนวณแบบ dt-driven อัลตร้าสมูททุกเฟรม):
 * 1. ดวงจันทร์เสี้ยว + หมู่ดาวระยิบระยับ + ดาวตก 4 สาย
 * 2. นกกระเรียนเงิน 3 ตัว กระพือปีกอ่อนช้อยพร้อมทางแสงละอองดาว
 * 3. ทิวเขาในหมอก + ทะเลสะท้อนแสงจันทร์ + หน้าผาหินสีเข้ม
 * 4. ต้นดอกท้อทรงลู่ลมปักดินสมจริงบนปลายหน้าผา (ไร้รากลอย) + พุ่มดอกท้อ 3 ชั้นแสงเงา
 * 5. แสงปราณอัลตร้าสมูทช้าๆ ไหลขึ้นลำต้นแยกตามกิ่งปลุกดอกท้อให้เรืองแสงอบอุ่น
 * 6. หมอกหนาวเย็นสมจริง 4 ชั้นความลึก + เกล็ดน้ำค้างแสงจันทร์ + หิ่งห้อยแสง
 * ============================================================================ */

(function (global) {
  'use strict';

  // Deterministic Seeded PRNG for consistent organic silhouettes & mist textures
  function createRng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  // Evaluate Cubic Bezier point at u in [0, 1]
  function evalCubic(p0, p1, p2, p3, u) {
    const inv = 1 - u;
    const a = inv * inv * inv;
    const b = 3 * inv * inv * u;
    const c = 3 * inv * u * u;
    const d = u * u * u;
    return [
      a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
      a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]
    ];
  }

  // ============================================================================
  // SHARED PRE-RENDERED OFFSCREEN SPRITES (CREATED ONCE FOR ZERO FRAME DROPS)
  // ============================================================================
  let sharedSprites = null;

  function createBlossomClusterSprite(mode) {
    const c = document.createElement('canvas');
    c.width = 96;
    c.height = 96;
    const bc = c.getContext('2d');
    const rng = createRng(mode === 'shadow' ? 101 : mode === 'mid' ? 202 : 303);

    if (mode === 'shadow') {
      for (let i = 0; i < 9; i++) {
        const px = 48 + (rng() - 0.5) * 44;
        const py = 48 + (rng() - 0.5) * 32;
        const rad = 14 + rng() * 14;
        const g = bc.createRadialGradient(px, py, 2, px, py, rad);
        g.addColorStop(0, 'rgba(74, 24, 58, 0.86)');
        g.addColorStop(0.65, 'rgba(42, 16, 46, 0.58)');
        g.addColorStop(1, 'rgba(20, 10, 32, 0)');
        bc.fillStyle = g;
        bc.beginPath();
        bc.arc(px, py, rad, 0, Math.PI * 2);
        bc.fill();
      }
      return c;
    }

    const aura = bc.createRadialGradient(48, 48, 6, 48, 48, 44);
    if (mode === 'light') {
      aura.addColorStop(0, 'rgba(255, 244, 248, 0.55)');
      aura.addColorStop(0.55, 'rgba(249, 168, 212, 0.22)');
      aura.addColorStop(1, 'rgba(244, 114, 182, 0)');
    } else {
      aura.addColorStop(0, 'rgba(244, 114, 182, 0.36)');
      aura.addColorStop(0.6, 'rgba(190, 24, 93, 0.14)');
      aura.addColorStop(1, 'rgba(157, 23, 77, 0)');
    }
    bc.fillStyle = aura;
    bc.beginPath();
    bc.arc(48, 48, 44, 0, Math.PI * 2);
    bc.fill();

    const flowerCount = mode === 'light' ? 5 : 6;
    for (let f = 0; f < flowerCount; f++) {
      const fx = 48 + (rng() - 0.5) * 42;
      const fy = 48 + (rng() - 0.5) * 32;
      const scale = 0.62 + rng() * 0.48;
      const baseRot = rng() * Math.PI * 2;

      for (let p = 0; p < 5; p++) {
        const ang = baseRot + (p * Math.PI * 2) / 5;
        bc.save();
        bc.translate(fx + Math.cos(ang) * 7.2 * scale, fy + Math.sin(ang) * 7.2 * scale);
        bc.rotate(ang);
        const pg = bc.createRadialGradient(-1.5, 0, 0.8, 0, 0, 8 * scale);
        if (mode === 'light') {
          pg.addColorStop(0, '#ffffff');
          pg.addColorStop(0.48, '#fdf2f8');
          pg.addColorStop(0.84, '#fbcfe8');
          pg.addColorStop(1, '#f472b6');
        } else {
          pg.addColorStop(0, '#fce7f3');
          pg.addColorStop(0.5, '#f9a8d4');
          pg.addColorStop(0.85, '#db2777');
          pg.addColorStop(1, '#831843');
        }
        bc.fillStyle = pg;
        bc.beginPath();
        bc.ellipse(0, 0, 7.6 * scale, 5.2 * scale, 0, 0, Math.PI * 2);
        bc.fill();
        bc.restore();
      }

      bc.fillStyle = mode === 'light' ? '#fef08a' : '#fbcfe8';
      bc.beginPath();
      bc.arc(fx, fy, 2.2 * scale, 0, Math.PI * 2);
      bc.fill();
    }
    return c;
  }

  function createCrescentSprite() {
    const moonSprite = document.createElement('canvas');
    moonSprite.width = 160;
    moonSprite.height = 160;
    const mc = moonSprite.getContext('2d');
    const cx = 80, cy = 80, r = 34;

    const glow = mc.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * 2.25);
    glow.addColorStop(0, 'rgba(224, 242, 254, 0.52)');
    glow.addColorStop(0.45, 'rgba(147, 197, 253, 0.16)');
    glow.addColorStop(1, 'rgba(147, 197, 253, 0)');
    mc.fillStyle = glow;
    mc.beginPath();
    mc.arc(cx, cy, r * 2.25, 0, Math.PI * 2);
    mc.fill();

    const tmp = document.createElement('canvas');
    tmp.width = 160;
    tmp.height = 160;
    const tc = tmp.getContext('2d');
    tc.fillStyle = '#f8fdff';
    tc.shadowColor = 'rgba(191, 219, 254, 0.95)';
    tc.shadowBlur = 12;
    tc.beginPath();
    tc.arc(cx, cy, r, 0, Math.PI * 2);
    tc.fill();

    tc.globalCompositeOperation = 'destination-out';
    tc.shadowBlur = 0;
    tc.beginPath();
    tc.arc(cx - 12, cy - 8, r * 0.96, 0, Math.PI * 2);
    tc.fill();

    mc.drawImage(tmp, 0, 0);
    return moonSprite;
  }

  function createColdMistSprite(seed, variant) {
    const c = document.createElement('canvas');
    const isPlume = variant === 'plume';
    c.width = isPlume ? 180 : 420;
    c.height = isPlume ? 340 : 190;
    const mc = c.getContext('2d');
    const rng = createRng(seed);

    const puffs = isPlume ? 24 : (variant === 'wisp' ? 28 : 34);
    for (let i = 0; i < puffs; i++) {
      let px, py, rx, ry;
      if (isPlume) {
        const u = i / Math.max(1, puffs - 1);
        px = c.width * 0.5 + (rng() - 0.5) * (36 + u * 54);
        py = 38 + u * (c.height - 84) + (rng() - 0.5) * 18;
        rx = 26 + u * 28 + rng() * 18;
        ry = 34 + rng() * 30;
      } else if (variant === 'wisp') {
        const u = i / Math.max(1, puffs - 1);
        const arch = Math.sin(u * Math.PI);
        px = 68 + u * (c.width - 136) + (rng() - 0.5) * 28;
        py = c.height * 0.52 + (rng() - 0.5) * (24 + arch * 34);
        rx = (44 + rng() * 54) * (0.65 + arch * 0.45);
        ry = (18 + rng() * 22) * (0.6 + arch * 0.5);
      } else {
        const u = i / Math.max(1, puffs - 1);
        const dome = Math.sin(u * Math.PI);
        px = 76 + u * (c.width - 152) + (rng() - 0.5) * 44;
        py = c.height * 0.56 - dome * 12 + (rng() - 0.5) * 38;
        rx = (56 + rng() * 68) * (0.65 + dome * 0.45);
        ry = (28 + rng() * 34) * (0.65 + dome * 0.45);
      }

      const toneRoll = rng();
      const col = toneRoll < 0.42
        ? '214, 238, 255'
        : toneRoll < 0.78
          ? '176, 222, 252'
          : '142, 202, 246';
      const peakAlpha = isPlume ? (0.065 + rng() * 0.055) : (0.048 + rng() * 0.046);

      mc.save();
      mc.translate(px, py);
      mc.scale(1, ry / Math.max(1, rx));
      const g = mc.createRadialGradient(0, 0, rx * 0.08, 0, 0, rx);
      g.addColorStop(0, 'rgba(' + col + ', ' + peakAlpha.toFixed(3) + ')');
      g.addColorStop(0.52, 'rgba(' + col + ', ' + (peakAlpha * 0.48).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(' + col + ', 0)');
      mc.fillStyle = g;
      mc.beginPath();
      mc.arc(0, 0, rx, 0, Math.PI * 2);
      mc.fill();
      mc.restore();
    }
    return c;
  }

  function getSharedSprites() {
    if (sharedSprites) return sharedSprites;
    sharedSprites = {
      blossomShadow: createBlossomClusterSprite('shadow'),
      blossomMid: createBlossomClusterSprite('mid'),
      blossomLight: createBlossomClusterSprite('light'),
      moon: createCrescentSprite(),
      coldMistCloud: createColdMistSprite(7711, 'cloud'),
      coldMistWisp: createColdMistSprite(8822, 'wisp'),
      coldMistPlume: createColdMistSprite(9933, 'plume')
    };
    return sharedSprites;
  }

  // ============================================================================
  // MAIN MOUNTABLE ENGINE INSTANCE (CALLED BY index.html LandingHeroScreen)
  // ============================================================================
  function mount(refs) {
    const stage = refs && refs.stage;
    const canvas = refs && (refs.canvas || refs.bgCanvas);
    if (!stage || !canvas) return { destroy: function () {} };

    const ctx = canvas.getContext('2d');
    if (!ctx) return { destroy: function () {} };

    const sprites = getSharedSprites();
    let W = stage.clientWidth || global.innerWidth || 1280;
    let H = stage.clientHeight || global.innerHeight || 720;
    let disposed = false;
    let rafId = null;

    // Grounded Windswept Ancient Peach Tree Skeleton (Zero Floating Roots)
    const trunkCurve = [[0.04, 0.025], [-0.01, -0.09], [-0.08, -0.21], [-0.11, -0.34]];

    const primaryBoughs = [
      { id: 0, trunkT: 0.62, w0: 0.036, w1: 0.008, pts: [[-0.06, -0.20], [-0.26, -0.26], [-0.52, -0.28], [-0.82, -0.21]] },
      { id: 1, trunkT: 0.78, w0: 0.033, w1: 0.008, pts: [[-0.09, -0.27], [-0.28, -0.40], [-0.50, -0.46], [-0.70, -0.41]] },
      { id: 2, trunkT: 0.92, w0: 0.028, w1: 0.007, pts: [[-0.10, -0.32], [-0.22, -0.50], [-0.36, -0.63], [-0.50, -0.61]] },
      { id: 3, trunkT: 1.00, w0: 0.027, w1: 0.007, pts: [[-0.11, -0.34], [-0.15, -0.54], [-0.16, -0.69], [-0.18, -0.76]] },
      { id: 4, trunkT: 0.98, w0: 0.026, w1: 0.007, pts: [[-0.10, -0.33], [0.02, -0.52], [0.12, -0.67], [0.22, -0.73]] },
      { id: 5, trunkT: 0.88, w0: 0.028, w1: 0.007, pts: [[-0.08, -0.30], [0.12, -0.46], [0.30, -0.57], [0.47, -0.56]] },
      { id: 6, trunkT: 0.74, w0: 0.030, w1: 0.008, pts: [[-0.06, -0.24], [0.16, -0.34], [0.38, -0.41], [0.58, -0.36]] }
    ];

    const secondaryTwigs = [
      { parentId: 0, w0: 0.015, w1: 0.004, pts: [[-0.38, -0.26], [-0.48, -0.35], [-0.58, -0.38], [-0.67, -0.35]] },
      { parentId: 0, w0: 0.013, w1: 0.004, pts: [[-0.56, -0.26], [-0.66, -0.24], [-0.76, -0.26], [-0.88, -0.24]] },
      { parentId: 0, w0: 0.012, w1: 0.003, pts: [[-0.24, -0.24], [-0.34, -0.19], [-0.44, -0.18], [-0.52, -0.21]] },
      { parentId: 1, w0: 0.015, w1: 0.004, pts: [[-0.36, -0.42], [-0.46, -0.52], [-0.54, -0.56], [-0.62, -0.53]] },
      { parentId: 1, w0: 0.012, w1: 0.003, pts: [[-0.48, -0.45], [-0.58, -0.45], [-0.67, -0.47], [-0.76, -0.45]] },
      { parentId: 2, w0: 0.013, w1: 0.004, pts: [[-0.26, -0.53], [-0.32, -0.64], [-0.36, -0.71], [-0.42, -0.70]] },
      { parentId: 2, w0: 0.012, w1: 0.003, pts: [[-0.34, -0.60], [-0.44, -0.64], [-0.52, -0.64], [-0.58, -0.59]] },
      { parentId: 3, w0: 0.013, w1: 0.004, pts: [[-0.15, -0.56], [-0.06, -0.66], [-0.02, -0.74], [-0.03, -0.79]] },
      { parentId: 3, w0: 0.012, w1: 0.003, pts: [[-0.16, -0.64], [-0.24, -0.71], [-0.30, -0.75], [-0.35, -0.73]] },
      { parentId: 4, w0: 0.013, w1: 0.004, pts: [[0.06, -0.56], [0.16, -0.65], [0.24, -0.69], [0.32, -0.68]] },
      { parentId: 4, w0: 0.012, w1: 0.003, pts: [[0.02, -0.50], [0.06, -0.62], [0.08, -0.72], [0.10, -0.78]] },
      { parentId: 5, w0: 0.014, w1: 0.004, pts: [[0.22, -0.51], [0.32, -0.61], [0.40, -0.64], [0.49, -0.62]] },
      { parentId: 5, w0: 0.012, w1: 0.003, pts: [[0.34, -0.56], [0.44, -0.54], [0.52, -0.52], [0.58, -0.49]] },
      { parentId: 6, w0: 0.014, w1: 0.004, pts: [[0.24, -0.36], [0.36, -0.45], [0.46, -0.48], [0.55, -0.46]] },
      { parentId: 6, w0: 0.012, w1: 0.003, pts: [[0.40, -0.39], [0.50, -0.37], [0.58, -0.38], [0.65, -0.36]] }
    ];

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

    function samplePathAt(pathPts, tNorm) {
      const clamped = Math.max(0, Math.min(1, tNorm));
      const idxF = clamped * (pathPts.length - 1);
      const i0 = Math.floor(idxF);
      const i1 = Math.min(pathPts.length - 1, i0 + 1);
      const frac = idxF - i0;
      return [
        pathPts[i0][0] + (pathPts[i1][0] - pathPts[i0][0]) * frac,
        pathPts[i0][1] + (pathPts[i1][1] - pathPts[i0][1]) * frac
      ];
    }

    const canopyClusters = [];
    (function seedCanopy() {
      const rng = createRng(202705);
      function addClusterRing(pts, parentId, startU, count, baseSpread, sizeMul) {
        for (let k = 0; k < count; k++) {
          const u = startU + (k / Math.max(1, count - 1)) * (1 - startU);
          const bp = evalCubic(pts[0], pts[1], pts[2], pts[3], u);
          const pathProgress = 0.42 + u * 0.58;

          canopyClusters.push({
            layer: 0, parentId: parentId, pathU: pathProgress,
            lx: bp[0] + (rng() - 0.5) * baseSpread * 1.4,
            ly: bp[1] + 0.022 + (rng() - 0.5) * baseSpread * 0.8,
            size: (44 + rng() * 26) * sizeMul, rot: rng() * Math.PI * 2, ph: rng() * Math.PI * 2,
            bloom: 0.88, glow: 0
          });
          canopyClusters.push({
            layer: 1, parentId: parentId, pathU: pathProgress,
            lx: bp[0] + (rng() - 0.5) * baseSpread * 1.65,
            ly: bp[1] - 0.008 + (rng() - 0.5) * baseSpread * 0.95,
            size: (36 + rng() * 24) * sizeMul, rot: rng() * Math.PI * 2, ph: rng() * Math.PI * 2,
            bloom: 0.84, glow: 0
          });
          if (rng() > 0.22) {
            canopyClusters.push({
              layer: 2, parentId: parentId, pathU: pathProgress,
              lx: bp[0] + (rng() - 0.5) * baseSpread * 1.5,
              ly: bp[1] - 0.032 + (rng() - 0.5) * baseSpread * 0.75,
              size: (28 + rng() * 22) * sizeMul, rot: rng() * Math.PI * 2, ph: rng() * Math.PI * 2,
              bloom: 0.80, glow: 0
            });
          }
        }
      }
      primaryBoughs.forEach(function (b) { addClusterRing(b.pts, b.id, 0.56, 6, 0.075, 1.05); });
      secondaryTwigs.forEach(function (tw) { addClusterRing(tw.pts, tw.parentId, 0.42, 4, 0.068, 0.92); });
      canopyClusters.sort(function (a, b) { return a.layer - b.layer; });
    })();

    const qiWaves = primaryBoughs.map(function (b, idx) {
      return { pathIdx: b.id, prog: (idx * 0.145) % 1, speed: 0.056 + (idx % 3) * 0.007, tailLen: 0.24 };
    });

    const cliffPetals = Array.from({ length: 32 }, function (_, i) {
      return {
        x: 0.14 + (i / 32) * 0.58,
        y: 0.16 + Math.random() * 0.42,
        vx: -(0.011 + Math.random() * 0.018),
        vy: 0.012 + Math.random() * 0.020,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 1.6,
        sz: 2.6 + Math.random() * 2.8,
        ph: Math.random() * Math.PI * 2
      };
    });

    const silverCranes = [
      { x: 0.78, y: 0.19, vx: -0.022, vy: -0.0022, scale: 1.08, wingSpd: 3.1, ph: 0.0, trail: [] },
      { x: 0.94, y: 0.14, vx: -0.017, vy: -0.0014, scale: 0.78, wingSpd: 3.5, ph: 2.1, trail: [] },
      { x: 0.42, y: 0.26, vx: -0.026, vy: -0.0018, scale: 0.64, wingSpd: 3.9, ph: 4.3, trail: [] }
    ];

    const shootingStars = [
      { active: false, x: 0.78, y: 0.08, vx: -0.26, vy: 0.13, life: 0, maxLife: 1.45, nextAt: 1.2, tint: '254, 243, 199' },
      { active: false, x: 0.92, y: 0.15, vx: -0.30, vy: 0.15, life: 0, maxLife: 1.30, nextAt: 4.4, tint: '224, 242, 254' },
      { active: false, x: 0.62, y: 0.06, vx: -0.24, vy: 0.12, life: 0, maxLife: 1.55, nextAt: 7.8, tint: '251, 207, 232' },
      { active: false, x: 0.86, y: 0.22, vx: -0.28, vy: 0.14, life: 0, maxLife: 1.35, nextAt: 10.6, tint: '255, 251, 235' }
    ];

    const stars = Array.from({ length: 85 }, function () {
      return { x: Math.random(), y: Math.random() * 0.46, r: 0.55 + Math.random() * 1.25, tw: 1.2 + Math.random() * 2.8, ph: Math.random() * Math.PI * 2 };
    });

    const seaMistLayers = Array.from({ length: 14 }, function (_, i) {
      return {
        x: -0.35 + (i / 14) * 1.7 + (Math.random() - 0.5) * 0.08,
        y: 0.34 + (i % 5) * 0.045 + Math.random() * 0.03,
        w: 0.42 + Math.random() * 0.34,
        h: 0.17 + Math.random() * 0.13,
        vx: 0.0055 + Math.random() * 0.0075,
        alpha: 0.34 + Math.random() * 0.24,
        bobAmp: 4 + Math.random() * 6,
        bobSpd: 0.24 + Math.random() * 0.22,
        ph: Math.random() * Math.PI * 2,
        sprite: i % 2 === 0 ? sprites.coldMistCloud : sprites.coldMistWisp
      };
    });

    const plateauMistWisps = Array.from({ length: 10 }, function (_, i) {
      return {
        x: 0.16 + (i / 10) * 0.92,
        y: 0.50 + Math.random() * 0.075,
        w: 0.30 + Math.random() * 0.24,
        h: 0.11 + Math.random() * 0.08,
        vx: 0.007 + Math.random() * 0.009,
        alpha: 0.30 + Math.random() * 0.22,
        bobAmp: 3 + Math.random() * 4.5,
        bobSpd: 0.30 + Math.random() * 0.22,
        ph: Math.random() * Math.PI * 2,
        sprite: sprites.coldMistWisp
      };
    });

    const cliffCascadePlumes = Array.from({ length: 22 }, function (_, i) {
      const cleft = i % 3;
      const baseX = cleft === 0
        ? 0.292 + (Math.random() - 0.5) * 0.048
        : cleft === 1
          ? 0.495 + (Math.random() - 0.5) * 0.065
          : 0.385 + (Math.random() - 0.5) * 0.060;
      return {
        baseX: baseX,
        topY: cleft === 0 ? 0.535 : 0.545,
        dropLen: 0.26 + Math.random() * 0.22,
        speed: 0.042 + Math.random() * 0.038,
        prog: i / 22,
        w: 0.075 + Math.random() * 0.065,
        h: 0.18 + Math.random() * 0.12,
        driftX: -(0.012 + Math.random() * 0.018),
        alpha: 0.26 + Math.random() * 0.20,
        ph: Math.random() * Math.PI * 2
      };
    });

    const foregroundFrostVeil = Array.from({ length: 11 }, function (_, i) {
      return {
        x: -0.35 + (i / 11) * 1.7,
        y: 0.64 + (i % 4) * 0.075 + Math.random() * 0.03,
        w: 0.46 + Math.random() * 0.36,
        h: 0.18 + Math.random() * 0.12,
        vx: 0.0085 + Math.random() * 0.011,
        alpha: 0.24 + Math.random() * 0.18,
        bobAmp: 5 + Math.random() * 6,
        bobSpd: 0.20 + Math.random() * 0.18,
        ph: Math.random() * Math.PI * 2,
        sprite: i % 3 === 0 ? sprites.coldMistCloud : sprites.coldMistWisp
      };
    });

    const chillCrystals = Array.from({ length: 34 }, function () {
      return {
        x: Math.random(),
        y: 0.32 + Math.random() * 0.56,
        vx: 0.006 + Math.random() * 0.010,
        vy: (Math.random() - 0.5) * 0.004,
        r: 0.7 + Math.random() * 1.15,
        tw: 1.4 + Math.random() * 2.2,
        ph: Math.random() * Math.PI * 2
      };
    });

    const glints = Array.from({ length: 120 }, function () {
      const depth = Math.random();
      return {
        depth: depth,
        spread: (Math.random() - 0.5) * 2,
        len: 8 + depth * 42 + Math.random() * 18,
        speed: 1.4 + Math.random() * 2.6,
        ph: Math.random() * Math.PI * 2,
        warm: Math.random() < 0.28
      };
    });

    const motes = Array.from({ length: 26 }, function (_, i) {
      const warmCoral = i < 9;
      return {
        x: warmCoral ? (0.67 + (Math.random() - 0.5) * 0.09) : (0.28 + Math.random() * 0.66),
        y: warmCoral ? (0.43 + Math.random() * 0.13) : (0.36 + Math.random() * 0.44),
        vy: 0.008 + Math.random() * 0.015,
        r: warmCoral ? (1.4 + Math.random() * 1.8) : (1.0 + Math.random() * 1.5),
        ph: Math.random() * Math.PI * 2,
        warmCoral: warmCoral
      };
    });

    function resize() {
      const rect = stage.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const dpr = Math.min(global.devicePixelRatio || 1, 2);
      W = rect.width;
      H = rect.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    let ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(resize);
      ro.observe(stage);
    }
    global.addEventListener('resize', resize);

    function drawDistantMountains(horizonY) {
      ctx.beginPath();
      ctx.moveTo(W * 0.28, horizonY);
      ctx.lineTo(W * 0.44, horizonY - H * 0.13);
      ctx.lineTo(W * 0.53, horizonY - H * 0.18);
      ctx.lineTo(W * 0.61, horizonY - H * 0.23);
      ctx.lineTo(W * 0.71, horizonY - H * 0.19);
      ctx.lineTo(W * 0.84, horizonY - H * 0.34);
      ctx.lineTo(W * 0.94, horizonY - H * 0.41);
      ctx.lineTo(W * 1.04, horizonY - H * 0.45);
      ctx.lineTo(W * 1.04, horizonY + H * 0.05);
      ctx.closePath();

      const mg = ctx.createLinearGradient(0, horizonY - H * 0.44, 0, horizonY);
      mg.addColorStop(0, 'rgba(7, 17, 36, 0.88)');
      mg.addColorStop(0.65, 'rgba(13, 33, 64, 0.72)');
      mg.addColorStop(1, 'rgba(28, 66, 114, 0.18)');
      ctx.fillStyle = mg;
      ctx.fill();
    }

    function drawMoonlitOcean(horizonY, moonX, t) {
      const seaGrad = ctx.createLinearGradient(0, horizonY, 0, H);
      seaGrad.addColorStop(0, '#1e3e6b');
      seaGrad.addColorStop(0.28, '#132a4f');
      seaGrad.addColorStop(0.68, '#0b1a36');
      seaGrad.addColorStop(1, '#040a18');
      ctx.fillStyle = seaGrad;
      ctx.fillRect(0, horizonY, W, H - horizonY);

      const colGrad = ctx.createRadialGradient(
        moonX * 0.86, horizonY + (H - horizonY) * 0.32, 10,
        moonX * 0.86, horizonY + (H - horizonY) * 0.48, Math.max(W * 0.22, 170)
      );
      colGrad.addColorStop(0, 'rgba(235, 224, 255, 0.42)');
      colGrad.addColorStop(0.4, 'rgba(186, 214, 255, 0.18)');
      colGrad.addColorStop(1, 'rgba(15, 34, 68, 0)');
      ctx.fillStyle = colGrad;
      ctx.fillRect(0, horizonY, W * 0.56, H - horizonY);

      const seaH = H - horizonY;
      const reflectCenter = moonX * 0.86;
      for (let i = 0; i < glints.length; i++) {
        const g = glints[i];
        const py = horizonY + 8 + Math.pow(g.depth, 1.38) * (seaH - 14);
        const halfSpan = (0.045 + g.depth * 0.13) * W;
        const sway = Math.sin(t * g.speed + g.ph) * (5 + g.depth * 14);
        const px = reflectCenter + g.spread * halfSpan + sway;
        const fade = Math.max(0.12, 1 - Math.abs(g.spread) * 0.82);
        const pulse = 0.45 + 0.55 * Math.sin(t * (g.speed * 1.15) + g.ph);
        const alpha = (0.16 + 0.56 * pulse) * fade;
        const hThick = 1.0 + g.depth * 2.2;

        ctx.fillStyle = g.warm
          ? 'rgba(243, 228, 255, ' + alpha.toFixed(2) + ')'
          : 'rgba(219, 238, 255, ' + alpha.toFixed(2) + ')';
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(px - g.len / 2, py, g.len, hThick, 2);
        } else {
          ctx.rect(px - g.len / 2, py, g.len, hThick);
        }
        ctx.fill();
      }
    }

    function drawDramaticCliff(t, dt) {
      const isNarrow = W < 640;
      const leftEdge = isNarrow ? 0.14 : 0.285;

      ctx.beginPath();
      ctx.moveTo(W * (leftEdge + 0.04), H * 1.02);
      ctx.lineTo(W * (leftEdge + 0.025), H * 0.78);
      ctx.lineTo(W * (leftEdge - 0.005), H * 0.61);
      ctx.lineTo(W * (leftEdge + 0.008), H * 0.545);
      ctx.lineTo(W * 0.37, H * 0.535);
      ctx.lineTo(W * 0.44, H * 0.542);
      ctx.lineTo(W * 0.485, H * 0.532);
      ctx.lineTo(W * 0.56, H * 0.528);
      ctx.lineTo(W * 0.66, H * 0.538);
      ctx.lineTo(W * 0.77, H * 0.532);
      ctx.lineTo(W * 0.86, H * 0.515);
      ctx.lineTo(W * 0.94, H * 0.485);
      ctx.lineTo(W * 1.03, H * 0.45);
      ctx.lineTo(W * 1.03, H * 1.02);
      ctx.closePath();

      const cliffGrad = ctx.createLinearGradient(W * leftEdge, H * 0.52, W * 0.72, H);
      cliffGrad.addColorStop(0, '#1a334d');
      cliffGrad.addColorStop(0.22, '#0f2034');
      cliffGrad.addColorStop(0.55, '#071222');
      cliffGrad.addColorStop(1, '#02060f');
      ctx.fillStyle = cliffGrad;
      ctx.fill();

      ctx.save();
      ctx.clip();

      ctx.beginPath();
      ctx.moveTo(W * (isNarrow ? 0.10 : 0.34), H * 1.02);
      ctx.lineTo(W * (isNarrow ? 0.14 : 0.38), H * 0.62);
      ctx.lineTo(W * 0.48, H * 0.558);
      ctx.lineTo(W * 0.64, H * 0.570);
      ctx.lineTo(W * 0.78, H * 0.585);
      ctx.lineTo(W * 0.90, H * 0.61);
      ctx.lineTo(W * 1.03, H * 0.58);
      ctx.lineTo(W * 1.03, H * 1.02);
      ctx.closePath();
      const darkRock = ctx.createLinearGradient(0, H * 0.55, 0, H);
      darkRock.addColorStop(0, 'rgba(9, 20, 36, 0.88)');
      darkRock.addColorStop(0.45, 'rgba(4, 11, 24, 0.94)');
      darkRock.addColorStop(1, 'rgba(2, 6, 14, 0.98)');
      ctx.fillStyle = darkRock;
      ctx.fill();

      const bounce1 = ctx.createRadialGradient(W * (leftEdge + 0.05), H * 0.65, 8, W * (leftEdge + 0.05), H * 0.68, W * 0.14);
      bounce1.addColorStop(0, 'rgba(94, 212, 232, 0.24)');
      bounce1.addColorStop(0.55, 'rgba(56, 154, 198, 0.09)');
      bounce1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bounce1;
      ctx.fillRect(W * leftEdge, H * 0.52, W * 0.32, H * 0.48);

      const rootX = W * (isNarrow ? 0.54 : 0.495);
      const rootY = H * 0.532;
      const qiRockGlow = ctx.createRadialGradient(rootX, rootY, 4, rootX, rootY + H * 0.03, W * 0.18);
      qiRockGlow.addColorStop(0, 'rgba(253, 186, 210, 0.28)');
      qiRockGlow.addColorStop(0.45, 'rgba(253, 224, 71, 0.10)');
      qiRockGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = qiRockGlow;
      ctx.fillRect(W * leftEdge, H * 0.49, W * 0.52, H * 0.30);

      ctx.strokeStyle = 'rgba(186, 230, 253, 0.52)';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(W * (leftEdge + 0.008), H * 0.546);
      ctx.lineTo(W * 0.37, H * 0.536);
      ctx.lineTo(W * 0.44, H * 0.543);
      ctx.lineTo(W * 0.485, H * 0.533);
      ctx.lineTo(W * 0.56, H * 0.529);
      ctx.lineTo(W * 0.66, H * 0.539);
      ctx.lineTo(W * 0.77, H * 0.533);
      ctx.lineTo(W * 0.86, H * 0.516);
      ctx.stroke();

      ctx.restore();

      for (let i = 0; i < cliffCascadePlumes.length; i++) {
        const p = cliffCascadePlumes[i];
        p.prog = (p.prog + p.speed * dt) % 1;
        const fade = Math.pow(Math.sin(p.prog * Math.PI), 1.15);
        if (fade < 0.01) continue;

        const baseShift = isNarrow ? (p.baseX - 0.12) : p.baseX;
        const sway = Math.sin(t * 0.48 + p.ph) * 8;
        const px = (baseShift + p.driftX * p.prog) * W + sway;
        const py = (p.topY + p.dropLen * p.prog) * H;
        const pw = p.w * W * (0.85 + p.prog * 0.65);
        const ph = p.h * H * (0.88 + p.prog * 0.45);

        ctx.save();
        ctx.globalAlpha = Math.min(0.68, p.alpha * fade);
        ctx.drawImage(sprites.coldMistPlume, px - pw / 2, py - ph * 0.45, pw, ph);
        ctx.restore();
      }
    }

    function drawTaperedLimb(ptsScreen, wStart, wEnd, fillStyle) {
      const steps = 16;
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
        const halfW = (wStart * Math.pow(1 - u, 0.85) + wEnd * u) * 0.5;
        leftSide.push([p[0] + nx * halfW, p[1] + ny * halfW]);
        rightSide.push([p[0] - nx * halfW, p[1] - ny * halfW]);
      }
      ctx.fillStyle = fillStyle;
      ctx.beginPath();
      ctx.moveTo(leftSide[0][0], leftSide[0][1]);
      for (let i = 1; i <= steps; i++) ctx.lineTo(leftSide[i][0], leftSide[i][1]);
      for (let i = steps; i >= 0; i--) ctx.lineTo(rightSide[i][0], rightSide[i][1]);
      ctx.closePath();
      ctx.fill();
    }

    function drawCliffPeachTree(t, dt) {
      const isNarrow = W < 640;
      const rootX = W * (isNarrow ? 0.54 : 0.495);
      const rootY = H * (isNarrow ? 0.534 : 0.532);
      const S = Math.min(W * (isNarrow ? 0.62 : 0.44), H * (isNarrow ? 0.40 : 0.49));

      function toScreen(pt) {
        return [rootX + pt[0] * S, rootY + pt[1] * S];
      }

      const crownCx = rootX - 0.12 * S;
      const crownCy = rootY - 0.50 * S;
      const auraR = S * 0.88;
      const auraGrad = ctx.createRadialGradient(crownCx, crownCy, S * 0.08, crownCx, crownCy, auraR);
      auraGrad.addColorStop(0, 'rgba(249, 168, 212, 0.22)');
      auraGrad.addColorStop(0.52, 'rgba(244, 114, 182, 0.08)');
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(crownCx, crownCy, auraR, 0, Math.PI * 2);
      ctx.fill();

      const shadowGrad = ctx.createRadialGradient(rootX + 0.03 * S, rootY + 2, 4, rootX + 0.03 * S, rootY + 4, S * 0.24);
      shadowGrad.addColorStop(0, 'rgba(2, 6, 15, 0.92)');
      shadowGrad.addColorStop(0.55, 'rgba(4, 11, 24, 0.52)');
      shadowGrad.addColorStop(1, 'rgba(4, 11, 24, 0)');
      ctx.save();
      ctx.translate(rootX + 0.03 * S, rootY + 2);
      ctx.scale(1, 0.22);
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, S * 0.24, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      const sizeScale = Math.min(1.08, Math.max(0.62, S / 340));
      for (let i = 0; i < canopyClusters.length; i++) {
        const cl = canopyClusters[i];
        if (cl.layer !== 0) continue;
        const pos = toScreen([cl.lx, cl.ly]);
        const swayX = Math.sin(t * 0.85 + cl.ph) * 2.0;
        const swayY = Math.cos(t * 0.70 + cl.ph) * 1.4;
        const sz = cl.size * sizeScale;
        ctx.save();
        ctx.translate(pos[0] + swayX, pos[1] + swayY);
        ctx.rotate(cl.rot);
        ctx.drawImage(sprites.blossomShadow, -sz / 2, -sz / 2, sz, sz);
        ctx.restore();
      }

      const trunkPts = trunkCurve.map(toScreen);
      const barkGrad = ctx.createLinearGradient(rootX - 0.14 * S, rootY - 0.36 * S, rootX + 0.08 * S, rootY + 0.03 * S);
      barkGrad.addColorStop(0, '#3a223d');
      barkGrad.addColorStop(0.45, '#1e1427');
      barkGrad.addColorStop(1, '#0d0d19');

      drawTaperedLimb(trunkPts, S * 0.076, S * 0.028, barkGrad);

      ctx.save();
      ctx.strokeStyle = 'rgba(219, 234, 254, 0.26)';
      ctx.lineWidth = Math.max(1.2, S * 0.005);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(trunkPts[0][0] - S * 0.034, trunkPts[0][1] - 2);
      ctx.bezierCurveTo(
        trunkPts[1][0] - S * 0.028, trunkPts[1][1],
        trunkPts[2][0] - S * 0.020, trunkPts[2][1],
        trunkPts[3][0] - S * 0.012, trunkPts[3][1]
      );
      ctx.stroke();
      ctx.restore();

      const boughFill = ctx.createLinearGradient(rootX - 0.75 * S, rootY - 0.25 * S, rootX + 0.55 * S, rootY - 0.72 * S);
      boughFill.addColorStop(0, '#271a31');
      boughFill.addColorStop(0.5, '#1a1324');
      boughFill.addColorStop(1, '#2a1b33');

      for (let b = 0; b < primaryBoughs.length; b++) {
        const br = primaryBoughs[b];
        drawTaperedLimb(br.pts.map(toScreen), S * br.w0, S * br.w1, boughFill);
      }

      for (let tw = 0; tw < secondaryTwigs.length; tw++) {
        const sb = secondaryTwigs[tw];
        drawTaperedLimb(sb.pts.map(toScreen), S * sb.w0, S * sb.w1, '#1e1528');
      }

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(rootX - 0.14 * S, rootY + 5);
      ctx.quadraticCurveTo(rootX - 0.02 * S, rootY - 0.026 * S, rootX + 0.16 * S, rootY + 5);
      ctx.closePath();
      const moundGrad = ctx.createLinearGradient(0, rootY - 0.028 * S, 0, rootY + 6);
      moundGrad.addColorStop(0, '#142a3b');
      moundGrad.addColorStop(0.6, '#0b1828');
      moundGrad.addColorStop(1, '#07111f');
      ctx.fillStyle = moundGrad;
      ctx.fill();
      ctx.restore();

      // Ultra-Smooth Slow Qi Spirit Ribbons
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
          const uSample = tailU + (headU - tailU) * (s / segs);
          ribbonPts.push(toScreen(samplePathAt(path, uSample)));
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
        ctx.lineWidth = Math.max(7, S * 0.028);
        ctx.beginPath();
        ctx.moveTo(ribbonPts[0][0], ribbonPts[0][1]);
        for (let s = 1; s < ribbonPts.length; s++) ctx.lineTo(ribbonPts[s][0], ribbonPts[s][1]);
        ctx.stroke();

        const silkRibbon = ctx.createLinearGradient(pTail[0], pTail[1], pHead[0], pHead[1]);
        silkRibbon.addColorStop(0, 'rgba(253, 186, 210, 0)');
        silkRibbon.addColorStop(0.45, 'rgba(253, 224, 71, ' + (0.42 * env).toFixed(3) + ')');
        silkRibbon.addColorStop(0.85, 'rgba(255, 248, 220, ' + (0.78 * env).toFixed(3) + ')');
        silkRibbon.addColorStop(1, 'rgba(255, 255, 255, ' + (0.92 * env).toFixed(3) + ')');
        ctx.strokeStyle = silkRibbon;
        ctx.lineWidth = Math.max(2.6, S * 0.010);
        ctx.beginPath();
        ctx.moveTo(ribbonPts[0][0], ribbonPts[0][1]);
        for (let s = 1; s < ribbonPts.length; s++) ctx.lineTo(ribbonPts[s][0], ribbonPts[s][1]);
        ctx.stroke();

        const orbR = Math.max(8, S * 0.036);
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

      for (let i = 0; i < canopyClusters.length; i++) {
        const cl = canopyClusters[i];
        if (cl.layer === 0) continue;

        const baseBloom = cl.layer === 1 ? 0.88 : 0.84;
        cl.bloom += (baseBloom - cl.bloom) * (1 - Math.exp(-dt * 1.4));
        cl.glow = Math.max(0, cl.glow - dt * 0.65);

        const pos = toScreen([cl.lx, cl.ly]);
        const swayX = Math.sin(t * 0.92 + cl.ph) * 2.4;
        const swayY = Math.cos(t * 0.78 + cl.ph) * 1.6;
        const px = pos[0] + swayX;
        const py = pos[1] + swayY;
        const sz = cl.size * sizeScale * cl.bloom;
        const sprite = cl.layer === 1 ? sprites.blossomMid : sprites.blossomLight;

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(cl.rot + Math.sin(t * 0.45 + cl.ph) * 0.06);
        ctx.drawImage(sprite, -sz / 2, -sz / 2, sz, sz);

        if (cl.glow > 0.03) {
          ctx.globalCompositeOperation = 'lighter';
          const gRad = sz * 0.65;
          const gg = ctx.createRadialGradient(0, 0, 2, 0, 0, gRad);
          gg.addColorStop(0, 'rgba(255, 248, 220, ' + (0.42 * cl.glow).toFixed(3) + ')');
          gg.addColorStop(0.55, 'rgba(249, 168, 212, ' + (0.22 * cl.glow).toFixed(3) + ')');
          gg.addColorStop(1, 'rgba(244, 114, 182, 0)');
          ctx.fillStyle = gg;
          ctx.beginPath();
          ctx.arc(0, 0, gRad, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      for (let i = 0; i < cliffPetals.length; i++) {
        const pt = cliffPetals[i];
        pt.x += (pt.vx + Math.sin(t * 0.9 + pt.ph) * 0.006) * dt;
        pt.y += (pt.vy + Math.cos(t * 0.7 + pt.ph) * 0.004) * dt;
        pt.rot += pt.vr * dt;

        if (pt.x < -0.05 || pt.y > 0.92) {
          pt.x = (rootX + (-0.65 + Math.random() * 1.15) * S) / W;
          pt.y = (rootY + (-0.72 + Math.random() * 0.45) * S) / H;
        }

        ctx.save();
        ctx.translate(pt.x * W, pt.y * H);
        ctx.rotate(pt.rot);
        ctx.fillStyle = 'rgba(252, 231, 243, 0.84)';
        ctx.beginPath();
        ctx.ellipse(0, 0, pt.sz, pt.sz * 0.56, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
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
        const textGuard = dimRightSide && m.x > 0.46 ? 0.52 : 1.0;

        const alpha = m.alpha * edgeFade * breath * textGuard;
        if (alpha < 0.008) continue;

        const mw = m.w * W;
        const mh = m.h * H;
        const mx = m.x * W;
        const my = m.y * H + Math.sin(t * m.bobSpd + m.ph) * m.bobAmp;

        ctx.save();
        ctx.globalAlpha = Math.min(0.78, alpha);
        ctx.drawImage(m.sprite, mx - mw / 2, my - mh / 2, mw, mh);
        ctx.restore();
      }
    }

    function drawSilverCranes(t, dt) {
      for (let i = 0; i < silverCranes.length; i++) {
        const cr = silverCranes[i];
        cr.x += cr.vx * dt;
        cr.y += (cr.vy + Math.sin(t * 0.9 + cr.ph) * 0.004) * dt;

        if (cr.x < -0.14 || cr.y < 0.04) {
          cr.x = 1.08 + Math.random() * 0.16;
          cr.y = 0.12 + Math.random() * 0.22;
          cr.trail.length = 0;
        }

        const cx = cr.x * W;
        const cy = cr.y * H;
        const sc = cr.scale * Math.min(1.12, Math.max(0.68, W / 1180));

        cr.trail.push([cx + 12 * sc, cy + 2 * sc]);
        if (cr.trail.length > 26) cr.trail.shift();

        if (cr.trail.length > 2) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          for (let k = 1; k < cr.trail.length; k++) {
            const alpha = (k / cr.trail.length) * 0.34;
            ctx.strokeStyle = 'rgba(224, 242, 254, ' + alpha.toFixed(3) + ')';
            ctx.lineWidth = (k / cr.trail.length) * 2.2 * sc;
            ctx.beginPath();
            ctx.moveTo(cr.trail[k - 1][0], cr.trail[k - 1][1]);
            ctx.lineTo(cr.trail[k][0], cr.trail[k][1]);
            ctx.stroke();
          }
          ctx.restore();
        }

        const flap = Math.sin(t * cr.wingSpd + cr.ph);
        const tipLag = Math.sin(t * cr.wingSpd + cr.ph - 0.65);

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(sc, sc);

        const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 30);
        glow.addColorStop(0, 'rgba(241, 245, 249, 0.32)');
        glow.addColorStop(0.55, 'rgba(186, 230, 253, 0.12)');
        glow.addColorStop(1, 'rgba(186, 230, 253, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(203, 213, 225, 0.72)';
        ctx.lineWidth = 2.0;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-2, -1);
        ctx.quadraticCurveTo(6, -11 - flap * 9, 17, -14 - tipLag * 12);
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 3.2, -0.08, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.3;
        ctx.beginPath();
        ctx.moveTo(-8, -0.5);
        ctx.quadraticCurveTo(-15, -2.5, -21, -2.0);
        ctx.stroke();

        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(-21, -2.0);
        ctx.lineTo(-26, -1.6);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(226, 232, 240, 0.78)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(9, 1);
        ctx.lineTo(22, 3.5);
        ctx.moveTo(9, 2);
        ctx.lineTo(20, 5.2);
        ctx.stroke();

        const wg = ctx.createLinearGradient(0, 0, 14, -18 * flap);
        wg.addColorStop(0, '#ffffff');
        wg.addColorStop(0.65, '#e0f2fe');
        wg.addColorStop(1, '#94a3b8');
        ctx.fillStyle = wg;
        ctx.beginPath();
        ctx.moveTo(-4, 0);
        ctx.quadraticCurveTo(4, -13 * flap - 2, 16, -17 * tipLag - 4);
        ctx.quadraticCurveTo(9, -4 * flap + 2, 7, 1.5);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }
    }

    function drawShootingStars(t, dt) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      for (let i = 0; i < shootingStars.length; i++) {
        const st = shootingStars[i];
        if (!st.active && t > st.nextAt) {
          st.active = true;
          st.x = 0.42 + Math.random() * 0.56;
          st.y = 0.04 + Math.random() * 0.22;
          st.vx = -(0.22 + Math.random() * 0.14);
          st.vy = 0.10 + Math.random() * 0.07;
          st.life = 0;
        }
        if (!st.active) continue;

        st.life += dt;
        const norm = Math.min(1, st.life / st.maxLife);
        const fade = Math.sin(norm * Math.PI);
        const tailDelay = 0.22;

        const px = (st.x + st.vx * st.life) * W;
        const py = (st.y + st.vy * st.life) * H;
        const tx = (st.x + st.vx * Math.max(0, st.life - tailDelay)) * W;
        const ty = (st.y + st.vy * Math.max(0, st.life - tailDelay)) * H;

        const sg = ctx.createLinearGradient(px, py, tx, ty);
        sg.addColorStop(0, 'rgba(255, 255, 255, ' + (0.95 * fade).toFixed(3) + ')');
        sg.addColorStop(0.35, 'rgba(' + st.tint + ', ' + (0.62 * fade).toFixed(3) + ')');
        sg.addColorStop(1, 'rgba(' + st.tint + ', 0)');

        ctx.strokeStyle = sg;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(tx, ty);
        ctx.stroke();

        const headGlow = ctx.createRadialGradient(px, py, 0.4, px, py, 7.5);
        headGlow.addColorStop(0, 'rgba(255, 255, 255, ' + (0.98 * fade).toFixed(3) + ')');
        headGlow.addColorStop(0.5, 'rgba(' + st.tint + ', ' + (0.45 * fade).toFixed(3) + ')');
        headGlow.addColorStop(1, 'rgba(' + st.tint + ', 0)');
        ctx.fillStyle = headGlow;
        ctx.beginPath();
        ctx.arc(px, py, 7.5, 0, Math.PI * 2);
        ctx.fill();

        if (st.life >= st.maxLife) {
          st.active = false;
          st.nextAt = t + 4.5 + Math.random() * 6.5;
        }
      }
      ctx.restore();
    }

    let lastTs = performance.now();
    function render(now) {
      if (disposed) return;
      rafId = requestAnimationFrame(render);
      if (document.hidden || W <= 0 || H <= 0) return;

      const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) * 0.001));
      lastTs = now;
      const t = now * 0.001;

      ctx.clearRect(0, 0, W, H);

      const horizonY = H * 0.54;
      const moonX = W * (W < 640 ? 0.22 : 0.185);
      const moonY = H * (W < 640 ? 0.13 : 0.145);

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const a = 0.16 + 0.64 * (0.5 + 0.5 * Math.sin(t * s.tw + s.ph));
        ctx.fillStyle = 'rgba(235, 245, 255, ' + a.toFixed(2) + ')';
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      drawShootingStars(t, dt);

      const moonSize = Math.min(W, H) * (W < 640 ? 0.21 : 0.19);
      ctx.drawImage(sprites.moon, moonX - moonSize / 2, moonY - moonSize / 2, moonSize, moonSize);

      drawSilverCranes(t, dt);
      drawDistantMountains(horizonY);
      drawMoonlitOcean(horizonY, moonX, t);
      drawColdMistLayer(seaMistLayers, t, dt, false);
      drawDramaticCliff(t, dt);
      drawColdMistLayer(plateauMistWisps, t, dt, false);
      drawCliffPeachTree(t, dt);
      drawColdMistLayer(foregroundFrostVeil, t, dt, true);

      for (let i = 0; i < chillCrystals.length; i++) {
        const cr = chillCrystals[i];
        cr.x += cr.vx * dt;
        cr.y += (cr.vy + Math.sin(t * 0.6 + cr.ph) * 0.0025) * dt;
        if (cr.x > 1.04) cr.x = -0.04;
        if (cr.y < 0.28) cr.y = 0.86;
        if (cr.y > 0.88) cr.y = 0.30;

        const glint = 0.18 + 0.58 * (0.5 + 0.5 * Math.sin(t * cr.tw + cr.ph));
        const cx = cr.x * W;
        const cy = cr.y * H;
        const cg = ctx.createRadialGradient(cx, cy, 0.2, cx, cy, cr.r * 3.0);
        cg.addColorStop(0, 'rgba(235, 248, 255, ' + glint.toFixed(2) + ')');
        cg.addColorStop(0.5, 'rgba(186, 230, 253, ' + (glint * 0.38).toFixed(2) + ')');
        cg.addColorStop(1, 'rgba(125, 211, 252, 0)');
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.arc(cx, cy, cr.r * 3.0, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = 0; i < motes.length; i++) {
        const mt = motes[i];
        mt.y -= mt.vy * dt;
        if (mt.y < 0.24) mt.y = mt.warmCoral ? 0.54 : 0.78;
        const px = mt.x * W + Math.sin(t * 1.1 + mt.ph) * 10;
        const py = mt.y * H;
        const pulse = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 2.8 + mt.ph));
        const rad = mt.r * (1.2 + pulse * 0.6);

        const gg = ctx.createRadialGradient(px, py, 0.3, px, py, rad * 3.8);
        if (mt.warmCoral) {
          gg.addColorStop(0, 'rgba(255, 240, 232, ' + (0.85 * pulse).toFixed(2) + ')');
          gg.addColorStop(0.45, 'rgba(251, 146, 168, ' + (0.42 * pulse).toFixed(2) + ')');
          gg.addColorStop(1, 'rgba(251, 113, 133, 0)');
        } else {
          gg.addColorStop(0, 'rgba(224, 247, 255, ' + (0.78 * pulse).toFixed(2) + ')');
          gg.addColorStop(0.5, 'rgba(125, 211, 252, ' + (0.28 * pulse).toFixed(2) + ')');
          gg.addColorStop(1, 'rgba(56, 189, 248, 0)');
        }
        ctx.fillStyle = gg;
        ctx.beginPath();
        ctx.arc(px, py, rad * 3.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    rafId = requestAnimationFrame(render);

    return {
      destroy: function () {
        disposed = true;
        if (rafId) cancelAnimationFrame(rafId);
        if (ro) {
          try { ro.disconnect(); } catch (_) {}
        }
        global.removeEventListener('resize', resize);
      }
    };
  }

  global.RJCLOUD_HERO_PEACH = {
    version: '2027.09-moonlit-cliff',
    mount: mount
  };
})(typeof window !== 'undefined' ? window : globalThis);
