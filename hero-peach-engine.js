/* ============================================================================
 * organ cloud 2.0 — Moonlit Peach Cliff Pure WebGPU Engine (iPhone Metal)
 * File: hero-peach-engine.js (Zero-Build Standalone Production Module)
 * Version: 2027.24-webgpu-only
 * Public Exports: window.RJCLOUD_HERO_PEACH
 *
 * Pure Native WebGPU Only (WGSL + Compute Shader 4,096 อนุภาคบน GPU)
 * ไม่มี WebGL2 และไม่มี 2D Canvas Fallback
 *
 * รองรับครบทั้ง index.html (หน้าแรก e-Learning) และ aiskilllab.html (ต้นดอกท้อ 10 สเต็ป):
 *   ctrl.setBloomProgress(0..1) | ctrl.triggerQiSurge() | ctrl.setStormEnabled(bool)
 *   ctrl.triggerLightning()     | ctrl.destroy()
 * ============================================================================ */

(function (global) {
  'use strict';

  const PARTICLE_COUNT = 4096;

  // ==========================================================================
  // 1. PROCEDURAL 1024x1024 BOTANICAL PEACH TREE ATLAS (FOR WEBGPU TEXTURE)
  // ==========================================================================
  // 1. PROCEDURAL 1024x1024 BOTANICAL PEACH TREE ATLAS (FOR WEBGPU & WEBGL2)
  // ==========================================================================
  function buildBotanicalPeachTreeAtlas() {
    const S = 1024;
    const cv = document.createElement('canvas');
    cv.width = S;
    cv.height = S;
    const c = cv.getContext('2d');
    if (!c) return cv;

    let seed = 202788;
    const rng = function () {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const evalCubic = function (p0, p1, p2, p3, u) {
      const inv = 1 - u;
      return [
        inv * inv * inv * p0[0] + 3 * inv * inv * u * p1[0] + 3 * inv * u * u * p2[0] + u * u * u * p3[0],
        inv * inv * inv * p0[1] + 3 * inv * inv * u * p1[1] + 3 * inv * u * u * p2[1] + u * u * u * p3[1]
      ];
    };

    const rx = S * 0.55;
    const ry = S * 0.86;
    const sc = S * 0.56;
    const toP = function (pt) { return [rx + pt[0] * sc, ry + pt[1] * sc]; };

    function drawBlossomCluster(cx, cy, rad, mode) {
      if (mode === 'shadow') {
        for (let i = 0; i < 6; i++) {
          const px = cx + (rng() - 0.5) * rad * 1.1;
          const py = cy + (rng() - 0.5) * rad * 0.8;
          const r2 = rad * (0.45 + rng() * 0.45);
          const g = c.createRadialGradient(px, py, 2, px, py, r2);
          g.addColorStop(0, 'rgba(42, 12, 36, 0.90)');
          g.addColorStop(0.6, 'rgba(24, 8, 28, 0.55)');
          g.addColorStop(1, 'rgba(12, 6, 20, 0)');
          c.fillStyle = g;
          c.beginPath(); c.arc(px, py, r2, 0, Math.PI * 2); c.fill();
        }
        return;
      }

      const halo = c.createRadialGradient(cx, cy, 4, cx, cy, rad * 1.24);
      halo.addColorStop(0, mode === 'mid' ? 'rgba(219, 39, 119, 0.30)' : 'rgba(255, 238, 246, 0.46)');
      halo.addColorStop(0.55, mode === 'mid' ? 'rgba(157, 23, 77, 0.10)' : 'rgba(249, 168, 212, 0.18)');
      halo.addColorStop(1, 'rgba(244, 114, 182, 0)');
      c.fillStyle = halo;
      c.beginPath(); c.arc(cx, cy, rad * 1.24, 0, Math.PI * 2); c.fill();

      const flowers = mode === 'hero' ? 4 : 6;
      for (let f = 0; f < flowers; f++) {
        const fx = cx + (rng() - 0.5) * rad * 1.15;
        const fy = cy + (rng() - 0.5) * rad * 0.88;
        const fs = (rad / 42) * (0.72 + rng() * 0.48);
        const rot = rng() * Math.PI * 2;

        if (mode === 'mid' && rng() > 0.65) {
          c.save(); c.translate(fx, fy); c.rotate(rot + 1.2);
          const lg = c.createLinearGradient(0, 0, 18 * fs, 0);
          lg.addColorStop(0, '#16352c'); lg.addColorStop(0.65, '#2b6150'); lg.addColorStop(1, '#6ee7b7');
          c.fillStyle = lg;
          c.beginPath();
          c.moveTo(2 * fs, 0); c.quadraticCurveTo(10 * fs, -4 * fs, 19 * fs, 0);
          c.quadraticCurveTo(10 * fs, 4 * fs, 2 * fs, 0); c.fill();
          c.restore();
        }

        for (let p = 0; p < 5; p++) {
          const ang = rot + (p * Math.PI * 2) / 5;
          c.save(); c.translate(fx, fy); c.rotate(ang);
          const pg = c.createRadialGradient(3 * fs, 0, 0.5 * fs, 9 * fs, 0, 14 * fs);
          if (mode === 'sss') {
            pg.addColorStop(0, '#fff7ed'); pg.addColorStop(0.35, '#ffe4e6');
            pg.addColorStop(0.75, '#fbcfe8'); pg.addColorStop(1, 'rgba(244, 114, 182, 0.88)');
          } else if (mode === 'light' || mode === 'hero') {
            pg.addColorStop(0, '#be185d'); pg.addColorStop(0.22, '#f9a8d4');
            pg.addColorStop(0.68, '#ffffff'); pg.addColorStop(1, '#fbcfe8');
          } else {
            pg.addColorStop(0, '#831843'); pg.addColorStop(0.28, '#db2777');
            pg.addColorStop(0.72, '#f9a8d4'); pg.addColorStop(1, '#fce7f3');
          }
          c.fillStyle = pg;
          c.beginPath();
          c.moveTo(0, 0);
          c.bezierCurveTo(4 * fs, -6.2 * fs, 13.5 * fs, -6.8 * fs, 15.5 * fs, -1.4 * fs);
          c.quadraticCurveTo(14.0 * fs, 0, 15.5 * fs, 1.4 * fs);
          c.bezierCurveTo(13.5 * fs, 6.8 * fs, 4 * fs, 6.2 * fs, 0, 0);
          c.fill();
          c.restore();
        }

        c.fillStyle = '#9d174d';
        c.beginPath(); c.arc(fx, fy, 2.5 * fs, 0, Math.PI * 2); c.fill();
        for (let s = 0; s < 7; s++) {
          const sa = rot + (s * Math.PI * 2) / 7;
          const sl = (4.8 + (s % 2) * 1.4) * fs;
          const sx = fx + Math.cos(sa) * sl, sy = fy + Math.sin(sa) * sl;
          c.strokeStyle = 'rgba(255, 244, 248, 0.72)'; c.lineWidth = 0.7 * fs;
          c.beginPath(); c.moveTo(fx, fy); c.lineTo(sx, sy); c.stroke();
          c.fillStyle = '#fef08a';
          c.beginPath(); c.arc(sx, sy, 1.0 * fs, 0, Math.PI * 2); c.fill();
        }
      }
    }

    function drawBarkLimb(pts, w0, w1, bSeed, detailed) {
      const steps = detailed ? 22 : 12;
      const ls = [], rs = [];
      for (let i = 0; i <= steps; i++) {
        const u = i / steps;
        const p = evalCubic(pts[0], pts[1], pts[2], pts[3], u);
        const pN = evalCubic(pts[0], pts[1], pts[2], pts[3], Math.min(1, u + 0.015));
        const pP = evalCubic(pts[0], pts[1], pts[2], pts[3], Math.max(0, u - 0.015));
        const dx = pN[0] - pP[0], dy = pN[1] - pP[1], len = Math.hypot(dx, dy) || 1;
        const knot = detailed ? 1 + Math.sin(u * 15 + bSeed) * 0.07 : 1;
        const hw = (w0 * Math.pow(1 - u, 0.80) + w1 * u) * 0.5 * knot;
        ls.push([p[0] + (-dy / len) * hw, p[1] + (dx / len) * hw]);
        rs.push([p[0] - (-dy / len) * hw, p[1] - (dx / len) * hw]);
      }
      c.save();
      c.beginPath();
      c.moveTo(ls[0][0], ls[0][1]);
      for (let i = 1; i <= steps; i++) c.lineTo(ls[i][0], ls[i][1]);
      for (let i = steps; i >= 0; i--) c.lineTo(rs[i][0], rs[i][1]);
      c.closePath();

      const g = c.createLinearGradient(pts[0][0] - w0, pts[0][1], pts[3][0] + w0, pts[3][1]);
      g.addColorStop(0, '#442b47'); g.addColorStop(0.35, '#211529');
      g.addColorStop(0.75, '#120c1a'); g.addColorStop(1, '#2a1831');
      c.fillStyle = g;
      c.fill();

      if (detailed && w0 > 6) {
        c.clip();
        c.lineCap = 'round';
        for (let f = 0; f < 6; f++) {
          const tOff = f / 5;
          c.strokeStyle = f === 0 ? 'rgba(186, 230, 253, 0.34)' : f === 5 ? 'rgba(249, 168, 212, 0.22)' : 'rgba(6, 3, 12, 0.56)';
          c.lineWidth = Math.max(1.2, w0 * (f === 0 ? 0.10 : 0.07));
          c.beginPath();
          for (let i = 0; i <= steps; i++) {
            const bx = ls[i][0] + (rs[i][0] - ls[i][0]) * tOff;
            const by = ls[i][1] + (rs[i][1] - ls[i][1]) * tOff;
            if (i === 0) c.moveTo(bx, by);
            else c.lineTo(bx + (rng() - 0.5) * 1.5, by);
          }
          c.stroke();
        }
      }
      c.restore();
    }

    const trunk = [[0.05, 0.04], [-0.02, -0.14], [-0.11, -0.32], [-0.14, -0.52]];
    const roots = [
      [[0.02, 0.01], [-0.07, 0.03], [-0.17, 0.05], [-0.27, 0.07]],
      [[0.06, 0.01], [0.14, 0.03], [0.24, 0.05], [0.32, 0.07]],
      [[0.04, 0.02], [0.00, 0.05], [-0.06, 0.08], [-0.11, 0.10]]
    ];
    const boughs = [
      { w0: 0.060, w1: 0.011, pts: [[-0.08, -0.30], [-0.36, -0.40], [-0.66, -0.42], [-0.94, -0.32]] },
      { w0: 0.052, w1: 0.010, pts: [[-0.12, -0.40], [-0.38, -0.60], [-0.64, -0.70], [-0.86, -0.62]] },
      { w0: 0.046, w1: 0.009, pts: [[-0.13, -0.48], [-0.28, -0.74], [-0.46, -0.92], [-0.64, -0.90]] },
      { w0: 0.042, w1: 0.009, pts: [[-0.14, -0.52], [-0.18, -0.80], [-0.20, -1.02], [-0.22, -1.16]] },
      { w0: 0.040, w1: 0.009, pts: [[-0.13, -0.50], [0.04, -0.78], [0.18, -0.98], [0.32, -1.08]] },
      { w0: 0.044, w1: 0.009, pts: [[-0.10, -0.44], [0.18, -0.68], [0.44, -0.84], [0.66, -0.82]] },
      { w0: 0.048, w1: 0.010, pts: [[-0.08, -0.36], [0.22, -0.52], [0.52, -0.60], [0.76, -0.52]] }
    ];
    const twigs = [];
    boughs.forEach(function (b) {
      for (let i = 0; i < 4; i++) {
        const u = 0.42 + (i / 4) * 0.52;
        const p0 = evalCubic(b.pts[0], b.pts[1], b.pts[2], b.pts[3], u);
        const pN = evalCubic(b.pts[0], b.pts[1], b.pts[2], b.pts[3], Math.min(1, u + 0.05));
        const baseA = Math.atan2(pN[1] - p0[1], pN[0] - p0[0]);
        const dir = i % 2 === 0 ? 1 : -1;
        const a = baseA + dir * (0.38 + rng() * 0.45);
        const len = 0.16 + rng() * 0.14;
        twigs.push({
          w0: 0.016, w1: 0.003,
          pts: [
            p0,
            [p0[0] + Math.cos(a) * len * 0.45, p0[1] + Math.sin(a) * len * 0.45 - 0.02],
            [p0[0] + Math.cos(a + dir * 0.2) * len * 0.8, p0[1] + Math.sin(a + dir * 0.2) * len * 0.8 - 0.03],
            [p0[0] + Math.cos(a + dir * 0.28) * len, p0[1] + Math.sin(a + dir * 0.28) * len - 0.02]
          ]
        });
      }
    });

    boughs.forEach(function (b) {
      for (let k = 0; k < 6; k++) {
        const p = toP(evalCubic(b.pts[0], b.pts[1], b.pts[2], b.pts[3], 0.45 + (k / 5) * 0.55));
        drawBlossomCluster(p[0], p[1] + 18, 52 + rng() * 24, 'shadow');
      }
    });

    roots.forEach(function (rt, idx) { drawBarkLimb(rt.map(toP), sc * 0.040, sc * 0.006, 300 + idx * 17, true); });
    drawBarkLimb(trunk.map(toP), sc * 0.120, sc * 0.044, 101, true);
    boughs.forEach(function (b, idx) { drawBarkLimb(b.pts.map(toP), sc * b.w0, sc * b.w1, 200 + idx * 29, true); });
    twigs.forEach(function (tw, idx) { drawBarkLimb(tw.pts.map(toP), sc * tw.w0, sc * tw.w1, 500 + idx, false); });

    boughs.forEach(function (b) {
      for (let k = 0; k < 7; k++) {
        const pt = evalCubic(b.pts[0], b.pts[1], b.pts[2], b.pts[3], 0.48 + (k / 6) * 0.52);
        const p = toP(pt);
        drawBlossomCluster(p[0] + (rng() - 0.5) * 32, p[1] - 4 + (rng() - 0.5) * 24, 44 + rng() * 20, 'mid');
        if (rng() > 0.18) {
          drawBlossomCluster(p[0] - 8 + (rng() - 0.5) * 28, p[1] - 18 + (rng() - 0.5) * 18, 36 + rng() * 18, pt[0] < -0.15 ? 'sss' : 'light');
        }
      }
    });
    twigs.forEach(function (tw, idx) {
      const p = toP(tw.pts[3]);
      drawBlossomCluster(p[0], p[1], 32 + rng() * 16, idx % 3 === 0 ? 'sss' : 'hero');
    });

    return cv;
  }

  let cachedTreeAtlas = null;
  function getTreeAtlas() {
    if (!cachedTreeAtlas) cachedTreeAtlas = buildBotanicalPeachTreeAtlas();
    return cachedTreeAtlas;
  }

  function createParticleSeedBuffer(count) {
    const data = new Float32Array(count * 12);
    let s = 902027;
    const r = function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
    for (let i = 0; i < count; i++) {
      const o = i * 12;
      let kind = 0.0;
      if (i >= count * 0.60 && i < count * 0.84) kind = 1.0;
      else if (i >= count * 0.84 && i < count * 0.90) kind = 2.0;
      else if (i >= count * 0.90) kind = 3.0;
      data[o + 0] = r(); data[o + 1] = r(); data[o + 2] = r();
      data[o + 3] = kind === 2.0 ? (13.0 + r() * 20.0) : (kind === 1.0 ? (3.0 + r() * 4.4) : (kind === 3.0 ? (2.0 + r() * 2.8) : (3.4 + r() * 4.8)));
      data[o + 4] = kind === 1.0 ? ((r() - 0.5) * 0.024) : -(0.016 + r() * 0.038);
      data[o + 5] = kind === 1.0 ? -(0.018 + r() * 0.036) : (0.013 + r() * 0.032);
      data[o + 6] = r() * Math.PI * 2; data[o + 7] = r() * Math.PI * 2;
      data[o + 8] = kind; data[o + 9] = r() * 100.0;
      data[o + 10] = kind === 2.0 ? (0.15 + r() * 0.20) : (0.45 + r() * 0.48);
      data[o + 11] = (r() - 0.5) * 3.2;
    }
    return data;
  }

  // ==========================================================================
  // 2. WGSL SHADERS (STRICT-COMPLIANT FOR APPLE METAL / CHROME / SAFARI)
  // ==========================================================================
  const WGSL_WORLD = /* wgsl */`
    struct Uniforms {
      res_time: vec4<f32>,   // W, H, time, dt
      ptr_env: vec4<f32>,    // ptrX, ptrY, flashAmt, flashX
      fx_ctrl: vec4<f32>,    // flashY, qiSurge, bloomProg, stormOn
      tree_rect: vec4<f32>,  // centerX, baseY, scaleX, scaleY
    };
    @group(0) @binding(0) var<uniform> u: Uniforms;
    @group(0) @binding(1) var treeTex: texture_2d<f32>;
    @group(0) @binding(2) var treeSamp: sampler;

    struct VSOut {
      @builtin(position) pos: vec4<f32>,
      @location(0) uv: vec2<f32>,
    };

    @vertex
    fn vs_quad(@builtin(vertex_index) vid: u32) -> VSOut {
      var pts = array<vec2<f32>, 3>(vec2<f32>(-1.0, -1.0), vec2<f32>(3.0, -1.0), vec2<f32>(-1.0, 3.0));
      var out: VSOut;
      let p = pts[vid];
      out.pos = vec4<f32>(p, 0.0, 1.0);
      out.uv = vec2<f32>(p.x * 0.5 + 0.5, 0.5 - p.y * 0.5);
      return out;
    }

    fn sstep(a: f32, b: f32, x: f32) -> f32 {
      let t = clamp((x - a) / (b - a), 0.0, 1.0);
      return t * t * (3.0 - 2.0 * t);
    }
    fn sq(x: f32) -> f32 { return x * x; }

    fn hash21(p: vec2<f32>) -> f32 {
      var p3 = fract(vec3<f32>(p.x, p.y, p.x) * 0.1031);
      let d = dot(p3, p3.yzx + vec3<f32>(33.33));
      p3 = p3 + vec3<f32>(d);
      return fract((p3.x + p3.y) * p3.z);
    }
    fn noise2(p: vec2<f32>) -> f32 {
      let i = floor(p);
      let f = fract(p);
      let s = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash21(i), hash21(i + vec2<f32>(1.0, 0.0)), s.x),
                 mix(hash21(i + vec2<f32>(0.0, 1.0)), hash21(i + vec2<f32>(1.0, 1.0)), s.x), s.y);
    }
    fn fbm4(p_in: vec2<f32>) -> f32 {
      var p = p_in; var v = 0.0; var a = 0.5;
      let rot = mat2x2<f32>(0.8, 0.6, -0.6, 0.8);
      for (var i = 0; i < 4; i++) { v += a * noise2(p); p = rot * p * 2.04 + vec2<f32>(13.1, 7.7); a *= 0.5; }
      return v;
    }
    fn fbm5(p_in: vec2<f32>) -> f32 {
      var p = p_in; var v = 0.0; var a = 0.5;
      let rot = mat2x2<f32>(0.8, 0.6, -0.6, 0.8);
      for (var i = 0; i < 5; i++) { v += a * noise2(p); p = rot * p * 2.06 + vec2<f32>(9.3, 17.2); a *= 0.5; }
      return v;
    }
    fn sdSegment(p: vec2<f32>, a: vec2<f32>, b: vec2<f32>) -> f32 {
      let pa = p - a; let ba = b - a;
      let h = clamp(dot(pa, ba) / max(dot(ba, ba), 0.00001), 0.0, 1.0);
      return length(pa - ba * h);
    }

    @fragment
    fn fs_main(in: VSOut) -> @location(0) vec4<f32> {
      let uv = in.uv;
      let aspect = u.res_time.x / max(u.res_time.y, 1.0);
      let t = u.res_time.z;
      let ptrX = u.ptr_env.x;
      let ptrY = u.ptr_env.y;
      let flashAmt = u.ptr_env.z;
      let flashX = u.ptr_env.w;
      let flashY = u.fx_ctrl.x;
      let qiSurge = u.fx_ctrl.y;
      let bloomProg = clamp(u.fx_ctrl.z, 0.05, 1.0);
      let stormOn = u.fx_ctrl.w;
      let isPortrait = aspect < 0.85;
      let horizon = 0.545;

      let skyUv = uv + vec2<f32>(ptrX * 0.008, ptrY * 0.005);
      let moonCenter = vec2<f32>(select(0.185, 0.22, isPortrait), select(0.155, 0.135, isPortrait));
      let toMoon = (skyUv - moonCenter) * vec2<f32>(aspect, 1.0);
      let distMoon = length(toMoon);

      let skyT = clamp(uv.y / horizon, 0.0, 1.0);
      var col = mix(vec3<f32>(0.008, 0.020, 0.062), vec3<f32>(0.055, 0.135, 0.285), pow(max(skyT, 0.0001), 1.25));
      col += vec3<f32>(0.10, 0.20, 0.36) * sstep(0.68, 1.0, skyT) * 0.55;

      let mwP = (skyUv - vec2<f32>(0.58, 0.22)) * vec2<f32>(aspect, 1.0);
      let mwRot = vec2<f32>(mwP.x * 0.88 - mwP.y * 0.47, mwP.x * 0.47 + mwP.y * 0.88);
      let mwBand = exp(-mwRot.y * mwRot.y * 18.0) * sstep(0.65, 0.05, skyT);
      let mwDust = fbm5(mwRot * 4.5 + vec2<f32>(2.1, -1.4));
      col += vec3<f32>(0.36, 0.46, 0.72) * mwBand * mwDust * 0.36;

      if (uv.y < horizon + 0.02) {
        let starFade = sstep(horizon + 0.01, horizon * 0.22, uv.y);
        let grid1 = skyUv * vec2<f32>(160.0 * aspect, 160.0);
        let id1 = floor(grid1); let f1 = fract(grid1) - 0.5;
        let rnd1 = hash21(id1);
        if (rnd1 > 0.962) {
          let tw = 0.45 + 0.55 * sin(t * (1.8 + rnd1 * 4.0) + rnd1 * 62.0);
          col += mix(vec3<f32>(0.76, 0.89, 1.0), vec3<f32>(1.0, 0.94, 0.82), fract(rnd1 * 37.0)) * sstep(0.19, 0.01, length(f1)) * tw * starFade * 1.25;
        }
        let cycle = fract(t * 0.13);
        if (cycle < 0.18) {
          let uS = cycle / 0.18;
          let head = vec2<f32>(0.84, 0.06) + vec2<f32>(-0.28, 0.13) * uS;
          let tail = vec2<f32>(0.84, 0.06) + vec2<f32>(-0.28, 0.13) * max(0.0, uS - 0.16);
          let sd = sdSegment((skyUv - head) * vec2<f32>(aspect, 1.0), vec2<f32>(0.0), (tail - head) * vec2<f32>(aspect, 1.0));
          col += vec3<f32>(1.0, 0.96, 0.84) * exp(-sd * 420.0) * sin(uS * 3.14159) * 0.95;
        }
      }

      let moonR = select(0.064, 0.056, isPortrait);
      let haloRing = exp(-sq((distMoon - moonR * 2.55) / (moonR * 0.42))) * 0.09;
      col += vec3<f32>(0.68, 0.86, 1.0) * (exp(-distMoon * 5.0) * 0.45 + exp(-distMoon * 14.0) * 0.48 + haloRing);

      let rayAng = atan2(toMoon.y, toMoon.x);
      let rayShafts = pow(max(0.5 + 0.5 * sin(rayAng * 11.0 + fbm4(vec2<f32>(rayAng * 2.2, t * 0.08)) * 3.2), 0.0001), 2.4);
      col += vec3<f32>(0.58, 0.80, 1.0) * rayShafts * sstep(-0.35, 0.75, toMoon.x + toMoon.y * 0.7) * exp(-distMoon * 1.65) * sstep(moonR * 0.8, moonR * 1.9, distMoon) * 0.15;

      if (distMoon < moonR) {
        let localM = toMoon / moonR;
        let nMoon = normalize(vec3<f32>(localM.x, -localM.y, sqrt(max(0.0, 1.0 - dot(localM, localM)))));
        let ndl = dot(nMoon, normalize(vec3<f32>(0.78, -0.34, -0.52)));
        let maria = fbm5(localM * 3.4 + vec2<f32>(1.8, 0.7));
        let albedo = mix(vec3<f32>(0.62, 0.69, 0.78), vec3<f32>(0.98, 0.99, 1.0), sstep(0.28, 0.74, maria));
        col = mix(col, albedo * (0.08 + sstep(-0.04, 0.14, ndl) * 1.30), sstep(moonR, moonR * 0.96, distMoon));
      }

      let flashPos = vec2<f32>(flashX, flashY);
      if (stormOn > 0.5 && uv.y < horizon + 0.06) {
        let cloudP = vec2<f32>(skyUv.x * aspect * 2.2 - t * 0.018, skyUv.y * 5.2);
        let cDensity = fbm5(cloudP);
        let cDetail = fbm4(cloudP * 2.3 + vec2<f32>(t * 0.012, -1.7));
        let cMask = sstep(0.46, 0.76, cDensity * 0.76 + cDetail * 0.34) * sstep(horizon + 0.04, horizon * 0.25, uv.y) * sstep(0.02, 0.18, uv.y);
        var cloudCol = mix(vec3<f32>(0.028, 0.055, 0.125), vec3<f32>(0.24, 0.38, 0.58), clamp(cDetail + exp(-distMoon * 2.6) * 0.55, 0.0, 1.0));
        let distFlash = length((skyUv - flashPos) * vec2<f32>(aspect, 1.35));
        cloudCol += vec3<f32>(0.76, 0.89, 1.0) * flashAmt * exp(-distFlash * 3.0) * (0.45 + 0.95 * cDetail) * 1.45;
        col = mix(col, cloudCol, cMask * 0.84);

        if (flashAmt > 0.04 && uv.y > flashY - 0.03 && uv.y < horizon + 0.01) {
          let segU = clamp((uv.y - flashY) / max(horizon - flashY, 0.05), 0.0, 1.0);
          let jag = (fbm4(vec2<f32>(segU * 14.0, t * 2.0 + flashX * 30.0)) - 0.5) * 0.12;
          let boltX = flashX + jag * sin(segU * 3.14159) + segU * 0.025;
          let dMain = abs(skyUv.x - boltX) * aspect;
          let bCore = exp(-dMain * 520.0) * 1.6;
          let bHalo = exp(-dMain * 62.0) * 0.55;
          col += vec3<f32>(0.78, 0.90, 1.0) * (bCore + bHalo) * flashAmt * sstep(0.0, 0.06, segU) + vec3<f32>(1.0) * bCore * flashAmt * 0.55;
        }
        col += vec3<f32>(0.42, 0.62, 0.95) * flashAmt * exp(-distFlash * 1.8) * 0.28;
      }

      let mUv = uv + vec2<f32>(ptrX * 0.014, ptrY * 0.006);
      if (mUv.y < horizon + 0.02) {
        for (var r = 0; r < 3; r++) {
          let rf = f32(r);
          let startX = 0.16 + rf * 0.15;
          let ramp = pow(max(clamp((mUv.x - startX) / max(1.0 - startX, 0.1), 0.0, 1.0), 0.0001), 0.75);
          let mH = (0.28 - rf * 0.04) * pow(max(fbm4(vec2<f32>(mUv.x * (4.2 + rf * 2.1) + rf * 7.3, 1.5 + rf * 2.0)), 0.0001), 1.2) * ramp;
          let mY = horizon + 0.005 - mH;
          if (mUv.y > mY) {
            let baseM = mix(vec3<f32>(0.045 - rf * 0.012, 0.098 - rf * 0.022, 0.19 - rf * 0.035), vec3<f32>(0.09, 0.20, 0.34), clamp((mUv.y - mY) / max(mH, 0.01) * 0.7, 0.0, 1.0));
            col = baseM + vec3<f32>(0.68, 0.86, 1.0) * sstep(0.006, 0.0, abs(mUv.y - mY)) * (0.28 + flashAmt * 0.45);
          }
        }
      }

      if (uv.y >= horizon) {
        let waterY = max(uv.y - horizon, 0.0015);
        let zDepth = 0.18 / waterY;
        let wx = (uv.x - 0.5 + ptrX * 0.018) * zDepth * aspect;
        let w1 = fbm4(vec2<f32>(wx * 2.8 + t * 0.35, zDepth * 1.4 - t * 0.65));
        let w2 = fbm4(vec2<f32>(wx * 6.5 - t * 0.55, zDepth * 3.1 - t * 1.05));
        let waveH = w1 * 0.65 + w2 * 0.35;
        let N = normalize(vec3<f32>((w1 - 0.5) * 0.36 + (w2 - 0.5) * 0.22, 1.0, (w2 - 0.5) * 0.28));
        let V = normalize(vec3<f32>((uv.x - 0.5) * aspect, waterY * 2.2, 1.0));
        let fresnel = 0.08 + 0.92 * pow(max(1.0 - max(dot(N, V), 0.0), 0.0001), 3.6);
        let deepSea = mix(vec3<f32>(0.075, 0.175, 0.32), vec3<f32>(0.010, 0.026, 0.068), pow(max(clamp(waterY / (1.0 - horizon), 0.0, 1.0), 0.0001), 0.72));
        col = mix(deepSea, vec3<f32>(0.12, 0.26, 0.46) * (0.7 + 0.6 * waveH), fresnel * 0.62);
        let moonSpread = (uv.x - moonCenter.x * 0.94 + ptrX * 0.012) * aspect;
        let pathMask = exp(-sq(moonSpread / (0.045 + waterY * 0.44)));
        let glitter = pow(max(clamp(waveH * 1.28 + (0.5 + 0.5 * sin(wx * 24.0 + zDepth * 12.0 - t * 3.2)) * 0.25, 0.0, 1.0), 0.0001), 5.0);
        col += vec3<f32>(0.85, 0.94, 1.0) * pathMask * (0.22 + glitter * 1.48);
        col += vec3<f32>(0.76, 0.90, 1.0) * exp(-sq(((uv.x - flashX) * aspect) / (0.14 + waterY * 0.6))) * flashAmt * (0.35 + glitter * 0.95) * 0.75;
        col += vec3<f32>(0.96, 0.58, 0.76) * exp(-sq((uv.x - u.tree_rect.x + 0.08) * 3.8)) * exp(-waterY * 4.5) * (0.12 + qiSurge * 0.16) * bloomProg;
      }

      let cUv = uv + vec2<f32>(ptrX * 0.024, ptrY * 0.010);
      let leftEdge = select(0.28, 0.13, isPortrait);
      let cliffTopY = horizon - 0.008 + (fbm4(vec2<f32>(cUv.x * 11.0, 3.4)) - 0.5) * 0.016 - pow(max(clamp((cUv.x - 0.72) / 0.28, 0.0, 1.0), 0.0001), 1.55) * 0.075;
      let cliffWallX = leftEdge + max(0.0, cUv.y - cliffTopY) * 0.095 + (fbm4(vec2<f32>(cUv.y * 9.0, 7.2)) - 0.5) * 0.025;

      if (cUv.y >= horizon && cUv.x < cliffWallX) {
        let foamWave = 0.5 + 0.5 * sin(t * 2.1 - cUv.y * 28.0 + fbm4(cUv * 18.0) * 4.0);
        col += vec3<f32>(0.76, 0.92, 1.0) * exp(-(cliffWallX - cUv.x) * 62.0) * (0.38 + 0.62 * foamWave) * sstep(horizon, horizon + 0.06, cUv.y) * 0.65;
      }

      if (cUv.x > cliffWallX && cUv.y > cliffTopY) {
        let strata = fbm5(vec2<f32>(cUv.x * 14.0 + cUv.y * 4.5, cUv.y * 22.0));
        let depthY = clamp((cUv.y - cliffTopY) / max(1.0 - cliffTopY, 0.1), 0.0, 1.0);
        var rockCol = mix(vec3<f32>(0.10, 0.20, 0.30), vec3<f32>(0.012, 0.028, 0.056), pow(max(depthY, 0.0001), 0.72)) * (0.72 + 0.56 * strata);
        rockCol += vec3<f32>(0.28, 0.68, 0.86) * exp(-(cUv.x - cliffWallX) * 14.0) * (0.28 + flashAmt * 0.35);
        rockCol += vec3<f32>(0.98, 0.64, 0.80) * exp(-length((cUv - vec2<f32>(u.tree_rect.x, cliffTopY)) * vec2<f32>(aspect, 1.8)) * 5.2) * (0.24 + qiSurge * 0.32) * bloomProg;
        rockCol += vec3<f32>(0.78, 0.92, 1.0) * sstep(0.008, 0.0, abs(cUv.y - cliffTopY)) * (0.48 + flashAmt * 0.5);
        col = rockCol;
      }

      let tRect = u.tree_rect;
      let localTree = vec2<f32>(
        (cUv.x - (tRect.x - tRect.z * 0.55)) / max(tRect.z, 0.01),
        (cUv.y - (tRect.y - tRect.w * 0.86)) / max(tRect.w, 0.01)
      );
      let swayFactor = pow(max(clamp(0.86 - localTree.y, 0.0, 1.0), 0.0001), 1.45);
      let breeze = (sin(t * 1.4 + localTree.x * 5.2 + localTree.y * 3.0) * 0.010 + sin(t * 2.6 + localTree.x * 9.0) * 0.004) * swayFactor;
      let treeUv = vec2<f32>(localTree.x + breeze, localTree.y + abs(breeze) * 0.25);

      let treeSample = textureSampleLevel(treeTex, treeSamp, clamp(treeUv, vec2<f32>(0.0), vec2<f32>(1.0)), 0.0);
      let inBounds = step(0.0, treeUv.x) * step(treeUv.x, 1.0) * step(0.0, treeUv.y) * step(treeUv.y, 1.0);
      let treeAlpha = treeSample.a * inBounds;

      let dCrown = length((cUv - vec2<f32>(tRect.x - tRect.z * 0.08, tRect.y - tRect.w * 0.44)) * vec2<f32>(aspect, 1.15));
      col += vec3<f32>(0.96, 0.56, 0.78) * exp(-dCrown * 3.6) * (0.22 + qiSurge * 0.24 + flashAmt * 0.14) * bloomProg;

      if (treeAlpha > 0.005) {
        var tCol = treeSample.rgb;
        // Progressive bloom mask for aiskilllab.html (pink petals emerge as bloomProg rises from 0.06 -> 1.0)
        let pinkness = clamp((tCol.r - tCol.g * 0.72) * 1.6, 0.0, 1.0);
        let petalVis = mix(1.0, sstep(0.0, 1.0, bloomProg * 1.35 - hash21(floor(treeUv * 26.0)) * 0.42), sstep(0.28, 0.65, pinkness));
        let qWave = fract(t * 0.22 + 0.15);
        let hNorm = clamp((0.88 - treeUv.y) / 0.85, 0.0, 1.0);
        let qBand = exp(-sq((hNorm - qWave) / 0.12)) * sin(qWave * 3.14159);
        let lum = dot(tCol, vec3<f32>(0.3, 0.6, 0.1));
        tCol += vec3<f32>(1.0, 0.86, 0.58) * qBand * (0.24 + qiSurge * 0.58) * (0.45 + lum);
        tCol += vec3<f32>(0.82, 0.93, 1.0) * sstep(0.65, 0.15, treeUv.x) * sstep(0.35, 0.95, lum) * (0.14 + flashAmt * 0.55);
        col = mix(col, tCol, treeAlpha * clamp(petalVis, 0.0, 1.0));
      }

      let mistVal = fbm4(vec2<f32>(uv.x * aspect * 1.9 - t * 0.032, uv.y * 4.5)) * sstep(0.36, 0.56, uv.y) * sstep(0.95, 0.52, uv.y);
      col = mix(col, vec3<f32>(0.72, 0.86, 0.98), mistVal * 0.22);
      col = (col * (2.51 * col + 0.03)) / (col * (2.43 * col + 0.59) + 0.14);
      let vig = 1.0 - dot((uv - 0.5) * vec2<f32>(1.15, 1.12), (uv - 0.5) * vec2<f32>(1.15, 1.12)) * 0.50;
      return vec4<f32>(clamp(col * clamp(vig, 0.45, 1.0), vec3<f32>(0.0), vec3<f32>(1.0)), 1.0);
    }
  `;

  const WGSL_COMPUTE = /* wgsl */`
    struct Uniforms { res_time: vec4<f32>, ptr_env: vec4<f32>, fx_ctrl: vec4<f32>, tree_rect: vec4<f32>, };
    struct Particle { pos_size: vec4<f32>, vel_rot: vec4<f32>, meta: vec4<f32>, };
    @group(0) @binding(0) var<uniform> u: Uniforms;
    @group(0) @binding(1) var<storage, read_write> particles: array<Particle>;

    fn hash11(p: f32) -> f32 {
      let x = fract(p * 0.1031);
      let y = x * (x + 33.33);
      return fract(y * (y + y));
    }

    @compute @workgroup_size(64)
    fn cs_main(@builtin(global_invocation_id) gid: vec3<u32>) {
      let idx = gid.x;
      if (idx >= ${PARTICLE_COUNT}u) { return; }
      var pt = particles[idx];
      let t = u.res_time.z;
      let dt = clamp(u.res_time.w, 0.001, 0.045);
      let qiSurge = u.fx_ctrl.y;
      let kind = pt.meta.x;
      let seed = pt.meta.y;
      let tRect = u.tree_rect;
      let turbX = sin(t * 1.15 + seed + pt.pos_size.y * 7.5) * 0.012;
      let turbY = cos(t * 0.92 + seed * 1.3 + pt.pos_size.x * 6.0) * 0.008;

      if (kind < 0.5) {
        pt.pos_size.x += (pt.vel_rot.x + turbX) * dt;
        pt.pos_size.y += (pt.vel_rot.y + turbY) * dt;
        pt.vel_rot.z += pt.meta.w * dt;
        pt.vel_rot.w += (2.4 + hash11(seed) * 2.2) * dt;
        if (pt.pos_size.x < -0.06 || pt.pos_size.y > 1.05) {
          pt.pos_size.x = tRect.x + (hash11(seed + t * 1.7) - 0.52) * tRect.z * 0.92;
          pt.pos_size.y = tRect.y - (0.18 + hash11(seed * 1.9 + t * 2.3) * 0.62) * tRect.w;
        }
      } else if (kind < 1.5) {
        let boost = 1.0 + qiSurge * 1.4;
        pt.pos_size.x += (pt.vel_rot.x + turbX * 1.4) * dt * boost;
        pt.pos_size.y += (pt.vel_rot.y * boost + turbY * 0.6) * dt;
        pt.vel_rot.w += 3.2 * dt;
        if (pt.pos_size.y < 0.06 || pt.pos_size.x < -0.05 || pt.pos_size.x > 1.05) {
          pt.pos_size.x = tRect.x + (hash11(seed + t * 3.1) - 0.50) * tRect.z * 0.85;
          pt.pos_size.y = tRect.y - (0.04 + hash11(seed * 2.7 + t * 1.3) * 0.52) * tRect.w;
        }
      } else if (kind < 2.5) {
        pt.pos_size.x += (pt.vel_rot.x * 1.7 + turbX * 1.8) * dt;
        pt.pos_size.y += (pt.vel_rot.y * 1.3 + turbY) * dt;
        pt.vel_rot.z += pt.meta.w * 0.6 * dt;
        pt.vel_rot.w += 1.6 * dt;
        if (pt.pos_size.x < -0.10 || pt.pos_size.y > 1.10) {
          pt.pos_size.x = 1.06 + hash11(seed + t) * 0.15;
          pt.pos_size.y = hash11(seed * 2.1 + t) * 0.85;
        }
      } else {
        pt.pos_size.x += (-pt.vel_rot.x * 0.55) * dt;
        pt.pos_size.y += turbY * 0.8 * dt;
        pt.vel_rot.w += 2.2 * dt;
        if (pt.pos_size.x > 1.05) {
          pt.pos_size.x = -0.04;
          pt.pos_size.y = 0.25 + hash11(seed + t) * 0.65;
        }
      }
      particles[idx] = pt;
    }
  `;

  const WGSL_PARTICLES = /* wgsl */`
    struct Uniforms { res_time: vec4<f32>, ptr_env: vec4<f32>, fx_ctrl: vec4<f32>, tree_rect: vec4<f32>, };
    struct Particle { pos_size: vec4<f32>, vel_rot: vec4<f32>, meta: vec4<f32>, };
    struct VSOut { @builtin(position) pos: vec4<f32>, @location(0) localUv: vec2<f32>, @location(1) info: vec4<f32>, };
    @group(0) @binding(0) var<uniform> u: Uniforms;
    @group(0) @binding(1) var<storage, read> particles: array<Particle>;

    fn sstep(a: f32, b: f32, x: f32) -> f32 {
      let t = clamp((x - a) / (b - a), 0.0, 1.0);
      return t * t * (3.0 - 2.0 * t);
    }

    @vertex
    fn vs_part(@builtin(vertex_index) vid: u32, @builtin(instance_index) iid: u32) -> VSOut {
      var corners = array<vec2<f32>, 6>(
        vec2<f32>(-1.0, -1.0), vec2<f32>(1.0, -1.0), vec2<f32>(-1.0, 1.0),
        vec2<f32>(-1.0, 1.0), vec2<f32>(1.0, -1.0), vec2<f32>(1.0, 1.0)
      );
      let pt = particles[iid];
      let c = corners[vid];
      let W = max(u.res_time.x, 1.0);
      let H = max(u.res_time.y, 1.0);
      let kind = pt.meta.x;
      let rot = pt.vel_rot.z;
      let flip = 0.28 + 0.72 * abs(cos(pt.vel_rot.w));
      let parScale = select(0.020, 0.045, kind > 1.5 && kind < 2.5);
      let px = pt.pos_size.x - u.ptr_env.x * parScale * (0.4 + pt.pos_size.z);
      let py = pt.pos_size.y - u.ptr_env.y * parScale * 0.5;
      let dpiScale = clamp(H / 720.0, 0.85, 2.4);
      let sz = pt.pos_size.w * dpiScale * select(1.0, 1.0 + u.fx_ctrl.y * 0.45, kind > 0.5 && kind < 1.5);
      let cs = cos(rot); let sn = sin(rot);
      let scaled = vec2<f32>(c.x * sz, c.y * sz * select(1.0, flip * 0.62, kind < 0.5 || (kind > 1.5 && kind < 2.5)));
      let rotated = vec2<f32>(scaled.x * cs - scaled.y * sn, scaled.x * sn + scaled.y * cs);
      var out: VSOut;
      out.pos = vec4<f32>((px * 2.0 - 1.0) + rotated.x * 2.0 / W, (1.0 - py * 2.0) - rotated.y * 2.0 / H, 0.0, 1.0);
      out.localUv = c;
      out.info = vec4<f32>(kind, pt.meta.z * clamp(u.fx_ctrl.z + 0.25, 0.25, 1.0), pt.vel_rot.w, u.fx_ctrl.y);
      return out;
    }

    @fragment
    fn fs_part(in: VSOut) -> @location(0) vec4<f32> {
      let d = length(in.localUv);
      if (d > 1.0) { discard; }
      let kind = in.info.x; let baseA = in.info.y; let ph = in.info.z; let qi = in.info.w;
      if (kind < 0.5) {
        return vec4<f32>(mix(vec3<f32>(1.0, 0.96, 0.98), vec3<f32>(0.96, 0.52, 0.74), in.localUv.x * 0.5 + 0.5), sstep(1.0, 0.45, d) * baseA * 0.90);
      } else if (kind < 1.5) {
        let glow = exp(-d * d * 4.2) * (0.35 + 0.65 * (0.5 + 0.5 * sin(ph)));
        return vec4<f32>(mix(vec3<f32>(1.0, 0.78, 0.90), vec3<f32>(1.0, 0.96, 0.72), glow) * (1.2 + qi * 0.5), glow * baseA);
      } else if (kind < 2.5) {
        return vec4<f32>(mix(vec3<f32>(1.0, 0.85, 0.94), vec3<f32>(0.96, 0.48, 0.72), d), sstep(1.0, 0.15, d) * baseA * 0.62);
      }
      return vec4<f32>(vec3<f32>(0.85, 0.95, 1.0), exp(-d * d * 5.0) * baseA * 0.70);
    }
  `;

  // ==========================================================================
  // 3. PUBLIC MOUNT CONTROLLER (WEBGPU -> WEBGL2 -> 2D SAFE FALLBACK)
  // ==========================================================================
  function mount(opts) {
    const cfg = opts || {};
    const stage = cfg.stage || document.body;
    const canvas = cfg.canvas || cfg.bgCanvas;
    if (!stage || !canvas) {
      return { setBloomProgress: function () {}, triggerQiSurge: function () {}, setStormEnabled: function () {}, triggerLightning: function () {}, destroy: function () {} };
    }

    const st = {
      disposed: false,
      W: Math.max(320, Math.round(stage.clientWidth || global.innerWidth || 1024)),
      H: Math.max(480, Math.round(stage.clientHeight || global.innerHeight || 720)),
      DPR: Math.min(global.devicePixelRatio || 1, 2),
      ptrTargetX: 0, ptrTargetY: 0, ptrX: 0, ptrY: 0,
      bloomTarget: typeof cfg.initialBloom === 'number' ? Math.max(0.05, Math.min(1, cfg.initialBloom)) : 1.0,
      bloomCur: typeof cfg.initialBloom === 'number' ? Math.max(0.05, Math.min(1, cfg.initialBloom)) : 1.0,
      qiSurge: 0.22,
      stormEnabled: cfg.stormEnabled !== false,
      lightningAge: -1, lightningDur: 0.62, nextStrikeAt: 2.2, flashX: 0.76, flashY: 0.22,
      rafId: null, resizeObs: null
    };

    function triggerLightningNow() {
      st.lightningAge = 0;
      st.lightningDur = 0.58 + Math.random() * 0.22;
      st.flashX = Math.random() < 0.68 ? (0.62 + Math.random() * 0.26) : (0.12 + Math.random() * 0.22);
      st.flashY = 0.16 + Math.random() * 0.14;
    }

    function evalFlash() {
      if (st.lightningAge < 0 || !st.stormEnabled) return 0.0;
      const u = Math.min(1.0, st.lightningAge / Math.max(0.05, st.lightningDur));
      const p1 = Math.exp(-Math.pow((u - 0.08) / 0.06, 2));
      const p2 = 0.84 * Math.exp(-Math.pow((u - 0.34) / 0.08, 2));
      return Math.min(1.0, p1 + p2 + Math.max(0, 1.0 - u) * 0.20 * Math.exp(-u * 2.5));
    }

    function stepSimulation(t, dt) {
      st.ptrX += (st.ptrTargetX - st.ptrX) * (1 - Math.exp(-dt * 3.8));
      st.ptrY += (st.ptrTargetY - st.ptrY) * (1 - Math.exp(-dt * 3.8));
      st.bloomCur += (st.bloomTarget - st.bloomCur) * (1 - Math.exp(-dt * 2.2));
      st.qiSurge += (0.20 - st.qiSurge) * (1 - Math.exp(-dt * 1.4));
      if (st.stormEnabled) {
        if (st.lightningAge < 0 && t >= st.nextStrikeAt) triggerLightningNow();
        if (st.lightningAge >= 0) {
          st.lightningAge += dt;
          if (st.lightningAge >= st.lightningDur) {
            st.lightningAge = -1;
            st.nextStrikeAt = t + 4.8 + Math.random() * 5.2;
          }
        }
      } else {
        st.lightningAge = -1;
      }
    }

    function sizeCanvas() {
      const r = stage.getBoundingClientRect();
      st.W = Math.max(320, Math.round(r.width || stage.clientWidth || global.innerWidth || 1024));
      st.H = Math.max(480, Math.round(r.height || stage.clientHeight || global.innerHeight || 720));
      st.DPR = Math.min(global.devicePixelRatio || 1, 2);
      canvas.width = Math.round(st.W * st.DPR);
      canvas.height = Math.round(st.H * st.DPR);
    }

    const onPointerMove = function (e) {
      const r = stage.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      st.ptrTargetX = ((e.clientX - r.left) / r.width - 0.5) * 2;
      st.ptrTargetY = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    const onTouchMove = function (e) {
      if (e.touches && e.touches[0]) onPointerMove(e.touches[0]);
    };
    const onPointerLeave = function () { st.ptrTargetX = 0; st.ptrTargetY = 0; };
    const onResize = function () { sizeCanvas(); };

    stage.addEventListener('pointermove', onPointerMove, { passive: true });
    stage.addEventListener('touchmove', onTouchMove, { passive: true });
    stage.addEventListener('pointerleave', onPointerLeave, { passive: true });
    global.addEventListener('resize', onResize);
    if (typeof ResizeObserver !== 'undefined') {
      st.resizeObs = new ResizeObserver(onResize);
      st.resizeObs.observe(stage);
    }

    // ---- BACKEND 1: NATIVE WEBGPU (COMPILE BEFORE TOUCHING CANVAS CONTEXT!) ----
    async function tryStartWebGPU(treeAtlas) {
      if (!navigator.gpu) return false;
      const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
      if (!adapter || st.disposed) return false;
      const device = await adapter.requestDevice();
      if (!device || st.disposed) return false;
      const format = navigator.gpu.getPreferredCanvasFormat();

      device.pushErrorScope('validation');
      const worldMod = device.createShaderModule({ code: WGSL_WORLD });
      const compMod = device.createShaderModule({ code: WGSL_COMPUTE });
      const partMod = device.createShaderModule({ code: WGSL_PARTICLES });
      const infos = await Promise.all([worldMod.getCompilationInfo(), compMod.getCompilationInfo(), partMod.getCompilationInfo()]);
      for (let i = 0; i < infos.length; i++) {
        for (let j = 0; j < infos[i].messages.length; j++) {
          if (infos[i].messages[j].type === 'error') {
            await device.popErrorScope();
            return false;
          }
        }
      }

      const worldPipe = device.createRenderPipeline({
        layout: 'auto',
        vertex: { module: worldMod, entryPoint: 'vs_quad' },
        fragment: { module: worldMod, entryPoint: 'fs_main', targets: [{ format: format }] },
        primitive: { topology: 'triangle-list' }
      });
      const compPipe = device.createComputePipeline({
        layout: 'auto',
        compute: { module: compMod, entryPoint: 'cs_main' }
      });
      const partPipe = device.createRenderPipeline({
        layout: 'auto',
        vertex: { module: partMod, entryPoint: 'vs_part' },
        fragment: {
          module: partMod, entryPoint: 'fs_part',
          targets: [{
            format: format,
            blend: {
              color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' },
              alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' }
            }
          }]
        },
        primitive: { topology: 'triangle-list' }
      });
      const vErr = await device.popErrorScope();
      if (vErr || st.disposed) return false;

      sizeCanvas();
      const context = canvas.getContext('webgpu');
      if (!context) return false;
      context.configure({ device: device, format: format, alphaMode: 'opaque' });

      const treeTex = device.createTexture({
        size: [treeAtlas.width, treeAtlas.height, 1],
        format: 'rgba8unorm',
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
      });
      device.queue.copyExternalImageToTexture({ source: treeAtlas }, { texture: treeTex }, [treeAtlas.width, treeAtlas.height]);
      const treeSamp = device.createSampler({ magFilter: 'linear', minFilter: 'linear' });

      const uData = new Float32Array(16);
      const uBuf = device.createBuffer({ size: 64, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
      const pInit = createParticleSeedBuffer(PARTICLE_COUNT);
      const pBuf = device.createBuffer({ size: pInit.byteLength, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
      device.queue.writeBuffer(pBuf, 0, pInit);

      const worldBG = device.createBindGroup({
        layout: worldPipe.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: { buffer: uBuf } }, { binding: 1, resource: treeTex.createView() }, { binding: 2, resource: treeSamp }]
      });
      const compBG = device.createBindGroup({
        layout: compPipe.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: { buffer: uBuf } }, { binding: 1, resource: { buffer: pBuf } }]
      });
      const partBG = device.createBindGroup({
        layout: partPipe.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: { buffer: uBuf } }, { binding: 1, resource: { buffer: pBuf } }]
      });

      let lastTs = performance.now();
      const loop = function (now) {
        if (st.disposed) return;
        st.rafId = requestAnimationFrame(loop);
        if (document.hidden || canvas.width <= 0 || canvas.height <= 0) return;
        const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) * 0.001));
        lastTs = now;
        const t = now * 0.001;
        stepSimulation(t, dt);

        const aspect = st.W / Math.max(1, st.H);
        const isPortrait = aspect < 0.85;
        const treeH = isPortrait ? 0.52 : 0.72;
        const treeW = treeH / Math.max(0.35, aspect);

        uData[0] = canvas.width; uData[1] = canvas.height; uData[2] = t; uData[3] = dt;
        uData[4] = st.ptrX; uData[5] = st.ptrY; uData[6] = evalFlash(); uData[7] = st.flashX;
        uData[8] = st.flashY; uData[9] = st.qiSurge; uData[10] = st.bloomCur; uData[11] = st.stormEnabled ? 1.0 : 0.0;
        uData[12] = isPortrait ? 0.54 : 0.495; uData[13] = 0.545; uData[14] = treeW; uData[15] = treeH;
        device.queue.writeBuffer(uBuf, 0, uData);

        const enc = device.createCommandEncoder();
        const cp = enc.beginComputePass();
        cp.setPipeline(compPipe); cp.setBindGroup(0, compBG);
        cp.dispatchWorkgroups(Math.ceil(PARTICLE_COUNT / 64));
        cp.end();

        const rp = enc.beginRenderPass({
          colorAttachments: [{ view: context.getCurrentTexture().createView(), loadOp: 'clear', storeOp: 'store', clearValue: { r: 0.008, g: 0.02, b: 0.06, a: 1 } }]
        });
        rp.setPipeline(worldPipe); rp.setBindGroup(0, worldBG); rp.draw(3, 1, 0, 0);
        rp.setPipeline(partPipe); rp.setBindGroup(0, partBG); rp.draw(6, PARTICLE_COUNT, 0, 0);
        rp.end();
        device.queue.submit([enc.finish()]);
      };
      st.rafId = requestAnimationFrame(loop);
      return true;
    }

    // Boot Sequence: Pure Native WebGPU Only (No WebGL2 / No 2D Canvas Fallback)
    (async function bootWebGPUOnly() {
      if (!navigator.gpu) {
        try { console.warn('[organ cloud 2.0] อุปกรณ์หรือเบราว์เซอร์นี้ไม่รองรับ WebGPU'); } catch (_) {}
        return;
      }
      const atlas = getTreeAtlas();
      try {
        const ok = await tryStartWebGPU(atlas);
        if (!ok) {
          try { console.warn('[organ cloud 2.0] เริ่มต้น WebGPU Pipeline ไม่สำเร็จ'); } catch (_) {}
        }
      } catch (err) {
        try { console.warn('[organ cloud 2.0] WebGPU Error:', err); } catch (_) {}
      }
    })();

    return {
      setBloomProgress: function (ratio) {
        st.bloomTarget = Math.max(0.05, Math.min(1.0, Number(ratio) || 0.05));
      },
      triggerQiSurge: function () {
        st.qiSurge = 1.65;
      },
      setStormEnabled: function (enabled) {
        st.stormEnabled = Boolean(enabled);
      },
      triggerLightning: function () {
        if (st.stormEnabled) triggerLightningNow();
      },
      destroy: function () {
        st.disposed = true;
        if (st.rafId) cancelAnimationFrame(st.rafId);
        if (st.resizeObs) st.resizeObs.disconnect();
        stage.removeEventListener('pointermove', onPointerMove);
        stage.removeEventListener('touchmove', onTouchMove);
        stage.removeEventListener('pointerleave', onPointerLeave);
        global.removeEventListener('resize', onResize);
      }
    };
  }

  global.RJCLOUD_HERO_PEACH = {
    mount: mount,
    version: '2027.24-webgpu-only'
  };
})(typeof window !== 'undefined' ? window : globalThis);
