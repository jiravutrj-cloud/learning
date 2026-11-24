/**
 * ============================================================================
 * rjcloud.organ 2.0 — AI Skill Lab 3D Engine (skilllab-engine.js • Set 1 + Set 2 Complete)
 * โมดูลกลางแบบ Zero-Build เผยแพร่ผ่าน window.RJCLOUD_SKILLLAB
 *
 * ความสามารถครบชุดภายในไฟล์เดียว:
 * 1. Emotion & Dual Radar Metadata:
 *    - เรดาร์ 5 แกนสำหรับเคสสื่อสารกับญาติ (เคส 1–5)
 *    - เรดาร์ 5 แกนเฉพาะทาง SBAR สำหรับเคสส่งเวรแพทย์เวร ICU (เคส 6)
 * 2. 6 Clinical Personas + แนวทางคำพูด 2 ภาษา (TH / EN) ครบทุกเคส
 * 3. Context-Aware 3D Anime Human Hologram Renderer (Three.js r128 • Zero-Cost):
 *    - ปรับเพศ ทรงผม อายุ และจำนวนตัวละครอัตโนมัติ (เคส 3 แสดง ภรรยา + คุณแม่ พร้อมกัน 2 คน)
 *    - Real Audio-Amplitude Lip-Sync: ขยับปากตรงตามคลื่นเสียง Gemini 24kHz จริงผ่าน Web Audio API
 * 4. Realism #1: 3 Hidden Barriers per Case + Adaptive Hint เจาะปมที่เหลือ + Emotional Inertia Trust
 * 5. Realism #2: Hard Mode Curveballs แยกตามบริบท (เคสญาติ: สายพี่ชายแทรก/สะอื้นเงียบ | เคส 6 SBAR: สัญญาณเตือน BP ตกวิกฤต 64/40 + เคสฉุกเฉินแทรก)
 * 6. Realism #3: Targeted 4-Stage Micro-Drill Gauntlet & Instant Evaluator
 * 7. Realism #4 (0 THB): Vocal Tone Monitor (Web Audio API) + RAM-Only Audio Replay + Audio Lip-Sync Analyser
 * 8. Profession-Aware AI Lab Advisor v4: แนะนำเคสตรงตาม 3 กลุ่มวิชาชีพ (พยาบาล / แพทย์ / สหวิชาชีพ)
 * 9. Export Skill Lab Debrief Card (PNG 1200x1500): บันทึกใบสรุปผลเรดาร์ 5 แกน + ประโยคทอง + เหรียญตรา
 * 10. Research R2R (0 THB): Pre/Post Self-Efficacy + SUS Score + Blind Transcript + Web Audio ICU/Room SFX
 * ============================================================================
 */
(function (global) {
  'use strict';

  // ==========================================================================
  // 1. EMOTIONS & CONTEXT-AWARE RADAR AXES (FAMILY APPROACH vs. SBAR ICU)
  // ==========================================================================
  const EMOTIONS = {
    SHOCK: {
      id: 'SHOCK',
      labelTH: 'ช็อก / ตกใจ',
      labelEN: 'Shocked',
      colorHex: '#fb7185',
      c1: 0xfb7185,
      c2: 0xf43f5e,
      baseTrust: 24,
      speed: 1.45,
      bloom: 0.18,
      tension: 0.92,
      browY: 0.062,
      browTilt: 0.18,
      eyeOpen: 1.22,
      mouthCurve: -0.022,
      mouthBaseOpen: 0.052,
      headPitch: -0.05,
      headRoll: 0.03,
      tear: 0.45,
      ttsStyleTH: 'พูดภาษาไทยด้วยน้ำเสียงตกใจ ช็อก หายใจถี่และสั่นเครือเหมือนเพิ่งได้รับข่าวร้ายกะทันหัน',
      ttsStyleEN: 'Speak in a shocked, breathless, trembling voice as if receiving sudden devastating news'
    },
    CONFUSED: {
      id: 'CONFUSED',
      labelTH: 'สับสน / ไม่เข้าใจ',
      labelEN: 'Confused',
      colorHex: '#38bdf8',
      c1: 0x38bdf8,
      c2: 0x818cf8,
      baseTrust: 38,
      speed: 0.95,
      bloom: 0.42,
      tension: 0.65,
      browY: 0.015,
      browTilt: 0.10,
      eyeOpen: 1.00,
      mouthCurve: -0.010,
      mouthBaseOpen: 0.008,
      headPitch: 0.02,
      headRoll: 0.10,
      tear: 0.0,
      ttsStyleTH: 'พูดภาษาไทยด้วยน้ำเสียงสับสน กังวลใจ ลังเลและอยากได้คำอธิบายที่ชัดเจน',
      ttsStyleEN: 'Speak in a confused, anxious, questioning tone seeking clarity'
    },
    ANGRY: {
      id: 'ANGRY',
      labelTH: 'ตึงเครียด / คัดค้าน',
      labelEN: 'Tense / Defensive',
      colorHex: '#fb923c',
      c1: 0xf43f5e,
      c2: 0xfb923c,
      baseTrust: 20,
      speed: 1.55,
      bloom: 0.12,
      tension: 1.0,
      browY: -0.038,
      browTilt: -0.30,
      eyeOpen: 0.78,
      mouthCurve: -0.032,
      mouthBaseOpen: 0.008,
      headPitch: 0.06,
      headRoll: -0.04,
      tear: 0.0,
      ttsStyleTH: 'พูดภาษาไทยด้วยน้ำเสียงตึงเครียด แข็งกร้าว ปกป้องคนรัก และมีความระแวง',
      ttsStyleEN: 'Speak in a tense, defensive, firm, and skeptical tone protecting a loved one'
    },
    SAD: {
      id: 'SAD',
      labelTH: 'โศกเศร้า / ร้องไห้',
      labelEN: 'Grieving',
      colorHex: '#c084fc',
      c1: 0x818cf8,
      c2: 0xc084fc,
      baseTrust: 52,
      speed: 0.68,
      bloom: 0.54,
      tension: 0.48,
      browY: 0.022,
      browTilt: 0.32,
      eyeOpen: 0.80,
      mouthCurve: -0.034,
      mouthBaseOpen: 0.006,
      headPitch: 0.13,
      headRoll: -0.06,
      tear: 1.0,
      ttsStyleTH: 'พูดภาษาไทยด้วยน้ำเสียงแผ่วเบา โศกเศร้า สะอื้นเล็กน้อยด้วยความอาลัยรัก',
      ttsStyleEN: 'Speak softly in a deeply grieving, tearful, tender tone'
    },
    HESITANT: {
      id: 'HESITANT',
      labelTH: 'ลังเล / ครุ่นคิด',
      labelEN: 'Hesitant',
      colorHex: '#fbbf24',
      c1: 0xfbbf24,
      c2: 0x38bdf8,
      baseTrust: 64,
      speed: 0.82,
      bloom: 0.66,
      tension: 0.5,
      browY: 0.004,
      browTilt: 0.06,
      eyeOpen: 0.94,
      mouthCurve: -0.004,
      mouthBaseOpen: 0.004,
      headPitch: 0.04,
      headRoll: 0.06,
      tear: 0.0,
      ttsStyleTH: 'พูดภาษาไทยด้วยน้ำเสียงนุ่มลงแต่ยังลังเล ครุ่นคิดและชั่งน้ำหนักในใจ',
      ttsStyleEN: 'Speak in a softer, thoughtful, hesitant tone weighing a difficult decision'
    },
    CALM: {
      id: 'CALM',
      labelTH: 'สงบ / เปิดใจรับฟัง',
      labelEN: 'Calm & Open',
      colorHex: '#34d399',
      c1: 0x34d399,
      c2: 0x22d3ee,
      baseTrust: 88,
      speed: 0.6,
      bloom: 1.0,
      tension: 0.1,
      browY: 0.026,
      browTilt: 0.04,
      eyeOpen: 1.04,
      mouthCurve: 0.044,
      mouthBaseOpen: 0.004,
      headPitch: -0.01,
      headRoll: 0.02,
      tear: 0.0,
      ttsStyleTH: 'พูดภาษาไทยด้วยน้ำเสียงสงบ อ่อนโยน ผ่อนคลาย และรู้สึกไว้วางใจผู้สนทนา',
      ttsStyleEN: 'Speak calmly, gently, and warmly with growing trust'
    }
  };

  // เรดาร์ 5 แกนสำหรับเคสสื่อสารกับครอบครัวผู้ป่วย (เคส 1–5)
  const RADAR_AXES = [
    { key: 'setting', labelTH: 'ห้องรับรอง & บทบาท', shortTH: 'ห้องรับรอง', labelEN: 'Setting & Role' },
    { key: 'empathy', labelTH: 'รับรู้อารมณ์ร่วม', shortTH: 'อารมณ์ร่วม', labelEN: 'Empathy' },
    { key: 'clarity', labelTH: 'ข้อมูลภาวะสมองตาย', shortTH: 'ข้อมูลคลินิก', labelEN: 'Clinical Clarity' },
    { key: 'vocal', labelTH: 'น้ำเสียง & ความเงียบ', shortTH: 'ความเงียบ 2.5 วิ', labelEN: 'Silence & Pace' },
    { key: 'dignity', labelTH: 'ไม่เร่งรัด & เกียรติร่าง', shortTH: 'ให้เกียรติร่าง', labelEN: 'Zero Pressure' }
  ];

  // เรดาร์ 5 แกนเฉพาะเคส 6: ส่งเวร SBAR กับแพทย์เวร ICU (คง key เดิมเพื่อให้ซิงค์กับ Dashboard 13 เขตได้ 100%)
  const SBAR_RADAR_AXES = [
    { key: 'setting', labelTH: 'S: สถานการณ์ & ตัวตนเคส', shortTH: 'S: สถานการณ์', labelEN: 'S: Situation' },
    { key: 'empathy', labelTH: 'B: ประวัติ & ตรวจร่างกาย', shortTH: 'B: ประวัติ TBI', labelEN: 'B: Background' },
    { key: 'clarity', labelTH: 'A: ประเมิน Donor & DI', shortTH: 'A: ประเมิน DI', labelEN: 'A: Assessment' },
    { key: 'vocal', labelTH: 'ความกระชับ & สื่อสารทีม', shortTH: 'กระชับแม่นยำ', labelEN: 'Concise Team Comm' },
    { key: 'dignity', labelTH: 'R: แผนพยุงชีพ & DDAVP/ODC', shortTH: 'R: แผนรักษา', labelEN: 'R: Recommendation' }
  ];

  function getRadarAxes(personaId) {
    return personaId === 'sbar_doctor' ? SBAR_RADAR_AXES : RADAR_AXES;
  }

  // ==========================================================================
  // 2. CLINICAL PERSONAS, MULTI-VOICE CAST, ICU BRIEFS & BILINGUAL QUICK REPLIES
  // ==========================================================================
  const FALLBACK_PERSONAS = [
    {
      id: 'standard',
      icon: 'HeartPulse',
      accent: '#38bdf8',
      titleTH: '1. ญาติสับสนเรื่องภาวะสมองตาย (เคสคุณพ่อ)',
      titleEN: '1. Brain Death & Ventilator Confusion (Father)',
      tagTH: 'มาตรฐาน • 1 ตัวละครหญิง',
      tagEN: 'Standard',
      patientRoleTH: 'คุณพ่อ (อายุ 52 ปี อุบัติเหตุทางศีรษะ TBI)',
      speakerRoleTH: 'คุณแพรว (ลูกสาวของผู้ป่วย • หญิง)',
      descTH: 'ลูกสาวเห็นหน้าอกคุณพ่อยังขยับและตัวอุ่นจากเครื่องช่วยหายใจ จึงยังเชื่อไม่ได้ว่าสมองตายถาวร',
      descEN: 'Daughter sees chest movement from ventilator support and struggles to understand brain death.',
      openingEmotion: 'CONFUSED',
      openingActionTH: 'ก้มมองมือตัวเองที่สั่นเล็กน้อย ก่อนเงยหน้าขึ้นสบตาด้วยแววตาสับสน',
      openingActionEN: 'Looks down at her trembling hands before looking up with tearful confusion.',
      openingTH: 'สวัสดีค่ะ... ขอบคุณที่พาหนูเข้ามานั่งคุยในที่เงียบๆ นะคะ แต่ตอนนี้ใจคอไม่ดีเลย เมื่อกี้เพิ่งไปจับมือคุณพ่อ ตัวพ่อก็ยังอุ่น หน้าอกก็ยังขยับอยู่เลย ตกลงอาการของคุณพ่อเป็นยังไงกันแน่คะ?',
      openingEN: 'Hello... Thank you for bringing me into this quiet room. I just held my father’s hand—it still felt warm and his chest is rising. What is really happening to my dad?',
      briefingTH: 'ผู้ป่วยคือ คุณพ่อ (อายุ 52 ปี TBI) แพทย์ตรวจยืนยันภาวะสมองตายครบ 2 ครั้งแล้ว คุณกำลังพูดคุยกับคุณแพรว (ลูกสาว) ในห้องรับรองส่วนตัว',
      briefingEN: 'Patient is a 52-year-old father confirmed brain dead. You are speaking privately with his daughter.',
      promptHintTH: 'ล็อกตัวละคร: ผู้ป่วยคือคุณพ่อ และคุณคือลูกสาว (คุณแพรว) แทนตัวว่าหนู เน้นความสับสนระหว่างเครื่องช่วยหายใจกับภาวะสมองตายถาวร'
    },
    {
      id: 'belief',
      icon: 'Sparkles',
      accent: '#fbbf24',
      titleTH: '2. ความเชื่อ ศาสนา และพิธีกรรม (เคสน้องชาย)',
      titleEN: '2. Cultural Beliefs & Funeral Rites (Brother)',
      tagTH: 'บริบทไทย • 1 ตัวละครหญิง',
      tagEN: 'Cultural',
      patientRoleTH: 'น้องชาย (อายุ 28 ปี อุบัติเหตุจราจร)',
      speakerRoleTH: 'คุณฝน (พี่สาว — กังวลแทนคุณยาย • หญิง)',
      descTH: 'พี่สาวกังวลแทนคุณยายว่าหากบริจาคอวัยวะของน้องชายแล้วชาติหน้าอวัยวะจะไม่ครบ หรือทำพิธีศาสนาไม่ได้',
      descEN: 'Older sister worries on behalf of their grandmother about spiritual wholeness and funeral rites.',
      openingEmotion: 'HESITANT',
      openingActionTH: 'กำกระดาษทิชชูไว้แน่น ถอนหายใจเบาๆ ด้วยความกังวลใจ',
      openingActionEN: 'Holds a tissue tightly and sighs with heavy hesitation.',
      openingTH: 'สวัสดีค่ะ... พอคุณหมอแจ้งข่าวน้องชาย ใจหนูมันหวิวไปหมดเลยค่ะ แต่ที่บ้านคุณยายท่านเคร่งเรื่องความเชื่อมาก ท่านกลัวว่าถ้าบริจาคอวัยวะ ร่างของน้องชายจะไม่ครบ 32 ชาติหน้าจะลำบาก แล้วจะทำพิธีทางศาสนาได้ตามปกติไหมคะ?',
      openingEN: 'Hello... After hearing the news about my younger brother, I feel numb. Our grandmother fears that donating his organs means he won’t be whole spiritually or ready for our funeral ceremony.',
      briefingTH: 'ผู้ป่วยคือ น้องชาย (อายุ 28 ปี) คุณกำลังคุยกับคุณฝน (พี่สาว) ที่กังวลความเชื่อของคุณยายเรื่องชาติหน้าไม่ครบ 32 และพิธีกรรมศาสนา',
      briefingEN: 'Patient is a 28-year-old younger brother. His sister worries about their grandmother’s spiritual beliefs.',
      promptHintTH: 'ล็อกตัวละคร: ผู้ป่วยคือน้องชาย คุณคือพี่สาว (คุณฝน) ที่ห่วงความรู้สึกคุณยาย (คุณยายยังมีชีวิตอยู่)'
    },
    {
      id: 'conflict',
      icon: 'Users',
      accent: '#f43f5e',
      titleTH: '3. ความขัดแย้งในครอบครัว 2 เสียง (เคสคุณต้น)',
      titleEN: '3. Family Conflict — Two Voices (Husband/Son)',
      tagTH: '2 ตัวละครหญิงในห้อง',
      tagEN: 'Dual Character',
      patientRoleTH: 'คุณต้น (อายุ 36 ปี เลือดออกในสมอง)',
      speakerRoleTH: 'ภรรยา และ คุณแม่ของผู้ป่วย (2 ตัวละครหญิง)',
      descTH: 'ภรรยาอยากทำตามบัตรบริจาคของคุณต้น แต่คุณแม่คัดค้านอย่างรุนแรง ฝึกวางตัวเป็นกลางไม่ฝืนใจครอบครัว',
      descEN: 'Wife wants to honor her husband’s donor card while his mother strongly objects.',
      openingEmotion: 'ANGRY',
      openingActionTH: 'ภรรยามองด้วยแววตาขอความช่วยเหลือ ขณะที่คุณแม่กอดอกแน่นและเสียงสั่นเครือด้วยความเจ็บปวด',
      openingActionEN: 'The wife glances pleadingly while the mother crosses her arms tightly, voice trembling.',
      openingTH: '[ภรรยา]: หนูจำได้ว่าพี่ต้นเคยทำบัตรบริจาคอวัยวะไว้ค่ะ อยากทำให้เป็นบุญครั้งสุดท้ายของพี่เขา... [คุณแม่]: แม่ไม่ยอมนะ! ต้นลูกแม่เจ็บมามากพอแล้ว ใครอย่ามาแตะตัวลูกแม่เด็ดขาด! ตกลงจะเอาตามบัตรหรือเอาตามใจแม่คะ?',
      openingEN: '[Wife]: He signed a donor card—I want to honor my husband’s last wish... [Mother]: No! My son has suffered enough! Don’t let anyone touch him! Who gets to decide here?!',
      briefingTH: 'ผู้ป่วยคือ คุณต้น (อายุ 36 ปี) ในห้องมีทั้งภรรยาและคุณแม่ ยึดหลักจริยธรรมไทย: วางตัวเป็นกลาง ไม่ฝืนใจญาติสายตรง และดูแลสายสัมพันธ์ครอบครัว',
      briefingEN: 'Both wife and mother are in the room with opposing wishes. Stay neutral and never coerce.',
      promptHintTH: 'ล็อกตัวละคร 2 เสียง: ใช้แท็ก [ภรรยา]: และ [คุณแม่]: ชัดเจนในคำตอบเสมอ ผู้ป่วยคือคุณต้น (สามี/ลูกชาย)'
    },
    {
      id: 'distrust',
      icon: 'ShieldAlert',
      accent: '#c084fc',
      titleTH: '4. ญาติระแวงระบบและกลัวค่าใช้จ่าย (เคสคุณแม่)',
      titleEN: '4. System Distrust & Cost Concerns (Mother)',
      tagTH: 'โปร่งใส ODC • 1 ตัวละครหญิง',
      tagEN: 'Transparency',
      patientRoleTH: 'คุณแม่ (อายุ 58 ปี หลอดเลือดสมองแตก)',
      speakerRoleTH: 'คุณนุช (ลูกสาวของผู้ป่วย • หญิง)',
      descTH: 'ลูกสาวระแวงเรื่องการลัดคิวให้คนรวย การซื้อขายอวัยวะ และกลัวครอบครัวต้องจ่ายค่าห้อง ICU เพิ่ม',
      descEN: 'Daughter suspects queue-jumping for wealthy patients or extra ICU costs.',
      openingEmotion: 'ANGRY',
      openingActionTH: 'เอนตัวมาข้างหน้าเล็กน้อย จ้องมองอย่างระแวดระวังและตั้งคำถามตรงไปตรงมา',
      openingActionEN: 'Leans forward cautiously, watching closely with guarded skepticism.',
      openingTH: 'ขอถามตรงๆ เลยนะคะ... ที่มาคุยเรื่องคุณแม่แบบนี้ เพราะจะเอาอวัยวะไปให้คนรวยที่จ่ายเงินลัดคิวใช่ไหมคะ? แล้วถ้าต้องยืดเครื่องช่วยหายใจรอผ่าตัด ครอบครัวเราต้องมารับผิดชอบค่าใช้จ่ายของคุณแม่เพิ่มอีกหรือเปล่าคะ?',
      openingEN: 'Let me ask bluntly... Are you bringing this up so wealthy people can buy organs and jump the queue? And will our family be billed for extra ICU hours?',
      briefingTH: 'ผู้ป่วยคือ คุณแม่ (อายุ 58 ปี) คุณกำลังคุยกับคุณนุช (ลูกสาว) ที่ระแวงระบบจัดสรรอวัยวะและกลัวค่าใช้จ่ายเพิ่มเติม',
      briefingEN: 'Patient is a 58-year-old mother. Her daughter doubts allocation fairness and fears extra bills.',
      promptHintTH: 'ล็อกตัวละคร: ผู้ป่วยคือคุณแม่ และคุณคือลูกสาว (คุณนุช) อ่อนลงเมื่อผู้เรียนอธิบายระบบคอมพิวเตอร์ ODC สภากาชาดไทยอย่างใจเย็นและยืนยันไม่มีค่าใช้จ่าย'
    },
    {
      id: 'pediatric',
      icon: 'Baby',
      accent: '#f472b6',
      titleTH: '5. พ่อแม่ผู้ป่วยเด็ก/วัยรุ่น (เคสน้องต้นกล้า)',
      titleEN: '5. Pediatric Donor — Grieving Parents (14yo Son)',
      tagTH: 'อ่อนไหวสูงสุด • คุณแม่ (หญิง)',
      tagEN: 'Pediatric',
      patientRoleTH: 'น้องต้นกล้า (อายุ 14 ปี อุบัติเหตุจักรยานยนต์ TBI)',
      speakerRoleTH: 'คุณแม่น้องต้นกล้า (อารมณ์ช็อกและอาลัยรุนแรง • หญิง)',
      descTH: 'เคสผู้ป่วยเยาวชนอายุ 14 ปี ที่คุณแม่เพิ่งสูญเสียกะทันหัน ฝึกการปลอบประโลมความโศกเศร้ารุนแรงและการเว้นความเงียบเยียวยา',
      descEN: 'Sudden loss of a 14-year-old boy; practice deep bereavement support, pacing, and gentle pediatric family communication.',
      openingEmotion: 'SHOCK',
      openingActionTH: 'กอดกระเป๋านักเรียนของลูกไว้แนบอก น้ำตาไหลไม่หยุด มือสั่นและหายใจสะอื้นถี่',
      openingActionEN: 'Hugs her son’s schoolbag tightly, weeping uncontrollably with trembling hands.',
      openingTH: 'ไม่จริงใช่ไหมคะ... เมื่อเช้านี้ลูกยังยิ้มโบกมือไปโรงเรียนอยู่เลย น้องต้นกล้าเพิ่งอายุ 14 เองค่ะ ทำไมคุณหมอบอกว่าสมองน้องไม่ทำงานแล้ว แม่รับไม่ได้จริงๆ ค่ะ มันเร็วเกินไป...',
      openingEN: 'This cannot be real... He was just smiling and waving goodbye for school this morning. He is only 14! Why did the doctor say his brain has stopped working? I cannot bear this...',
      briefingTH: 'ผู้ป่วยคือ น้องต้นกล้า (เด็กชายอายุ 14 ปี อุบัติเหตุจราจร) แพทย์ยืนยันภาวะสมองตายตามเกณฑ์เด็กแล้ว คุณแม่กำลังช็อกอย่างรุนแรง เน้นการประคับประคองใจ หลัก Decoupling และการเว้นความเงียบ 2.5 วิ',
      briefingEN: 'Patient is a 14-year-old boy confirmed brain dead. His mother is in acute shock. Prioritize bereavement presence, silence, and zero rush.',
      promptHintTH: 'ล็อกตัวละคร: ผู้ป่วยคือลูกชายอายุ 14 ปีชื่อน้องต้นกล้า และคุณคือคุณแม่ที่กำลังช็อกและโศกเศร้าอย่างมาก ห้ามรีบพูดเรื่องบริจาคจนกว่าผู้เรียนจะปลอบโยนรับฟังอารมณ์และเว้นพื้นที่ให้หายใจก่อน'
    },
    {
      id: 'sbar_doctor',
      icon: 'Stethoscope',
      accent: '#2dd4bf',
      titleTH: '6. ส่งเวร SBAR แพทย์เวร ICU (Potential Donor)',
      titleEN: '6. ICU SBAR Handoff with Attending Physician',
      tagTH: 'ทีมสหสาขา SBAR • แพทย์ชาย',
      tagEN: 'SBAR Team',
      patientRoleTH: 'ผู้ป่วยชาย 38 ปี TBI • GCS 3 • BP 78/46 • UO 640 mL/hr',
      speakerRoleTH: 'นพ.ภาคิน (แพทย์เวร ICU • ชาย)',
      descTH: 'ฝึกการรายงานเคส Potential Donor แบบ SBAR กับแพทย์เวร ICU เมื่อพบ GCS = 3, ความดันตก และปัสสาวะออกมาก (สงสัยเบาจืด DI)',
      descEN: 'Practice concise SBAR clinical handoff with the ICU physician for an unstable potential donor (GCS 3, hypotension, polyuria/DI).',
      openingEmotion: 'CONFUSED',
      openingActionTH: 'ยืนดูจอ Monitor ข้างเตียง ICU ด้วยสีหน้าเร่งรีบ พร้อมฟังรายงานแบบ SBAR จากพยาบาล',
      openingActionEN: 'Glances intently at the ICU bedside monitor, asking for a structured SBAR summary.',
      openingTH: 'ครับคุณพยาบาล ตอนนี้เคสเตียง 3 ยุ่งมากเลย ขอรายงานเคสเตียง 1 แบบ SBAR กระชับๆ เลยครับ สถานการณ์ตอนนี้เป็นยังไง สัญญาณชีพกับปัสสาวะเป็นยังไงบ้าง แล้วคุณพยาบาลประเมินและเสนอให้จัดการอะไรเร่งด่วนครับ?',
      openingEN: 'Nurse, things are very busy in ICU right now. Please give me a concise SBAR on Bed 1—what is the situation, current vitals and urine output, and what urgent management do you recommend?',
      briefingTH: 'ผู้ป่วยชาย 38 ปี อุบัติเหตุทางศีรษะ (TBI) คะแนน GCS = 3 (E1V1M1) ม่านตาขยายคงที่ 6 มม. BP 78/46 mmHg, HR 116, ปัสสาวะใสออก 640 mL/hr, Na 154 mEq/L — ฝึกสื่อสาร SBAR ให้ครบ S-B-A-R เพื่อพยุงอวัยวะ (Fluid/Vasopressor + DDAVP) และวางแผนประเมินสมองตาย',
      briefingEN: '38yo male TBI, GCS 3, BP 78/46, HR 116, UO 640 mL/hr, Na 154. Deliver a crisp SBAR recommending hemodynamic support, DDAVP for DI, and formal brain death evaluation.',
      promptHintTH: 'ล็อกตัวละคร: คุณคือ นพ.ภาคิน แพทย์เวร ICU ที่ยุ่งและต้องการรายงานแบบ SBAR ที่แม่นยำ ชัดเจน กระชับ (S: ผู้ป่วยชาย 38 ปี GCS 3, B: TBI, A: เข้าข่าย Potential Donor + Hypotension + สงสัยเบาจืด DI, R: เสนอให้สารน้ำ/ยากระตุ้นความดัน, DDAVP, เตรียมตรวจสมองตาย 2 ครั้งห่าง 6 ชม. และประสาน ODC) ให้ซักถามต่อหากผู้เรียนยังรายงานไม่ครบองค์ประกอบ SBAR'
    }
  ];

  const CASE_ICU_BRIEFS = {
    standard: {
      ward: 'Neuro ICU เตียง 4',
      patient: 'ชาย อายุ 52 ปี (คุณพ่อ)',
      diagnosis: 'Severe TBI • GCS E1V1M1 (3)',
      brainDeath: 'ยืนยันครบ 2 ครั้ง ห่าง 6 ชม. โดยแพทย์ 3 ท่าน (Apnea Test +)',
      vitals: 'BP 108/66 • HR 84 • SpO₂ 99% (On Ventilator)',
      handoffNote: 'คุณแพรว (ลูกสาว) เพิ่งเข้าไปจับมือคุณพ่อ เห็นตัวอุ่นและหน้าอกขยับจึงยังสับสนมาก พยาบาลเวรเชิญมานั่งรอในห้องรับรองส่วนตัวแล้ว'
    },
    belief: {
      ward: 'Surgical ICU เตียง 2',
      patient: 'ชาย อายุ 28 ปี (น้องชาย)',
      diagnosis: 'Traffic Accident • Brain Death Confirmed',
      brainDeath: 'แพทย์แจ้งข่าวภาวะสมองตายเรียบร้อยแล้ว ญาติรับทราบเบื้องต้น',
      vitals: 'BP 110/68 • HR 88 • UO 130 mL/hr (Stable)',
      handoffNote: 'คุณฝน (พี่สาว) รออยู่ในห้องรับรอง ดูสงบแต่กังวลมากเรื่องความเชื่อของคุณยายที่บ้านว่าชาติหน้าจะไม่ครบ 32 และกลัวทำพิธีศาสนาไม่ได้'
    },
    conflict: {
      ward: 'Medical ICU เตียง 7',
      patient: 'ชาย อายุ 36 ปี (คุณต้น)',
      diagnosis: 'Massive ICH • Brain Death Confirmed',
      brainDeath: 'ยืนยันภาวะสมองตายตามกฎหมายแล้ว • ผู้ป่วยพกบัตรแสดงความจำนง ODC',
      vitals: 'BP 104/62 • HR 92 • On DDAVP (Stable)',
      handoffNote: 'ในห้องมีญาติ 2 ท่าน: ภรรยาอยากทำตามบัตรบริจาคของคุณต้น แต่คุณแม่ร้องไห้คัดค้านรุนแรง บรรยากาศตึงเครียดมาก'
    },
    distrust: {
      ward: 'Stroke ICU เตียง 5',
      patient: 'หญิง อายุ 58 ปี (คุณแม่)',
      diagnosis: 'Hemorrhagic Stroke • Brain Death Confirmed',
      brainDeath: 'แพทย์ยืนยันภาวะสมองตายครบเกณฑ์แล้ว',
      vitals: 'BP 112/70 • HR 78 • On Ventilator',
      handoffNote: 'คุณนุช (ลูกสาว) เคยได้ยินข่าวลือเรื่องการลัดคิวและค่าใช้จ่ายห้อง ICU มีท่าทีระแวดระวังสูง ต้องการคำอธิบายที่โปร่งใสและใจเย็น'
    },
    pediatric: {
      ward: 'Pediatric ICU เตียง 1',
      patient: 'เด็กชาย อายุ 14 ปี (น้องต้นกล้า)',
      diagnosis: 'Severe TBI from RTA • Pediatric Brain Death Confirmed',
      brainDeath: 'แพทย์กุมารเวชศาสตร์และทีมผู้เชี่ยวชาญยืนยันภาวะสมองตายตามเกณฑ์เด็กครบถ้วนแล้ว',
      vitals: 'BP 98/60 • HR 96 • SpO₂ 100% (On Ventilator)',
      handoffNote: 'คุณแม่เพิ่งรับทราบข่าวและช็อกมาก กอดกระเป๋านักเรียนของลูกไว้แน่น ควรเน้นการประคับประคองความรู้สึก เว้นความเงียบเยียวยา และแยกช่วงแจ้งข่าวออกจากการพูดถึงการบริจาค (Decoupling)'
    },
    sbar_doctor: {
      ward: 'Trauma ICU เตียง 1 (SBAR Handoff)',
      patient: 'ชาย อายุ 38 ปี (Severe TBI • Potential Donor)',
      diagnosis: 'GCS E1V1M1 (3) • Fixed Dilated Pupils 6 mm • สงสัย Diabetes Insipidus',
      brainDeath: 'ยังไม่เริ่มตรวจยืนยันสมองตายอย่างเป็นทางการ — ต้องพยุงสัญญาณชีพก่อน',
      vitals: 'BP 78/46 mmHg • HR 116 • UO 640 mL/hr (ใสมาก) • Na 154 mEq/L',
      handoffNote: 'ภารกิจ SBAR: รายงาน นพ.ภาคิน ให้ครบ S (Situation), B (Background), A (Assessment: Potential Donor + Hypotension + DI) และ R (Recommendation: พยุงความดัน, พิจารณา DDAVP, เตรียมประเมินสมองตายและประสานทีม TC/ODC)'
    }
  };

  // แนวทางคำพูดด่วน 2 ภาษา (TH & EN) ครบทั้ง 6 เคส (แก้ช่องโหว่ Roleplay EN เห็นคำพูดไทย)
  const COACH_QUICK_REPLIES = {
    th: {
      standard: [
        'ขอแสดงความเสียใจอย่างสุดซึ้งนะคะ ดิฉันเป็นพยาบาลผู้ประสานงาน เข้าใจว่าตอนนี้ใจยังหนักมาก ที่เห็นหน้าอกคุณพ่อขยับเกิดจากเครื่องช่วยหายใจที่เป่าลมแทน ส่วนก้านสมองหยุดทำงานถาวรซึ่งแพทย์ 3 ท่านตรวจยืนยันครบ 2 ครั้งแล้วค่ะ',
        'ไม่ต้องรีบตัดสินใจอะไรเลยนะคะ เราให้เวลาครอบครัวค่อยๆ ปรึกษากันอย่างเต็มที่ และทีมแพทย์จะดูแลตกแต่งร่างคุณพ่ออย่างเรียบร้อยสมเกียรติที่สุดค่ะ'
      ],
      belief: [
        'เข้าใจความห่วงใยของคุณยายมากค่ะ เราเคารพความเชื่อของครอบครัวเสมอ ในทางศาสนาการมอบอวัยวะช่วยต่อชีวิตผู้อื่นคือทานบารมีอันยิ่งใหญ่ค่ะ',
        'ทีมศัลยแพทย์จะดูแลตกแต่งร่างน้องชายให้เรียบร้อยสมบูรณ์ทุกประการ สามารถแต่งตัวและประกอบพิธีทางศาสนาได้ตามปกติเลยค่ะ'
      ],
      conflict: [
        'สัมผัสได้ถึงความรักที่ทั้งภรรยาและคุณแม่มีให้คุณต้นมากค่ะ ดิฉันเข้าใจทั้งความตั้งใจของภรรยาและความเจ็บปวดของคุณแม่เลยค่ะ',
        'ตามหลักจริยธรรมไทยเราจะไม่ฝืนใจคุณแม่เด็ดขาดแม้มีบัตรจำนงค่ะ เพราะสายสัมพันธ์ครอบครัวสำคัญที่สุด ขอให้ทั้งสองท่านมีเวลาส่วนตัวปรึกษากันก่อนโดยไม่เร่งรัดนะคะ'
      ],
      distrust: [
        'ขอบคุณที่ถามตรงไปตรงมานะคะ การจัดสรรอวัยวะทำผ่านระบบคอมพิวเตอร์กลางของศูนย์รับบริจาคอวัยวะสภากาชาดไทย (ODC) ตามความเข้ากันได้ของเนื้อเยื่อ ไม่มีการซื้อขายหรือลัดคิวค่ะ',
        'และครอบครัวผู้บริจาคไม่มีค่าใช้จ่ายเพิ่มเติมใดๆ เลยค่ะ สามารถปรึกษาครอบครัวได้เต็มที่โดยไม่เร่งรัดนะคะ'
      ],
      pediatric: [
        'ขอแสดงความเสียใจอย่างสุดซึ้งกับคุณแม่นะคะ เข้าใจหัวอกคนเป็นแม่เลยว่ามันเร็วและเจ็บปวดมาก ไม่ต้องรีบพูดอะไรเลยค่ะ ดิฉันอยู่ตรงนี้เป็นเพื่อนรับฟังคุณแม่นะคะ',
        'ทีมแพทย์ได้ดูแลน้องต้นกล้าอย่างสุดความสามารถแล้วค่ะ เราเคารพการตัดสินใจของคุณพ่อคุณแม่ร้อยเปอร์เซ็นต์ ให้เวลาอยู่บอกลาน้องอย่างเต็มที่และจะดูแลร่างน้องอย่างทะนุถนอมที่สุดค่ะ'
      ],
      sbar_doctor: [
        'รายงาน SBAR เตียง 1 ครับคุณหมอ (S/B): ผู้ป่วยชาย 38 ปี Severe TBI ตอนนี้ GCS = 3 (E1V1M1) ม่านตาขยายคงที่ 6 มม. BP ตกเหลือ 78/46, HR 116 และปัสสาวะใสออกมาก 640 mL/hr โซเดียม 154 ครับ',
        '(A/R): ประเมินเข้าข่าย Potential Donor ร่วมกับภาวะ Hypotension และสงสัยเบาจืด (DI) ครับ ขอเสนอให้สารน้ำและยากระตุ้นความดัน พิจารณา DDAVP เพื่อคุมปัสสาวะ และเตรียมแผนตรวจยืนยันสมองตายพร้อมประสานทีม ODC ครับ'
      ]
    },
    en: {
      standard: [
        'I am deeply sorry for what you and your family are going through. I understand it feels confusing to see his chest moving—that is the ventilator breathing for him, while three physicians have confirmed irreversible brain death.',
        'There is no rush at all. Please take all the private time your family needs, and know that our surgical team always restores and cares for your father’s body with the utmost dignity.'
      ],
      belief: [
        'We deeply respect your grandmother’s spiritual beliefs and family traditions. Giving the gift of life to save others is widely honored as an act of great compassion and merit.',
        'Our surgical team restores the body carefully and respectfully so your family can hold all traditional funeral ceremonies as usual.'
      ],
      conflict: [
        'I can see how deeply both of you love him. I hear your wish to honor his donor card, and I also hear how painful this is for you as his mother.',
        'We will never force or rush any decision without family consensus. Please take private time together to talk—whatever you decide, we will fully support your family.'
      ],
      distrust: [
        'Thank you for asking such a fair and direct question. Organ allocation is managed transparently through the Thai Red Cross Organ Donation Centre computer matching system based on medical compatibility—there is no queue-jumping or selling.',
        'Your family will never be billed for any extra ICU or donation-related costs, and there is zero pressure to decide right now.'
      ],
      pediatric: [
        'I am truly heartbroken for you. Losing a 14-year-old son so suddenly is unimaginably painful. You do not have to say anything right now—I am simply here with you.',
        'The medical team did everything possible for him. We respect your wishes 100%, will give you all the time you need to say goodbye, and will care for his body with the greatest tenderness.'
      ],
      sbar_doctor: [
        'SBAR for Bed 1, Doctor (S/B): 38-year-old male with severe TBI, currently GCS 3 (E1V1M1), fixed dilated 6 mm pupils. Vitals are unstable: BP 78/46, HR 116, clear polyuria 640 mL/hr, serum Na 154 mEq/L.',
        '(A/R): I assess him as a potential organ donor with hypotension and suspected Central Diabetes Insipidus. I recommend IV fluid resuscitation, vasopressor support, DDAVP to control polyuria, and initiating formal brain death evaluation with ODC coordination.'
      ]
    }
  };

  function getCoachQuickReplies(personaId, lang) {
    const langKey = lang === 'en' ? 'en' : 'th';
    const bank = COACH_QUICK_REPLIES[langKey] || COACH_QUICK_REPLIES.th;
    return bank[personaId] || bank.standard;
  }

  function getPersonas() {
    if (Array.isArray(global.SKILL_LAB_PERSONAS) && global.SKILL_LAB_PERSONAS.length > 0) {
      const merged = global.SKILL_LAB_PERSONAS.map(function (p) {
        const fb = FALLBACK_PERSONAS.find(function (x) { return x.id === p.id; }) || FALLBACK_PERSONAS[0];
        return Object.assign({}, fb, p);
      });
      FALLBACK_PERSONAS.forEach(function (fb) {
        if (!merged.some(function (m) { return m.id === fb.id; })) {
          merged.push(fb);
        }
      });
      return merged;
    }
    return FALLBACK_PERSONAS;
  }

  function getCaseVoices(personaId) {
    switch (personaId) {
      case 'belief':
        return { primary: 'Aoede', secondary: 'Sulafat', labelPrimary: 'คุณฝน (พี่สาว)' };
      case 'conflict':
        return { primary: 'Sulafat', secondary: 'Kore', labelPrimary: 'ภรรยา', labelSecondary: 'คุณแม่' };
      case 'distrust':
        return { primary: 'Vindemiatrix', secondary: 'Sulafat', labelPrimary: 'คุณนุช (ลูกสาว)' };
      case 'pediatric':
        return { primary: 'Sulafat', secondary: 'Aoede', labelPrimary: 'คุณแม่น้องต้นกล้า' };
      case 'sbar_doctor':
        return { primary: 'Puck', secondary: 'Charon', labelPrimary: 'นพ.ภาคิน (แพทย์เวร ICU)' };
      default:
        return { primary: 'Sulafat', secondary: 'Aoede', labelPrimary: 'คุณแพรว (ลูกสาว)' };
    }
  }

  // ==========================================================================
  // 3. REALISM #1: 3 HIDDEN BARRIERS PER CASE + ADAPTIVE SCAFFOLDING HINTS + TRUST
  // ==========================================================================
  const CASE_HIDDEN_BARRIERS = {
    standard: [
      {
        id: 'empathy_ack',
        titleTH: 'รับฟังความเสียใจและแนะนำบทบาทอย่างอ่อนโยน',
        hintTH: 'ลองเริ่มด้วยการแสดงความเสียใจอย่างอ่อนโยนและแนะนำบทบาทพยาบาลผู้ประสานงาน เช่น “ขอแสดงความเสียใจด้วยนะคะ เข้าใจว่าตอนนี้ใจยังหนักมาก ดิฉันอยู่ตรงนี้เพื่อรับฟังค่ะ”',
        hintEN: 'Start with gentle empathy and introduce your role: “I am deeply sorry for this sudden shock. I am the care coordinator here to support you.”',
        keywords: /เสียใจ|เข้าใจ|หนักมาก|เป็นกำลังใจ|อยู่ตรงนี้|ยินดีรับฟัง|พยาบาล|ผู้ประสานงาน|ขออนุญาต|sorry|understand|here for you|coordinator/i
      },
      {
        id: 'ventilator_vs_braindeath',
        titleTH: 'อธิบายความต่างระหว่างเครื่องช่วยหายใจกับภาวะสมองตายถาวร',
        hintTH: 'อธิบายอย่างนุ่มนวลว่าหน้าอกที่ขยับเกิดจาก “เครื่องช่วยหายใจ” ส่วน “ก้านสมองหยุดทำงานถาวร” ซึ่งแพทย์ 3 ท่านตรวจยืนยันครบ 2 ครั้งแล้วค่ะ',
        hintEN: 'Clarify gently that the ventilator moves the chest while three physicians have confirmed irreversible brain death.',
        keywords: /เครื่องช่วยหายใจ|ก้านสมอง|สมองตาย|ถาวร|สูบฉีด|ออกซิเจน|แพทย์.*3|ตรวจ.*2|ventilator|brain\s*death|permanent|irreversible/i
      },
      {
        id: 'zero_pressure_dignity',
        titleTH: 'ให้เวลาครอบครัวตัดสินใจไม่เร่งรัด & ดูแลร่างอย่างสมเกียรติ',
        hintTH: 'ยืนยันว่า “ไม่เร่งรัด ให้เวลาครอบครัวปรึกษากันเต็มที่” และทีมแพทย์จะ “ตกแต่งร่างคุณพ่ออย่างเรียบร้อยสมเกียรติ” ค่ะ',
        hintEN: 'Reassure that there is zero pressure, plenty of time to decide, and the body will be cared for with full dignity.',
        keywords: /ไม่เร่ง|ไม่รีบ|ให้เวลา|ปรึกษา|ตัดสินใจ|เคารพ|ตกแต่งร่าง|เรียบร้อย|สมเกียรติ|no\s*rush|take\s*your\s*time|dignity|respect/i
      }
    ],
    belief: [
      {
        id: 'respect_grandma',
        titleTH: 'รับฟังและเคารพความเชื่อของคุณยายโดยไม่โต้แย้ง',
        hintTH: 'รับฟังอย่างให้เกียรติก่อน เช่น “เข้าใจความห่วงใยของคุณยายมากค่ะ เราเคารพความเชื่อและศาสนาของครอบครัวเสมอค่ะ”',
        hintEN: 'Validate her grandmother’s spiritual beliefs respectfully without arguing.',
        keywords: /เข้าใจความกังวล|คุณยาย|ความเชื่อ|เคารพ|ศาสนา|ไม่ตัดสิน|กตัญญู|understand.*grandmother|respect.*belief|spiritual/i
      },
      {
        id: 'merit_giving',
        titleTH: 'สื่อสารคุณค่าทานบารมี / การส่งต่อชีวิตใหม่อย่างนุ่มนวล',
        hintTH: 'เชื่อมโยงมุมมองทานบารมี เช่น “ในทางศาสนาการมอบอวัยวะเพื่อช่วยต่อชีวิตผู้อื่นถือเป็นทานบารมีและบุญกุศลอันยิ่งใหญ่ค่ะ”',
        hintEN: 'Gently frame organ donation as an act of great compassion, merit, and saving lives.',
        keywords: /ทานบารมี|บุญใหญ่|ต่อชีวิต|ช่วยชีวิต|กุศล|ชีวิตใหม่|ความดี|merit|gift\s*of\s*life|save\s*lives|compassion/i
      },
      {
        id: 'dignified_body_ritual',
        titleTH: 'ยืนยันการตกแต่งร่างประณีตและทำพิธีทางศาสนาได้ตามปกติ',
        hintTH: 'คลายกังวลเรื่องพิธีศพว่า “ทีมศัลยแพทย์จะตกแต่งร่างให้เรียบร้อยสมบูรณ์ แต่งตัวและทำพิธีทางศาสนาได้ตามปกติค่ะ”',
        hintEN: 'Assure her that the surgical team restores the body carefully for all traditional funeral rites.',
        keywords: /ตกแต่งร่าง|เรียบร้อย|สมบูรณ์|พิธี|ศาสนา|แต่งตัว|เหมือนเดิม|ไม่เสียรูป|funeral|ceremony|restored|dignity|intact/i
      }
    ],
    conflict: [
      {
        id: 'validate_both_sides',
        titleTH: 'วางตัวเป็นกลาง รับฟังทั้งความตั้งใจของภรรยาและความเจ็บปวดของคุณแม่',
        hintTH: 'แสดงความเป็นกลางรับฟังทั้งสองฝ่าย เช่น “สัมผัสได้ถึงความรักที่ทั้งภรรยาและคุณแม่มีให้คุณต้นมากค่ะ เข้าใจความรู้สึกของทั้งสองท่านเลยค่ะ”',
        hintEN: 'Acknowledge both the wife’s wish and the mother’s pain with complete neutrality.',
        keywords: /ทั้งสอง|ภรรยา.*แม่|แม่.*ภรรยา|ความรัก|เข้าใจคุณแม่|เข้าใจภรรยา|เป็นกลาง|เข้าใจทั้งคู่|both\s*of\s*you|mother.*wife|love\s*him/i
      },
      {
        id: 'no_coercion_family_first',
        titleTH: 'ยืนยันจริยธรรมไทย: ไม่ฝืนใจคุณแม่หรือญาติสายตรงแม้มีบัตรจำนง',
        hintTH: 'ยืนยันให้คุณแม่สบายใจว่า “ตามหลักจริยธรรมไทยเราจะไม่ฝืนใจคุณแม่เด็ดขาดแม้มีบัตรจำนงค่ะ เพราะสายสัมพันธ์ครอบครัวสำคัญที่สุด”',
        hintEN: 'Reassure the mother that we will never coerce or proceed without family consensus.',
        keywords: /ไม่ฝืนใจ|ไม่บังคับ|ไม่ดำเนินการ.*ถ้า.*ไม่พร้อม|ความเห็นพ้อง|ยินยอมพร้อมกัน|เคารพคุณแม่|สายสัมพันธ์|never\s*force|no\s*coercion|consensus|without\s*mother/i
      },
      {
        id: 'private_family_time',
        titleTH: 'เปิดพื้นที่ส่วนตัวให้ครอบครัวค่อยๆ ปรึกษากันโดยไม่กดดัน',
        hintTH: 'เปิดพื้นที่ให้ครอบครัวคุยกันเอง เช่น “ขอให้ทั้งสองท่านมีเวลาส่วนตัวปรึกษากันก่อนโดยไม่เร่งรัดนะคะ ไม่ว่าคำตอบจะเป็นอย่างไรเราพร้อมเคารพค่ะ”',
        hintEN: 'Offer private family time to discuss without pressure, honoring whatever they decide.',
        keywords: /ให้เวลา|คุยกันเอง|ปรึกษากัน|พื้นที่ส่วนตัว|ไม่เร่งรัด|ไม่กดดัน|ไม่ว่าคำตอบ|private\s*time|discuss\s*together|whatever\s*you\s*decide/i
      }
    ],
    distrust: [
      {
        id: 'calm_non_defensive',
        titleTH: 'รับฟังข้อสงสัยอย่างใจเย็น ขอบคุณที่ถามตรงไปตรงมาโดยไม่โต้เถียง',
        hintTH: 'ตอบรับอย่างใจเย็นไม่ตั้งรับ เช่น “ขอบคุณที่ถามตรงไปตรงมานะคะ เข้าใจความกังวลเลย ยินดีชี้แจงทุกขั้นตอนอย่างโปร่งใสค่ะ”',
        hintEN: 'Respond calmly without defensiveness: “Thank you for asking so directly—I am glad to explain transparently.”',
        keywords: /ขอบคุณที่ถาม|เข้าใจความกังวล|คำถามสำคัญ|ตรงไปตรงมา|ยินดีชี้แจง|โปร่งใส|ตรวจสอบได้|thank\s*you\s*for\s*asking|fair\s*question|transparent/i
      },
      {
        id: 'odc_computer_fairness',
        titleTH: 'อธิบายระบบจัดสรรอวัยวะของ ODC สภากาชาดไทยที่โปร่งใสและเป็นธรรม',
        hintTH: 'ชี้แจงว่า “จัดสรรผ่านระบบคอมพิวเตอร์กลางของศูนย์รับบริจาคอวัยวะสภากาชาดไทย (ODC) ตามความเข้ากันได้ของเนื้อเยื่อ ไม่มีการซื้อขายหรือลัดคิวค่ะ”',
        hintEN: 'Explain the Thai Red Cross ODC computer matching system based on medical compatibility with zero queue-jumping.',
        keywords: /สภากาชาด|ODC|ศูนย์รับบริจาค|คอมพิวเตอร์|เข้ากันได้|เนื้อเยื่อ|หมู่เลือด|เร่งด่วน|ไม่มี.*ซื้อขาย|ไม่ลัดคิว|red\s*cross|computer|matching|fair|no\s*selling/i
      },
      {
        id: 'zero_extra_cost',
        titleTH: 'ยืนยันชัดเจนว่าครอบครัวผู้บริจาคไม่มีค่าใช้จ่ายเพิ่มเติมและไม่เร่งรัด',
        hintTH: 'ยืนยันเรื่องค่าใช้จ่ายว่า “ครอบครัวผู้บริจาคไม่มีค่าใช้จ่ายเพิ่มเติมใดๆ ในขั้นตอนการบริจาคและรอผ่าตัดเลยค่ะ”',
        hintEN: 'Clarify clearly that the donor family faces zero additional ICU or surgery expenses.',
        keywords: /ไม่มีค่าใช้จ่าย|ไม่เสียค่าใช้จ่าย|ไม่คิดเงิน|ฟรี|รับผิดชอบค่าใช้จ่าย|ไม่เร่ง|no\s*cost|free\s*of\s*charge|zero\s*cost|not\s*billed/i
      }
    ],
    pediatric: [
      {
        id: 'deep_bereavement_presence',
        titleTH: 'อยู่เคียงข้างและรับรู้ความเจ็บปวดสูงสุดของคนเป็นแม่โดยไม่รีบอธิบายข้อมูล',
        hintTH: 'ประคับประคองใจก่อนให้ข้อมูล เช่น “ขอแสดงความเสียใจอย่างสุดซึ้งนะคะ เข้าใจหัวอกคนเป็นแม่ว่ามันเร็วและเจ็บปวดมาก ไม่ต้องรีบพูดอะไรเลย ดิฉันอยู่ตรงนี้เป็นเพื่อนค่ะ”',
        hintEN: 'Offer quiet bereavement presence first before any clinical explanation.',
        keywords: /เสียใจอย่างสุดซึ้ง|หัวอก.*แม่|เข้าใจ.*แม่|เจ็บปวด|เร็วเกินไป|อยู่ตรงนี้|เป็นเพื่อน|กอด|ไม่ต้องรีบพูด|deeply\s*sorry|mother|heartbreaking|here\s*with\s*you/i
      },
      {
        id: 'gentle_decoupling_legacy',
        titleTH: 'ใช้หลัก Decoupling ค่อยๆ อธิบายความจริงอย่างอ่อนโยนและเชื่อมโยงคุณค่าชีวิตของน้อง',
        hintTH: 'ยืนยันว่าทีมแพทย์ดูแลน้องสุดความสามารถแล้วและค่อยๆ เชื่อมโยงคุณค่าความทรงจำ/การส่งต่อชีวิตอย่างอ่อนโยนค่ะ',
        hintEN: 'Confirm the team did everything possible and gently decouple clinical facts from honoring his legacy.',
        keywords: /ก้านสมอง|สมองตาย|ทีมแพทย์ดูแล.*สุดความสามารถ|ความทรงจำ|ความภูมิใจ|ส่งต่อชีวิต|ช่วยเด็ก|decoupling|brain\s*death|legacy|help\s*other\s*children/i
      },
      {
        id: 'parental_autonomy_dignity',
        titleTH: 'เคารพสิทธิ์พ่อแม่ 100% ให้เวลาบอกลาลูกอย่างเต็มที่และดูแลร่างอย่างทะนุถนอมที่สุด',
        hintTH: 'ยืนยันว่า “ให้เวลาคุณพ่อคุณแม่ได้อยู่บอกลาน้องต้นกล้าอย่างเต็มที่ เคารพการตัดสินใจร้อยเปอร์เซ็นต์ และจะดูแลร่างน้องอย่างทะนุถนอมที่สุดค่ะ”',
        hintEN: 'Assure full parental autonomy, unhurried goodbye time, and tender care for his body.',
        keywords: /ให้เวลา.*บอกลา|อยู่กับน้อง|ปรึกษาคุณพ่อ|ไม่เร่งรัด|เคารพการตัดสินใจ|ดูแลร่าง|ทะนุถนอม|เรียบร้อย|say\s*goodbye|take\s*all\s*the\s*time|dignity/i
      }
    ],
    sbar_doctor: [
      {
        id: 'sbar_situation_background',
        titleTH: 'S & B: ระบุตัวตนเคส TBI คะแนน GCS = 3 และสัญญาณชีพวิกฤต (BP 78/46, UO 640)',
        hintTH: 'รายงาน S & B ให้ครบตัวเลขสำคัญ: “เตียง 1 ผู้ป่วยชาย 38 ปี Severe TBI ตอนนี้ GCS = 3 ม่านตา 6 มม. BP ตกเหลือ 78/46 และปัสสาวะใสออก 640 mL/hr ครับ”',
        hintEN: 'Report S & B crisply: “Bed 1, 38yo male TBI, GCS 3, fixed 6 mm pupils, BP 78/46, HR 116, clear polyuria 640 mL/hr.”',
        keywords: /GCS\s*=?\s*3|จีซีเอส.*3|TBI|อุบัติเหตุทางศีรษะ|78\/46|ความดันตก|ความดันต่ำ|640|ปัสสาวะออกมาก|เตียง\s*1|situation|background|polyuria/i
      },
      {
        id: 'sbar_assessment_di',
        titleTH: 'A: ประเมินเข้าข่าย Potential Donor ร่วมกับภาวะ Hypotension และเบาจืด (DI / Na สูง)',
        hintTH: 'ระบุการประเมิน A ให้ชัด: “ประเมินว่าเข้าข่าย Potential Donor ร่วมกับภาวะ Hypotension และสงสัยเบาจืด (Central DI) เนื่องจากปัสสาวะใสออกมากและ Na สูง 154 ครับ”',
        hintEN: 'State Assessment clearly: “Potential donor with hypotension and suspected Central Diabetes Insipidus (Na 154).”',
        keywords: /potential\s*donor|เข้าข่ายผู้บริจาค|สมองตาย|เบาจืด|diabetes\s*insipidus|\bDI\b|โซเดียมสูง|154|hypernatremia|assessment/i
      },
      {
        id: 'sbar_recommendation_plan',
        titleTH: 'R: เสนอแผนพยุงความดัน (Fluid/Vasopressor), ยา DDAVP, เตรียมตรวจสมองตาย & ประสาน ODC',
        hintTH: 'เสนอแผน R ชัดเจน: “ขอเสนอให้สารน้ำ/ยากระตุ้นความดัน พิจารณา DDAVP เพื่อคุมปัสสาวะ และเตรียมแผนตรวจยืนยันสมองตายพร้อมประสานทีม ODC ครับ”',
        hintEN: 'Deliver Recommendation: “Recommend IV fluids, vasopressor, DDAVP for DI, formal brain death workup, and ODC coordination.”',
        keywords: /DDAVP|ดีดีเอวีพี|desmopressin|สารน้ำ|fluid|vasopressor|กระตุ้นความดัน|ตรวจสมองตาย|apnea|ประสาน.*ODC|ศูนย์รับบริจาค|recommendation/i
      }
    ]
  };

  function getCaseBarriers(personaId) {
    return CASE_HIDDEN_BARRIERS[personaId] || CASE_HIDDEN_BARRIERS.standard;
  }

  function evaluateBarriersUnlocked(personaId, userText, currentUnlockedIds) {
    const barriers = getCaseBarriers(personaId);
    const unlocked = new Set(Array.isArray(currentUnlockedIds) ? currentUnlockedIds : []);
    const newlyUnlocked = [];
    const text = String(userText || '');

    barriers.forEach(function (b) {
      if (!unlocked.has(b.id) && b.keywords.test(text)) {
        unlocked.add(b.id);
        newlyUnlocked.push(b);
      }
    });

    return {
      unlockedIds: Array.from(unlocked),
      newlyUnlocked: newlyUnlocked,
      total: barriers.length
    };
  }

  /**
   * Adaptive Scaffolding (ชุดที่ 2): ส่งคำใบ้เจาะจงเฉพาะปมในใจที่ยังไม่ได้ปลดล็อก
   */
  function getRemainingBarrierHint(personaId, unlockedIds, lang) {
    const barriers = getCaseBarriers(personaId);
    const unlocked = new Set(Array.isArray(unlockedIds) ? unlockedIds : []);
    const remaining = barriers.filter(function (b) { return !unlocked.has(b.id); });
    const isEn = lang === 'en';

    if (remaining.length === 0) {
      return {
        allUnlocked: true,
        remainingCount: 0,
        barrierTitle: isEn ? 'All 3 clinical objectives completed!' : 'คลายปมครบทั้ง 3 ข้อแล้ว!',
        hintText: isEn
          ? 'Excellent work—you have addressed all 3 key concerns. You may wrap up gently and click Finish & Evaluate.'
          : 'ยอดเยี่ยมมากค่ะ! ท่านคลายปมสำคัญครบทั้ง 3 ข้อแล้ว สามารถสรุปปิดบทสนทนาอย่างนุ่มนวลและกด “จบเคส & ประเมินผล” ได้เลยค่ะ'
      };
    }

    const nextB = remaining[0];
    return {
      allUnlocked: false,
      remainingCount: remaining.length,
      barrierId: nextB.id,
      barrierTitle: nextB.titleTH,
      hintText: isEn ? (nextB.hintEN || nextB.hintTH) : nextB.hintTH
    };
  }

  function computeInertiaTrust(params) {
    const prevTrust = typeof params.prevTrust === 'number' ? params.prevTrust : 30;
    const aiEmotion = EMOTIONS[params.aiEmotion] ? params.aiEmotion : 'CONFUSED';
    const newlyUnlockedCount = Number(params.newlyUnlockedCount || 0);
    const totalUnlockedCount = Number(params.totalUnlockedCount || 0);
    const triggerCount = Number(params.triggerCount || 0);
    const usedSilence = Boolean(params.usedSilence);
    const isHard = params.difficulty === 'hard';

    let delta = 0;
    delta += newlyUnlockedCount * (isHard ? 14 : 18);
    if (usedSilence) delta += 7;
    const emoTarget = EMOTIONS[aiEmotion].baseTrust;
    const softPull = Math.max(-6, Math.min(8, Math.round((emoTarget - prevTrust) * 0.22)));
    delta += softPull;

    if (triggerCount > 0) {
      delta -= triggerCount * (isHard ? 15 : 11);
    }

    if (String(params.userText || '').trim().length < 18 && newlyUnlockedCount === 0) {
      delta = Math.min(delta, 1);
    }

    const nextTrust = Math.max(10, Math.min(96, Math.round(prevTrust + delta)));

    let effectiveEmotion = aiEmotion;
    if (triggerCount > 0 && (effectiveEmotion === 'CALM' || effectiveEmotion === 'HESITANT')) {
      effectiveEmotion = 'ANGRY';
    } else if (effectiveEmotion === 'CALM' && (nextTrust < 72 || totalUnlockedCount < 2)) {
      effectiveEmotion = nextTrust >= 56 ? 'HESITANT' : 'SAD';
    }

    return {
      trust: nextTrust,
      delta: nextTrust - prevTrust,
      emotion: effectiveEmotion
    };
  }

  // ==========================================================================
  // 4. REALISM #2: CONTEXT-AWARE HARD MODE CURVEBALLS (FAMILY vs. SBAR ICU)
  // ==========================================================================
  const HARD_MODE_CURVEBALLS = [
    {
      id: 'brother_phone_call',
      type: 'phone',
      triggerTurn: 2,
      emotion: 'ANGRY',
      badgeTH: '⚡ เหตุการณ์แทรกโหมด Hard • สายโทรศัพท์เข้า',
      badgeEN: '⚡ Hard Mode Curveball • Incoming Phone Call',
      titleTH: 'พี่ชายโทรแทรกเข้ามาคัดค้านกลางห้อง!',
      actionTH: 'โทรศัพท์ในมือสั่นดังขึ้น ญาติรับสายสีหน้าเครียดจัดก่อนเงยหน้ามองคุณด้วยความระแวง',
      actionEN: 'Her phone vibrates; after a tense call, she looks up anxiously.',
      speechTH: 'เดี๋ยวนะคะ... พี่ชายเพิ่งโทรมาหาหนูเมื่อกี้เลย พี่เขาโกรธมาก บอกว่าห้ามเซ็นยินยอมอะไรเด็ดขาด กลัวโรงพยาบาลจะรีบเอาอวัยวะไปขาย! หนูทำตัวไม่ถูกแล้วค่ะ ตกลงมันปลอดภัยและโปร่งใสจริงใช่ไหมคะ?',
      speechEN: 'Wait... My older brother just called and shouted at me not to sign anything—he fears the hospital is rushing to profit from organs! I am overwhelmed. Can I really trust this process?',
      coachHintTH: 'รับฟังความกดดันจากพี่ชายอย่างใจเย็น ชี้แจงความโปร่งใสของ ODC สภากาชาดไทย และเสนอให้พี่ชายมาร่วมฟังพร้อมกันได้โดยไม่เร่งรัดค่ะ'
    },
    {
      id: 'silent_sob_pause',
      type: 'silence',
      triggerTurn: 3,
      emotion: 'SAD',
      badgeTH: '🤍 เหตุการณ์แทรกโหมด Hard • จังหวะสะอื้นเงียบ',
      badgeEN: '⚡ Hard Mode Curveball • Silent Grief Moment',
      titleTH: 'ญาติสะอื้นจนพูดต่อไม่ไหว (ทดสอบการเว้นความเงียบ 2.5 วิ)',
      actionTH: 'ก้มหน้าซบมือทั้งสองข้าง ไหล่สั่นสะอื้นเงียบๆ น้ำตาไหลไม่หยุด',
      actionEN: 'Buries face in her hands, shoulders trembling in silent tears.',
      speechTH: 'ขอโทษนะคะ... หนู... ฮึก... หนูพูดต่อไม่ไหวแล้วค่ะ ภาพตอนที่อยู่ด้วยกันมันวนกลับมาเต็มไปหมดเลย...',
      speechEN: 'I am sorry... I... I just cannot speak right now... All our memories are flooding back...',
      coachHintTH: 'อย่ารีบพูดแทรกนะคะ! ปล่อยความเงียบเยียวยาอย่างน้อย 2.5 วินาที แล้วค่อยเอ่ยปลอบอย่างอ่อนโยนสั้นๆ ค่ะ'
    }
  ];

  // เหตุการณ์แทรกเฉพาะเคส 6 (ส่งเวร SBAR กับ นพ.ภาคิน — ไม่เอาสายพี่ชายมาปะปน!)
  const SBAR_HARD_MODE_CURVEBALLS = [
    {
      id: 'icu_bp_crash_alarm',
      type: 'alarm',
      triggerTurn: 2,
      emotion: 'SHOCK',
      badgeTH: '🚨 เหตุการณ์แทรก ICU Hard • สัญญาณเตือน Monitor ดังฉุกเฉิน',
      badgeEN: '🚨 ICU Hard Curveball • Bedside Monitor Alarm',
      titleTH: 'ความดันเตียง 1 ตกวิกฤตเหลือ BP 64/40 mmHg (MAP 48)!',
      actionTH: 'เสียง Monitor เตียง 1 ร้องเตือนถี่ นพ.ภาคินหันขวับไปดูจอด้วยสีหน้าตึงเครียด',
      actionEN: 'The bedside monitor alarms rapidly; Dr. Phakin turns sharply toward the screen.',
      speechTH: 'เดี๋ยวครับ! จอ Monitor เตียง 1 เตือนแล้ว ความดันตกฮวบเหลือ 64/40 mmHg ปัสสาวะยังพุ่งไม่หยุดเลยครับ! คุณพยาบาลสรุปตัวเลขและเสนอ Order เร่งด่วนเพื่อพยุงอวัยวะตอนนี้เลยครับ!',
      speechEN: 'Hold on! Bed 1 monitor is alarming—BP just crashed to 64/40 mmHg and polyuria continues! Give me your immediate assessment and urgent order recommendations right now!',
      coachHintTH: 'ตั้งสติและสรุป A+R กระชับทันที: สงสัย Hypovolemia จาก Central DI (Na 154) เสนอ Load สารน้ำ/ปรับ Vasopressor ให้ MAP ≥ 65 และขอ Order DDAVP ค่ะ'
    },
    {
      id: 'icu_bed3_interrupt',
      type: 'alarm',
      triggerTurn: 3,
      emotion: 'ANGRY',
      badgeTH: '⚡ เหตุการณ์แทรก ICU Hard • แพทย์ถูกตามเคสฉุกเฉิน',
      badgeEN: '⚡ ICU Hard Curveball • Urgent Bed 3 Interruption',
      titleTH: 'เตียง 3 เรียกด่วน — มีเวลา 15 วินาทีสรุปแผนส่งต่อ!',
      actionTH: 'วิทยุสื่อสารหอผู้ป่วยดังขึ้น นพ.ภาคินกำลังจะเดินไปเตียง 3 และหันมาขอสรุปปิดท้าย',
      actionEN: 'An urgent page sounds for Bed 3; Dr. Phakin asks for a crisp final confirmation.',
      speechTH: 'ขอโทษครับ เตียง 3 กำลังต้องใส่ท่อช่วยหายใจ ผมมีเวลาแค่ 15 วินาที ช่วยทวนแผนตรวจยืนยันสมองตายและการประสานทีม ODC ให้ผมเซ็น Order ก่อนเดินไปหน่อยครับ!',
      speechEN: 'Sorry, Bed 3 needs emergency intubation—I have 15 seconds. Confirm the brain death evaluation plan and ODC coordination so I can sign off right now!',
      coachHintTH: 'สรุป Read-Back สั้นและแม่น: เตรียมแพทย์ 3 ท่านตรวจสมองตาย 2 ครั้งห่าง 6 ชม. คุมสัญญาณชีพ/DI และแจ้งพยาบาล TC ประสานศูนย์ ODC สภากาชาดไทยค่ะ'
    }
  ];

  function pickHardCurveball(nextTurnNum, usedIds, personaId) {
    const used = new Set(Array.isArray(usedIds) ? usedIds : []);
    const pool = personaId === 'sbar_doctor' ? SBAR_HARD_MODE_CURVEBALLS : HARD_MODE_CURVEBALLS;
    for (let i = 0; i < pool.length; i++) {
      const cb = pool[i];
      if (!used.has(cb.id) && cb.triggerTurn === Number(nextTurnNum)) {
        return cb;
      }
    }
    return null;
  }

  // ==========================================================================
  // 5. REALISM #3: TARGETED 4-STAGE MICRO-DRILL GAUNTLET & INSTANT EVALUATOR
  // ==========================================================================
  const MICRO_DRILL_STAGES = [
    {
      id: 'drill_ventilator',
      stage: 1,
      personaId: 'standard',
      emotion: 'CONFUSED',
      badgeTH: 'ด่าน 1/4 • คุณแพรว (ลูกสาว)',
      titleTH: 'ตอบคำถามเรื่องเครื่องช่วยหายใจกับภาวะสมองตาย',
      actionTH: 'จับแขนคุณเบาๆ แววตาสับสนและเต็มไปด้วยความหวัง',
      promptTH: 'เมื่อกี้หนูเพิ่งไปจับมือคุณพ่อ ตัวพ่อก็ยังอุ่น หน้าอกก็ยังขยับขึ้นลงอยู่เลย ทำไมคุณหมอบอกว่าคุณพ่อเสียชีวิตแล้วล่ะคะ?',
      criteria: [
        { label: 'รับฟังความรู้สึก/แสดงความเห็นอกเห็นใจ', pattern: /เสียใจ|เข้าใจ|หนักมาก|ทำใจ.*ยาก|sorry|understand/i },
        { label: 'แยกบทบาทเครื่องช่วยหายใจออกจากภาวะสมองตายถาวร', pattern: /เครื่องช่วยหายใจ|เป่าลม|พยุง|ก้านสมอง|สมองตาย|ถาวร|ventilator|brain\s*death/i },
        { label: 'อ้างอิงเกณฑ์แพทย์ตรวจยืนยันตามมาตรฐาน', pattern: /แพทย์.*3|ตรวจ.*2|apnea|มาตรฐาน|ยืนยัน/i }
      ],
      modelAnswerTH: 'เข้าใจเลยค่ะว่าเห็นหน้าอกคุณพ่อยังขยับและตัวอุ่นแล้วทำใจเชื่อยากมาก จริงๆ แล้วเกิดจากเครื่องช่วยหายใจที่เป่าลมและยาพยุงความดันไว้ค่ะ ส่วนก้านสมองหยุดทำงานถาวรซึ่งแพทย์ผู้เชี่ยวชาญ 3 ท่านตรวจยืนยันครบ 2 ครั้งแล้วค่ะ'
    },
    {
      id: 'drill_belief',
      stage: 2,
      personaId: 'belief',
      emotion: 'HESITANT',
      badgeTH: 'ด่าน 2/4 • คุณฝน (พี่สาว)',
      titleTH: 'ตอบคำถามความเชื่อ ศาสนา และการดูแลร่าง',
      actionTH: 'กำทิชชูแน่น สีหน้ากังวลแทนคุณยายที่บ้าน',
      promptTH: 'คุณยายท่านกลัวมากค่ะว่าถ้าบริจาคอวัยวะของน้องชายไปแล้ว ชาติหน้าอวัยวะจะไม่ครบ 32 แล้วจะแต่งตัวทำพิธีศาสนาได้เหมือนเดิมไหมคะ?',
      criteria: [
        { label: 'เคารพและรับฟังความเชื่อของคุณยายโดยไม่โต้แย้ง', pattern: /เข้าใจ|คุณยาย|เคารพ|ความเชื่อ|ศาสนา|respect/i },
        { label: 'สื่อสารคุณค่าทานบารมี / การต่อชีวิตใหม่', pattern: /ทานบารมี|บุญ|ต่อชีวิต|ช่วยชีวิต|กุศล|merit/i },
        { label: 'รับรองการตกแต่งร่างประณีตและทำพิธีศาสนาได้ตามปกติ', pattern: /ตกแต่งร่าง|เรียบร้อย|สมบูรณ์|พิธี|เหมือนเดิม|สมเกียรติ|dignity/i }
      ],
      modelAnswerTH: 'เข้าใจความห่วงใยของคุณยายมากค่ะ เราเคารพความเชื่อของครอบครัวเสมอ ในทางศาสนาการมอบอวัยวะช่วยต่อชีวิตผู้อื่นคือทานบารมีอันยิ่งใหญ่ และทีมแพทย์จะตกแต่งร่างน้องชายให้เรียบร้อยสมบูรณ์ ทำพิธีทางศาสนาได้ตามปกติทุกประการค่ะ'
    },
    {
      id: 'drill_odc_cost',
      stage: 3,
      personaId: 'distrust',
      emotion: 'ANGRY',
      badgeTH: 'ด่าน 3/4 • คุณนุช (ลูกสาว)',
      titleTH: 'ชี้แจงความโปร่งใส ODC และยืนยันไม่มีค่าใช้จ่ายเพิ่ม',
      actionTH: 'จ้องมองตรงๆ ด้วยสีหน้าระแวดระวัง',
      promptTH: 'ถามตรงๆ เลยนะคะ อวัยวะคุณแม่จะถูกเอาไปขายให้คนรวยลัดคิวใช่ไหมคะ? แล้วระหว่างรอผ่าตัด ครอบครัวต้องเสียค่าห้อง ICU เพิ่มหรือเปล่า?',
      criteria: [
        { label: 'รับฟังข้อสงสัยอย่างใจเย็นไม่โต้เถียง', pattern: /ขอบคุณที่ถาม|เข้าใจความกังวล|ตรงไปตรงมา|ยินดีชี้แจง|โปร่งใส/i },
        { label: 'อธิบายระบบจัดสรรอวัยวะคอมพิวเตอร์ของ ODC สภากาชาดไทย', pattern: /สภากาชาด|ODC|ศูนย์รับบริจาค|คอมพิวเตอร์|เนื้อเยื่อ|ไม่มี.*ซื้อขาย|ไม่ลัดคิว/i },
        { label: 'ยืนยันครอบครัวผู้บริจาคไม่มีค่าใช้จ่ายเพิ่มเติม', pattern: /ไม่มีค่าใช้จ่าย|ไม่เสียค่าใช้จ่าย|ไม่คิดเงิน|ฟรี|รับผิดชอบค่าใช้จ่าย/i }
      ],
      modelAnswerTH: 'ขอบคุณที่ถามตรงๆ เลยนะคะ การจัดสรรอวัยวะดำเนินการผ่านระบบคอมพิวเตอร์ของศูนย์รับบริจาคอวัยวะสภากาชาดไทย (ODC) ตามความเข้ากันได้ของเนื้อเยื่อ ไม่มีการซื้อขายหรือลัดคิว และครอบครัวไม่มีค่าใช้จ่ายเพิ่มเติมเลยค่ะ'
    },
    {
      id: 'drill_conflict',
      stage: 4,
      personaId: 'conflict',
      emotion: 'ANGRY',
      badgeTH: 'ด่าน 4/4 • ภรรยา & คุณแม่',
      titleTH: 'วางตัวเป็นกลางระหว่างภรรยาและคุณแม่',
      actionTH: 'ภรรยามองขอความช่วยเหลือ ส่วนคุณแม่กอดอกแน่นและเสียงสั่น',
      promptTH: '[ภรรยา]: พี่ต้นทำบัตรบริจาคไว้ หนูอยากทำตามเจตนาพี่เขาค่ะ... [คุณแม่]: แม่ไม่ยอมเด็ดขาด! ตกลงคุณพยาบาลจะเอาตามบัตรหรือเอาตามใจแม่คะ?!',
      criteria: [
        { label: 'รับฟังทั้งความตั้งใจของภรรยาและความเจ็บปวดของคุณแม่', pattern: /ทั้งสอง|ภรรยา|คุณแม่|ความรัก|เป็นกลาง|เข้าใจทั้งคู่/i },
        { label: 'ยืนยันจริยธรรมไทย: ไม่ฝืนใจคุณแม่หรือญาติสายตรงแม้มีบัตร', pattern: /ไม่ฝืนใจ|ไม่บังคับ|เห็นพ้อง|ยินยอมพร้อมกัน|เคารพคุณแม่|สายสัมพันธ์/i },
        { label: 'ให้เวลาส่วนตัวครอบครัวปรึกษากันโดยไม่เร่งรัด', pattern: /ให้เวลา|คุยกันเอง|ปรึกษากัน|พื้นที่ส่วนตัว|ไม่เร่งรัด|ไม่กดดัน/i }
      ],
      modelAnswerTH: 'สัมผัสได้ถึงความรักที่ทั้งภรรยาและคุณแม่มีให้คุณต้นค่ะ ตามหลักจริยธรรมไทยเราจะไม่ฝืนใจคุณแม่เด็ดขาดแม้มีบัตรจำนง เพราะสายสัมพันธ์ครอบครัวสำคัญที่สุด ขอให้ทั้งสองท่านมีเวลาส่วนตัวปรึกษากันก่อนโดยไม่เร่งรัดนะคะ'
    }
  ];

  function evaluateMicroDrillAnswer(stageObj, userText, triggers, usedSilence) {
    const text = String(userText || '');
    const criteria = Array.isArray(stageObj && stageObj.criteria) ? stageObj.criteria : [];
    const hitLabels = [];
    const missLabels = [];

    criteria.forEach(function (c) {
      if (c.pattern && c.pattern.test(text)) hitLabels.push(c.label);
      else missLabels.push(c.label);
    });

    const trigLen = Array.isArray(triggers) ? triggers.length : 0;
    const baseRatio = criteria.length > 0 ? hitLabels.length / criteria.length : 0.7;
    const score = Math.max(
      25,
      Math.min(100, Math.round(35 + baseRatio * 60 + (usedSilence ? 5 : 0) - trigLen * 12))
    );

    return {
      stage: stageObj.stage,
      titleTH: stageObj.titleTH,
      score: score,
      passed: score >= 65 && trigLen === 0,
      hitLabels: hitLabels,
      missLabels: missLabels,
      modelAnswerTH: stageObj.modelAnswerTH || ''
    };
  }

  // ==========================================================================
  // 6. PROFESSION-AWARE AI LAB ADVISOR v4 (แยกแนะนำตรงตาม 3 กลุ่มวิชาชีพ)
  // ==========================================================================
  const ADVISOR_GOALS = [
    { id: 'auto', label: 'AI วิเคราะห์ตามวิชาชีพ', icon: 'Sparkles' },
    { id: 'first', label: 'เพิ่งฝึกครั้งแรก', icon: 'HeartHandshake' },
    { id: 'drill4', label: 'ซ้อม 4 ด่านคำถามหนัก', icon: 'Zap' },
    { id: 'hard_challenge', label: 'ท้าทาย Hard + เหตุการณ์แทรก', icon: 'Flame' },
    { id: 'conflict2', label: 'ฝึกเคสหิน 2 ตัวละครในห้อง', icon: 'Users' },
    { id: 'pediatric', label: 'เคสผู้ป่วยเด็ก (อ่อนไหวสูง)', icon: 'Baby' },
    { id: 'sbar_team', label: 'ฝึกส่งเวร SBAR แพทย์เวร ICU', icon: 'Stethoscope' },
    { id: 'english', label: 'ฝึกภาษาอังกฤษ (EN)', icon: 'Globe' }
  ];

  const ADVISOR_QUICK_QUESTIONS = [
    'Normal กับ Hard ต่างกันยังไง?',
    'เคส 6 ส่งเวร SBAR ประเมินยังไง?',
    'ขอคำใบ้เจาะปม & เปิดคำบรรยาย CC ทำยังไง?',
    'ฟังเสียงตัวเองย้อนหลังปลอดภัย PDPA ไหม?'
  ];

  function resolveProfessionGroup(userObj) {
    const u = userObj || {};
    const ex = String(u.professionGroup || '').trim();
    if (ex === 'พยาบาล' || ex === 'แพทย์' || ex === 'บุคลากรสหวิชาชีพ') return ex;
    const txt = String(u.name || '') + ' ' + String(u.position || '');
    if (/(นพ\.|พญ\.|แพทย์|doctor|\bm\.?d\.?\b)/i.test(txt) && !/พยาบาล/.test(txt)) return 'แพทย์';
    if (/(พว\.|พยาบาล|nurse|\brn\b)/i.test(txt)) return 'พยาบาล';
    return 'บุคลากรสหวิชาชีพ';
  }

  function computeLabRecommendation(userObj, goalId) {
    const u = userObj || {};
    const prof = resolveProfessionGroup(u);
    const hist = Array.isArray(u.skillLabHistory) ? u.skillLabHistory : [];
    const bestScore = typeof u.skillLabBestScore === 'number' ? u.skillLabBestScore : null;
    const latestRadar = u.skillLabLatestRadar || null;
    const nameShort = String(u.name || 'ผู้เรียน').trim();

    let weakestAxis = null;
    if (latestRadar && typeof latestRadar === 'object') {
      let minVal = 999;
      RADAR_AXES.forEach(function (a) {
        const v = Number(latestRadar[a.key] || 0);
        if (v > 0 && v < minVal) {
          minVal = v;
          weakestAxis = { key: a.key, label: a.labelTH, score: v };
        }
      });
    }

    // ลำดับเคสแนะนำเฉพาะแต่ละกลุ่มวิชาชีพ (ชุดที่ 2: Profession-Aware Pathway)
    const pathwayByProf = prof === 'แพทย์'
      ? ['standard', 'distrust', 'pediatric', 'conflict', 'belief', 'sbar_doctor']
      : prof === 'บุคลากรสหวิชาชีพ'
        ? ['belief', 'conflict', 'distrust', 'standard', 'pediatric', 'sbar_doctor']
        : ['standard', 'conflict', 'sbar_doctor', 'belief', 'distrust', 'pediatric'];

    const practicedIds = new Set(hist.map(function (h) { return h.personaId; }).filter(Boolean));
    const nextUnpracticed = pathwayByProf.find(function (id) { return !practicedIds.has(id); }) || pathwayByProf[0];

    if (goalId === 'first') {
      const startCase = pathwayByProf[0];
      const startTitle = startCase === 'belief' ? 'เคสคุณฝน (ความเชื่อ & พิธีกรรม)' : 'เคสคุณแพรว (อธิบายภาวะสมองตาย)';
      return {
        mode: 'roleplay_th', difficulty: 'normal', personaId: startCase, professionGroup: prof,
        headline: 'ชุดเริ่มต้นสำหรับกลุ่ม' + prof + ' (' + startTitle + ' • Normal)',
        reason: 'ปรับเส้นทางเริ่มต้นให้ตรงบทบาทกลุ่ม' + prof + ' ค่ะ มี AI Coach แนะนำประโยค ปุ่มขอคำใบ้เจาะปมที่เหลือ และตัวละครโฮโลแกรม 3 มิติขยับปากตามเสียงจริง',
        tip: 'เริ่มด้วยการแนะนำตัว แสดงความเห็นอกเห็นใจ และเว้นความเงียบ 2.5 วินาทีหลังคู่สนทนาพูดจบนะคะ',
        speech: 'สวัสดีค่ะคุณ' + nameShort + ' สำหรับกลุ่ม' + prof + ' แนะนำเริ่มต้นที่' + startTitle + ' ระดับนอร์มอลค่ะ จะมีแนวทางคำพูดและคำใบ้เจาะปมช่วยนำทางให้มั่นใจขึ้นค่ะ'
      };
    }

    if (goalId === 'drill4') {
      return {
        mode: 'micro_drill', difficulty: 'normal', personaId: 'standard', professionGroup: prof,
        headline: 'โหมด Micro-Drill 4 ด่านคำถามหนักเฉพาะจุด (ซ้อมไว 3 นาที)',
        reason: 'ซ้อมรับมือ 4 คำถามหินที่เจอบ่อยที่สุดเรียงต่อกัน เปลี่ยนตัวละครญาติอัตโนมัติทุกด่าน พร้อมตรวจให้คะแนนและเฉลยประโยคต้นแบบทันที',
        tip: 'ตอบให้ครบทั้งการรับฟังอารมณ์และข้อเท็จจริงคลินิกในแต่ละด่านเพื่อผ่าน 65% ขึ้นไปค่ะ',
        speech: 'แนะนำโหมดไมโครดริลล์สี่ด่านคำถามหนักค่ะ ใช้เวลาเพียงสามนาที ระบบจะเปลี่ยนตัวละครให้ตรงกับแต่ละคำถามพร้อมเฉลยประโยคต้นแบบทันทีค่ะ'
      };
    }

    if (goalId === 'hard_challenge') {
      const hardTarget = prof === 'พยาบาล' ? 'sbar_doctor' : 'distrust';
      return {
        mode: 'roleplay_th', difficulty: 'hard', personaId: hardTarget, professionGroup: prof,
        headline: hardTarget === 'sbar_doctor'
          ? 'โหมดท้าทาย Hard: ส่งเวร SBAR + Monitor เตือน BP 64/40!'
          : 'โหมดท้าทาย Hard + เหตุการณ์แทรกกลางห้อง (Curveballs)',
        reason: hardTarget === 'sbar_doctor'
          ? 'ซ่อนตัวช่วย 100% พร้อมจำลองสัญญาณเตือน Monitor เตียง 1 ความดันตกฉุกเฉิน BP 64/40 และเคสเตียง 3 แทรกกลางการส่งเวรกับ นพ.ภาคินค่ะ'
          : 'ซ่อนปุ่มแนวทางคำพูด 100% เพิ่มแรงเฉื่อย Trust และจำลองสายโทรศัพท์พี่ชายโทรแทรกมาคัดค้านหรือจังหวะญาติสะอื้นเงียบกลางห้องค่ะ',
        tip: 'ตั้งสติและคุมจังหวะการสื่อสารให้ชัดเจนแม่นยำภายใต้แรงกดดันหน้างานจริงค่ะ',
        speech: 'สำหรับโหมดท้าทาย แนะนำระดับฮาร์ดพร้อมเหตุการณ์ฉุกเฉินไม่คาดฝันกลางห้อง เพื่อฝึกการคุมสถานการณ์จริงค่ะ'
      };
    }

    if (goalId === 'conflict2') {
      return {
        mode: 'roleplay_th', difficulty: bestScore && bestScore >= 82 ? 'hard' : 'normal', personaId: 'conflict', professionGroup: prof,
        headline: 'เคสหิน 2 ตัวละครในห้อง (ภรรยา + คุณแม่ของคุณต้น)',
        reason: 'ฝึกวางตัวเป็นกลางเมื่อในห้องมีตัวละครญาติ 2 คน (ภรรยา และ คุณแม่) ที่เห็นต่างกันอย่างรุนแรง โดยแต่ละตัวละครจะขยับปากตรงตามเสียงผู้พูดจริง',
        tip: 'ยืนยันหลักจริยธรรมไทยว่าจะไม่ฝืนใจคุณแม่แม้มีบัตรบริจาค แล้วให้เวลาครอบครัวปรึกษากันค่ะ',
        speech: 'แนะนำเคสความขัดแย้งในครอบครัวค่ะ ห้องนี้จะมีตัวละครญาติสองคนคือภรรยาและคุณแม่อยู่ร่วมกัน เพื่อฝึกวางตัวเป็นกลางและประสานใจทั้งสองฝ่ายค่ะ'
      };
    }

    if (goalId === 'pediatric') {
      return {
        mode: 'roleplay_th', difficulty: bestScore && bestScore >= 84 ? 'hard' : 'normal', personaId: 'pediatric', professionGroup: prof,
        headline: 'เคสระดับสูงที่ 5: คุณแม่ผู้ป่วยเด็กอายุ 14 ปี (Bereavement Sensitivity)',
        reason: 'สถานการณ์ที่ละเอียดอ่อนและท้าทายหัวใจที่สุด ฝึกการอยู่เคียงข้างคุณแม่น้องต้นกล้า การคุมความนุ่มนวลของน้ำเสียง และการเว้นความเงียบเยียวยา 2.5 วิ',
        tip: 'สังเกตมาตรวัดน้ำเสียงสดขณะพูด และลองกดฟังเสียงตัวเองย้อนหลังในหน้าประเมินผลนะคะ',
        speech: 'แนะนำเคสที่ห้า เคสคุณแม่ผู้ป่วยเด็กอายุสิบสี่ปีค่ะ เคสนี้ละเอียดอ่อนมาก เน้นการประคับประคองความรู้สึกและการเว้นความเงียบเยียวยาค่ะ'
      };
    }

    if (goalId === 'sbar_team') {
      return {
        mode: 'roleplay_th', difficulty: 'normal', personaId: 'sbar_doctor', professionGroup: prof,
        headline: 'เคสระดับสูงที่ 6: ส่งเวร SBAR กับ นพ.ภาคิน (เกณฑ์ประเมิน SBAR 5 แกน)',
        reason: 'ฝึกสื่อสารทีมสหสาขาวิชาชีพแบบ SBAR เมื่อพบ Potential Donor (GCS 3, BP 78/46, ปัสสาวะ 640 mL/hr, Na 154) พร้อมเรดาร์ประเมินเฉพาะ S-B-A-R ทั้ง 5 แกน',
        tip: 'รายงานกระชับตามลำดับ S (ผู้ป่วย/GCS 3) → B (TBI) → A (สงสัย DI) → R (Fluid/Vasopressor, DDAVP & ODC) ค่ะ',
        speech: 'แนะนำเคสที่หก ฝึกส่งเวรแบบเอสบาร์กับนายแพทย์ภาคิน แพทย์เวรไอซียูค่ะ ใช้เกณฑ์เรดาร์ประเมินเอสบาร์ห้าแกนเฉพาะทางค่ะ'
      };
    }

    if (goalId === 'english') {
      return {
        mode: 'roleplay_en', difficulty: 'normal', personaId: 'standard', professionGroup: prof,
        headline: 'International English Family Approach (Roleplay EN + EN Quick Replies)',
        reason: 'ฝึกสื่อสารกับครอบครัวผู้ป่วยชาวต่างชาติด้วยหลัก SPIKES และ Decoupling ภาษาอังกฤษพร้อมปุ่มแนวทางคำพูดภาษาอังกฤษและตัวตรวจคำกระทบใจ EN',
        tip: 'หลีกเลี่ยงคำว่า pull the plug หรือ harvest และใช้ withdraw life-sustaining support แทนค่ะ',
        speech: 'แนะนำโหมดโรลเพลย์ภาษาอังกฤษค่ะ มีแนวทางคำพูดมาตรฐานภาษาอังกฤษให้เลือกฝึกตามหลักสไปค์สและดีคัปปลิ้งครบถ้วนค่ะ'
      };
    }

    // โหมด Auto: วิเคราะห์ตามกลุ่มวิชาชีพ + ประวัติจริง
    if (hist.length === 0) {
      if (prof === 'แพทย์') {
        return {
          mode: 'roleplay_th', difficulty: 'normal', personaId: 'standard', professionGroup: prof,
          headline: 'AI แนะนำสำหรับแพทย์: เคส 1 อธิบายเกณฑ์สมองตาย & เครื่องช่วยหายใจ',
          reason: 'สำหรับกลุ่มแพทย์ แนะนำเริ่มที่เคสคุณแพรวเพื่อซ้อมการอธิบายภาวะสมองตายและหลัก Decoupling ด้วยภาษาที่ญาติเข้าใจง่าย ก่อนต่อยอดสู่เคส 4 (ODC) และเคส 5 (ผู้ป่วยเด็ก) ค่ะ',
          tip: 'อธิบายความต่างระหว่างเครื่องช่วยหายใจกับก้านสมองหยุดทำงานถาวรโดยเลี่ยงศัพท์เทคนิคที่แข็งเกินไปค่ะ',
          speech: 'สวัสดีค่ะ สำหรับกลุ่มแพทย์ แนะนำเริ่มที่เคสคุณแพรวเพื่อซ้อมการอธิบายเกณฑ์ภาวะสมองตายและหลักดีคัปปลิ้งให้ญาติเข้าใจง่ายค่ะ'
        };
      }
      if (prof === 'บุคลากรสหวิชาชีพ') {
        return {
          mode: 'roleplay_th', difficulty: 'normal', personaId: 'belief', professionGroup: prof,
          headline: 'AI แนะนำสำหรับบุคลากรสหวิชาชีพ: เคส 2 ความเชื่อ ศาสนา & พิธีกรรม',
          reason: 'สำหรับกลุ่มบุคลากรสหวิชาชีพ แนะนำเริ่มที่เคสคุณฝนเพื่อฝึกการประคับประคองใจ เคารพความเชื่อครอบครัว และคลายข้อกังวลด้านพิธีกรรม ก่อนต่อยอดสู่เคส 3 และเคส 4 ค่ะ',
          tip: 'รับฟังความกังวลของคุณยายด้วยความเคารพก่อนเชื่อมโยงเรื่องทานบารมีและการดูแลร่างอย่างสมเกียรติค่ะ',
          speech: 'สวัสดีค่ะ สำหรับกลุ่มบุคลากรสหวิชาชีพ แนะนำเริ่มที่เคสคุณฝนเพื่อฝึกการรับฟังความเชื่อและประคับประคองใจครอบครัวก่อนนะคะ'
        };
      }
      return {
        mode: 'roleplay_th', difficulty: 'normal', personaId: 'standard', professionGroup: prof,
        headline: 'AI แนะนำสำหรับพยาบาล: เริ่มเคสคุณแพรว (Normal) → ต่อยอดเคส 3 & SBAR',
        reason: 'ยังไม่พบประวัติการฝึกสำหรับพยาบาลค่ะ แนะนำเริ่มต้นที่เคสคุณแพรวระดับ Normal เพื่อจับจังหวะคลายปม 3 ข้อและเว้นความเงียบ 2.5 วิ แล้วค่อยต่อยอดสู่เคส 3 (2 ตัวละคร) และเคส 6 (ส่งเวร SBAR) ค่ะ',
        tip: 'ใช้ปุ่ม “ขอคำใบ้เจาะปม” ได้ทันทีหากติดขัด และกดปุ่ม CC ด้านบนหากฝึกในหอผู้ป่วยที่เปิดเสียงไม่ได้ค่ะ',
        speech: 'สวัสดีค่ะคุณ' + nameShort + ' สำหรับพยาบาล แนะนำเริ่มที่เคสคุณแพรวระดับนอร์มอล เพื่อจับจังหวะคลายปมสามข้อและเว้นความเงียบสองจุดห้าวินาทีก่อนนะคะ'
      };
    }

    if (bestScore !== null && bestScore >= 85) {
      return {
        mode: 'roleplay_th',
        difficulty: 'hard',
        personaId: nextUnpracticed,
        professionGroup: prof,
        headline: 'AI แนะนำสำหรับ' + prof + ': อัปเกรดระดับ Hard (' + (nextUnpracticed === 'sbar_doctor' ? 'ส่งเวร SBAR + Monitor Alarm' : nextUnpracticed === 'conflict' ? 'เคส 2 ตัวละครในห้อง' : 'เคสใหม่ที่ยังไม่เคยฝึก') + ')',
        reason: 'คะแนนสูงสุดเดิมอยู่ที่ ' + bestScore + '/100 แล้วค่ะ! พร้อมท้าทายระดับ Hard พร้อมเหตุการณ์แทรกตรงตามบริบทของเคส' + (weakestAxis ? ' และช่วยเสริมแกน "' + weakestAxis.label + '" (' + weakestAxis.score + '/100)' : ''),
        tip: 'หลังจบเคสสามารถกด “บันทึกใบสรุปผลเรดาร์ (PNG)” เพื่อเก็บใส่พอร์ตสมรรถนะได้เลยค่ะ',
        speech: 'ยินดีด้วยค่ะคุณ' + nameShort + ' คะแนนเดิมสูงถึง ' + bestScore + ' คะแนนแล้ว รอบนี้แนะนำท้าทายระดับฮาร์ดพร้อมเหตุการณ์แทรกตรงตามบริบทค่ะ'
      };
    }

    return {
      mode: 'micro_drill',
      difficulty: 'normal',
      personaId: nextUnpracticed,
      professionGroup: prof,
      headline: 'AI แนะนำสำหรับ' + prof + ': ซ้อมเจาะจุดอ่อนด้วย Micro-Drill 4 ด่าน',
      reason: 'เคยฝึกมาแล้ว ' + hist.length + ' ครั้ง' + (weakestAxis ? ' พบว่าแกน "' + weakestAxis.label + '" (' + weakestAxis.score + '/100) ยังเสริมได้อีก' : '') + ' แนะนำซ้อม 4 ด่านคำถามหนักเพื่อเก็บคำตอบมาตรฐานให้แม่นก่อนลงสนามจริงค่ะ',
      tip: 'ดูประโยคต้นแบบที่ระบบเฉลยหลังจบแต่ละด่านแล้วนำไปปรับใช้ในโหมด Roleplay ได้เลยค่ะ',
      speech: 'สวัสดีค่ะคุณ' + nameShort + ' แนะนำซ้อมโหมดไมโครดริลล์สี่ด่านคำถามหนัก เพื่อเก็บประเด็นสำคัญให้แม่นยำยิ่งขึ้นค่ะ'
    };
  }

  function answerAdvisorQuestion(question) {
    const q = String(question || '').toLowerCase();
    if (q.includes('normal') || q.includes('hard') || q.includes('ต่างกัน')) {
      return '• ระดับ Normal: มี AI Coach, ปุ่มแนวทางคำพูด (รองรับทั้ง TH และ EN) และปุ่ม “ขอคำใบ้เจาะปม” ทีละข้อ\n• ระดับ Hard: ซ่อนตัวช่วย 100% และมีเหตุการณ์แทรกตรงตามบริบท (เคสญาติ: สายพี่ชายโทรแทรก/สะอื้นเงียบ | เคส 6 SBAR: สัญญาณเตือน Monitor BP ตกวิกฤต 64/40 และเคสฉุกเฉินเตียง 3 แทรก) ค่ะ';
    }
    if (q.includes('sbar') || q.includes('เคส 6') || q.includes('ประเมิน')) {
      return 'เคส 6 (ส่งเวร SBAR กับ นพ.ภาคิน) ใช้เกณฑ์เรดาร์ 5 แกนเฉพาะทาง SBAR โดยตรง ได้แก่ S (สถานการณ์/GCS 3), B (ประวัติ TBI/สัญญาณชีพ), A (ประเมิน Potential Donor & DI), ความกระชับสื่อสารทีม และ R (แผนพยุง BP, DDAVP & ประสาน ODC) ไม่ปะปนกับเกณฑ์เคสญาติค่ะ';
    }
    if (q.includes('คำใบ้') || q.includes('cc') || q.includes('คำบรรยาย')) {
      return '• ปุ่ม CC บนแถบด้านบนห้องฝึก (ค่าเริ่มต้นปิดไว้เพื่อความสะอาดตา) กดแตะเพื่อเปิด–ปิดคำบรรยายคู่สนทนาได้ทันที เหมาะเวลาฝึกในหอผู้ป่วยที่เปิดเสียงไม่ได้ค่ะ\n• ปุ่ม “คำใบ้เจาะปม” (ใน Normal Mode) จะวิเคราะห์ว่าเหลือปมในใจข้อไหนที่ยังไม่ได้ปลดล็อก แล้วแนะนำแนวทาง 1 ประโยคให้ตรงจุดค่ะ';
    }
    if (q.includes('น้ำเสียง') || q.includes('อัดเสียง') || q.includes('pdpa') || q.includes('ฟังเสียง')) {
      return 'ระบบใช้ Web Audio API บนอุปกรณ์ของท่านวัดความนุ่มนวลน้ำเสียงและขยับปากตัวละครตามคลื่นเสียงจริง โดยบันทึกเสียงพูดไว้เฉพาะในหน่วยความจำชั่วคราว (RAM) ไม่มีการอัปโหลดขึ้นเซิร์ฟเวอร์ (PDPA 100%) และลบทิ้งทันทีเมื่อปิดหน้าค่ะ';
    }
    return 'กดปุ่ม “เลือกตามที่ AI แนะนำทันที” เพื่อให้ระบบตั้งค่าให้ตรงกับกลุ่มวิชาชีพและประวัติการฝึกของท่านได้เลยค่ะ ตัวละครโฮโลแกรม 3 มิติจะปรับเพศ ทรงผม และจำนวนคนตามเคสให้อัตโนมัติค่ะ';
  }

  // ==========================================================================
  // 6.5 ZERO-COST UPGRADES: LINE DETECTOR, LATENCY MASK, VOCAL & REAL LIP-SYNC ANALYSER
  // ==========================================================================
  function detectInAppBrowser() {
    const ua = typeof navigator !== 'undefined' ? String(navigator.userAgent || '') : '';
    const isLine = /\bLine\//i.test(ua);
    const isFb = /FBAN|FBAV/i.test(ua);
    const isIg = /Instagram/i.test(ua);
    const isInApp = isLine || isFb || isIg;
    const appName = isLine ? 'LINE' : isFb ? 'Facebook' : isIg ? 'Instagram' : '';

    let externalUrl = '';
    try {
      const u = new URL(global.location.href);
      if (isLine) u.searchParams.set('openExternalBrowser', '1');
      externalUrl = u.toString();
    } catch (_) {
      externalUrl = global.location ? String(global.location.href || '') : '';
    }

    return { isInApp: isInApp, isLine: isLine, appName: appName, externalUrl: externalUrl };
  }

  const LATENCY_MASK_CUES = {
    standard: [
      'คุณแพรวกำลังสูดลมหายใจลึกๆ และซับน้ำตาเบาๆ...',
      'คุณแพรวก้มมองมือตัวเอง นิ่งคิดตามคำอธิบายของคุณ...',
      'คุณแพรวค่อยๆ เงยหน้าขึ้นเหมือนกำลังรวบรวมความกล้าถามต่อ...'
    ],
    belief: [
      'คุณฝนพยักหน้าช้าๆ และครุ่นคิดถึงความรู้สึกของคุณยาย...',
      'คุณฝนกำกระดาษทิชชูแน่นขึ้นเล็กน้อยขณะไตร่ตรองคำพูดของคุณ...',
      'คุณฝนถอนหายใจแผ่วเบาเหมือนกำลังชั่งน้ำหนักในใจ...'
    ],
    conflict: [
      'ภรรยาและคุณแม่หันสบตากันชั่วครู่ บรรยากาศในห้องเงียบลง...',
      'คุณแม่นิ่งฟังคำพูดของคุณด้วยสีหน้าที่กำลังครุ่นคิด...',
      'ภรรยาค่อยๆ เอื้อมมือไปแตะแขนคุณแม่เบาๆ ระหว่างรอฟัง...'
    ],
    distrust: [
      'คุณนุชขมวดคิ้วเล็กน้อยและทบทวนข้อมูลที่คุณเพิ่งชี้แจง...',
      'คุณนุชเงียบฟังอย่างตั้งใจ เหมือนกำลังประเมินความโปร่งใสของคำตอบ...',
      'คุณนุชค่อยๆ คลายมือที่กอดอกลงเล็กน้อยขณะคิดตาม...'
    ],
    pediatric: [
      'คุณแม่กอดกระเป๋านักเรียนของน้องต้นกล้าแน่นขึ้น สะอื้นแผ่วเบา...',
      'คุณแม่หลับตาลงครู่หนึ่ง พยายามกลั้นน้ำตาก่อนจะพูดต่อ...',
      'ความเงียบแผ่ปกคลุมห้อง คุณแม่ค่อยๆ หายใจเข้าลึกๆ...'
    ],
    sbar_doctor: [
      'นพ.ภาคินกำลังก้มดูค่าความดัน ปริมาณปัสสาวะ และผลโซเดียมบนมอนิเตอร์...',
      'นพ.ภาคินจดบันทึกข้อมูล SBAR ของคุณลงใบ Order อย่างรวดเร็ว...',
      'นพ.ภาคินพยักหน้ารับและกำลังประเมินแนวทางการรักษาเร่งด่วน...'
    ]
  };

  function pickLatencyMaskCue(personaId, isEn) {
    if (isEn) {
      return personaId === 'sbar_doctor'
        ? 'The ICU physician is reviewing the bedside monitor and lab values...'
        : 'The relative takes a slow breath, gently wiping away tears before responding...';
    }
    const list = LATENCY_MASK_CUES[personaId] || LATENCY_MASK_CUES.standard;
    return list[Math.floor(Math.random() * list.length)];
  }

  /**
   * Real Audio-Amplitude Lip-Sync Analyser (ชุดที่ 1 • 0 บาท):
   * เชื่อม <audio> ที่เล่นไฟล์เสียง AI 24kHz เข้ากับ Web Audio API AnalyserNode
   * เพื่อให้ปากของตัวละครอนิเมะ 3 มิติอ้ากว้างตามคำที่เน้นเสียงและหุบสนิทตรงช่วงเว้นวรรคหายใจ
   */
  const _linkedAudioNodes = typeof WeakMap !== 'undefined' ? new WeakMap() : null;

  function createAudioLipSyncAnalyser(audioEl) {
    if (!audioEl) {
      return { getAmplitude: function () { return -1; }, resume: function () {} };
    }
    if (_linkedAudioNodes && _linkedAudioNodes.has(audioEl)) {
      return _linkedAudioNodes.get(audioEl);
    }

    let ctx = null;
    let analyser = null;
    let dataArr = null;
    let connected = false;

    try {
      const AudioCtx = global.AudioContext || global.webkitAudioContext;
      if (AudioCtx) {
        ctx = new AudioCtx();
        const src = ctx.createMediaElementSource(audioEl);
        analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.52;
        src.connect(analyser);
        analyser.connect(ctx.destination);
        dataArr = new Uint8Array(analyser.fftSize);
        connected = true;
      }
    } catch (_) {
      connected = false;
    }

    const controller = {
      resume: function () {
        if (ctx && ctx.state === 'suspended') {
          ctx.resume().catch(function () {});
        }
      },
      getAmplitude: function () {
        if (!connected || !analyser || !dataArr || audioEl.paused || audioEl.ended) {
          return -1;
        }
        try {
          if (ctx && ctx.state === 'suspended') ctx.resume().catch(function () {});
          analyser.getByteTimeDomainData(dataArr);
          let sumSq = 0;
          for (let i = 0; i < dataArr.length; i++) {
            const norm = (dataArr[i] - 128) / 128;
            sumSq += norm * norm;
          }
          const rms = Math.sqrt(sumSq / dataArr.length);
          // ตัดเสียงรบกวนพื้นหลังเบาๆ เพื่อให้ปากหุบสนิทตรงช่วงหยุดหายใจระหว่างประโยค
          if (rms < 0.012) return 0;
          return Math.min(1, Math.max(0, (rms - 0.012) * 5.8));
        } catch (_) {
          return -1;
        }
      }
    };

    if (_linkedAudioNodes) {
      try { _linkedAudioNodes.set(audioEl, controller); } catch (_) {}
    }
    return controller;
  }

  function createVocalToneRecorder() {
    let mediaStream = null;
    let audioCtx = null;
    let analyser = null;
    let mediaRecorder = null;
    let chunks = [];
    let sampleTimer = null;
    let startedAt = 0;
    let active = false;
    let speakingFrames = 0;
    let gentleFrames = 0;
    let loudFrames = 0;
    let dbSum = 0;
    let peakDb = -60;
    let lastLiveCb = null;

    function pickSupportedMime() {
      if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') return '';
      const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
      for (let i = 0; i < candidates.length; i++) {
        try {
          if (MediaRecorder.isTypeSupported(candidates[i])) return candidates[i];
        } catch (_) {}
      }
      return '';
    }

    async function start(onLiveMetric) {
      if (active) return true;
      lastLiveCb = typeof onLiveMetric === 'function' ? onLiveMetric : null;
      if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
        return false;
      }
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
        });
        const AudioCtx = global.AudioContext || global.webkitAudioContext;
        if (AudioCtx) {
          audioCtx = new AudioCtx();
          if (audioCtx.state === 'suspended') audioCtx.resume().catch(function () {});
          const src = audioCtx.createMediaStreamSource(mediaStream);
          analyser = audioCtx.createAnalyser();
          analyser.fftSize = 512;
          analyser.smoothingTimeConstant = 0.72;
          src.connect(analyser);
        }

        chunks = [];
        if (typeof MediaRecorder !== 'undefined') {
          const mime = pickSupportedMime();
          mediaRecorder = mime ? new MediaRecorder(mediaStream, { mimeType: mime }) : new MediaRecorder(mediaStream);
          mediaRecorder.ondataavailable = function (ev) {
            if (ev.data && ev.data.size > 0) chunks.push(ev.data);
          };
          try { mediaRecorder.start(250); } catch (_) {}
        }

        speakingFrames = 0;
        gentleFrames = 0;
        loudFrames = 0;
        dbSum = 0;
        peakDb = -60;
        startedAt = Date.now();
        active = true;

        const dataArr = analyser ? new Uint8Array(analyser.fftSize) : null;
        sampleTimer = setInterval(function () {
          if (!active || !analyser || !dataArr) return;
          analyser.getByteTimeDomainData(dataArr);
          let sumSq = 0;
          for (let i = 0; i < dataArr.length; i++) {
            const norm = (dataArr[i] - 128) / 128;
            sumSq += norm * norm;
          }
          const rms = Math.sqrt(sumSq / dataArr.length);
          const db = rms > 0.0001 ? Math.max(-60, Math.min(0, Math.round(20 * Math.log10(rms)))) : -60;
          const level = Math.max(0, Math.min(100, Math.round(((db + 55) / 50) * 100)));

          let status = 'quiet';
          let labelTH = 'กำลังรอฟังเสียงพูด...';
          if (db > -44) {
            speakingFrames += 1;
            dbSum += db;
            if (db > peakDb) peakDb = db;
            if (db >= -10) {
              loudFrames += 1;
              status = 'loud';
              labelTH = 'เสียงค่อนข้างดัง • ผ่อนโทนให้ละมุนลงอีกนิดนะคะ';
            } else {
              gentleFrames += 1;
              status = 'gentle';
              labelTH = 'น้ำเสียงนุ่มนวลเหมาะสม ✓';
            }
          }
          if (lastLiveCb) {
            lastLiveCb({ db: db, level: level, status: status, labelTH: labelTH });
          }
        }, 90);

        return true;
      } catch (_) {
        cleanupTracks();
        return false;
      }
    }

    function cleanupTracks() {
      if (sampleTimer) { clearInterval(sampleTimer); sampleTimer = null; }
      if (mediaStream) {
        try { mediaStream.getTracks().forEach(function (t) { t.stop(); }); } catch (_) {}
        mediaStream = null;
      }
      if (audioCtx) {
        try { audioCtx.close(); } catch (_) {}
        audioCtx = null;
      }
      analyser = null;
      active = false;
    }

    function stop() {
      return new Promise(function (resolve) {
        if (!active) return resolve(null);
        const durationSec = Math.max(0.5, Number(((Date.now() - startedAt) / 1000).toFixed(1)));
        const avgDb = speakingFrames > 0 ? Math.round(dbSum / speakingFrames) : -40;
        const gentleRatio = speakingFrames > 0 ? gentleFrames / speakingFrames : 0.85;
        const calmScore = Math.max(45, Math.min(100, Math.round(60 + gentleRatio * 40 - (loudFrames > 6 ? 12 : 0))));
        const toneLabel = calmScore >= 85
          ? 'น้ำเสียงนุ่มนวล อบอุ่น สม่ำเสมอ'
          : calmScore >= 70
            ? 'น้ำเสียงสุภาพ ชัดเจน (มีจังหวะหนักเล็กน้อย)'
            : 'น้ำเสียงค่อนข้างดังหรือตึงเครียด ลองผ่อนโทนลงนะคะ';

        const finalize = function () {
          let audioUrl = '';
          try {
            if (chunks.length > 0) {
              const mime = (mediaRecorder && mediaRecorder.mimeType) || 'audio/webm';
              const blob = new Blob(chunks, { type: mime });
              if (blob.size > 400) audioUrl = URL.createObjectURL(blob);
            }
          } catch (_) {}
          mediaRecorder = null;
          chunks = [];
          cleanupTracks();
          resolve({
            audioUrl: audioUrl,
            durationSec: durationSec,
            avgDb: avgDb,
            peakDb: peakDb,
            calmScore: calmScore,
            toneLabel: toneLabel
          });
        };

        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          try {
            mediaRecorder.onstop = finalize;
            mediaRecorder.stop();
            return;
          } catch (_) {}
        }
        finalize();
      });
    }

    function abort() {
      try {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          mediaRecorder.onstop = null;
          mediaRecorder.stop();
        }
      } catch (_) {}
      mediaRecorder = null;
      chunks = [];
      cleanupTracks();
    }

    return { start: start, stop: stop, abort: abort, isActive: function () { return active; } };
  }

  const SELF_EFFICACY_ITEMS = [
    { key: 'explainBrainDeath', labelTH: '1. ความมั่นใจในการอธิบายภาวะสมองตายและเครื่องช่วยหายใจให้ญาติเข้าใจ' },
    { key: 'handleEmotion', labelTH: '2. ความมั่นใจในการรับมืออารมณ์ช็อก โศกเศร้า หรือความขัดแย้งในครอบครัว' },
    { key: 'gentleApproach', labelTH: '3. ความมั่นใจในการให้ข้อมูลเรื่องการบริจาคอวัยวะอย่างอ่อนโยนและไม่เร่งรัด' }
  ];

  const SUS_ITEMS = [
    { key: 's1', positive: true, labelTH: '1. ฉันอยากกลับมาใช้ระบบนี้เพื่อฝึกทบทวนอีกอย่างสม่ำเสมอ' },
    { key: 's2', positive: false, labelTH: '2. ฉันรู้สึกว่าระบบมีความซับซ้อนเกินความจำเป็น' },
    { key: 's3', positive: true, labelTH: '3. ฉันรู้สึกว่าระบบนี้ใช้งานง่ายและเข้าใจขั้นตอนได้ทันที' },
    { key: 's4', positive: false, labelTH: '4. ฉันรู้สึกว่าต้องให้ผู้เชี่ยวชาญช่วยสอนจึงจะใช้งานระบบนี้ได้' },
    { key: 's5', positive: true, labelTH: '5. ฉันรู้สึกมั่นใจขณะใช้งานระบบนี้บนอุปกรณ์ของฉัน' }
  ];

  function computeSusScore(answersObj) {
    const a = answersObj || {};
    let sum = 0;
    let count = 0;
    SUS_ITEMS.forEach(function (item) {
      const val = Number(a[item.key]);
      if (val >= 1 && val <= 5) {
        sum += item.positive ? (val - 1) : (5 - val);
        count += 1;
      }
    });
    if (count === 0) return null;
    return Math.round((sum / (count * 4)) * 100);
  }

  function buildBlindTranscript(messages, learnerName) {
    const cleanName = String(learnerName || '').replace(/^(พว\.|นพ\.|พญ\.|คุณ)/, '').trim();
    const esc = cleanName ? cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '';
    const nameRx = esc && esc.length >= 2 ? new RegExp(esc, 'gi') : null;
    return (Array.isArray(messages) ? messages : [])
      .map(function (m, idx) {
        let txt = String(m.text || '').replace(/\s+/g, ' ').trim();
        if (nameRx) txt = txt.replace(nameRx, '[LEARNER]');
        return {
          turn: idx + 1,
          role: m.role === 'user' ? 'LEARNER' : 'RELATIVE',
          emotion: m.emotion || '',
          text: txt.slice(0, 500)
        };
      })
      .slice(0, 24);
  }

  function computeClinicalBadges(userObj) {
    const hist = Array.isArray(userObj && userObj.skillLabHistory) ? userObj.skillLabHistory : [];
    const hasSilence = hist.some(function (h) { return Number(h.silenceCount || 0) >= 2; });
    const hasGentle = hist.some(function (h) { return Number(h.triggerTotal || 0) === 0 && Number(h.score || 0) >= 75; });
    const hasDual = hist.some(function (h) { return h.personaId === 'conflict' && Number(h.score || 0) >= 85; });
    const hasHard = hist.some(function (h) { return h.difficultyId === 'hard' && Number(h.score || 0) >= 75; });
    const hasAdv = hist.some(function (h) { return (h.personaId === 'pediatric' || h.personaId === 'sbar_doctor') && Number(h.score || 0) >= 75; });

    return [
      { id: 'master_silence', titleTH: 'Master of Silence', descTH: 'เว้นความเงียบเยียวยา 2.5 วิ ≥ 2 ครั้ง', color: '#38bdf8', earned: hasSilence },
      { id: 'gentle_comm', titleTH: 'Gentle Communicator', descTH: 'จบเคสโดยไร้คำกระทบใจ (0 Trigger)', color: '#34d399', earned: hasGentle },
      { id: 'dual_peacemaker', titleTH: 'Dual-Voice Peacemaker', descTH: 'ผ่านเคสขัดแย้ง 2 เสียง ≥ 85 คะแนน', color: '#f43f5e', earned: hasDual },
      { id: 'hard_survivor', titleTH: 'Hard Mode Survivor', descTH: 'ผ่านโหมด Hard + เหตุการณ์แทรก', color: '#fbbf24', earned: hasHard },
      { id: 'advanced_clinician', titleTH: 'Pediatric / SBAR Pro', descTH: 'ผ่านเคสผู้ป่วยเด็กหรือส่งเวร SBAR', color: '#c084fc', earned: hasAdv }
    ];
  }

  // ==========================================================================
  // 7. TRIGGER-WORD POLISHER, PARSER & CONTEXT-AWARE 5-AXIS EVALUATOR (FAMILY vs. SBAR)
  // ==========================================================================
  const FALLBACK_TRIGGERS = [
    { id: 'unplug', lang: 'th', pattern: /ถอดเครื่อง|ปิดเครื่อง|ดึงสาย|ถอดสาย/, flagged: 'ถอดเครื่อง / ปิดเครื่อง', softer: 'ยุติการใช้เครื่องพยุงชีพอย่างสงบ' },
    { id: 'corpse', lang: 'th', pattern: /ศพ|ซาก|คนตาย/, flagged: 'ศพ / คนตาย', softer: 'ร่างของผู้เสียชีวิต / ท่าน' },
    { id: 'cut_out', lang: 'th', pattern: /ผ่าเอา|ควัก|ตัดเอา|ชำแหละ/, flagged: 'ผ่าเอา / ควัก', softer: 'ดูแลจัดเก็บอวัยวะอย่างประณีต' },
    { id: 'hopeless', lang: 'th', pattern: /ไม่รอดแล้ว|หมดหวังแล้ว|ตายแล้ว|ทำใจเถอะ/, flagged: 'ไม่รอดแล้ว / ทำใจเถอะ', softer: 'ก้านสมองหยุดทำงานถาวร ทีมแพทย์ดูแลสุดความสามารถแล้ว' },
    { id: 'rush', lang: 'th', pattern: /รีบตัดสินใจ|ต้องรีบ|เดี๋ยวไม่ทัน|เซ็นเลย/, flagged: 'รีบตัดสินใจ / เซ็นเลย', softer: 'ให้เวลาครอบครัวค่อยๆ ปรึกษากันโดยไม่เร่งรัด' },
    { id: 'unplug_en', lang: 'en', pattern: /pull the plug|turn off the machine|unplug/i, flagged: 'pull the plug', softer: 'withdraw life-sustaining support peacefully' },
    { id: 'harvest_en', lang: 'en', pattern: /harvest|cut out|corpse/i, flagged: 'harvest / corpse', softer: 'respectfully recover organs / your loved one' },
    { id: 'rush_en', lang: 'en', pattern: /decide now|hurry up|sign immediately/i, flagged: 'decide now / hurry up', softer: 'take all the private time your family needs' }
  ];

  function detectTriggerPhrases(text, lang, personaId) {
    // ในเคส 6 (ส่งเวร SBAR กับแพทย์เวร) ตรวจเฉพาะคำไม่สุภาพ/ไม่เหมาะสมเชิงวิชาชีพ หลีกเลี่ยงการจับคำคลินิกปกติ
    if (personaId === 'sbar_doctor') {
      return [];
    }
    const dict = Array.isArray(global.TRIGGER_PHRASE_DICTIONARY) && global.TRIGGER_PHRASE_DICTIONARY.length > 0
      ? global.TRIGGER_PHRASE_DICTIONARY
      : FALLBACK_TRIGGERS;
    const str = String(text || '');
    const hits = [];
    dict.forEach(function (item) {
      if (lang && item.lang && item.lang !== lang) return;
      if (item.pattern && item.pattern.test(str)) hits.push(item);
    });
    return hits;
  }

  function parseRelativeResponse(rawText, fallbackEmotion) {
    let text = String(rawText || '').trim();
    let emotion = fallbackEmotion || 'CONFUSED';
    let actionCue = '';
    let coachHint = '';
    let outcome = '';

    const emoM = text.match(/\[EMOTION\s*:\s*(SHOCK|CONFUSED|ANGRY|SAD|HESITANT|CALM)\]/i);
    if (emoM) {
      emotion = emoM[1].toUpperCase();
      text = text.replace(emoM[0], '').trim();
    }

    const actM = text.match(/\[ACTION\s*:\s*([^\]]+)\]/i);
    if (actM) {
      actionCue = actM[1].trim();
      text = text.replace(actM[0], '').trim();
    }

    const coachM = text.match(/\[COACH\s*:\s*([^\]]+)\]/i);
    if (coachM) {
      coachHint = coachM[1].trim();
      text = text.replace(coachM[0], '').trim();
    }

    const outM = text.match(/\[OUTCOME\s*:\s*(CONSENT|CONSULT|DECLINE)\]/i);
    if (outM) {
      outcome = outM[1].toUpperCase();
      text = text.replace(outM[0], '').trim();
    }

    text = text.replace(/\[(EMOTION|ACTION|COACH|OUTCOME)[^\]]*\]/gi, '').trim();

    return {
      speech: text || 'ขอโทษนะคะ... ตอนนี้ใจหนูยังสั่นอยู่เลยค่ะ ช่วยอธิบายช้าๆ อีกครั้งได้ไหมคะ?',
      emotion: EMOTIONS[emotion] ? emotion : 'CONFUSED',
      actionCue: actionCue,
      coachHint: coachHint,
      outcome: outcome
    };
  }

  function splitDualSpeakerSegments(speechText, personaId, lang) {
    const voices = getCaseVoices(personaId);
    const clean = String(speechText || '').trim();
    if (personaId !== 'conflict') {
      return [{ speaker: 'primary', label: voices.labelPrimary, voiceName: voices.primary, text: clean }];
    }

    const regex = /\[(ภรรยา|คุณแม่|คุณแม่แทรก[^\]]*|Wife|Mother[^\]]*)\]\s*:?/gi;
    const matches = [];
    let m;
    while ((m = regex.exec(clean)) !== null) {
      matches.push({ index: m.index, end: m.index + m[0].length, tag: m[1] });
    }

    if (matches.length === 0) {
      return [{ speaker: 'wife', label: voices.labelPrimary, voiceName: voices.primary, text: clean }];
    }

    const segments = [];
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].end;
      const end = i + 1 < matches.length ? matches[i + 1].index : clean.length;
      const body = clean.slice(start, end).trim();
      if (!body) continue;
      const isMother = /แม่|mother/i.test(matches[i].tag);
      segments.push({
        speaker: isMother ? 'mother' : 'wife',
        label: isMother ? (lang === 'en' ? 'Mother' : 'คุณแม่') : (lang === 'en' ? 'Wife' : 'ภรรยา'),
        voiceName: isMother ? voices.secondary : voices.primary,
        text: body
      });
    }
    return segments.length > 0
      ? segments
      : [{ speaker: 'wife', label: voices.labelPrimary, voiceName: voices.primary, text: clean }];
  }

  function extractIntroducedLearnerName(userText) {
    const s = String(userText || '');
    const m = s.match(/(?:ดิฉัน|ผม|หนู|กระผม|พี่)?\s*(?:ชื่อ|คือ)\s*(?:พว\.|พยาบาล|คุณ|พี่|หมอ)?\s*([ก-๙A-Za-z]{2,16})/);
    if (!m || !m[1]) return '';
    const candidate = m[1].trim();
    if (/ผู้ประสานงาน|พยาบาล|เจ้าหน้าที่|อะไร|ไหม|ครับ|ค่ะ/.test(candidate)) return '';
    return candidate;
  }

  /**
   * ประเมินผล 5 แกนแบบแยกบริบท (เคส 6 SBAR ใช้เกณฑ์ SBAR Clinical Handoff • เคส 1–5 ใช้เกณฑ์ Family Approach)
   */
  function evaluateConversationFallback(params) {
    const personaId = params.personaId || 'standard';
    const isSbar = personaId === 'sbar_doctor';
    const axes = getRadarAxes(personaId);
    const msgs = Array.isArray(params.messages) ? params.messages : [];
    const userMsgs = msgs.filter(function (m) { return m.role === 'user'; });
    const allUserText = userMsgs.map(function (m) { return m.text || ''; }).join(' ');
    const barriersUnlocked = Number(params.barriersUnlocked || 0);
    const silenceCount = Number(params.silenceCount || 0);
    const triggerTotal = Number(params.triggerTotal || 0);
    const finalTrust = Number(params.finalTrust || 50);

    const bestUserMsg = userMsgs.reduce(function (best, cur) {
      return (cur.text || '').length > (best.text || '').length ? cur : best;
    }, userMsgs[0] || { text: '' });

    if (isSbar) {
      const sScore = Math.min(98, 60 + (/เตียง\s*1|ชาย.*38|GCS\s*=?\s*3|BP|78\/46|64\/40|ความดัน|bed\s*1/i.test(allUserText) ? 28 : 8) + Math.min(10, barriersUnlocked * 3));
      const bScore = Math.min(98, 58 + (/TBI|อุบัติเหตุ|ม่านตา|pupil|640|ปัสสาวะ|154|Na|โซเดียม/i.test(allUserText) ? 28 : 8) + Math.min(10, barriersUnlocked * 3));
      const aScore = Math.min(98, 56 + (/potential\s*donor|ผู้บริจาค|สมองตาย|เบาจืด|\bDI\b|diabetes\s*insipidus|hypotension|hypernatremia/i.test(allUserText) ? 30 : 8) + Math.min(12, barriersUnlocked * 4));
      const conciseScore = Math.min(98, 68 + (userMsgs.length >= 2 && userMsgs.length <= 5 ? 18 : 10) + (/SBAR|สถานการณ์|ประเมิน|เสนอ|recommend/i.test(allUserText) ? 10 : 0));
      const rScore = Math.min(98, 56 + (/DDAVP|desmopressin|สารน้ำ|fluid|vasopressor|กระตุ้นความดัน|ตรวจสมองตาย|ODC|ประสาน/i.test(allUserText) ? 32 : 8) + Math.min(10, barriersUnlocked * 3));

      const rMap = { setting: sScore, empathy: bScore, clarity: aScore, vocal: conciseScore, dignity: rScore };
      const totalScore = Math.round((sScore + bScore + aScore + conciseScore + rScore) / 5);

      return {
        score: totalScore,
        personaId: 'sbar_doctor',
        radar: axes.map(function (a) { return { key: a.key, labelTH: a.labelTH, shortTH: a.shortTH, value: rMap[a.key] }; }),
        radarMap: rMap,
        goldenMoment: bestUserMsg && bestUserMsg.text
          ? '“' + bestUserMsg.text.slice(0, 130) + (bestUserMsg.text.length > 130 ? '...' : '') + '” — รายงานข้อมูลวิกฤตและข้อเสนอแนะเชิงคลินิกได้ตรงประเด็น SBAR ดีมากค่ะ'
          : 'ส่งเวรกับแพทย์เวร ICU ได้อย่างเป็นระบบค่ะ',
        turningPoint: barriersUnlocked < 3
          ? 'ยังรายงานองค์ประกอบ SBAR ไม่ครบ 3 เป้าหมายหลัก ลองเน้นตัวเลขสัญญาณชีพ (BP/UO/Na), การประเมินภาวะเบาจืด (DI) และขอ Order สารน้ำ/Vasopressor/DDAVP พร้อมแผนประสาน ODC ให้ครบใน 2 รอบแรกนะคะ'
          : 'ส่งเวร SBAR ครบถ้วนแม่นยำมากค่ะ ลองท้าทายโหมด Hard ที่มีสัญญาณ Monitor เตือน BP ตกวิกฤต 64/40 เพื่อฝึกการรับมือภาวะฉุกเฉินต่อได้เลยค่ะ',
        summary: 'ความชัดเจนทีมแพทย์ (SBAR) ' + finalTrust + '% • ครอบคลุมเป้าหมาย SBAR ' + barriersUnlocked + '/3 ข้อ',
        source: 'local_sbar_clinical_rubric'
      };
    }

    const settingScore = Math.min(98, 66 + (/สวัสดี|ขออนุญาต|พยาบาล|ผู้ประสานงาน|ส่วนตัว|เงียบ|hello|coordinator|private/i.test(allUserText) ? 20 : 6) + Math.min(10, userMsgs.length * 2));
    const empathyScore = Math.min(98, Math.max(40, 58 + (/เสียใจ|เข้าใจ|หนักมาก|อยู่ตรงนี้|รับฟัง|กังวล|sorry|understand|feel/i.test(allUserText) ? 20 : 4) + barriersUnlocked * 6 - triggerTotal * 8));
    const clarityScore = Math.min(98, 56 + (/สมองตาย|เครื่องช่วยหายใจ|ก้านสมอง|สภากาชาด|ODC|ไม่มีค่าใช้จ่าย|brain\s*death|ventilator|red\s*cross/i.test(allUserText) ? 22 : 6) + barriersUnlocked * 6);
    const vocalScore = Math.min(98, Math.max(45, 64 + silenceCount * 10 - triggerTotal * 7));
    const dignityScore = Math.min(98, Math.max(42, 60 + (/ไม่เร่ง|ให้เวลา|ปรึกษา|ตกแต่งร่าง|เรียบร้อย|สมเกียรติ|ไม่ฝืนใจ|no\s*rush|dignity|respect/i.test(allUserText) ? 24 : 6) - triggerTotal * 10));

    const rMap = { setting: settingScore, empathy: empathyScore, clarity: clarityScore, vocal: vocalScore, dignity: dignityScore };
    const totalScore = Math.round((settingScore + empathyScore + clarityScore + vocalScore + dignityScore) / 5);

    return {
      score: totalScore,
      personaId: personaId,
      radar: axes.map(function (a) { return { key: a.key, labelTH: a.labelTH, shortTH: a.shortTH, value: rMap[a.key] }; }),
      radarMap: rMap,
      goldenMoment: bestUserMsg && bestUserMsg.text
        ? '“' + bestUserMsg.text.slice(0, 120) + (bestUserMsg.text.length > 120 ? '...' : '') + '” — แสดงความตั้งใจสื่อสารและประคับประคองความรู้สึกได้ดีค่ะ'
        : 'เริ่มต้นบทสนทนาได้อย่างสุภาพและเป็นระบบค่ะ',
      turningPoint: triggerTotal > 0
        ? 'พบการใช้คำที่อาจกระทบใจญาติ ' + triggerTotal + ' ครั้ง ลองเปลี่ยนไปใช้ถ้อยคำที่นุ่มนวลกว่าและเน้นหลักไม่เร่งรัดนะคะ'
        : silenceCount === 0
          ? 'ลองเพิ่มจังหวะเว้นความเงียบ 2.5 วินาที (Therapeutic Silence) หลังญาติแสดงความโศกเศร้า เพื่อให้ญาติรู้สึกว่ามีพื้นที่ปลอดภัยค่ะ'
          : 'ทำได้ดีมากค่ะ ลองท้าทายระดับ Hard หรือเคสความขัดแย้ง 2 ตัวละครเพื่อเพิ่มความชำนาญหน้างานจริงค่ะ',
      summary: 'ความไว้วางใจสุดท้าย ' + finalTrust + '% • คลายปมในใจได้ ' + barriersUnlocked + '/3 ข้อ • เว้นความเงียบเยียวยา ' + silenceCount + ' ครั้ง',
      source: 'local_clinical_rubric'
    };
  }

  function buildSupervisorEvaluationPrompt(params) {
    const isSbar = params.personaId === 'sbar_doctor';
    const transcript = (params.messages || [])
      .map(function (m) { return (m.role === 'user' ? 'ผู้เรียน: ' : (isSbar ? 'นพ.ภาคิน: ' : 'ญาติผู้ป่วย: ')) + (m.text || ''); })
      .join('\n');

    if (isSbar) {
      return 'คุณคืออาจารย์แพทย์/พยาบาลวิกฤตผู้เชี่ยวชาญด้านการดูแล Potential Donor และการสื่อสารทีมแบบ SBAR (AI Clinical Supervisor)\n' +
        'ประเมินการส่งเวร SBAR ต่อไปนี้กับ นพ.ภาคิน แพทย์เวร ICU (ผู้ป่วย TBI, GCS 3, BP 78/46, UO 640 mL/hr, Na 154)\n' +
        'ข้อมูลเสริม: ครอบคลุมเป้าหมาย SBAR ' + (params.barriersUnlocked || 0) + '/3 ข้อ, ความมั่นใจทีมสุดท้าย ' + (params.finalTrust || 50) + '%\n\n' +
        'บทสนทนา:\n' + transcript + '\n\n' +
        'ตอบกลับเป็น JSON ล้วนเท่านั้น (ห้ามใส่ markdown หรือคำอธิบายอื่น) โดยแมปคะแนน SBAR ลงฟิลด์ทั้ง 5 ดังนี้:\n' +
        '{"setting":0-100 (S: สถานการณ์และตัวตนเคส),"empathy":0-100 (B: ประวัติ TBI และสัญญาณชีพ),"clarity":0-100 (A: ประเมิน Potential Donor และเบาจืด DI),"vocal":0-100 (ความกระชับแม่นยำในการสื่อสารทีม),"dignity":0-100 (R: ข้อเสนอ Fluid/Vasopressor, DDAVP และประสาน ODC),"goldenMoment":"ยกประโยคส่งเวรที่แม่นยำที่สุด 1 ประโยค","turningPoint":"ชี้ 1 จุดคลินิกที่ควรเสริมให้ครบ SBAR","summary":"สรุปภาพรวมการส่งเวร SBAR 2 บรรทัดภาษาไทย"}';
    }

    return 'คุณคืออาจารย์พยาบาลผู้เชี่ยวชาญด้าน Family Approach (AI Clinical Supervisor)\n' +
      'ประเมินบทสนทนาจริงต่อไปนี้ในเคส: ' + (params.personaTitle || '') + '\n' +
      'ข้อมูลเสริม: คลายปมในใจ ' + (params.barriersUnlocked || 0) + '/3 ข้อ, เว้นความเงียบ 2.5 วิ ' + (params.silenceCount || 0) + ' ครั้ง, คำกระทบใจ ' + (params.triggerTotal || 0) + ' ครั้ง, Trust สุดท้าย ' + (params.finalTrust || 50) + '%\n\n' +
      'บทสนทนา:\n' + transcript + '\n\n' +
      'ตอบกลับเป็น JSON ล้วนเท่านั้น (ห้ามใส่ markdown หรือคำอธิบายอื่น) ตามโครงสร้างนี้:\n' +
      '{"setting":0-100,"empathy":0-100,"clarity":0-100,"vocal":0-100,"dignity":0-100,"goldenMoment":"ยกประโยคจริงของผู้เรียนที่ทำได้ดีที่สุด 1 ประโยคพร้อมเหตุผลสั้นๆ","turningPoint":"ชี้ 1 จุดที่ควรเกลาพร้อมประโยคทางเลือกที่นุ่มนวลกว่า","summary":"สรุปภาพรวม 2 บรรทัดภาษาไทย"}';
  }

  function parseSupervisorJson(rawText, fallbackEval) {
    try {
      const str = String(rawText || '');
      const start = str.indexOf('{');
      const end = str.lastIndexOf('}');
      if (start === -1 || end === -1 || end <= start) return fallbackEval;
      const obj = JSON.parse(str.slice(start, end + 1));
      const clamp = function (v, fb) {
        const n = Number(v);
        return isNaN(n) ? fb : Math.max(30, Math.min(100, Math.round(n)));
      };
      const axes = getRadarAxes(fallbackEval && fallbackEval.personaId);
      const rMap = {
        setting: clamp(obj.setting, fallbackEval.radarMap.setting),
        empathy: clamp(obj.empathy, fallbackEval.radarMap.empathy),
        clarity: clamp(obj.clarity, fallbackEval.radarMap.clarity),
        vocal: clamp(obj.vocal, fallbackEval.radarMap.vocal),
        dignity: clamp(obj.dignity, fallbackEval.radarMap.dignity)
      };
      const avg = Math.round((rMap.setting + rMap.empathy + rMap.clarity + rMap.vocal + rMap.dignity) / 5);
      return {
        score: avg,
        personaId: fallbackEval && fallbackEval.personaId,
        radar: axes.map(function (a) { return { key: a.key, labelTH: a.labelTH, shortTH: a.shortTH, value: rMap[a.key] }; }),
        radarMap: rMap,
        goldenMoment: String(obj.goldenMoment || fallbackEval.goldenMoment),
        turningPoint: String(obj.turningPoint || fallbackEval.turningPoint),
        summary: String(obj.summary || fallbackEval.summary),
        source: 'gemini_clinical_supervisor'
      };
    } catch (_) {
      return fallbackEval;
    }
  }

  // ==========================================================================
  // 7.5 EXPORT SKILL LAB DEBRIEF CARD (PNG 1200x1500 • ZERO COST)
  // ==========================================================================
  function drawWrappedText(ctx, text, x, y, maxW, lineH, maxLines) {
    const raw = String(text || '').trim();
    if (!raw) return y;
    const chars = Array.from(raw);
    const lines = [];
    let line = '';
    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      if (ch === '\n') {
        lines.push(line);
        line = '';
        continue;
      }
      const test = line + ch;
      if (ctx.measureText(test).width > maxW && line.length > 0) {
        lines.push(line);
        line = ch;
        if (lines.length >= maxLines) break;
      } else {
        line = test;
      }
    }
    if (line && lines.length < maxLines) lines.push(line);
    lines.forEach(function (ln, idx) {
      ctx.fillText(ln, x, y + idx * lineH);
    });
    return y + lines.length * lineH;
  }

  function downloadDebriefCardPng(params) {
    try {
      const p = params || {};
      const evalRes = p.evalResult || {};
      const userObj = p.user || {};
      const personaId = p.personaId || evalRes.personaId || 'standard';
      const axes = Array.isArray(evalRes.radar) && evalRes.radar.length === 5
        ? evalRes.radar
        : getRadarAxes(personaId).map(function (a) { return { key: a.key, labelTH: a.labelTH, shortTH: a.shortTH, value: 80 }; });
      const badges = (Array.isArray(p.badges) ? p.badges : computeClinicalBadges(userObj)).filter(function (b) { return b.earned; });

      const W = 1200, H = 1520;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return false;

      // พื้นหลังสีน้ำเงินเข้ม Midnight Obsidian พร้อมแสงออร่า
      const bgGrad = ctx.createLinearGradient(0, 0, W, H);
      bgGrad.addColorStop(0, '#020612');
      bgGrad.addColorStop(0.5, '#071735');
      bgGrad.addColorStop(1, '#020612');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      const orb1 = ctx.createRadialGradient(220, 180, 10, 220, 180, 420);
      orb1.addColorStop(0, 'rgba(52, 211, 153, 0.22)');
      orb1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = orb1;
      ctx.fillRect(0, 0, W, H);

      const orb2 = ctx.createRadialGradient(980, 320, 10, 980, 320, 440);
      orb2.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
      orb2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = orb2;
      ctx.fillRect(0, 0, W, H);

      // กรอบการ์ดหลัก
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.32)';
      ctx.lineWidth = 2;
      ctx.strokeRect(36, 36, W - 72, H - 72);

      // Header
      ctx.fillStyle = '#6ee7b7';
      ctx.font = '700 20px "JetBrains Mono", monospace';
      ctx.fillText('RJCLOUD.ORGAN 2.0  •  AI SKILL LAB 3D CLINICAL DEBRIEF REPORT', 74, 96);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '800 38px "Prompt", "Anuphan", sans-serif';
      ctx.fillText(p.caseTitle || 'รายงานผลประเมินสมรรถนะการสื่อสาร 5 แกน', 74, 150, W - 148);

      const prof = resolveProfessionGroup(userObj);
      const dateStr = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
      ctx.fillStyle = '#93b4d8';
      ctx.font = '600 22px "Anuphan", "Sarabun", sans-serif';
      ctx.fillText('ผู้เรียน: ' + (userObj.name || 'ผู้เข้าฝึกอบรม') + ' (' + prof + ')  •  ' + (userObj.hospital || 'รพ.ราชวิถี'), 74, 194, W - 148);
      ctx.fillText('โหมดฝึก: ' + (p.modeLabel || 'Roleplay 3D') + ' (' + String(p.difficultyId || 'NORMAL').toUpperCase() + ')  •  วันที่: ' + dateStr, 74, 228, W - 148);

      ctx.strokeStyle = 'rgba(186, 230, 253, 0.18)';
      ctx.beginPath(); ctx.moveTo(74, 256); ctx.lineTo(W - 74, 256); ctx.stroke();

      // Score Box (ซ้าย) + 5-Axis Radar Chart (ขวา)
      ctx.fillStyle = 'rgba(147, 197, 253, 0.08)';
      ctx.fillRect(74, 286, 420, 420);
      ctx.strokeStyle = 'rgba(110, 231, 183, 0.35)';
      ctx.strokeRect(74, 286, 420, 420);

      ctx.fillStyle = '#67e8f9';
      ctx.font = '700 18px "JetBrains Mono", monospace';
      ctx.fillText(personaId === 'sbar_doctor' ? 'SBAR CLINICAL HANDOFF SCORE' : 'EMPATHY & COMMUNICATION INDEX', 102, 334);

      ctx.fillStyle = '#6ee7b7';
      ctx.font = '800 112px "JetBrains Mono", monospace';
      ctx.fillText(String(evalRes.score || 0), 102, 462);
      ctx.fillStyle = '#93b4d8';
      ctx.font = '700 34px "JetBrains Mono", monospace';
      ctx.fillText('/100', 256, 462);

      ctx.fillStyle = '#dbeafe';
      ctx.font = '500 21px "Sarabun", "Anuphan", sans-serif';
      drawWrappedText(ctx, evalRes.summary || 'ผ่านการฝึกอบรมในห้องจำลอง 3 มิติเรียบร้อยแล้ว', 102, 514, 364, 32, 5);

      // 5-Axis Radar Chart (ขวา)
      const cx = 825, cy = 496, maxR = 148;
      const getPt = function (idx, ratio) {
        const ang = (Math.PI * 2 * idx) / axes.length - Math.PI / 2;
        return [cx + Math.cos(ang) * maxR * ratio, cy + Math.sin(ang) * maxR * ratio];
      };
      [0.25, 0.5, 0.75, 1].forEach(function (lv) {
        ctx.beginPath();
        axes.forEach(function (_, i) {
          const pt = getPt(i, lv);
          if (i === 0) ctx.moveTo(pt[0], pt[1]); else ctx.lineTo(pt[0], pt[1]);
        });
        ctx.closePath();
        ctx.strokeStyle = 'rgba(147, 197, 253, 0.22)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
      axes.forEach(function (_, i) {
        const pt = getPt(i, 1);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(pt[0], pt[1]);
        ctx.strokeStyle = 'rgba(147, 197, 253, 0.18)'; ctx.stroke();
      });
      ctx.beginPath();
      axes.forEach(function (a, i) {
        const pt = getPt(i, Math.max(0, Math.min(100, Number(a.value || 0))) / 100);
        if (i === 0) ctx.moveTo(pt[0], pt[1]); else ctx.lineTo(pt[0], pt[1]);
      });
      ctx.closePath();
      ctx.fillStyle = 'rgba(52, 211, 153, 0.34)';
      ctx.fill();
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      ctx.textAlign = 'center';
      axes.forEach(function (a, i) {
        const pt = getPt(i, Math.max(0, Math.min(100, Number(a.value || 0))) / 100);
        ctx.beginPath(); ctx.arc(pt[0], pt[1], 6, 0, Math.PI * 2);
        ctx.fillStyle = '#6ee7b7'; ctx.fill();

        const lp = getPt(i, 1.32);
        ctx.fillStyle = '#dbeafe';
        ctx.font = '700 18px "Anuphan", "Prompt", sans-serif';
        ctx.fillText(a.shortTH || a.labelTH, lp[0], lp[1] - 4);
        ctx.fillStyle = '#6ee7b7';
        ctx.font = '700 20px "JetBrains Mono", monospace';
        ctx.fillText(String(a.value || 0), lp[0], lp[1] + 22);
      });
      ctx.textAlign = 'left';

      // Golden Moment Box
      ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
      ctx.fillRect(74, 742, W - 148, 224);
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.45)';
      ctx.lineWidth = 2;
      ctx.strokeRect(74, 742, W - 148, 224);
      ctx.fillStyle = '#6ee7b7';
      ctx.font = '700 20px "Prompt", sans-serif';
      ctx.fillText('★ ประโยคทองที่ทำได้ดีเยี่ยม (GOLDEN MOMENT)', 104, 786);
      ctx.fillStyle = '#f8fafc';
      ctx.font = '500 23px "Sarabun", "Anuphan", sans-serif';
      drawWrappedText(ctx, evalRes.goldenMoment || '-', 104, 830, W - 208, 36, 4);

      // Turning Point Box
      ctx.fillStyle = 'rgba(14, 165, 233, 0.14)';
      ctx.fillRect(74, 996, W - 148, 224);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.strokeRect(74, 996, W - 148, 224);
      ctx.fillStyle = '#67e8f9';
      ctx.font = '700 20px "Prompt", sans-serif';
      ctx.fillText('✦ จุดควรเกลาเพิ่มความเชี่ยวชาญ (TURNING POINT)', 104, 1040);
      ctx.fillStyle = '#f8fafc';
      ctx.font = '500 23px "Sarabun", "Anuphan", sans-serif';
      drawWrappedText(ctx, evalRes.turningPoint || '-', 104, 1084, W - 208, 36, 4);

      // Earned Clinical Mastery Badges
      ctx.fillStyle = '#fbbf24';
      ctx.font = '700 20px "Prompt", sans-serif';
      ctx.fillText('เหรียญตราสมรรถนะคลินิกที่ได้รับ (' + badges.length + '/5):', 74, 1280);
      ctx.fillStyle = '#fde68a';
      ctx.font = '600 21px "Anuphan", sans-serif';
      const badgeLine = badges.length > 0
        ? badges.map(function (b) { return '★ ' + b.titleTH; }).join('    •    ')
        : 'กำลังสะสมเหรียญตราสมรรถนะ — ฝึกต่อเนื่องเพื่อปลดล็อกครบ 5 เหรียญตรา';
      drawWrappedText(ctx, badgeLine, 74, 1320, W - 148, 34, 2);

      // Footer
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.18)';
      ctx.beginPath(); ctx.moveTo(74, 1408); ctx.lineTo(W - 74, 1408); ctx.stroke();
      ctx.fillStyle = '#93b4d8';
      ctx.font = '600 18px "JetBrains Mono", monospace';
      ctx.fillText('ORGAN TRANSPLANTATION CENTER OF RAJAVITHI HOSPITAL  •  RJCLOUD.ORGAN 2.0 (PDPA SAFE)', 74, 1452);

      const a = global.document.createElement('a');
      a.href = canvas.toDataURL('image/png', 1.0);
      a.download = 'AI_SkillLab_Debrief_' + personaId + '_' + (evalRes.score || 0) + '.png';
      global.document.body.appendChild(a);
      a.click();
      global.document.body.removeChild(a);
      return true;
    } catch (err) {
      console.warn('Debrief PNG export warning:', err);
      return false;
    }
  }

  // ==========================================================================
  // 8. WEB AUDIO API CONSULTATION ROOM & ICU MONITOR SFX (NO EXTERNAL SOUND URLS)
  // ==========================================================================
  const SoundFX = {
    ctx: null,
    ambientNodes: null,

    ensureCtx: function () {
      try {
        const AudioCtx = global.AudioContext || global.webkitAudioContext;
        if (!AudioCtx) return null;
        if (!this.ctx) this.ctx = new AudioCtx();
        if (this.ctx.state === 'suspended') this.ctx.resume().catch(function () {});
        return this.ctx;
      } catch (_) {
        return null;
      }
    },

    playDoorKnock: function () {
      const ctx = this.ensureCtx();
      if (!ctx) return;
      try {
        [0, 0.24].forEach(function (offset) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          const t = ctx.currentTime + offset;
          osc.frequency.setValueAtTime(165, t);
          osc.frequency.exponentialRampToValueAtTime(68, t + 0.09);
          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(0.18, t + 0.012);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.13);
        });
      } catch (_) {}
    },

    playPhoneBuzz: function () {
      const ctx = this.ensureCtx();
      if (!ctx) return;
      try {
        [0, 0.34].forEach(function (offset) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          const t = ctx.currentTime + offset;
          osc.frequency.setValueAtTime(118, t);
          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(0.075, t + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.24);
        });
        if (navigator.vibrate) navigator.vibrate([120, 80, 120]);
      } catch (_) {}
    },

    // เสียงสัญญาณเตือน ICU Bedside Monitor สำหรับเหตุการณ์แทรกเคส 6 SBAR (Hard Mode)
    playMonitorAlarm: function () {
      const ctx = this.ensureCtx();
      if (!ctx) return;
      try {
        [0, 0.18, 0.36].forEach(function (offset) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          const t = ctx.currentTime + offset;
          osc.frequency.setValueAtTime(980, t);
          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(0.085, t + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.14);
        });
        if (navigator.vibrate) navigator.vibrate([100, 60, 100, 60, 100]);
      } catch (_) {}
    },

    playChime: function (freqs) {
      const ctx = this.ensureCtx();
      if (!ctx) return;
      try {
        const list = Array.isArray(freqs) ? freqs : [523.25, 659.25];
        list.forEach(function (f, idx) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          const t = ctx.currentTime + idx * 0.08;
          osc.frequency.setValueAtTime(f, t);
          gain.gain.setValueAtTime(0.0001, t);
          gain.gain.exponentialRampToValueAtTime(0.04, t + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.26);
        });
      } catch (_) {}
    },

    setAmbient: function (enabled) {
      if (!enabled) {
        if (this.ambientNodes) {
          try {
            this.ambientNodes.osc1.stop();
            this.ambientNodes.osc2.stop();
          } catch (_) {}
          this.ambientNodes = null;
        }
        return;
      }
      if (this.ambientNodes) return;
      const ctx = this.ensureCtx();
      if (!ctx) return;
      try {
        const master = ctx.createGain();
        master.gain.value = 0.012;
        master.connect(ctx.destination);

        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.value = 110;
        osc1.connect(master);

        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.value = 164.81;
        osc2.connect(master);

        osc1.start();
        osc2.start();
        this.ambientNodes = { osc1: osc1, osc2: osc2, master: master };
      } catch (_) {}
    },

    playThinkingCue: function () {
      const ctx = this.ensureCtx();
      if (!ctx) return;
      try {
        const dur = 0.42;
        const bufSize = Math.floor(ctx.sampleRate * dur);
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const ch = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) {
          const env = Math.sin((i / bufSize) * Math.PI);
          ch[i] = (Math.random() * 2 - 1) * env;
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 520;
        filter.Q.value = 1.4;
        const gain = ctx.createGain();
        gain.gain.value = 0.014;
        src.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        src.start();
      } catch (_) {}
    }
  };

  // ==========================================================================
  // 9. CONTEXT-AWARE 3D ANIME HUMAN HOLOGRAM ENGINE (REAL AUDIO LIP-SYNC)
  // ==========================================================================
  const ANIME_RIG_PROFILES = {
    daughter_praew: {
      gender: 'female', headWidth: 0.72, headDepth: 0.78, jawTaper: 0.48, jawSquare: 0.0,
      browRidge: 0.006, cheekFullness: 0.052, noseWidth: 0.036, noseLen: 0.095, chinWidth: 0.085,
      chinProminence: 0.022, lipFullness: 0.72, neckWidth: 0.20, shoulderWidth: 0.96,
      eyeScale: 1.48, browThickness: 0.011, hairType: 'long', hasCollar: false, tintShift: 0.0
    },
    sister_fon: {
      gender: 'female', headWidth: 0.72, headDepth: 0.79, jawTaper: 0.45, jawSquare: 0.004,
      browRidge: 0.008, cheekFullness: 0.056, noseWidth: 0.038, noseLen: 0.098, chinWidth: 0.092,
      chinProminence: 0.024, lipFullness: 0.70, neckWidth: 0.205, shoulderWidth: 0.98,
      eyeScale: 1.44, browThickness: 0.0115, hairType: 'sister', hasCollar: false, tintShift: 0.14
    },
    career_nuch: {
      gender: 'female', headWidth: 0.71, headDepth: 0.78, jawTaper: 0.47, jawSquare: 0.006,
      browRidge: 0.009, cheekFullness: 0.048, noseWidth: 0.037, noseLen: 0.10, chinWidth: 0.088,
      chinProminence: 0.024, lipFullness: 0.68, neckWidth: 0.20, shoulderWidth: 0.97,
      eyeScale: 1.42, browThickness: 0.012, hairType: 'career', hasCollar: false, tintShift: 0.22
    },
    mother_bun: {
      gender: 'female', headWidth: 0.74, headDepth: 0.80, jawTaper: 0.40, jawSquare: 0.008,
      browRidge: 0.010, cheekFullness: 0.064, noseWidth: 0.042, noseLen: 0.105, chinWidth: 0.105,
      chinProminence: 0.026, lipFullness: 0.68, neckWidth: 0.22, shoulderWidth: 1.04,
      eyeScale: 1.34, browThickness: 0.0125, hairType: 'bun', hasCollar: false, tintShift: 0.32
    },
    doctor_male: {
      gender: 'male', headWidth: 0.75, headDepth: 0.82, jawTaper: 0.36, jawSquare: 0.042,
      browRidge: 0.026, cheekFullness: 0.032, noseWidth: 0.045, noseLen: 0.125, chinWidth: 0.125,
      chinProminence: 0.044, lipFullness: 0.58, neckWidth: 0.27, shoulderWidth: 1.32,
      eyeScale: 1.24, browThickness: 0.017, hairType: 'short', hasCollar: true, tintShift: 0.08
    }
  };

  function getCaseRigCast(personaId) {
    switch (personaId) {
      case 'belief':
        return [{ key: 'primary', profileKey: 'sister_fon', x: 0, y: 0, z: 0, scale: 1.0, yaw: 0 }];
      case 'distrust':
        return [{ key: 'primary', profileKey: 'career_nuch', x: 0, y: 0, z: 0, scale: 1.0, yaw: 0 }];
      case 'pediatric':
        return [{ key: 'primary', profileKey: 'mother_bun', x: 0, y: 0, z: 0, scale: 1.0, yaw: 0 }];
      case 'sbar_doctor':
        return [{ key: 'primary', profileKey: 'doctor_male', x: 0, y: 0, z: 0, scale: 1.0, yaw: 0 }];
      case 'conflict':
        return [
          { key: 'wife', profileKey: 'daughter_praew', x: -0.78, y: -0.02, z: 0.05, scale: 0.82, yaw: 0.16 },
          { key: 'mother', profileKey: 'mother_bun', x: 0.78, y: 0.0, z: -0.04, scale: 0.84, yaw: -0.16 }
        ];
      default:
        return [{ key: 'primary', profileKey: 'daughter_praew', x: 0, y: 0, z: 0, scale: 1.0, yaw: 0 }];
    }
  }

  function gauss(v, mean, sigma) {
    const d = (v - mean) / sigma;
    return Math.exp(-0.5 * d * d);
  }
  function gauss2D(x, y, mx, my, sx, sy) {
    const dx = (x - mx) / sx;
    const dy = (y - my) / sy;
    return Math.exp(-0.5 * (dx * dx + dy * dy));
  }
  function smoothstep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  function computeAnimeHeadVertex(sx, sy, sz, p, jawOpen) {
    const frontMask = smoothstep(-0.06, 0.42, sz);
    const absX = Math.abs(sx);

    let x = sx * p.headWidth;
    let y = sy * 0.96;
    let z = sz * p.headDepth;

    if (sz < 0) {
      z -= 0.095 * gauss(sy, 0.16, 0.48) * (-sz);
    }

    if (sy < 0.06) {
      const t = Math.min(1, Math.max(0, (0.06 - sy) / 1.06));
      x *= (1 - p.jawTaper * Math.pow(t, 1.24));
      const jawAngle = gauss2D(absX, sy, 0.58, -0.46, 0.20, 0.16) * smoothstep(-0.15, 0.45, sz);
      x += Math.sign(sx) * p.jawSquare * jawAngle;
      z += p.jawSquare * 0.35 * jawAngle;
      y -= 0.075 * Math.pow(t, 2.1) * gauss(sx, 0, 0.48) * frontMask;
      z -= 0.05 * Math.pow(t, 1.6) * frontMask;
    }

    if (sz > 0.30) z -= 0.105 * (sz - 0.30) * gauss(sy, -0.06, 0.68);
    z += p.browRidge * gauss(sy, 0.23, 0.065) * gauss(sx, 0, 0.36) * frontMask;
    z -= 0.042 * (gauss2D(sx, sy, -0.275, 0.025, 0.165, 0.115) + gauss2D(sx, sy, 0.275, 0.025, 0.165, 0.115)) * frontMask;

    const cheek = (gauss2D(sx, sy, -0.39, -0.17, 0.19, 0.15) + gauss2D(sx, sy, 0.39, -0.17, 0.19, 0.15)) * frontMask;
    z += p.cheekFullness * cheek;
    x += Math.sign(sx) * (p.cheekFullness * 0.35) * cheek;

    const noseSpan = smoothstep(-0.28, -0.19, sy) * (1 - smoothstep(0.02, 0.12, sy));
    const noseProg = Math.max(0, Math.min(1, (0.09 - sy) / 0.31));
    z += noseSpan * (0.018 + p.noseLen * Math.pow(noseProg, 1.15)) * gauss(sx, 0, p.noseWidth) * frontMask + 0.042 * gauss2D(sx, sy, 0, -0.215, p.noseWidth * 0.95, 0.036) * frontMask;

    const lipOpenDrop = (jawOpen || 0) * 0.08;
    z += (0.024 * p.lipFullness) * gauss2D(sx, sy, 0, -0.40, 0.135, 0.028) * frontMask;
    z -= (0.018 + lipOpenDrop * 0.4) * gauss2D(sx, sy, 0, -0.435 - lipOpenDrop * 0.3, 0.14, 0.018 + lipOpenDrop * 0.25) * frontMask;
    z += (0.028 * p.lipFullness) * gauss2D(sx, sy, 0, -0.472 - lipOpenDrop * 0.72, 0.115, 0.030) * frontMask;
    z += p.chinProminence * gauss2D(sx, sy, 0, -0.72 - lipOpenDrop * 0.65, p.chinWidth, 0.095) * frontMask;

    if (jawOpen > 0.001 && sy < -0.42 && sz > 0.15) {
      const jawInfluence = smoothstep(-0.42, -0.78, sy) * smoothstep(0.15, 0.55, sz) * gauss(sx, 0, 0.38);
      y -= jawOpen * 0.078 * jawInfluence;
      z -= jawOpen * 0.02 * jawInfluence;
    }

    x += Math.sign(sx) * 0.058 * gauss2D(sy, sz, -0.06, -0.08, 0.14, 0.085) * smoothstep(0.87, 0.99, absX);
    return { x: x, y: y, z: z };
  }

  function createAnimeHoloGlassMat(THREE, baseOpacity) {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: true,
      side: THREE.FrontSide,
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color(0x38bdf8) },
        uColor2: { value: new THREE.Color(0x818cf8) },
        uOpacity: { value: baseOpacity || 0.92 }
      },
      vertexShader: [
        'varying vec3 vNormal;',
        'varying vec3 vViewPos;',
        'varying vec3 vLocalPos;',
        'void main() {',
        '  vLocalPos = position;',
        '  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);',
        '  vNormal = normalize(normalMatrix * normal);',
        '  vViewPos = -mvPos.xyz;',
        '  gl_Position = projectionMatrix * mvPos;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform float uTime;',
        'uniform vec3 uColor1;',
        'uniform vec3 uColor2;',
        'uniform float uOpacity;',
        'varying vec3 vNormal;',
        'varying vec3 vViewPos;',
        'varying vec3 vLocalPos;',
        'void main() {',
        '  vec3 N = normalize(vNormal);',
        '  vec3 V = normalize(vViewPos);',
        '  vec3 L1 = normalize(vec3(0.38, 0.65, 0.92));',
        '  float ndotl = max(dot(N, L1), 0.0);',
        '  float celBand = mix(0.46, 1.0, smoothstep(0.18, 0.58, ndotl));',
        '  float ndotv = clamp(dot(N, V), 0.0, 1.0);',
        '  float fresnel = pow(1.0 - ndotv, 2.05);',
        '  float cheekL = exp(-pow((vLocalPos.x + 0.30) / 0.14, 2.0) - pow((vLocalPos.y + 0.19) / 0.09, 2.0));',
        '  float cheekR = exp(-pow((vLocalPos.x - 0.30) / 0.14, 2.0) - pow((vLocalPos.y + 0.19) / 0.09, 2.0));',
        '  float blush = clamp(cheekL + cheekR, 0.0, 1.0) * smoothstep(0.35, 0.72, vLocalPos.z);',
        '  float scan = 0.97 + 0.03 * sin(vLocalPos.y * 44.0 - uTime * 2.0);',
        '  vec3 baseTint = mix(uColor2 * 0.45, uColor1 * 0.80, clamp(vLocalPos.y * 0.45 + 0.58, 0.0, 1.0));',
        '  vec3 lit = baseTint * celBand + vec3(1.0, 0.56, 0.78) * blush * 0.24;',
        '  vec3 rim = mix(uColor1, vec3(0.95, 0.99, 1.0), 0.64) * fresnel * 1.18;',
        '  vec3 spec = vec3(0.92, 0.98, 1.0) * pow(max(dot(reflect(-L1, N), V), 0.0), 26.0) * 0.32;',
        '  vec3 finalCol = (lit + rim + spec) * scan;',
        '  float alpha = clamp((0.36 + fresnel * 0.62 + celBand * 0.22) * uOpacity, 0.22, 0.95);',
        '  gl_FragColor = vec4(finalCol, alpha);',
        '}'
      ].join('\n')
    });
  }

  function addAnimeHairLock(THREE, parent, points, baseRadius, mat) {
    const curve = new THREE.CatmullRomCurve3(points);
    const geo = new THREE.TubeGeometry(curve, 16, baseRadius, 7, false);
    const pos = geo.attributes.position;
    for (let i = 0; i <= 16; i++) {
      const u = i / 16;
      const taper = Math.sin(Math.pow(u, 0.65) * Math.PI * 0.96);
      const center = curve.getPointAt(u);
      for (let j = 0; j <= 7; j++) {
        const idx = i * 8 + j;
        if (idx < pos.count) {
          pos.setXYZ(
            idx,
            center.x + (pos.getX(idx) - center.x) * (0.35 + taper * 0.85),
            center.y + (pos.getY(idx) - center.y) * (0.35 + taper * 0.85),
            center.z + (pos.getZ(idx) - center.z) * (0.25 + taper * 0.6)
          );
        }
      }
    }
    geo.computeVertexNormals();
    parent.add(new THREE.Mesh(geo, mat));
  }

  function createAnimeCharacterRig(THREE, glowTex, initialProfileKey, seedOffset) {
    const rigGroup = new THREE.Group();
    const avatarGroup = new THREE.Group();
    avatarGroup.position.y = 0.06;
    rigGroup.add(avatarGroup);

    const headGroup = new THREE.Group();
    headGroup.position.y = 0.34;
    avatarGroup.add(headGroup);

    const headGeo = new THREE.SphereGeometry(1, 48, 38);
    const headPosAttr = headGeo.attributes.position;
    const baseSphereCoords = new Float32Array(headPosAttr.count * 3);
    for (let i = 0; i < headPosAttr.count; i++) {
      baseSphereCoords[i * 3] = headPosAttr.getX(i);
      baseSphereCoords[i * 3 + 1] = headPosAttr.getY(i);
      baseSphereCoords[i * 3 + 2] = headPosAttr.getZ(i);
    }

    const startProf = ANIME_RIG_PROFILES[initialProfileKey] || ANIME_RIG_PROFILES.daughter_praew;
    const currentProfile = Object.assign({}, startProf);

    function updateHeadGeometry(profile, jawOpen) {
      const pos = headGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const v = computeAnimeHeadVertex(
          baseSphereCoords[i * 3],
          baseSphereCoords[i * 3 + 1],
          baseSphereCoords[i * 3 + 2],
          profile,
          jawOpen
        );
        pos.setXYZ(i, v.x, v.y, v.z);
      }
      pos.needsUpdate = true;
      headGeo.computeVertexNormals();
    }
    updateHeadGeometry(currentProfile, 0);

    const headGlassMat = createAnimeHoloGlassMat(THREE, 0.92);
    headGroup.add(new THREE.Mesh(headGeo, headGlassMat));

    const headWireMat = new THREE.MeshBasicMaterial({
      color: 0x7dd3fc, wireframe: true, transparent: true, opacity: 0.11, blending: THREE.AdditiveBlending, depthWrite: false
    });
    const headWire = new THREE.Mesh(headGeo, headWireMat);
    headWire.scale.setScalar(1.004);
    headGroup.add(headWire);

    const featureColorMat = new THREE.MeshBasicMaterial({
      color: 0xe0f2fe, transparent: true, opacity: 0.96, blending: THREE.AdditiveBlending, depthWrite: false
    });

    function createEyeAssembly(sideSign) {
      const g = new THREE.Group();
      const scleraGeo = new THREE.CircleGeometry(0.088, 28);
      scleraGeo.scale(1.05, 0.88, 1);
      const sclera = new THREE.Mesh(scleraGeo, new THREE.MeshBasicMaterial({
        color: 0xe0f2fe, transparent: true, opacity: 0.24, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false
      }));

      const irisOuterGeo = new THREE.CircleGeometry(0.062, 28);
      irisOuterGeo.scale(0.88, 1.08, 1);
      const irisOuterMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8, transparent: true, opacity: 0.78, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false
      });
      const irisOuter = new THREE.Mesh(irisOuterGeo, irisOuterMat);
      irisOuter.position.z = 0.002;

      const irisRingGeo = new THREE.RingGeometry(0.028, 0.056, 28);
      irisRingGeo.scale(0.88, 1.08, 1);
      const irisRing = new THREE.Mesh(irisRingGeo, new THREE.MeshBasicMaterial({
        color: 0xbae6fd, transparent: true, opacity: 0.92, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false
      }));
      irisRing.position.z = 0.004;

      const pupilGeo = new THREE.CircleGeometry(0.027, 22);
      pupilGeo.scale(0.86, 1.06, 1);
      const pupil = new THREE.Mesh(pupilGeo, new THREE.MeshBasicMaterial({
        color: 0x041028, transparent: true, opacity: 0.9, side: THREE.DoubleSide
      }));
      pupil.position.z = 0.005;

      const sparkleBig = new THREE.Mesh(new THREE.CircleGeometry(0.017, 14), new THREE.MeshBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0.98, side: THREE.DoubleSide, blending: THREE.AdditiveBlending
      }));
      sparkleBig.position.set(-0.016, 0.024, 0.008);

      const sparkleSmall = new THREE.Mesh(new THREE.CircleGeometry(0.009, 12), new THREE.MeshBasicMaterial({
        color: 0xe0f2fe, transparent: true, opacity: 0.92, side: THREE.DoubleSide, blending: THREE.AdditiveBlending
      }));
      sparkleSmall.position.set(0.018, -0.022, 0.008);

      const lidPts = [];
      for (let i = 0; i <= 16; i++) {
        const u = (i / 16) * 2 - 1;
        const wingLift = u * sideSign > 0.65 ? Math.pow((u * sideSign - 0.65) / 0.35, 1.6) * 0.022 : 0;
        lidPts.push(new THREE.Vector3(u * 0.105, (1 - u * u) * 0.046 + 0.036 + wingLift, -u * u * 0.022 + 0.009));
      }
      const upperLid = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(lidPts), 20, 0.0125, 7, false), featureColorMat);

      const lowPts = [];
      for (let i = 0; i <= 10; i++) {
        const u = (i / 10) * 2 - 1;
        lowPts.push(new THREE.Vector3(u * 0.072, -(1 - u * u) * 0.018 - 0.056, -u * u * 0.015 + 0.007));
      }
      const lowerLid = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(lowPts), 12, 0.0045, 6, false),
        new THREE.MeshBasicMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false })
      );

      const tearMat = new THREE.SpriteMaterial({ map: glowTex, color: 0xe0f2fe, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
      const tearDrop = new THREE.Sprite(tearMat);
      tearDrop.scale.set(0.068, 0.10, 1);
      tearDrop.position.set(sideSign * 0.022, -0.072, 0.014);

      const irisContainer = new THREE.Group();
      irisContainer.add(sclera, irisOuter, irisRing, pupil, sparkleBig, sparkleSmall);
      g.add(irisContainer, upperLid, lowerLid, tearDrop);

      return { group: g, irisContainer: irisContainer, irisRingMat: irisOuterMat, upperLid: upperLid, tearDrop: tearDrop, tearMat: tearMat };
    }

    const leftEye = createEyeAssembly(-1);
    const rightEye = createEyeAssembly(1);
    headGroup.add(leftEye.group, rightEye.group);

    function createEyebrow(sideSign) {
      const pts = [];
      for (let i = 0; i <= 12; i++) {
        const u = i / 12;
        pts.push(new THREE.Vector3(sideSign * (0.095 + u * 0.21), Math.sin(u * Math.PI) * 0.032, -Math.pow(u, 1.8) * 0.075));
      }
      const mat = new THREE.MeshBasicMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.84, blending: THREE.AdditiveBlending, depthWrite: false });
      const mesh = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.012, 7, false), mat);
      const pivot = new THREE.Group();
      pivot.add(mesh);
      return { pivot: pivot, mesh: mesh, mat: mat };
    }

    const leftBrow = createEyebrow(-1);
    const rightBrow = createEyebrow(1);
    headGroup.add(leftBrow.pivot, rightBrow.pivot);

    const LIP_SEGS = 22;
    function buildLipLine(colorHex, opacity) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array((LIP_SEGS + 1) * 3), 3));
      const mat = new THREE.LineBasicMaterial({ color: colorHex, transparent: true, opacity: opacity, blending: THREE.AdditiveBlending });
      return { line: new THREE.Line(geo, mat), geo: geo, mat: mat };
    }
    const upperLipOuter = buildLipLine(0xe0f2fe, 0.86);
    const upperLipInner = buildLipLine(0x67e8f9, 0.56);
    const lowerLipOuter = buildLipLine(0xbae6fd, 0.84);
    const lowerLipInner = buildLipLine(0x67e8f9, 0.52);
    headGroup.add(upperLipOuter.line, upperLipInner.line, lowerLipOuter.line, lowerLipInner.line);

    const bustGroup = new THREE.Group();
    avatarGroup.add(bustGroup);

    const neckMat = createAnimeHoloGlassMat(THREE, 0.75);
    const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.25, 0.62, 28, 6, true), neckMat);
    neckMesh.position.y = -0.66;
    bustGroup.add(neckMesh);

    const shoulderGeo = new THREE.SphereGeometry(1, 38, 20, 0, Math.PI * 2, 0, Math.PI * 0.44);
    const shoulderMat = createAnimeHoloGlassMat(THREE, 0.78);
    const shoulderMesh = new THREE.Mesh(shoulderGeo, shoulderMat);
    shoulderMesh.position.set(0, -1.46, -0.06);
    shoulderMesh.scale.set(1.0, 0.64, 0.48);
    bustGroup.add(shoulderMesh);

    const shoulderWireMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc, wireframe: true, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false });
    const shoulderWire = new THREE.Mesh(shoulderGeo, shoulderWireMat);
    shoulderWire.position.copy(shoulderMesh.position);
    shoulderWire.scale.copy(shoulderMesh.scale).multiplyScalar(1.005);
    bustGroup.add(shoulderWire);

    const collarGroup = new THREE.Group();
    const collarPtsL = [new THREE.Vector3(-0.30, -0.76, 0.12), new THREE.Vector3(-0.44, -0.94, 0.24), new THREE.Vector3(-0.18, -1.30, 0.36), new THREE.Vector3(0, -1.24, 0.38)];
    const collarMat = new THREE.MeshBasicMaterial({ color: 0x6ee7b7, transparent: true, opacity: 0.72, blending: THREE.AdditiveBlending, depthWrite: false });
    collarGroup.add(
      new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(collarPtsL), 18, 0.016, 7, false), collarMat),
      new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(collarPtsL.map(function (v) { return new THREE.Vector3(-v.x, v.y, v.z); })), 18, 0.016, 7, false), collarMat)
    );
    collarGroup.visible = Boolean(startProf.hasCollar);
    bustGroup.add(collarGroup);

    const hairGlassMat = createAnimeHoloGlassMat(THREE, 0.62);
    const hairLineMat = new THREE.LineBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.38, blending: THREE.AdditiveBlending, depthWrite: false });

    // ทรงผมทั้ง 5 สไตล์ (long, sister, career, bun, short)
    const hairLongGroup = new THREE.Group();
    const crownLong = new THREE.Mesh(new THREE.SphereGeometry(0.79, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.56), hairGlassMat);
    crownLong.position.set(0, 0.22, -0.04); crownLong.scale.set(0.98, 1.02, 1.06); hairLongGroup.add(crownLong);
    [[-0.24, -0.34, 0.14, 0.72, 0.058], [-0.10, -0.14, 0.22, 0.77, 0.050], [0.02, 0.04, 0.24, 0.78, 0.046], [0.14, 0.20, 0.20, 0.76, 0.052], [0.28, 0.38, 0.12, 0.70, 0.058]].forEach(function (b) {
      addAnimeHairLock(THREE, hairLongGroup, [new THREE.Vector3(b[0] * 0.5, 0.94, 0.18), new THREE.Vector3(b[0], 0.68, 0.68), new THREE.Vector3(b[1], b[2], b[3])], b[4], hairGlassMat);
    });
    [-1, 1].forEach(function (s) {
      addAnimeHairLock(THREE, hairLongGroup, [new THREE.Vector3(s * 0.36, 0.86, 0.26), new THREE.Vector3(s * 0.66, 0.24, 0.46), new THREE.Vector3(s * 0.54, -0.42, 0.42), new THREE.Vector3(s * 0.40, -0.94, 0.26)], 0.075, hairGlassMat);
      addAnimeHairLock(THREE, hairLongGroup, [new THREE.Vector3(s * 0.48, 0.82, 0.05), new THREE.Vector3(s * 0.78, 0.12, 0.18), new THREE.Vector3(s * 0.72, -0.62, 0.12), new THREE.Vector3(s * 0.62, -1.14, 0.04)], 0.088, hairGlassMat);
    });
    for (let i = 0; i < 9; i++) {
      const ang = ((i / 8) * 1.1 - 0.55) * Math.PI + Math.PI;
      addAnimeHairLock(THREE, hairLongGroup, [new THREE.Vector3(Math.sin(ang) * 0.35, 0.88, Math.cos(ang) * 0.38 - 0.05), new THREE.Vector3(Math.sin(ang) * 0.74, 0.16, Math.cos(ang) * 0.74 - 0.06), new THREE.Vector3(Math.sin(ang) * 0.92, -0.96, Math.cos(ang) * 0.92 - 0.08)], 0.105, hairGlassMat);
    }
    headGroup.add(hairLongGroup);

    const hairSisterGroup = new THREE.Group();
    const crownSister = new THREE.Mesh(new THREE.SphereGeometry(0.79, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.56), hairGlassMat);
    crownSister.position.set(0, 0.22, -0.04); crownSister.scale.set(0.98, 1.02, 1.06); hairSisterGroup.add(crownSister);
    [[-0.26, -0.42, 0.10, 0.68, 0.062], [-0.08, -0.22, 0.20, 0.76, 0.056], [0.08, -0.02, 0.22, 0.78, 0.052], [0.24, 0.42, 0.12, 0.68, 0.062]].forEach(function (b) {
      addAnimeHairLock(THREE, hairSisterGroup, [new THREE.Vector3(b[0] * 0.4, 0.94, 0.18), new THREE.Vector3(b[0], 0.68, 0.68), new THREE.Vector3(b[1], b[2], b[3])], b[4], hairGlassMat);
    });
    [-1, 1].forEach(function (s) {
      addAnimeHairLock(THREE, hairSisterGroup, [new THREE.Vector3(s * 0.40, 0.85, 0.22), new THREE.Vector3(s * 0.72, 0.18, 0.36), new THREE.Vector3(s * 0.52, -0.58, 0.32)], 0.085, hairGlassMat);
    });
    for (let i = 0; i < 9; i++) {
      const ang = ((i / 8) * 1.15 - 0.575) * Math.PI + Math.PI;
      addAnimeHairLock(THREE, hairSisterGroup, [new THREE.Vector3(Math.sin(ang) * 0.36, 0.88, Math.cos(ang) * 0.38 - 0.05), new THREE.Vector3(Math.sin(ang) * 0.76, 0.14, Math.cos(ang) * 0.76 - 0.06), new THREE.Vector3(Math.sin(ang) * 0.78, -0.76, Math.cos(ang) * 0.78 - 0.04)], 0.105, hairGlassMat);
    }
    headGroup.add(hairSisterGroup);

    const hairCareerGroup = new THREE.Group();
    const crownCareer = new THREE.Mesh(new THREE.SphereGeometry(0.79, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.56), hairGlassMat);
    crownCareer.position.set(0, 0.22, -0.04); crownCareer.scale.set(0.98, 1.02, 1.06); hairCareerGroup.add(crownCareer);
    [[-0.22, 0.12, 0.22, 0.76, 0.064], [-0.04, 0.30, 0.16, 0.72, 0.060], [-0.32, -0.48, 0.08, 0.64, 0.062]].forEach(function (b) {
      addAnimeHairLock(THREE, hairCareerGroup, [new THREE.Vector3(-0.15, 0.94, 0.20), new THREE.Vector3(b[0], 0.66, 0.68), new THREE.Vector3(b[1], b[2], b[3])], b[4], hairGlassMat);
    });
    [-1, 1].forEach(function (s) {
      addAnimeHairLock(THREE, hairCareerGroup, [new THREE.Vector3(s * 0.42, 0.84, 0.18), new THREE.Vector3(s * 0.74, 0.14, 0.30), new THREE.Vector3(s * 0.44, -0.52, 0.34)], 0.09, hairGlassMat);
    });
    for (let i = 0; i < 8; i++) {
      const ang = ((i / 7) * 1.1 - 0.55) * Math.PI + Math.PI;
      addAnimeHairLock(THREE, hairCareerGroup, [new THREE.Vector3(Math.sin(ang) * 0.36, 0.88, Math.cos(ang) * 0.38 - 0.05), new THREE.Vector3(Math.sin(ang) * 0.75, 0.14, Math.cos(ang) * 0.75 - 0.06), new THREE.Vector3(Math.sin(ang) * 0.68, -0.56, Math.cos(ang) * 0.68 - 0.04)], 0.105, hairGlassMat);
    }
    headGroup.add(hairCareerGroup);

    const hairBunGroup = new THREE.Group();
    const bunCap = new THREE.Mesh(new THREE.SphereGeometry(0.82, 28, 22, 0, Math.PI * 2, 0, Math.PI * 0.56), hairGlassMat);
    bunCap.position.set(0, 0.22, -0.06); bunCap.scale.set(0.96, 1.0, 1.06);
    addAnimeHairLock(THREE, hairBunGroup, [new THREE.Vector3(-0.18, 0.92, 0.24), new THREE.Vector3(0.18, 0.62, 0.70), new THREE.Vector3(0.56, 0.16, 0.48)], 0.072, hairGlassMat);
    addAnimeHairLock(THREE, hairBunGroup, [new THREE.Vector3(-0.22, 0.90, 0.22), new THREE.Vector3(-0.48, 0.54, 0.56), new THREE.Vector3(-0.62, 0.02, 0.36)], 0.065, hairGlassMat);
    const bunSphere = new THREE.Mesh(new THREE.SphereGeometry(0.36, 24, 24), createAnimeHoloGlassMat(THREE, 0.72));
    bunSphere.position.set(0, 0.22, -0.96);
    const bunWire = new THREE.Mesh(new THREE.SphereGeometry(0.37, 14, 12), new THREE.MeshBasicMaterial({ color: 0xc084fc, wireframe: true, transparent: true, opacity: 0.26, blending: THREE.AdditiveBlending }));
    bunWire.position.copy(bunSphere.position);
    hairBunGroup.add(bunCap, bunSphere, bunWire);
    headGroup.add(hairBunGroup);

    const hairShortGroup = new THREE.Group();
    const maleCrown = new THREE.Mesh(new THREE.SphereGeometry(0.81, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.52), hairGlassMat);
    maleCrown.position.set(0, 0.24, -0.05); maleCrown.scale.set(1.0, 1.02, 1.08); hairShortGroup.add(maleCrown);
    [[-0.34, -0.48, 0.14, 0.66, 0.064], [-0.14, -0.26, 0.18, 0.76, 0.060], [0.04, -0.04, 0.22, 0.79, 0.056], [0.22, 0.34, 0.18, 0.74, 0.062], [0.38, 0.56, 0.08, 0.56, 0.065]].forEach(function (b) {
      addAnimeHairLock(THREE, hairShortGroup, [new THREE.Vector3(b[0] * 0.4, 0.96, 0.16), new THREE.Vector3(b[0], 0.70, 0.68), new THREE.Vector3(b[1], b[2], b[3])], b[4], hairGlassMat);
    });
    for (let i = 0; i < 14; i++) {
      const frac = (i / 13) * 2 - 1;
      const pts = [];
      for (let j = 0; j <= 8; j++) {
        const u = j / 8, phi = 0.08 + u * 1.15;
        pts.push(new THREE.Vector3(frac * 0.72 * Math.sin(phi * 1.15), 0.26 + Math.cos(phi) * 0.84, 0.44 - u * 1.30));
      }
      hairShortGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(new THREE.CatmullRomCurve3(pts).getPoints(12)), hairLineMat));
    }
    headGroup.add(hairShortGroup);

    const hairGroups = { long: hairLongGroup, sister: hairSisterGroup, career: hairCareerGroup, bun: hairBunGroup, short: hairShortGroup };
    function applyHairType(hType) {
      Object.keys(hairGroups).forEach(function (k) { hairGroups[k].visible = k === hType; });
    }
    applyHairType(startProf.hairType);

    const baseRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.30, blending: THREE.AdditiveBlending });
    const baseRing = new THREE.Mesh(new THREE.TorusGeometry(1.12, 0.008, 10, 72), baseRingMat);
    baseRing.rotation.x = Math.PI * 0.5;
    baseRing.position.y = -1.36;
    avatarGroup.add(baseRing);

    const numericKeys = ['headWidth', 'headDepth', 'jawTaper', 'jawSquare', 'browRidge', 'cheekFullness', 'noseWidth', 'noseLen', 'chinWidth', 'chinProminence', 'lipFullness', 'neckWidth', 'shoulderWidth', 'eyeScale', 'browThickness'];
    const curC1 = new THREE.Color(0x38bdf8);
    const curC2 = new THREE.Color(0x818cf8);
    const tgtC1 = new THREE.Color();
    const tgtC2 = new THREE.Color();
    const smoothEmo = { browY: 0.015, browTilt: 0.10, eyeOpen: 1.0, mouthCurve: -0.01, mouthBaseOpen: 0.008, headPitch: 0.02, headRoll: 0.10, tear: 0 };

    let blinkTimer = 2.2 + seedOffset * 1.3;
    let smoothJaw = 0;

    function syncFeatures(profile, emo, jawOpen, blinkScale, gazeX, gazeY, ph, isConfused) {
      const lEyeSurf = computeAnimeHeadVertex(-0.275, 0.025, 0.95, profile, 0);
      const rEyeSurf = computeAnimeHeadVertex(0.275, 0.025, 0.95, profile, 0);

      leftEye.group.position.set(lEyeSurf.x, lEyeSurf.y, lEyeSurf.z + 0.026);
      rightEye.group.position.set(rEyeSurf.x, rEyeSurf.y, rEyeSurf.z + 0.026);
      leftEye.group.rotation.y = -0.20;
      rightEye.group.rotation.y = 0.20;

      const eyeYScale = Math.max(0.06, emo.eyeOpen * blinkScale);
      leftEye.irisContainer.scale.set(profile.eyeScale, profile.eyeScale * eyeYScale, 1);
      rightEye.irisContainer.scale.set(profile.eyeScale, profile.eyeScale * eyeYScale, 1);
      leftEye.irisContainer.position.set(gazeX * 0.015, gazeY * 0.01, 0);
      rightEye.irisContainer.position.set(gazeX * 0.015, gazeY * 0.01, 0);
      leftEye.upperLid.position.y = (1 - eyeYScale) * -0.028;
      rightEye.upperLid.position.y = (1 - eyeYScale) * -0.028;
      leftEye.upperLid.scale.set(profile.eyeScale * 0.82, profile.eyeScale * 0.82, 1);
      rightEye.upperLid.scale.set(profile.eyeScale * 0.82, profile.eyeScale * 0.82, 1);

      const tearOp = emo.tear * (0.45 + 0.45 * Math.sin(ph * 2.2));
      leftEye.tearMat.opacity = tearOp;
      rightEye.tearMat.opacity = tearOp;
      const tearSlide = (ph * 0.14) % 1;
      leftEye.tearDrop.position.y = -0.072 - tearSlide * 0.12;
      rightEye.tearDrop.position.y = -0.072 - ((tearSlide + 0.45) % 1) * 0.12;

      const browRefZ = computeAnimeHeadVertex(0, 0.23, 0.96, profile, 0).z + 0.032;
      const confusedAsym = isConfused ? 0.024 : 0;
      leftBrow.pivot.position.set(0, 0.245 + emo.browY, browRefZ);
      rightBrow.pivot.position.set(0, 0.245 + emo.browY + confusedAsym, browRefZ);
      leftBrow.pivot.rotation.z = -emo.browTilt;
      rightBrow.pivot.rotation.z = emo.browTilt;
      const bThickScale = profile.browThickness / 0.012;
      leftBrow.mesh.scale.set(1, bThickScale, 1);
      rightBrow.mesh.scale.set(1, bThickScale, 1);

      const mouthHalfW = 0.135 + (profile.gender === 'male' ? 0.024 : 0);
      const totalOpen = emo.mouthBaseOpen + jawOpen * 0.094;
      const uArr = upperLipOuter.geo.attributes.position.array;
      const uInArr = upperLipInner.geo.attributes.position.array;
      const lArr = lowerLipOuter.geo.attributes.position.array;
      const lInArr = lowerLipInner.geo.attributes.position.array;

      for (let i = 0; i <= LIP_SEGS; i++) {
        const u = (i / LIP_SEGS) * 2 - 1;
        const env = Math.cos(u * Math.PI * 0.5);
        const sx = u * mouthHalfW;
        const cornerCurve = emo.mouthCurve * (u * u);

        const pTop = computeAnimeHeadVertex(sx, -0.415 + cornerCurve + 0.012 * env + totalOpen * 0.16 * env, 0.96, profile, jawOpen);
        uArr[i * 3] = pTop.x; uArr[i * 3 + 1] = pTop.y; uArr[i * 3 + 2] = pTop.z + 0.016;

        const pTopIn = computeAnimeHeadVertex(sx, -0.432 + cornerCurve + totalOpen * 0.22 * env, 0.96, profile, jawOpen);
        uInArr[i * 3] = pTopIn.x; uInArr[i * 3 + 1] = pTopIn.y; uInArr[i * 3 + 2] = pTopIn.z + 0.014;

        const pBotIn = computeAnimeHeadVertex(sx, -0.436 + cornerCurve - totalOpen * 0.85 * env, 0.96, profile, jawOpen);
        lInArr[i * 3] = pBotIn.x; lInArr[i * 3 + 1] = pBotIn.y; lInArr[i * 3 + 2] = pBotIn.z + 0.014;

        const pBot = computeAnimeHeadVertex(sx, -0.462 + cornerCurve - 0.014 * env - totalOpen * 0.92 * env, 0.96, profile, jawOpen);
        lArr[i * 3] = pBot.x; lArr[i * 3 + 1] = pBot.y; lArr[i * 3 + 2] = pBot.z + 0.016;
      }
      upperLipOuter.geo.attributes.position.needsUpdate = true;
      upperLipInner.geo.attributes.position.needsUpdate = true;
      lowerLipOuter.geo.attributes.position.needsUpdate = true;
      lowerLipInner.geo.attributes.position.needsUpdate = true;

      neckMesh.scale.set(profile.neckWidth / 0.20, 1, profile.neckWidth / 0.20);
      shoulderMesh.scale.set(profile.shoulderWidth, 0.64, 0.48);
      shoulderWire.scale.copy(shoulderMesh.scale).multiplyScalar(1.005);
    }

    return {
      group: rigGroup,
      update: function (dt, phase, params) {
        const targetProf = ANIME_RIG_PROFILES[params.profileKey] || ANIME_RIG_PROFILES.daughter_praew;
        const targetEmo = EMOTIONS[params.emotion] || EMOTIONS.CONFUSED;
        const dLerp = 1 - Math.exp(-dt * 5.2);
        const dCol = 1 - Math.exp(-dt * 3.0);

        let profChanged = false;
        numericKeys.forEach(function (k) {
          const diff = targetProf[k] - currentProfile[k];
          if (Math.abs(diff) > 0.0004) {
            currentProfile[k] += diff * dLerp;
            profChanged = true;
          }
        });
        currentProfile.gender = targetProf.gender;
        applyHairType(targetProf.hairType);
        collarGroup.visible = Boolean(targetProf.hasCollar);

        Object.keys(smoothEmo).forEach(function (k) {
          smoothEmo[k] += (targetEmo[k] - smoothEmo[k]) * dLerp;
        });

        tgtC1.setHex(targetEmo.c1);
        tgtC2.setHex(targetEmo.c2);
        if (targetProf.tintShift > 0) {
          tgtC1.lerp(new THREE.Color(0xc084fc), targetProf.tintShift * 0.45);
        }
        curC1.lerp(tgtC1, dCol);
        curC2.lerp(tgtC2, dCol);

        blinkTimer -= dt;
        if (blinkTimer <= 0) blinkTimer = 2.8 + Math.random() * 2.6;
        const blinkScale = blinkTimer < 0.14 ? Math.abs((blinkTimer / 0.14) * 2 - 1) : 1;

        // Real Audio-Amplitude Lip-Sync (ใช้ค่าความดังคลื่นเสียงจริงเมื่อพร้อม และ fallback อัตโนมัติหากออฟไลน์)
        let targetJaw = 0;
        if (params.isCharacterSpeaking) {
          if (typeof params.liveAudioAmp === 'number' && params.liveAudioAmp >= 0) {
            targetJaw = Math.min(1, params.liveAudioAmp * 0.95);
          } else {
            const syll = 0.5 + 0.5 * Math.sin((phase + seedOffset) * 11.5) * Math.cos((phase + seedOffset) * 4.3 + 0.7);
            targetJaw = 0.18 + syll * 0.64;
          }
        }
        // Fast attack / natural release ให้การเปิด–ปิดปากคมชัดตรงพยางค์พูด
        const jawRate = targetJaw > smoothJaw ? 24 : 15;
        smoothJaw += (targetJaw - smoothJaw) * (1 - Math.exp(-dt * jawRate));

        if (profChanged || smoothJaw > 0.002) {
          updateHeadGeometry(currentProfile, smoothJaw);
        }

        const focusOp = params.dimmed ? 0.64 : 0.92;
        [headGlassMat, neckMat, shoulderMat].forEach(function (m) {
          m.uniforms.uTime.value = phase + seedOffset;
          m.uniforms.uColor1.value.copy(curC1);
          m.uniforms.uColor2.value.copy(curC2);
          m.uniforms.uOpacity.value = focusOp;
        });
        hairGlassMat.uniforms.uTime.value = phase + seedOffset;
        hairGlassMat.uniforms.uColor1.value.copy(curC1);
        hairGlassMat.uniforms.uColor2.value.copy(curC2);
        hairGlassMat.uniforms.uOpacity.value = params.dimmed ? 0.44 : 0.62;

        headWireMat.color.copy(curC1).lerp(new THREE.Color(0xffffff), 0.35);
        shoulderWireMat.color.copy(curC1);
        hairLineMat.color.copy(curC1).lerp(curC2, 0.4);
        baseRingMat.color.copy(curC1);
        baseRingMat.opacity = params.isCharacterSpeaking ? 0.48 : 0.24;
        leftEye.irisRingMat.color.copy(curC1).lerp(new THREE.Color(0xffffff), 0.4);
        rightEye.irisRingMat.color.copy(curC1).lerp(new THREE.Color(0xffffff), 0.4);
        leftBrow.mat.color.copy(curC1).lerp(new THREE.Color(0xffffff), 0.45);
        rightBrow.mat.color.copy(curC1).lerp(new THREE.Color(0xffffff), 0.45);

        const gazeX = Math.sin((phase + seedOffset) * 0.55) * 0.65;
        const gazeY = Math.cos((phase + seedOffset) * 0.42) * 0.35;
        syncFeatures(currentProfile, smoothEmo, smoothJaw, blinkScale, gazeX, gazeY, phase + seedOffset, params.emotion === 'CONFUSED');

        avatarGroup.position.y = 0.06 + Math.sin((phase + seedOffset) * 1.45) * 0.024;
        headGroup.rotation.x = smoothEmo.headPitch + Math.sin((phase + seedOffset) * 1.1) * 0.025 + smoothJaw * 0.035;
        headGroup.rotation.z = smoothEmo.headRoll + Math.sin((phase + seedOffset) * 0.72) * 0.022;
        headGroup.rotation.y = Math.sin((phase + seedOffset) * 0.48) * 0.05;
        if (hairLongGroup.visible) hairLongGroup.rotation.z = Math.sin((phase + seedOffset) * 1.1) * 0.018;
        if (hairSisterGroup.visible) hairSisterGroup.rotation.z = Math.sin((phase + seedOffset) * 1.05) * 0.016;
        baseRing.rotation.z = (phase + seedOffset) * 0.22;
      }
    };
  }

  function mountHologram3D(container, initialState) {
    const THREE = global.THREE;
    if (!container || !THREE) {
      return { update: function () {}, destroy: function () {} };
    }

    const st = Object.assign(
      { personaId: 'standard', emotion: 'CONFUSED', trust: 40, isSpeaking: false, activeSpeaker: 'wife', getAudioAmplitude: null },
      initialState || {}
    );

    const w0 = Math.max(1, container.clientWidth);
    const h0 = Math.max(1, container.clientHeight);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, w0 / h0, 0.1, 100);

    const fitCameraToFocalPoint = function (w, h) {
      const safeW = Math.max(1, w);
      const safeH = Math.max(1, h);
      const aspect = safeW / safeH;
      const tanHalfV = Math.tan((camera.fov * Math.PI) / 360);
      const isPortrait = aspect < 0.85;
      const isDualCast = getCaseRigCast(st.personaId).length > 1;

      const desiredVisW = isDualCast ? (isPortrait ? 3.55 : 4.8) : (isPortrait ? 2.75 : 3.6);
      const desiredVisH = isPortrait ? 5.2 : 4.1;
      const zForW = desiredVisW / (2 * tanHalfV * Math.max(0.32, aspect));
      const zForH = desiredVisH / (2 * tanHalfV);
      const nextZ = Math.max(zForW, zForH);

      camera.aspect = aspect;
      camera.position.z = nextZ;
      camera.position.y = isPortrait ? -(nextZ * tanHalfV * 0.18) - 0.16 : -0.28;
      camera.updateProjectionMatrix();
    };
    fitCameraToFocalPoint(w0, h0);

    let renderer = null;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (_) {
      return { update: function () {}, destroy: function () {} };
    }
    renderer.setPixelRatio(Math.min(global.devicePixelRatio || 1, 2));
    renderer.setSize(w0, h0);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const pCan = document.createElement('canvas');
    pCan.width = 64; pCan.height = 64;
    const pCtx = pCan.getContext('2d');
    const pGrad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    pGrad.addColorStop(0, 'rgba(255,255,255,1)');
    pGrad.addColorStop(0.38, 'rgba(255,255,255,0.75)');
    pGrad.addColorStop(0.75, 'rgba(255,255,255,0.12)');
    pGrad.addColorStop(1, 'rgba(255,255,255,0)');
    pCtx.fillStyle = pGrad;
    pCtx.fillRect(0, 0, 64, 64);
    const glowTex = new THREE.CanvasTexture(pCan);

    const root = new THREE.Group();
    scene.add(root);

    const primaryRig = createAnimeCharacterRig(THREE, glowTex, 'daughter_praew', 0.0);
    const secondaryRig = createAnimeCharacterRig(THREE, glowTex, 'mother_bun', 1.85);
    secondaryRig.group.visible = false;
    root.add(primaryRig.group, secondaryRig.group);

    let dragging = false, lx = 0, ly = 0;
    let targetRY = 0.04, targetRX = 0.0, smoothRY = 0.04, smoothRX = 0.0;
    const onDown = function (x, y) { dragging = true; lx = x; ly = y; };
    const onMove = function (x, y) {
      if (!dragging) return;
      targetRY = Math.max(-1.45, Math.min(1.45, targetRY + (x - lx) * 0.007));
      targetRX = Math.max(-0.42, Math.min(0.42, targetRX + (y - ly) * 0.005));
      lx = x; ly = y;
    };
    const onUp = function () { dragging = false; };
    const onMouseDown = function (e) { onDown(e.clientX, e.clientY); };
    const onMouseMove = function (e) { onMove(e.clientX, e.clientY); };
    const onTouchStart = function (e) { if (e.touches[0]) onDown(e.touches[0].clientX, e.touches[0].clientY); };
    const onTouchMove = function (e) { if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY); };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    global.addEventListener('mousemove', onMouseMove);
    global.addEventListener('mouseup', onUp);
    renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    global.addEventListener('touchmove', onTouchMove, { passive: true });
    global.addEventListener('touchend', onUp);

    const handleResize = function () {
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      fitCameraToFocalPoint(w, h);
      renderer.setSize(w, h);
    };
    global.addEventListener('resize', handleResize);
    let ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(handleResize);
      ro.observe(container);
    }

    let phase = 0;
    let lastTime = performance.now();
    let rafId = null;
    let alive = true;
    let lastPersonaId = st.personaId;

    function animate(now) {
      if (!alive) return;
      rafId = requestAnimationFrame(animate);
      if (document.hidden) return;
      const dt = Math.min(0.033, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      phase += dt;

      if (lastPersonaId !== st.personaId) {
        lastPersonaId = st.personaId;
        fitCameraToFocalPoint(container.clientWidth, container.clientHeight);
      }

      const liveAudioAmp = (st.isSpeaking && typeof st.getAudioAmplitude === 'function')
        ? st.getAudioAmplitude()
        : -1;

      const cast = getCaseRigCast(st.personaId);
      const isDual = cast.length > 1;
      const c0 = cast[0];

      primaryRig.group.visible = true;
      primaryRig.group.position.set(c0.x, c0.y, c0.z);
      primaryRig.group.scale.setScalar(c0.scale);
      primaryRig.group.rotation.y = c0.yaw;

      if (isDual) {
        const c1 = cast[1];
        const wifeSpeaking = Boolean(st.isSpeaking && st.activeSpeaker !== 'mother');
        const motherSpeaking = Boolean(st.isSpeaking && st.activeSpeaker === 'mother');
        const wifeEmotion = st.emotion === 'CALM' ? 'CALM' : (st.emotion === 'ANGRY' ? 'SAD' : st.emotion);

        primaryRig.update(dt, phase, {
          profileKey: c0.profileKey,
          emotion: wifeEmotion,
          isCharacterSpeaking: wifeSpeaking,
          liveAudioAmp: wifeSpeaking ? liveAudioAmp : -1,
          dimmed: motherSpeaking
        });

        secondaryRig.group.visible = true;
        secondaryRig.group.position.set(c1.x, c1.y, c1.z);
        secondaryRig.group.scale.setScalar(c1.scale);
        secondaryRig.group.rotation.y = c1.yaw;
        secondaryRig.update(dt, phase, {
          profileKey: c1.profileKey,
          emotion: st.emotion,
          isCharacterSpeaking: motherSpeaking,
          liveAudioAmp: motherSpeaking ? liveAudioAmp : -1,
          dimmed: wifeSpeaking
        });
      } else {
        secondaryRig.group.visible = false;
        primaryRig.update(dt, phase, {
          profileKey: c0.profileKey,
          emotion: st.emotion,
          isCharacterSpeaking: Boolean(st.isSpeaking),
          liveAudioAmp: liveAudioAmp,
          dimmed: false
        });
      }

      const dDrag = 1 - Math.exp(-dt * 7);
      smoothRY += (targetRY - smoothRY) * dDrag;
      smoothRX += (targetRX - smoothRX) * dDrag;
      root.rotation.y = smoothRY;
      root.rotation.x = smoothRX;

      renderer.render(scene, camera);
    }

    rafId = requestAnimationFrame(animate);

    return {
      update: function (nextState) {
        Object.assign(st, nextState || {});
      },
      destroy: function () {
        alive = false;
        if (rafId) cancelAnimationFrame(rafId);
        renderer.domElement.removeEventListener('mousedown', onMouseDown);
        global.removeEventListener('mousemove', onMouseMove);
        global.removeEventListener('mouseup', onUp);
        renderer.domElement.removeEventListener('touchstart', onTouchStart);
        global.removeEventListener('touchmove', onTouchMove);
        global.removeEventListener('touchend', onUp);
        global.removeEventListener('resize', handleResize);
        if (ro) ro.disconnect();
        try {
          if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
          renderer.dispose();
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
