/**
 * ============================================================================
 * rjcloud.organ 2.0 — AI Skill Lab 3D Engine (skilllab-engine.js • อัปเกรด Zero-Cost 2027)
 * โมดูลกลางแบบ Zero-Build เผยแพร่ผ่าน window.RJCLOUD_SKILLLAB
 *
 * องค์ประกอบครบชุดภายในไฟล์เดียว:
 * 1. Emotion & Radar Metadata + 6 Hologram Styles Registry
 * 2. 6 Clinical Personas (รวมเคส 5 ผู้ป่วยเด็ก & เคส 6 ส่งเวร SBAR แพทย์เวร ICU) + Multi-Voice Cast
 * 3. Realism #1: 3 Hidden Barriers per Case + Emotional Inertia Trust Engine
 * 4. Realism #2: Hard Mode Real-World Curveballs (Phone Interruption & Silent Sob)
 * 5. Realism #3: Targeted 4-Stage Micro-Drill Gauntlet & Instant Evaluator
 * 6. Realism #4 (0 THB): Client-Side Vocal Tone Monitor (Web Audio API) + RAM-Only Audio Replay
 * 7. Realism #5 (0 THB): Perceived Latency Masking Cues + LINE In-App Browser Auto-Detector
 * 8. Research R2R (0 THB): Pre/Post Self-Efficacy Scale + SUS Score + Blind Transcript Builder
 * 9. AI Lab Advisor v3 + Clinical Mastery Badges Calculator
 * 10. Web Audio API Consultation Room SFX + Three.js 6-Style 3D Hologram Renderer
 * ============================================================================
 */
(function (global) {
  'use strict';

  // ==========================================================================
  // 1. EMOTIONS, RADAR AXES & 6 HOLOGRAM STYLES
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
      ttsStyleTH: 'พูดภาษาไทยด้วยน้ำเสียงสงบ อ่อนโยน ผ่อนคลาย และรู้สึกไว้วางใจผู้สนทนา',
      ttsStyleEN: 'Speak calmly, gently, and warmly with growing trust'
    }
  };

  const RADAR_AXES = [
    { key: 'setting', labelTH: 'ห้องรับรอง & บทบาท', shortTH: 'ห้องรับรอง', labelEN: 'Setting & Role' },
    { key: 'empathy', labelTH: 'รับรู้อารมณ์ร่วม', shortTH: 'อารมณ์ร่วม', labelEN: 'Empathy' },
    { key: 'clarity', labelTH: 'ข้อมูลภาวะสมองตาย', shortTH: 'ข้อมูลคลินิก', labelEN: 'Clinical Clarity' },
    { key: 'vocal', labelTH: 'น้ำเสียง & ความเงียบ', shortTH: 'ความเงียบ 2.5 วิ', labelEN: 'Silence & Pace' },
    { key: 'dignity', labelTH: 'ไม่เร่งรัด & เกียรติร่าง', shortTH: 'ให้เกียรติร่าง', labelEN: 'Zero Pressure' }
  ];

  const HOLOGRAM_STYLES = [
    { id: 'lotus', badge: '01', nameTH: 'ดอกบัวแสง (Lotus)', nameEN: 'Luminous Lotus', descTH: 'กลีบดอกบัวแสงค่อยๆ ผลิบานตามระดับความไว้วางใจ (Trust)' },
    { id: 'liquid', badge: '02', nameTH: 'ลูกแก้วออร่า (Liquid)', nameEN: 'Liquid Aurora Orb', descTH: 'ลูกแก้วของเหลวสไตล์ Apple Intelligence พริ้วตามเสียงพูด' },
    { id: 'silk', badge: '03', nameTH: 'คลื่นไหมแสง (Silk)', nameEN: 'Breathing Silk', descTH: 'ริ้วคลื่นไหม 3 มิติ สะท้อนจังหวะหายใจและความเงียบ 2.5 วิ' },
    { id: 'particles', badge: '04', nameTH: 'แกนอนุภาค (Quantum)', nameEN: 'Quantum Core', descTH: 'กลุ่มอนุภาคพลังงานดิจิทัลโคจรรอบแกนแสง' },
    { id: 'dual', badge: '05', nameTH: 'ดวงแสงคู่ (2 เสียง)', nameEN: 'Dual-Core Voices', descTH: 'แยกดวงแสง 2 ดวงสำหรับเคส 3 (ภรรยา vs คุณแม่)' },
    { id: 'prism', badge: '06', nameTH: 'คริสตัลหัวใจ (Prism)', nameEN: 'Crystalline Prism', descTH: 'แกนผลึกคริสตัลโปร่งแสงหมุนนุ่มนวลและเรืองแสงตามอารมณ์' }
  ];

  // ==========================================================================
  // 2. CLINICAL PERSONAS, MULTI-VOICE CAST & ICU BRIEFING CARDS
  // ==========================================================================
  const FALLBACK_PERSONAS = [
    {
      id: 'standard',
      icon: 'HeartPulse',
      accent: '#38bdf8',
      titleTH: '1. ญาติสับสนเรื่องภาวะสมองตาย (เคสคุณพ่อ)',
      titleEN: '1. Brain Death & Ventilator Confusion (Father)',
      tagTH: 'มาตรฐาน',
      tagEN: 'Standard',
      patientRoleTH: 'คุณพ่อ (อายุ 52 ปี อุบัติเหตุทางศีรษะ TBI)',
      speakerRoleTH: 'คุณแพรว (ลูกสาวของผู้ป่วย)',
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
      tagTH: 'บริบทไทย',
      tagEN: 'Cultural',
      patientRoleTH: 'น้องชาย (อายุ 28 ปี อุบัติเหตุจราจร)',
      speakerRoleTH: 'คุณฝน (พี่สาว — กังวลแทนคุณยาย)',
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
      tagTH: '2 เสียงจริง',
      tagEN: 'Dual Voice',
      patientRoleTH: 'คุณต้น (อายุ 36 ปี เลือดออกในสมอง)',
      speakerRoleTH: 'ภรรยา และ คุณแม่ของผู้ป่วย (2 เสียง)',
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
      tagTH: 'โปร่งใส ODC',
      tagEN: 'Transparency',
      patientRoleTH: 'คุณแม่ (อายุ 58 ปี หลอดเลือดสมองแตก)',
      speakerRoleTH: 'คุณนุช (ลูกสาวของผู้ป่วย)',
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
      tagTH: 'อ่อนไหวสูงสุด',
      tagEN: 'Pediatric',
      patientRoleTH: 'น้องต้นกล้า (อายุ 14 ปี อุบัติเหตุจักรยานยนต์ TBI)',
      speakerRoleTH: 'คุณแม่น้องต้นกล้า (อารมณ์ช็อกและอาลัยรุนแรง)',
      descTH: 'เคสผู้ป่วยเยาวชนอายุ 14 ปี ที่พ่อแม่เพิ่งสูญเสียกะทันหัน ฝึกการปลอบประโลมความโศกเศร้ารุนแรงและการเว้นความเงียบเยียวยา',
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
      tagTH: 'ทีมสหสาขา SBAR',
      tagEN: 'SBAR Team',
      patientRoleTH: 'ผู้ป่วยชาย 38 ปี TBI • GCS 3 • BP 78/46 • UO 640 mL/hr',
      speakerRoleTH: 'นพ.ภาคิน (แพทย์เวร ICU • สื่อสารสหสาขาวิชาชีพ)',
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

  function getPersonas() {
    if (Array.isArray(global.SKILL_LAB_PERSONAS) && global.SKILL_LAB_PERSONAS.length > 0) {
      const merged = global.SKILL_LAB_PERSONAS.map(function (p) {
        const fb = FALLBACK_PERSONAS.find(function (x) { return x.id === p.id; }) || FALLBACK_PERSONAS[0];
        return Object.assign({}, fb, p);
      });
      // เติมเคสระดับสูงใหม่ (เคส 5 ผู้ป่วยเด็ก และเคส 6 ส่งเวร SBAR) หากยังไม่มีใน data.js
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
  // 3. REALISM #1: 3 HIDDEN BARRIERS PER CASE + EMOTIONAL INERTIA TRUST ENGINE
  // ==========================================================================
  const CASE_HIDDEN_BARRIERS = {
    standard: [
      {
        id: 'empathy_ack',
        titleTH: 'รับฟังความเสียใจและแนะนำบทบาทอย่างอ่อนโยน',
        keywords: /เสียใจ|เข้าใจ|หนักมาก|เป็นกำลังใจ|อยู่ตรงนี้|ยินดีรับฟัง|พยาบาล|ผู้ประสานงาน|ขออนุญาต|sorry|understand|here for you|coordinator/i
      },
      {
        id: 'ventilator_vs_braindeath',
        titleTH: 'อธิบายความต่างระหว่างเครื่องช่วยหายใจกับภาวะสมองตายถาวร',
        keywords: /เครื่องช่วยหายใจ|ก้านสมอง|สมองตาย|ถาวร|สูบฉีด|ออกซิเจน|แพทย์.*3|ตรวจ.*2|ventilator|brain\s*death|permanent|irreversible/i
      },
      {
        id: 'zero_pressure_dignity',
        titleTH: 'ให้เวลาครอบครัวตัดสินใจไม่เร่งรัด & ดูแลร่างอย่างสมเกียรติ',
        keywords: /ไม่เร่ง|ไม่รีบ|ให้เวลา|ปรึกษา|ตัดสินใจ|เคารพ|ตกแต่งร่าง|เรียบร้อย|สมเกียรติ|no\s*rush|take\s*your\s*time|dignity|respect/i
      }
    ],
    belief: [
      {
        id: 'respect_grandma',
        titleTH: 'รับฟังและเคารพความเชื่อของคุณยายโดยไม่โต้แย้ง',
        keywords: /เข้าใจความกังวล|คุณยาย|ความเชื่อ|เคารพ|ศาสนา|ไม่ตัดสิน|กตัญญู|understand.*grandmother|respect.*belief|spiritual/i
      },
      {
        id: 'merit_giving',
        titleTH: 'สื่อสารคุณค่าทานบารมี / การส่งต่อชีวิตใหม่อย่างนุ่มนวล',
        keywords: /ทานบารมี|บุญใหญ่|ต่อชีวิต|ช่วยชีวิต|กุศล|ชีวิตใหม่|ความดี|merit|gift\s*of\s*life|save\s*lives|compassion/i
      },
      {
        id: 'dignified_body_ritual',
        titleTH: 'ยืนยันการตกแต่งร่างประณีตและทำพิธีทางศาสนาได้ตามปกติ',
        keywords: /ตกแต่งร่าง|เรียบร้อย|สมบูรณ์|พิธี|ศาสนา|แต่งตัว|เหมือนเดิม|ไม่เสียรูป|funeral|ceremony|restored|dignity|intact/i
      }
    ],
    conflict: [
      {
        id: 'validate_both_sides',
        titleTH: 'วางตัวเป็นกลาง รับฟังทั้งความตั้งใจของภรรยาและความเจ็บปวดของคุณแม่',
        keywords: /ทั้งสอง|ภรรยา.*แม่|แม่.*ภรรยา|ความรัก|เข้าใจคุณแม่|เข้าใจภรรยา|เป็นกลาง|เข้าใจทั้งคู่|both\s*of\s*you|mother.*wife|love\s*him/i
      },
      {
        id: 'no_coercion_family_first',
        titleTH: 'ยืนยันจริยธรรมไทย: ไม่ฝืนใจคุณแม่หรือญาติสายตรงแม้มีบัตรจำนง',
        keywords: /ไม่ฝืนใจ|ไม่บังคับ|ไม่ดำเนินการ.*ถ้า.*ไม่พร้อม|ความเห็นพ้อง|ยินยอมพร้อมกัน|เคารพคุณแม่|สายสัมพันธ์|never\s*force|no\s*coercion|consensus|without\s*mother/i
      },
      {
        id: 'private_family_time',
        titleTH: 'เปิดพื้นที่ส่วนตัวให้ครอบครัวค่อยๆ ปรึกษากันโดยไม่กดดัน',
        keywords: /ให้เวลา|คุยกันเอง|ปรึกษากัน|พื้นที่ส่วนตัว|ไม่เร่งรัด|ไม่กดดัน|ไม่ว่าคำตอบ|private\s*time|discuss\s*together|whatever\s*you\s*decide/i
      }
    ],
    distrust: [
      {
        id: 'calm_non_defensive',
        titleTH: 'รับฟังข้อสงสัยอย่างใจเย็น ขอบคุณที่ถามตรงไปตรงมาโดยไม่โต้เถียง',
        keywords: /ขอบคุณที่ถาม|เข้าใจความกังวล|คำถามสำคัญ|ตรงไปตรงมา|ยินดีชี้แจง|โปร่งใส|ตรวจสอบได้|thank\s*you\s*for\s*asking|fair\s*question|transparent/i
      },
      {
        id: 'odc_computer_fairness',
        titleTH: 'อธิบายระบบจัดสรรอวัยวะของ ODC สภากาชาดไทยที่โปร่งใสและเป็นธรรม',
        keywords: /สภากาชาด|ODC|ศูนย์รับบริจาค|คอมพิวเตอร์|เข้ากันได้|เนื้อเยื่อ|หมู่เลือด|เร่งด่วน|ไม่มี.*ซื้อขาย|ไม่ลัดคิว|red\s*cross|computer|matching|fair|no\s*selling/i
      },
      {
        id: 'zero_extra_cost',
        titleTH: 'ยืนยันชัดเจนว่าครอบครัวผู้บริจาคไม่มีค่าใช้จ่ายเพิ่มเติมและไม่เร่งรัด',
        keywords: /ไม่มีค่าใช้จ่าย|ไม่เสียค่าใช้จ่าย|ไม่คิดเงิน|ฟรี|รับผิดชอบค่าใช้จ่าย|ไม่เร่ง|no\s*cost|free\s*of\s*charge|zero\s*cost|not\s*billed/i
      }
    ],
    pediatric: [
      {
        id: 'deep_bereavement_presence',
        titleTH: 'อยู่เคียงข้างและรับรู้ความเจ็บปวดสูงสุดของคนเป็นแม่โดยไม่รีบอธิบายข้อมูล',
        keywords: /เสียใจอย่างสุดซึ้ง|หัวอก.*แม่|เข้าใจ.*แม่|เจ็บปวด|เร็วเกินไป|อยู่ตรงนี้|เป็นเพื่อน|กอด|ไม่ต้องรีบพูด|deeply\s*sorry|mother|heartbreaking|here\s*with\s*you/i
      },
      {
        id: 'gentle_decoupling_legacy',
        titleTH: 'ใช้หลัก Decoupling ค่อยๆ อธิบายความจริงอย่างอ่อนโยนและเชื่อมโยงคุณค่าชีวิตของน้อง',
        keywords: /ก้านสมอง|สมองตาย|ทีมแพทย์ดูแล.*สุดความสามารถ|ความทรงจำ|ความภูมิใจ|ส่งต่อชีวิต|ช่วยเด็ก|decoupling|brain\s*death|legacy|help\s*other\s*children/i
      },
      {
        id: 'parental_autonomy_dignity',
        titleTH: 'เคารพสิทธิ์พ่อแม่ 100% ให้เวลาบอกลาลูกอย่างเต็มที่และดูแลร่างอย่างทะนุถนอมที่สุด',
        keywords: /ให้เวลา.*บอกลา|อยู่กับน้อง|ปรึกษาคุณพ่อ|ไม่เร่งรัด|เคารพการตัดสินใจ|ดูแลร่าง|ทะนุถนอม|เรียบร้อย|say\s*goodbye|take\s*all\s*the\s*time|dignity/i
      }
    ],
    sbar_doctor: [
      {
        id: 'sbar_situation_background',
        titleTH: 'S & B: ระบุตัวตนเคส TBI คะแนน GCS = 3 และสัญญาณชีพวิกฤต (BP 78/46, UO 640)',
        keywords: /GCS\s*=?\s*3|จีซีเอส.*3|TBI|อุบัติเหตุทางศีรษะ|78\/46|ความดันตก|ความดันต่ำ|640|ปัสสาวะออกมาก|เตียง\s*1|situation|background/i
      },
      {
        id: 'sbar_assessment_di',
        titleTH: 'A: ประเมินเข้าข่าย Potential Donor ร่วมกับภาวะ Hypotension และเบาจืด (DI / Na สูง)',
        keywords: /potential\s*donor|เข้าข่ายผู้บริจาค|สมองตาย|เบาจืด|diabetes\s*insipidus|\bDI\b|โซเดียมสูง|154|hypernatremia|assessment/i
      },
      {
        id: 'sbar_recommendation_plan',
        titleTH: 'R: เสนอแผนพยุงความดัน (Fluid/Vasopressor), ยา DDAVP, เตรียมตรวจสมองตาย & ประสาน ODC',
        keywords: /DDAVP|ดีดีเอวีพี|desmopressin|สารน้ำ|fluid|vasopressor|กระตุ้นความดัน|ตรวจสมองตาย|apnea|ประสาน.*ODC|ศูนย์รับบริจาค|recommendation/i
      }
    ]
  };

  function getCaseBarriers(personaId) {
    return CASE_HIDDEN_BARRIERS[personaId] || CASE_HIDDEN_BARRIERS.standard;
  }

  /**
   * ตรวจว่าข้อความล่าสุดของผู้เรียนคลายปมในใจข้อใดของเคสนี้ได้บ้าง
   */
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
   * ระบบแรงเฉื่อยความไว้วางใจ (Emotional Inertia):
   * - Trust ค่อยๆ ขยับตามการคลายปมจริง + เว้นความเงียบ 2.5 วิ + ไม่มีคำกระทบใจ
   * - หากมีคำกระทบใจ Trust ลดลงทันที
   * - ป้องกันไม่ให้ AI กระโดดไป CALM ทันทีถ้ายังคลายปมไม่ถึง 2/3 หรือ Trust < 72
   */
  function computeInertiaTrust(params) {
    const prevTrust = typeof params.prevTrust === 'number' ? params.prevTrust : 30;
    const aiEmotion = EMOTIONS[params.aiEmotion] ? params.aiEmotion : 'CONFUSED';
    const newlyUnlockedCount = Number(params.newlyUnlockedCount || 0);
    const totalUnlockedCount = Number(params.totalUnlockedCount || 0);
    const triggerCount = Number(params.triggerCount || 0);
    const usedSilence = Boolean(params.usedSilence);
    const isHard = params.difficulty === 'hard';

    let delta = 0;
    // แรงบวกจากการคลายปมในใจจริง
    delta += newlyUnlockedCount * (isHard ? 14 : 18);
    // แรงบวกจากการเว้นความเงียบเยียวยา 2.5 วินาที
    if (usedSilence) delta += 7;
    // แรงดึงเล็กน้อยตามทิศทางอารมณ์ที่ AI ประเมิน (จำกัดไม่ให้กระโดดพรวด)
    const emoTarget = EMOTIONS[aiEmotion].baseTrust;
    const softPull = Math.max(-6, Math.min(8, Math.round((emoTarget - prevTrust) * 0.22)));
    delta += softPull;

    // แรงลบหากเผลอใช้คำกระทบใจ
    if (triggerCount > 0) {
      delta -= triggerCount * (isHard ? 15 : 11);
    }

    // ข้อความสั้นมากเกินไป (< 18 ตัวอักษร) ไม่เพิ่ม Trust
    if (String(params.userText || '').trim().length < 18 && newlyUnlockedCount === 0) {
      delta = Math.min(delta, 1);
    }

    const nextTrust = Math.max(10, Math.min(96, Math.round(prevTrust + delta)));

    // ควบคุมอารมณ์ไม่ให้กระโดดไป CALM เร็วเกินจริง
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
  // 6. AI LAB ADVISOR v3 (วิเคราะห์ประวัติจริง + รองรับ 6 เคส + แนะนำฟีเจอร์ 0 บาท)
  // ==========================================================================
  const ADVISOR_GOALS = [
    { id: 'auto', label: 'AI วิเคราะห์ให้', icon: 'Sparkles' },
    { id: 'first', label: 'เพิ่งฝึกครั้งแรก', icon: 'HeartHandshake' },
    { id: 'drill4', label: 'ซ้อม 4 ด่านคำถามหนัก', icon: 'Zap' },
    { id: 'hard_challenge', label: 'ท้าทาย Hard + เหตุการณ์แทรก', icon: 'Flame' },
    { id: 'conflict2', label: 'ฝึกเคสหิน 2 เสียง', icon: 'Users' },
    { id: 'pediatric', label: 'เคสผู้ป่วยเด็ก (อ่อนไหวสูง)', icon: 'Baby' },
    { id: 'sbar_team', label: 'ฝึกส่งเวร SBAR แพทย์เวร ICU', icon: 'Stethoscope' },
    { id: 'english', label: 'ฝึกภาษาอังกฤษ', icon: 'Globe' }
  ];

  const ADVISOR_QUICK_QUESTIONS = [
    'Normal กับ Hard ต่างกันยังไง?',
    'เคสผู้ป่วยเด็กกับส่งเวร SBAR ฝึกยังไง?',
    'วัดความนุ่มนวลน้ำเสียงกับฟังเสียงตัวเองทำงานยังไง?',
    'ปมในใจ 3 ข้อและ Trust ทำงานยังไง?'
  ];

  function computeLabRecommendation(userObj, goalId) {
    const u = userObj || {};
    const hist = Array.isArray(u.skillLabHistory) ? u.skillLabHistory : [];
    const bestScore = typeof u.skillLabBestScore === 'number' ? u.skillLabBestScore : null;
    const latestRadar = u.skillLabLatestRadar || null;
    const nameShort = String(u.name || 'ผู้เรียน').trim();

    // หาแกนที่คะแนนน้อยที่สุดจากเรดาร์เดิม (ถ้ามี)
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

    // เคสที่ยังไม่เคยฝึก (รวมเคส 5 และเคส 6)
    const practicedIds = new Set(hist.map(function (h) { return h.personaId; }).filter(Boolean));
    const unpracticed = ['standard', 'belief', 'conflict', 'distrust', 'pediatric', 'sbar_doctor']
      .find(function (id) { return !practicedIds.has(id); }) || 'pediatric';

    if (goalId === 'first') {
      return {
        mode: 'roleplay_th', difficulty: 'normal', personaId: 'standard', holoStyle: 'lotus',
        headline: 'ชุดเริ่มต้นสร้างความมั่นใจ (Roleplay ไทย • Normal)',
        reason: 'เหมาะสำหรับผู้เพิ่งเข้าห้องฝึกครั้งแรกค่ะ เคสคุณพ่อมีปมในใจ 3 ข้อที่ชัดเจน พร้อม AI Coach แนะนำประโยคและดอกบัวแสงที่ค่อยๆ ผลิบานตามความไว้วางใจ',
        tip: 'เริ่มด้วยการแนะนำตัว แสดงความเสียใจ และเว้นความเงียบ 2.5 วินาทีหลังญาติพูดจบนะคะ',
        speech: 'สวัสดีค่ะคุณ' + nameShort + ' สำหรับการฝึกครั้งแรก แนะนำโหมดโรลเพลย์ภาษาไทย ระดับนอร์มอล เคสคุณพ่อ พร้อมดอกบัวแสงค่ะ จะมีแนวทางคำพูดและเอไอโค้ชช่วยนำทางให้มั่นใจขึ้นค่ะ'
      };
    }

    if (goalId === 'drill4') {
      return {
        mode: 'micro_drill', difficulty: 'normal', personaId: 'standard', holoStyle: 'liquid',
        headline: 'โหมด Micro-Drill 4 ด่านคำถามหนักเฉพาะจุด (ซ้อมไว 3 นาที)',
        reason: 'ซ้อมรับมือ 4 คำถามหินที่พยาบาล TC เจอบ่อยที่สุดเรียงต่อกัน: หน้าอกยังขยับ → ชาติหน้าไม่ครบ 32 → ลัดคิว & ค่า ICU → ขัดแย้ง 2 เสียง พร้อมตรวจและให้ประโยคต้นแบบทันทีทุกด่าน',
        tip: 'ตอบให้ครบทั้งการรับฟังอารมณ์และข้อเท็จจริงคลินิกในแต่ละด่านเพื่อผ่าน 65% ขึ้นไปค่ะ',
        speech: 'แนะนำโหมดไมโครดริลล์สี่ด่านคำถามหนักค่ะ ใช้เวลาเพียงสามนาที จะได้ซ้อมตอบคำถามหินยอดฮิตทั้งสี่ด่านพร้อมดูเฉลยประโยคต้นแบบทันทีค่ะ'
      };
    }

    if (goalId === 'hard_challenge') {
      return {
        mode: 'roleplay_th', difficulty: 'hard', personaId: 'distrust', holoStyle: 'silk',
        headline: 'โหมดท้าทาย Hard + เหตุการณ์ไม่คาดฝันกลางห้อง (Curveballs)',
        reason: 'ซ่อนปุ่มแนวทางคำพูด 100% เพิ่มแรงเฉื่อย Trust และสุ่มเหตุการณ์หน้างานจริงกลางห้อง เช่น สายโทรศัพท์พี่ชายโทรแทรกมาค้าน หรือญาติสะอื้นเงียบทดสอบการเว้นความเงียบ 2.5 วิ',
        tip: 'เมื่อญาติสะอื้นเงียบ อย่ารีบพูดแทรกนะคะ รอให้ครบ 2.5 วิ แล้วค่อยปลอบอย่างนุ่มนวลค่ะ',
        speech: 'สำหรับโหมดท้าทาย แนะนำระดับฮาร์ดพร้อมเหตุการณ์ไม่คาดฝันกลางห้องค่ะ ระบบจะซ่อนตัวช่วยคำพูดและจำลองสายโทรศัพท์แทรกหรือจังหวะญาติสะอื้นเงียบเสมือนหน้างานจริงค่ะ'
      };
    }

    if (goalId === 'conflict2') {
      return {
        mode: 'roleplay_th', difficulty: bestScore && bestScore >= 82 ? 'hard' : 'normal', personaId: 'conflict', holoStyle: 'dual',
        headline: 'เคสหิน 2 เสียงจริง (ภรรยา vs คุณแม่) + ดวงแสงคู่ Dual-Core',
        reason: 'ฝึกวางตัวเป็นกลางเมื่อในห้องมีเสียงคัดค้านรุนแรง ระบบแยกเสียงพูด 2 ตัวละครจริงพร้อมดวงแสงคู่ที่จะค่อยๆ เคลื่อนเข้าหากันเมื่อคุณประคับประคองทั้งสองฝ่ายได้สำเร็จ',
        tip: 'ยืนยันหลักจริยธรรมไทยว่าจะไม่ฝืนใจคุณแม่แม้มีบัตรบริจาค แล้วให้เวลาครอบครัวปรึกษากันค่ะ',
        speech: 'แนะนำเคสความขัดแย้งสองเสียงจริง พร้อมดวงแสงคู่ค่ะ คุณจะได้ฝึกวางตัวเป็นกลางระหว่างภรรยาและคุณแม่ด้วยเสียงสองตัวละครจริงในห้องเดียวกันค่ะ'
      };
    }

    if (goalId === 'pediatric') {
      return {
        mode: 'roleplay_th', difficulty: bestScore && bestScore >= 84 ? 'hard' : 'normal', personaId: 'pediatric', holoStyle: 'lotus',
        headline: 'เคสระดับสูงที่ 5: พ่อแม่ผู้ป่วยเด็กอายุ 14 ปี (Bereavement Sensitivity)',
        reason: 'สถานการณ์ที่ละเอียดอ่อนและท้าทายหัวใจที่สุด ฝึกการอยู่เคียงข้าง การคุมความนุ่มนวลของน้ำเสียง และการเว้นความเงียบเยียวยา 2.5 วิ ก่อนพูดถึงทางเลือกใดๆ',
        tip: 'สังเกตมาตรวัดน้ำเสียงสดขณะพูด และลองกดฟังเสียงตัวเองย้อนหลังในหน้าประเมินผลนะคะ',
        speech: 'แนะนำเคสที่ห้า เคสพ่อแม่ผู้ป่วยเด็กอายุสิบสี่ปีค่ะ เคสนี้ละเอียดอ่อนมาก เน้นการประคับประคองความรู้สึก การคุมความนุ่มนวลของน้ำเสียง และการเว้นความเงียบเยียวยาค่ะ'
      };
    }

    if (goalId === 'sbar_team') {
      return {
        mode: 'roleplay_th', difficulty: 'normal', personaId: 'sbar_doctor', holoStyle: 'prism',
        headline: 'เคสระดับสูงที่ 6: ส่งเวร SBAR กับแพทย์เวร ICU (Potential Donor + DI)',
        reason: 'ฝึกสื่อสารทีมสหสาขาวิชาชีพแบบ SBAR เมื่อพบ Potential Donor (GCS 3, BP 78/46, ปัสสาวะ 640 mL/hr) ให้ครบทั้ง S-B-A-R พร้อมเสนอแผนพยุงความดันและ DDAVP',
        tip: 'เริ่มรายงานให้กระชับตามลำดับ S (ผู้ป่วย/GCS 3) → B (TBI) → A (สงสัย DI) → R (DDAVP/พยุง BP/เตรียมตรวจสมองตาย) ค่ะ',
        speech: 'แนะนำเคสที่หก ฝึกส่งเวรแบบเอสบาร์กับแพทย์เวรไอซียูค่ะ เพื่อฝึกสื่อสารข้อมูลคลินิกผู้บริจาคอวัยวะให้กระชับ แม่นยำ และครบถ้วนค่ะ'
      };
    }

    if (goalId === 'english') {
      return {
        mode: 'roleplay_en', difficulty: 'normal', personaId: 'standard', holoStyle: 'liquid',
        headline: 'International English Family Approach (Roleplay EN)',
        reason: 'ฝึกสื่อสารกับครอบครัวผู้ป่วยชาวต่างชาติด้วยหลัก SPIKES และ Decoupling ภาษาอังกฤษพร้อมเสียงพูดธรรมชาติและตัวตรวจคำกระทบใจภาษาอังกฤษ',
        tip: 'หลีกเลี่ยงคำว่า pull the plug หรือ harvest และใช้ withdraw life-sustaining support แทนค่ะ',
        speech: 'แนะนำโหมดโรลเพลย์ภาษาอังกฤษค่ะ เพื่อฝึกสื่อสารกับครอบครัวผู้ป่วยชาวต่างชาติด้วยหลักสไปค์สและดีคัปปลิ้งค่ะ'
      };
    }

    // AUTO: วิเคราะห์จากประวัติจริงของผู้เรียน
    if (hist.length === 0) {
      return {
        mode: 'roleplay_th', difficulty: 'normal', personaId: 'standard', holoStyle: 'lotus',
        headline: 'AI วิเคราะห์ให้: เริ่มที่เคสคุณพ่อ (Normal + ดอกบัวแสง)',
        reason: 'ยังไม่พบประวัติการฝึกใน AI Skill Lab ค่ะ แนะนำเริ่มต้นด้วยเคสคุณพ่อระดับ Normal เพื่อจับจังหวะคลายปมในใจ 3 ข้อและเว้นความเงียบ 2.5 วินาทีก่อนขยับสู่ระดับ Hard ค่ะ',
        tip: 'เมื่อคลายปมในใจได้ครบ 3 ข้อ ดอกบัวแสงจะผลิบานเต็มที่และ Trust จะพุ่งสูงขึ้นค่ะ',
        speech: 'สวัสดีค่ะคุณ' + nameShort + ' จากประวัติพบว่านี่เป็นการเข้าฝึกครั้งแรก แนะนำเริ่มที่โหมดโรลเพลย์ภาษาไทย ระดับนอร์มอล เคสคุณพ่อ พร้อมดอกบัวแสง เพื่อสร้างความมั่นใจก่อนนะคะ'
      };
    }

    if (bestScore !== null && bestScore >= 85) {
      return {
        mode: 'roleplay_th',
        difficulty: 'hard',
        personaId: unpracticed,
        holoStyle: unpracticed === 'conflict' ? 'dual' : 'silk',
        headline: 'AI วิเคราะห์ให้: อัปเกรดสู่ระดับ Hard + เหตุการณ์แทรก (' + (unpracticed === 'conflict' ? 'เคส 2 เสียง' : 'เคสใหม่ที่ยังไม่เคยฝึก') + ')',
        reason: 'คุณทำคะแนนสูงสุดได้ถึง ' + bestScore + '/100 แล้วค่ะ! พร้อมท้าทายระดับ Hard ที่มีสายโทรศัพท์แทรก/จังหวะสะอื้นเงียบ' + (weakestAxis ? ' และช่วยเสริมแกน "' + weakestAxis.label + '" (' + weakestAxis.score + '/100)' : ''),
        tip: 'คุมจังหวะการพูดไม่ให้เร็วเกินไป และรักษาความสงบเมื่อเกิดเหตุการณ์ไม่คาดฝันกลางห้องค่ะ',
        speech: 'ยินดีด้วยค่ะคุณ' + nameShort + ' คะแนนเดิมของคุณสูงถึง ' + bestScore + ' คะแนนแล้ว รอบนี้แนะนำท้าทายระดับฮาร์ดพร้อมเหตุการณ์ไม่คาดฝันกลางห้อง เพื่อยกระดับทักษะให้เชี่ยวชาญยิ่งขึ้นค่ะ'
      };
    }

    return {
      mode: 'micro_drill',
      difficulty: 'normal',
      personaId: unpracticed,
      holoStyle: 'liquid',
      headline: 'AI วิเคราะห์ให้: ซ้อมเจาะจุดอ่อนด้วย Micro-Drill 4 ด่านคำถามหนัก',
      reason: 'เคยฝึกมาแล้ว ' + hist.length + ' ครั้ง' + (weakestAxis ? ' พบว่าแกน "' + weakestAxis.label + '" (' + weakestAxis.score + '/100) ยังเสริมได้อีก' : '') + ' แนะนำซ้อม 4 ด่านคำถามหนักเพื่อเก็บคำตอบมาตรฐานให้แม่นก่อนสอบจริงค่ะ',
      tip: 'ดูประโยคต้นแบบที่ระบบเฉลยหลังจบแต่ละด่านแล้วนำไปปรับใช้ในโหมด Roleplay ได้เลยค่ะ',
      speech: 'สวัสดีค่ะคุณ' + nameShort + ' คุณเคยฝึกมาแล้ว ' + hist.length + ' ครั้ง รอบนี้แนะนำซ้อมโหมดไมโครดริลล์สี่ด่านคำถามหนัก เพื่อเก็บจุดสำคัญให้แม่นยำยิ่งขึ้นค่ะ'
    };
  }

  function answerAdvisorQuestion(question) {
    const q = String(question || '').toLowerCase();
    if (q.includes('normal') || q.includes('hard') || q.includes('ต่างกัน')) {
      return '• ระดับ Normal: มี AI Coach และปุ่มแนวทางคำพูดให้เลือกปรับใช้ เหมาะสำหรับสร้างความมั่นใจ\n• ระดับ Hard: ซ่อนตัวช่วยคำพูด 100%, ค่า Trust ไต่ขึ้นยากกว่า และมี "เหตุการณ์ไม่คาดฝันกลางห้อง" เช่น สายพี่ชายโทรแทรกมาค้าน หรือจังหวะญาติสะอื้นเงียบ 3 วิ ให้รับมือเหมือนหน้างานจริงค่ะ';
    }
    if (q.includes('เด็ก') || q.includes('sbar') || q.includes('แพทย์')) {
      return '• เคส 5 (ผู้ป่วยเด็กอายุ 14 ปี): อ่อนไหวสูงสุด เน้นการปลอบโยนหัวอกคนเป็นแม่ คุมน้ำเสียงให้นุ่มนวล และใช้หลัก Decoupling ไม่เร่งรัดค่ะ\n• เคส 6 (ส่งเวร SBAR แพทย์เวร ICU): ฝึกสื่อสารสหสาขาวิชาชีพเมื่อพบ Potential Donor (GCS 3, BP ตก, ปัสสาวะออกมากสงสัย DI) ให้รายงานครบ S-B-A-R และเสนอแผนดูแลอวัยวะค่ะ';
    }
    if (q.includes('น้ำเสียง') || q.includes('อัดเสียง') || q.includes('ฟังเสียงตัวเอง') || q.includes('tone')) {
      return 'ระบบใช้ Web Audio API บนอุปกรณ์ของคุณวัดความนุ่มนวลและจังหวะน้ำเสียงแบบเรียลไทม์ พร้อมบันทึกเสียงพูดของคุณชั่วคราวในหน่วยความจำ (RAM) เพื่อกดฟังเสียงตัวเองย้อนหลังในหน้าสรุปผล 5 แกน โดยไม่มีการอัปโหลดไฟล์เสียงขึ้นเซิร์ฟเวอร์ (ปลอดภัย PDPA 100%) และจะลบทิ้งอัตโนมัติเมื่อปิดหน้าค่ะ';
    }
    if (q.includes('4 ด่าน') || q.includes('micro') || q.includes('คำถามหนัก')) {
      return 'โหมด Micro-Drill 4 ด่านคำถามหนัก คือการซ้อมรับมือ 4 คำถามหินยอดฮิตเรียงต่อกันอัตโนมัติ (1. หน้าอกยังขยับ → 2. ชาติหน้าไม่ครบ 32 → 3. ลัดคิว & ค่าห้อง ICU → 4. ขัดแย้ง 2 เสียง) ใช้เวลา 3 นาที ตรวจให้คะแนนและแสดงประโยคต้นแบบทันทีทุกด่านค่ะ';
    }
    if (q.includes('ปม') || q.includes('trust') || q.includes('ความไว้วางใจ')) {
      return 'แต่ละเคสจะมี "ปมในใจ 3 ข้อ" ที่ซ่อนอยู่ค่ะ ค่า Trust % จะไม่กระโดดข้ามขั้น แต่จะค่อยๆ ไต่ระดับเมื่อคุณคลายปมได้ตรงจุดและเว้นความเงียบ 2.5 วินาที (และจะลดลงทันทีหากเผลอใช้คำกระทบใจ เช่น ถอดเครื่อง หรือ รีบตัดสินใจ) ค่ะ';
    }
    if (q.includes('ยากสุด') || q.includes('ยากที่สุด') || q.includes('เคสไหน')) {
      return 'เคสที่ท้าทายอารมณ์ที่สุดคือ "เคส 3 ความขัดแย้ง 2 เสียง" และ "เคส 5 พ่อแม่ผู้ป่วยเด็ก" ในระดับ Hard ส่วนเคสที่วัดความแม่นยำทางคลินิกที่สุดคือ "เคส 6 ส่งเวร SBAR กับแพทย์เวร ICU" ค่ะ';
    }
    return 'แนะนำกดปุ่ม "เลือกตามที่ AI แนะนำทันที" เพื่อให้ระบบตั้งค่ารูปแบบ ความยาก เคส และ Hologram ที่เหมาะกับประวัติการเรียนของคุณให้อัตโนมัติ หรือเลือกซ้อม "4 ด่านคำถามหนัก" ก่อนเข้าโหมด Roleplay จริงก็ได้ค่ะ';
  }

  // ==========================================================================
  // 6.5 ZERO-COST WORLD-CLASS UPGRADES:
  //     A) LINE / IN-APP BROWSER DETECTOR
  //     B) PERCEIVED LATENCY MASKING CUES
  //     C) CLIENT-SIDE VOCAL TONE MONITOR + RAM-ONLY SELF-REFLECTION REPLAY
  //     D) RESEARCH R2R TOOLS (PRE/POST SELF-EFFICACY, SUS, BLIND TRANSCRIPT)
  //     E) CLINICAL MASTERY BADGES CALCULATOR
  // ==========================================================================

  /**
   * ตรวจจับว่าเปิดเว็บผ่าน In-App Browser (เช่น LINE, Facebook, Instagram) หรือไม่
   * ซึ่งมักบล็อกไมโครโฟน Web Speech API และตัดเสียง TTS บนมือถือไทย
   */
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

  /**
   * ข้อความภาษากายระหว่างรอ AI ประมวลผล (Perceived Latency Masking)
   * ช่วยให้ช่วงรอ Apps Script 2–5 วินาทีรู้สึกเหมือนคนจริงกำลังตั้งสติหรือซับน้ำตาก่อนตอบ
   */
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
   * Client-Side Vocal Tone Monitor + RAM-Only Self-Reflection Audio Recorder (0 THB • 100% PDPA Safe)
   * วัดความดัง (dB), ความนุ่มนวลของน้ำเสียง และอัดเสียงพูดของผู้เรียนเก็บใน RAM ชั่วคราว
   * เพื่อเปิดฟังทบทวนตัวเองในหน้าสรุปผล 5 แกน (ไม่มีการส่งไฟล์เสียงขึ้นเซิร์ฟเวอร์)
   */
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

  /**
   * ชุดคำถามวิจัย R2R: Pre/Post Self-Efficacy Scale (3 ข้อ สเกล 1–5)
   */
  const SELF_EFFICACY_ITEMS = [
    { key: 'explainBrainDeath', labelTH: '1. ความมั่นใจในการอธิบายภาวะสมองตายและเครื่องช่วยหายใจให้ญาติเข้าใจ' },
    { key: 'handleEmotion', labelTH: '2. ความมั่นใจในการรับมืออารมณ์ช็อก โศกเศร้า หรือความขัดแย้งในครอบครัว' },
    { key: 'gentleApproach', labelTH: '3. ความมั่นใจในการให้ข้อมูลเรื่องการบริจาคอวัยวะอย่างอ่อนโยนและไม่เร่งรัด' }
  ];

  /**
   * ชุดประเมินความง่ายในการใช้งานมาตรฐานสากล (Compact SUS 5 ข้อ → แปลงเป็นสเกล 0–100)
   */
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

  /**
   * แปลงบทสนทนาเป็นรูปแบบไม่ระบุตัวตน (Blind Transcript) สำหรับอาจารย์ TC ประเมินเทียบ AI (ICC / Kappa)
   */
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

  /**
   * คำนวณเหรียญตราสมรรถนะคลินิก (Clinical Mastery Badges) จากประวัติ AI Skill Lab จริง
   */
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
  // 7. TRIGGER-WORD POLISHER, RESPONSE PARSER & 5-AXIS FALLBACK EVALUATOR
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

  function detectTriggerPhrases(text, lang) {
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

  /**
   * แกะแท็ก [EMOTION: ...] [ACTION: ...] [COACH: ...] [OUTCOME: ...] ออกจากคำตอบ Gemini
   */
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

    // ล้างแท็กตกค้าง
    text = text.replace(/\[(EMOTION|ACTION|COACH|OUTCOME)[^\]]*\]/gi, '').trim();

    return {
      speech: text || 'ขอโทษนะคะ... ตอนนี้ใจหนูยังสั่นอยู่เลยค่ะ ช่วยอธิบายช้าๆ อีกครั้งได้ไหมคะ?',
      emotion: EMOTIONS[emotion] ? emotion : 'CONFUSED',
      actionCue: actionCue,
      coachHint: coachHint,
      outcome: outcome
    };
  }

  /**
   * แยกบทสนทนา 2 เสียงจริงสำหรับเคสที่ 3 ([ภรรยา]: ... [คุณแม่]: ...)
   */
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

  /**
   * ตรวจจับชื่อที่ผู้เรียนแนะนำตัวกลางห้อง เพื่อเปลี่ยนชื่อเรียกในรอบถัดไปอย่างสมจริง
   */
  function extractIntroducedLearnerName(userText) {
    const s = String(userText || '');
    const m = s.match(/(?:ดิฉัน|ผม|หนู|กระผม|พี่)?\s*(?:ชื่อ|คือ)\s*(?:พว\.|พยาบาล|คุณ|พี่|หมอ)?\s*([ก-๙A-Za-z]{2,16})/);
    if (!m || !m[1]) return '';
    const candidate = m[1].trim();
    if (/ผู้ประสานงาน|พยาบาล|เจ้าหน้าที่|อะไร|ไหม|ครับ|ค่ะ/.test(candidate)) return '';
    return candidate;
  }

  /**
   * ประเมินผล 5 แกนสำรอง (กรณีออฟไลน์หรือ Gemini Supervisor ตอบช้า)
   */
  function evaluateConversationFallback(params) {
    const msgs = Array.isArray(params.messages) ? params.messages : [];
    const userMsgs = msgs.filter(function (m) { return m.role === 'user'; });
    const allUserText = userMsgs.map(function (m) { return m.text || ''; }).join(' ');
    const barriersUnlocked = Number(params.barriersUnlocked || 0);
    const silenceCount = Number(params.silenceCount || 0);
    const triggerTotal = Number(params.triggerTotal || 0);
    const finalTrust = Number(params.finalTrust || 50);

    const settingScore = Math.min(98, 66 + (/สวัสดี|ขออนุญาต|พยาบาล|ผู้ประสานงาน|ส่วนตัว|เงียบ|hello|coordinator|private/i.test(allUserText) ? 20 : 6) + Math.min(10, userMsgs.length * 2));
    const empathyScore = Math.min(98, Math.max(40, 58 + (/เสียใจ|เข้าใจ|หนักมาก|อยู่ตรงนี้|รับฟัง|กังวล|sorry|understand|feel/i.test(allUserText) ? 20 : 4) + barriersUnlocked * 6 - triggerTotal * 8));
    const clarityScore = Math.min(98, 56 + (/สมองตาย|เครื่องช่วยหายใจ|ก้านสมอง|สภากาชาด|ODC|ไม่มีค่าใช้จ่าย|brain\s*death|ventilator|red\s*cross/i.test(allUserText) ? 22 : 6) + barriersUnlocked * 6);
    const vocalScore = Math.min(98, Math.max(45, 64 + silenceCount * 10 - triggerTotal * 7));
    const dignityScore = Math.min(98, Math.max(42, 60 + (/ไม่เร่ง|ให้เวลา|ปรึกษา|ตกแต่งร่าง|เรียบร้อย|สมเกียรติ|ไม่ฝืนใจ|no\s*rush|dignity|respect/i.test(allUserText) ? 24 : 6) - triggerTotal * 10));

    const radar = [
      { key: 'setting', labelTH: 'ห้องรับรอง & บทบาท', value: settingScore },
      { key: 'empathy', labelTH: 'รับรู้อารมณ์ร่วม', value: empathyScore },
      { key: 'clarity', labelTH: 'ข้อมูลภาวะสมองตาย', value: clarityScore },
      { key: 'vocal', labelTH: 'น้ำเสียง & ความเงียบ', value: vocalScore },
      { key: 'dignity', labelTH: 'ไม่เร่งรัด & เกียรติร่าง', value: dignityScore }
    ];
    const totalScore = Math.round((settingScore + empathyScore + clarityScore + vocalScore + dignityScore) / 5);

    const bestUserMsg = userMsgs.reduce(function (best, cur) {
      return (cur.text || '').length > (best.text || '').length ? cur : best;
    }, userMsgs[0] || { text: '' });

    return {
      score: totalScore,
      radar: radar,
      radarMap: { setting: settingScore, empathy: empathyScore, clarity: clarityScore, vocal: vocalScore, dignity: dignityScore },
      goldenMoment: bestUserMsg && bestUserMsg.text
        ? '“' + bestUserMsg.text.slice(0, 120) + (bestUserMsg.text.length > 120 ? '...' : '') + '” — แสดงความตั้งใจสื่อสารและประคับประคองความรู้สึกญาติได้ดีค่ะ'
        : 'เริ่มต้นบทสนทนาได้อย่างสุภาพและเป็นระบบค่ะ',
      turningPoint: triggerTotal > 0
        ? 'พบการใช้คำที่อาจกระทบใจญาติ ' + triggerTotal + ' ครั้ง ลองเปลี่ยนไปใช้ถ้อยคำที่นุ่มนวลกว่าและเน้นหลักไม่เร่งรัดนะคะ'
        : silenceCount === 0
          ? 'ลองเพิ่มจังหวะเว้นความเงียบ 2.5 วินาที (Therapeutic Silence) หลังญาติแสดงความโศกเศร้า เพื่อให้ญาติรู้สึกว่ามีพื้นที่ปลอดภัยค่ะ'
          : 'ทำได้ดีมากค่ะ ลองท้าทายระดับ Hard หรือเคสความขัดแย้ง 2 เสียงเพื่อเพิ่มความชำนาญหน้างานจริงค่ะ',
      summary: 'ความไว้วางใจสุดท้าย ' + finalTrust + '% • คลายปมในใจได้ ' + barriersUnlocked + '/3 ข้อ • เว้นความเงียบเยียวยา ' + silenceCount + ' ครั้ง',
      source: 'local_clinical_rubric'
    };
  }

  function buildSupervisorEvaluationPrompt(params) {
    const transcript = (params.messages || [])
      .map(function (m) { return (m.role === 'user' ? 'ผู้เรียน: ' : 'ญาติ: ') + (m.text || ''); })
      .join('\n');
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
        radar: RADAR_AXES.map(function (a) { return { key: a.key, labelTH: a.labelTH, value: rMap[a.key] }; }),
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
  // 8. WEB AUDIO API CONSULTATION ROOM SFX (NO EXTERNAL SOUND URLS)
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

    // เสียงเคาะประตูไม้เบาๆ 2 ครั้งก่อนเข้าห้องให้คำปรึกษา
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

    // เสียงสั่นโทรศัพท์เบาๆ สำหรับเหตุการณ์สายแทรกในโหมด Hard
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

    // เสียงระฆังออร่าอ่อนโยนเมื่อคลายปมในใจหรือครบความเงียบ 2.5 วิ
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

    // เสียงบรรยากาศห้องสงบแผ่วเบา (Soft Consultation Room Tone)
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

    // เสียงลมหายใจ/ขยับทิชชูแผ่วเบาขณะญาติตั้งสติก่อนตอบ (Perceived Latency Masking)
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
  // 9. THREE.JS ULTRA-SMOOTH 6-STYLE 3D HOLOGRAM ENGINE (mountHologram3D)
  // ==========================================================================
  function createLiquidShaderMaterial(THREE) {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {
        uTime: { value: 0 },
        uSpeak: { value: 0 },
        uTension: { value: 0.5 },
        uColor1: { value: new THREE.Color(0x38bdf8) },
        uColor2: { value: new THREE.Color(0x818cf8) }
      },
      vertexShader: [
        'uniform float uTime;',
        'uniform float uSpeak;',
        'uniform float uTension;',
        'varying vec3 vNormal;',
        'varying vec3 vViewPos;',
        'varying float vDisp;',
        'void main() {',
        '  vec3 p = position;',
        '  float freq = 2.0 + uTension * 1.4;',
        '  float w1 = sin(p.x * freq + uTime * 1.3) * cos(p.y * freq - uTime * 1.1);',
        '  float w2 = sin(p.z * (freq * 1.2) - uTime * 1.6) * cos(p.x * 1.6 + uTime * 0.9);',
        '  float disp = (w1 * 0.55 + w2 * 0.45) * (0.08 + uSpeak * 0.095 + uTension * 0.045);',
        '  vec3 displaced = p + normal * disp;',
        '  vDisp = disp;',
        '  vec4 mvPos = modelViewMatrix * vec4(displaced, 1.0);',
        '  vNormal = normalize(normalMatrix * normal);',
        '  vViewPos = -mvPos.xyz;',
        '  gl_Position = projectionMatrix * mvPos;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform vec3 uColor1;',
        'uniform vec3 uColor2;',
        'uniform float uTime;',
        'uniform float uSpeak;',
        'varying vec3 vNormal;',
        'varying vec3 vViewPos;',
        'varying float vDisp;',
        'void main() {',
        '  vec3 N = normalize(vNormal);',
        '  vec3 V = normalize(vViewPos);',
        '  float ndotv = clamp(dot(N, V), 0.0, 1.0);',
        '  float fresnel = pow(1.0 - ndotv, 2.3);',
        '  float swirl = 0.5 + 0.5 * sin(vDisp * 12.0 + N.y * 2.3 + uTime * 0.7);',
        '  vec3 baseCol = mix(uColor1, uColor2, swirl);',
        '  vec3 pearlescent = mix(baseCol, vec3(0.95, 0.99, 1.0), fresnel * 0.84);',
        '  float coreGlow = pow(ndotv, 1.7) * (0.34 + uSpeak * 0.22);',
        '  vec3 finalCol = pearlescent + baseCol * coreGlow;',
        '  float alpha = clamp(0.28 + fresnel * 0.75 + coreGlow * 0.32, 0.22, 0.95);',
        '  gl_FragColor = vec4(finalCol, alpha);',
        '}'
      ].join('\n')
    });
  }

  function buildPetalGeometry(THREE, w, h) {
    const geo = new THREE.PlaneGeometry(w, h, 8, 14);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i) + h * 0.5;
      const ny = y / h;
      const taper = Math.sin(ny * Math.PI);
      const nx = x * (0.25 + taper * 0.92);
      const cupZ = Math.pow(Math.abs(x / (w * 0.5)), 2) * 0.22 * taper + Math.sin(ny * Math.PI) * 0.2;
      pos.setXYZ(i, nx, y, cupZ);
    }
    geo.computeVertexNormals();
    return geo;
  }

  /**
   * ติดตั้งเวที Hologram 3 มิติ 6 สไตล์ลงใน container ที่กำหนด
   * คืนค่า controller { update(state), destroy() }
   */
  function mountHologram3D(container, initialState) {
    const THREE = global.THREE;
    if (!container || !THREE) {
      return { update: function () {}, destroy: function () {} };
    }

    const st = Object.assign(
      { style: 'lotus', emotion: 'CONFUSED', trust: 40, isSpeaking: false, activeSpeaker: 'wife' },
      initialState || {}
    );

    const w0 = Math.max(1, container.clientWidth);
    const h0 = Math.max(1, container.clientHeight);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(44, w0 / h0, 0.1, 100);
    camera.position.set(0, 0.15, w0 < 520 ? 6.6 : 5.4);

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

    // Glow sprite texture
    const pCan = document.createElement('canvas');
    pCan.width = 64;
    pCan.height = 64;
    const pCtx = pCan.getContext('2d');
    const pGrad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    pGrad.addColorStop(0, 'rgba(255,255,255,1)');
    pGrad.addColorStop(0.34, 'rgba(255,255,255,0.78)');
    pGrad.addColorStop(0.72, 'rgba(255,255,255,0.16)');
    pGrad.addColorStop(1, 'rgba(255,255,255,0)');
    pCtx.fillStyle = pGrad;
    pCtx.fillRect(0, 0, 64, 64);
    const glowTex = new THREE.CanvasTexture(pCan);

    const root = new THREE.Group();
    scene.add(root);

    // 1. LOTUS BLOOM
    const lotusGroup = new THREE.Group();
    lotusGroup.position.y = -0.62;
    root.add(lotusGroup);
    const lotusPetals = [];
    [
      { count: 6, w: 0.54, h: 1.24, baseTilt: 0.18, openTilt: 0.68 },
      { count: 9, w: 0.66, h: 1.56, baseTilt: 0.28, openTilt: 1.02 },
      { count: 12, w: 0.76, h: 1.8, baseTilt: 0.36, openTilt: 1.3 }
    ].forEach(function (ly, li) {
      const geo = buildPetalGeometry(THREE, ly.w, ly.h);
      const edgeGeo = new THREE.EdgesGeometry(geo, 24);
      for (let k = 0; k < ly.count; k++) {
        const pivot = new THREE.Group();
        pivot.rotation.y = (k / ly.count) * Math.PI * 2 + li * 0.35;
        const holder = new THREE.Group();
        const mat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8, transparent: true, opacity: 0.22 + (2 - li) * 0.08,
          side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false
        });
        const rimMat = new THREE.LineBasicMaterial({
          color: 0xbae6fd, transparent: true, opacity: 0.38, blending: THREE.AdditiveBlending
        });
        holder.add(new THREE.Mesh(geo, mat));
        holder.add(new THREE.LineSegments(edgeGeo, rimMat));
        pivot.add(holder);
        lotusGroup.add(pivot);
        lotusPetals.push({ holder: holder, mat: mat, rimMat: rimMat, layerIdx: li, baseTilt: ly.baseTilt, openTilt: ly.openTilt, seed: k * 0.7 + li * 1.9 });
      }
    });
    const lotusCoreMat = new THREE.MeshBasicMaterial({ color: 0xa7f3d0, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending });
    const lotusCore = new THREE.Mesh(new THREE.SphereGeometry(0.32, 28, 28), lotusCoreMat);
    lotusCore.position.y = 0.38;
    lotusGroup.add(lotusCore);

    // 2. LIQUID GLASS AURORA ORB
    const liquidGroup = new THREE.Group();
    root.add(liquidGroup);
    const liquidMat = createLiquidShaderMaterial(THREE);
    const liquidOrb = new THREE.Mesh(new THREE.SphereGeometry(1.4, 72, 72), liquidMat);
    liquidGroup.add(liquidOrb);
    const innerCoreMat = new THREE.MeshBasicMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false });
    const innerCore = new THREE.Mesh(new THREE.SphereGeometry(0.84, 32, 32), innerCoreMat);
    liquidGroup.add(innerCore);

    // 3. BREATHING SILK WAVES
    const silkGroup = new THREE.Group();
    root.add(silkGroup);
    const SILK_LINES = 20;
    const SILK_PTS = 96;
    const silkItems = [];
    for (let l = 0; l < SILK_LINES; l++) {
      const arr = new Float32Array(SILK_PTS * 3);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
      const t = l / (SILK_LINES - 1);
      const mat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.16 + Math.sin(t * Math.PI) * 0.65, blending: THREE.AdditiveBlending, depthWrite: false });
      silkGroup.add(new THREE.Line(geo, mat));
      silkItems.push({ geo: geo, mat: mat, t: t, phaseOffset: l * 0.28 });
    }

    // 4. QUANTUM PARTICLE CORE
    const particleGroup = new THREE.Group();
    root.add(particleGroup);
    const P_COUNT = 380;
    const pPos = new Float32Array(P_COUNT * 3);
    const pBase = new Float32Array(P_COUNT * 3);
    for (let i = 0; i < P_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.05 + Math.random() * 1.1;
      pBase[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
      pBase[i * 3 + 1] = Math.cos(phi) * r;
      pBase[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * r;
      pPos[i * 3] = pBase[i * 3];
      pPos[i * 3 + 1] = pBase[i * 3 + 1];
      pPos[i * 3 + 2] = pBase[i * 3 + 2];
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ size: 0.16, map: glowTex, color: 0x38bdf8, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
    particleGroup.add(new THREE.Points(pGeo, pMat));
    const qRingMat = new THREE.MeshBasicMaterial({ color: 0x6ee7b7, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending });
    const qRing1 = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.015, 16, 100), qRingMat);
    const qRing2 = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.012, 16, 100), qRingMat);
    qRing2.rotation.x = Math.PI * 0.5;
    particleGroup.add(qRing1);
    particleGroup.add(qRing2);

    // 5. DUAL-CORE RESONANCE (CASE 3: WIFE + MOTHER)
    const dualGroup = new THREE.Group();
    root.add(dualGroup);
    const wifeMat = createLiquidShaderMaterial(THREE);
    const wifeOrb = new THREE.Mesh(new THREE.SphereGeometry(0.88, 56, 56), wifeMat);
    dualGroup.add(wifeOrb);
    const motherMat = createLiquidShaderMaterial(THREE);
    const motherOrb = new THREE.Mesh(new THREE.SphereGeometry(0.94, 56, 56), motherMat);
    dualGroup.add(motherOrb);
    const bridgeLines = [];
    const B_PTS = 44;
    for (let b = 0; b < 6; b++) {
      const arr = new Float32Array(B_PTS * 3);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
      const mat = new THREE.LineBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending });
      dualGroup.add(new THREE.Line(geo, mat));
      bridgeLines.push({ geo: geo, mat: mat, idx: b });
    }

    // 6. CRYSTALLINE PRISM
    const prismGroup = new THREE.Group();
    root.add(prismGroup);
    const prismGeo = new THREE.OctahedronGeometry(1.38, 1);
    const prismFillMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.24, blending: THREE.AdditiveBlending, depthWrite: false });
    const prismWireMat = new THREE.LineBasicMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.72, blending: THREE.AdditiveBlending });
    const prismMesh = new THREE.Mesh(prismGeo, prismFillMat);
    const prismWire = new THREE.LineSegments(new THREE.EdgesGeometry(prismGeo), prismWireMat);
    const prismHaloMat = new THREE.MeshBasicMaterial({ color: 0x6ee7b7, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending });
    const prismHalo = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.015, 16, 100), prismHaloMat);
    prismHalo.rotation.x = Math.PI * 0.42;
    prismGroup.add(prismMesh);
    prismGroup.add(prismWire);
    prismGroup.add(prismHalo);

    const groups = {
      lotus: lotusGroup,
      liquid: liquidGroup,
      silk: silkGroup,
      particles: particleGroup,
      dual: dualGroup,
      prism: prismGroup
    };

    function applyVisibility() {
      Object.keys(groups).forEach(function (k) {
        groups[k].visible = k === st.style;
      });
    }
    applyVisibility();

    // Drag to rotate camera smoothly
    let dragging = false, lx = 0, ly = 0;
    let targetRY = 0, targetRX = 0, smoothRY = 0, smoothRX = 0;
    const onDown = function (x, y) { dragging = true; lx = x; ly = y; };
    const onMove = function (x, y) {
      if (!dragging) return;
      targetRY += (x - lx) * 0.006;
      targetRX = Math.max(-0.52, Math.min(0.52, targetRX + (y - ly) * 0.0045));
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
      camera.aspect = w / h;
      camera.position.z = w < 520 ? 6.6 : 5.4;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    global.addEventListener('resize', handleResize);
    let ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(handleResize);
      ro.observe(container);
    }

    const curC1 = new THREE.Color(0x38bdf8);
    const curC2 = new THREE.Color(0x818cf8);
    const tgtC1 = new THREE.Color();
    const tgtC2 = new THREE.Color();
    const tmpCol = new THREE.Color();

    let phase = 0, smoothSpeak = 0, smoothBloom = 0.4, smoothTension = 0.6, smoothWife = 1;
    let lastTime = performance.now();
    let rafId = null;
    let alive = true;

    function animate(now) {
      if (!alive) return;
      rafId = requestAnimationFrame(animate);
      if (document.hidden) return;
      const dt = Math.min(0.033, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      const emo = EMOTIONS[st.emotion] || EMOTIONS.CONFUSED;
      const trustRatio = Math.max(0, Math.min(1, Number(st.trust || 40) / 100));
      const dCol = 1 - Math.exp(-dt * 2.5);
      const dVal = 1 - Math.exp(-dt * 3.0);
      const dDrag = 1 - Math.exp(-dt * 6.5);

      tgtC1.setHex(emo.c1);
      tgtC2.setHex(emo.c2);
      curC1.lerp(tgtC1, dCol);
      curC2.lerp(tgtC2, dCol);

      const targetBloom = Math.max(emo.bloom * 0.45, trustRatio);
      const targetTension = Math.max(0.08, emo.tension * (1.1 - trustRatio * 0.65));

      smoothSpeak += ((st.isSpeaking ? 1 : 0) - smoothSpeak) * dVal;
      smoothBloom += (targetBloom - smoothBloom) * dVal;
      smoothTension += (targetTension - smoothTension) * dVal;
      smoothWife += ((st.activeSpeaker !== 'mother' ? 1 : 0) - smoothWife) * dVal;
      smoothRX += (targetRX - smoothRX) * dDrag;
      smoothRY += (targetRY - smoothRY) * dDrag;

      phase += dt * (0.72 + emo.speed * 0.5 + smoothSpeak * 0.62);
      root.rotation.y = smoothRY;
      root.rotation.x = smoothRX;

      if (lotusGroup.visible) {
        lotusGroup.rotation.y = phase * 0.14;
        lotusPetals.forEach(function (p) {
          const breath = Math.sin(phase * 1.1 + p.seed) * 0.035 + smoothSpeak * 0.048 * Math.sin(phase * 3.2 + p.seed);
          p.holder.rotation.x = p.baseTilt + (p.openTilt - p.baseTilt) * smoothBloom + breath;
          tmpCol.copy(curC1).lerp(curC2, p.layerIdx / 2);
          p.mat.color.copy(tmpCol);
          p.rimMat.color.copy(curC2).lerp(new THREE.Color(0xffffff), 0.35);
        });
        lotusCoreMat.color.copy(curC1).lerp(new THREE.Color(0xffffff), 0.45);
        lotusCore.scale.setScalar(0.86 + smoothBloom * 0.32 + smoothSpeak * 0.14 * Math.sin(phase * 4.0));
      }

      if (liquidGroup.visible) {
        liquidMat.uniforms.uTime.value = phase;
        liquidMat.uniforms.uSpeak.value = smoothSpeak;
        liquidMat.uniforms.uTension.value = smoothTension;
        liquidMat.uniforms.uColor1.value.copy(curC1);
        liquidMat.uniforms.uColor2.value.copy(curC2);
        innerCoreMat.color.copy(curC1);
        innerCore.scale.setScalar(1 + Math.sin(phase * 1.4) * 0.05 + smoothSpeak * 0.09 * Math.sin(phase * 3.8));
        liquidOrb.rotation.y = phase * 0.14;
      }

      if (silkGroup.visible) {
        silkItems.forEach(function (item) {
          const arr = item.geo.attributes.position.array;
          const spreadY = (item.t - 0.5) * 1.65;
          const spreadZ = (item.t - 0.5) * 1.15;
          const amp = 0.2 + smoothSpeak * (0.42 + 0.18 * Math.sin(phase * 2.4 + item.phaseOffset)) + smoothTension * 0.12;
          for (let j = 0; j < SILK_PTS; j++) {
            const u = j / (SILK_PTS - 1);
            const env = Math.sin(u * Math.PI);
            arr[j * 3] = (u - 0.5) * 6.2;
            arr[j * 3 + 1] = spreadY * (0.5 + env * 0.7) + Math.sin(u * 6.8 - phase * 1.6 + item.phaseOffset) * amp * env;
            arr[j * 3 + 2] = spreadZ * env + Math.cos(u * 5.2 + phase * 1.15 + item.phaseOffset) * 0.42 * env;
          }
          item.geo.attributes.position.needsUpdate = true;
          tmpCol.copy(curC1).lerp(curC2, item.t);
          item.mat.color.copy(tmpCol);
        });
        silkGroup.rotation.y = Math.sin(phase * 0.22) * 0.24;
      }

      if (particleGroup.visible) {
        pMat.color.copy(curC1);
        qRingMat.color.copy(curC2);
        const arr = pGeo.attributes.position.array;
        for (let i = 0; i < P_COUNT; i++) {
          const i3 = i * 3;
          const pulse = 1 + Math.sin(phase * 1.2 + i * 0.15) * (0.06 + smoothSpeak * 0.1);
          arr[i3] = pBase[i3] * pulse;
          arr[i3 + 1] = pBase[i3 + 1] * pulse;
          arr[i3 + 2] = pBase[i3 + 2] * pulse;
        }
        pGeo.attributes.position.needsUpdate = true;
        particleGroup.rotation.y = phase * 0.18;
        qRing1.rotation.z = phase * 0.25;
        qRing2.rotation.y = -phase * 0.3;
      }

      if (dualGroup.visible) {
        const sep = 1.0 + smoothTension * 0.72;
        const ang = phase * 0.18;
        const wx = -Math.cos(ang) * sep, wz = -Math.sin(ang) * sep * 0.42;
        const mx = Math.cos(ang) * sep, mz = Math.sin(ang) * sep * 0.42;
        const wSpeak = smoothSpeak * smoothWife;
        const mSpeak = smoothSpeak * (1 - smoothWife);

        wifeOrb.position.set(wx, Math.sin(phase * 1.1) * 0.08, wz);
        wifeOrb.scale.setScalar(0.88 + wSpeak * 0.22);
        wifeMat.uniforms.uTime.value = phase;
        wifeMat.uniforms.uSpeak.value = wSpeak;
        wifeMat.uniforms.uTension.value = smoothTension * 0.65;
        wifeMat.uniforms.uColor1.value.setHex(0x38bdf8).lerp(curC1, 0.35);
        wifeMat.uniforms.uColor2.value.setHex(0x6ee7b7);

        motherOrb.position.set(mx, Math.cos(phase * 0.95) * 0.08, mz);
        motherOrb.scale.setScalar(0.88 + mSpeak * 0.22);
        motherMat.uniforms.uTime.value = phase * 1.05 + 1.3;
        motherMat.uniforms.uSpeak.value = mSpeak;
        motherMat.uniforms.uTension.value = smoothTension;
        motherMat.uniforms.uColor1.value.setHex(0xf43f5e).lerp(curC1, (1 - smoothTension) * 0.7);
        motherMat.uniforms.uColor2.value.setHex(0xfbbf24).lerp(curC2, (1 - smoothTension) * 0.7);

        bridgeLines.forEach(function (b) {
          const arr = b.geo.attributes.position.array;
          const arcSpread = (b.idx - 2.5) * 0.2;
          for (let j = 0; j < B_PTS; j++) {
            const u = j / (B_PTS - 1);
            const env = Math.sin(u * Math.PI);
            arr[j * 3] = wx + (mx - wx) * u;
            arr[j * 3 + 1] = (wifeOrb.position.y * (1 - u) + motherOrb.position.y * u) + arcSpread * env + Math.sin(u * 7 + phase * 2 + b.idx) * (0.07 + smoothSpeak * 0.08) * env;
            arr[j * 3 + 2] = wz + (mz - wz) * u + Math.cos(u * 5 - phase * 1.4 + b.idx) * 0.2 * env;
          }
          b.geo.attributes.position.needsUpdate = true;
          b.mat.color.copy(curC1);
          b.mat.opacity = 0.2 + (1 - smoothTension) * 0.55;
        });
      }

      if (prismGroup.visible) {
        prismFillMat.color.copy(curC1);
        prismWireMat.color.copy(curC2).lerp(new THREE.Color(0xffffff), 0.3);
        prismHaloMat.color.copy(curC1);
        prismMesh.rotation.y = phase * 0.25;
        prismMesh.rotation.x = Math.sin(phase * 0.4) * 0.22;
        prismWire.rotation.copy(prismMesh.rotation);
        const s = 0.94 + smoothSpeak * 0.14 * Math.sin(phase * 3.8) + smoothBloom * 0.12;
        prismMesh.scale.setScalar(s);
        prismWire.scale.setScalar(s * 1.03);
        prismHalo.rotation.z += dt * 0.14;
      }

      renderer.render(scene, camera);
    }

    rafId = requestAnimationFrame(animate);

    return {
      update: function (nextState) {
        Object.assign(st, nextState || {});
        applyVisibility();
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
    HOLOGRAM_STYLES: HOLOGRAM_STYLES,
    CASE_ICU_BRIEFS: CASE_ICU_BRIEFS,
    HARD_MODE_CURVEBALLS: HARD_MODE_CURVEBALLS,
    MICRO_DRILL_STAGES: MICRO_DRILL_STAGES,
    ADVISOR_GOALS: ADVISOR_GOALS,
    ADVISOR_QUICK_QUESTIONS: ADVISOR_QUICK_QUESTIONS,
    SELF_EFFICACY_ITEMS: SELF_EFFICACY_ITEMS,
    SUS_ITEMS: SUS_ITEMS,

    getPersonas: getPersonas,
    getCaseVoices: getCaseVoices,
    getCaseBarriers: getCaseBarriers,
    evaluateBarriersUnlocked: evaluateBarriersUnlocked,
    computeInertiaTrust: computeInertiaTrust,
    pickHardCurveball: pickHardCurveball,
    evaluateMicroDrillAnswer: evaluateMicroDrillAnswer,

    detectInAppBrowser: detectInAppBrowser,
    pickLatencyMaskCue: pickLatencyMaskCue,
    createVocalToneRecorder: createVocalToneRecorder,
    computeSusScore: computeSusScore,
    buildBlindTranscript: buildBlindTranscript,
    computeClinicalBadges: computeClinicalBadges,

    computeLabRecommendation: computeLabRecommendation,
    answerAdvisorQuestion: answerAdvisorQuestion,
    detectTriggerPhrases: detectTriggerPhrases,
    parseRelativeResponse: parseRelativeResponse,
    splitDualSpeakerSegments: splitDualSpeakerSegments,
    extractIntroducedLearnerName: extractIntroducedLearnerName,

    evaluateConversationFallback: evaluateConversationFallback,
    buildSupervisorEvaluationPrompt: buildSupervisorEvaluationPrompt,
    parseSupervisorJson: parseSupervisorJson,
    SoundFX: SoundFX,
    mountHologram3D: mountHologram3D
  };
})(window);
