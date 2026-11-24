/**
 * ============================================================================
 * rjcloud.organ 2.0 — World-Class Launch Experience Module (keynote-launch.js)
 * เชื่อมต่อหน้าแรกต้นไม้ (index.html) ผ่าน window.RJCLOUD_KEYNOTE
 *
 * ความสามารถครบชุด (อัปเกรด Studio-Grade AI Voice 2027 • ไฟล์ 3/4):
 * 1. ม่านเปิดตัวแบบแตะ 1 ครั้ง (ป้าย "สู่มาตรฐานปี 2027") ปลดล็อกเสียงบน iOS/Android/Desktop 100%
 * 2. เพลงประกอบฟรีไม่มีลิขสิทธิ์จาก YouTube: "Great (Epic Modern Cinematic)" — Alex-Productions
 *    (Video ID: TTwfAUzEHrM • CC BY 3.0) พร้อมดนตรีซินธ์ Cinematic สำรองในตัวขณะบัฟเฟอร์หรือออฟไลน์
 * 3. ระบบ Auto-Ducking หรี่เสียงเพลงอัตโนมัติ (~19%) ตอนพิธีกรพูด และเร่งเพลงขึ้น (~74%) ช่วงเปิด–ปิด
 * 4. พิธีกรคู่ ชาย–หญิง คุณภาพสตูดิโอ 24kHz PCM WAV (Puck + Sulafat) แบบแบ่งช่วงโหลดล่วงหน้า
 *    (Lookahead Prefetching + Timeout 45 วิ + ลองใหม่อัตโนมัติ 2 รอบ + แคช IndexedDB v5)
 * 5. ตัดเสียงหุ่นยนต์จากเบราว์เซอร์ (speechSynthesis) ออก 100% รอจนเสียง AI สตูดิโอพร้อมจริง
 * 6. แสดงแถบไฟแอมเบียนวิ่งด้านบนสุด + สถานะบนปุ่มมุมขวาบน โดยไม่มีกรอบซับไตเติลบังต้นไม้
 * ============================================================================
 */
(function (global) {
  'use strict';

  if (global.RJCLOUD_KEYNOTE_LOADED) return;
  global.RJCLOUD_KEYNOTE_LOADED = true;

  // ==========================================================================
  // 1. CONSTANTS, YOUTUBE TRACK & DUAL-HOST SCRIPT (6 ช่วงฉบับสมบูรณ์)
  // ==========================================================================
  const YOUTUBE_VIDEO_ID = 'TTwfAUzEHrM'; // Great (Epic Modern Cinematic) — Alex-Productions (Audio Library)
  const MUSIC_CREDIT = 'Music: "Great" by Alex-Productions (CC BY 3.0)';
  const AUDIO_DB_NAME = 'rjcloud_keynote_voice_cache_v5';
  const AUDIO_STORE_NAME = 'clips';
  const SESSION_DISMISS_KEY = 'rjcloud_keynote_seen_session_v1';
  const SILENT_UNLOCK_WAV = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

  const MALE_VOICE_NAME = 'Puck';
  const FEMALE_VOICE_NAME = 'Sulafat';

  const DUAL_HOST_SCRIPT = [
    {
      id: 'k1',
      speaker: 'male',
      voiceName: MALE_VOICE_NAME,
      badge: 'พิธีกรชาย',
      style: 'พูดภาษาไทยด้วยน้ำเสียงผู้ชายวัยทำงานโทนกลางโปร่ง สดใส นุ่มสบายหู คมชัดระดับสตูดิโอ ผ่อนคลายและเป็นกันเองแบบพิธีกรงานเทคโนโลยีสมัยใหม่ ไม่ทุ้มลึกหรือหนักแน่นจนเกินไป',
      speech: 'เบื้องหลังทุกหนึ่งชีวิตที่ได้รับโอกาสครั้งใหม่... คือความเชี่ยวชาญ ความแม่นยำ และหัวใจของทีมบุคลากรทางการแพทย์ทุกคนครับ'
    },
    {
      id: 'k2',
      speaker: 'female',
      voiceName: FEMALE_VOICE_NAME,
      badge: 'พิธีกรหญิง',
      style: 'พูดภาษาไทยสลับอังกฤษด้วยน้ำเสียงผู้หญิงที่อบอุ่น สง่างาม มั่นใจ คมชัดระดับสตูดิโอ และทันสมัยเหมือนพิธีกรงานเปิดตัวเทคโนโลยีระดับสากล',
      speech: 'และวันนี้... Organ Transplantation Center of ราชวิถี Hospital พร้อมแล้วที่จะพาท่านก้าวข้ามทุกขีดจำกัดของการฝึกอบรมเดิมๆ ค่ะ'
    },
    {
      id: 'k3',
      speaker: 'male',
      voiceName: MALE_VOICE_NAME,
      badge: 'พิธีกรชาย',
      style: 'พูดด้วยน้ำเสียงผู้ชายโทนกลางโปร่งที่สดใส ชัดถ้อยชัดคำ ลื่นหู คมชัดระดับสตูดิโอ ทันสมัย และเป็นมิตร สไตล์งานเปิดตัวเทคโนโลยี',
      speech: 'พบกับ อาร์เจ คลาวด์ ออร์แกน สองจุดศูนย์ คลาวด์เอไอ แพลตฟอร์มอีเลิร์นนิง การรับบริจาคและปลูกถ่ายอวัยวะ สู่มาตรฐานปีสองพันยี่สิบเจ็ดครับ'
    },
    {
      id: 'k4',
      speaker: 'female',
      voiceName: FEMALE_VOICE_NAME,
      badge: 'พิธีกรหญิง',
      style: 'พูดภาษาไทยด้วยน้ำเสียงนุ่มนวล ลื่นไหล อบอุ่น คมชัดระดับสตูดิโอ และชัดเจน น่าเชื่อถือระดับวิชาการแพทย์สากล',
      speech: 'มาพร้อมผู้ช่วยเอไอติวสรุปบทเรียน, ห้องฝึกสื่อสารกับญาติ เอไอสกิลแล็บ ที่ตอบโต้ด้วยเสียงและอารมณ์เสมือนจริง และระบบรับรองหน่วยคะแนนซีเอ็นอียู มาตรฐานสภาการพยาบาล ภายใต้การคุ้มครองข้อมูลพีดีพีเอ อย่างสูงสุดค่ะ'
    },
    {
      id: 'k5',
      speaker: 'male',
      voiceName: MALE_VOICE_NAME,
      badge: 'พิธีกรชาย',
      style: 'พูดด้วยน้ำเสียงผู้ชายโทนกลางที่อบอุ่น เบาสบาย นุ่มนวล คมชัดระดับสตูดิโอ และสร้างแรงบันดาลใจอย่างเป็นธรรมชาติ ไม่ทุ้มหนักหรือแข็งกร้าว',
      speech: 'อนาคตแห่งการเรียนรู้และการให้ชีวิตใหม่...'
    },
    {
      id: 'k6',
      speaker: 'female',
      voiceName: FEMALE_VOICE_NAME,
      badge: 'พิธีกรหญิง',
      style: 'พูดภาษาไทยด้วยน้ำเสียงผู้หญิงที่อบอุ่น สดใส คมชัดระดับสตูดิโอ ชวนเชิญ และน่าประทับใจเหมือนประโยคปิดงานเปิดตัวเทคโนโลยีระดับโลก',
      speech: 'ยินดีต้อนรับสู่ อาร์เจ คลาวด์ ออร์แกน สองจุดศูนย์... กดปุ่มเข้าสู่ระบบ เพื่อเริ่มต้นได้เลยค่ะ'
    }
  ];

  // ==========================================================================
  // 2. STYLES INJECTION (CURTAIN, AMBIENT LIGHT BAR & FLOATING CONTROL DOCK)
  // ==========================================================================
  function injectKeynoteStyles() {
    if (document.getElementById('rjcloud-keynote-styles')) return;
    const style = document.createElement('style');
    style.id = 'rjcloud-keynote-styles';
    style.textContent = `
      @keyframes rjknEqBounce {
        0%, 100% { transform: scaleY(0.28); }
        50% { transform: scaleY(1); }
      }
      @keyframes rjknAmbientRun {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes rjknPulseHalo {
        0%, 100% { box-shadow: 0 0 0 0 rgba(110, 231, 183, 0.45), 0 0 36px rgba(56, 189, 248, 0.35); }
        50% { box-shadow: 0 0 0 14px rgba(110, 231, 183, 0), 0 0 54px rgba(253, 224, 71, 0.45); }
      }
      @keyframes rjknFadeUp {
        from { opacity: 0; transform: translateY(12px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes rjknFlashBurst {
        0% { opacity: 0; }
        20% { opacity: 0.55; }
        100% { opacity: 0; }
      }
      .rjkn-ambient-bar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        z-index: 148;
        pointer-events: none;
        opacity: 0;
        background: linear-gradient(90deg, #6ee7b7, #38bdf8, #818cf8, #f0abfc, #fde68a, #6ee7b7);
        background-size: 300% 100%;
        animation: rjknAmbientRun 2s linear infinite;
        box-shadow: 0 0 20px rgba(56, 189, 248, 0.9), 0 2px 14px rgba(110, 231, 183, 0.65);
        transition: opacity 0.35s ease;
      }
      .rjkn-ambient-bar.is-visible {
        opacity: 1;
      }
      .rjkn-curtain {
        position: fixed;
        inset: 0;
        z-index: 150;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background:
          radial-gradient(ellipse 80% 55% at 50% 35%, rgba(22, 92, 196, 0.36) 0%, rgba(2, 8, 24, 0.88) 65%, rgba(0, 0, 0, 0.96) 100%);
        backdrop-filter: blur(18px) saturate(150%);
        -webkit-backdrop-filter: blur(18px) saturate(150%);
        transition: opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1), visibility 0.65s ease;
      }
      .rjkn-curtain.is-hidden {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
      }
      .rjkn-curtain-card {
        width: 100%;
        max-width: 520px;
        border-radius: 2rem;
        padding: 32px 26px;
        text-align: center;
        color: #ffffff;
        background: linear-gradient(155deg, rgba(255, 255, 255, 0.12) 0%, rgba(10, 32, 76, 0.68) 55%, rgba(2, 8, 22, 0.9) 100%);
        border: 1px solid rgba(186, 230, 253, 0.34);
        box-shadow: 0 32px 72px -18px rgba(0, 6, 24, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.35);
        animation: rjknFadeUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
      }
      .rjkn-launch-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        width: 100%;
        min-height: 54px;
        padding: 14px 26px;
        border: none;
        border-radius: 9999px;
        cursor: pointer;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Anuphan', 'Prompt', sans-serif;
        font-weight: 700;
        font-size: 16px;
        color: #050b16;
        background: linear-gradient(95deg, #d7fbe6 0%, #c6f3f9 48%, #b3c8ff 100%);
        animation: rjknPulseHalo 2.4s ease-in-out infinite;
        transition: transform 0.2s ease, filter 0.2s ease;
      }
      .rjkn-launch-btn:hover { transform: translateY(-2px) scale(1.02); filter: brightness(1.04); }
      .rjkn-launch-btn:active { transform: scale(0.97); }
      .rjkn-dock {
        position: fixed;
        top: calc(14px + env(safe-area-inset-top, 0px));
        right: 14px;
        z-index: 120;
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }
      .rjkn-pill {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 8px 13px;
        border-radius: 9999px;
        border: 1px solid rgba(186, 230, 253, 0.34);
        background: rgba(4, 14, 34, 0.72);
        backdrop-filter: blur(18px) saturate(160%);
        -webkit-backdrop-filter: blur(18px) saturate(160%);
        color: #f0f9ff;
        font-family: -apple-system, BlinkMacSystemFont, 'Anuphan', 'Prompt', sans-serif;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 10px 28px -8px rgba(0, 8, 28, 0.75);
        transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease;
      }
      .rjkn-pill:hover {
        background: rgba(12, 34, 76, 0.86);
        border-color: rgba(110, 231, 183, 0.65);
        transform: translateY(-1px);
      }
      .rjkn-pill.is-live {
        border-color: rgba(110, 231, 183, 0.8);
        background: linear-gradient(95deg, rgba(16, 185, 129, 0.24), rgba(14, 165, 233, 0.26));
        box-shadow: 0 0 22px rgba(56, 189, 248, 0.42);
      }
      .rjkn-pill.is-loading {
        border-color: rgba(103, 232, 249, 0.85);
        background: linear-gradient(95deg, rgba(14, 165, 233, 0.26), rgba(129, 140, 248, 0.26));
        box-shadow: 0 0 22px rgba(103, 232, 249, 0.45);
      }
      .rjkn-eq {
        display: inline-flex;
        align-items: flex-end;
        gap: 2px;
        height: 12px;
      }
      .rjkn-eq span {
        width: 2.5px;
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(180deg, #fde68a, #6ee7b7, #38bdf8);
        animation: rjknEqBounce 0.75s ease-in-out infinite;
        transform-origin: bottom;
      }
      .rjkn-eq span:nth-child(2) { animation-delay: 0.16s; }
      .rjkn-eq span:nth-child(3) { animation-delay: 0.32s; }
      .rjkn-flash {
        position: fixed;
        inset: 0;
        z-index: 145;
        pointer-events: none;
        background: radial-gradient(circle at 50% 24%, rgba(254, 240, 178, 0.85) 0%, rgba(56, 189, 248, 0.32) 38%, transparent 72%);
        animation: rjknFlashBurst 1.15s ease-out forwards;
      }
      @media (prefers-reduced-motion: reduce) {
        .rjkn-ambient-bar, .rjkn-eq span, .rjkn-launch-btn { animation: none !important; }
      }
    `;
    document.head.appendChild(style);
  }

  // ==========================================================================
  // 3. INDEXEDDB VOICE CACHE + 24kHz PCM WAV CONVERTER
  // ==========================================================================
  let idbPromise = null;

  function openVoiceDb() {
    if (idbPromise) return idbPromise;
    idbPromise = new Promise(function (resolve) {
      if (typeof indexedDB === 'undefined') return resolve(null);
      try {
        const req = indexedDB.open(AUDIO_DB_NAME, 1);
        req.onupgradeneeded = function () {
          const db = req.result;
          if (!db.objectStoreNames.contains(AUDIO_STORE_NAME)) {
            db.createObjectStore(AUDIO_STORE_NAME);
          }
        };
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { resolve(null); };
      } catch (_) {
        resolve(null);
      }
    });
    return idbPromise;
  }

  async function getCachedClip(key) {
    const db = await openVoiceDb();
    if (!db) return null;
    return new Promise(function (resolve) {
      try {
        const tx = db.transaction(AUDIO_STORE_NAME, 'readonly');
        const req = tx.objectStore(AUDIO_STORE_NAME).get(key);
        req.onsuccess = function () { resolve(req.result || null); };
        req.onerror = function () { resolve(null); };
      } catch (_) {
        resolve(null);
      }
    });
  }

  async function setCachedClip(key, blob) {
    if (!blob || blob.size === 0) return;
    const db = await openVoiceDb();
    if (!db) return;
    return new Promise(function (resolve) {
      try {
        const tx = db.transaction(AUDIO_STORE_NAME, 'readwrite');
        tx.objectStore(AUDIO_STORE_NAME).put(blob, key);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { resolve(); };
      } catch (_) {
        resolve();
      }
    });
  }

  function base64PcmToWavBlob(base64PCM, sampleRate) {
    if (global.RJCLOUD_CORE && typeof global.RJCLOUD_CORE.pcm16ToWavBlob === 'function') {
      return global.RJCLOUD_CORE.pcm16ToWavBlob(base64PCM, sampleRate || 24000);
    }
    try {
      const rate = sampleRate || 24000;
      const bin = global.atob(base64PCM);
      const raw = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) raw[i] = bin.charCodeAt(i);
      const off = (raw.length > 44 && raw[0] === 0x52 && raw[1] === 0x49 && raw[2] === 0x46 && raw[3] === 0x46) ? 44 : 0;
      const pcmLen = Math.max(0, raw.length - off);
      const buf = new ArrayBuffer(44 + pcmLen);
      const v = new DataView(buf);
      const ws = function (o, s) { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
      ws(0, 'RIFF'); v.setUint32(4, 36 + pcmLen, true); ws(8, 'WAVE'); ws(12, 'fmt ');
      v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
      v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true);
      v.setUint16(32, 2, true); v.setUint16(34, 16, true); ws(36, 'data'); v.setUint32(40, pcmLen, true);
      new Uint8Array(buf, 44).set(raw.subarray(off));
      return new Blob([buf], { type: 'audio/wav' });
    } catch (_) {
      return null;
    }
  }

  // ==========================================================================
  // 4. MUSIC ENGINE: YOUTUBE ("Great" — TTwfAUzEHrM) + EPIC SYNTH FALLBACK
  // ==========================================================================
  const MusicEngine = {
    ytPlayer: null,
    ytReady: false,
    ytPlaying: false,
    ytMuted: false,
    ytCurrentVol: 0,
    ytRampTimer: null,
    apiRequested: false,
    pendingPlay: false,
    desiredTargetVol: 75,

    synthCtx: null,
    synthGain: null,
    synthNodes: [],
    synthTimer: null,
    synthActive: false,

    ensureYtMount: function () {
      if (document.getElementById('rjkn-yt-host')) return;
      const box = document.createElement('div');
      box.id = 'rjkn-yt-host';
      box.style.cssText = 'position:fixed;width:2px;height:2px;bottom:0;left:0;opacity:0.001;pointer-events:none;overflow:hidden;z-index:-1;';
      const inner = document.createElement('div');
      inner.id = 'rjkn-yt-player';
      box.appendChild(inner);
      document.body.appendChild(box);
    },

    loadYouTubeApi: function () {
      if (this.apiRequested) return;
      this.apiRequested = true;
      this.ensureYtMount();

      const self = this;
      const createPlayer = function () {
        if (self.ytPlayer || !global.YT || !global.YT.Player) return;
        try {
          self.ytPlayer = new global.YT.Player('rjkn-yt-player', {
            height: '200',
            width: '200',
            videoId: YOUTUBE_VIDEO_ID,
            playerVars: {
              autoplay: 0,
              controls: 0,
              disablekb: 1,
              fs: 0,
              iv_load_policy: 3,
              loop: 1,
              modestbranding: 1,
              playsinline: 1,
              playlist: YOUTUBE_VIDEO_ID,
              rel: 0
            },
            events: {
              onReady: function () {
                self.ytReady = true;
                try {
                  self.ytPlayer.setVolume(0);
                  if (self.pendingPlay) {
                    self.ytPlayer.unMute();
                    self.ytPlayer.playVideo();
                  }
                } catch (_) {}
              },
              onStateChange: function (ev) {
                if (global.YT && ev.data === global.YT.PlayerState.PLAYING) {
                  self.ytPlaying = true;
                  self.fadeOutSynth(900);
                  if (!self.ytMuted) {
                    self.rampYouTubeVolume(self.desiredTargetVol, 900);
                  }
                } else if (global.YT && ev.data === global.YT.PlayerState.ENDED) {
                  try {
                    self.ytPlayer.seekTo(0);
                    self.ytPlayer.playVideo();
                  } catch (_) {}
                }
              },
              onError: function () {
                self.ytPlaying = false;
              }
            }
          });
        } catch (_) {}
      };

      if (global.YT && global.YT.Player) {
        createPlayer();
        return;
      }

      const prevReady = global.onYouTubeIframeAPIReady;
      global.onYouTubeIframeAPIReady = function () {
        if (typeof prevReady === 'function') {
          try { prevReady(); } catch (_) {}
        }
        createPlayer();
      };

      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      document.head.appendChild(tag);
    },

    rampYouTubeVolume: function (targetVol, durationMs) {
      const self = this;
      const clamped = Math.max(0, Math.min(100, Math.round(targetVol)));
      if (this.ytRampTimer) {
        clearInterval(this.ytRampTimer);
        this.ytRampTimer = null;
      }
      if (!this.ytReady || !this.ytPlayer || typeof this.ytPlayer.setVolume !== 'function') return;

      const startVol = this.ytCurrentVol;
      const steps = Math.max(1, Math.round((durationMs || 600) / 40));
      let step = 0;
      this.ytRampTimer = setInterval(function () {
        step += 1;
        const t = Math.min(1, step / steps);
        const eased = t * (2 - t);
        const nextVol = Math.round(startVol + (clamped - startVol) * eased);
        self.ytCurrentVol = nextVol;
        try {
          self.ytPlayer.setVolume(self.ytMuted ? 0 : nextVol);
        } catch (_) {}
        if (step >= steps) {
          clearInterval(self.ytRampTimer);
          self.ytRampTimer = null;
        }
      }, 40);
    },

    startSynthFallback: function (gainLevel) {
      if (this.synthActive) return;
      try {
        const AudioCtx = global.AudioContext || global.webkitAudioContext;
        if (!AudioCtx) return;
        if (!this.synthCtx) this.synthCtx = new AudioCtx();
        if (this.synthCtx.state === 'suspended') this.synthCtx.resume().catch(function () {});

        const ctx = this.synthCtx;
        const master = ctx.createGain();
        master.gain.setValueAtTime(0.0001, ctx.currentTime);
        master.gain.linearRampToValueAtTime(this.ytMuted ? 0.0001 : (gainLevel || 0.06), ctx.currentTime + 1.2);
        master.connect(ctx.destination);
        this.synthGain = master;
        this.synthActive = true;

        const chords = [
          [146.83, 220.0, 261.63, 329.63],
          [116.54, 220.0, 293.66, 349.23],
          [174.61, 261.63, 329.63, 440.0],
          [130.81, 261.63, 349.23, 392.0]
        ];
        let chordIdx = 0;
        const self = this;

        const triggerChord = function () {
          if (!self.synthActive || !self.synthCtx || !self.synthGain) return;
          const now = ctx.currentTime;
          const notes = chords[chordIdx % chords.length];
          chordIdx += 1;

          notes.forEach(function (freq, idx) {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = idx === 0 ? 'triangle' : 'sine';
            osc.frequency.setValueAtTime(freq, now);
            g.gain.setValueAtTime(0.0001, now);
            g.gain.linearRampToValueAtTime(idx === 0 ? 0.24 : 0.14, now + 0.9);
            g.gain.linearRampToValueAtTime(0.0001, now + 4.4);
            osc.connect(g);
            g.connect(master);
            osc.start(now);
            osc.stop(now + 4.5);
            self.synthNodes.push(osc);
          });
        };

        triggerChord();
        this.synthTimer = setInterval(triggerChord, 4000);
      } catch (_) {}
    },

    setSynthLevel: function (level, durationSec) {
      if (!this.synthActive || !this.synthCtx || !this.synthGain) return;
      try {
        const now = this.synthCtx.currentTime;
        const target = this.ytMuted ? 0.0001 : Math.max(0.0001, level);
        this.synthGain.gain.cancelScheduledValues(now);
        this.synthGain.gain.setValueAtTime(Math.max(0.0001, this.synthGain.gain.value), now);
        this.synthGain.gain.linearRampToValueAtTime(target, now + (durationSec || 0.7));
      } catch (_) {}
    },

    fadeOutSynth: function (ms) {
      if (!this.synthActive) return;
      const self = this;
      this.setSynthLevel(0.0001, (ms || 700) / 1000);
      setTimeout(function () {
        self.stopSynthImmediate();
      }, (ms || 700) + 80);
    },

    stopSynthImmediate: function () {
      this.synthActive = false;
      if (this.synthTimer) {
        clearInterval(this.synthTimer);
        this.synthTimer = null;
      }
      this.synthNodes.forEach(function (n) {
        try { n.stop(); } catch (_) {}
      });
      this.synthNodes = [];
    },

    start: function (initialVol) {
      this.desiredTargetVol = typeof initialVol === 'number' ? initialVol : 74;
      this.pendingPlay = true;
      this.loadYouTubeApi();
      if (!this.ytPlaying) {
        this.startSynthFallback(0.065);
      }
      if (this.ytReady && this.ytPlayer) {
        try {
          this.ytPlayer.seekTo(0);
          if (!this.ytMuted) this.ytPlayer.unMute();
          this.ytPlayer.playVideo();
          this.rampYouTubeVolume(this.desiredTargetVol, 1200);
        } catch (_) {}
      }
    },

    duckTo: function (volPercent, durationMs) {
      this.desiredTargetVol = volPercent;
      if (this.ytPlaying) {
        this.rampYouTubeVolume(volPercent, durationMs || 650);
      } else if (this.synthActive) {
        this.setSynthLevel(0.018 + (volPercent / 100) * 0.06, (durationMs || 650) / 1000);
      }
    },

    setMuted: function (muted) {
      this.ytMuted = Boolean(muted);
      if (this.ytReady && this.ytPlayer) {
        try {
          if (this.ytMuted) {
            this.ytPlayer.mute();
            this.ytPlayer.setVolume(0);
          } else {
            this.ytPlayer.unMute();
            this.ytPlayer.setVolume(this.desiredTargetVol);
          }
        } catch (_) {}
      }
      if (this.synthActive) {
        this.setSynthLevel(this.ytMuted ? 0.0001 : 0.035, 0.35);
      }
    },

    stop: function () {
      this.pendingPlay = false;
      this.ytPlaying = false;
      if (this.ytRampTimer) {
        clearInterval(this.ytRampTimer);
        this.ytRampTimer = null;
      }
      this.stopSynthImmediate();
      if (this.ytReady && this.ytPlayer) {
        try {
          this.ytPlayer.pauseVideo();
          this.ytPlayer.setVolume(0);
        } catch (_) {}
      }
    }
  };

  // ==========================================================================
  // 5. MAIN KEYNOTE CONTROLLER (STUDIO 24kHz AI VOICE • ZERO BROWSER SPEECH)
  // ==========================================================================
  const State = {
    mounted: false,
    isLanding: false,
    appsScriptUrl: '',
    sessionId: 0,
    running: false,
    voicePhase: 'idle', // idle | loading | speaking | music_only
    statusLabel: '',
    musicMuted: false,
    sharedAudio: null,
    activeBlobUrl: null,
    activeControllers: new Set(),
    els: {}
  };

  function unlockMobileAudio() {
    try {
      if (!State.sharedAudio) {
        const a = new Audio();
        a.playsInline = true;
        a.setAttribute('playsinline', '');
        a.preload = 'auto';
        State.sharedAudio = a;
      }
      const a = State.sharedAudio;
      a.muted = true;
      a.src = SILENT_UNLOCK_WAV;
      const p = a.play();
      if (p && typeof p.then === 'function') {
        p.then(function () {
          try { a.pause(); a.currentTime = 0; } catch (_) {}
          a.muted = false;
        }).catch(function () { a.muted = false; });
      } else {
        a.muted = false;
      }
    } catch (_) {}
  }

  function stopVoiceOnly() {
    State.sessionId += 1;
    State.activeControllers.forEach(function (c) {
      try { c.abort(); } catch (_) {}
    });
    State.activeControllers.clear();
    if (State.sharedAudio) {
      try {
        State.sharedAudio.onended = null;
        State.sharedAudio.onerror = null;
        State.sharedAudio.pause();
      } catch (_) {}
    }
    if (State.activeBlobUrl) {
      try { URL.revokeObjectURL(State.activeBlobUrl); } catch (_) {}
      State.activeBlobUrl = null;
    }
    // ตัดเสียงรบกวนจากเบราว์เซอร์ทิ้งเสมอ (ไม่ใช้เสียงหุ่นยนต์เบราว์เซอร์ 100%)
    if ('speechSynthesis' in global) {
      try { global.speechSynthesis.cancel(); } catch (_) {}
    }
    State.voicePhase = 'idle';
    State.statusLabel = '';
  }

  function stopAll() {
    stopVoiceOnly();
    MusicEngine.stop();
    State.running = false;
    updateDockUi();
  }

  /**
   * โหลดเสียงพิธีกร AI คุณภาพสตูดิโอ 24kHz PCM WAV (รอสูงสุด 45 วิ/รอบ + ลองใหม่อัตโนมัติ 2 รอบ + แคช IndexedDB)
   * ไม่ลดทอนคุณภาพเสียงและไม่สลับไปใช้เสียงเบราว์เซอร์เด็ดขาด
   */
  async function fetchSegmentAudio(seg, appsScriptUrl, sid) {
    const cacheKey = 'keynote_v5_' + seg.id + '_' + seg.voiceName;
    const hit = await getCachedClip(cacheKey);
    if (hit && hit.size > 0) return hit;
    if (!appsScriptUrl || (typeof navigator !== 'undefined' && !navigator.onLine)) return null;

    for (let attempt = 0; attempt < 2; attempt++) {
      if (State.sessionId !== sid) return null;
      const ctrl = new AbortController();
      State.activeControllers.add(ctrl);
      const tm = setTimeout(function () { ctrl.abort(); }, 45000);

      try {
        const rawRes = await fetch(appsScriptUrl, {
          method: 'POST',
          redirect: 'follow',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'callGeminiTTS',
            text: seg.speech,
            voiceName: seg.voiceName,
            languageCode: 'th-TH',
            style: seg.style
          }),
          signal: ctrl.signal
        });
        clearTimeout(tm);
        State.activeControllers.delete(ctrl);
        if (State.sessionId !== sid) return null;

        const txt = await rawRes.text();
        const res = JSON.parse(txt || '{}');
        if (res && res.status === 'success' && res.inlineData && res.inlineData.data) {
          const rateMatch = String(res.inlineData.mimeType || '').match(/rate=(\d+)/);
          const rate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
          const blob = base64PcmToWavBlob(res.inlineData.data, rate);
          if (blob && blob.size > 0) {
            await setCachedClip(cacheKey, blob);
            return blob;
          }
        }
      } catch (_) {
        clearTimeout(tm);
        State.activeControllers.delete(ctrl);
      }

      if (attempt === 0 && State.sessionId === sid) {
        await new Promise(function (r) { setTimeout(r, 1100); });
      }
    }
    return null;
  }

  function playBlobOnSharedAudio(blob, sid) {
    return new Promise(function (resolve) {
      if (State.sessionId !== sid || !blob) return resolve(false);
      if (State.activeBlobUrl) {
        try { URL.revokeObjectURL(State.activeBlobUrl); } catch (_) {}
        State.activeBlobUrl = null;
      }
      if (!State.sharedAudio) {
        const a = new Audio();
        a.playsInline = true;
        a.setAttribute('playsinline', '');
        State.sharedAudio = a;
      }
      const url = URL.createObjectURL(blob);
      State.activeBlobUrl = url;
      const a = State.sharedAudio;
      a.muted = false;
      a.src = url;
      a.onended = function () { resolve(true); };
      a.onerror = function () { resolve(false); };
      try { a.load(); } catch (_) {}
      const p = a.play();
      if (p && typeof p.catch === 'function') {
        p.catch(function () { resolve(false); });
      }
    });
  }

  // ==========================================================================
  // 6. UI BUILDERS (AMBIENT LIGHT BAR, LAUNCH CURTAIN & FLOATING CONTROL DOCK)
  // ==========================================================================
  function ensureDomOverlays() {
    injectKeynoteStyles();

    const legacySub = document.getElementById('rjkn-subtitle');
    if (legacySub && legacySub.parentNode) legacySub.parentNode.removeChild(legacySub);

    // 0) Top Ambient Glow Bar แสดงสถานะรอเสียง AI พร้อมและขณะพิธีกร AI พูด (ไม่บังต้นไม้)
    if (!State.els.ambientBar) {
      const bar = document.createElement('div');
      bar.id = 'rjkn-ambient-bar';
      bar.className = 'rjkn-ambient-bar';
      bar.setAttribute('aria-hidden', 'true');
      document.body.appendChild(bar);
      State.els.ambientBar = bar;
    }

    // 1) One-Tap Keynote Launch Curtain (ป้าย "สู่มาตรฐานปี 2027")
    if (!State.els.curtain) {
      const curtain = document.createElement('div');
      curtain.id = 'rjkn-launch-curtain';
      curtain.className = 'rjkn-curtain is-hidden';
      curtain.innerHTML = `
        <div class="rjkn-curtain-card">
          <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:9999px;background:rgba(255,255,255,0.08);border:1px solid rgba(186,230,253,0.32);font-size:12px;font-weight:700;letter-spacing:0.06em;color:#a7f3d0;margin-bottom:16px;">
            <span style="width:7px;height:7px;border-radius:9999px;background:#6ee7b7;box-shadow:0 0 10px #6ee7b7;"></span>
            สู่มาตรฐานปี 2027
          </div>
          <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.14em;color:#7dd3fc;font-weight:600;text-transform:uppercase;">
            Organ Transplantation Center of Rajavithi Hospital
          </p>
          <h2 style="margin:0 0 10px;font-size:28px;line-height:1.2;font-weight:800;background:linear-gradient(95deg,#ffffff 0%,#e0f2fe 50%,#fde68a 100%);-webkit-background-clip:text;background-clip:text;color:transparent;">
            rjcloud.organ 2.0
          </h2>
          <p style="margin:0 0 22px;font-size:14px;line-height:1.65;color:#dbeafe;">
            สัมผัสการเปิดตัวระบบ e-Learning แห่งอนาคต พร้อมเสียงพิธีกรคู่ AI คุณภาพสตูดิโอ (ชาย–หญิง) และดนตรีประกอบ Epic Cinematic
          </p>
          <button type="button" id="rjkn-btn-start-show" class="rjkn-launch-btn">
            <span style="font-size:17px;">▶</span>
            <span>เปิดประสบการณ์เปิดตัว (เสียง AI สตูดิโอ)</span>
          </button>
          <div style="margin-top:16px;display:flex;flex-direction:column;align-items:center;gap:8px;">
            <button type="button" id="rjkn-btn-skip-show" style="background:none;border:none;color:rgba(219,234,254,0.75);font-size:13px;cursor:pointer;text-decoration:underline;padding:6px 12px;">
              เข้าสู่หน้าแรกแบบไม่เปิดเสียง →
            </button>
            <span style="font-size:10.5px;color:rgba(147,180,216,0.72);">${MUSIC_CREDIT}</span>
          </div>
        </div>
      `;
      document.body.appendChild(curtain);
      State.els.curtain = curtain;

      curtain.querySelector('#rjkn-btn-start-show').onclick = function () {
        markSessionSeen();
        hideCurtain();
        startExperience();
      };
      curtain.querySelector('#rjkn-btn-skip-show').onclick = function () {
        markSessionSeen();
        hideCurtain();
      };
    }

    // 2) Top-Right Floating Control Dock
    if (!State.els.dock) {
      const dock = document.createElement('div');
      dock.id = 'rjkn-control-dock';
      dock.className = 'rjkn-dock';
      dock.style.display = 'none';
      dock.innerHTML = `
        <button type="button" id="rjkn-dock-play" class="rjkn-pill" title="ฟังเสียงพิธีกรคู่ AI แนะนำระบบ rjcloud.organ 2.0">
          <span id="rjkn-dock-icon">▶</span>
          <span id="rjkn-dock-label">แนะนำระบบ AI</span>
        </button>
        <button type="button" id="rjkn-dock-mute" class="rjkn-pill" style="display:none;" title="เปิด/ปิดเสียงเพลงประกอบ">
          <span id="rjkn-mute-label">🎵 เพลง: เปิด</span>
        </button>
      `;
      document.body.appendChild(dock);
      State.els.dock = dock;

      dock.querySelector('#rjkn-dock-play').onclick = function () {
        if (State.running) {
          stopAll();
        } else {
          startExperience();
        }
      };
      dock.querySelector('#rjkn-dock-mute').onclick = function () {
        State.musicMuted = !State.musicMuted;
        MusicEngine.setMuted(State.musicMuted);
        updateDockUi();
      };
    }
  }

  function updateDockUi() {
    if (State.els.ambientBar) {
      const showAmbient = State.isLanding && State.running && (State.voicePhase === 'loading' || State.voicePhase === 'speaking');
      State.els.ambientBar.classList.toggle('is-visible', showAmbient);
    }

    if (!State.els.dock) return;
    State.els.dock.style.display = State.isLanding ? 'flex' : 'none';
    const playBtn = State.els.dock.querySelector('#rjkn-dock-play');
    const iconEl = State.els.dock.querySelector('#rjkn-dock-icon');
    const labelEl = State.els.dock.querySelector('#rjkn-dock-label');
    const muteBtn = State.els.dock.querySelector('#rjkn-dock-mute');
    const muteLabel = State.els.dock.querySelector('#rjkn-mute-label');

    playBtn.classList.remove('is-live', 'is-loading');

    if (State.running) {
      playBtn.classList.add(State.voicePhase === 'loading' ? 'is-loading' : 'is-live');
      iconEl.innerHTML = '<span class="rjkn-eq"><span></span><span></span><span></span></span>';
      labelEl.textContent = State.statusLabel || 'หยุดเสียงเปิดตัว';
      muteBtn.style.display = 'inline-flex';
      muteLabel.textContent = State.musicMuted ? '🔇 เพลง: ปิด' : '🎵 เพลง: เปิด';
    } else {
      iconEl.textContent = '▶';
      labelEl.textContent = 'แนะนำระบบ AI';
      muteBtn.style.display = 'none';
    }
  }

  function showCurtain() {
    if (State.els.curtain) State.els.curtain.classList.remove('is-hidden');
  }

  function hideCurtain() {
    if (State.els.curtain) State.els.curtain.classList.add('is-hidden');
  }

  function triggerLaunchFlash() {
    const flash = document.createElement('div');
    flash.className = 'rjkn-flash';
    document.body.appendChild(flash);
    setTimeout(function () {
      if (flash.parentNode) flash.parentNode.removeChild(flash);
    }, 1250);
  }

  function markSessionSeen() {
    try { sessionStorage.setItem(SESSION_DISMISS_KEY, '1'); } catch (_) {}
  }

  function hasSeenInSession() {
    try { return sessionStorage.getItem(SESSION_DISMISS_KEY) === '1'; } catch (_) { return false; }
  }

  // ==========================================================================
  // 7. DUAL-HOST KEYNOTE SHOW RUNNER (LOOKAHEAD PREFETCH + ZERO BROWSER VOICE)
  // ==========================================================================
  async function startExperience() {
    ensureDomOverlays();
    unlockMobileAudio();
    stopVoiceOnly();

    const sid = State.sessionId;
    State.running = true;
    State.musicMuted = false;
    State.voicePhase = 'loading';
    State.statusLabel = 'กำลังรอเสียง AI สตูดิโอ (1/' + DUAL_HOST_SCRIPT.length + ')...';
    updateDockUi();
    triggerLaunchFlash();

    MusicEngine.setMuted(false);
    MusicEngine.start(74);

    // เริ่มโหลดเสียงช่วงที่ 1 ล่วงหน้าทันทีระหว่างที่เพลงบรรเลงอินโทร 2.2 วินาที
    const firstClipPromise = fetchSegmentAudio(DUAL_HOST_SCRIPT[0], State.appsScriptUrl, sid);
    await new Promise(function (r) { setTimeout(r, 2200); });
    if (State.sessionId !== sid || !State.running) return;

    let nextPromise = firstClipPromise;
    let ducked = false;

    for (let i = 0; i < DUAL_HOST_SCRIPT.length; i++) {
      if (State.sessionId !== sid || !State.running) return;
      const seg = DUAL_HOST_SCRIPT[i];
      const stepTag = (i + 1) + '/' + DUAL_HOST_SCRIPT.length;

      State.voicePhase = 'loading';
      State.statusLabel = 'รอเสียง AI ' + seg.badge + ' (' + stepTag + ')...';
      updateDockUi();

      const blob = await nextPromise;
      if (State.sessionId !== sid || !State.running) return;

      // Lookahead Prefetching: โหลดช่วงถัดไปล่วงหน้าทันทีขณะที่ช่วงนี้กำลังเล่น (รักษาคุณภาพ 24kHz เต็ม 100%)
      if (i + 1 < DUAL_HOST_SCRIPT.length) {
        nextPromise = fetchSegmentAudio(DUAL_HOST_SCRIPT[i + 1], State.appsScriptUrl, sid);
      } else {
        nextPromise = null;
      }

      // ไม่สลับไปใช้เสียงหุ่นยนต์จากเบราว์เซอร์เด็ดขาด หากช่วงใดโหลดไม่สำเร็จให้ข้ามอย่างนุ่มนวล
      if (!blob || blob.size === 0) {
        continue;
      }

      if (!ducked) {
        ducked = true;
        MusicEngine.duckTo(19, 750);
      } else if (i === DUAL_HOST_SCRIPT.length - 2) {
        MusicEngine.duckTo(28, 800);
      }

      State.voicePhase = 'speaking';
      State.statusLabel = seg.badge + ' AI (' + stepTag + ') • หยุด';
      updateDockUi();

      await playBlobOnSharedAudio(blob, sid);

      if (State.sessionId !== sid || !State.running) return;
      if (i + 1 < DUAL_HOST_SCRIPT.length) {
        await new Promise(function (r) { setTimeout(r, 240); });
      }
    }

    if (State.sessionId === sid && State.running) {
      State.voicePhase = 'music_only';
      State.statusLabel = 'หยุดเสียงเปิดตัว';
      updateDockUi();
      MusicEngine.duckTo(65, 900);
      setTimeout(function () {
        if (State.sessionId === sid && State.running) {
          MusicEngine.duckTo(34, 1800);
        }
      }, 4200);
    }
  }

  // ==========================================================================
  // 8. PUBLIC API FOR index.html
  // ==========================================================================
  global.RJCLOUD_KEYNOTE = {
    sync: function (options) {
      const opts = options || {};
      State.appsScriptUrl = opts.appsScriptUrl || State.appsScriptUrl || (global.RJCLOUD_CONFIG && global.RJCLOUD_CONFIG.appsScriptUrl) || '';
      const nowLanding = Boolean(opts.isLanding);
      const isAdminPreview = Boolean(opts.isAdminPreview);

      ensureDomOverlays();
      State.isLanding = nowLanding;

      if (!nowLanding) {
        hideCurtain();
        if (State.running) stopAll();
        updateDockUi();
        return;
      }

      MusicEngine.loadYouTubeApi();
      updateDockUi();

      if (!State.mounted) {
        State.mounted = true;
        if (!isAdminPreview && !hasSeenInSession()) {
          showCurtain();
        }
      }
    },

    startExperience: startExperience,
    stopAll: stopAll,
    openCurtain: function () {
      ensureDomOverlays();
      showCurtain();
    }
  };
})(window);
