/* ============================================================================
 * organ cloud 2.0 — Keynote Welcome Gate & Ultra-Smooth Volumetric Mist Reveal
 * File: keynote-launch.js (Zero-Build Standalone Production Module)
 * Public Exports: window.RJCLOUD_KEYNOTE
 *
 * สิ่งที่ปรับปรุงในเวอร์ชันนี้:
 * 1. หน้าการ์ด Welcome สไตล์ Neumorphic Soft UI (รองรับโหมดสว่าง #e6ebf0 และโหมดมืด #1c222b)
 * 2. แบรนด์ใหม่ "organ cloud 2.0" (BETA / organ cloud 2.0 / เปิดใช้งาน 2027) + ปุ่ม Welcome กดบุ๋มลึก
 * 3. อนิเมชันหลังกดปุ่ม Welcome เป็นหมอกเย็นสมจริงแบบ Volumetric อัลตร้าสมูท 60/120fps
 * 4. เชื่อมเสียงพิธีกร AI คุณภาพสตูดิโอ 24kHz (ห้ามใช้เสียงหุ่นยนต์เบราว์เซอร์)
 * ============================================================================ */

(function (global) {
  'use strict';

  const HOST_SEGMENTS = [
    {
      role: 'หญิง',
      voice: 'Sulafat',
      text: 'ยินดีต้อนรับสู่ ออร์แกน คลาวด์ สองจุดศูนย์ แพลตฟอร์มการเรียนรู้ด้านการรับบริจาคและปลูกถ่ายอวัยวะ แห่งศูนย์ความเป็นเลิศทางการแพทย์ โรงพยาบาลราชวิถีค่ะ'
    },
    {
      role: 'ชาย',
      voice: 'Puck',
      text: 'ยกระดับทักษะทางการแพทย์สู่มาตรฐานปีสองพันยี่สิบเจ็ด ด้วยบทเรียนคลินิก ห้องฝึกสื่อสารโฮโลแกรมหัวใจสามมิติ เอไอสกิลแล็บ และประกาศนียบัตรดิจิทัลพร้อมคิวอาร์โค้ดครับ'
    },
    {
      role: 'หญิง',
      voice: 'Sulafat',
      text: 'เชิญบุคลากรทางการแพทย์ทุกท่านกดปุ่มเข้าสู่ระบบ เพื่อเริ่มต้นประสบการณ์การเรียนรู้แห่งอนาคตไปพร้อมกันได้เลยค่ะ'
    }
  ];

  let rootEl = null;
  let canvasEl = null;
  let ctx = null;
  let cardEl = null;
  let controlsEl = null;
  let hostBtnEl = null;
  let musicBtnEl = null;

  let isLandingNow = false;
  let currentGasUrl = '';
  let hasDismissedGate = false;
  let isTransitioning = false;

  // Animation loop state
  let rafId = null;
  let lastTs = 0;
  let W = 0;
  let H = 0;
  let revealStartTs = 0;
  const REVEAL_DURATION = 3.15; // seconds for ultra-smooth cinematic mist parting

  // Audio state (Studio 24kHz AI Host + Silky WebAudio Ambient Pad)
  let hostPlaying = false;
  let hostSegmentIdx = 0;
  let hostSessionId = 0;
  let hostAudioEl = null;
  let hostBlobUrl = null;

  let musicEnabled = false;
  let musicCtx = null;
  let musicMasterGain = null;
  let musicOscs = [];

  // Pre-rendered volumetric mist sprites
  let denseMistSprite = null;
  let silkyWispSprite = null;
  let mistBanks = [];
  let frostMotes = [];

  // Deterministic PRNG for silky organic mist texture
  function createRng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function buildMistSprite(seed, variant) {
    const c = document.createElement('canvas');
    const isWisp = variant === 'wisp';
    c.width = isWisp ? 480 : 440;
    c.height = isWisp ? 210 : 280;
    const mc = c.getContext('2d');
    if (!mc) return c;

    const rng = createRng(seed);
    const puffs = isWisp ? 30 : 38;

    for (let i = 0; i < puffs; i++) {
      const u = i / Math.max(1, puffs - 1);
      const arch = Math.sin(u * Math.PI);
      const px = 72 + u * (c.width - 144) + (rng() - 0.5) * (isWisp ? 34 : 56);
      const py = c.height * 0.52 - arch * (isWisp ? 8 : 16) + (rng() - 0.5) * (isWisp ? 32 : 68);
      const rx = (isWisp ? 52 : 62) + rng() * (isWisp ? 56 : 74) * (0.65 + arch * 0.42);
      const ry = (isWisp ? 22 : 34) + rng() * (isWisp ? 24 : 44) * (0.65 + arch * 0.45);

      const roll = rng();
      const rgb =
        roll < 0.36
          ? '234, 246, 255' // luminous frosty white
          : roll < 0.72
            ? '192, 228, 252' // pale moonlight cyan-silver
            : roll < 0.90
              ? '148, 204, 248' // glacial night mist blue
              : '245, 224, 244'; // whisper of peach-blossom reflection

      const alpha = isWisp ? 0.052 + rng() * 0.042 : 0.064 + rng() * 0.048;

      mc.save();
      mc.translate(px, py);
      mc.scale(1, ry / Math.max(1, rx));
      const g = mc.createRadialGradient(0, 0, rx * 0.06, 0, 0, rx);
      g.addColorStop(0, 'rgba(' + rgb + ',' + alpha.toFixed(3) + ')');
      g.addColorStop(0.5, 'rgba(' + rgb + ',' + (alpha * 0.52).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(' + rgb + ',0)');
      mc.fillStyle = g;
      mc.beginPath();
      mc.arc(0, 0, rx, 0, Math.PI * 2);
      mc.fill();
      mc.restore();
    }
    return c;
  }

  function ensureMistAssets() {
    if (!denseMistSprite) denseMistSprite = buildMistSprite(42071, 'cloud');
    if (!silkyWispSprite) silkyWispSprite = buildMistSprite(89123, 'wisp');
  }

  function seedMistParticles() {
    ensureMistAssets();
    mistBanks = [];
    const total = 40;

    for (let i = 0; i < total; i++) {
      // Distribute across 3 depth layers (0: background, 1: mid, 2: foreground parting curtain)
      const layer = i < 12 ? 0 : i < 26 ? 1 : 2;
      const side = i % 2 === 0 ? -1 : 1; // smoothly parts left & right from center
      const centerBias = layer === 2 ? (Math.random() - 0.5) * 0.52 : (Math.random() - 0.5) * 1.15;
      const x0 = 0.5 + centerBias;
      const y0 = 0.08 + Math.random() * 0.84;

      // Outward radial + lateral parting vector for natural billowing clouds
      const dxFromCenter = x0 - 0.5;
      const dirX = Math.abs(dxFromCenter) < 0.06 ? side : Math.sign(dxFromCenter);
      const partVx = dirX * (0.48 + layer * 0.24 + Math.random() * 0.36);
      const partVy = (y0 - 0.52) * (0.28 + Math.random() * 0.22) - (layer === 2 ? 0.04 : 0.02);

      mistBanks.push({
        layer: layer,
        x: x0,
        y: y0,
        baseX: x0,
        baseY: y0,
        idleVx: (layer === 0 ? 0.006 : layer === 1 ? 0.011 : 0.016) * (i % 3 === 0 ? -1 : 1),
        partVx: partVx,
        partVy: partVy,
        w: (layer === 2 ? 0.68 : layer === 1 ? 0.58 : 0.52) + Math.random() * 0.34,
        h: (layer === 2 ? 0.36 : layer === 1 ? 0.28 : 0.24) + Math.random() * 0.20,
        idleAlpha: (layer === 0 ? 0.22 : layer === 1 ? 0.28 : 0.16) + Math.random() * 0.14,
        surgeAlpha: (layer === 2 ? 0.82 : layer === 1 ? 0.72 : 0.56) + Math.random() * 0.16,
        rot: (Math.random() - 0.5) * 0.22,
        rotSpd: (Math.random() - 0.5) * 0.18,
        bobSpd: 0.26 + Math.random() * 0.28,
        bobAmp: 6 + Math.random() * 12,
        ph: Math.random() * Math.PI * 2,
        sprite: i % 3 === 0 ? silkyWispSprite : denseMistSprite
      });
    }

    frostMotes = Array.from({ length: 30 }, function () {
      const ang = Math.random() * Math.PI * 2;
      return {
        x: 0.5 + (Math.random() - 0.5) * 0.56,
        y: 0.5 + (Math.random() - 0.5) * 0.56,
        vx: Math.cos(ang) * (0.06 + Math.random() * 0.14),
        vy: Math.sin(ang) * (0.05 + Math.random() * 0.12) - 0.03,
        r: 0.9 + Math.random() * 1.8,
        tw: 1.8 + Math.random() * 2.6,
        ph: Math.random() * Math.PI * 2
      };
    });
  }

  function injectStyles() {
    if (document.getElementById('rjcloud-keynote-mist-styles')) return;
    const style = document.createElement('style');
    style.id = 'rjcloud-keynote-mist-styles';
    style.textContent = [
      '#rj-keynote-gate {',
      '  --kn-bg: #1c222b; --kn-light: #2d3746; --kn-dark: #0e1218;',
      '  --kn-border: rgba(255, 255, 255, 0.09); --kn-text: #f4f7fb; --kn-sub: #c9d6e6; --kn-teal: #5eead4;',
      '  --kn-raised-lg: 14px 14px 30px #0b0f15, -12px -12px 26px #2a3342;',
      '  --kn-raised: 7px 7px 16px #0c1016, -6px -6px 14px #2c3646;',
      '  --kn-pressed-sm: inset 4px 4px 8px #0c1016, inset -3px -3px 7px #2d3746;',
      '  position: fixed; inset: 0; z-index: 9990;',
      '  display: flex; align-items: center; justify-content: center;',
      '  padding: 20px; overflow: hidden;',
      '  touch-action: manipulation; -webkit-font-smoothing: antialiased;',
      '}',
      'html[data-theme="light"] #rj-keynote-gate {',
      '  --kn-bg: #e6ebf0; --kn-light: #ffffff; --kn-dark: #c5ced9;',
      '  --kn-border: rgba(255, 255, 255, 0.78); --kn-text: #1f2b38; --kn-sub: #47586b; --kn-teal: #247870;',
      '  --kn-raised-lg: 14px 14px 30px #c1cbd6, -14px -14px 30px #ffffff;',
      '  --kn-raised: 7px 7px 15px #c5ced9, -7px -7px 15px #ffffff;',
      '  --kn-pressed-sm: inset 4px 4px 8px #c5ced9, inset -4px -4px 8px #ffffff;',
      '}',
      '#rj-keynote-gate.rj-hidden { display: none !important; pointer-events: none !important; }',
      '#rj-keynote-canvas {',
      '  position: absolute; inset: 0; width: 100%; height: 100%;',
      '  pointer-events: none; z-index: 1;',
      '}',
      '#rj-keynote-card {',
      '  position: relative; z-index: 3;',
      '  width: 100%; max-width: 392px;',
      '  border-radius: 32px;',
      '  padding: 40px 28px 36px;',
      '  text-align: center;',
      '  background: var(--kn-bg);',
      '  border: 1px solid var(--kn-border);',
      '  box-shadow: var(--kn-raised-lg);',
      '  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Anuphan", "Prompt", sans-serif;',
      '  transition: opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1), transform 0.72s cubic-bezier(0.22, 1, 0.36, 1), filter 0.65s ease;',
      '  will-change: opacity, transform, filter;',
      '}',
      '#rj-keynote-card.rj-dissolving {',
      '  opacity: 0;',
      '  transform: scale(0.95) translateY(-10px);',
      '  filter: blur(18px);',
      '  pointer-events: none;',
      '}',
      '.rj-beta-pill {',
      '  display: inline-flex; align-items: center; gap: 7px;',
      '  padding: 6px 16px; border-radius: 9999px;',
      '  background: var(--kn-bg);',
      '  border: 1px solid var(--kn-border);',
      '  box-shadow: var(--kn-pressed-sm);',
      '  color: var(--kn-teal);',
      '  font-family: "JetBrains Mono", "SF Mono", ui-monospace, monospace;',
      '  font-size: 12px; font-weight: 700; letter-spacing: 0.22em;',
      '  text-transform: uppercase;',
      '}',
      '.rj-beta-dot {',
      '  width: 7px; height: 7px; border-radius: 9999px;',
      '  background: var(--kn-teal); box-shadow: 0 0 10px var(--kn-teal);',
      '}',
      '.rj-gate-title {',
      '  margin: 22px 0 8px;',
      '  font-size: clamp(28px, 7.6vw, 35px);',
      '  font-weight: 800; line-height: 1.15; letter-spacing: -0.02em;',
      '  color: var(--kn-text);',
      '}',
      '.rj-gate-title .rj-ver {',
      '  color: var(--kn-teal);',
      '}',
      '.rj-gate-sub {',
      '  margin: 0 0 30px;',
      '  font-size: 16px; font-weight: 500; letter-spacing: 0.04em;',
      '  color: var(--kn-sub);',
      '}',
      '#rj-welcome-btn {',
      '  position: relative; overflow: hidden;',
      '  width: 100%; min-height: 56px;',
      '  border-radius: 9999px;',
      '  display: inline-flex; align-items: center; justify-content: center; gap: 10px;',
      '  background: linear-gradient(145deg, #258077 0%, #1b615a 100%);',
      '  border: 1px solid rgba(255, 255, 255, 0.22);',
      '  color: #ffffff; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.24);',
      '  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Prompt", sans-serif;',
      '  font-size: 17px; font-weight: 700; letter-spacing: 0.015em;',
      '  cursor: pointer;',
      '  box-shadow: var(--kn-raised);',
      '  transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.2s ease, filter 0.2s ease;',
      '}',
      '#rj-welcome-btn:hover { transform: translateY(-1.5px); filter: brightness(1.07); }',
      '#rj-welcome-btn:active, #rj-welcome-btn.is-tapping {',
      '  transform: translateY(1.5px) scale(0.975);',
      '  background: linear-gradient(145deg, #1a5c56 0%, #22756d 100%);',
      '  box-shadow: inset 5px 5px 12px rgba(8, 34, 31, 0.72), inset -4px -4px 9px rgba(94, 234, 212, 0.24);',
      '}',
      '#rj-keynote-controls {',
      '  position: fixed; top: calc(12px + env(safe-area-inset-top, 0px)); right: 14px; z-index: 60;',
      '  display: none; align-items: center; gap: 8px;',
      '  font-family: -apple-system, BlinkMacSystemFont, "Anuphan", "Prompt", sans-serif;',
      '}',
      '#rj-keynote-controls.rj-show { display: flex; }',
      '.rj-ctrl-pill {',
      '  display: inline-flex; align-items: center; gap: 6px;',
      '  padding: 8px 14px; border-radius: 9999px;',
      '  background: rgba(28, 34, 43, 0.84);',
      '  border: 1px solid rgba(255, 255, 255, 0.14);',
      '  box-shadow: 4px 4px 10px rgba(8, 12, 18, 0.65), -2px -2px 8px rgba(56, 70, 90, 0.25);',
      '  color: #f4f7fb; font-size: 11.5px; font-weight: 700;',
      '  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);',
      '  cursor: pointer; user-select: none; -webkit-tap-highlight-color: transparent;',
      '  transition: transform 0.18s ease, border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;',
      '}',
      '.rj-ctrl-pill:hover { border-color: rgba(94, 234, 212, 0.65); background: rgba(28, 34, 43, 0.96); transform: translateY(-1px); }',
      '.rj-ctrl-pill:active, .rj-ctrl-pill.is-tapping {',
      '  transform: translateY(1.5px) scale(0.965);',
      '  box-shadow: inset 3px 3px 7px rgba(6, 9, 14, 0.8), inset -2px -2px 6px rgba(64, 80, 102, 0.25);',
      '}',
      '.rj-ctrl-pill.rj-active { border-color: rgba(94, 234, 212, 0.75); color: #5eead4; }'
    ].join('\n');
    document.head.appendChild(style);
  }

  function resizeCanvas() {
    if (!canvasEl || !ctx) return;
    const dpr = Math.min(global.devicePixelRatio || 1, 2);
    W = global.innerWidth || 1024;
    H = global.innerHeight || 768;
    canvasEl.width = Math.round(W * dpr);
    canvasEl.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function easeInOutQuart(x) {
    return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
  }

  function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
  }

  function stopLoop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function renderMistFrame(now) {
    if (!rootEl || rootEl.classList.contains('rj-hidden') || !ctx) {
      stopLoop();
      return;
    }
    rafId = requestAnimationFrame(renderMistFrame);
    if (document.hidden || W <= 0 || H <= 0) return;

    const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) * 0.001));
    lastTs = now;
    const t = now * 0.001;

    ctx.clearRect(0, 0, W, H);

    // Compute backdrop opacity and mist reveal progress
    let p = 0;
    let backdropAlpha = 0.94;
    let partEase = 0;
    let surgeMix = 0;
    let revealFade = 1;

    if (isTransitioning) {
      p = Math.min(1, (now - revealStartTs) / (REVEAL_DURATION * 1000));
      // Smoothly lift dark obsidian backdrop between p = 0.08 and p = 0.68
      const bgNorm = Math.max(0, Math.min(1, (p - 0.08) / 0.60));
      backdropAlpha = 0.94 * (1 - easeInOutQuart(bgNorm));

      // Mist swells softly right after click (0 -> 0.24), then parts & dissolves smoothly
      if (p < 0.24) {
        surgeMix = easeOutCubic(p / 0.24);
      } else {
        surgeMix = 1;
      }

      const partNorm = Math.max(0, Math.min(1, (p - 0.06) / 0.94));
      partEase = easeInOutQuart(partNorm);

      // Smoothly dissolve parting mist clouds after p = 0.36 into the Moonlit Peach Cliff
      if (p > 0.36) {
        revealFade = Math.pow(Math.max(0, 1 - (p - 0.36) / 0.64), 1.65);
      }
    }

    // 1. Neumorphic Adaptive Backdrop (fades smoothly to reveal Moonlit Peach Cliff behind)
    if (backdropAlpha > 0.003) {
      const isLightGate = document.documentElement.getAttribute('data-theme') === 'light';
      const bgGrad = ctx.createRadialGradient(W * 0.5, H * 0.44, 20, W * 0.5, H * 0.5, Math.max(W, H) * 0.78);
      if (isLightGate) {
        bgGrad.addColorStop(0, 'rgba(235, 240, 245, ' + (backdropAlpha * 0.96).toFixed(3) + ')');
        bgGrad.addColorStop(0.60, 'rgba(226, 233, 240, ' + (backdropAlpha * 0.98).toFixed(3) + ')');
        bgGrad.addColorStop(1, 'rgba(214, 222, 232, ' + backdropAlpha.toFixed(3) + ')');
      } else {
        bgGrad.addColorStop(0, 'rgba(32, 39, 50, ' + (backdropAlpha * 0.96).toFixed(3) + ')');
        bgGrad.addColorStop(0.55, 'rgba(24, 30, 39, ' + (backdropAlpha * 0.98).toFixed(3) + ')');
        bgGrad.addColorStop(1, 'rgba(18, 22, 29, ' + backdropAlpha.toFixed(3) + ')');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);
    }

    // 2. Soft Luminous Mist Opening Halo at Center during Parting
    if (isTransitioning && p > 0.05 && p < 0.85) {
      const haloEnv = Math.sin(Math.min(1, (p - 0.05) / 0.80) * Math.PI);
      const haloR = Math.max(W, H) * (0.28 + partEase * 0.48);
      const hg = ctx.createRadialGradient(W * 0.5, H * 0.48, 8, W * 0.5, H * 0.48, haloR);
      hg.addColorStop(0, 'rgba(216, 240, 255, ' + (0.24 * haloEnv).toFixed(3) + ')');
      hg.addColorStop(0.5, 'rgba(147, 197, 253, ' + (0.10 * haloEnv).toFixed(3) + ')');
      hg.addColorStop(1, 'rgba(147, 197, 253, 0)');
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.arc(W * 0.5, H * 0.48, haloR, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Volumetric Layered Mist Clouds (Idle Drift -> Surge -> Silky Outward Parting)
    for (let i = 0; i < mistBanks.length; i++) {
      const m = mistBanks[i];
      if (!isTransitioning) {
        m.x += m.idleVx * dt;
        if (m.x > 1.38) m.x = -0.38;
        if (m.x < -0.38) m.x = 1.38;
        m.baseX = m.x;
        m.baseY = m.y;
      }

      const pxNorm = isTransitioning ? m.baseX + m.partVx * partEase : m.x;
      const pyNorm = isTransitioning ? m.baseY + m.partVy * partEase : m.y;

      const breath = 0.88 + 0.12 * Math.sin(t * m.bobSpd + m.ph);
      let alpha = isTransitioning
        ? (m.idleAlpha + (m.surgeAlpha - m.idleAlpha) * surgeMix) * revealFade * breath
        : m.idleAlpha * breath;

      if (!isTransitioning) {
        const edgeNorm = (m.x + 0.38) / 1.76;
        const edgeFade = Math.min(1, Math.sin(Math.max(0, Math.min(1, edgeNorm)) * Math.PI) * 2.2);
        alpha *= edgeFade;
      }

      if (alpha < 0.004) continue;

      const scaleBoost = isTransitioning ? 1 + partEase * (0.42 + m.layer * 0.14) : 1;
      const mw = m.w * W * scaleBoost;
      const mh = m.h * H * scaleBoost;
      const cx = pxNorm * W;
      const cy = pyNorm * H + Math.sin(t * m.bobSpd + m.ph) * m.bobAmp;

      ctx.save();
      ctx.globalAlpha = Math.min(0.88, alpha);
      ctx.translate(cx, cy);
      ctx.rotate(m.rot + (isTransitioning ? m.rotSpd * partEase * 2.4 : Math.sin(t * 0.25 + m.ph) * 0.03));
      ctx.drawImage(m.sprite, -mw / 2, -mh / 2, mw, mh);
      ctx.restore();
    }

    // 4. Shimmering Cold Frost Motes Swirling with the Parting Mist
    if (isTransitioning && revealFade > 0.02) {
      for (let i = 0; i < frostMotes.length; i++) {
        const mt = frostMotes[i];
        mt.x += mt.vx * dt * (0.6 + partEase * 1.4);
        mt.y += mt.vy * dt * (0.6 + partEase * 1.4);
        const mx = mt.x * W;
        const my = mt.y * H;
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * mt.tw + mt.ph));
        const a = 0.65 * tw * revealFade;
        const r = mt.r * 3.2;

        const mg = ctx.createRadialGradient(mx, my, 0.2, mx, my, r);
        mg.addColorStop(0, 'rgba(240, 249, 255, ' + a.toFixed(3) + ')');
        mg.addColorStop(0.5, 'rgba(186, 230, 253, ' + (a * 0.42).toFixed(3) + ')');
        mg.addColorStop(1, 'rgba(186, 230, 253, 0)');
        ctx.fillStyle = mg;
        ctx.beginPath();
        ctx.arc(mx, my, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Complete transition cleanly with zero residual overhead
    if (isTransitioning && p >= 1) {
      isTransitioning = false;
      rootEl.classList.add('rj-hidden');
      stopLoop();
      updateControlsVisibility();
    }
  }

  function startLoop() {
    if (rafId) return;
    lastTs = performance.now();
    rafId = requestAnimationFrame(renderMistFrame);
  }

  // ============================================================================
  // SOFT CINEMATIC AMBIENT PAD (WEB AUDIO API — ZERO EXTERNAL LINK FAILURES)
  // ============================================================================
  function startAmbientMusic() {
    try {
      const AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return;
      if (!musicCtx) {
        musicCtx = new AC();
        musicMasterGain = musicCtx.createGain();
        musicMasterGain.gain.setValueAtTime(0.0001, musicCtx.currentTime);
        musicMasterGain.connect(musicCtx.destination);

        // Warm cinematic Dmaj9 / ethereal sanctuary chord
        const freqs = [146.83, 220.0, 277.18, 329.63, 440.0];
        const filter = musicCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(720, musicCtx.currentTime);
        filter.connect(musicMasterGain);

        musicOscs = freqs.map(function (f, idx) {
          const osc = musicCtx.createOscillator();
          const g = musicCtx.createGain();
          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(f, musicCtx.currentTime);
          osc.detune.setValueAtTime((idx - 2) * 3.5, musicCtx.currentTime);
          g.gain.setValueAtTime(idx === 0 ? 0.16 : 0.085, musicCtx.currentTime);
          osc.connect(g);
          g.connect(filter);
          osc.start();
          return osc;
        });
      }
      if (musicCtx.state === 'suspended') musicCtx.resume().catch(function () {});
      const now = musicCtx.currentTime;
      musicMasterGain.gain.cancelScheduledValues(now);
      musicMasterGain.gain.setValueAtTime(Math.max(0.0001, musicMasterGain.gain.value), now);
      musicMasterGain.gain.linearRampToValueAtTime(0.11, now + 1.4);
      musicEnabled = true;
      updateControlLabels();
    } catch (_) {}
  }

  function stopAmbientMusic() {
    musicEnabled = false;
    try {
      if (musicCtx && musicMasterGain) {
        const now = musicCtx.currentTime;
        musicMasterGain.gain.cancelScheduledValues(now);
        musicMasterGain.gain.setValueAtTime(musicMasterGain.gain.value, now);
        musicMasterGain.gain.linearRampToValueAtTime(0.0001, now + 0.55);
      }
    } catch (_) {}
    updateControlLabels();
  }

  // ============================================================================
  // STUDIO 24kHz AI HOST NARRATION (STRICTLY NO BROWSER SPEECH SYNTHESIS!)
  // ============================================================================
  function stopHostNarration() {
    hostSessionId += 1;
    hostPlaying = false;
    if (hostAudioEl) {
      try {
        hostAudioEl.onended = null;
        hostAudioEl.onerror = null;
        hostAudioEl.pause();
      } catch (_) {}
    }
    if (hostBlobUrl) {
      try { URL.revokeObjectURL(hostBlobUrl); } catch (_) {}
      hostBlobUrl = null;
    }
    updateControlLabels();
  }

  async function playHostSegment(idx) {
    const core = global.RJCLOUD_CORE || global.RJLearningCore || {};
    if (typeof core.fetchStudioGuideBlob !== 'function') {
      stopHostNarration();
      return;
    }
    if (idx >= HOST_SEGMENTS.length) {
      stopHostNarration();
      return;
    }

    const sid = hostSessionId;
    hostSegmentIdx = idx;
    hostPlaying = true;
    updateControlLabels();

    const seg = HOST_SEGMENTS[idx];
    try {
      const blob = await core.fetchStudioGuideBlob(seg.text, currentGasUrl, seg.voice);
      if (hostSessionId !== sid || !isLandingNow) return;
      if (!blob || blob.size <= 44) {
        stopHostNarration();
        return;
      }

      if (!hostAudioEl) {
        hostAudioEl = new Audio();
        hostAudioEl.playsInline = true;
        hostAudioEl.setAttribute('playsinline', '');
      }
      if (hostBlobUrl) {
        try { URL.revokeObjectURL(hostBlobUrl); } catch (_) {}
      }
      hostBlobUrl = URL.createObjectURL(blob);

      await new Promise(function (resolve) {
        hostAudioEl.muted = false;
        hostAudioEl.src = hostBlobUrl;
        hostAudioEl.onended = function () { resolve(true); };
        hostAudioEl.onerror = function () { resolve(false); };
        try { hostAudioEl.load(); } catch (_) {}
        const p = hostAudioEl.play();
        if (p && typeof p.catch === 'function') p.catch(function () { resolve(false); });
      });

      if (hostSessionId === sid && isLandingNow && hostPlaying) {
        playHostSegment(idx + 1);
      }
    } catch (_) {
      if (hostSessionId === sid) stopHostNarration();
    }
  }

  function startHostNarration() {
    stopHostNarration();
    const sid = ++hostSessionId;
    if (sid) playHostSegment(0);
  }

  function updateControlLabels() {
    if (hostBtnEl) {
      const seg = HOST_SEGMENTS[hostSegmentIdx] || HOST_SEGMENTS[0];
      hostBtnEl.classList.toggle('rj-active', hostPlaying);
      hostBtnEl.textContent = hostPlaying
        ? '❚❚ พิธีกร' + seg.role + ' AI (' + (hostSegmentIdx + 1) + '/' + HOST_SEGMENTS.length + ') • หยุด'
        : '▶ พิธีกร AI';
    }
    if (musicBtnEl) {
      musicBtnEl.classList.toggle('rj-active', musicEnabled);
      musicBtnEl.textContent = musicEnabled ? '♪ เพลง: เปิด' : '♪ เพลง: ปิด';
    }
  }

  function updateControlsVisibility() {
    if (!controlsEl) return;
    const show = isLandingNow && hasDismissedGate && !isTransitioning;
    controlsEl.classList.toggle('rj-show', show);
    updateControlLabels();
  }

  // ============================================================================
  // DOM CREATION & WELCOME BUTTON TRIGGER
  // ============================================================================
  function ensureDom() {
    if (rootEl) return;
    injectStyles();

    rootEl = document.createElement('div');
    rootEl.id = 'rj-keynote-gate';
    rootEl.className = 'rj-hidden';
    rootEl.innerHTML = [
      '<canvas id="rj-keynote-canvas" aria-hidden="true"></canvas>',
      '<div id="rj-keynote-card" role="dialog" aria-modal="true" aria-label="BETA organ cloud 2.0 เปิดใช้งาน 2027">',
      '  <div class="rj-beta-pill"><span class="rj-beta-dot"></span><span>BETA</span></div>',
      '  <h1 class="rj-gate-title">organ cloud <span class="rj-ver">2.0</span></h1>',
      '  <p class="rj-gate-sub">เปิดใช้งาน 2027</p>',
      '  <button id="rj-welcome-btn" type="button">',
      '    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M4 2.5v11l9.5-5.5L4 2.5z"/></svg>',
      '    <span>Welcome</span>',
      '  </button>',
      '</div>'
    ].join('');

    document.body.appendChild(rootEl);

    canvasEl = document.getElementById('rj-keynote-canvas');
    cardEl = document.getElementById('rj-keynote-card');
    ctx = canvasEl ? canvasEl.getContext('2d') : null;

    const welcomeBtn = document.getElementById('rj-welcome-btn');
    if (welcomeBtn) {
      welcomeBtn.addEventListener('pointerdown', function () {
        welcomeBtn.classList.add('is-tapping');
        const release = function () {
          setTimeout(function () { welcomeBtn.classList.remove('is-tapping'); }, 110);
        };
        global.addEventListener('pointerup', release, { once: true });
        global.addEventListener('pointercancel', release, { once: true });
      });

      welcomeBtn.addEventListener('click', function () {
        if (isTransitioning) return;
        hasDismissedGate = true;
        isTransitioning = true;
        revealStartTs = performance.now();

        // Freeze current drift positions as smooth starting coordinates for outward mist parting
        for (let i = 0; i < mistBanks.length; i++) {
          mistBanks[i].baseX = mistBanks[i].x;
          mistBanks[i].baseY = mistBanks[i].y;
        }

        if (cardEl) cardEl.classList.add('rj-dissolving');
        rootEl.style.pointerEvents = 'none';

        // Start gentle ambient pad + 24kHz studio AI host narration (if configured)
        startAmbientMusic();
        setTimeout(function () {
          if (isLandingNow) startHostNarration();
        }, 750);
      });
    }

    // Subtle top-right audio control bar (only visible on landing after entering)
    controlsEl = document.createElement('div');
    controlsEl.id = 'rj-keynote-controls';
    controlsEl.innerHTML = [
      '<button id="rj-host-toggle" type="button" class="rj-ctrl-pill">▶ พิธีกร AI</button>',
      '<button id="rj-music-toggle" type="button" class="rj-ctrl-pill">♪ เพลง: ปิด</button>'
    ].join('');
    document.body.appendChild(controlsEl);

    hostBtnEl = document.getElementById('rj-host-toggle');
    musicBtnEl = document.getElementById('rj-music-toggle');

    if (hostBtnEl) {
      hostBtnEl.addEventListener('click', function () {
        if (hostPlaying) stopHostNarration();
        else startHostNarration();
      });
    }
    if (musicBtnEl) {
      musicBtnEl.addEventListener('click', function () {
        if (musicEnabled) stopAmbientMusic();
        else startAmbientMusic();
      });
    }

    [hostBtnEl, musicBtnEl].forEach(function (pill) {
      if (!pill) return;
      pill.addEventListener('pointerdown', function () {
        pill.classList.add('is-tapping');
        const release = function () {
          setTimeout(function () { pill.classList.remove('is-tapping'); }, 110);
        };
        global.addEventListener('pointerup', release, { once: true });
        global.addEventListener('pointercancel', release, { once: true });
      });
    });

    resizeCanvas();
    seedMistParticles();
    startLoop();
  }

  function hideGateImmediately() {
    if (!rootEl) return;
    isTransitioning = false;
    rootEl.classList.add('rj-hidden');
    stopLoop();
  }

  // Public API called by index.html
  const api = {
    sync: function (opts) {
      const cfg = opts || {};
      isLandingNow = Boolean(cfg.isLanding);
      if (cfg.appsScriptUrl) currentGasUrl = String(cfg.appsScriptUrl);

      ensureDom();

      if (!isLandingNow) {
        hideGateImmediately();
        stopHostNarration();
        stopAmbientMusic();
        updateControlsVisibility();
        return;
      }

      if (!hasDismissedGate) {
        showGate();
      } else {
        updateControlsVisibility();
      }
    },
    open: function () {
      hasDismissedGate = false;
      isLandingNow = true;
      showGate();
      updateControlsVisibility();
    },
    stopAudio: function () {
      stopHostNarration();
      stopAmbientMusic();
    }
  };

  global.RJCLOUD_KEYNOTE = api;

  // Signal index.html immediately so there is zero race condition
  try {
    global.dispatchEvent(new Event('rjcloud-keynote-ready'));
  } catch (_) {}
})(typeof window !== 'undefined' ? window : globalThis);
