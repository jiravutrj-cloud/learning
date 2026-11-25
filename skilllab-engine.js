/**
 * ============================================================================
 * rjcloud.organ 2.0 — AI Skill Lab 3D Engine (skilllab-engine.js • Particle Anime Edition)
 * โมดูลกลางแบบ Zero-Build เผยแพร่ผ่าน window.RJCLOUD_SKILLLAB
 *
 * ความสามารถครบชุดภายในไฟล์เดียว:
 * 1. Emotion & Dual Radar Metadata (Family Approach 5 แกน + SBAR ICU 5 แกน)
 * 2. 6 Clinical Personas + แนวทางคำพูด 2 ภาษา (TH / EN) ครบทุกเคส
 * 3. 2,800-Particle Warm Friendly Anime Engine (แทนที่ Hologram เดิม • 60FPS Zero-Cost):
 *    - ฝูงอนุภาค 2,800 ดวง (1,900 บนมือถือ) แปลงร่าง: อนิเมะอบอุ่นเป็นมิตร ⇄ ข้อความตามอารมณ์ & เปลี่ยนสี
 *    - ปรับบุคลิกอัตโนมัติตามเคส (หญิงผมยาว / อาวุโสมวยผม / แพทย์ชายเสื้อกาวน์ / 2 ตัวละคร ภรรยา & คุณแม่)
 *    - Real Audio-Amplitude Lip-Sync ขยับปากตรงตามคลื่นเสียง Gemini 24kHz จริง
 * 4. Realism #1–#4, Profession-Aware AI Advisor v4, Debrief PNG & Research R2R
 * ============================================================================
 */
(function (global) {
  'use strict';

  // ==========================================================================
  // 9. 2,800-PARTICLE ENGINE: WARM FRIENDLY ANIME ⇄ EMOTION TEXT & COLOR MORPH
  //    (แทนที่ 3D Hologram เดิม • โทนอบอุ่นเป็นมิตร มีแก้มอมชมพู + Real Lip-Sync)
  // ==========================================================================
  const PARTICLE_EMO_PALETTE = {
    CONFUSED: { textTop: 'สับสน',         textSub: 'CONFUSED', c1: [232, 246, 255], c2: [96, 198, 255],  c3: [139, 152, 255], blush: [255, 178, 206] },
    SHOCK:    { textTop: 'ช็อก / ตกใจ',   textSub: 'SHOCK',    c1: [255, 242, 245], c2: [255, 148, 168], c3: [244, 114, 148], blush: [255, 168, 194] },
    ANGRY:    { textTop: 'คัดค้าน!',      textSub: 'TENSE',    c1: [255, 247, 238], c2: [253, 168, 96],  c3: [249, 115, 115], blush: [255, 174, 156] },
    SAD:      { textTop: 'โศกเศร้า',      textSub: 'GRIEVING', c1: [246, 242, 255], c2: [198, 154, 255], c3: [132, 140, 255], blush: [244, 176, 224] },
    HESITANT: { textTop: 'ลังเล',         textSub: 'HESITANT', c1: [255, 251, 238], c2: [253, 204, 82],  c3: [96, 196, 255],  blush: [255, 184, 196] },
    CALM:     { textTop: 'สงบ • วางใจ',   textSub: 'CALM',     c1: [238, 255, 248], c2: [86, 232, 182],  c3: [72, 214, 246],  blush: [255, 182, 210] }
  };

  function resolveParticleAnimeId(personaId) {
    if (personaId === 'conflict') return 'dual';
    if (personaId === 'sbar_doctor') return 'male';
    if (personaId === 'pediatric') return 'elder_female';
    return 'female';
  }

  function drawFriendlyAnimeLayer(c, part, animeProfile, emoId, isDualLeft) {
    c.strokeStyle = '#ffffff';
    c.fillStyle = '#ffffff';
    c.lineCap = 'round';
    c.lineJoin = 'round';

    const hairType = animeProfile === 'elder_female' ? 'bun' : (animeProfile === 'male' ? 'short' : 'long');
    const isDoctor = animeProfile === 'male';

    if (part === 0) {
      // โครงหน้าอนิเมะมนอบอุ่น + ใบหู + จมูกเล็ก + คอ + ไหล่/เสื้อกาวน์
      c.lineWidth = 4.6;
      c.beginPath();
      c.moveTo(-64, -14);
      c.bezierCurveTo(-66, 30, -44, 62, 0, 72);
      c.bezierCurveTo(44, 62, 66, 30, 64, -14);
      c.stroke();

      c.lineWidth = 3.6;
      c.beginPath(); c.arc(-66, 12, 11, Math.PI * 0.55, Math.PI * 1.48); c.stroke();
      c.beginPath(); c.arc(66, 12, 11, -Math.PI * 0.48, Math.PI * 0.45); c.stroke();

      c.beginPath(); c.arc(0, 22, 2.2, 0, Math.PI * 2); c.fill();

      c.lineWidth = 4.2;
      c.beginPath();
      c.moveTo(-16, 68); c.quadraticCurveTo(-18, 86, -24, 96);
      c.moveTo(16, 68);  c.quadraticCurveTo(18, 86, 24, 96);
      c.stroke();

      const shW = isDoctor ? 114 : 96;
      c.lineWidth = 4.8;
      c.beginPath();
      c.moveTo(-shW, 152); c.quadraticCurveTo(-shW * 0.82, 102, -24, 96);
      c.moveTo(shW, 152);  c.quadraticCurveTo(shW * 0.82, 102, 24, 96);
      c.stroke();

      if (isDoctor) {
        c.lineWidth = 4.0;
        c.beginPath();
        c.moveTo(-36, 98); c.lineTo(-12, 146); c.lineTo(0, 134); c.lineTo(12, 146); c.lineTo(36, 98);
        c.stroke();
        c.lineWidth = 3.4;
        c.beginPath();
        c.moveTo(-34, 96); c.bezierCurveTo(-48, 122, -46, 144, -36, 152);
        c.moveTo(34, 96);  c.bezierCurveTo(48, 122, 46, 140, 36, 148);
        c.stroke();
        c.beginPath(); c.arc(36, 150, 7, 0, Math.PI * 2); c.stroke();
      } else {
        c.lineWidth = 3.8;
        c.beginPath();
        c.moveTo(-30, 97); c.quadraticCurveTo(0, 124, 30, 97);
        c.stroke();
      }
    } else if (part === 1) {
      // ดวงตาอนิเมะอบอุ่น เป็นมิตร มีประกายแสงคู่ (ตายิ้มโค้ง ◠ ◠ ตอน CALM)
      [-27, 27].forEach(function (ex) {
        const s = ex < 0 ? -1 : 1;
        if (emoId === 'CALM') {
          c.lineWidth = 5.6;
          c.beginPath();
          c.arc(ex, 12, 15, Math.PI * 1.12, Math.PI * 1.88);
          c.stroke();
          c.lineWidth = 3.2;
          c.beginPath();
          c.moveTo(ex + s * 13, 6); c.lineTo(ex + s * 18, 2);
          c.stroke();
        } else {
          c.lineWidth = 5.8;
          c.beginPath();
          c.moveTo(ex - s * 14, 4);
          c.quadraticCurveTo(ex, emoId === 'SHOCK' ? -13 : -9, ex + s * 17, emoId === 'SAD' ? 8 : 3);
          c.stroke();

          const ry = emoId === 'SHOCK' ? 12.5 : (emoId === 'SAD' ? 10.5 : 11.5);
          c.lineWidth = 3.6;
          c.beginPath();
          c.ellipse(ex, 8, 10.5, ry, 0, 0, Math.PI * 2);
          c.stroke();

          c.beginPath(); c.arc(ex - 3.8, 3.8, 4.0, 0, Math.PI * 2); c.fill();
          c.beginPath(); c.arc(ex + 3.6, 12.2, 2.0, 0, Math.PI * 2); c.fill();

          c.lineWidth = 2.2;
          c.beginPath();
          c.arc(ex, 9, 12.5, Math.PI * 0.24, Math.PI * 0.76);
          c.stroke();
        }
      });
    } else if (part === 2) {
      // คิ้วอนิเมะแสดงอารมณ์อย่างอ่อนโยน
      c.lineWidth = 4.2;
      [-1, 1].forEach(function (s) {
        const xIn = s * 13, xOut = s * 40;
        let yIn = -17, yOut = -16;
        if (emoId === 'CALM') { yIn = -19; yOut = -17; }
        else if (emoId === 'SHOCK') { yIn = -26; yOut = -22; }
        else if (emoId === 'SAD') { yIn = -23; yOut = -13; }
        else if (emoId === 'ANGRY') { yIn = -11; yOut = -21; }
        else if (emoId === 'CONFUSED') { yIn = s < 0 ? -21 : -16; yOut = s < 0 ? -17 : -21; }
        else if (emoId === 'HESITANT') { yIn = -19; yOut = -15; }
        c.beginPath();
        c.moveTo(xIn, yIn);
        c.quadraticCurveTo(s * 26, Math.min(yIn, yOut) - 4, xOut, yOut);
        c.stroke();
      });
    } else if (part === 3) {
      // ปากอนิเมะ (ขยับตามคลื่นเสียงจริง Real Audio Lip-Sync)
      c.lineWidth = 4.4;
      if (emoId === 'CALM') {
        c.beginPath(); c.arc(0, 38, 13, Math.PI * 0.14, Math.PI * 0.86); c.stroke();
      } else if (emoId === 'SHOCK') {
        c.beginPath(); c.ellipse(0, 46, 7.5, 9.5, 0, 0, Math.PI * 2); c.stroke();
      } else if (emoId === 'SAD') {
        c.beginPath(); c.arc(0, 54, 11, Math.PI * 1.18, Math.PI * 1.82); c.stroke();
      } else if (emoId === 'ANGRY') {
        c.beginPath(); c.moveTo(-12, 47); c.quadraticCurveTo(0, 42, 12, 47); c.stroke();
      } else if (emoId === 'CONFUSED') {
        c.beginPath(); c.moveTo(-10, 46); c.quadraticCurveTo(-4, 42, 0, 46); c.quadraticCurveTo(5, 49, 10, 45); c.stroke();
      } else {
        c.beginPath(); c.moveTo(-9, 45); c.quadraticCurveTo(0, 48, 9, 45); c.stroke();
      }
    } else if (part === 4) {
      // ทรงผมอนิเมะ 3 สไตล์ (ผมยาวหน้าม้าซีทรู / มวยผมอาวุโส / ผมสั้นแพทย์ชาย)
      c.lineWidth = 5.0;
      c.beginPath();
      c.moveTo(-78, -6);
      c.bezierCurveTo(-80, -68, -46, -96, 0, -96);
      c.bezierCurveTo(46, -96, 80, -68, 78, -6);
      c.stroke();

      if (hairType === 'long') {
        c.lineWidth = 4.4;
        c.beginPath();
        c.moveTo(-66, -24); c.quadraticCurveTo(-48, -14, -36, -34);
        c.quadraticCurveTo(-22, -12, -8, -32);
        c.quadraticCurveTo(6, -12, 22, -32);
        c.quadraticCurveTo(40, -14, 66, -24);
        c.stroke();
        c.lineWidth = 5.2;
        [-1, 1].forEach(function (s) {
          c.beginPath();
          c.moveTo(s * 78, -8);
          c.bezierCurveTo(s * 94, 42, s * 98, 96, s * 80, 134);
          c.quadraticCurveTo(s * 64, 122, s * 62, 86);
          c.stroke();
          c.lineWidth = 3.8;
          c.beginPath();
          c.moveTo(s * 64, -18); c.quadraticCurveTo(s * 76, 28, s * 56, 76);
          c.stroke();
          c.lineWidth = 5.2;
        });
      } else if (hairType === 'bun') {
        c.lineWidth = 5.4;
        c.beginPath(); c.arc(0, -110, 26, Math.PI * 0.92, Math.PI * 2.08); c.stroke();
        c.lineWidth = 3.6;
        c.beginPath(); c.moveTo(-26, -96); c.quadraticCurveTo(0, -104, 26, -96); c.stroke();
        c.lineWidth = 4.6;
        c.beginPath();
        c.moveTo(-68, -16); c.quadraticCurveTo(-22, -46, 24, -36); c.quadraticCurveTo(56, -26, 68, -12);
        c.stroke();
        [-1, 1].forEach(function (s) {
          c.beginPath(); c.moveTo(s * 76, -8); c.quadraticCurveTo(s * 84, 34, s * 60, 68); c.stroke();
        });
      } else {
        c.lineWidth = 4.8;
        c.beginPath();
        c.moveTo(-66, -20); c.quadraticCurveTo(-48, -32, -32, -16);
        c.quadraticCurveTo(-16, -42, 2, -18);
        c.quadraticCurveTo(22, -42, 42, -18);
        c.quadraticCurveTo(56, -30, 66, -20);
        c.stroke();
        c.lineWidth = 4.2;
        c.beginPath(); c.moveTo(-14, -95); c.quadraticCurveTo(-4, -108, 12, -96); c.stroke();
        [-1, 1].forEach(function (s) {
          c.beginPath(); c.moveTo(s * 76, -8); c.quadraticCurveTo(s * 76, 12, s * 66, 24); c.stroke();
        });
      }
    } else if (part === 5) {
      // แก้มอมชมพูน่ารัก (///) + หยดน้ำตา + ไอคอนอารมณ์ข้างศีรษะ
      c.lineWidth = 3.0;
      [-43, 43].forEach(function (bx) {
        [-7, 0, 7].forEach(function (dx) {
          c.beginPath(); c.moveTo(bx + dx - 2.5, 29); c.lineTo(bx + dx + 2.5, 21); c.stroke();
        });
      });

      if (emoId === 'SAD') {
        c.beginPath(); c.ellipse(-34, 29, 3.5, 6, 0.2, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.ellipse(34, 29, 3.5, 6, -0.2, 0, Math.PI * 2); c.fill();
      }

      if (!isDualLeft) {
        c.lineWidth = 3.8;
        if (emoId === 'CALM') {
          c.save(); c.translate(92, -56); c.scale(0.85, 0.85);
          c.beginPath();
          c.moveTo(0, 10);
          c.bezierCurveTo(-18, -4, -18, -22, 0, -10);
          c.bezierCurveTo(18, -22, 18, -4, 0, 10);
          c.fill();
          c.restore();
        } else if (emoId === 'CONFUSED') {
          c.font = '800 38px Prompt, Inter, sans-serif';
          c.textAlign = 'center'; c.textBaseline = 'middle';
          c.fillText('?', 92, -52);
        } else if (emoId === 'HESITANT') {
          [0, 1, 2].forEach(function (k) {
            c.beginPath(); c.arc(82 + k * 14, -44 - k * 8, 3.8 + k * 0.5, 0, Math.PI * 2); c.fill();
          });
        } else if (emoId === 'SHOCK') {
          c.beginPath();
          c.moveTo(84, -42); c.lineTo(96, -68);
          c.moveTo(96, -34); c.lineTo(114, -52);
          c.stroke();
        } else if (emoId === 'ANGRY') {
          c.beginPath();
          c.moveTo(82, -56); c.quadraticCurveTo(92, -52, 88, -42);
          c.moveTo(100, -60); c.quadraticCurveTo(92, -50, 102, -44);
          c.stroke();
        }
      }
    }
  }

  function generateParticleAnimeTargets(animeId, emoId, count) {
    const W = 480, H = 480;
    const off = document.createElement('canvas');
    off.width = W; off.height = H;
    const c = off.getContext('2d');

    const quotas = [
      { part: 0, ratio: 0.28, zOff: 0.00 },
      { part: 4, ratio: 0.34, zOff: 0.04 },
      { part: 1, ratio: 0.16, zOff: 0.11 },
      { part: 2, ratio: 0.05, zOff: 0.10 },
      { part: 3, ratio: 0.06, zOff: 0.10 },
      { part: 5, ratio: 0.11, zOff: 0.09 }
    ];

    const pos = new Float32Array(count * 3);
    const partArr = new Uint8Array(count);
    const sideArr = new Uint8Array(count);
    let cursor = 0;

    const isDual = animeId === 'dual';
    const eyeCenterY = isDual ? 0.050 : -0.024;
    const mouthCenterY = isDual ? 0.239 : 0.258;

    quotas.forEach(function (q, qIdx) {
      c.clearRect(0, 0, W, H);
      if (isDual) {
        c.save(); c.translate(142, 238); c.scale(0.72, 0.72);
        drawFriendlyAnimeLayer(c, q.part, 'female', emoId === 'ANGRY' ? 'SAD' : emoId, true);
        c.restore();
        c.save(); c.translate(338, 238); c.scale(0.72, 0.72);
        drawFriendlyAnimeLayer(c, q.part, 'elder_female', emoId, false);
        c.restore();
      } else {
        c.save(); c.translate(240, 225); c.scale(1.08, 1.08);
        drawFriendlyAnimeLayer(c, q.part, animeId, emoId, false);
        c.restore();
      }

      const img = c.getImageData(0, 0, W, H).data;
      const pts = [];
      for (let y = 0; y < H; y += 2) {
        for (let x = 0; x < W; x += 2) {
          if (img[(y * W + x) * 4 + 3] > 90) pts.push([x, y]);
        }
      }

      const targetN = qIdx === quotas.length - 1 ? (count - cursor) : Math.floor(count * q.ratio);
      for (let i = 0; i < targetN && cursor < count; i++) {
        const pick = pts.length > 0 ? pts[Math.floor(Math.random() * pts.length)] : [240, 235];
        const nx = (pick[0] - 240) / 145;
        const ny = (pick[1] - 235) / 145;
        const localCx = isDual ? (pick[0] < 240 ? -0.68 : 0.68) : 0;
        const dx = nx - localCx;
        const r2 = Math.min(1.4, dx * dx + ny * ny);
        const nz = (0.24 - r2 * 0.18) + q.zOff + (Math.random() - 0.5) * 0.025;

        pos[cursor * 3]     = nx + (Math.random() - 0.5) * 0.012;
        pos[cursor * 3 + 1] = ny + (Math.random() - 0.5) * 0.012;
        pos[cursor * 3 + 2] = nz;
        partArr[cursor] = q.part;
        sideArr[cursor] = (isDual && pick[0] >= 240) ? 1 : 0;
        cursor++;
      }
    });

    return { pos: pos, part: partArr, side: sideArr, eyeCenterY: eyeCenterY, mouthCenterY: mouthCenterY };
  }

  function generateParticleEmotionTextTargets(emoId, count) {
    const meta = PARTICLE_EMO_PALETTE[emoId] || PARTICLE_EMO_PALETTE.CONFUSED;
    const off = document.createElement('canvas');
    off.width = 640; off.height = 240;
    const c = off.getContext('2d');
    c.fillStyle = '#000'; c.fillRect(0, 0, 640, 240);
    c.fillStyle = '#fff';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.font = '800 94px Prompt, Anuphan, sans-serif';
    c.fillText(meta.textTop, 320, 96);
    c.font = '700 42px Inter, JetBrains Mono, sans-serif';
    c.fillText(meta.textSub, 320, 178);

    const img = c.getImageData(0, 0, 640, 240).data;
    const valid = [];
    for (let y = 0; y < 240; y += 2) {
      for (let x = 0; x < 640; x += 2) {
        if (img[(y * 640 + x) * 4] > 110) valid.push([x, y]);
      }
    }

    const pos = new Float32Array(count * 3);
    const part = new Uint8Array(count);
    const side = new Uint8Array(count);
    for (let i = 0; i < count; i++) {
      const pick = valid[Math.floor(Math.random() * valid.length)] || [320, 120];
      pos[i * 3]     = ((pick[0] - 320) / 172) + (Math.random() - 0.5) * 0.018;
      pos[i * 3 + 1] = ((pick[1] - 122) / 172) + (Math.random() - 0.5) * 0.018;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.14;
      part[i] = pick[1] > 142 ? 1 : 0;
      side[i] = 0;
    }
    return { pos: pos, part: part, side: side, eyeCenterY: 0, mouthCenterY: 0.25 };
  }

  function mountHologram3D(container, initialState) {
    if (!container) {
      return { update: function () {}, toggleDisplayMode: function () { return 'anime'; }, destroy: function () {} };
    }

    const st = Object.assign(
      { personaId: 'standard', emotion: 'CONFUSED', trust: 40, isSpeaking: false, activeSpeaker: 'wife', getAudioAmplitude: null },
      initialState || {}
    );

    const canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return { update: function () {}, toggleDisplayMode: function () { return 'anime'; }, destroy: function () {} };
    }

    const particleCount = global.innerWidth < 640 ? 1900 : 2800;
    const initPal = PARTICLE_EMO_PALETTE[st.emotion] || PARTICLE_EMO_PALETTE.CONFUSED;
    const engine = {
      w: Math.max(1, container.clientWidth),
      h: Math.max(1, container.clientHeight),
      animeId: resolveParticleAnimeId(st.personaId),
      emoId: PARTICLE_EMO_PALETTE[st.emotion] ? st.emotion : 'CONFUSED',
      displayMode: 'anime',
      pendingReturnTimer: null,
      eyeCenterY: -0.024,
      mouthCenterY: 0.258,
      rotY: 0, rotX: 0, targetRotY: 0, targetRotX: 0,
      dragging: false, lx: 0, ly: 0,
      pointerX: -9999, pointerY: -9999,
      curC1: initPal.c1.slice(),
      curC2: initPal.c2.slice(),
      curC3: initPal.c3.slice(),
      curBlush: initPal.blush.slice()
    };

    let targetCache = {};
    function getTargets(mode, animeId, emoId) {
      const key = mode === 'text' ? ('T_' + emoId) : ('F_' + animeId + '_' + emoId);
      if (!targetCache[key]) {
        targetCache[key] = mode === 'text'
          ? generateParticleEmotionTextTargets(emoId, particleCount)
          : generateParticleAnimeTargets(animeId, emoId, particleCount);
      }
      return targetCache[key];
    }

    const initData = getTargets('anime', engine.animeId, engine.emoId);
    engine.eyeCenterY = initData.eyeCenterY;
    engine.mouthCenterY = initData.mouthCenterY;

    const particles = new Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      particles[i] = {
        x: (Math.random() - 0.5) * 3.8,
        y: (Math.random() - 0.5) * 2.8,
        z: (Math.random() - 0.5) * 1.8,
        vx: 0, vy: 0, vz: 0,
        tx: initData.pos[i * 3],
        ty: initData.pos[i * 3 + 1],
        tz: initData.pos[i * 3 + 2],
        part: initData.part[i],
        side: initData.side[i],
        size: 0.96 + Math.random() * 1.18,
        seed: Math.random() * Math.PI * 2
      };
    }

    function applyTargets(mode, animeId, emoId, scatterBurst) {
      engine.displayMode = mode;
      engine.animeId = animeId;
      engine.emoId = PARTICLE_EMO_PALETTE[emoId] ? emoId : 'CONFUSED';
      const data = getTargets(mode, engine.animeId, engine.emoId);
      engine.eyeCenterY = data.eyeCenterY;
      engine.mouthCenterY = data.mouthCenterY;

      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        if (scatterBurst) {
          p.vx += (Math.random() - 0.5) * 0.16;
          p.vy += (Math.random() - 0.5) * 0.16;
          p.vz += (Math.random() - 0.5) * 0.14;
        }
        p.tx = data.pos[i * 3];
        p.ty = data.pos[i * 3 + 1];
        p.tz = data.pos[i * 3 + 2];
        p.part = data.part[i];
        p.side = data.side[i];
      }
      if (mode === 'text') {
        engine.targetRotY = 0;
        engine.targetRotX = 0;
      }
    }

    function triggerEmotionMorph(nextAnimeId, nextEmoId) {
      clearTimeout(engine.pendingReturnTimer);
      applyTargets('text', nextAnimeId, nextEmoId, true);
      engine.pendingReturnTimer = setTimeout(function () {
        applyTargets('anime', nextAnimeId, nextEmoId, true);
      }, 2200);
    }

    function resize() {
      const r = container.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      const dpr = Math.min(global.devicePixelRatio || 1, 1.5);
      engine.w = r.width;
      engine.h = r.height;
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    const onMouseDown = function (e) { engine.dragging = true; engine.lx = e.clientX; engine.ly = e.clientY; };
    const onMouseMove = function (e) {
      const r = canvas.getBoundingClientRect();
      engine.pointerX = e.clientX - r.left;
      engine.pointerY = e.clientY - r.top;
      if (engine.dragging) {
        engine.targetRotY = Math.max(-0.55, Math.min(0.55, engine.targetRotY + (e.clientX - engine.lx) * 0.005));
        engine.targetRotX = Math.max(-0.28, Math.min(0.28, engine.targetRotX + (e.clientY - engine.ly) * 0.004));
        engine.lx = e.clientX; engine.ly = e.clientY;
      }
    };
    const onMouseUp = function () { engine.dragging = false; };
    const onMouseLeave = function () { engine.pointerX = -9999; engine.pointerY = -9999; };
    const onTouchStart = function (e) {
      if (e.touches && e.touches[0]) { engine.dragging = true; engine.lx = e.touches[0].clientX; engine.ly = e.touches[0].clientY; }
    };
    const onTouchMove = function (e) {
      if (engine.dragging && e.touches && e.touches[0]) {
        const r = canvas.getBoundingClientRect();
        engine.pointerX = e.touches[0].clientX - r.left;
        engine.pointerY = e.touches[0].clientY - r.top;
        engine.targetRotY = Math.max(-0.55, Math.min(0.55, engine.targetRotY + (e.touches[0].clientX - engine.lx) * 0.006));
        engine.targetRotX = Math.max(-0.28, Math.min(0.28, engine.targetRotX + (e.touches[0].clientY - engine.ly) * 0.005));
        engine.lx = e.touches[0].clientX; engine.ly = e.touches[0].clientY;
      }
    };
    const onTouchEnd = function () { engine.dragging = false; engine.pointerX = -9999; engine.pointerY = -9999; };

    canvas.addEventListener('mousedown', onMouseDown);
    global.addEventListener('mousemove', onMouseMove);
    global.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseLeave);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    global.addEventListener('touchmove', onTouchMove, { passive: true });
    global.addEventListener('touchend', onTouchEnd);
    global.addEventListener('resize', resize);

    let ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(resize);
      ro.observe(container);
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { targetCache = {}; }).catch(function () {});
    }

    let alive = true;
    let rafId = null;
    let lastTs = performance.now();
    let blinkTimer = 2.8;
    let smoothAmp = 0;

    function animate(now) {
      if (!alive) return;
      rafId = requestAnimationFrame(animate);
      if (document.hidden || engine.w <= 0 || engine.h <= 0) return;

      const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
      lastTs = now;
      const t = now * 0.001;

      if (!engine.dragging) {
        engine.targetRotY = Math.sin(t * 0.55) * (engine.displayMode === 'text' ? 0.12 : 0.17);
        engine.targetRotX = Math.cos(t * 0.42) * 0.042;
      }
      engine.rotY += (engine.targetRotY - engine.rotY) * (1 - Math.exp(-dt * 6));
      engine.rotX += (engine.targetRotX - engine.rotX) * (1 - Math.exp(-dt * 6));

      const pal = PARTICLE_EMO_PALETTE[engine.emoId] || PARTICLE_EMO_PALETTE.CONFUSED;
      const colLerp = 1 - Math.exp(-dt * 4.5);
      for (let c = 0; c < 3; c++) {
        engine.curC1[c] += (pal.c1[c] - engine.curC1[c]) * colLerp;
        engine.curC2[c] += (pal.c2[c] - engine.curC2[c]) * colLerp;
        engine.curC3[c] += (pal.c3[c] - engine.curC3[c]) * colLerp;
        engine.curBlush[c] += (pal.blush[c] - engine.curBlush[c]) * colLerp;
      }

      blinkTimer -= dt;
      if (blinkTimer <= 0) blinkTimer = 2.8 + Math.random() * 2.4;
      const blinkClose = (engine.emoId !== 'CALM' && blinkTimer < 0.14) ? Math.sin((blinkTimer / 0.14) * Math.PI) : 0;

      // Real Audio-Amplitude Lip-Sync (fallback เป็นจังหวะพูดนุ่มนวลหากออฟไลน์)
      let targetAmp = 0;
      if (st.isSpeaking) {
        const liveAmp = typeof st.getAudioAmplitude === 'function' ? st.getAudioAmplitude() : -1;
        targetAmp = (typeof liveAmp === 'number' && liveAmp >= 0)
          ? Math.min(1, liveAmp)
          : (0.20 + 0.46 * Math.abs(Math.sin(t * 8.2) * Math.cos(t * 3.4)));
      }
      smoothAmp += (targetAmp - smoothAmp) * (1 - Math.exp(-dt * (targetAmp > smoothAmp ? 22 : 14)));

      const cosY = Math.cos(engine.rotY), sinY = Math.sin(engine.rotY);
      const cosX = Math.cos(engine.rotX), sinX = Math.sin(engine.rotX);
      const cx = engine.w * 0.5;
      const cy = engine.h * (engine.w < 640 ? 0.41 : 0.43);
      const focal = Math.min(engine.w, engine.h) * (engine.w < 640 ? 0.55 : 0.50);
      const camZ = 3.45;

      ctx.clearRect(0, 0, engine.w, engine.h);

      const coreR = focal * (0.68 + smoothAmp * 0.08);
      const coreG = ctx.createRadialGradient(cx, cy, 6, cx, cy, coreR);
      coreG.addColorStop(0, 'rgba(' + Math.round(engine.curC2[0]) + ',' + Math.round(engine.curC2[1]) + ',' + Math.round(engine.curC2[2]) + ',' + (0.20 + smoothAmp * 0.08).toFixed(3) + ')');
      coreG.addColorStop(0.55, 'rgba(' + Math.round(engine.curC3[0]) + ',' + Math.round(engine.curC3[1]) + ',' + Math.round(engine.curC3[2]) + ',0.06)');
      coreG.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = coreG;
      ctx.beginPath(); ctx.arc(cx, cy, coreR, 0, Math.PI * 2); ctx.fill();

      const c1r = Math.round(engine.curC1[0]), c1g = Math.round(engine.curC1[1]), c1b = Math.round(engine.curC1[2]);
      const c2r = Math.round(engine.curC2[0]), c2g = Math.round(engine.curC2[1]), c2b = Math.round(engine.curC2[2]);
      const c3r = Math.round(engine.curC3[0]), c3g = Math.round(engine.curC3[1]), c3b = Math.round(engine.curC3[2]);
      const blr = Math.round(engine.curBlush[0]), blg = Math.round(engine.curBlush[1]), blb = Math.round(engine.curBlush[2]);
      const isDual = engine.animeId === 'dual';

      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        let gx = p.tx;
        let gy = p.ty + Math.sin(t * 1.45) * (engine.displayMode === 'anime' ? 0.018 : 0.008);
        let gz = p.tz;

        if (engine.displayMode === 'anime') {
          const isThisSideSpeaking = !isDual || (st.activeSpeaker === 'mother' ? p.side === 1 : p.side === 0);
          if (p.part === 3 && smoothAmp > 0.03 && isThisSideSpeaking) {
            const relY = p.ty - engine.mouthCenterY;
            gy += (relY >= 0 ? 1 : -0.4) * smoothAmp * 0.052;
          }
          if (p.part === 1 && blinkClose > 0.05) {
            gy = engine.eyeCenterY + (gy - engine.eyeCenterY) * (1 - blinkClose * 0.85);
          }
          if (p.part === 4 && p.ty > 0.1) {
            gx += Math.sin(t * 1.7 + p.seed) * 0.012;
          }
          if (p.part === 5 && p.ty < -0.1) {
            gy += Math.sin(t * 3.0 + p.seed) * 0.016;
          }
        } else if (smoothAmp > 0.04) {
          gz += Math.sin(t * 8 + p.seed) * smoothAmp * 0.032;
        }

        p.vx = (p.vx + (gx - p.x) * 0.082) * 0.81;
        p.vy = (p.vy + (gy - p.y) * 0.082) * 0.81;
        p.vz = (p.vz + (gz - p.z) * 0.082) * 0.81;
        p.x += p.vx; p.y += p.vy; p.z += p.vz;

        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.z * cosY + p.x * sinY;
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + p.y * sinX;

        const depth = camZ - z2;
        if (depth <= 0.4) continue;
        const persp = focal / depth;
        let sx = cx + x1 * persp;
        let sy = cy + y2 * persp;

        if (engine.pointerX > -500) {
          const dx = sx - engine.pointerX, dy = sy - engine.pointerY;
          const d2 = dx * dx + dy * dy;
          if (d2 < 5200 && d2 > 1) {
            const d = Math.sqrt(d2);
            const push = (1 - d / 72) * 14;
            sx += (dx / d) * push;
            sy += (dy / d) * push;
          }
        }

        const isEye = p.part === 1;
        const isBlushOrIcon = p.part === 5;
        const isFeature = isEye || p.part === 2 || p.part === 3;
        let alpha = isEye ? 0.95 : (isBlushOrIcon ? 0.88 : (isFeature ? 0.90 : 0.72));
        if (engine.displayMode === 'anime' && isDual && st.isSpeaking) {
          const isActiveSide = st.activeSpeaker === 'mother' ? p.side === 1 : p.side === 0;
          if (!isActiveSide) alpha *= 0.52;
        }
        const rad = Math.max(0.75, p.size * (isEye ? 1.15 : (isBlushOrIcon ? 1.10 : 0.98)) * (persp / 215));

        let r, g, b;
        if (engine.displayMode === 'anime' && isBlushOrIcon) {
          r = blr; g = blg; b = blb;
        } else if (engine.displayMode === 'anime' && isDual) {
          if (p.side === 0) {
            r = isEye ? 255 : (p.part === 4 ? 125 : 224);
            g = isEye ? 255 : (p.part === 4 ? 211 : 246);
            b = 255;
          } else {
            r = isEye ? 255 : (p.part === 4 ? c3r : c1r);
            g = isEye ? 255 : (p.part === 4 ? c3g : c1g);
            b = isEye ? 255 : (p.part === 4 ? c3b : c1b);
          }
        } else if (isEye) {
          r = 255; g = 255; b = 255;
        } else if (p.part === 2 || p.part === 3) {
          r = c1r; g = c1g; b = c1b;
        } else if (p.part === 4) {
          r = i % 3 === 0 ? c2r : c3r; g = i % 3 === 0 ? c2g : c3g; b = i % 3 === 0 ? c2b : c3b;
        } else {
          r = i % 2 === 0 ? c1r : c2r; g = i % 2 === 0 ? c1g : c2g; b = i % 2 === 0 ? c1b : c2b;
        }

        ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + alpha.toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(sx, sy, rad, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    rafId = requestAnimationFrame(animate);

    return {
      update: function (nextState) {
        const prevEmo = engine.emoId;
        const prevAnime = engine.animeId;
        Object.assign(st, nextState || {});
        const nextAnime = resolveParticleAnimeId(st.personaId);
        const nextEmo = PARTICLE_EMO_PALETTE[st.emotion] ? st.emotion : prevEmo;

        if (nextEmo !== prevEmo) {
          // เมื่อเปลี่ยนอารมณ์: แปลงเป็นข้อความตามอารมณ์ + เปลี่ยนสี -> ประกอบร่างอนิเมะสีหน้าใหม่
          triggerEmotionMorph(nextAnime, nextEmo);
        } else if (nextAnime !== prevAnime) {
          clearTimeout(engine.pendingReturnTimer);
          applyTargets('anime', nextAnime, nextEmo, true);
        }
      },
      toggleDisplayMode: function () {
        clearTimeout(engine.pendingReturnTimer);
        const nextMode = engine.displayMode === 'anime' ? 'text' : 'anime';
        applyTargets(nextMode, engine.animeId, engine.emoId, true);
        return nextMode;
      },
      destroy: function () {
        alive = false;
        clearTimeout(engine.pendingReturnTimer);
        if (rafId) cancelAnimationFrame(rafId);
        canvas.removeEventListener('mousedown', onMouseDown);
        global.removeEventListener('mousemove', onMouseMove);
        global.removeEventListener('mouseup', onMouseUp);
        canvas.removeEventListener('mouseleave', onMouseLeave);
        canvas.removeEventListener('touchstart', onTouchStart);
        global.removeEventListener('touchmove', onTouchMove);
        global.removeEventListener('touchend', onTouchEnd);
        global.removeEventListener('resize', resize);
        if (ro) ro.disconnect();
        try {
          if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        } catch (_) {}
      }
    };
  }

  // ==========================================================================
  // 10. EXPORT PUBLIC API TO window.RJCLOUD_SKILLLAB
  // ==========================================================================
  global.RJCLOUD_SKILLLAB = {
    EMOTIONS: EMOTIONS,
    RADAR_AXES: RADAR_AXES,
    SBAR_RADAR_AXES: SBAR_RADAR_AXES,
    CASE_ICU_BRIEFS: CASE_ICU_BRIEFS,
    COACH_QUICK_REPLIES: COACH_QUICK_REPLIES,
    HARD_MODE_CURVEBALLS: HARD_MODE_CURVEBALLS,
    SBAR_HARD_MODE_CURVEBALLS: SBAR_HARD_MODE_CURVEBALLS,
    MICRO_DRILL_STAGES: MICRO_DRILL_STAGES,
    ADVISOR_GOALS: ADVISOR_GOALS,
    ADVISOR_QUICK_QUESTIONS: ADVISOR_QUICK_QUESTIONS,
    SELF_EFFICACY_ITEMS: SELF_EFFICACY_ITEMS,
    SUS_ITEMS: SUS_ITEMS,

    getRadarAxes: getRadarAxes,
    getPersonas: getPersonas,
    getCaseVoices: getCaseVoices,
    getCoachQuickReplies: getCoachQuickReplies,
    getCaseBarriers: getCaseBarriers,
    evaluateBarriersUnlocked: evaluateBarriersUnlocked,
    getRemainingBarrierHint: getRemainingBarrierHint,
    computeInertiaTrust: computeInertiaTrust,
    pickHardCurveball: pickHardCurveball,
    evaluateMicroDrillAnswer: evaluateMicroDrillAnswer,

    detectInAppBrowser: detectInAppBrowser,
    pickLatencyMaskCue: pickLatencyMaskCue,
    createAudioLipSyncAnalyser: createAudioLipSyncAnalyser,
    createVocalToneRecorder: createVocalToneRecorder,
    computeSusScore: computeSusScore,
    buildBlindTranscript: buildBlindTranscript,
    computeClinicalBadges: computeClinicalBadges,

    resolveProfessionGroup: resolveProfessionGroup,
    computeLabRecommendation: computeLabRecommendation,
    answerAdvisorQuestion: answerAdvisorQuestion,
    detectTriggerPhrases: detectTriggerPhrases,
    parseRelativeResponse: parseRelativeResponse,
    splitDualSpeakerSegments: splitDualSpeakerSegments,
    extractIntroducedLearnerName: extractIntroducedLearnerName,

    evaluateConversationFallback: evaluateConversationFallback,
    buildSupervisorEvaluationPrompt: buildSupervisorEvaluationPrompt,
    parseSupervisorJson: parseSupervisorJson,
    downloadDebriefCardPng: downloadDebriefCardPng,
    SoundFX: SoundFX,
    mountHologram3D: mountHologram3D
  };
})(window);
