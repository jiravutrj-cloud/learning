/**
 * ============================================================================
 * rjcloud.organ 2.0 — AI Interactive Layer (ai-interactive.js)
 * ชื่อธีมอย่างเป็นทางการ: rjcloud.organ 2.0 (Atmospheric Horizon + Liquid Glass)
 * ยกระดับห้องเรียนผู้เรียนให้เป็นระบบ Interactive เต็มรูปแบบ โดยไม่กระทบโค้ดหลัก
 *
 * 5 ความสามารถหลัก:
 * 1. ระบบจดจำการเรียนต่อรายบท (Per-Lesson Smart Memory & Auto-Resume + 20-Lesson Map)
 * 2. AI กล่าวต้อนรับด้วยเสียงธรรมชาติเมื่อ Login กลับเข้ามา (AI Welcome Concierge + Ambient Runner)
 * 3. ทัวร์แนะนำการใช้งานห้องเรียนแบบไฟแอมเบี้ยน + เสียง AI (แสดงครั้งเดียวสำหรับผู้เรียนใหม่)
 * 4. ผู้ช่วย AI สดแบบลอยสั่งงานข้ามหน้าได้ (ลากย้ายอิสระ, จางอัตโนมัติเมื่อไม่ใช้งาน,
 *    สว่างชัดพร้อมวงแสงแอมเบี้ยนแสดงสถานะเมื่อเรียกใช้งาน)
 * 5. ระบบตอบสนองสัมผัส เสียงเอฟเฟกต์นุ่มนวล และแสงประกายฉลองความสำเร็จ
 * ============================================================================
 */
(function () {
  'use strict';

  if (window.RJCLOUD_AI_INTERACTIVE_LOADED) return;
  window.RJCLOUD_AI_INTERACTIVE_LOADED = true;

  // ==========================================================================
  // 1. CONSTANTS & STORAGE KEYS (RJCLOUD.ORGAN 2.0 + NATURAL VOICE CACHE v4)
  // ==========================================================================
  const STORE_PREFIX = 'rjcloud_ai_interactive_v1';
  const LEGACY_STORAGE_KEY = 'rjcloud_organ_state_v2027';
  const AUDIO_CACHE_DB = 'rjcloud_interactive_voice_cache_v4';
  const AUDIO_CACHE_STORE = 'clips';
  const IDLE_DIM_MS = 4000; // จางลงอัตโนมัติเมื่อไม่มีการโต้ตอบเกิน 4 วินาที

  const MENU_TOUR_STEPS = [
    {
      id: 'steps_strip',
      selectorDesktop: 'main > div:first-child',
      selectorMobile: 'main > div:first-child',
      badge: 'STEP 01–05 • เส้นทางสู่ประกาศนียบัตร',
      title: 'แถบความคืบหน้า 5 ขั้นตอน',
      desc: 'แสดงสถานะตั้งแต่ Pre-test, เรียนสะสม ≥ 80%, ฝึก AI Skill Lab 3 มิติ, Post-test ≥ 80% จนถึงรับประกาศนียบัตรและใบรับรอง CNEU ค่ะ',
      speech: 'หัวข้อแรกคือแถบความคืบหน้าห้าขั้นตอน แสดงสถานะตั้งแต่ทำแบบทดสอบก่อนเรียน เรียนสะสมให้ครบแปดสิบเปอร์เซ็นต์ ฝึกทักษะในเอไอสกิลแล็บ สอบหลังเรียน จนถึงรับใบประกาศนียบัตรค่ะ'
    },
    {
      id: 'tab_lessons',
      selectorDesktop: 'header .lg\\:flex button:nth-child(1)',
      selectorMobile: 'nav button:nth-child(1)',
      badge: 'MENU 01 • บทเรียน + AI',
      title: 'บทเรียน 20 บท & AI Study Companion',
      desc: 'รับชมวิดีโอทั้ง 20 บท ฟังสรุปเสียงทีละประโยค กดบันทึกว่าดูจบบทนี้ และถามข้อสงสัยทางคลินิกกับ AI ประจำบทได้เลยค่ะ',
      speech: 'เมนูบทเรียนและเอไอ ใช้รับชมวิดีโอทั้งยี่สิบบท ฟังสรุปเสียง กดบันทึกว่าดูจบบท และถามคำถามทางคลินิกกับผู้ช่วยเอไอได้ตลอดเวลาค่ะ'
    },
    {
      id: 'tab_cases',
      selectorDesktop: 'header .lg\\:flex button:nth-child(2)',
      selectorMobile: 'nav button:nth-child(2)',
      badge: 'MENU 02 • เคสคลินิก',
      title: 'มินิเคสจำลองคลินิกแบบโต้ตอบ',
      desc: 'ฝึกตัดสินใจดูแลผู้บริจาคภาวะสมองตาย สัญญาณชีพ ภาวะเบาจืด และ Cold Chain พร้อมดูค่าสัญญาณชีพที่เปลี่ยนตามการตัดสินใจค่ะ',
      speech: 'เมนูเคสคลินิก ใช้ฝึกตัดสินใจดูแลผู้ป่วยและดูค่าสัญญาณชีพที่เปลี่ยนแปลงตามแนวทางการดูแลจริงค่ะ'
    },
    {
      id: 'tab_flashcards',
      selectorDesktop: 'header .lg\\:flex button:nth-child(3)',
      selectorMobile: 'nav button:nth-child(3)',
      badge: 'MENU 03 • FLASHCARDS',
      title: 'การ์ดทบทวนความจำเฉพาะจุดอ่อน',
      desc: 'จัดลำดับการ์ดคำถาม-เฉลยตามหมวดที่ทำคะแนนได้น้อยใน Pre-test ช่วยทบทวนตัวเลขและเกณฑ์สำคัญก่อนสอบ Post-test ได้เร็วขึ้นค่ะ',
      speech: 'เมนูแฟลชการ์ด ใช้พลิกทบทวนเกณฑ์สำคัญและตัวเลขทางการแพทย์ โดยระบบจะจัดลำดับตามจุดที่คุณควรเน้นให้ด้วยค่ะ'
    },
    {
      id: 'tab_live',
      selectorDesktop: 'header .lg\\:flex button:nth-child(4)',
      selectorMobile: 'nav button:nth-child(4)',
      badge: 'MENU 04 • LIVE สด',
      title: 'ห้องถ่ายทอดสด & ยืนยันเข้าเรียน',
      desc: 'รับชมการบรรยายสดจากวิทยากร กดยืนยันเข้าเรียน Live และดาวน์โหลดเอกสารประกอบการบรรยายได้ในหน้าเดียวค่ะ',
      speech: 'เมนูไลฟ์สด ใช้รับชมการถ่ายทอดสด กดยืนยันการเข้าเรียน และเปิดเอกสารประกอบการบรรยายค่ะ'
    },
    {
      id: 'tab_profile',
      selectorDesktop: 'header .lg\\:flex button:nth-child(5)',
      selectorMobile: 'nav button:nth-child(5)',
      badge: 'MENU 05 • โปรไฟล์ & Warm-up',
      title: 'โปรไฟล์ รายงาน Portfolio และโหมดอุ่นเครื่อง 30 วิ',
      desc: 'รวมข้อมูลส่วนตัว คะแนนทั้งหมด การจัดการข้อมูล PDPA และโหมดอุ่นเครื่อง 30 วิ ส่วนปุ่ม “ออกจากระบบ” อยู่ถัดจากเมนูนี้ (จะเปลี่ยนเป็นสีแดงเมื่อชี้เมาส์หรือแตะ) ค่ะ',
      speech: 'และเมนูโปรไฟล์ อยู่ตรงนี้ค่ะ ใช้ดูข้อมูลส่วนตัว คะแนน จัดการข้อมูลพีดีพีเอ และโหมดอุ่นเครื่องสามสิบวินาที ส่วนปุ่มออกจากระบบจะอยู่ถัดจากเมนูนี้เลยค่ะ'
    }
  ];

  // ==========================================================================
  // 2. STYLES INJECTION (AMBIENT LIGHT RUNNER, SPOTLIGHT, CO-PILOT & BURST)
  // ==========================================================================
  function injectStyles() {
    if (document.getElementById('rjcloud-ai-interactive-styles')) return;
    const style = document.createElement('style');
    style.id = 'rjcloud-ai-interactive-styles';
    style.textContent = `
      @keyframes rjcAmbientRun {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes rjcSpinRing {
        to { transform: rotate(360deg); }
      }
      @keyframes rjcBurstPop {
        0% { transform: scale(0.4); opacity: 0; }
        45% { transform: scale(1.08); opacity: 1; }
        100% { transform: scale(1.25); opacity: 0; }
      }
      .rjc-ambient-bar {
        height: 4px;
        width: 100%;
        background: linear-gradient(90deg, #6ee7b7, #38bdf8, #818cf8, #f0abfc, #6ee7b7);
        background-size: 280% 100%;
        animation: rjcAmbientRun 1.8s linear infinite;
        box-shadow: 0 0 14px rgba(56, 189, 248, 0.75);
      }
      .rjc-spotlight-ring {
        position: fixed;
        z-index: 165;
        pointer-events: none;
        border-radius: 18px;
        border: 2.5px solid transparent;
        background:
          linear-gradient(var(--bg-page, #020612), var(--bg-page, #020612)) padding-box,
          linear-gradient(120deg, #6ee7b7, #38bdf8, #a78bfa, #f0abfc, #6ee7b7) border-box;
        background-size: 100% 100%, 260% 260%;
        animation: rjcAmbientRun 2s linear infinite;
        box-shadow:
          0 0 0 4px rgba(56, 189, 248, 0.24),
          0 0 32px rgba(22, 92, 196, 0.55);
        transition: top 0.32s cubic-bezier(0.22, 1, 0.36, 1),
                    left 0.32s cubic-bezier(0.22, 1, 0.36, 1),
                    width 0.32s cubic-bezier(0.22, 1, 0.36, 1),
                    height 0.32s cubic-bezier(0.22, 1, 0.36, 1);
      }
      .rjc-copilot-fab {
        position: fixed;
        z-index: 145;
        width: 58px;
        height: 58px;
        border-radius: 9999px;
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
        transition: opacity 0.45s ease, transform 0.3s ease, box-shadow 0.35s ease;
      }
      .rjc-copilot-fab.is-idle {
        opacity: 0.3;
        transform: scale(0.92);
      }
      .rjc-copilot-fab.is-awake,
      .rjc-copilot-fab:hover,
      .rjc-copilot-fab:focus-visible {
        opacity: 1;
        transform: scale(1.04);
      }
      .rjc-copilot-halo {
        position: absolute;
        inset: -4px;
        border-radius: 9999px;
        pointer-events: none;
        background: conic-gradient(from 0deg, #6ee7b7, #38bdf8, #818cf8, #f0abfc, #6ee7b7);
        animation: rjcSpinRing 3.2s linear infinite;
        -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3.5px), #000 calc(100% - 2.5px));
        mask: radial-gradient(farthest-side, transparent calc(100% - 3.5px), #000 calc(100% - 2.5px));
      }
      .rjc-copilot-halo.state-listening {
        animation-duration: 1.1s;
        filter: drop-shadow(0 0 12px rgba(244, 63, 94, 0.85));
      }
      .rjc-copilot-halo.state-thinking {
        animation-duration: 0.85s;
        filter: drop-shadow(0 0 14px rgba(34, 211, 238, 0.9));
      }
      .rjc-copilot-halo.state-speaking {
        animation-duration: 1.4s;
        filter: drop-shadow(0 0 14px rgba(52, 211, 153, 0.9));
      }
      .rjc-celebration-toast {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 180;
        pointer-events: none;
        animation: rjcBurstPop 1.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }
      .rjc-pulse-target {
        outline: 3px solid #34d399 !important;
        box-shadow: 0 0 0 7px rgba(52, 211, 153, 0.32) !important;
        border-radius: 16px !important;
      }
    `;
    document.head.appendChild(style);
  }

  // ==========================================================================
  // 3. TACTILE AUDIO & HAPTIC FEEDBACK ENGINE (WEB AUDIO API + VIBRATE)
  // ==========================================================================
  const TactileFX = {
    enabled: true,
    ctx: null,

    ensureCtx() {
      if (!this.enabled) return null;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      try {
        if (!this.ctx) this.ctx = new AudioCtx();
        if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
        return this.ctx;
      } catch (_) {
        return null;
      }
    },

    playTone(freqs = [523.25], duration = 0.14, type = 'sine', gainPeak = 0.04) {
      const ctx = this.ensureCtx();
      if (!ctx) return;
      try {
        const now = ctx.currentTime;
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = type;
          const start = now + idx * 0.065;
          osc.frequency.setValueAtTime(f, start);
          gain.gain.setValueAtTime(0.0001, start);
          gain.gain.exponentialRampToValueAtTime(gainPeak, start + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + duration + 0.03);
        });
      } catch (_) {}
    },

    tap() {
      this.playTone([587.33], 0.07, 'sine', 0.025);
      try { if (navigator.vibrate) navigator.vibrate(10); } catch (_) {}
    },

    wake() {
      this.playTone([523.25, 659.25], 0.11, 'sine', 0.035);
      try { if (navigator.vibrate) navigator.vibrate(14); } catch (_) {}
    },

    complete() {
      this.playTone([523.25, 659.25, 783.99, 1046.5], 0.18, 'triangle', 0.05);
      try { if (navigator.vibrate) navigator.vibrate([18, 45, 28]); } catch (_) {}
    }
  };

  // ==========================================================================
  // 4. INDEXEDDB VOICE CACHE & SENTENCE TTS PIPELINE
  // ==========================================================================
  const VoiceEngine = {
    audioEl: null,
    blobUrl: null,
    sessionCounter: 0,
    activeControllers: new Set(),
    idbPromise: null,

    openDb() {
      if (this.idbPromise) return this.idbPromise;
      this.idbPromise = new Promise((resolve) => {
        if (typeof indexedDB === 'undefined') return resolve(null);
        try {
          const req = indexedDB.open(AUDIO_CACHE_DB, 1);
          req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(AUDIO_CACHE_STORE)) {
              db.createObjectStore(AUDIO_CACHE_STORE);
            }
          };
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(null);
        } catch (_) {
          resolve(null);
        }
      });
      return this.idbPromise;
    },

    async getCache(key) {
      const db = await this.openDb();
      if (!db) return null;
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(AUDIO_CACHE_STORE, 'readonly');
          const req = tx.objectStore(AUDIO_CACHE_STORE).get(key);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(null);
        } catch (_) {
          resolve(null);
        }
      });
    },

    async setCache(key, blob) {
      if (!blob) return;
      const db = await this.openDb();
      if (!db) return;
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(AUDIO_CACHE_STORE, 'readwrite');
          tx.objectStore(AUDIO_CACHE_STORE).put(blob, key);
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        } catch (_) {
          resolve();
        }
      });
    },

    pcm16ToWavBlob(base64PCM, sampleRate = 24000) {
      if (window.RJCLOUD_CORE && typeof window.RJCLOUD_CORE.pcm16ToWavBlob === 'function') {
        return window.RJCLOUD_CORE.pcm16ToWavBlob(base64PCM, sampleRate);
      }
      const bin = window.atob(base64PCM);
      const rawBytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) rawBytes[i] = bin.charCodeAt(i);

      let offsetBytes = 0;
      if (rawBytes.length > 44 && rawBytes[0] === 0x52 && rawBytes[1] === 0x49 && rawBytes[2] === 0x46 && rawBytes[3] === 0x46) {
        offsetBytes = 44;
      }

      const sampleCount = Math.floor((rawBytes.length - offsetBytes) / 2);
      if (sampleCount <= 0) return new Blob([], { type: 'audio/wav' });

      const inView = new DataView(rawBytes.buffer, rawBytes.byteOffset + offsetBytes, sampleCount * 2);
      const samples = new Float32Array(sampleCount);
      for (let i = 0; i < sampleCount; i++) {
        samples[i] = inView.getInt16(i * 2, true) / 32768;
      }

      // ตัดเสียงซ่าความถี่สูงท้ายคลิป (Anti-Hiss DSP) + Smooth Cosine Fade-out
      const frameSize = Math.max(128, Math.round(sampleRate * 0.02));
      const numFrames = Math.floor(sampleCount / frameSize);
      const frameRms = new Float32Array(numFrames);
      const frameZcr = new Float32Array(numFrames);

      for (let f = 0; f < numFrames; f++) {
        const start = f * frameSize;
        let sumSq = 0;
        let zc = 0;
        let prev = samples[start];
        for (let j = 0; j < frameSize; j++) {
          const s = samples[start + j];
          sumSq += s * s;
          if ((s >= 0 && prev < 0) || (s < 0 && prev >= 0)) zc++;
          prev = s;
        }
        frameRms[f] = Math.sqrt(sumSq / frameSize);
        frameZcr[f] = zc / frameSize;
      }

      let endFrame = numFrames - 1;
      while (endFrame > 12) {
        if (frameRms[endFrame] < 0.016 || frameZcr[endFrame] > 0.22) {
          endFrame--;
        } else {
          break;
        }
      }

      const lookbackStart = Math.max(12, endFrame - Math.round(1.6 / 0.02));
      let silentRun = 0;
      for (let f = lookbackStart; f <= endFrame; f++) {
        if (frameRms[f] < 0.015) {
          silentRun++;
        } else {
          if (silentRun >= 5) {
            let tailZcrSum = 0;
            let tailCount = 0;
            for (let k = f; k <= endFrame; k++) {
              tailZcrSum += frameZcr[k];
              tailCount++;
            }
            if (tailCount > 0 && tailZcrSum / tailCount > 0.21) {
              endFrame = Math.max(12, f - silentRun - 1);
              break;
            }
          }
          silentRun = 0;
        }
      }

      const keptSamples = Math.min(
        sampleCount,
        Math.max(Math.min(sampleCount, Math.round(sampleRate * 0.25)), (endFrame + 1) * frameSize)
      );
      const padZeroSamples = Math.round(sampleRate * 0.045);
      const totalOutSamples = keptSamples + padZeroSamples;
      const outBytesLen = totalOutSamples * 2;
      const fadeInLen = Math.min(Math.round(sampleRate * 0.012), Math.floor(keptSamples * 0.1));
      const fadeOutLen = Math.min(Math.round(sampleRate * 0.075), Math.floor(keptSamples * 0.22));

      const buf = new ArrayBuffer(44 + outBytesLen);
      const view = new DataView(buf);
      const writeStr = (off, s) => {
        for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
      };
      writeStr(0, 'RIFF');
      view.setUint32(4, 36 + outBytesLen, true);
      writeStr(8, 'WAVE');
      writeStr(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeStr(36, 'data');
      view.setUint32(40, outBytesLen, true);

      for (let i = 0; i < keptSamples; i++) {
        let s = samples[i];
        if (i < fadeInLen) {
          s *= i / fadeInLen;
        } else if (i >= keptSamples - fadeOutLen) {
          const t = (i - (keptSamples - fadeOutLen)) / fadeOutLen;
          s *= 0.5 * (1 + Math.cos(Math.PI * t));
        }
        const clamped = Math.max(-1, Math.min(1, s));
        view.setInt16(44 + i * 2, Math.round(clamped * 32767), true);
      }
      return new Blob([buf], { type: 'audio/wav' });
    },

    stop() {
      this.sessionCounter += 1;
      this.activeControllers.forEach((c) => {
        try { c.abort(); } catch (_) {}
      });
      this.activeControllers.clear();
      if (this.audioEl) {
        try { this.audioEl.pause(); } catch (_) {}
        this.audioEl = null;
      }
      if (this.blobUrl) {
        try { URL.revokeObjectURL(this.blobUrl); } catch (_) {}
        this.blobUrl = null;
      }
      if ('speechSynthesis' in window) {
        try { window.speechSynthesis.cancel(); } catch (_) {}
      }
    },

    prepareNaturalText(raw) {
      if (window.RJCLOUD_CORE && typeof window.RJCLOUD_CORE.prepareNaturalThaiSpeech === 'function') {
        return window.RJCLOUD_CORE.prepareNaturalThaiSpeech(raw);
      }
      return String(raw || '')
        .replace(/[*#_]/g, ' ')
        .replace(/≥/g, 'ไม่น้อยกว่า ')
        .replace(/≤/g, 'ไม่เกิน ')
        .replace(/\bPDPA\b/gi, 'พีดีพีเอ')
        .replace(/\bCNEU\b/gi, 'ซีเอ็นอียู')
        .replace(/\s{2,}/g, ' ')
        .trim();
    },

    async fetchSentenceBlob(text, appsScriptUrl, cacheKey, timeoutMs = 22000) {
      const hit = await this.getCache(cacheKey);
      if (hit) return hit;
      if (!appsScriptUrl || !text) return null;

      const naturalText = this.prepareNaturalText(text);
      const ctrl = new AbortController();
      this.activeControllers.add(ctrl);
      const timer = setTimeout(() => ctrl.abort(), timeoutMs);
      try {
        const rawRes = await fetch(appsScriptUrl, {
          method: 'POST',
          redirect: 'follow',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'callGeminiTTS',
            text: naturalText,
            voiceName: 'Sulafat',
            languageCode: 'th-TH',
            style: 'พูดภาษาไทยด้วยน้ำเสียงผู้หญิงที่อบอุ่น นุ่มนวล ลื่นหู และเป็นธรรมชาติเหมือนผู้ช่วยอัจฉริยะประจำห้องเรียน ไม่แข็งเป็นหุ่นยนต์'
          }),
          signal: ctrl.signal
        });
        const txt = await rawRes.text();
        const res = JSON.parse(txt || '{}');
        if (res?.status === 'success' && res.inlineData?.data) {
          const rate = parseInt(res.inlineData.mimeType?.match(/rate=(\d+)/)?.[1] ?? '24000', 10);
          const blob = this.pcm16ToWavBlob(res.inlineData.data, rate);
          await this.setCache(cacheKey, blob);
          return blob;
        }
      } catch (_) {
      } finally {
        clearTimeout(timer);
        this.activeControllers.delete(ctrl);
      }
      return null;
    },

    playBlob(blob, sessionId) {
      return new Promise((resolve) => {
        if (this.sessionCounter !== sessionId || !blob) return resolve();
        if (this.blobUrl) {
          try { URL.revokeObjectURL(this.blobUrl); } catch (_) {}
          this.blobUrl = null;
        }
        const url = URL.createObjectURL(blob);
        this.blobUrl = url;
        const audio = new Audio(url);
        this.audioEl = audio;
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
        audio.play().catch(() => resolve());
      });
    },

    speakBrowser(text, sessionId) {
      return new Promise((resolve) => {
        if (this.sessionCounter !== sessionId || !('speechSynthesis' in window)) return resolve();
        try {
          window.speechSynthesis.cancel();
          const utter = new SpeechSynthesisUtterance(this.prepareNaturalText(text));
          utter.lang = 'th-TH';
          utter.rate = 0.96;
          utter.pitch = 1.02;
          if (window.RJCLOUD_CORE && typeof window.RJCLOUD_CORE.pickNaturalBrowserVoice === 'function') {
            const best = window.RJCLOUD_CORE.pickNaturalBrowserVoice('th');
            if (best) utter.voice = best;
          }
          utter.onend = () => resolve();
          utter.onerror = () => resolve();
          window.speechSynthesis.speak(utter);
        } catch (_) {
          resolve();
        }
      });
    },

    /**
     * เล่นข้อความทีละประโยคพร้อม Prefetch ประโยคถัดไปล่วงหน้าและแจ้งสถานะ Loading / Speaking
     */
    async speakPipeline(sentences, appsScriptUrl, cachePrefix, onStateChange) {
      const list = (Array.isArray(sentences) ? sentences : [sentences])
        .map((s) => String(s || '').replace(/[*#]/g, '').trim())
        .filter(Boolean);
      if (list.length === 0) {
        if (onStateChange) onStateChange({ phase: 'idle', index: 0, total: 0 });
        return;
      }

      this.stop();
      const sessionId = this.sessionCounter;

      const wrap = (promise) => {
        const box = { done: false, promise: null };
        box.promise = Promise.resolve(promise).then((v) => {
          box.done = true;
          return v;
        });
        return box;
      };

      let browserOnly = !appsScriptUrl;
      let nextBox = browserOnly
        ? null
        : wrap(this.fetchSentenceBlob(list[0], appsScriptUrl, `${cachePrefix}_0_${list[0]}`, 24000));

      for (let i = 0; i < list.length; i++) {
        if (this.sessionCounter !== sessionId) return;
        if (onStateChange) onStateChange({ phase: 'loading', index: i + 1, total: list.length });

        let blob = null;
        if (!browserOnly && nextBox) {
          blob = await nextBox.promise;
          if (this.sessionCounter !== sessionId) return;
          if (!blob && i === 0) {
            browserOnly = true;
          } else if (i + 1 < list.length) {
            nextBox = wrap(
              this.fetchSentenceBlob(list[i + 1], appsScriptUrl, `${cachePrefix}_${i + 1}_${list[i + 1]}`, 18000)
            );
          }
        }

        if (this.sessionCounter !== sessionId) return;
        if (onStateChange) onStateChange({ phase: 'speaking', index: i + 1, total: list.length });

        if (blob) {
          await this.playBlob(blob, sessionId);
        } else {
          await this.speakBrowser(list[i], sessionId);
        }
      }

      if (this.sessionCounter === sessionId && onStateChange) {
        onStateChange({ phase: 'idle', index: 0, total: 0 });
      }
    }
  };

  // ==========================================================================
  // 5. PER-LESSON SMART MEMORY & STATE MANAGER
  // ==========================================================================
  const LearningMemory = {
    activeUserId: '',

    setActiveUserId(uid) {
      this.activeUserId = uid ? String(uid) : '';
    },

    getUserId() {
      if (this.activeUserId) return this.activeUserId;
      try {
        const raw = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || 'null');
        return raw?.user?.id || raw?.user?.license || 'guest_learner';
      } catch (_) {
        return 'guest_learner';
      }
    },

    getKey() {
      return `${STORE_PREFIX}_${this.getUserId()}`;
    },

    load() {
      try {
        const saved = JSON.parse(localStorage.getItem(this.getKey()) || 'null');
        return {
          lastLessonId: Number(saved?.lastLessonId || 1),
          completedLessonIds: Array.isArray(saved?.completedLessonIds) ? saved.completedLessonIds.map(Number) : [],
          perLessonSeconds: saved?.perLessonSeconds && typeof saved.perLessonSeconds === 'object' ? saved.perLessonSeconds : {},
          tourSeen: Boolean(saved?.tourSeen),
          fabPos: saved?.fabPos && typeof saved.fabPos.right === 'number' && typeof saved.fabPos.bottom === 'number'
            ? saved.fabPos
            : null,
          soundEffectsOn: saved?.soundEffectsOn !== undefined ? Boolean(saved.soundEffectsOn) : true
        };
      } catch (_) {
        return {
          lastLessonId: 1,
          completedLessonIds: [],
          perLessonSeconds: {},
          tourSeen: false,
          fabPos: null,
          soundEffectsOn: true
        };
      }
    },

    save(patch) {
      const current = this.load();
      const next = { ...current, ...patch };
      try {
        localStorage.setItem(this.getKey(), JSON.stringify(next));
      } catch (_) {}
      return next;
    }
  };

  // ==========================================================================
  // 6. MAIN CONTROLLER & UI OVERLAYS
  // ==========================================================================
  const Controller = {
    bridge: null,
    mem: LearningMemory.load(),
    loadedForUserId: LearningMemory.getUserId(),
    lastBridgeStudySeconds: null,
    welcomeShownForUserId: '',
    tourStepIndex: -1,
    copilotOpen: false,
    copilotState: 'idle', // idle | listening | thinking | speaking
    copilotMessages: [],
    lastActivityAt: Date.now(),
    idleCheckInterval: null,
    resizeBound: false,
    fabDrag: { dragging: false, moved: false, startX: 0, startY: 0, origRight: 18, origBottom: 92 },
    els: {}
  };

  function formatDurationTH(sec) {
    const s = Math.max(0, Math.floor(Number(sec || 0)));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (h > 0 && m > 0) return `${h} ชั่วโมง ${m} นาที`;
    if (h > 0) return `${h} ชั่วโมง`;
    if (m > 0) return `${m} นาที`;
    return `${s} วินาที`;
  }

  function formatShortMinSec(sec) {
    const s = Math.max(0, Math.floor(Number(sec || 0)));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m} น. ${String(rem).padStart(2, '0')} วิ`;
  }

  function buildWelcomeSummary(ctx) {
    const user = ctx?.user || {};
    const name = String(user.name || 'ผู้เรียน').trim();
    const lessons = Array.isArray(ctx?.lessons) && ctx.lessons.length > 0 ? ctx.lessons : [];
    const totalLessons = lessons.length || 20;
    const completedIds = Controller.mem.completedLessonIds || [];
    const completedCount = completedIds.filter((id) => lessons.some((l) => Number(l.id) === Number(id))).length;

    const lastId = Number(Controller.mem.lastLessonId || ctx?.currentLessonId || 1);
    const lastLesson = lessons.find((l) => Number(l.id) === lastId) || lessons[0] || { id: 1, title: 'บทเรียนที่ 1' };
    const lastSec = Number(Controller.mem.perLessonSeconds?.[lastLesson.id] || 0);

    const studyPct = Number(ctx?.liveStudyPercent || user.progress || 0);
    const targetSec = Number(ctx?.targetSeconds || 28800);
    const curSec = Number(ctx?.studySeconds || user.studySeconds || 0);
    const remainSec = Math.max(0, targetSec - curSec);

    const isCompleted = completedCount >= totalLessons;
    const speech = isCompleted
      ? `สวัสดีค่ะคุณ${name} ยินดีต้อนรับกลับมาค่ะ คุณเรียนครบทั้ง ${totalLessons} บทแล้ว ตอนนี้สะสมเวลาได้ ${studyPct}% แล้วค่ะ สามารถเข้าฝึกเอไอสกิลแล็บหรือทบทวนบทที่ ${lastLesson.id} ต่อได้เลยนะคะ`
      : `สวัสดีค่ะคุณ${name} ยินดีต้อนรับกลับมาค่ะ คุณเรียนจบไปแล้ว ${completedCount} จาก ${totalLessons} บท ล่าสุดเรียนค้างไว้ที่บทที่ ${lastLesson.id} เรื่อง ${lastLesson.title} ตอนนี้สะสมเวลาได้ ${studyPct}% ${remainSec > 0 ? `เหลือเวลาเรียนสะสมอีกประมาณ ${formatDurationTH(remainSec)}` : 'ครบเกณฑ์เวลาแล้วค่ะ'} แนะนำให้เริ่มต่อจากบทที่ ${lastLesson.id} เลยนะคะ`;

    return {
      name,
      completedCount,
      totalLessons,
      lastLesson,
      lastSec,
      studyPct,
      remainSec,
      speech
    };
  }

  function showCelebrationBurst(label) {
    if (!TactileFX.enabled) return;
    const el = document.createElement('div');
    el.className = 'rjc-celebration-toast px-6 py-3.5 rounded-3xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-sm shadow-2xl border border-white/40 flex items-center gap-2';
    el.innerHTML = `<span>✦</span><span>${label || 'บันทึกสำเร็จ ยอดเยี่ยมมากค่ะ!'}</span>`;
    document.body.appendChild(el);
    setTimeout(() => { try { el.remove(); } catch (_) {} }, 1400);
  }

  // ==========================================================================
  // 7. 20-LESSON INTERACTIVE MAP & RESUME BAR INSIDE LESSONS TAB
  // ==========================================================================
  function ensureLessonInteractivePanel() {
    const bridge = Controller.bridge;
    if (!bridge || bridge.screen !== 'dashboard' || bridge.activeTab !== 'lessons') {
      if (Controller.els.lessonPanel) Controller.els.lessonPanel.style.display = 'none';
      return;
    }

    const lessons = Array.isArray(bridge.lessons) ? bridge.lessons : [];
    const col8 = document.querySelector('main .grid.grid-cols-1.lg\\:grid-cols-12 > div:first-child');
    if (!col8 || lessons.length === 0) return;

    let panel = Controller.els.lessonPanel;
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'rjc-lesson-memory-panel';
      panel.className = 'spatial-card rounded-[1.75rem] p-4 sm:p-5 space-y-3.5 border-emerald-400/30';
      panel.onclick = (ev) => {
        const btn = ev.target.closest('button');
        const activeBridge = Controller.bridge;
        if (!btn || !activeBridge) return;
        wakeActivity();

        const currentLessons = Array.isArray(activeBridge.lessons) ? activeBridge.lessons : [];
        const currentId = Number(activeBridge.currentLessonId || 1);
        const doneSet = new Set((Controller.mem.completedLessonIds || []).map(Number));
        const nextOpen = currentLessons.find((l) => !doneSet.has(Number(l.id))) || currentLessons[0];

        const lidAttr = btn.getAttribute('data-rjc-lesson');
        if (lidAttr) {
          const targetId = Number(lidAttr);
          TactileFX.tap();
          VoiceEngine.stop();
          Controller.mem = LearningMemory.save({ lastLessonId: targetId });
          activeBridge.selectLesson(targetId);
          return;
        }
        const act = btn.getAttribute('data-rjc-act');
        if (act === 'mark_done') {
          const nextSet = new Set(doneSet);
          if (nextSet.has(currentId)) {
            nextSet.delete(currentId);
            Controller.mem = LearningMemory.save({ completedLessonIds: Array.from(nextSet) });
            TactileFX.tap();
            activeBridge.toast(`ยกเลิกเครื่องหมายจบบทที่ ${currentId} แล้วค่ะ`, 'info');
          } else {
            nextSet.add(currentId);
            const nextAfterDone = currentLessons.find((l) => !nextSet.has(Number(l.id))) || currentLessons[0];
            Controller.mem = LearningMemory.save({
              completedLessonIds: Array.from(nextSet),
              lastLessonId: Number(nextAfterDone?.id || currentId)
            });
            TactileFX.complete();
            showCelebrationBurst(`เรียนจบบทที่ ${currentId} แล้วค่ะ! (${nextSet.size}/${currentLessons.length})`);
            activeBridge.toast(`บันทึกว่าเรียนจบบทที่ ${currentId} เรียบร้อยแล้วค่ะ`, 'success');
          }
          ensureLessonInteractivePanel();
        } else if (act === 'resume_best' && nextOpen) {
          TactileFX.tap();
          VoiceEngine.stop();
          Controller.mem = LearningMemory.save({ lastLessonId: Number(nextOpen.id) });
          activeBridge.selectLesson(Number(nextOpen.id));
          activeBridge.toast(`พาไปเรียนต่อที่บทที่ ${nextOpen.id} ค่ะ`, 'info');
        } else if (act === 'next_lesson' && currentLessons.length > 0) {
          const idx = currentLessons.findIndex((l) => Number(l.id) === currentId);
          const nextL = currentLessons[(idx + 1) % currentLessons.length];
          if (nextL) {
            TactileFX.tap();
            VoiceEngine.stop();
            Controller.mem = LearningMemory.save({ lastLessonId: Number(nextL.id) });
            activeBridge.selectLesson(Number(nextL.id));
          }
        } else if (act === 'welcome_modal') {
          openWelcomeModal();
        }
      };
      Controller.els.lessonPanel = panel;
    }
    panel.style.display = 'block';
    if (panel.parentElement !== col8) {
      col8.insertBefore(panel, col8.firstChild);
    }

    const curId = Number(bridge.currentLessonId || 1);
    const completedSet = new Set((Controller.mem.completedLessonIds || []).map(Number));
    const perMap = Controller.mem.perLessonSeconds || {};
    const curSec = Number(perMap[curId] || 0);
    const isCurDone = completedSet.has(curId);
    const nextUnfinished = lessons.find((l) => !completedSet.has(Number(l.id))) || lessons[0];

    // สร้างคีย์โครงสร้างเพื่อเรนเดอร์ HTML ใหม่เฉพาะเมื่อบท/สถานะเปลี่ยน (ไม่รีเฟรชทุก 1 วินาที)
    const partialMask = lessons.map((l) => (Number(perMap[Number(l.id)] || 0) > 0 ? '1' : '0')).join('');
    const completedKey = Array.from(completedSet).sort((a, b) => a - b).join(',');
    const renderKey = `${curId}|${lessons.length}|${completedKey}|${partialMask}|${nextUnfinished?.id || 1}`;

    if (panel.dataset.renderKey === renderKey) {
      const timeEl = panel.querySelector('#rjc-lesson-time-status');
      if (timeEl) {
        timeEl.textContent = isCurDone ? 'ดูจบแล้ว ✓' : `ดูค้างไว้ ${formatShortMinSec(curSec)}`;
      }
      return;
    }

    const prevStrip = panel.querySelector('#rjc-20-lesson-strip');
    const prevScrollLeft = prevStrip ? prevStrip.scrollLeft : 0;

    panel.dataset.renderKey = renderKey;
    panel.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span class="font-mono text-[10px] font-bold text-prism-adaptive uppercase">SMART RESUME • จดจำการเรียนต่อรายบท (${completedSet.size}/${lessons.length} บท)</span>
          <p class="text-xs text-secondary-adaptive mt-0.5">
            บทที่ ${curId}: <b id="rjc-lesson-time-status" class="text-primary-adaptive">${isCurDone ? 'ดูจบแล้ว ✓' : `ดูค้างไว้ ${formatShortMinSec(curSec)}`}</b>
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-1.5">
          <button type="button" data-rjc-act="resume_best" class="px-3 py-1.5 rounded-xl bg-prism-500/20 border border-prism-400/40 text-prism-adaptive font-bold text-xs">
            ไปจุดที่ควรเรียนต่อ (บทที่ ${nextUnfinished.id})
          </button>
          <button type="button" data-rjc-act="welcome_modal" class="px-3 py-1.5 rounded-xl spatial-soft text-accent-adaptive font-bold text-xs">
            AI สรุปเรียนต่อ
          </button>
          <button type="button" data-rjc-act="mark_done" class="px-3.5 py-1.5 rounded-xl ${isCurDone ? 'bg-emerald-500/20 border border-emerald-400/40 text-accent-adaptive' : 'bg-gradient-to-r from-aurora-400 to-prism-400 text-void-950 font-extrabold'} font-bold text-xs">
            ${isCurDone ? 'ดูจบบทนี้แล้ว ✓' : 'บันทึกว่าดูจบบทนี้'}
          </button>
        </div>
      </div>
      <div class="flex gap-1.5 overflow-x-auto custom-scrollbar pb-1" id="rjc-20-lesson-strip">
        ${lessons.map((l) => {
          const lid = Number(l.id);
          const done = completedSet.has(lid);
          const active = lid === curId;
          const partial = !done && Number(perMap[lid] || 0) > 0;
          const cls = active
            ? 'bg-gradient-to-r from-aurora-400 to-prism-400 text-void-950 font-extrabold border-transparent scale-105'
            : done
              ? 'bg-emerald-500/20 border-emerald-400/45 text-accent-adaptive'
              : partial
                ? 'bg-amber-500/20 border-amber-400/45 text-amber-300'
                : 'spatial-soft text-secondary-adaptive';
          return `<button type="button" data-rjc-lesson="${lid}" title="บทที่ ${lid}: ${String(l.title || '').replace(/"/g, '&quot;')}" class="shrink-0 w-9 h-9 rounded-xl border font-mono text-xs font-bold flex items-center justify-center transition-all ${cls}">${lid}</button>`;
        }).join('')}
      </div>
      <div class="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-adaptive">
        <div class="flex items-center gap-3">
          <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> ดูจบแล้ว</span>
          <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span> ดูค้างไว้</span>
          <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> กำลังเปิด</span>
        </div>
        <button type="button" data-rjc-act="next_lesson" class="font-bold text-prism-adaptive hover:underline">
          บทถัดไป →
        </button>
      </div>
    `;

    const nextStrip = panel.querySelector('#rjc-20-lesson-strip');
    if (nextStrip && prevScrollLeft > 0) {
      nextStrip.scrollLeft = prevScrollLeft;
    }
  }

  // ==========================================================================
  // 8. AI WELCOME CONCIERGE MODAL (VOICE GREETING & AUTO-RESUME SUMMARY)
  // ==========================================================================
  function closeWelcomeModal() {
    VoiceEngine.stop();
    Controller.welcomeSpeaking = false;
    if (Controller.els.welcomeModal) {
      Controller.els.welcomeModal.classList.add('hidden');
      Controller.els.welcomeModal.classList.remove('flex');
    }
  }

  function ensureWelcomeModal() {
    if (Controller.els.welcomeModal) return Controller.els.welcomeModal;

    const modal = document.createElement('div');
    modal.id = 'rjc-welcome-modal';
    modal.className = 'fixed inset-0 z-[160] bg-slate-950/75 backdrop-blur-md hidden items-end sm:items-center justify-center p-0 sm:p-4';
    modal.innerHTML = `
      <div class="spatial-card w-full sm:max-w-lg rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden border-emerald-400/40 shadow-2xl">
        <div class="rjc-ambient-bar" id="rjc-welcome-ambient-bar"></div>
        <div class="p-5 sm:p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] space-y-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <span class="font-mono text-[10px] font-bold text-accent-adaptive uppercase">RJCLOUD.ORGAN 2.0 • AI WELCOME CONCIERGE</span>
              <h3 id="rjc-welcome-heading" class="font-display font-extrabold text-lg text-primary-adaptive mt-0.5">ยินดีต้อนรับกลับมาค่ะ</h3>
            </div>
            <button type="button" id="rjc-welcome-close-btn" aria-label="ปิดหน้าต่างต้อนรับ" class="spatial-soft w-9 h-9 rounded-xl text-primary-adaptive font-bold shrink-0">✕</button>
          </div>

          <div class="grid grid-cols-3 gap-2 text-center">
            <div class="spatial-soft p-2.5 rounded-2xl">
              <span class="text-[10px] font-bold text-muted-adaptive block">จบบทเรียนแล้ว</span>
              <span id="rjc-welcome-stat-done" class="font-mono text-sm sm:text-base font-extrabold text-accent-adaptive">0/20</span>
            </div>
            <div class="spatial-soft p-2.5 rounded-2xl">
              <span class="text-[10px] font-bold text-muted-adaptive block">เวลาเรียนสะสม</span>
              <span id="rjc-welcome-stat-pct" class="font-mono text-sm sm:text-base font-extrabold text-prism-adaptive">0%</span>
            </div>
            <div class="spatial-soft p-2.5 rounded-2xl">
              <span class="text-[10px] font-bold text-muted-adaptive block">เรียนค้างไว้ที่</span>
              <span id="rjc-welcome-stat-last" class="font-mono text-sm sm:text-base font-extrabold text-amber-400">บทที่ 1</span>
            </div>
          </div>

          <div class="spatial-soft p-4 rounded-2xl space-y-2 border-prism-400/30">
            <p id="rjc-welcome-speech-text" class="text-xs sm:text-sm text-primary-adaptive leading-relaxed"></p>
            <div class="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-white/10">
              <span id="rjc-welcome-voice-status" class="text-[11px] font-bold text-prism-adaptive">พร้อมเล่นเสียง AI กล่าวต้อนรับ</span>
              <button type="button" id="rjc-welcome-voice-btn" class="px-3 py-1.5 rounded-xl bg-prism-500/20 border border-prism-400/40 text-prism-adaptive font-bold text-xs">
                🔊 ฟังเสียง AI
              </button>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-2 pt-1">
            <button type="button" id="rjc-welcome-resume-btn" class="rjc2-pill-btn touch-target flex-1 py-3 px-4 rounded-full font-display font-extrabold text-xs sm:text-sm">
              เรียนต่อจากจุดที่ค้างทันที →
            </button>
            <button type="button" id="rjc-welcome-tour-btn" class="touch-target spatial-soft py-3 px-4 rounded-full text-primary-adaptive font-display font-bold text-xs sm:text-sm">
              ทัวร์แนะนำเมนู
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    Controller.els.welcomeModal = modal;

    modal.addEventListener('click', (ev) => {
      if (ev.target === modal) closeWelcomeModal();
    });
    modal.querySelector('#rjc-welcome-close-btn').onclick = closeWelcomeModal;
    modal.querySelector('#rjc-welcome-tour-btn').onclick = () => {
      closeWelcomeModal();
      startGuidedTour();
    };

    return modal;
  }

  function playWelcomeGreetingVoice(info, modal) {
    const statusEl = modal.querySelector('#rjc-welcome-voice-status');
    const voiceBtn = modal.querySelector('#rjc-welcome-voice-btn');

    if (Controller.welcomeSpeaking) {
      VoiceEngine.stop();
      Controller.welcomeSpeaking = false;
      if (statusEl) statusEl.textContent = 'หยุดเสียงชั่วคราว (กดปุ่มเพื่อฟังอีกครั้ง)';
      if (voiceBtn) voiceBtn.textContent = '🔊 ฟังเสียง AI';
      return;
    }

    Controller.welcomeSpeaking = true;
    if (voiceBtn) voiceBtn.textContent = '⏹ หยุดเสียง';

    const cachePrefix = `welcome_${LearningMemory.getUserId()}_l${info.lastLesson.id}_c${info.completedCount}_p${info.studyPct}`;
    VoiceEngine.speakPipeline(
      [info.speech],
      Controller.bridge?.appsScriptUrl || '',
      cachePrefix,
      (st) => {
        if (!Controller.els.welcomeModal) return;
        if (st.phase === 'loading') {
          if (statusEl) statusEl.textContent = 'กำลังเตรียมเสียง AI กล่าวต้อนรับ...';
        } else if (st.phase === 'speaking') {
          if (statusEl) statusEl.textContent = 'AI กำลังกล่าวต้อนรับและสรุปสถานะการเรียน...';
        } else {
          Controller.welcomeSpeaking = false;
          if (statusEl) statusEl.textContent = 'สรุปสถานะเรียบร้อยแล้วค่ะ (กดฟังซ้ำได้ตลอดเวลา)';
          if (voiceBtn) voiceBtn.textContent = '🔊 ฟังอีกครั้ง';
        }
      }
    );
  }

  function openWelcomeModal(autoSpeak = true) {
    wakeActivity();
    TactileFX.wake();

    const modal = ensureWelcomeModal();
    const info = buildWelcomeSummary(Controller.bridge);

    modal.querySelector('#rjc-welcome-heading').textContent = `สวัสดีค่ะคุณ${info.name}`;
    modal.querySelector('#rjc-welcome-stat-done').textContent = `${info.completedCount}/${info.totalLessons}`;
    modal.querySelector('#rjc-welcome-stat-pct').textContent = `${info.studyPct}%`;
    modal.querySelector('#rjc-welcome-stat-last').textContent = `บทที่ ${info.lastLesson.id}`;
    modal.querySelector('#rjc-welcome-speech-text').textContent = info.speech;

    const resumeBtn = modal.querySelector('#rjc-welcome-resume-btn');
    resumeBtn.textContent = `เรียนต่อบทที่ ${info.lastLesson.id} ทันที →`;
    resumeBtn.onclick = () => {
      TactileFX.tap();
      closeWelcomeModal();
      const bridge = Controller.bridge;
      if (bridge) {
        bridge.setActiveTab('lessons');
        bridge.selectLesson(Number(info.lastLesson.id));
        bridge.toast(`พาไปเรียนต่อที่บทที่ ${info.lastLesson.id} แล้วค่ะ`, 'info');
      }
    };

    const voiceBtn = modal.querySelector('#rjc-welcome-voice-btn');
    voiceBtn.onclick = () => {
      wakeActivity();
      playWelcomeGreetingVoice(info, modal);
    };

    Controller.welcomeSpeaking = false;
    modal.querySelector('#rjc-welcome-voice-status').textContent = 'พร้อมเล่นเสียง AI กล่าวต้อนรับ';
    voiceBtn.textContent = '🔊 ฟังเสียง AI';

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    if (autoSpeak) {
      playWelcomeGreetingVoice(info, modal);
    }
  }

  // ==========================================================================
  // 9. AMBIENT SPOTLIGHT GUIDED TOUR (FIRST TIME ONLY + REPLAY ANYTIME)
  // ==========================================================================
  function ensureTourOverlay() {
    if (Controller.els.tourOverlay) return Controller.els.tourOverlay;
    const wrap = document.createElement('div');
    wrap.id = 'rjc-spotlight-tour';
    wrap.className = 'fixed inset-0 z-[165] hidden pointer-events-none';
    wrap.innerHTML = `
      <div id="rjc-tour-backdrop" class="fixed inset-0 bg-slate-950/65 backdrop-blur-[2px] pointer-events-auto"></div>
      <div id="rjc-tour-ring" class="rjc-spotlight-ring hidden"></div>
      <div id="rjc-tour-card" class="fixed bottom-24 lg:bottom-7 left-1/2 -translate-x-1/2 w-[92vw] max-w-lg spatial-card rounded-[1.75rem] overflow-hidden border-prism-400/45 shadow-2xl pointer-events-auto z-[170]">
        <div class="rjc-ambient-bar" id="rjc-tour-ambient-bar"></div>
        <div class="p-4 sm:p-5 space-y-3">
          <div class="flex items-center justify-between gap-2">
            <span id="rjc-tour-badge" class="font-mono text-[10px] font-bold text-prism-adaptive uppercase"></span>
            <span id="rjc-tour-counter" class="font-mono text-xs font-bold text-accent-adaptive"></span>
          </div>
          <h3 id="rjc-tour-title" class="font-display font-extrabold text-base text-primary-adaptive"></h3>
          <p id="rjc-tour-desc" class="text-xs sm:text-sm text-secondary-adaptive leading-relaxed"></p>
          <p id="rjc-tour-voice" class="text-[11px] font-bold text-accent-adaptive min-h-[16px]"></p>
          <div class="flex items-center justify-between gap-2 pt-1">
            <button type="button" id="rjc-tour-skip" class="spatial-soft px-3.5 py-2 rounded-xl text-xs font-bold text-secondary-adaptive">
              ปิดคำแนะนำ
            </button>
            <div class="flex items-center gap-2">
              <button type="button" id="rjc-tour-prev" class="spatial-soft px-3.5 py-2 rounded-xl text-xs font-bold text-primary-adaptive">
                ← ก่อนหน้า
              </button>
              <button type="button" id="rjc-tour-next" class="px-4 py-2 rounded-xl bg-gradient-to-r from-aurora-400 to-prism-400 text-void-950 font-display font-extrabold text-xs">
                ถัดไป →
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(wrap);
    Controller.els.tourOverlay = wrap;

    wrap.querySelector('#rjc-tour-skip').onclick = () => stopGuidedTour(true);
    wrap.querySelector('#rjc-tour-backdrop').onclick = () => stopGuidedTour(true);
    wrap.querySelector('#rjc-tour-prev').onclick = () => renderTourStep(Controller.tourStepIndex - 1);
    wrap.querySelector('#rjc-tour-next').onclick = () => {
      if (Controller.tourStepIndex >= MENU_TOUR_STEPS.length - 1) {
        stopGuidedTour(true);
      } else {
        renderTourStep(Controller.tourStepIndex + 1);
      }
    };

    return wrap;
  }

  function positionTourRing(step) {
    const ring = Controller.els.tourOverlay?.querySelector('#rjc-tour-ring');
    if (!ring) return;
    const isMobile = window.innerWidth < 1024;
    const sel = isMobile ? step.selectorMobile : step.selectorDesktop;
    const target = sel ? document.querySelector(sel) : null;
    if (!target) {
      ring.classList.add('hidden');
      return;
    }
    const rect = target.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      ring.classList.add('hidden');
      return;
    }
    const pad = 5;
    ring.style.top = `${Math.max(6, rect.top - pad)}px`;
    ring.style.left = `${Math.max(6, rect.left - pad)}px`;
    ring.style.width = `${rect.width + pad * 2}px`;
    ring.style.height = `${rect.height + pad * 2}px`;
    ring.classList.remove('hidden');
  }

  function renderTourStep(idx) {
    const overlay = ensureTourOverlay();
    const safeIdx = Math.max(0, Math.min(MENU_TOUR_STEPS.length - 1, idx));
    Controller.tourStepIndex = safeIdx;
    const step = MENU_TOUR_STEPS[safeIdx];

    overlay.classList.remove('hidden');
    overlay.querySelector('#rjc-tour-badge').textContent = step.badge;
    overlay.querySelector('#rjc-tour-counter').textContent = `${safeIdx + 1} / ${MENU_TOUR_STEPS.length}`;
    overlay.querySelector('#rjc-tour-title').textContent = step.title;
    overlay.querySelector('#rjc-tour-desc').textContent = step.desc;
    overlay.querySelector('#rjc-tour-next').textContent = safeIdx === MENU_TOUR_STEPS.length - 1 ? 'เสร็จสิ้น ✓' : 'ถัดไป →';

    positionTourRing(step);
    TactileFX.tap();

    const voiceEl = overlay.querySelector('#rjc-tour-voice');
    VoiceEngine.speakPipeline(
      [step.speech],
      Controller.bridge?.appsScriptUrl || '',
      `tour_${step.id}`,
      (st) => {
        if (!Controller.els.tourOverlay || Controller.tourStepIndex !== safeIdx) return;
        if (st.phase === 'loading') voiceEl.textContent = 'กำลังเตรียมเสียง AI อธิบายหัวข้อ...';
        else if (st.phase === 'speaking') voiceEl.textContent = 'AI กำลังอธิบายหน้าที่ของหัวข้อนี้...';
        else voiceEl.textContent = '';
      }
    );
  }

  function startGuidedTour() {
    if (Controller.bridge?.screen !== 'dashboard') {
      Controller.bridge?.setActiveTab('lessons');
      setTimeout(() => renderTourStep(0), 220);
      return;
    }
    renderTourStep(0);
  }

  function stopGuidedTour(markSeen = true) {
    VoiceEngine.stop();
    Controller.tourStepIndex = -1;
    if (markSeen) {
      Controller.mem = LearningMemory.save({ tourSeen: true });
    }
    if (Controller.els.tourOverlay) {
      Controller.els.tourOverlay.classList.add('hidden');
    }
  }

  // ==========================================================================
  // 10. FLOATING INTERACTIVE AI CO-PILOT (DRAG ANYWHERE, AUTO-DIM, AMBIENT RING)
  // ==========================================================================
  function wakeActivity() {
    Controller.lastActivityAt = Date.now();
    const fab = Controller.els.fab;
    if (fab) {
      fab.classList.remove('is-idle');
      fab.classList.add('is-awake');
    }
  }

  function applyCopilotVisualState(nextState) {
    Controller.copilotState = nextState;
    const halo = Controller.els.copilotModal?.querySelector('#rjc-copilot-modal-halo');
    const fabHalo = Controller.els.fab?.querySelector('.rjc-copilot-halo');
    const statusText = Controller.els.copilotModal?.querySelector('#rjc-copilot-state-label');

    [halo, fabHalo].forEach((h) => {
      if (!h) return;
      h.classList.remove('state-listening', 'state-thinking', 'state-speaking');
      if (nextState !== 'idle') h.classList.add(`state-${nextState}`);
    });

    if (statusText) {
      const map = {
        idle: 'แสงแอมเบี้ยนพร้อมรับคำสั่ง (พูด พิมพ์ หรือกดปุ่มลัดได้ทันที)',
        listening: 'กำลังฟังเสียงไมโครโฟน...',
        thinking: 'AI กำลังประมวลผลคำตอบ...',
        speaking: 'AI กำลังพูดตอบ...'
      };
      statusText.textContent = map[nextState] || map.idle;
    }
  }

  function pulseElementBySelector(selector) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.classList.add('rjc-pulse-target');
    setTimeout(() => { try { el.classList.remove('rjc-pulse-target'); } catch (_) {} }, 2600);
  }

  function runCoPilotCommand(rawText) {
    const q = String(rawText || '').trim();
    if (!q) return;
    wakeActivity();

    Controller.copilotMessages.push({ role: 'user', text: q });
    renderCopilotMessages();
    applyCopilotVisualState('thinking');

    const lower = q.toLowerCase();
    const bridge = Controller.bridge || {};
    const info = buildWelcomeSummary(bridge);

    setTimeout(() => {
      let reply = '';
      let speakOut = '';

      if (lower.includes('ออก') || lower.includes('logout')) {
        const isMobile = window.innerWidth < 1024;
        setTimeout(() => pulseElementBySelector(isMobile ? '#btn-learner-logout-mobile' : '#btn-learner-logout'), 180);
        reply = 'ปุ่ม **“ออกจากระบบ”** อยู่ที่แถบเมนูหน้าห้องเรียน ถัดจากเมนู **โปรไฟล์ & Warm-up** ค่ะ (จะเปลี่ยนเป็นสีแดงเมื่อชี้เมาส์หรือแตะ) ดิฉันไฮไลต์ตำแหน่งปุ่มให้แล้วนะคะ';
        speakOut = 'ปุ่มออกจากระบบอยู่ที่แถบเมนูหน้าห้องเรียน ถัดจากเมนูโปรไฟล์ค่ะ ดิฉันไฮไลต์ตำแหน่งปุ่มให้แล้วนะคะ';
      } else if (lower.includes('โปรไฟล์')) {
        bridge.setActiveTab('profile');
        reply = 'เปิดหน้า **โปรไฟล์ & Warm-up** ให้เรียบร้อยแล้วค่ะ';
        speakOut = 'เปิดหน้าโปรไฟล์ให้เรียบร้อยแล้วค่ะ';
      } else if (lower.includes('เรียนต่อ') || lower.includes('ค้าง') || lower.includes('ต่อจาก')) {
        bridge.setActiveTab('lessons');
        bridge.selectLesson(Number(info.lastLesson.id));
        reply = `พาไปเรียนต่อที่ **บทที่ ${info.lastLesson.id}: ${info.lastLesson.title}** (เรียนจบแล้ว ${info.completedCount}/${info.totalLessons} บท) ให้เรียบร้อยแล้วค่ะ`;
        speakOut = `พาไปเรียนต่อที่บทที่ ${info.lastLesson.id} เรื่อง ${info.lastLesson.title} ให้แล้วค่ะ`;
      } else if (lower.includes('เวลา') || lower.includes('เหลือ') || lower.includes('ชั่วโมง') || lower.includes('กี่นาที')) {
        reply = info.remainSec > 0
          ? `ตอนนี้สะสมเวลาได้ **${info.studyPct}%** เหลือเวลาเรียนสะสมอีกประมาณ **${formatDurationTH(info.remainSec)}** เพื่อครบตามเป้าหมายค่ะ`
          : `ตอนนี้สะสมเวลาได้ **${info.studyPct}%** ครบตามเกณฑ์เวลาเรียบร้อยแล้วค่ะ`;
        speakOut = info.remainSec > 0
          ? `ตอนนี้สะสมเวลาได้ ${info.studyPct} เปอร์เซ็นต์ เหลือเวลาเรียนสะสมอีกประมาณ ${formatDurationTH(info.remainSec)} ค่ะ`
          : `ตอนนี้สะสมเวลาได้ ${info.studyPct} เปอร์เซ็นต์ ครบตามเกณฑ์เวลาเรียบร้อยแล้วค่ะ`;
      } else if (lower.includes('สว่าง') || lower.includes('มืด') || lower.includes('ธีม') || lower.includes('theme')) {
        bridge.toggleTheme();
        reply = 'สลับโหมดการแสดงผลมืด/สว่างให้เรียบร้อยแล้วค่ะ';
        speakOut = 'สลับโหมดการแสดงผลให้เรียบร้อยแล้วค่ะ';
      } else if (lower.includes('เคส') || lower.includes('case')) {
        bridge.setActiveTab('clinical_cases');
        reply = 'เปิดหน้า **มินิเคสจำลองคลินิกแบบโต้ตอบ** ให้เรียบร้อยแล้วค่ะ';
        speakOut = 'เปิดหน้าเคสคลินิกให้แล้วค่ะ';
      } else if (lower.includes('แนะนำ') || lower.includes('ทัวร์') || lower.includes('tour')) {
        closeCopilotDrawer();
        startGuidedTour();
        return;
      } else {
        reply = `คุณ${info.name} สามารถสั่งงานหรือถามเรื่องบทเรียนได้เลยค่ะ เช่น *"ปุ่มออกจากระบบอยู่ไหน"*, *"พาไปเรียนต่อจุดที่ค้าง"*, *"เหลือเวลาอีกกี่นาที"* หรือ *"สลับโหมดสว่าง"* ค่ะ`;
        speakOut = reply;
      }

      Controller.copilotMessages.push({ role: 'ai', text: reply });
      renderCopilotMessages();
      applyCopilotVisualState('speaking');
      TactileFX.complete();

      VoiceEngine.speakPipeline(
        [speakOut],
        bridge.appsScriptUrl || '',
        `copilot_${Date.now()}_${speakOut.slice(0, 18)}`,
        (st) => {
          if (st.phase === 'idle') applyCopilotVisualState('idle');
          else applyCopilotVisualState(st.phase);
        }
      );
    }, 280);
  }

  function renderCopilotMessages() {
    const listEl = Controller.els.copilotModal?.querySelector('#rjc-copilot-msg-list');
    if (!listEl) return;
    if (Controller.copilotMessages.length === 0) {
      listEl.innerHTML = `
        <div class="spatial-soft p-3.5 rounded-2xl text-xs text-secondary-adaptive leading-relaxed">
          สวัสดีค่ะ! ลากปุ่มผู้ช่วย AI ไปวางมุมไหนก็ได้ที่ไม่บังบทเรียน (เมื่อไม่ใช้งานจะจางลงอัตโนมัติ) ลองกดปุ่มลัดด้านล่างหรือพูด/พิมพ์สั่งงานได้เลยค่ะ
        </div>
      `;
      return;
    }
    listEl.innerHTML = Controller.copilotMessages.map((m) => `
      <div class="flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}">
        <div class="max-w-[88%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${m.role === 'user' ? 'bg-gradient-to-r from-aurora-400 to-prism-400 text-void-950 font-bold' : 'spatial-soft text-primary-adaptive'}">${m.text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')}</div>
      </div>
    `).join('');
    listEl.scrollTop = listEl.scrollHeight;
  }

  function openCopilotDrawer() {
    wakeActivity();
    TactileFX.wake();
    Controller.copilotOpen = true;
    const modal = Controller.els.copilotModal;
    if (!modal) return;
    renderCopilotMessages();
    applyCopilotVisualState('idle');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  function closeCopilotDrawer() {
    Controller.copilotOpen = false;
    VoiceEngine.stop();
    applyCopilotVisualState('idle');
    if (Controller.els.copilotModal) {
      Controller.els.copilotModal.classList.add('hidden');
      Controller.els.copilotModal.classList.remove('flex');
    }
  }

  function ensureCopilotFabAndModal() {
    if (Controller.els.fab) return;

    const fab = document.createElement('button');
    fab.type = 'button';
    fab.id = 'rjc-copilot-fab';
    fab.setAttribute('aria-label', 'ผู้ช่วย AI สด (ลากย้ายได้)');
    fab.className = 'rjc-copilot-fab is-awake flex items-center justify-center bg-void-950 text-white shadow-2xl border border-white/20';

    const savedPos = Controller.mem.fabPos;
    const initRight = savedPos ? savedPos.right : 16;
    const initBottom = savedPos ? savedPos.bottom : (window.innerWidth < 1024 ? 92 : 24);
    fab.style.right = `${initRight}px`;
    fab.style.bottom = `${initBottom}px`;

    fab.innerHTML = `
      <span class="rjc-copilot-halo" id="rjc-fab-halo"></span>
      <span class="relative z-10 w-12 h-12 rounded-full bg-gradient-to-br from-aurora-400 to-prism-400 text-void-950 flex items-center justify-center font-display font-extrabold text-xs shadow-inner">
        AI
      </span>
    `;
    document.body.appendChild(fab);
    Controller.els.fab = fab;

    const onPointerDown = (e) => {
      wakeActivity();
      const pt = e.touches ? e.touches[0] : e;
      const curRight = parseFloat(fab.style.right) || 16;
      const curBottom = parseFloat(fab.style.bottom) || 24;
      Controller.fabDrag = {
        dragging: true,
        moved: false,
        startX: pt.clientX,
        startY: pt.clientY,
        origRight: curRight,
        origBottom: curBottom
      };
    };

    const onPointerMove = (e) => {
      if (!Controller.fabDrag.dragging) return;
      wakeActivity();
      const pt = e.touches ? e.touches[0] : e;
      const dx = pt.clientX - Controller.fabDrag.startX;
      const dy = pt.clientY - Controller.fabDrag.startY;
      if (Math.hypot(dx, dy) > 6) {
        Controller.fabDrag.moved = true;
      }
      if (!Controller.fabDrag.moved) return;

      const maxRight = Math.max(10, window.innerWidth - 68);
      const maxBottom = Math.max(12, window.innerHeight - 72);
      const nextRight = Math.max(10, Math.min(maxRight, Controller.fabDrag.origRight - dx));
      const nextBottom = Math.max(12, Math.min(maxBottom, Controller.fabDrag.origBottom - dy));
      fab.style.right = `${nextRight}px`;
      fab.style.bottom = `${nextBottom}px`;
    };

    const onPointerUp = () => {
      if (!Controller.fabDrag.dragging) return;
      const wasMoved = Controller.fabDrag.moved;
      Controller.fabDrag.dragging = false;
      if (wasMoved) {
        const finalRight = parseFloat(fab.style.right) || 16;
        const finalBottom = parseFloat(fab.style.bottom) || 24;
        Controller.mem = LearningMemory.save({ fabPos: { right: finalRight, bottom: finalBottom } });
        TactileFX.tap();
      } else {
        openCopilotDrawer();
      }
    };

    fab.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    fab.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Modal Drawer ของผู้ช่วย AI Co-Pilot พร้อมวงแสงแอมเบี้ยนบอกสถานะ
    const modal = document.createElement('div');
    modal.id = 'rjc-copilot-modal';
    modal.className = 'fixed inset-0 z-[155] bg-slate-950/65 backdrop-blur-sm hidden items-end sm:items-center justify-center p-0 sm:p-4';
    modal.innerHTML = `
      <div class="spatial-card w-full sm:max-w-lg rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden border-prism-400/40 shadow-2xl flex flex-col max-h-[82dvh]">
        <div class="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-2">
          <div class="flex items-center gap-3 min-w-0">
            <div class="relative w-11 h-11 rounded-full bg-void-950 flex items-center justify-center shrink-0">
              <span class="rjc-copilot-halo" id="rjc-copilot-modal-halo"></span>
              <span class="relative z-10 font-display font-extrabold text-xs text-accent-adaptive">AI</span>
            </div>
            <div class="min-w-0">
              <h3 class="font-display font-extrabold text-sm sm:text-base text-primary-adaptive truncate">ผู้ช่วย AI สด • rjcloud.organ 2.0</h3>
              <p id="rjc-copilot-state-label" class="text-[11px] font-bold text-prism-adaptive truncate">แสงแอมเบี้ยนพร้อมรับคำสั่ง</p>
            </div>
          </div>
          <button type="button" id="rjc-copilot-close" class="spatial-soft w-9 h-9 rounded-xl text-primary-adaptive font-bold">✕</button>
        </div>

        <div id="rjc-copilot-msg-list" class="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2.5"></div>

        <div class="p-3 sm:p-4 border-t border-white/10 space-y-2.5">
          <div class="flex gap-1.5 overflow-x-auto custom-scrollbar pb-1">
            <button type="button" data-rjc-quick="ปุ่มออกจากระบบอยู่ไหน" class="shrink-0 spatial-soft px-3 py-1.5 rounded-full text-[11px] font-bold text-primary-adaptive">ปุ่มออกจากระบบอยู่ไหน?</button>
            <button type="button" data-rjc-quick="พาไปเรียนต่อจุดที่ค้าง" class="shrink-0 spatial-soft px-3 py-1.5 rounded-full text-[11px] font-bold text-accent-adaptive">เรียนต่อจุดที่ค้าง</button>
            <button type="button" data-rjc-quick="เหลือเวลาอีกกี่นาที" class="shrink-0 spatial-soft px-3 py-1.5 rounded-full text-[11px] font-bold text-prism-adaptive">เหลือเวลาอีกกี่นาที?</button>
            <button type="button" data-rjc-quick="เปิดทัวร์แนะนำเมนู" class="shrink-0 spatial-soft px-3 py-1.5 rounded-full text-[11px] font-bold text-amber-400">ทัวร์แนะนำเมนู</button>
          </div>
          <form id="rjc-copilot-form" class="flex items-center gap-2">
            <button type="button" id="rjc-copilot-mic" title="พูดด้วยเสียง" class="touch-target spatial-soft w-11 h-11 rounded-2xl text-accent-adaptive font-bold text-xs shrink-0">🎤</button>
            <input id="rjc-copilot-input" type="text" placeholder="พิมพ์หรือพูดสั่งงาน เช่น พาไปเรียนต่อจุดที่ค้าง..." class="touch-target spatial-input flex-1 px-3.5 py-2.5 rounded-2xl text-sm" />
            <button type="submit" class="touch-target px-4 rounded-2xl bg-gradient-to-r from-aurora-400 to-prism-400 text-void-950 font-display font-extrabold text-xs shrink-0">ส่ง</button>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    Controller.els.copilotModal = modal;

    modal.querySelector('#rjc-copilot-close').onclick = closeCopilotDrawer;
    modal.querySelectorAll('[data-rjc-quick]').forEach((btn) => {
      btn.onclick = () => runCoPilotCommand(btn.getAttribute('data-rjc-quick'));
    });

    modal.querySelector('#rjc-copilot-form').onsubmit = (e) => {
      e.preventDefault();
      const inp = modal.querySelector('#rjc-copilot-input');
      const val = inp.value.trim();
      if (!val) return;
      inp.value = '';
      runCoPilotCommand(val);
    };

    modal.querySelector('#rjc-copilot-mic').onclick = () => {
      wakeActivity();
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) {
        Controller.bridge?.toast('เบราว์เซอร์นี้ไม่รองรับการรับเสียง พิมพ์คำสั่งแทนได้เลยค่ะ', 'info');
        return;
      }
      applyCopilotVisualState('listening');
      try {
        const rec = new SR();
        rec.lang = 'th-TH';
        rec.onresult = (ev) => {
          const spoken = ev.results?.[0]?.[0]?.transcript || '';
          if (spoken) runCoPilotCommand(spoken);
        };
        rec.onerror = () => applyCopilotVisualState('idle');
        rec.onend = () => {
          if (Controller.copilotState === 'listening') applyCopilotVisualState('idle');
        };
        rec.start();
      } catch (_) {
        applyCopilotVisualState('idle');
      }
    };

    // จับเวลาเมื่อไม่ได้ใช้งานเกิน 4 วินาที ให้ปุ่มลอยจางลงเพื่อไม่บังบทเรียน
    Controller.idleCheckInterval = setInterval(() => {
      if (!Controller.els.fab) return;
      if (Controller.copilotOpen || Controller.copilotState !== 'idle') {
        Controller.els.fab.classList.remove('is-idle');
        Controller.els.fab.classList.add('is-awake');
        return;
      }
      if (Date.now() - Controller.lastActivityAt > IDLE_DIM_MS) {
        Controller.els.fab.classList.remove('is-awake');
        Controller.els.fab.classList.add('is-idle');
      }
    }, 600);
  }

  // ==========================================================================
  // 11. HEADER SHORTCUTS (REPLAY TOUR + AI WELCOME + SOUND FX TOGGLE)
  // ==========================================================================
  function ensureDashboardHeaderActions() {
    const bridge = Controller.bridge;
    if (!bridge || bridge.screen !== 'dashboard') {
      if (Controller.els.headerBar) Controller.els.headerBar.style.display = 'none';
      return;
    }
    const rightGroup = document.querySelector('header .max-w-7xl > div:last-child');
    if (!rightGroup) return;

    let bar = Controller.els.headerBar;
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'rjc-header-interactive-actions';
      bar.className = 'flex items-center gap-1';
      bar.onclick = (ev) => {
        const btn = ev.target.closest('button');
        const activeBridge = Controller.bridge;
        if (!btn || !activeBridge) return;
        wakeActivity();
        const act = btn.getAttribute('data-rjc-hdr');
        if (act === 'tour') {
          startGuidedTour();
        } else if (act === 'welcome') {
          openWelcomeModal(true);
        } else if (act === 'fx') {
          TactileFX.enabled = !TactileFX.enabled;
          Controller.mem = LearningMemory.save({ soundEffectsOn: TactileFX.enabled });
          ensureDashboardHeaderActions();
          activeBridge.toast(TactileFX.enabled ? 'เปิดเสียงเอฟเฟกต์สัมผัสแล้วค่ะ' : 'ปิดเสียงเอฟเฟกต์สัมผัสแล้วค่ะ', 'info');
        }
      };
      Controller.els.headerBar = bar;
    }
    bar.style.display = 'flex';
    if (bar.parentElement !== rightGroup) {
      rightGroup.insertBefore(bar, rightGroup.firstChild);
    }

    const fxKey = String(TactileFX.enabled);
    if (bar.dataset.fxState === fxKey) return;
    bar.dataset.fxState = fxKey;

    bar.innerHTML = `
      <button type="button" data-rjc-hdr="tour" title="แนะนำการใช้งานเมนู (เปิดดูซ้ำได้ทุกเมื่อ)" class="spatial-soft px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-prism-adaptive">แนะนำเมนู</button>
      <button type="button" data-rjc-hdr="welcome" title="AI กล่าวต้อนรับและสรุปจุดที่เรียนค้าง" class="hidden sm:inline-flex spatial-soft px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-accent-adaptive">AI ต้อนรับ</button>
      <button type="button" data-rjc-hdr="fx" title="เปิด/ปิดเสียงเอฟเฟกต์สัมผัส" class="spatial-soft px-2 py-1.5 rounded-xl text-[11px] font-bold text-secondary-adaptive">${TactileFX.enabled ? '🔔' : '🔕'}</button>
    `;
  }

  // ==========================================================================
  // 12. PUBLIC BRIDGE API FOR index.html
  // ==========================================================================
  window.RJCLOUD_AI_INTERACTIVE = {
    registerBridge(bridgeApi) {
      injectStyles();
      ensureCopilotFabAndModal();

      if (!Controller.resizeBound) {
        Controller.resizeBound = true;
        window.addEventListener('resize', () => {
          if (Controller.tourStepIndex >= 0 && MENU_TOUR_STEPS[Controller.tourStepIndex]) {
            positionTourRing(MENU_TOUR_STEPS[Controller.tourStepIndex]);
          }
        });
      }

      const prevScreen = Controller.bridge?.screen;
      const prevUserId = Controller.bridge?.user?.id || '';
      const nextUserId = bridgeApi?.user?.id || bridgeApi?.user?.license || '';

      // รีโหลดหน่วยความจำรายบุคคลหากสลับบัญชีผู้เรียน
      if (nextUserId && nextUserId !== Controller.loadedForUserId) {
        LearningMemory.setActiveUserId(nextUserId);
        Controller.mem = LearningMemory.load();
        Controller.loadedForUserId = nextUserId;
        Controller.lastBridgeStudySeconds = Number(bridgeApi.studySeconds || 0);
      }

      Controller.bridge = bridgeApi;
      TactileFX.enabled = Controller.mem.soundEffectsOn;

      // แสดงปุ่ม AI Co-Pilot ลอยตัวเฉพาะเมื่ออยู่ในหน้าห้องเรียน (dashboard)
      if (Controller.els.fab) {
        const showFab = bridgeApi.screen === 'dashboard' && Boolean(bridgeApi.user);
        Controller.els.fab.style.display = showFab ? 'flex' : 'none';
        if (!showFab && Controller.copilotOpen) closeCopilotDrawer();
      }

      // นับเวลาสะสมรายบทเฉพาะเมื่อ studySeconds จากห้องเรียนเพิ่มขึ้นจริง (ไม่บวกซ้ำเมื่อกดสลับธีม)
      const incomingStudySec = Number(bridgeApi.studySeconds || 0);
      if (bridgeApi.screen === 'dashboard' && bridgeApi.activeTab === 'lessons' && bridgeApi.user) {
        const lid = Number(bridgeApi.currentLessonId || 1);
        const delta =
          Controller.lastBridgeStudySeconds === null
            ? 0
            : Math.max(0, Math.min(15, incomingStudySec - Controller.lastBridgeStudySeconds));

        if (delta > 0 || Number(Controller.mem.lastLessonId) !== lid) {
          const perMap = { ...(Controller.mem.perLessonSeconds || {}) };
          if (delta > 0) perMap[lid] = Number(perMap[lid] || 0) + delta;
          Controller.mem = LearningMemory.save({
            lastLessonId: lid,
            perLessonSeconds: perMap
          });
        }
      }
      Controller.lastBridgeStudySeconds = incomingStudySec;

      ensureDashboardHeaderActions();
      ensureLessonInteractivePanel();

      // เมื่อผู้เรียนเข้าสู่หน้าห้องเรียนครั้งแรกในรอบเซสชัน
      const justEnteredDashboard =
        bridgeApi.screen === 'dashboard' && (prevScreen !== 'dashboard' || prevUserId !== nextUserId);
      if (justEnteredDashboard && bridgeApi.user && !bridgeApi.isAdminPreview) {
        if (!Controller.mem.tourSeen && bridgeApi.hasDonePretest) {
          Controller.mem = LearningMemory.save({ tourSeen: true });
          Controller.welcomeShownForUserId = nextUserId;
          setTimeout(() => startGuidedTour(), 450);
        } else if (Controller.welcomeShownForUserId !== nextUserId) {
          Controller.welcomeShownForUserId = nextUserId;
          setTimeout(() => openWelcomeModal(true), 450);
        }
      }
    },

    openWelcome(autoSpeak = true) {
      openWelcomeModal(autoSpeak);
    },

    openTour() {
      startGuidedTour();
    },

    openCoPilot() {
      openCopilotDrawer();
    }
  };
})();
