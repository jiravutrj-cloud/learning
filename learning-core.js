/* ============================================================================
 * rjcloud.organ — Core Learning, AI Diagnosis, PDPA & Audio Engine (learning-core.js)
 * แยกออกมาจาก index.html ตามแนวทาง Modular Zero-Build (ไฟล์ที่ 3/6 สะอาดพร้อมใช้งาน)
 *
 * โครงสร้างภายในไฟล์ (เผยแพร่ผ่าน window.RJCLOUD_CORE):
 * 1. Configuration & Built-in Fallback Defaults (รองรับการทำงานแม้โหลด data.js ไม่สำเร็จ)
 * 2. Exam Parser & 4-Domain AI Diagnostic Roadmap Engine
 * 3. Role-Adaptive Profile, Study Timer & Thai Date Formatters
 * 4. PDPA Privacy Masking (Pre-OTP) & Zero-PII Executive Telemetry Builder
 * 5. PCM16-to-WAV Audio Converter & IndexedDB Voice Cache
 * ============================================================================ */

(function (global) {
  'use strict';

  // ============================================================================
  // 5. PCM16-TO-WAV AUDIO CONVERTER & INDEXEDDB VOICE CACHE (ANTI-HISS DSP v2)
  // ============================================================================
  const AUDIO_DB_NAME = 'rjcloud_lesson_audio_cache_v2';
  const AUDIO_STORE_NAME = 'clips';
  let audioDbPromise = null;

  /**
   * แปลงเสียง Base64 PCM16 จาก Gemini TTS เป็นไฟล์ WAV พร้อมระบบ DSP ตัดเสียงซ่าท้ายคลิป (Anti-Hiss)
   * และทำ Smooth Cosine Fade-out + เติมความเงียบ 40ms ป้องกันเสียงซ่าและเสียงแป๊ะตอนจบคำพูด
   */
  function pcm16ToWavBlob(base64PCM, sampleRate) {
    const rate = sampleRate || 24000;
    const binaryString = global.atob(base64PCM);
    const rawBytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      rawBytes[i] = binaryString.charCodeAt(i);
    }

    // ข้าม WAV Header (44 ไบต์) หากต้นทางส่งมาแบบห่อ RIFF แล้ว เพื่อกันเสียงป๊อปจากการห่อซ้ำ
    let offsetBytes = 0;
    if (
      rawBytes.length > 44 &&
      rawBytes[0] === 0x52 &&
      rawBytes[1] === 0x49 &&
      rawBytes[2] === 0x46 &&
      rawBytes[3] === 0x46
    ) {
      offsetBytes = 44;
    }

    const sampleCount = Math.floor((rawBytes.length - offsetBytes) / 2);
    if (sampleCount <= 0) return new Blob([], { type: 'audio/wav' });

    const inView = new DataView(rawBytes.buffer, rawBytes.byteOffset + offsetBytes, sampleCount * 2);
    const samples = new Float32Array(sampleCount);
    for (let i = 0; i < sampleCount; i++) {
      samples[i] = inView.getInt16(i * 2, true) / 32768;
    }

    // วิเคราะห์พลังงาน (RMS) และอัตราการตัดแกนศูนย์ (ZCR) ทีละเฟรม 20ms เพื่อตรวจจับเสียงซ่าท้ายคลิป
    const frameSize = Math.max(128, Math.round(rate * 0.02));
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

    // 1. ตัดความเงียบส่วนเกินและเสียงซ่าความถี่สูง (ZCR > 0.22) จากท้ายคลิปย้อนกลับเข้ามา
    let endFrame = numFrames - 1;
    while (endFrame > 12) {
      const rms = frameRms[endFrame];
      const zcr = frameZcr[endFrame];
      if (rms < 0.016 || zcr > 0.22) {
        endFrame--;
      } else {
        break;
      }
    }

    // 2. หากในช่วง 1.6 วินาทีท้ายมีช่วงเงียบ >= 100ms คั่นก่อนก้อนเสียงซ่า (avgZcr > 0.21) ให้ตัดทิ้งก่อนช่วงเงียบนั้น
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
      Math.max(Math.min(sampleCount, Math.round(rate * 0.25)), (endFrame + 1) * frameSize)
    );
    const padZeroSamples = Math.round(rate * 0.045); // เติมความเงียบ 45ms ท้ายคลิปกันลำโพงดังแป๊ะ
    const totalOutSamples = keptSamples + padZeroSamples;
    const outBytesLen = totalOutSamples * 2;

    const fadeInLen = Math.min(Math.round(rate * 0.012), Math.floor(keptSamples * 0.1));
    const fadeOutLen = Math.min(Math.round(rate * 0.075), Math.floor(keptSamples * 0.22));

    const buffer = new ArrayBuffer(44 + outBytesLen);
    const view = new DataView(buffer);
    const writeStr = function (offset, str) {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };
    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + outBytesLen, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, rate, true);
    view.setUint32(28, rate * 2, true);
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

    return new Blob([buffer], { type: 'audio/wav' });
  }

  /**
   * เปิดฐานข้อมูล IndexedDB สำหรับแคชเสียงบรรยายสรุปบทเรียน AI (ช่วยประหยัดโควต้า TTS และเล่นซ้ำทันที)
   */
  function openAudioCacheDb() {
    if (audioDbPromise) return audioDbPromise;
    audioDbPromise = new Promise(function (resolve) {
      if (typeof indexedDB === 'undefined') return resolve(null);
      try {
        const req = indexedDB.open(AUDIO_DB_NAME, 1);
        req.onupgradeneeded = function () {
          const db = req.result;
          if (!db.objectStoreNames.contains(AUDIO_STORE_NAME)) {
            db.createObjectStore(AUDIO_STORE_NAME);
          }
        };
        req.onsuccess = function () {
          resolve(req.result);
        };
        req.onerror = function () {
          resolve(null);
        };
      } catch (_) {
        resolve(null);
      }
    });
    return audioDbPromise;
  }

  /**
   * ดึงไฟล์เสียงจากแคชในเครื่องตามคีย์
   */
  async function getCachedAudio(key) {
    const db = await openAudioCacheDb();
    if (!db) return null;
    return new Promise(function (resolve) {
      try {
        const tx = db.transaction(AUDIO_STORE_NAME, 'readonly');
        const req = tx.objectStore(AUDIO_STORE_NAME).get(key);
        req.onsuccess = function () {
          resolve(req.result || null);
        };
        req.onerror = function () {
          resolve(null);
        };
      } catch (_) {
        resolve(null);
      }
    });
  }

  /**
   * บันทึกไฟล์เสียง WAV ลงแคช IndexedDB บนอุปกรณ์ผู้เรียน
   */
  async function setCachedAudio(key, blob) {
    if (!blob) return;
    const db = await openAudioCacheDb();
    if (!db) return;
    return new Promise(function (resolve) {
      try {
        const tx = db.transaction(AUDIO_STORE_NAME, 'readwrite');
        tx.objectStore(AUDIO_STORE_NAME).put(blob, key);
        tx.oncomplete = function () {
          resolve();
        };
        tx.onerror = function () {
          resolve();
        };
      } catch (_) {
        resolve();
      }
    });
  }

  // ============================================================================
  // 6. EXPORT PUBLIC API TO window.RJCLOUD_CORE
  // ============================================================================
  global.RJCLOUD_CORE = {
    BUILTIN_CONFIG: BUILTIN_CONFIG,
    getResolvedConfig: getResolvedConfig,
    DEFAULT_CERT_TEMPLATE: DEFAULT_CERT_TEMPLATE,
    DEFAULT_CNEU_CONFIG: DEFAULT_CNEU_CONFIG,
    CLINICAL_DOMAINS: CLINICAL_DOMAINS,
    HOSPITAL_MAPPING: HOSPITAL_MAPPING,
    FALLBACK_LESSONS: FALLBACK_LESSONS,
    FALLBACK_QUIZ_RAW: FALLBACK_QUIZ_RAW,
    ROLE_ADAPTIVE_PROFILES: ROLE_ADAPTIVE_PROFILES,
    CLINICAL_CASE_SIMULATIONS: CLINICAL_CASE_SIMULATIONS,
    SPACED_FLASHCARDS: SPACED_FLASHCARDS,
    PRE_APPROACH_TAGS: PRE_APPROACH_TAGS,
    CSAT_RATING_LABELS: CSAT_RATING_LABELS,
    CNEU_EVAL_CRITERIA: CNEU_EVAL_CRITERIA,

    parseRawExams: parseRawExams,
    normalizeQuestionSets: normalizeQuestionSets,
    computeDomainDiagnosis: computeDomainDiagnosis,
    parsePosttestPercent: parsePosttestPercent,

    resolveRoleProfile: resolveRoleProfile,
    getTargetHoursForUser: getTargetHoursForUser,
    formatStudyTime: formatStudyTime,
    formatThaiDate: formatThaiDate,

    maskEmail: maskEmail,
    maskPhone: maskPhone,
    resolveRegionId: resolveRegionId,
    buildAnonTelemetryId: buildAnonTelemetryId,
    buildExecutiveTelemetryPayload: buildExecutiveTelemetryPayload,

    pcm16ToWavBlob: pcm16ToWavBlob,
    openAudioCacheDb: openAudioCacheDb,
    getCachedAudio: getCachedAudio,
    setCachedAudio: setCachedAudio
  };
})(window);
