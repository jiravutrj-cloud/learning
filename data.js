// ============================================================================
// rjcloud.organ — Master Static Data & AI Clinical Knowledge Base (Production 2027)
// ศูนย์กลางข้อมูล การตั้งค่าธีม และคลังสมรรถนะ AI ผูกบัญชีหลัก: rjcloud.organ@gmail.com
// ============================================================================

/**
 * 1. การตั้งค่าระบบส่วนกลาง (System Configuration)
 * เชื่อมต่อ Firebase Project (rj-cloud-organ) และ Google Apps Script เต็มรูปแบบ
 */
window.RJCLOUD_CONFIG = {
  appName: "rjcloud.organ",
  edition: "2027 Clinical Edition",
  contactEmail: "rjcloud.organ@gmail.com",
  appId: "rjcloud-organ-2027",

  // รูปภาพหลักหน้าแรกผู้เรียน (index.html)
  heroBannerUrl: "https://res.cloudinary.com/djwclucoz/image/upload/v1795227615/%E0%B8%94%E0%B8%B5%E0%B9%84%E0%B8%8B%E0%B8%99%E0%B9%8C%E0%B8%97%E0%B8%B5%E0%B9%88%E0%B8%A2%E0%B8%B1%E0%B8%87%E0%B9%84%E0%B8%A1%E0%B9%88%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%95%E0%B8%B1%E0%B9%89%E0%B8%87%E0%B8%8A%E0%B8%B7%E0%B9%88%E0%B8%AD_geidhl.png",

  // รายชื่ออีเมลที่มีสิทธิ์เข้าสู่ระบบหลังบ้าน (admin.html) ผ่าน Firebase Authentication
  adminEmails: [
    "rjcloud.organ@gmail.com"
  ],

  // เงื่อนไขเส้นทางการเรียนรู้ 5 ขั้นตอน (อ้างอิงตรงกันทุกไฟล์)
  learningRules: {
    allowedUserTypes: ["เรียนใหม่", "เรียนต่อเนื่อง"],
    minStudyPercent: 80,      // ขั้นที่ 2: สะสมชั่วโมงเรียนไม่น้อยกว่า 80% จึงปลดล็อก AI Skill Lab
    minPosttestPercent: 80    // ขั้นที่ 4 & 5: ทำ Post-test ไม่น้อยกว่า 80% เพื่อรับประกาศนียบัตร
  },

  // ค่าเริ่มต้นโหมดการแสดงผล (ผู้เรียนสามารถกดสลับ มืด/สว่าง ได้ทุกหน้า)
  theme: {
    defaultMode: "dark",      // "dark" (Spatial Dark) | "light" (Frosted Pearl)
    storageKey: "rjcloud_theme"
  },

  // ค่าเชื่อมต่อ Firebase Project: rj-cloud-organ (บัญชี rjcloud.organ@gmail.com)
  firebaseConfig: {
    apiKey: "AIzaSyCpvK0FCVVk9dt0ylHn_VzUStl7540UsbY",
    authDomain: "rj-cloud-organ.firebaseapp.com",
    projectId: "rj-cloud-organ",
    storageBucket: "rj-cloud-organ.firebasestorage.app",
    messagingSenderId: "1030088973707",
    appId: "1:1030088973707:web:8104bb1d90ac6a58f8e38e",
    measurementId: "G-X5YLDTC6V4"
  },

  // ลิงก์ Web App URL ของ Google Apps Script (สำหรับส่งอีเมล OTP และเรียก Gemini AI/TTS)
  appsScriptUrl: "https://script.google.com/macros/s/AKfycbwuN8MeZhhhomEhpkfXtpoTP341cugDqw1DbQPK_6NSHun2pGZCE0Kfc3eH4YYJ6aWQIg/exec"
};

/**
 * 2. ต้นแบบประกาศนียบัตรในตัวระบบ (Built-in Certificate Studio Template)
 * สไตล์มินิมอลเรียบหรู พื้นสีขาว ตัดเส้นสายสีทองบางเฉียบ
 */
window.DEFAULT_CERT_TEMPLATE = {
  certPrefix: "RJC-2027",
  orgTitleTH: "ศูนย์ความเป็นเลิศทางการแพทย์ด้านการรับบริจาคและปลูกถ่ายอวัยวะ",
  orgTitleEN: "rjcloud.organ • Clinical Organ Donation & Transplantation Network",
  courseTitleTH: "หลักสูตรการพยาบาลและการประสานงานการรับบริจาคและปลูกถ่ายอวัยวะ",
  courseTitleEN: "Organ Donation & Transplantation Clinical Coordination Program",
  subtitleTH: "ขอมอบประกาศนียบัตรฉบับนี้เพื่อแสดงว่า",
  completionTextTH: "ได้ผ่านการอบรมและประเมินผลตามเกณฑ์มาตรฐานหลักสูตรประจำปี 2027",
  signerName: "ผู้อำนวยการศูนย์ความเป็นเลิศทางการแพทย์",
  signerPosition: "ศูนย์ความเป็นเลิศทางการแพทย์ด้านการรับบริจาคและปลูกถ่ายอวัยวะ",
  hoursText: "ระยะเวลาการเรียนรู้ตามเกณฑ์มาตรฐานวิชาชีพ",
  logoUrl: "",
  signatureUrl: ""
};

/**
 * 3. วิดีโอสถานการณ์จำลองหลักสำหรับห้อง AI Skill Lab (Vimeo #1248608457)
 * บทบาท: ผู้เรียน = ผู้ให้ข้อมูลญาติ | AI = ญาติผู้เสียชีวิต
 */
window.SKILL_LAB_VIDEO = {
  vimeoId: "1248608457",
  shareUrl: "https://vimeo.com/1248608457?share=copy&fl=sv&fe=ci",
  embedUrl: "https://player.vimeo.com/video/1248608457?title=0&byline=0&portrait=0&dnt=1"
};

/**
 * 4. โครงสร้าง 4 หมวดสมรรถนะคลินิกสำหรับ AI Diagnostic Roadmap & Remediation
 */
window.CLINICAL_DOMAINS = {
  policy_ethics: {
    id: "policy_ethics",
    nameTH: "นโยบาย กฎหมาย และจริยธรรมวิชาชีพ",
    shortName: "กฎหมาย & จริยธรรม",
    color: "#38bdf8",
    lessonIds: [1, 3, 4, 7, 8],
    remediationGuide: "ทบทวนเป้าหมาย Service Plan, เกณฑ์อายุแสดงความจำนง (18 ปี), บทบาทจัดสรรอวัยวะของ ODC สภากาชาดไทย, การรักษาความลับผู้บริจาค-ผู้รับ และหลักจริยธรรม Autonomy (การเคารพการตัดสินใจ)"
  },
  brain_death_donor: {
    id: "brain_death_donor",
    nameTH: "การวินิจฉัยภาวะสมองตายและการดูแลผู้บริจาค",
    shortName: "สมองตาย & Donor",
    color: "#34d399",
    lessonIds: [5, 9, 12, 13],
    remediationGuide: "ทบทวนเกณฑ์ GCS=3, การตรวจทางคลินิก 2 ครั้งห่างกันอย่างน้อย 6 ชม. โดยแพทย์ 3 ท่าน, Apnea Test, สัญญาณรีเฟล็กซ์ไขสันหลัง (Lazarus Sign), การรักษาความดันโลหิต และการให้ DDAVP คุมภาวะเบาจืด (DI)"
  },
  procurement_transplant: {
    id: "procurement_transplant",
    nameTH: "การจัดเก็บ ขนส่ง และดูแลผู้ป่วยปลูกถ่ายอวัยวะ",
    shortName: "จัดเก็บ & ปลูกถ่าย",
    color: "#a78bfa",
    lessonIds: [2, 6, 10, 14, 15, 16, 17, 18, 19, 20],
    remediationGuide: "ทบทวนระยะเวลาทองของหัวใจ (ไม่เกิน 4 ชม.), การจัดเก็บดวงตา (6-8 ชม.), อุณหภูมิบรรจุไต (2-4 องศาเซลเซียส), น้ำยาถนอมอวัยวะ, HLA Typing และการตกแต่งร่างผู้บริจาคให้เรียบร้อยที่สุด"
  },
  family_communication: {
    id: "family_communication",
    nameTH: "การสื่อสารและให้ข้อมูลญาติผู้เสียชีวิต",
    shortName: "สื่อสารกับญาติ",
    color: "#fbbf24",
    lessonIds: [11],
    remediationGuide: "ทบทวนหลัก Decoupling (แยกการแจ้งข่าวสมองตายออกจากการขอรับบริจาค), หลัก SPIKES (S = Setting พื้นที่ที่เป็นส่วนตัว), หลัก B.A.L.I., การตอบคำถามความเชื่ออย่างอ่อนโยน และการดูแลจิตใจญาติ (Bereavement Care)"
  }
};

/**
 * ตัวจับคู่ข้อสอบมาตรฐานทั้ง 40 ข้อ (ดัชนี 0-39) เข้ากับ 4 หมวดสมรรถนะคลินิก
 */
window.QUESTION_DOMAIN_MAP = [
  "policy_ethics",          // 1. Service Plan
  "procurement_transplant", // 2. Eye procurement 6-8 ชม.
  "procurement_transplant", // 3. ประโยชน์การปลูกถ่ายไต
  "procurement_transplant", // 4. บรรจุไต 2-4 องศา
  "family_communication",   // 5. Decoupling
  "brain_death_donor",      // 6. Apnea Test
  "policy_ethics",          // 7. อายุขั้นต่ำ 18 ปี
  "procurement_transplant", // 8. อวัยวะที่ปลูกถ่ายไม่ได้ (สมอง)
  "brain_death_donor",      // 9. สาเหตุสมองตาย TBI
  "family_communication",   // 10. ความเชื่อชาติหน้าไม่ครบ
  "procurement_transplant", // 11. Golden Period หัวใจ <= 4 ชม.
  "brain_death_donor",      // 12. ข้อห้ามเด็ดขาด vs ความดันสูง
  "brain_death_donor",      // 13. Clinical Test 2 ครั้งห่าง 6 ชม.
  "brain_death_donor",      // 14. แพทย์ลงนามรับรอง 3 ท่าน
  "policy_ethics",          // 15. บทบาทศูนย์ ODC สภากาชาดไทย
  "procurement_transplant", // 16. เนื้อเยื่อเก็บได้นานสุด (ลิ้นหัวใจแช่แข็ง)
  "policy_ethics",          // 17. The Rule of Rescue
  "policy_ethics",          // 18. หน้าที่ของ TC
  "procurement_transplant", // 19. HLA Typing ไต
  "brain_death_donor",      // 20. Potential Donor รักษาสัญญาณชีพก่อน
  "brain_death_donor",      // 21. ยาคุมเบาจืด Desmopressin (DDAVP)
  "brain_death_donor",      // 22. ภาวะความดันต่ำในผู้ป่วยสมองตาย
  "family_communication",   // 23. หลัก B.A.L.I. ตัว L
  "family_communication",   // 24. มีบัตรจำนงแต่ญาติคัดค้านรุนแรง
  "brain_death_donor",      // 25. Lazarus Sign รีเฟล็กซ์ไขสันหลัง
  "policy_ethics",          // 26. ศูนย์ดวงตาสภากาชาดไทย
  "brain_death_donor",      // 27. DCD
  "brain_death_donor",      // 28. GCS = 3
  "procurement_transplant", // 29. ขั้นตอนสุดท้ายตกแต่งศพให้เรียบร้อย
  "family_communication",   // 30. Bereavement Care
  "brain_death_donor",      // 31. Antibiotics ในผู้ป่วยสมองตาย
  "procurement_transplant", // 32. ไขกระดูกไม่ใช่จากสมองตาย
  "brain_death_donor",      // 33. อายุ 70 ปีสมองตายบริจาคได้หากอวัยวะดี
  "family_communication",   // 34. SPIKES ตัว S ตัวแรก (Setting)
  "brain_death_donor",      // 35. EEG เป็นทางเลือกเสริม
  "procurement_transplant", // 36. ล้างและแช่ Preservation Solution อุณหภูมิต่ำ
  "policy_ethics",          // 37. ระบบจัดสรรอวัยวะอย่างเป็นธรรมของ ODC
  "policy_ethics",          // 38. ความลับผู้บริจาคและผู้รับ
  "brain_death_donor",      // 39. ECMO พยุงอวัยวะรอจัดเก็บ
  "policy_ethics"           // 40. จริยธรรม Autonomy
];

/**
 * 5. คลังบุคลิกญาติจำลอง 4 สถานการณ์ (Multi-Persona Scenarios — ล็อกตัวละครชัดเจนไม่สับสน) สำหรับ AI Skill Lab
 */
window.SKILL_LAB_PERSONAS = [
  {
    id: "standard",
    icon: "HeartPulse",
    accent: "#38bdf8",
    titleTH: "1. ญาติสับสนเรื่องภาวะสมองตาย (เคสคุณพ่อ)",
    titleEN: "1. Brain Death & Ventilator Confusion (Father)",
    tagTH: "สถานการณ์มาตรฐาน",
    tagEN: "Standard Case",
    patientRoleTH: "คุณพ่อ (อายุ 52 ปี อุบัติเหตุทางศีรษะ TBI)",
    speakerRoleTH: "คุณแพรว (ลูกสาวของผู้ป่วย)",
    descTH: "ลูกสาวเห็นหน้าอกคุณพ่อยังขยับและตัวอุ่นจากเครื่องช่วยหายใจ จึงยังทำใจเชื่อไม่ได้ว่าสมองตายถาวร",
    descEN: "Daughter sees her father's chest movement and warmth from ventilator support and struggles to accept brain death.",
    openingEmotion: "CONFUSED",
    openingTH: "สวัสดีค่ะ... ขอบคุณที่พาหนูเข้ามานั่งคุยในที่เงียบๆ นะคะ แต่ตอนนี้ใจคอไม่ดีเลย เมื่อกี้เพิ่งไปจับมือคุณพ่อ ตัวพ่อก็ยังอุ่น หน้าอกก็ยังขยับอยู่เลย ตกลงอาการของคุณพ่อเป็นยังไงกันแน่คะ?",
    openingEN: "Hello... Thank you for bringing me into this quiet room. My heart is racing—I just held my father's hand and it still felt warm, and his chest is rising. What is really happening to my dad?",
    briefingTH: "ผู้ป่วยคือ 'คุณพ่อ' (อายุ 52 ปี อุบัติเหตุทางศีรษะ) แพทย์ยืนยันภาวะสมองตายตามเกณฑ์แล้ว คุณกำลังพูดคุยกับ 'คุณแพรว (ลูกสาว)' ในห้องให้คำปรึกษาส่วนตัว",
    briefingEN: "The patient is a 52-year-old father confirmed brain dead after TBI. You are speaking privately with his daughter, who is confused by ventilator-supported chest movement.",
    promptHintTH: "ล็อกตัวละครเด็ดขาด: ผู้ป่วยคือ 'คุณพ่อ' เท่านั้น และคุณคือ 'ลูกสาว (แทนตัวเองว่าหนู)' ห้ามเปลี่ยนไปพูดถึงแม่หรือยายเสียชีวิตเด็ดขาด! เน้นความสับสนระหว่างเครื่องช่วยหายใจกับภาวะสมองตายถาวร",
    promptHintEN: "LOCKED CHARACTERS: The patient is strictly your FATHER and you are his DAUGHTER. Never mention any other deceased relative. Focus on confusion between ventilator support and irreversible brain death."
  },
  {
    id: "belief",
    icon: "Sparkles",
    accent: "#fbbf24",
    titleTH: "2. ความเชื่อ ศาสนา และพิธีกรรม (เคสน้องชาย)",
    titleEN: "2. Cultural Beliefs & Spiritual Concerns (Brother)",
    tagTH: "บริบทสังคมไทย",
    tagEN: "Cultural Context",
    patientRoleTH: "น้องชาย (อายุ 28 ปี อุบัติเหตุจราจร)",
    speakerRoleTH: "คุณฝน (พี่สาว — กังวลแทนคุณยายที่เคร่งศาสนา)",
    descTH: "พี่สาวกังวลแทนคุณยายที่กลัวว่าหากบริจาคอวัยวะของน้องชายแล้วชาติหน้าอวัยวะจะไม่ครบ หรือทำพิธีศาสนาไม่ได้",
    descEN: "Older sister worries on behalf of their grandmother that donating her brother's organs may affect spiritual wholeness or funeral rites.",
    openingEmotion: "HESITANT",
    openingTH: "สวัสดีค่ะ... พอคุณหมอแจ้งข่าวน้องชาย ใจหนูมันหวิวไปหมดเลยค่ะ แต่ที่บ้านคุณยายท่านเคร่งเรื่องความเชื่อมาก ท่านกลัวว่าถ้าบริจาคอวัยวะ ร่างของน้องชายจะไม่ครบ 32 ชาติหน้าจะลำบาก แล้วจะทำพิธีทางศาสนาได้ตามปกติไหมคะ?",
    openingEN: "Hello... After hearing the doctor's news about my younger brother, I feel numb. Our grandmother is very worried—she fears that if his organs are donated, his body won't be whole spiritually or ready for our religious ceremony.",
    briefingTH: "ผู้ป่วยคือ 'น้องชาย' (อายุ 28 ปี) คุณกำลังคุยกับ 'คุณฝน (พี่สาว)' ที่รับทราบภาวะสมองตายแล้ว แต่กังวลความเชื่อของคุณยายเรื่องชาติหน้าอวัยวะไม่ครบและพิธีกรรมศาสนา",
    briefingEN: "The patient is a 28-year-old younger brother. You are speaking with his sister, who worries about their grandmother's spiritual concerns regarding bodily wholeness and funeral rites.",
    promptHintTH: "ล็อกตัวละครเด็ดขาด: ผู้ป่วย/ผู้เสียชีวิตคือ 'น้องชาย' เท่านั้น ส่วนคุณคือ 'พี่สาว' ที่เป็นห่วงความรู้สึกของ 'คุณยาย' (คุณยายยังมีชีวิตอยู่และไม่ได้ป่วย!) ห้ามสลับไปบอกว่าคุณยายหรือคุณแม่เสียชีวิตเด็ดขาด!",
    promptHintEN: "LOCKED CHARACTERS: The patient is strictly your YOUNGER BROTHER and you are his OLDER SISTER worrying about your living GRANDMOTHER's religious beliefs. Never say grandmother or mother died."
  },
  {
    id: "conflict",
    icon: "Users",
    accent: "#f43f5e",
    titleTH: "3. ความขัดแย้งในครอบครัว 2 เสียง (เคสคุณต้น)",
    titleEN: "3. Family Conflict — Two Voices (Husband/Son)",
    tagTH: "จริยธรรม & แรงกดดัน",
    tagEN: "Ethical Dilemma",
    patientRoleTH: "คุณต้น (อายุ 36 ปี เลือดออกในสมอง — สามี/ลูกชาย)",
    speakerRoleTH: "ภรรยา และ คุณแม่ของผู้ป่วย (2 เสียงในห้องเดียวกัน)",
    descTH: "ภรรยาอยากทำตามบัตรบริจาคของคุณต้น แต่คุณแม่คัดค้านอย่างรุนแรง (ฝึกวางตัวเป็นกลางและไม่ฝืนใจครอบครัว)",
    descEN: "Wife wants to honor her husband's donor card, while his mother strongly objects (practice ethical neutrality and family unity).",
    openingEmotion: "ANGRY",
    openingTH: "[ภรรยา]: หนูจำได้ว่าพี่ต้นเคยทำบัตรบริจาคอวัยวะไว้ค่ะ อยากทำให้เป็นบุญครั้งสุดท้ายของพี่เขา... [คุณแม่แทรกเสียงสั่น]: แม่ไม่ยอมนะ! ต้นลูกแม่เจ็บมามากพอแล้ว ใครอย่ามาแตะตัวลูกแม่เด็ดขาด! คุณเจ้าหน้าที่ตกลงจะเอาตามบัตรหรือเอาตามใจแม่คะ?",
    openingEN: "[Wife]: He signed a donor card—I want to honor my husband's last wish... [Mother interrupts tearfully]: No! My son has suffered enough! Don't let anyone touch him! Who has the final say here?!",
    briefingTH: "ผู้ป่วยคือ 'คุณต้น' (อายุ 36 ปี) ในห้องมีทั้ง 'ภรรยา' (อยากทำตามบัตรจำนง) และ 'คุณแม่' (คัดค้านด้วยความเจ็บปวด) หลักจริยธรรมไทยคือไม่ฝืนใจญาติสายตรงและประคับประคองความรักของทั้งสองฝ่าย",
    briefingEN: "The patient is a 36-year-old man (husband/son). Both his wife (pro-donation) and mother (strongly objecting) are present. Stay neutral, never coerce, and protect family unity.",
    promptHintTH: "ล็อกตัวละครเด็ดขาด: ผู้ป่วยคือ 'คุณต้น (สามี/ลูกชาย)' เท่านั้น และคุณสวมบทบาท 2 เสียงคือ [ภรรยา] และ [คุณแม่] ห้ามเปลี่ยนตัวละคร! หากผู้เรียนไม่เข้าข้างฝ่ายใด ไม่เร่งรัด และยืนยันจะไม่ฝืนใจครอบครัว คุณแม่จึงค่อยๆ สงบลง",
    promptHintEN: "LOCKED CHARACTERS: The patient is strictly the 36-year-old HUSBAND/SON. Portray [Wife] and [Mother] consistently. De-escalate when the learner stays neutral and assures zero coercion."
  },
  {
    id: "distrust",
    icon: "ShieldAlert",
    accent: "#c084fc",
    titleTH: "4. ญาติไม่ไว้วางใจระบบและกลัวค่าใช้จ่าย (เคสคุณแม่)",
    titleEN: "4. System Distrust & Fairness Concerns (Mother)",
    tagTH: "ความโปร่งใส ODC",
    tagEN: "Transparency",
    patientRoleTH: "คุณแม่ (อายุ 58 ปี โรคหลอดเลือดสมองแตก)",
    speakerRoleTH: "คุณนุช (ลูกสาวของผู้ป่วย)",
    descTH: "ลูกสาวระแวงเรื่องการลัดคิวให้คนรวย การซื้อขายอวัยวะ และกังวลว่าครอบครัวต้องจ่ายค่ารักษาคุณแม่เพิ่ม",
    descEN: "Daughter suspects organ trafficking, queue-jumping for wealthy recipients, or extra ICU bills for her mother.",
    openingEmotion: "ANGRY",
    openingTH: "ขอถามตรงๆ เลยนะคะ... ที่มาคุยเรื่องคุณแม่แบบนี้ เพราะจะเอาอวัยวะไปให้คนรวยที่จ่ายเงินลัดคิวใช่ไหมคะ? แล้วถ้าต้องยืดเครื่องช่วยหายใจรอผ่าตัด ครอบครัวเราต้องมารับผิดชอบค่าใช้จ่ายของคุณแม่เพิ่มอีกหรือเปล่าคะ?",
    openingEN: "Let me ask you bluntly... Are you only bringing this up about my mother so wealthy people can buy organs and skip the queue? And will our family be billed for extra ICU hours?",
    briefingTH: "ผู้ป่วยคือ 'คุณแม่' (อายุ 58 ปี โรคหลอดเลือดสมองแตก) คุณกำลังคุยกับ 'คุณนุช (ลูกสาว)' ที่มีความระแวงต่อระบบจัดสรรอวัยวะและกลัวค่าใช้จ่ายเพิ่ม",
    briefingEN: "The patient is a 58-year-old mother. Her daughter expresses suspicion about fairness, organ selling, and hospital costs. Stay calm and explain ODC transparency and zero cost to the family.",
    promptHintTH: "ล็อกตัวละครเด็ดขาด: ผู้ป่วยคือ 'คุณแม่' เท่านั้น และคุณคือ 'ลูกสาว (แทนตัวเองว่าหนู/ดิฉัน)' ห้ามเปลี่ยนไปพูดถึงพ่อหรือยาย! หากผู้เรียนตอบอย่างใจเย็น ตรงไปตรงมา อธิบายระบบคอมพิวเตอร์ ODC สภากาชาดไทยและไม่มีค่าใช้จ่ายจึงค่อยๆ คลายความระแวง",
    promptHintEN: "LOCKED CHARACTERS: The patient is strictly your MOTHER and you are her DAUGHTER. Stay consistent; soften when the learner responds calmly with transparent ODC allocation facts and zero cost."
  }
];

/**
 * 6. ระดับความยากที่ผู้เรียนเลือกได้เอง (User-Friendly: Normal vs Hard)
 */
window.SKILL_LAB_DIFFICULTIES = {
  normal: {
    id: "normal",
    labelTH: "Normal (มีตัวช่วยแนะนำ)",
    labelEN: "Normal (Guided Support)",
    badge: "NORMAL",
    descTH: "เหมาะสำหรับฝึกสร้างความมั่นใจ มี AI Coach ชี้นำและแสดงปุ่มแนวทางคำพูดให้เลือกปรับใช้ได้",
    descEN: "Ideal for building confidence—includes AI Coach whispers and suggested response prompts.",
    showSuggestions: true,
    showCoachDefault: true,
    aiPromptRuleTH: "ระดับ Normal: ตอบสนองอย่างสมจริงและค่อยๆ เปิดใจขึ้นตามขั้นตอนเมื่อผู้เรียนแสดงความเห็นอกเห็นใจและให้ข้อมูลถูกต้อง",
    aiPromptRuleEN: "Normal Mode: Respond realistically and gradually open up when the learner shows empathy and clear facts."
  },
  hard: {
    id: "hard",
    labelTH: "Hard (ท้าทายเสมือนจริง)",
    labelEN: "Hard (Realistic Challenge)",
    badge: "HARD",
    descTH: "ซ่อนปุ่มแนวทางคำพูดอัตโนมัติ (คิดและพูดเอง 100%) ญาติมีอารมณ์อ่อนไหวสูงและซักถามเจาะลึกหน้างานจริง",
    descEN: "Hides suggested replies (100% free response). Relative asks probing clinical/emotional follow-ups.",
    showSuggestions: false,
    showCoachDefault: false,
    aiPromptRuleTH: "ระดับ Hard: แสดงอารมณ์ที่อ่อนไหวและซักถามเจาะลึกมากขึ้น (เช่น ถามย้ำเรื่องหลักฐานการตรวจสมองตาย ระยะเวลา หรือความกังวลซับซ้อน) จะยังไม่ยอมเปิดใจง่ายๆ จนกว่าผู้เรียนจะรับฟังอารมณ์และอธิบายหลักการได้อย่างลึกซึ้งจริงใจ",
    aiPromptRuleEN: "Hard Mode: Ask sharper emotional and clinical follow-ups; do not shift to CALM easily until the learner demonstrates deep empathy and accurate clinical clarity."
  }
};

/**
 * 7. พจนานุกรมตรวจจับ "คำที่อาจกระทบใจญาติ" และเสนอคำที่นุ่มนวลกว่า (AI Trigger-Word Polisher)
 */
window.TRIGGER_PHRASE_DICTIONARY = [
  {
    id: "unplug",
    lang: "th",
    pattern: /ถอดเครื่อง|ปิดเครื่อง|ดึงสาย|ถอดสาย/,
    flagged: "ถอดเครื่อง / ปิดเครื่อง",
    softer: "ยุติการใช้เครื่องพยุงชีพ / ดูแลให้ท่านจากไปอย่างสงบ",
    reason: "คำว่า 'ถอดเครื่อง' มักทำให้ญาติรู้สึกผิดเหมือนเป็นคนสั่งยุติชีวิตบุคคลอันเป็นที่รัก"
  },
  {
    id: "corpse",
    lang: "th",
    pattern: /ศพ|ซาก|คนตาย/,
    flagged: "ศพ / คนตาย",
    softer: "ร่างของผู้เสียชีวิต / ท่าน / คุณ...",
    reason: "การเรียกว่า 'ร่างของผู้เสียชีวิต' หรือเอ่ยชื่ออย่างให้เกียรติช่วยถนอมความรู้สึกของครอบครัว"
  },
  {
    id: "cut_out",
    lang: "th",
    pattern: /ผ่าเอา|ควัก|ตัดเอา|ชำแหละ|เอาอวัยวะออก/,
    flagged: "ผ่าเอา / ควัก / เอาอวัยวะออก",
    softer: "ดูแลจัดเก็บอวัยวะอย่างประณีตเพื่อส่งต่อชีวิตใหม่",
    reason: "หลีกเลี่ยงคำที่ก่อให้เกิดภาพความเจ็บปวดหรือความรุนแรงทางสายตาของญาติ"
  },
  {
    id: "hopeless",
    lang: "th",
    pattern: /ไม่รอดแล้ว|หมดหวังแล้ว|ตายแล้ว|ไม่มีทางหาย|ทำใจเถอะ/,
    flagged: "ไม่รอดแล้ว / หมดหวัง / ทำใจเถอะ",
    softer: "ก้านสมองหยุดทำงานอย่างถาวร / ทีมแพทย์ได้ดูแลอย่างสุดความสามารถแล้ว",
    reason: "ภาษาที่ตรงไปตรงมาแต่อ่อนโยนช่วยลดแรงกระแทกทางอารมณ์และแสดงความเคารพต่อความสูญเสีย"
  },
  {
    id: "rush",
    lang: "th",
    pattern: /รีบตัดสินใจ|ต้องรีบ|เดี๋ยวไม่ทัน|เซ็นเลย|เซ็นตอนนี้/,
    flagged: "รีบตัดสินใจ / เดี๋ยวไม่ทัน / เซ็นเลย",
    softer: "ขอให้ครอบครัวค่อยๆ ปรึกษากันอย่างเต็มที่โดยไม่เร่งรัดค่ะ",
    reason: "การเร่งรัดขัดต่อหลัก Decoupling และ Zero Pressure อาจทำให้ญาติปิดกั้นทันที"
  },
  {
    id: "unplug_en",
    lang: "en",
    pattern: /pull the plug|turn off the machine|unplug/i,
    flagged: "pull the plug / turn off the machine",
    softer: "withdraw life-sustaining support peacefully",
    reason: "Harsh phrasing can trigger intense guilt for grieving relatives."
  },
  {
    id: "harvest_en",
    lang: "en",
    pattern: /harvest|cut out|corpse|dead body/i,
    flagged: "harvest / cut out / corpse",
    softer: "respectfully recover organs / your loved one's body",
    reason: "Person-centered surgical wording honors the patient's dignity."
  },
  {
    id: "rush_en",
    lang: "en",
    pattern: /decide now|hurry up|sign immediately|running out of time/i,
    flagged: "decide now / hurry up / running out of time",
    softer: "take all the private time your family needs—there is no rush",
    reason: "Non-coercive pacing preserves trust and ethical autonomy."
  }
];

/**
 * 8. คลังมินิเคสจำลองคลินิกแบบโต้ตอบ (AI Clinical Case Simulator สำหรับ index.html)
 */
window.CLINICAL_CASE_SIMULATIONS = [
  {
    id: "case_donor_di",
    domain: "brain_death_donor",
    badge: "DONOR MANAGEMENT • ICU",
    title: "เคสที่ 1: ดูแลผู้บริจาคสมองตายภาวะความดันตกและเบาจืด",
    patientSummary: "ชายอายุ 34 ปี อุบัติเหตุทางศีรษะ (TBI) คะแนน GCS = 3 แพทย์ประเมินเข้าข่าย Potential Donor",
    steps: [
      {
        vitals: { bp: "74/44 mmHg", hr: "118 /min", uo: "680 mL/hr", na: "154 mEq/L" },
        situation: "ขณะดูแลใน ICU สัญญาณชีพเริ่มไม่คงที่ ความดันโลหิตลดลงเหลือ 74/44 mmHg และปัสสาวะออกมากผิดปกติ 680 mL/hr (ใสมาก) คุณจะประเมินและจัดการขั้นตอนแรกอย่างไร?",
        options: [
          {
            label: "รีบแจ้งศูนย์รับบริจาคอวัยวะ (ODC) และหยุดสารน้ำทั้งหมดทันทีเพื่อรอดูอาการ",
            correct: false,
            outcome: "ความดันโลหิตตกลงอีกเหลือ 60/38 mmHg เสี่ยงไตและหัวใจขาดเลือดเสียหาย! หลัก Donor Management ต้องรักษาสัญญาณชีพให้คงที่ก่อนเสมอค่ะ",
            nextVitals: { bp: "60/38 mmHg", hr: "132 /min", uo: "720 mL/hr", na: "158 mEq/L" }
          },
          {
            label: "รายงานแพทย์เพื่อรักษาสัญญาณชีพ (Fluid/Vasopressor) และประเมินภาวะเบาจืด (Diabetes Insipidus)",
            correct: true,
            outcome: "ยอดเยี่ยมค่ะ! การพยุงความดันโลหิตและตรวจจับภาวะเบาจืดตั้งแต่ต้นช่วยป้องกันไม่ให้อวัยวะขาดเลือดและรักษาสมดุลเกลือแร่ได้ทันท่วงที",
            nextVitals: { bp: "102/64 mmHg", hr: "96 /min", uo: "520 mL/hr", na: "151 mEq/L" }
          }
        ]
      },
      {
        vitals: { bp: "102/64 mmHg", hr: "96 /min", uo: "520 mL/hr", na: "151 mEq/L" },
        situation: "หลังพยุงความดันดีขึ้น ปัสสาวะยังคงออกมากกว่า 500 mL/hr และค่าโซเดียมในเลือดสูง (Hypernatremia) ยาหลักที่นิยมใช้ควบคุมภาวะเบาจืดในผู้ป่วยสมองตายคือข้อใด?",
        options: [
          {
            label: "Desmopressin (DDAVP) ควบคู่การติดตามปริมาณปัสสาวะและเกลือแร่ใกล้ชิด",
            correct: true,
            outcome: "แม่นยำมากค่ะ! DDAVP ช่วยควบคุมภาวะเบาจืด ทำให้ปัสสาวะกลับสู่เกณฑ์ปกติ (100–150 mL/hr) และคงคุณภาพอวัยวะได้ดีเยี่ยม",
            nextVitals: { bp: "112/70 mmHg", hr: "84 /min", uo: "120 mL/hr", na: "142 mEq/L" }
          },
          {
            label: "ให้ยาขับปัสสาวะ (Furosemide) เพื่อลดบวมสมองเพิ่มเติม",
            correct: false,
            outcome: "ไม่เหมาะสมค่ะ เพราะผู้ป่วยกำลังสูญเสียน้ำอย่างรุนแรงจากภาวะเบาจืด การให้ยาขับปัสสาวะจะยิ่งทำให้ความดันตกและโซเดียมพุ่งสูงค่ะ",
            nextVitals: { bp: "82/50 mmHg", hr: "124 /min", uo: "810 mL/hr", na: "160 mEq/L" }
          }
        ]
      }
    ]
  },
  {
    id: "case_brain_death",
    domain: "brain_death_donor",
    badge: "BRAIN DEATH • DIAGNOSIS",
    title: "เคสที่ 2: เกณฑ์วินิจฉัยภาวะสมองตายและ Lazarus Sign",
    patientSummary: "หญิงอายุ 48 ปี เลือดออกในสมองขนาดใหญ่ GCS = 3 ไม่หายใจเอง พึ่งพาเครื่องช่วยหายใจ",
    steps: [
      {
        vitals: { bp: "114/72 mmHg", hr: "82 /min", temp: "36.8°C", gcs: "E1V1M1 (3)" },
        situation: "ขณะแพทย์ตรวจยืนยันภาวะสมองตายครั้งแรก ญาติสังเกตเห็นแขนผู้ป่วยขยับกระตุกเล็กน้อยตอนขยับตัวและร้องไห้คิดว่าผู้ป่วยกำลังจะฟื้น สัญญาณนี้คืออะไรและควรอธิบายอย่างไร?",
        options: [
          {
            label: "อธิบายอย่างอ่อนโยนว่าเป็น Lazarus Sign (รีเฟล็กซ์จากไขสันหลัง) ไม่ใช่การฟื้นคืนสติของสมอง",
            correct: true,
            outcome: "ถูกต้องและสื่อสารได้ดีมากค่ะ! Lazarus Sign เป็น Spinal Reflex ที่พบได้ในผู้ป่วยสมองตาย การอธิบายอย่างนุ่มนวลช่วยลดความสับสนของครอบครัว",
            nextVitals: { bp: "112/70 mmHg", hr: "80 /min", temp: "36.8°C", gcs: "E1V1M1 (3)" }
          },
          {
            label: "รีบแจ้งญาติว่าผู้ป่วยกำลังฟื้นตัวและยกเลิกการประเมินภาวะสมองตายทันที",
            correct: false,
            outcome: "คลาดเคลื่อนค่ะ การกระตุกของแขนขาเมื่อถูกกระตุ้นอาจเป็นเพียงรีเฟล็กซ์ระดับไขสันหลัง (Spinal Reflex) ต้องอาศัยเกณฑ์การตรวจก้านสมองโดยแพทย์ค่ะ",
            nextVitals: { bp: "114/72 mmHg", hr: "82 /min", temp: "36.8°C", gcs: "E1V1M1 (3)" }
          }
        ]
      },
      {
        vitals: { bp: "112/70 mmHg", hr: "80 /min", temp: "36.8°C", gcs: "E1V1M1 (3)" },
        situation: "ตามเกณฑ์แพทยสภาในผู้ใหญ่ การรับรองภาวะสมองตายให้ถูกต้องตามกฎหมายต้องดำเนินการตรวจยืนยันอย่างไร?",
        options: [
          {
            label: "ตรวจทางคลินิกอย่างน้อย 2 ครั้ง ห่างกัน ≥ 6 ชม. ร่วมทำ Apnea Test และลงนามรับรองโดยแพทย์ 3 ท่าน (ไม่อยู่ในทีมปลูกถ่าย)",
            correct: true,
            outcome: "ครบถ้วน 100% ค่ะ! โดยการตรวจ EEG เป็นทางเลือกเสริมในกรณีที่ไม่สามารถประเมินทางคลินิกบางส่วนได้",
            nextVitals: { bp: "110/68 mmHg", hr: "78 /min", temp: "36.7°C", gcs: "CONFIRMED" }
          },
          {
            label: "ตรวจเพียง 1 ครั้งโดยแพทย์เวร 1 ท่าน และบังคับทำ EEG ทุกราย",
            correct: false,
            outcome: "ไม่ตรงตามเกณฑ์กฎหมายไทยค่ะ ในผู้ใหญ่ต้องตรวจอย่างน้อย 2 ครั้งห่างกัน ≥ 6 ชม. และมีแพทย์ผู้เชี่ยวชาญร่วมรับรองรวม 3 ท่านค่ะ",
            nextVitals: { bp: "112/70 mmHg", hr: "80 /min", temp: "36.8°C", gcs: "PENDING" }
          }
        ]
      }
    ]
  },
  {
    id: "case_procurement_coldchain",
    domain: "procurement_transplant",
    badge: "PROCUREMENT & OR • COLD CHAIN",
    title: "เคสที่ 3: การบรรจุขนส่งอวัยวะและระยะเวลาทอง (Golden Period)",
    patientSummary: "ครอบครัวตกลงบริจาคหัวใจ ไต 2 ข้าง และดวงตา ทีมผ่าตัดจัดเก็บ (OR) กำลังเตรียมการ",
    steps: [
      {
        vitals: { heartLimit: "≤ 4 ชม.", eyeLimit: "6–8 ชม.", kidneyTemp: "2–4°C", status: "IN OR" },
        situation: "หลังศัลยแพทย์จัดเก็บไตออกมาเรียบร้อยแล้ว ขั้นตอนการบรรจุและควบคุมอุณหภูมิเพื่อส่งต่อให้ รพ.ผู้รับข้อใดถูกต้องที่สุด?",
        options: [
          {
            label: "ล้างและแช่ในน้ำยาถนอมอวัยวะ (Preservation Solution) บรรจุปลอดเชื้อหลายชั้น คุมอุณหภูมิ 2–4°C ในน้ำแข็งเกล็ดที่กำลังละลาย",
            correct: true,
            outcome: "สมบูรณ์แบบค่ะ! อุณหภูมิ 2–4°C ช่วยถนอมเซลล์ไตโดยไม่ทำให้เนื้อเยื่อแข็งตัวเสียหาย และต้องประสานขนส่งหัวใจให้ทันภายใน 4 ชม.",
            nextVitals: { heartLimit: "≤ 4 ชม.", eyeLimit: "6–8 ชม.", kidneyTemp: "2–4°C ✓", status: "PACKED" }
          },
          {
            label: "แช่ในน้ำแข็งแห้ง (-20°C) เพื่อให้อวัยวะเย็นจัดและเก็บได้นานหลายวัน",
            correct: false,
            outcome: "อันตรายต่อเนื้อเยื่อค่ะ! ห้ามใช้น้ำแข็งแห้ง (-20°C) หรือให้ไตสัมผัสน้ำแข็งโดยตรงเด็ดขาดเพราะเซลล์ไตจะถูกทำลายถาวรค่ะ",
            nextVitals: { heartLimit: "≤ 4 ชม.", eyeLimit: "6–8 ชม.", kidneyTemp: "-20°C ✗", status: "RISK" }
          }
        ]
      },
      {
        vitals: { heartLimit: "≤ 4 ชม.", eyeLimit: "6–8 ชม.", kidneyTemp: "2–4°C ✓", status: "POST-OR" },
        situation: "เมื่อส่งมอบอวัยวะทั้งหมดเรียบร้อยแล้ว ขั้นตอนสุดท้ายที่สำคัญที่สุดในห้องผ่าตัดก่อนส่งมอบร่างคืนแก่ครอบครัวคือข้อใด?",
        options: [
          {
            label: "ดูแลเย็บแผลและตกแต่งร่างผู้บริจาคให้เรียบร้อยสมบูรณ์และสมเกียรติที่สุด พร้อมร่วมแสดงความเคารพ",
            correct: true,
            outcome: "งดงามและถูกต้องตามมาตรฐานจริยธรรมสูงสุดค่ะ การดูแลตกแต่งร่างอย่างประณีตคือการให้เกียรติสูงสุดต่อผู้เสียชีวิตและช่วยเยียวยาจิตใจครอบครัวค่ะ",
            nextVitals: { heartLimit: "SENT ✓", eyeLimit: "SENT ✓", kidneyTemp: "2–4°C ✓", status: "DIGNIFIED ✓" }
          },
          {
            label: "ส่งมอบร่างทันทีโดยไม่ต้องเย็บปิดแผลละเอียดเพื่อประหยัดเวลาห้องผ่าตัด",
            correct: false,
            outcome: "ไม่เหมาะสมอย่างยิ่งค่ะ การตกแต่งร่างให้เรียบร้อยสมบูรณ์ที่สุดเป็นหัวใจสำคัญของกระบวนการรับบริจาคอวัยวะค่ะ",
            nextVitals: { heartLimit: "SENT", eyeLimit: "SENT", kidneyTemp: "2–4°C", status: "REVIEW" }
          }
        ]
      }
    ]
  }
];

/**
 * 9. โปรไฟล์ปรับมุมมอง AI Tutor ตามตำแหน่งและแผนกจริง (Role-Adaptive AI Tutor)
 */
window.ROLE_ADAPTIVE_PROFILES = {
  donor_team: {
    id: "donor_team",
    badgeTH: "มุมมองทีมรับบริจาค / TC",
    focusSummary: "เน้นการประสานงาน ODC, หลักการสื่อสาร Decoupling & SPIKES, กฎหมาย-จริยธรรม และการติดตาม Conversion Rate",
    aiPromptAddon: "ผู้เรียนปฏิบัติงานด้านรับบริจาค/ปลูกถ่ายอวัยวะ (TC) โดยตรง ให้เน้นมุมมองการประสานงานทีมสหสาขาวิชาชีพ การสื่อสารกับครอบครัว และความถูกต้องตามเกณฑ์ ODC"
  },
  icu_er_or: {
    id: "icu_er_or",
    badgeTH: "มุมมอง ICU / ER / OR",
    focusSummary: "เน้นการคัดกรอง Potential Donor (GCS=3), การรักษาสัญญาณชีพ (DDAVP/ความดัน), Cold Chain 2–4°C และการดูแลตกแต่งร่างในห้องผ่าตัด",
    aiPromptAddon: "ผู้เรียนปฏิบัติงานหอผู้ป่วยวิกฤต (ICU) ห้องฉุกเฉิน (ER) หรือห้องผ่าตัด (OR) ให้เน้นประเด็นหน้างานคลินิก การเฝ้าระวังสัญญาณชีพ ภาวะเบาจืด และมาตรฐานจัดเก็บ/ขนส่งอวัยวะ"
  },
  general: {
    id: "general",
    badgeTH: "มุมมองผู้สนใจศึกษาทั่วไป",
    focusSummary: "อธิบายศัพท์แพทย์และเกณฑ์ทางคลินิกด้วยภาษาที่เข้าใจง่าย พร้อมเชื่อมโยงคุณค่าการต่อชีวิตเพื่อนมนุษย์",
    aiPromptAddon: "ผู้เรียนไม่ได้ปฏิบัติงานด้านนี้โดยตรง ให้เริ่มต้นอธิบายศัพท์การแพทย์อย่างเข้าใจง่าย กระชับ เป็นมิตร ก่อนเชื่อมโยงสู่มาตรฐานวิชาชีพ"
  }
};

/**
 * 10. คลังการ์ดทบทวนความจำอัจฉริยะ (AI Spaced-Repetition Smart Flashcards)
 * ผูกกับหมวดคลินิกทั้ง 4 หมวด เพื่อดึงการ์ดตรงจุดอ่อนของผู้เรียนมาทบทวนก่อนสอบ Post-test
 */
window.SPACED_FLASHCARDS = [
  { id: "fc1", domain: "brain_death_donor", front: "เกณฑ์ตรวจยืนยันภาวะสมองตายในผู้ใหญ่ต้องตรวจกี่ครั้ง ห่างกันกี่ชั่วโมง และแพทย์กี่ท่าน?", back: "ตรวจทางคลินิกอย่างน้อย 2 ครั้ง ห่างกันอย่างน้อย 6 ชั่วโมง และลงนามรับรองโดยแพทย์ 3 ท่าน (ที่ไม่เกี่ยวข้องกับทีมปลูกถ่าย) ร่วมกับ Apnea Test" },
  { id: "fc2", domain: "brain_death_donor", front: "ผู้ป่วยสมองตายมีภาวะเบาจืด (Diabetes Insipidus) ปัสสาวะออกมากผิดปกติ ใช้ยาอะไรคุม?", back: "Desmopressin (DDAVP) ควบคู่การรักษาความดันโลหิตให้คงที่และติดตามเกลือแร่โซเดียมใกล้ชิด" },
  { id: "fc3", domain: "brain_death_donor", front: "Lazarus Sign ในผู้ป่วยสมองตายคืออะไร? และ EEG จำเป็นทุกรายหรือไม่?", back: "Lazarus Sign คือการขยับแขนขาจากรีเฟล็กซ์ไขสันหลัง (Spinal Reflex) ไม่ใช่การฟื้นคืนสติ • ส่วน EEG เป็นเพียงทางเลือกเสริม ไม่จำเป็นหากผลตรวจคลินิกและ Apnea Test ชัดเจน" },
  { id: "fc4", domain: "brain_death_donor", front: "ผู้ป่วยสงสัยสมองตายต้องมีคะแนน GCS เท่าไร และอายุ 70 ปีบริจาคอวัยวะได้หรือไม่?", back: "GCS = 3 • อายุ 70 ปีสามารถบริจาคได้ หากการทำงานของอวัยวะยังดีและไม่มีข้อห้ามเด็ดขาด (เช่น HIV, มะเร็งแพร่กระจาย)" },
  { id: "fc5", domain: "procurement_transplant", front: "จำแม่นตัวเลข Cold Chain: หัวใจ / ดวงตา / อุณหภูมิบรรจุไต", back: "• หัวใจ: ระยะเวลาทองไม่เกิน 4 ชั่วโมง\n• ดวงตา: จัดเก็บภายใน 6–8 ชั่วโมง\n• บรรจุขนส่งไต: 2–4°C (น้ำแข็งเกล็ดที่กำลังละลาย ห้ามใช้น้ำแข็งแห้ง -20°C)" },
  { id: "fc6", domain: "procurement_transplant", front: "การตรวจใดสำคัญสูงสุดในการปลูกถ่ายไต และขั้นตอนสุดท้ายในห้องผ่าตัดคืออะไร?", back: "• การปลูกถ่ายไตให้ความสำคัญสูงสุดกับ HLA Typing (ความเข้ากันได้ของเนื้อเยื่อ)\n• ขั้นตอนสุดท้ายที่สำคัญที่สุดคือดูแลตกแต่งร่างผู้บริจาคให้เรียบร้อยสมบูรณ์ที่สุด" },
  { id: "fc7", domain: "family_communication", front: "หลัก Decoupling และตัว S ตัวแรกของ SPIKES Protocol หมายถึงอะไร?", back: "• Decoupling: แยกการแจ้งข่าวภาวะสมองตายออกจากการเจรจาขอรับบริจาคอวัยวะ\n• S (Setting): เตรียมสถานที่ที่เป็นส่วนตัว สงบ และเหมาะสมก่อนพูดคุยกับญาติ" },
  { id: "fc8", domain: "family_communication", front: "หากผู้เสียชีวิตมีบัตรแสดงความจำนง แต่ญาติสายตรงคัดค้านรุนแรง ต้องทำอย่างไร?", back: "ยุติการจัดเก็บอวัยวะเพื่อเคารพจิตใจครอบครัวและป้องกันความขัดแย้งหรือบาดแผลทางอารมณ์ของญาติ" },
  { id: "fc9", domain: "policy_ethics", front: "เกณฑ์อายุแสดงความจำนงบริจาคด้วยตนเองตามกฎหมายไทย และจริยธรรมที่สำคัญที่สุดคือ?", back: "• อายุขั้นต่ำ 18 ปีบริบูรณ์\n• จริยธรรมสูงสุดคือ Autonomy (การเคารพสิทธิ์การตัดสินใจของผู้ป่วยและญาติ)" },
  { id: "fc10", domain: "policy_ethics", front: "ใครเป็นผู้จัดสรรอวัยวะอย่างเป็นธรรม และข้อมูลผู้บริจาค-ผู้รับเปิดเผยได้หรือไม่?", back: "• ระบบคอมพิวเตอร์ของศูนย์รับบริจาคอวัยวะสภากาชาดไทย (ODC)\n• ข้อมูลเป็นความลับตามจริยธรรมวิชาชีพ แจ้งได้เฉพาะภาพรวมว่าอวัยวะได้ช่วยต่อชีวิตผู้ป่วยกี่ราย" }
];

/**
 * 11. ตัวเลือกแบบปุ่มกด (Zero-PII Tags) สำหรับโหมดอุ่นเครื่อง 30 วิก่อนพบญาติจริง (PDPA-Safe)
 */
window.PRE_APPROACH_TAGS = {
  ageGroups: ["เด็ก/วัยรุ่น", "วัยทำงาน (20–45 ปี)", "วัยกลางคน (46–65 ปี)", "ผู้สูงอายุ (>65 ปี)"],
  causes: ["อุบัติเหตุทางศีรษะ (TBI)", "โรคหลอดเลือดสมองแตก/ตีบ", "ภาวะขาดออกซิเจนเฉียบพลัน"],
  familyMoods: ["ช็อก / ยังไม่ยอมรับ", "โศกเศร้าร้องไห้หนัก", "สับสนเรื่องเครื่องช่วยหายใจ", "ความเห็นในครอบครัวต่างกัน", "สงบและเปิดใจรับฟัง"],
  concerns: ["กังวลความเชื่อ/พิธีกรรมศาสนา", "กลัวร่างไม่เรียบร้อย", "กังวลค่าใช้จ่าย/ความโปร่งใส", "ไม่แน่ใจความต้องการของผู้เสียชีวิต"]
};

/**
 * 12. ฐานข้อมูลสังกัดและโรงพยาบาลเครือข่ายทั่วประเทศ (Hospital Mapping)
 */
window.HOSPITAL_MAPPING = {
  "เขตสุขภาพที่ 1": [{ name: "รพ.มหาราชนครเชียงใหม่", prov: "เชียงใหม่" }],
  "เขตสุขภาพที่ 2": [{ name: "รพ.พุทธชินราช", prov: "พิษณุโลก" }],
  "เขตสุขภาพที่ 3": [{ name: "รพ.สวรรค์ประชารักษ์", prov: "นครสวรรค์" }],
  "เขตสุขภาพที่ 4": [{ name: "รพ.สระบุรี", prov: "สระบุรี" }],
  "เขตสุขภาพที่ 5": [{ name: "รพ.ราชบุรี", prov: "ราชบุรี" }],
  "เขตสุขภาพที่ 6": [{ name: "รพ.ชลบุรี", prov: "ชลบุรี" }],
  "เขตสุขภาพที่ 7": [{ name: "รพ.ขอนแก่น", prov: "ขอนแก่น" }],
  "เขตสุขภาพที่ 8": [{ name: "รพ.อุดรธานี", prov: "อุดรธานี" }],
  "เขตสุขภาพที่ 9": [{ name: "รพ.มหาราชนครราชสีมา", prov: "นครราชสีมา" }],
  "เขตสุขภาพที่ 10": [{ name: "รพ.สรรพสิทธิประสงค์", prov: "อุบลราชธานี" }],
  "เขตสุขภาพที่ 11": [{ name: "รพ.สุราษฎร์ธานี", prov: "สุราษฎร์ธานี" }],
  "เขตสุขภาพที่ 12": [{ name: "รพ.หาดใหญ่", prov: "สงขลา" }],
  "กรมการแพทย์": [
    { name: "รพ.ราชวิถี", prov: "กรุงเทพมหานคร" },
    { name: "รพ.เลิดสิน", prov: "กรุงเทพมหานคร" },
    { name: "รพ.นพรัตนราชธานี", prov: "กรุงเทพมหานคร" }
  ],
  "สำนักการแพทย์ กรุงเทพฯ": [
    { name: "รพ.กลาง", prov: "กรุงเทพมหานคร" },
    { name: "รพ.ตากสิน", prov: "กรุงเทพมหานคร" },
    { name: "รพ.เจริญกรุงประชารักษ์", prov: "กรุงเทพมหานคร" }
  ],
  "สำนักอนามัย กรุงเทพฯ": [{ name: "ศูนย์บริการสาธารณสุข", prov: "กรุงเทพมหานคร" }],
  "อื่นๆ": [{ name: "อื่นๆ", prov: "" }]
};

/**
 * 13. รายวิชาและบทเรียนทั้งหมด 20 บท (พร้อมระบุหมวดสมรรถนะสำหรับ AI Roadmap)
 */
window.INITIAL_LESSONS = [
  { id: 1, domain: "policy_ethics", title: "ยุทธศาสตร์และเป้าหมายการพัฒนาระบบบริการสุขภาพ (Service plan)", videoId: "1-sX4LnWRMSjoEQmWee-9GuiQ2XMvkSro", documentUrl: "https://drive.google.com/file/d/1FrJt9TCbOy5oewg_eMrRG8pW4dNzJHS9/view?usp=sharing" },
  { id: 2, domain: "procurement_transplant", title: "แนวทางการประเมินผู้เสียชีวิตเพื่อบริจาคดวงตาและการประสานงานฯ", videoId: "15QOjyhd0hoxpSSO0tZ7Fj4qFaZByiAzT", documentUrl: "https://drive.google.com/file/d/1iJbKaj0VwcsH0AzdyUqrt2jsTjEyhfSg/view?usp=sharing" },
  { id: 3, domain: "policy_ethics", title: "จริยธรรม กฎหมายที่เกี่ยวข้องกับการรับบริจาคอวัยวะ และบทบาทของศูนย์ฯ", videoId: "1L5pFZh85OPDz7lWwJCBKlFDXxkTZSxt_", documentUrl: "https://drive.google.com/file/d/1PtfxrqDZrNpX_NDQBGyCqqfZsPnMRg6e/view?usp=sharing" },
  { id: 4, domain: "policy_ethics", title: "ความสำคัญของการบริจาคและปลูกถ่ายอวัยวะ และบทบาทของบุคลากรฯ", videoId: "14hnZ80UE0KvCmW2oHE2zBTx8uBCg4rIB", documentUrl: "https://drive.google.com/file/d/1HXXlSqONQ3eq7E1Os0C8OtbZcSGbG6a5/view?usp=sharing" },
  { id: 5, domain: "brain_death_donor", title: "การประสานงานเมื่อมีผู้บริจาคอวัยวะสมองตาย และหลักเกณฑ์การจัดสรรอวัยวะ", videoId: "1wkE2CCaRgxlzHmho1ijK49SE028vNqcV", documentUrl: "https://drive.google.com/file/d/1w4xefABcn2GRTQevhpvYuybD2kLozlA6/view?usp=sharing" },
  { id: 6, domain: "procurement_transplant", title: "การเตรียมผู้ป่วยเพื่อเข้ารับการปลูกถ่ายไต และการดูแลหลังปลูกถ่ายไต", videoId: "1pu1O3swHMtTzBXjF3rG_NzfIgjYfgnLm", documentUrl: "https://drive.google.com/file/d/1u_xSPv95dvxXw85QsSx7FYYsKonJbJjj/view?usp=sharing" },
  { id: 7, domain: "policy_ethics", title: "การจัดกิจกรรมส่งเสริมและประชาสัมพันธ์ชีวิตใหม่หลังการปลูกถ่ายอวัยวะ", videoId: "1Sc-2Z_MOD85kvWBduEEWbPiGxw1zeTec", documentUrl: "https://drive.google.com/file/d/1RSPtCHRe38si6P75CCA_85djfwJhUrdE/view?usp=sharing" },
  { id: 8, domain: "policy_ethics", title: "กลุ่มงานการพยาบาลรับบริจาค ปลูกถ่ายอวัยวะและเนื้อเยื่อ สธ.", videoId: "1vc4b07Ooas4cozJK5cnweIl2KeeKvHbk", documentUrl: "https://drive.google.com/file/d/1WUO677apoQJeJKboj0iOZmrTIybd4_hM/view?usp=sharing" },
  { id: 9, domain: "brain_death_donor", title: "Identification of Potential Organ Donors and Assessment", videoId: "1TRLOGabpI66ZUEPybGyrpHTN5dNlYP-f", documentUrl: "https://drive.google.com/file/d/14-GXQS4-KHEUraOt8Ey2cGVkhxN12Ump/view?usp=sharing" },
  { id: 10, domain: "procurement_transplant", title: "Organ Packaging and Transportation สำหรับ รพ Donor", videoId: "1POFnLm_G2BuXWgOojDRpotM5YhBxcCnk", documentUrl: "https://drive.google.com/file/d/1VQk-wMxYRbphaBDkCnOkapwgVdTGShbV/view?usp=sharing" },
  { id: 11, domain: "family_communication", title: "Family Approach", videoId: "1GpfjRpbDnilV22iL52ZyOyUcRs9MUVbu", documentUrl: "https://drive.google.com/file/d/1aRjlUNctesyliehy5KXLW7VwmGPW2R4h/view?usp=sharing" },
  { id: 12, domain: "brain_death_donor", title: "Brain Death Diagnosis", videoId: "136Gl3ocDivGYU764t7t9Qvpn_iTJTfs4", documentUrl: "https://drive.google.com/file/d/1TMceKfI3azgRVRo-GtSDluTzq1lhe8-U/view?usp=sharing" },
  { id: 13, domain: "brain_death_donor", title: "Donor Management", videoId: "1YPyTis-9VzJLPhUvwMp1IC_xs7TLIao0", documentUrl: "https://drive.google.com/file/d/1OeZIm6x3lg_-dFTUPgd9LiombnRrPrQh/view?usp=sharing" },
  { id: 14, domain: "procurement_transplant", title: "Organ Procurement", videoId: "12lOd6KsekmV0PDbdLVr2wYsz-gNnovHK", documentUrl: "https://drive.google.com/file/d/1e-PwnXUCVScRLg5bmXRjOMSC0dIeDv5r/view?usp=sharing" },
  { id: 15, domain: "procurement_transplant", title: "การปฏิบัติตัวหลังผ่าตัด", videoId: "1k2bsL3ZT7dG85c63fC7SPCAQlrkWVzHC", documentUrl: "" },
  { id: 16, domain: "procurement_transplant", title: "ภาพรวมการปลูกถ่ายไต", videoId: "1U5W7QGZm4CQaKIwiwR3mE3FgSeKA3JxS", documentUrl: "" },
  { id: 17, domain: "procurement_transplant", title: "การปฏิบัติตัวหลังปลูกถ่าย (ยา)", videoId: "1v1QN-Qq1zHRtEYyKt1iJ6XrSfSfy7zuM", documentUrl: "" },
  { id: 18, domain: "procurement_transplant", title: "โภชนาการอาหาร", videoId: "1Ekf354d86SJ43JRkqAAEH9D-XB9725Dr", documentUrl: "" },
  { id: 19, domain: "procurement_transplant", title: "ขั้นตอนการเข้ารับบริการคลินิกปลูกถ่ายไต", videoId: "1Om2A00CDS8seta7eiz47-gbXExzzU4RU", documentUrl: "" },
  { id: 20, domain: "procurement_transplant", title: "ขั้นตอนการดูแลผู้ป่วยปลูกถ่ายไตในระยะต่างๆ", videoId: "15qb9D-gNqw-cEJoLozRY2DW1Dc6huB0e", documentUrl: "" }
];

/**
 * 14. คลังสรุป 1 นาที (1-Minute Clinical Cheat Sheets) และคำถาม Micro-Check สำหรับ AI Study Companion
 */
window.LESSON_AI_GUIDES = {
  1: {
    keyPoints: [
      "เป้าหมาย Service Plan: เพิ่มจำนวนผู้บริจาคอวัยวะสมองตายและผู้ได้รับการปลูกถ่ายอวัยวะให้เพียงพอต่อผู้รอคอยกว่า 8,019 ราย",
      "สร้างเครือข่าย รพ.ผู้บริจาค (Donor Hospital) เชื่อมโยงกับศูนย์รับบริจาคอวัยวะสภากาชาดไทย (ODC) ครบทุกเขตสุขภาพ",
      "เน้นการพัฒนาศักยภาพพยาบาลผู้ประสานงาน (TC) และระบบค้นหา Potential Donor เชิงรุก"
    ],
    microCheck: {
      q: "หัวใจสำคัญของ Service Plan สาขาการรับบริจาคและปลูกถ่ายอวัยวะคือข้อใด?",
      options: ["เพิ่มผู้บริจาคสมองตายและผู้ได้รับการปลูกถ่ายให้เพียงพอ", "ลดจำนวนเตียง ICU ทั่วประเทศ"],
      answer: 0,
      explain: "ถูกต้องค่ะ เป้าหมายหลักคือเพิ่มโอกาสการรอดชีวิตของผู้ป่วยรออวัยวะผ่านเครือข่าย Donor Hospital ทั่วประเทศ"
    }
  },
  2: {
    keyPoints: [
      "การจัดเก็บดวงตาควรทำให้แล้วเสร็จภายใน 6–8 ชั่วโมงหลังเสียชีวิต (หากประคบเย็นดูแลอย่างเหมาะสมอาจยืดได้)",
      "ประสานงานผ่านศูนย์ดวงตาสภากาชาดไทย โดยต้องปิดเปลือกตาและประคบเย็นป้องกันกระจกตาแห้ง",
      "ผู้บริจาคที่เสียชีวิตจากหัวใจหยุดเต้นก็สามารถบริจาคดวงตาได้หากไม่มีข้อห้ามทางการแพทย์"
    ],
    microCheck: {
      q: "ระยะเวลาที่เหมาะสมที่สุดในการจัดเก็บดวงตาหลังผู้ป่วยเสียชีวิตคือภายในกี่ชั่วโมง?",
      options: ["ภายใน 6–8 ชั่วโมง", "ภายใน 48 ชั่วโมง"],
      answer: 0,
      explain: "แม่นยำค่ะ ควรจัดเก็บภายใน 6–8 ชั่วโมง เพื่อรักษาคุณภาพของกระจกตาให้สมบูรณ์ที่สุด"
    }
  },
  3: {
    keyPoints: [
      "จริยธรรมสูงสุดคือ Autonomy (เคารพสิทธิ์และการตัดสินใจของผู้ป่วยและญาติ)",
      "เกณฑ์อายุแสดงความจำนงบริจาคด้วยตนเองตามกฎหมายไทยคือ 18 ปีบริบูรณ์",
      "ข้อมูลผู้บริจาคและผู้รับต้องรักษาเป็นความลับตามจริยธรรมวิชาชีพ แจ้งได้เฉพาะภาพรวมการช่วยเหลือ"
    ],
    microCheck: {
      q: "หากผู้เสียชีวิตมีบัตรแสดงความจำนง แต่ญาติสายตรงคัดค้านอย่างรุนแรง แนวปฏิบัติที่เหมาะสมคือ?",
      options: ["ยุติการจัดเก็บเพื่อเคารพจิตใจและหลีกเลี่ยงความขัดแย้งกับครอบครัว", "ดำเนินการผ่าตัดทันทีโดยอ้างบัตรจำนง"],
      answer: 0,
      explain: "ถูกต้องค่ะ ในทางปฏิบัติและจริยธรรมจะยึดความยินยอมของครอบครัวเพื่อไม่ให้เกิดบาดแผลทางจิตใจ"
    }
  },
  4: {
    keyPoints: [
      "ผู้บริจาคสมองตาย 1 รายสามารถช่วยต่อชีวิตผู้ป่วยระยะสุดท้ายได้สูงสุดถึง 8 ชีวิต (หัวใจ ปอด ตับ ไต ตับอ่อน และเนื้อเยื่อ)",
      "ทีมสหสาขาวิชาชีพทำงานร่วมกัน 3 ทีม: ทีมจัดหา/ประสานงาน, ทีมผ่าตัดจัดเก็บ และทีมปลูกถ่าย",
      "พยาบาลผู้ประสานงาน (TC) ไม่ได้ทำหน้าที่ผ่าตัดจัดเก็บ แต่เป็นแกนกลางเชื่อมทีมดูแลและประคับประคองญาติ"
    ],
    microCheck: {
      q: "ข้อใดไม่ใช่หน้าที่ของพยาบาลผู้ประสานงาน (Transplant Coordinator)?",
      options: ["ทำการผ่าตัดจัดเก็บอวัยวะในห้องผ่าตัด", "ประสานงานกับ ODC และสื่อสารกับญาติผู้เสียชีวิต"],
      answer: 0,
      explain: "ใช่เลยค่ะ การผ่าตัดเป็นหน้าที่ของศัลยแพทย์จัดเก็บอวัยวะ (Procurement Surgeon)"
    }
  },
  5: {
    keyPoints: [
      "ศูนย์รับบริจาคอวัยวะสภากาชาดไทย (ODC) ใช้ระบบคอมพิวเตอร์จัดสรรอวัยวะอย่างเป็นธรรมและโปร่งใส",
      "ประสานผลตรวจเลือด หมู่เลือด HLA Typing และการคัดกรองโรคติดเชื้ออย่างรัดกุม",
      "Rule of Rescue ให้ความสำคัญกับผู้ป่วยวิกฤตเร่งด่วนตามเกณฑ์การแพทย์"
    ],
    microCheck: {
      q: "หน่วยงานใดเป็นผู้จัดสรรอวัยวะให้โรงพยาบาลเครือข่ายอย่างเป็นธรรมตามระบบคอมพิวเตอร์?",
      options: ["ศูนย์รับบริจาคอวัยวะสภากาชาดไทย (ODC)", "แพทย์ผู้ผ่าตัดจัดเก็บเป็นผู้เลือกเอง"],
      answer: 0,
      explain: "ถูกต้องค่ะ ODC เป็นศูนย์กลางจัดสรรตามเกณฑ์ความเข้ากันได้และความเร่งด่วนอย่างโปร่งใส"
    }
  },
  6: {
    keyPoints: [
      "การปลูกถ่ายไตช่วยให้คุณภาพชีวิตและอัตรารอดชีวิตดีกว่าการฟอกเลือดระยะยาว",
      "การตรวจความเข้ากันได้ของเนื้อเยื่อ (HLA Typing) และ Crossmatch มีความสำคัญสูงสุดในการปลูกถ่ายไต",
      "หลังปลูกถ่ายต้องรับประทานยากดภูมิคุ้มกันอย่างเคร่งครัดและเฝ้าระวังภาวะสลัดไต"
    ],
    microCheck: {
      q: "การตรวจใดมีความสำคัญสูงสุดก่อนการปลูกถ่ายไตเพื่อลดความเสี่ยงการสลัดอวัยวะ?",
      options: ["HLA Typing และ Crossmatch", "ตรวจคลื่นไฟฟ้าสมอง (EEG)"],
      answer: 0,
      explain: "เยี่ยมมากค่ะ HLA Typing ช่วยยืนยันความเข้ากันได้ของเนื้อเยื่อระหว่างผู้บริจาคและผู้รับ"
    }
  },
  7: {
    keyPoints: [
      "การสื่อสารสาธารณะช่วยลดความเข้าใจผิดเรื่องความเชื่อและสร้างทัศนคติเชิงบวกต่อการบริจาคอวัยวะ",
      "การเชิดชูเกียรติครอบครัวผู้บริจาคช่วยเยียวยาใจญาติและสร้างแรงบันดาลใจในชุมชน",
      "เน้นการสื่อสารเชิงคุณค่า 'การให้ชีวิตใหม่คือทานบารมีอันยิ่งใหญ่'"
    ],
    microCheck: {
      q: "หัวใจของการประชาสัมพันธ์การบริจาคอวัยวะในชุมชนคือข้อใด?",
      options: ["ให้ข้อมูลที่ถูกต้องและเชิดชูคุณค่าของการต่อชีวิตเพื่อนมนุษย์", "เร่งรัดให้ประชาชนลงทะเบียนทุกคนโดยไม่อธิบายรายละเอียด"],
      answer: 0,
      explain: "ถูกต้องค่ะ ความเข้าใจที่ถูกต้องและความสมัครใจคือรากฐานสำคัญของระบบบริจาคอวัยวะ"
    }
  },
  8: {
    keyPoints: [
      "กลุ่มงานการพยาบาลรับบริจาคฯ วางระบบมาตรฐานการคัดกรองผู้ป่วยวิกฤตและการส่งต่อข้อมูลในสังกัด สธ.",
      "พัฒนาสมรรถนะพยาบาล ICU / ER / OR ให้ตรวจจับ Potential Donor ได้เร็วขึ้น",
      "ติดตามตัวชี้วัด Conversion Rate และความพึงพอใจของครอบครัวผู้บริจาค"
    ],
    microCheck: {
      q: "หน่วยใดในโรงพยาบาลที่มีบทบาทสำคัญในการตรวจพบ Potential Donor ตั้งแต่ระยะเริ่มต้น?",
      options: ["ทีม ICU และห้องฉุกเฉิน (ER)", "แผนกเวชระเบียนเท่านั้น"],
      answer: 0,
      explain: "ถูกต้องค่ะ การคัดกรองตั้งแต่ ER และ ICU ช่วยให้รักษาสัญญาณชีพและคุณภาพอวัยวะได้ทันท่วงที"
    }
  },
  9: {
    keyPoints: [
      "Potential Donor มักเกิดจากอุบัติเหตุทางศีรษะ (TBI) หรือหลอดเลือดสมองแตกที่มี GCS = 3",
      "ข้อห้ามเด็ดขาด (Absolute Contraindication): ติดเชื้อ HIV, มะเร็งแพร่กระจาย, ไม่ทราบสาเหตุการเสียชีวิต",
      "อายุมาก (เช่น 70 ปี) หรือความดันโลหิตสูงไม่ใช่ข้อห้ามเด็ดขาด หากการทำงานของอวัยวะยังอยู่ในเกณฑ์ดี"
    ],
    microCheck: {
      q: "ผู้ป่วยสมองตายอายุ 70 ปี ที่การทำงานของอวัยวะยังดีและไม่มีข้อห้าม สามารถบริจาคอวัยวะได้หรือไม่?",
      options: ["ได้ หากประเมินแล้วอวัยวะยังทำงานดีและไม่มีข้อห้าม", "ไม่ได้เด็ดขาดเพราะอายุเกิน 60 ปี"],
      answer: 0,
      explain: "ถูกต้องค่ะ เกณฑ์พิจารณาดูจากคุณภาพการทำงานของอวัยวะแต่ละชนิด ไม่ได้ตัดสิทธิ์จากอายุเพียงอย่างเดียว"
    }
  },
  10: {
    keyPoints: [
      "การบรรจุไตเพื่อขนส่ง (Kidney Packaging) ต้องควบคุมอุณหภูมิที่ 2–4 องศาเซลเซียส (แช่ในน้ำแข็งเกล็ดที่กำลังละลาย)",
      "ห้ามใช้ก้อนน้ำแข็งแห้ง (-20°C) หรือปล่อยให้อวัยวะสัมผัสน้ำแข็งโดยตรงเพราะเนื้อเยื่อจะเสียหาย",
      "บรรจุแบบปลอดเชื้อหลายชั้นพร้อมล้างและแช่ด้วยน้ำยาถนอมอวัยวะ (Preservation Solution) และติดฉลากตรวจสอบชัดเจน"
    ],
    microCheck: {
      q: "อุณหภูมิมาตรฐานในการบรรจุและขนส่งไต (Kidney Packaging) คือช่วงใด?",
      options: ["2–4 องศาเซลเซียส", "-20 องศาเซลเซียส (น้ำแข็งแห้ง)"],
      answer: 0,
      explain: "แม่นยำค่ะ อุณหภูมิ 2–4°C ในน้ำแข็งเกล็ดที่กำลังละลายช่วยถนอมเซลล์ไตโดยไม่ทำให้เนื้อเยื่อแข็งตัวเสียหาย"
    }
  },
  11: {
    keyPoints: [
      "หลัก Setting (SPIKES): เชิญญาติมาพูดคุยในพื้นที่ให้คำปรึกษาที่เป็นส่วนตัว แยกจากห้อง ICU",
      "หลัก Decoupling: แยกการแจ้งข่าวภาวะสมองตายออกจากการพูดคุยเรื่องบริจาคอวัยวะอย่างชัดเจน",
      "หลัก Empathy & Zero Pressure: รับฟังอารมณ์ เว้นความเงียบ 2.5 วินาที ไม่เร่งรัด และให้ความมั่นใจเรื่องการตกแต่งร่างอย่างประณีต"
    ],
    microCheck: {
      q: "หลักการ 'Decoupling' ในบทเรียน Family Approach หมายถึงอะไร?",
      options: ["แยกการแจ้งข่าวภาวะสมองตายออกจากการเจรจาขอรับบริจาคอวัยวะ", "แยกแพทย์ออกจากพยาบาลขณะพูดคุย"],
      answer: 0,
      explain: "ยอดเยี่ยมค่ะ การทำ Decoupling ช่วยให้ญาติซึมซับความจริงได้ก่อนโดยไม่รู้สึกว่าถูกเร่งรัด"
    }
  },
  12: {
    keyPoints: [
      "ผู้ป่วยสงสัยภาวะสมองตายต้องมีคะแนน GCS = 3 และตัดสาเหตุที่แก้ไขได้ออกก่อน (เช่น ยากดประสาท, อุณหภูมิกายต่ำ)",
      "ตรวจยืนยันทางคลินิกอย่างน้อย 2 ครั้ง ห่างกันอย่างน้อย 6 ชั่วโมง (ในผู้ใหญ่) และรับรองโดยแพทย์ 3 ท่านที่ไม่เกี่ยวข้องกับทีมปลูกถ่าย",
      "Apnea Test พิสูจน์ว่าศูนย์ควบคุมการหายใจที่ก้านสมองหยุดทำงานถาวร • Lazarus Sign เป็นเพียงรีเฟล็กซ์ไขสันหลัง • EEG เป็นทางเลือกเสริม"
    ],
    microCheck: {
      q: "การทำ Apnea Test มีวัตถุประสงค์หลักเพื่อพิสูจน์สิ่งใด?",
      options: ["ศูนย์ควบคุมการหายใจที่ก้านสมองสูญเสียการทำงานอย่างถาวร", "ดูว่าผู้ป่วยจะฟื้นคืนสติหรือไม่"],
      answer: 0,
      explain: "ถูกต้องค่ะ Apnea Test เป็นขั้นตอนหัวใจสำคัญในการยืนยันภาวะสมองตายตามเกณฑ์แพทยสภา"
    }
  },
  13: {
    keyPoints: [
      "เมื่อพบ Potential Donor ขั้นแรกต้องรักษาสัญญาณชีพให้คงที่ (Donor Management) เพื่อป้องกันอวัยวะขาดเลือด",
      "ภาวะที่พบบ่อย: ความดันโลหิตต่ำ (Hypotension) และภาวะเบาจืด (Diabetes Insipidus — ปัสสาวะออกมากผิดปกติ)",
      "ยาหลักคุมภาวะเบาจืดคือ Desmopressin (DDAVP) • ใช้ยาปฏิชีวนะป้องกันการติดเชื้อ • ในบางรายอาจใช้ ECMO พยุงอวัยวะรอจัดเก็บ"
    ],
    microCheck: {
      q: "ยาใดนิยมใช้ควบคุมภาวะเบาจืด (Diabetes Insipidus) ในผู้ป่วยสมองตาย?",
      options: ["Desmopressin (DDAVP)", "Epinephrine"],
      answer: 0,
      explain: "แม่นยำค่ะ DDAVP ช่วยควบคุมปริมาณปัสสาวะและสมดุลเกลือแร่ไม่ให้ผู้บริจาคขาดน้ำรุนแรง"
    }
  },
  14: {
    keyPoints: [
      "ระยะเวลาทอง (Cold Ischemic Golden Period): หัวใจไม่เกิน 4 ชั่วโมง ต้องประสานเวลาห้องผ่าตัดและขนส่งอย่างแม่นยำ",
      "หลังนำอวัยวะออกต้องล้างและแช่ด้วยน้ำยาถนอมอวัยวะ (Preservation Solution) ทันทีที่อุณหภูมิต่ำ",
      "ขั้นตอนสุดท้ายที่สำคัญที่สุด: ดูแลตกแต่งร่างผู้บริจาคให้เรียบร้อยสมบูรณ์ที่สุดเพื่อแสดงความเคารพสูงสุดต่อผู้เสียชีวิตและครอบครัว"
    ],
    microCheck: {
      q: "ระยะเวลาทอง (Golden Period) ในการนำหัวใจไปปลูกถ่ายให้ผู้รับคือไม่เกินกี่ชั่วโมง?",
      options: ["ไม่เกิน 4 ชั่วโมง", "ไม่เกิน 24 ชั่วโมง"],
      answer: 0,
      explain: "ถูกต้องค่ะ หัวใจทนภาวะขาดเลือดได้สั้นที่สุด จึงต้องวางแผนขนส่งและผ่าตัดภายใน 4 ชั่วโมง"
    }
  },
  15: {
    keyPoints: [
      "หลังผ่าตัดปลูกถ่ายไตต้องเฝ้าระวังปริมาณปัสสาวะ สัญญาณชีพ แผลผ่าตัด และการติดเชื้ออย่างใกล้ชิด",
      "แยกพื้นที่ดูแลสะอาด ปฏิบัติตามหลักการป้องกันการติดเชื้อเพราะผู้ป่วยได้รับยากดภูมิคุ้มกันขนาดสูง",
      "สังเกตอาการเตือนภาวะสลัดไตเฉียบพลัน: ปัสสาวะออกน้อยลง ปวดตึงบริเวณไตใหม่ ไข้ หรือน้ำหนักขึ้นเร็ว"
    ],
    microCheck: {
      q: "อาการใดต่อไปนี้เป็นสัญญาณเตือนสำคัญที่ต้องรีบแจ้งทีมแพทย์หลังผ่าตัดปลูกถ่ายไต?",
      options: ["มีไข้ ปัสสาวะออกน้อยลง หรือปวดตึงบริเวณแผลปลูกถ่าย", "รับประทานอาหารได้ตามปกติและปัสสาวะใสดี"],
      answer: 0,
      explain: "ถูกต้องค่ะ อาการเหล่านี้อาจบ่งชี้ภาวะติดเชื้อหรือภาวะสลัดไตที่ต้องประเมินทันที"
    }
  },
  16: {
    keyPoints: [
      "การปลูกถ่ายไตมี 2 แหล่งหลัก: จากผู้บริจาคที่มีชีวิต (Living Donor) และผู้บริจาคสมองตาย (Deceased Donor)",
      "ผู้ป่วยที่ได้รับการปลูกถ่ายไตจะมีอิสระในการใช้ชีวิตมากกว่าการฟอกเลือดและลดภาระค่าใช้จ่ายระยะยาว",
      "ต้องเตรียมความพร้อมทั้งร่างกาย จิตใจ และระบบสนับสนุนจากครอบครัวก่อนขึ้นทะเบียนรอรับไต"
    ],
    microCheck: {
      q: "ข้อดีเด่นชัดของการปลูกถ่ายไตเมื่อเทียบกับการฟอกเลือดระยะยาวคืออะไร?",
      options: ["คุณภาพชีวิตดีขึ้น อัตรารอดชีวิตสูง และลดค่าใช้จ่ายระยะยาว", "ไม่ต้องรับประทานยาใดๆ อีกตลอดชีวิต"],
      answer: 0,
      explain: "ถูกต้องค่ะ แม้ต้องกินยากดภูมิต่อเนื่องแต่คุณภาพชีวิตและอัตรารอดชีวิตดีกว่าการฟอกเลือดมาก"
    }
  },
  17: {
    keyPoints: [
      "ยากดภูมิคุ้มกันต้องรับประทานตรงเวลาทุกวัน ห้ามหยุดยาหรือปรับขนาดยาเองเด็ดขาด",
      "หลีกเลี่ยงสมุนไพร อาหารเสริม หรือยาแก้ปวดกลุ่ม NSAIDs ที่อาจตีกับยากดภูมิหรือทำลายไตใหม่",
      "มาตรวจระดับยากดภูมิในเลือด (Drug Level) ตามนัดสม่ำเสมอเพื่อให้ระดับยาอยู่ในช่วงปลอดภัย"
    ],
    microCheck: {
      q: "หลักสำคัญที่สุดในการรับประทานยากดภูมิคุ้มกันหลังปลูกถ่ายไตคือข้อใด?",
      options: ["กินตรงเวลาสม่ำเสมอทุกวัน ห้ามหยุดหรือปรับขนาดยาเอง", "หยุดยาได้ทันทีเมื่อรู้สึกแข็งแรงดี"],
      answer: 0,
      explain: "แม่นยำค่ะ การหยุดยาเองเป็นสาเหตุสำคัญที่ทำให้เกิดภาวะสลัดไตและสูญเสียไตใหม่"
    }
  },
  18: {
    keyPoints: [
      "รับประทานอาหารปรุงสุกใหม่ สะอาด หลีกเลี่ยงของดิบ กึ่งสุกกึ่งดิบ และอาหารหมักดองเพื่อลดเสี่ยงติดเชื้อ",
      "หลีกเลี่ยงผลไม้ที่มีผลต่อระดับยากดภูมิ (เช่น เกรปฟรุต/ส้มโอในบางสูตรยา) และคุมเค็ม หวาน มัน",
      "ดื่มน้ำสะอาดให้เพียงพอตามคำแนะนำแพทย์เพื่อช่วยการทำงานของไตใหม่"
    ],
    microCheck: {
      q: "เหตุใดผู้ป่วยหลังปลูกถ่ายไตจึงต้องหลีกเลี่ยงอาหารสุกๆ ดิบๆ และของหมักดอง?",
      options: ["ภูมิคุ้มกันถูกกดอยู่ จึงเสี่ยงติดเชื้อในทางเดินอาหารรุนแรง", "ทำให้น้ำหนักลดเร็วเกินไป"],
      answer: 0,
      explain: "ถูกต้องค่ะ ความสะอาดและอาหารปรุงสุกใหม่ช่วยป้องกันการติดเชื้อฉวยโอกาสได้ดีที่สุด"
    }
  },
  19: {
    keyPoints: [
      "ขั้นตอนเข้ารับบริการคลินิกปลูกถ่ายไต: ส่งตัวประเมินสิทธิ์ ตรวจคัดกรองสุขภาพ ตรวจเนื้อเยื่อ และขึ้นทะเบียน ODC",
      "เตรียมเอกสารสำคัญ ผลเลือด และประวัติการฟอกเลือดให้ครบถ้วนทุกครั้งที่มาตรวจติดตาม",
      "แจ้งเบอร์โทรศัพท์ที่ติดต่อได้ตลอด 24 ชั่วโมง กรณีมีอวัยวะเข้ากันได้จากศูนย์รับบริจาค"
    ],
    microCheck: {
      q: "สิ่งสำคัญที่ผู้ป่วยรอรับไตต้องอัปเดตกับคลินิกปลูกถ่ายไตเสมอคืออะไร?",
      options: ["เบอร์โทรศัพท์ที่ติดต่อได้ 24 ชม. และผลตรวจเลือดติดตามสม่ำเสมอ", "ไม่ต้องมาตรวจจนกว่าจะถึงวันผ่าตัด"],
      answer: 0,
      explain: "ถูกต้องค่ะ เมื่อมีไตที่เข้ากันได้ ทีมต้องสามารถติดต่อผู้ป่วยได้ทันทีภายในเวลาจำกัด"
    }
  },
  20: {
    keyPoints: [
      "การดูแลระยะแรก (0–3 เดือน): นัดถี่ที่สุดเพื่อปรับระดับยากดภูมิและเฝ้าระวังการติดเชื้อ/สลัดไต",
      "การดูแลระยะกลาง-ยาว: คุมความดันโลหิต เบาหวาน ไขมัน ตรวจคัดกรองมะเร็ง และฉีดวัคซีนที่เหมาะสม (งดวัคซีนเชื้อเป็น)",
      "ส่งเสริมการดูแลตนเองอย่างยั่งยืนเพื่อให้ไตใหม่ทำงานได้ยาวนานที่สุด"
    ],
    microCheck: {
      q: "ผู้ป่วยหลังปลูกถ่ายไตระยะยาวควรระวังเรื่องวัคซีนอย่างไร?",
      options: ["หลีกเลี่ยงวัคซีนชนิดเชื้อเป็น (Live Vaccine) และปรึกษาแพทย์ก่อนฉีด", "ฉีดวัคซีนได้ทุกชนิดโดยไม่ต้องแจ้งแพทย์"],
      answer: 0,
      explain: "ถูกต้องค่ะ ผู้ได้รับยากดภูมิคุ้มกันต้องหลีกเลี่ยงวัคซีนเชื้อเป็นเพื่อป้องกันการติดเชื้อจากวัคซีน"
    }
  }
};

/**
 * 15. คลังข้อสอบมาตรฐาน 40 ข้อ (ตรวจสอบคำสะกดและเฉลยครบทุกข้อแล้ว)
 * รูปแบบ: "คำถาม|ตัวเลือก 0|ตัวเลือก 1|ตัวเลือก 2|ตัวเลือก 3|ดัชนีคำตอบที่ถูก"
 */
window.QUIZ_QUESTIONS_RAW = [
  "เป้าหมายหลักของ Service Plan สาขาการรับบริจาคและปลูกถ่ายอวัยวะคือข้อใด?|ลดค่าใช้จ่ายในการดูแลผู้ป่วยวิกฤต|เพิ่มจำนวนผู้บริจาคอวัยวะสมองตายและผู้ได้รับการปลูกถ่ายอวัยวะให้เพียงพอ|ลดภาระงานของบุคลากรทางการแพทย์ในห้องICU|สร้างศูนย์ปลูกถ่ายอวัยวะในทุกชุมชน|1",
  "การจัดเก็บดวงตา (Eye procurement) ควรดำเนินการให้แล้วเสร็จอย่างช้าที่สุดภายในกี่ชั่วโมงหลังผู้ป่วยเสียชีวิต?|ภายใน 2 ชั่วโมง|ภายใน 24-48 ชั่วโมง|ภายใน 3 วัน|ภายใน 6-8 ชั่วโมง (หากมีการประคบเย็นอาจยืดได้)|3",
  "ประโยชน์สูงสุดของการปลูกถ่ายไตเมื่อเทียบกับการฟอกเลือด (Dialysis) คืออะไร?|ผู้ป่วยไม่ต้องทานยากดภูมิคุ้มกันอีกเลย|แพทย์ทำงานง่ายขึ้นโดยไม่ต้องตรวจติดตามผล|สามารถรับประทานอาหารได้ทุกชนิดโดยไม่มีข้อจำกัด|ผู้ป่วยมีคุณภาพชีวิตที่ดีขึ้น อัตราการรอดชีวิตสูง และลดภาระค่าใช้จ่ายระยะยาว|3",
  "การบรรจุไตเพื่อขนส่ง (Kidney Packaging) ต้องรักษาอุณหภูมิให้อยู่ในช่วงใด?|แช่แข็งในน้ำแข็งแห้ง (-20 องศาเซลเซียส)|อุณหภูมิห้อง (25 องศาเซลเซียส)|2-4 องศาเซลเซียส (แช่ในน้ำแข็งเกล็ดที่กำลังละลาย)|แช่ในน้ำอุ่น (37 องศาเซลเซียส)|2",
  "การทำ Decoupling หมายถึงการแยกเรื่องใดออกจากเรื่องใด?|แยกการทำงานของหัวใจออกจากปอด|แยกหมอออกจากพยาบาล|แยกการแจ้งข่าวสมองตาย ออกจากการเจรจาขอรับบริจาคอวัยวะ|แยกญาติผู้ชายออกจากญาติผู้หญิง|2",
  "การทำ Apnea Test เป็นขั้นตอนสำคัญเพื่อพิสูจน์สิ่งใด?|เพื่อดูว่าหัวใจยังเต้นอยู่หรือไม่|เพื่อพิสูจน์ว่าศูนย์ควบคุมการหายใจที่ก้านสมองสูญเสียการทำงานอย่างถาวร|เพื่อกระตุ้นให้ผู้ป่วยฟื้นคืนสติ|เพื่อดูการทำงานของปอดก่อนบริจาค|1",
  "ข้อใดคือเกณฑ์อายุขั้นต่ำในการแสดงความจำนงบริจาคอวัยวะได้ด้วยตนเองตามกฎหมายไทย?|15 ปีบริบูรณ์|18 ปีบริบูรณ์|20 ปีบริบูรณ์|ไม่มีข้อจำกัดหากได้รับความยินยอมจากผู้ปกครอง|1",
  "อวัยวะใดต่อไปนี้ไม่สามารถปลูกถ่ายได้?|สมอง|หัวใจ|ปอด|ตับอ่อน|0",
  "ข้อใดคือสาเหตุการเสียชีวิตที่พบได้บ่อยที่สุดในกลุ่มผู้บริจาคอวัยวะสมองตาย?|โรคมะเร็งระยะสุดท้าย|อุบัติเหตุทางศีรษะ (Traumatic Brain Injury)|โรคติดเชื้อในกระแสเลือด|โรคหัวใจล้มเหลวเฉียบพลัน|1",
  "ในการเจรจาขอรับบริจาคอวัยวะ หากญาติมีความเชื่อว่า 'บริจาคแล้วชาติหน้าอวัยวะจะไม่ครบ' บุคลากรทางการแพทย์ควรตอบสนองอย่างไร?|อธิบายว่าตามหลักพุทธศาสนา การเสียสละร่างกายเป็นทานบารมีขั้นสูง|เพิกเฉยและเปลี่ยนไปคุยเรื่องอื่น|บอกว่าเป็นความเชื่อที่ผิดและไม่มีเหตุผล|ยุติการเจรจาทันที|0",
  "ระยะเวลาทอง (Golden Period) ในการนำหัวใจที่ได้จากการจัดเก็บไปปลูกถ่ายให้ผู้รับคือเท่าใด?|ไม่เกิน 4 ชั่วโมง|ไม่เกิน 12 ชั่วโมง|ไม่เกิน 24 ชั่วโมง|ไม่เกิน 48 ชั่วโมง|0",
  "ข้อใดไม่ใช่ข้อห้ามเด็ดขาด (Absolute Contraindication) ในการบริจาคอวัยวะ?|ติดเชื้อ HIV|มะเร็งแพร่กระจาย|ความดันโลหิตสูง|ไม่ทราบสาเหตุการเสียชีวิตที่แน่ชัด|2",
  "การประเมินผู้ป่วยสมองตาย ต้องทำการทดสอบทางคลินิก (Clinical Test) อย่างน้อยกี่ครั้ง?|1 ครั้ง|2 ครั้ง ห่างกันอย่างน้อย 6 ชั่วโมง (สำหรับผู้ใหญ่)|3 ครั้ง|ไม่จำเป็นต้องทดสอบซ้ำหากทำ Apnea Test ผ่าน|1",
  "ใครเป็นผู้มีอำนาจลงนามรับรองการตายด้วยภาวะสมองตายตามกฎหมาย?|พยาบาลวิชาชีพที่ดูแลผู้ป่วย|แพทย์ผู้ทำการรักษาและแพทย์ผู้เชี่ยวชาญรวม 3 ท่าน|ญาติสายตรงลำดับแรก|ผู้อำนวยการโรงพยาบาล|1",
  "ศูนย์รับบริจาคอวัยวะสภากาชาดไทย (ODC) มีบทบาทหน้าที่ใด?|ผ่าตัดปลูกถ่ายอวัยวะให้ผู้ป่วยทุกคน|เป็นศูนย์กลางจัดสรรอวัยวะให้โรงพยาบาลเครือข่ายอย่างยุติธรรม|บังคับให้ผู้เสียชีวิตทุกคนต้องบริจาคอวัยวะ|เก็บรักษาอวัยวะไว้ใช้ในยามขาดแคลน|1",
  "เนื้อเยื่อ (Tissue) ชนิดใดที่สามารถเก็บรักษาไว้ได้นานที่สุดหลังการจัดเก็บ?|ดวงตา|ลิ้นหัวใจ (หากผ่านกระบวนการแช่แข็ง)|ตับ|ปอด|1",
  "ข้อใดอธิบายหลักการของ 'The Rule of Rescue' ในบริบทของการปลูกถ่ายอวัยวะได้ดีที่สุด?|การให้ความสำคัญกับการช่วยชีวิตผู้ป่วยที่วิกฤตที่สุดก่อน|การให้ความสำคัญกับผู้ป่วยที่รอคิวนานที่สุด|การให้ความสำคัญกับผู้ที่สามารถจ่ายค่ารักษาได้|การให้ความสำคัญกับผู้ที่มีโอกาสรอดชีวิตระยะยาวสูงสุด|0",
  "ผู้ประสานงานการรับบริจาคอวัยวะ (Transplant Coordinator) ไม่มีหน้าที่ใด?|ดูแลผู้บริจาคอวัยวะสมองตาย|เจรจาขอรับบริจาคกับญาติผู้เสียชีวิต|ทำการผ่าตัดจัดเก็บอวัยวะ|ประสานงานระหว่างโรงพยาบาลผู้บริจาคและผู้รับ|2",
  "การตรวจความเข้ากันได้ของเนื้อเยื่อ (HLA Typing) มีความสำคัญสูงสุดในการปลูกถ่ายอวัยวะใด?|หัวใจ|ตับ|ไต|ปอด|2",
  "เมื่อพบผู้ป่วยเข้าข่ายภาวะสมองตาย (Potential Donor) ขั้นตอนแรกที่ต้องทำคืออะไร?|แจ้งศูนย์รับบริจาคอวัยวะสภากาชาดไทยทันที|รีบแจ้งญาติให้บริจาคอวัยวะ|ประเมินและรักษาสัญญาณชีพ (Donor Management) ให้คงที่|หยุดการให้ยาและสารน้ำทั้งหมดเพื่อรอสมองตายสมบูรณ์|2",
  "ยาตัวใดมักถูกใช้เพื่อควบคุมภาวะเบาจืด (Diabetes Insipidus) ในผู้ป่วยสมองตาย?|Epinephrine|Desmopressin (DDAVP)|Insulin|Dopamine|1",
  "ภาวะใดที่มักเกิดขึ้นและเป็นปัญหาสำคัญในการดูแลผู้ป่วยสมองตาย?|อุณหภูมิร่างกายสูงขึ้น (Hyperthermia)|ความดันโลหิตต่ำ (Hypotension)|ระดับน้ำตาลในเลือดต่ำ (Hypoglycemia)|อัตราการเต้นของหัวใจช้าลง (Bradycardia)|1",
  "การเจรจาขอรับบริจาคอวัยวะด้วยหลัก B.A.L.I. ตัวอักษร 'L' หมายถึงอะไร?|Listen (รับฟังความรู้สึกญาติ)|Legal (การตรวจสอบเอกสารและข้อกฎหมาย)|Love (การแสดงความเห็นอกเห็นใจ)|Leave (การให้เวลาญาติในการตัดสินใจ)|1",
  "ในกรณีที่ผู้เสียชีวิตมีบัตรแสดงความจำนงบริจาคอวัยวะ แต่ญาติคัดค้านอย่างรุนแรง ควรดำเนินการอย่างไร?|ดำเนินการผ่าตัดทันทีเพราะมีเอกสารยืนยัน|ยุติการจัดเก็บอวัยวะเพื่อหลีกเลี่ยงความขัดแย้งและผลกระทบทางจิตใจของญาติ|ฟ้องร้องญาติที่ขัดขวางกระบวนการทางกฎหมาย|แอบทำการผ่าตัดโดยไม่ให้ญาติทราบ|1",
  "ข้อใดคือสัญญาณตอบสนองที่อาจพบได้ในผู้ป่วยสมองตาย ซึ่งเป็นเพียงรีเฟล็กซ์จากไขสันหลัง (Spinal Reflex) และมักทำให้ญาติเข้าใจผิด?|การลืมตาเมื่อเรียกชื่อ|การหายใจเฮือก (Gasping)|การเคลื่อนไหวของแขนขาเมื่อถูกกระตุ้น (Lazarus Sign)|การมีน้ำตาไหล|2",
  "องค์กรใดทำหน้าที่รับบริจาคดวงตาในประเทศไทย?|ศูนย์รับบริจาคอวัยวะสภากาชาดไทย|ศูนย์ดวงตาสภากาชาดไทย|กระทรวงสาธารณสุข|ราชวิทยาลัยจักษุแพทย์แห่งประเทศไทย|1",
  "การบริจาคอวัยวะแบบ Donation after Circulatory Death (DCD) คืออะไร?|การบริจาคอวัยวะขณะที่หัวใจยังเต้นอยู่|การบริจาคอวัยวะหลังจากหัวใจหยุดเต้นอย่างถาวรแล้ว|การบริจาคอวัยวะจากผู้บริจาคที่มีชีวิต|การบริจาคอวัยวะที่เน้นเฉพาะการบริจาคเนื้อเยื่อ|1",
  "การประเมิน Glasgow Coma Scale (GCS) ในผู้ป่วยที่สงสัยภาวะสมองตาย จะต้องมีคะแนนเท่าใด?|GCS = 15|GCS < 8|GCS = 3|GCS = 0|2",
  "ขั้นตอนสุดท้ายของกระบวนการบริจาคอวัยวะคือข้อใด?|การผ่าตัดจัดเก็บอวัยวะ|การส่งมอบอวัยวะให้ผู้รับ|การดูแลตกแต่งศพผู้บริจาคให้เรียบร้อยสมบูรณ์ที่สุด|การส่งจดหมายขอบคุณครอบครัวผู้บริจาค|2",
  "สิ่งสำคัญที่สุดในการดูแลสภาพจิตใจของญาติผู้เสียชีวิต (Bereavement Care) คืออะไร?|การให้เงินช่วยเหลือเยียวยา|การให้ข้อมูลที่ตรงไปตรงมา ชัดเจน และแสดงความเห็นอกเห็นใจ|การโน้มน้าวให้บริจาคอวัยวะให้สำเร็จ|การปล่อยให้ญาติอยู่ตามลำพังโดยไม่รบกวน|1",
  "ยาปฏิชีวนะ (Antibiotics) จะถูกให้ในผู้ป่วยสมองตายเพื่อวัตถุประสงค์ใด?|เพื่อกระตุ้นให้สมองฟื้นตัว|เพื่อป้องกันหรือรักษาการติดเชื้อที่อาจทำลายอวัยวะที่จะบริจาค|เพื่อรักษาสภาพผิวหนังของผู้ป่วย|เพื่อระงับความเจ็บปวด|1",
  "ข้อใดไม่ใช่อวัยวะที่สามารถนำไปบริจาคได้จากผู้ป่วยสมองตาย?|ตับ|ลำไส้เล็ก|กระเพาะอาหาร|ไขกระดูก|3",
  "ผู้ป่วยอายุ 70 ปี มีภาวะสมองตาย สามารถเป็นผู้บริจาคอวัยวะได้หรือไม่?|ไม่ได้ เพราะอายุเกินเกณฑ์|ได้ หากการทำงานของอวัยวะที่จะบริจาคยังอยู่ในเกณฑ์ดีและไม่มีข้อห้าม|ได้เฉพาะดวงตาเท่านั้น|ได้เฉพาะบริจาคเพื่อการศึกษา (เป็นอาจารย์ใหญ่)|1",
  "การแจ้งข่าวร้าย (Breaking Bad News) ตามหลัก SPIKES Protocol ตัวอักษร 'S' ตัวแรกหมายถึงอะไร?|Setting (การเตรียมสถานที่และความพร้อม)|Strategy (การวางแผนการพูดคุย)|Sorrow (การแสดงความเสียใจ)|Support (การให้ความช่วยเหลือ)|0",
  "การตรวจคลื่นไฟฟ้าสมอง (EEG) เพื่อยืนยันภาวะสมองตาย ในประเทศไทยมีความจำเป็นหรือไม่?|จำเป็นต้องทำในทุกราย|เป็นทางเลือกเสริม ไม่จำเป็นต้องทำหากผลตรวจทางคลินิกและ Apnea Test ชัดเจน|ทำเฉพาะในผู้ป่วยเด็กเท่านั้น|ทำเฉพาะในผู้ป่วยที่ได้รับยากดประสาท|1",
  "หลังจากอวัยวะถูกนำออกจากร่างกายผู้บริจาค กระบวนการที่ต้องทำทันทีคืออะไร?|การนำไปปลูกถ่ายให้ผู้รับทันทีโดยไม่ต้องล้าง|การทำความสะอาดด้วยน้ำเปล่า|การล้างและแช่ด้วยน้ำยาถนอมอวัยวะ (Preservation Solution) ที่อุณหภูมิต่ำ|การนำไปแช่แข็งในช่องฟรีซ|2",
  "ใครมีสิทธิ์ในการตัดสินใจสูงสุดเกี่ยวกับการจัดสรรอวัยวะให้ผู้ป่วยที่รอคอย?|แพทย์ผู้ทำการผ่าตัดจัดเก็บ|ผู้อำนวยการศูนย์รับบริจาคอวัยวะ|ระบบคอมพิวเตอร์ที่ใช้เกณฑ์จัดสรรอย่างเป็นธรรมของ ODC|ญาติผู้บริจาคอวัยวะ|2",
  "หากญาติสอบถามว่า 'จะทราบได้อย่างไรว่าอวัยวะถูกนำไปให้ใคร' คำตอบที่เหมาะสมที่สุดคือข้อใด?|จะแจ้งชื่อและที่อยู่ของผู้รับให้ทราบอย่างละเอียด|ข้อมูลผู้บริจาคและผู้รับเป็นความลับตามจริยธรรมทางการแพทย์ แต่จะแจ้งภาพรวมให้ทราบว่านำไปช่วยใครได้บ้าง|ให้ญาติไปสืบหาข้อมูลเอาเอง|จะจัดให้ผู้บริจาคและผู้รับได้พบกันในอนาคต|1",
  "การใช้เครื่องพยุงการทำงานของหัวใจและปอด (ECMO) ในผู้ป่วยสมองตาย มีประโยชน์อย่างไร?|เพื่อรักษาผู้ป่วยให้หายจากภาวะสมองตาย|เพื่อช่วยรักษาสภาพอวัยวะ (เช่น หัวใจ ปอด ตับ ไต) ให้มีเลือดไปเลี้ยงเพียงพอรอการจัดเก็บ|เพื่อให้ญาติรู้สึกว่าแพทย์ยังทำการรักษาอยู่|เพื่อใช้แทนการทำ Apnea test|1",
  "จริยธรรมที่สำคัญที่สุดในกระบวนการบริจาคอวัยวะคืออะไร?|Autonomy (การเคารพสิทธิ์การตัดสินใจของผู้ป่วย/ญาติ)|Beneficence (การทำประโยชน์สูงสุด)|Non-maleficence (การไม่ทำอันตราย)|Justice (ความยุติธรรมในการจัดสรรอวัยวะ)|0"
];

/**
 * 16. พิกัดแผนที่ 13 เขตสุขภาพ (สำหรับ executive.html)
 */
window.BASE_REGIONS = [
  { id: "R1", name: "เขตสุขภาพที่ 1", desc: "เชียงใหม่และภาคเหนือตอนบน", x: 28, y: 15 },
  { id: "R2", name: "เขตสุขภาพที่ 2", desc: "พิษณุโลกและภาคเหนือตอนล่าง", x: 34, y: 32 },
  { id: "R3", name: "เขตสุขภาพที่ 3", desc: "นครสวรรค์และภาคกลางตอนบน", x: 38, y: 44 },
  { id: "R4", name: "เขตสุขภาพที่ 4", desc: "สระบุรีและภาคกลางตอนบน", x: 44, y: 50 },
  { id: "R5", name: "เขตสุขภาพที่ 5", desc: "ราชบุรีและภาคตะวันตก", x: 32, y: 58 },
  { id: "R6", name: "เขตสุขภาพที่ 6", desc: "ชลบุรีและภาคตะวันออก", x: 58, y: 60 },
  { id: "R7", name: "เขตสุขภาพที่ 7", desc: "ขอนแก่นและอีสานตอนกลาง", x: 62, y: 38 },
  { id: "R8", name: "เขตสุขภาพที่ 8", desc: "อุดรธานีและอีสานตอนบน", x: 74, y: 26 },
  { id: "R9", name: "เขตสุขภาพที่ 9", desc: "นครราชสีมาและอีสานตอนล่าง", x: 62, y: 48 },
  { id: "R10", name: "เขตสุขภาพที่ 10", desc: "อุบลราชธานีและอีสานตอนล่าง", x: 82, y: 48 },
  { id: "R11", name: "เขตสุขภาพที่ 11", desc: "สุราษฎร์ธานีและภาคใต้ตอนบน", x: 28, y: 78 },
  { id: "R12", name: "เขตสุขภาพที่ 12", desc: "สงขลาและภาคใต้ตอนล่าง", x: 38, y: 92 },
  { id: "BKK", name: "กรุงเทพมหานคร", desc: "ศูนย์กลางการแพทย์และสาธารณสุข", x: 48, y: 56 }
];

/**
 * 17. ต้นแบบรายงานวิเคราะห์เชิงนโยบายสำหรับผู้บริหาร (rjcloud.organ)
 */
window.AI_INSIGHT_TEXT = `📊 rjcloud.organ — AI Policy Intelligence Report:

[1] มิติบุคลากร (Workforce Status):
• บุคลากรในระบบทั้งหมด {{USERS}} ราย | สอบผ่านรับประกาศฯ แล้ว {{PASSED}} ราย
• คะแนนความพึงพอใจเฉลี่ย (CSAT): {{CSAT}} / 5.0

[2] มิติความเหลื่อมล้ำเชิงพื้นที่ (Geo-Equity):
• เขตสุขภาพนำร่องสูงสุด: {{MAX_REG_NAME}} ({{MAX_REG_USERS}} ราย)
• พื้นที่ควรเร่งเสริมศักยภาพ: {{MIN_REG_NAME}} ({{MIN_REG_USERS}} ราย)

[3] มิติวิกฤตระดับชาติ (National Crisis Benchmark):
• ประเทศไทยมีผู้ป่วยรออวัยวะสะสมกว่า 8,019 ราย
• ห้องฝึกจำลอง 3 มิติ (AI Skill Lab) และผู้ช่วย AI ช่วยยกระดับทักษะการสื่อสารกับญาติและความแม่นยำทางคลินิกของทีมประสานงานได้ทั่วทั้ง 13 เขตสุขภาพ`;

window.POLICY_SPEECH = `สวัสดีค่ะท่านผู้บริหาร จากการสังเคราะห์ข้อมูลล่าสุดของระบบ อาร์เจคลาวด์ดอทออร์แกน พบว่าขณะนี้มีบุคลากรในระบบทั้งหมด {{USERS}} ท่าน สอบผ่านรับประกาศนียบัตรแล้ว {{PASSED}} ท่าน โดยมีคะแนนความพึงพอใจเฉลี่ยอยู่ที่ {{CSAT}} เต็ม 5 ค่ะ ด้านเชิงพื้นที่พบว่า {{MAX_REG_NAME}} มีความตื่นตัวสูงสุด อย่างไรก็ตาม สถานการณ์ผู้ป่วยรออวัยวะระดับชาติยังมีมากกว่าแปดพันราย จึงขอเสนอให้ขยายผลการฝึกอบรมและห้องจำลองสื่อสารสามมิติให้ครอบคลุมทุกเขตสุขภาพค่ะ`;

/**
 * 18. ฐานความรู้วิชาชีพทางการแพทย์ (Clinical Knowledge Base สำหรับ AI Study Companion & AI Skill Lab)
 */
window.CLINICAL_KNOWLEDGE_BASE = `ทีมบุคลากรทางการแพทย์ (ทีมสหสาขาวิชาชีพ) ในกระบวนการบริจาคและปลูกถ่ายอวัยวะ แบ่งออกเป็น 3 ทีมหลัก ที่ทำงานสอดประสานกันตลอด 24 ชั่วโมง เพื่อให้การส่งต่ออวัยวะสำเร็จภายในเวลาที่จำกัด

1. ทีมจัดหาและประสานงาน (Donor & Coordination Team)
พยาบาลผู้ประสานงานการรับบริจาค (Organ Donation Coordinator): หรือเรียกว่า TC
- ค้นหาผู้ป่วย: คัดกรองและประเมินผู้ป่วยที่มีเกณฑ์ภาวะสมองตายในตึกผู้ป่วยวิกฤต
- สื่อสารและให้ข้อมูลญาติ: เชิญญาติมายังพื้นที่ให้คำปรึกษาที่เงียบสงบและเป็นส่วนตัว (แยกจากห้อง ICU) เพื่อประคับประคองจิตใจ ให้ข้อมูลอย่างตรงไปตรงมา และเปิดโอกาสให้ครอบครัวตัดสินใจโดยไม่กดดัน
- ประสานงานระบบ: แจ้งข้อมูลผู้บริจาคไปยัง ศูนย์รับบริจาคอวัยวะสภากาชาดไทย เพื่อจับคู่อวัยวะกับผู้รับอย่างเป็นธรรมและโปร่งใส ไม่มีค่าใช้จ่ายกับครอบครัวผู้บริจาค
- เก็บตัวอย่าง: เจาะเลือด ตรวจสอบเนื้อเยื่อ และตรวจหาเชื้อติดเชื้อต่าง ๆ
แพทย์ผู้ประเมินภาวะสมองตาย (Brain Death Diagnosis Physicians):
- ตรวจวินิจฉัย: แพทย์ผู้เชี่ยวชาญร่วมตรวจร่างกายตามเกณฑ์กฎหมายเพื่อยืนยันภาวะสมองตาย (ไม่เกี่ยวข้องกับทีมปลูกถ่าย)
- เซ็นใบรับรอง: ออกเอกสารยืนยันการเสียชีวิตของผู้บริจาคอย่างถูกต้องทางกฎหมาย
ทีมวิกฤตบำบัด (ICU Team - แพทย์และพยาบาล):
- รักษาสัญญาณชีพ: ควบคุมความดันโลหิต ออกซิเจน และสารน้ำให้คงที่เพื่อไม่ให้อวัยวะเสียหาย (คุมเบาจืดด้วย DDAVP)

2. ทีมผ่าตัดนำอวัยวะออก (Procurement Team)
ศัลยแพทย์จัดเก็บอวัยวะ (Procurement Surgeon) และพยาบาลห้องผ่าตัด (OR Nurse):
- ผ่าตัดจัดเก็บอวัยวะอย่างประณีต ดูแลตกแต่งร่างผู้เสียชีวิตให้เรียบร้อยสมบูรณ์ที่สุดเพื่อแสดงความเคารพสูงสุด
- ล้างและแช่ด้วยน้ำยาถนอมอวัยวะ (Preservation Solution) บรรจุในภาชนะควบคุมอุณหภูมิความเย็นปลอดเชื้อ (ไต 2-4°C, หัวใจไม่เกิน 4 ชม., ดวงตา 6-8 ชม.)

3. ทีมปลูกถ่ายอวัยวะ (Transplant Team)
- ศัลยแพทย์ปลูกถ่าย, อายุรแพทย์เฉพาะทาง, วิสัญญีแพทย์, พยาบาลประสานงานการปลูกถ่าย, เภสัชกรคลินิก, นักโภชนาการ และนักสังคมสงเคราะห์ ร่วมดูแลผู้รับอวัยวะต่อเนื่องระยะยาว

หลักการสื่อสารและให้ข้อมูลญาติผู้เสียชีวิต:
1. การเตรียมสถานที่และบทบาท (Setting & Role): พูดคุยในพื้นที่ให้คำปรึกษาที่เป็นส่วนตัว แยกจากห้อง ICU และแนะนำชื่อ-บทบาทอย่างสุภาพชัดเจน
2. การรับรู้อารมณ์ร่วม (Emotional Empathy): ยอมรับและสะท้อนความเสียใจ ความช็อก หรือความสับสนของญาติก่อนให้ข้อมูลทางการแพทย์ และใช้จังหวะหยุดเงียบเพื่อเยียวยา (Therapeutic Silence 2.5 วินาที)
3. การแยกข่าวร้ายออกจากคำขอ (Decoupling) & เช็กความเข้าใจ (Perception Check): อธิบายความแตกต่างระหว่างเครื่องช่วยหายใจกับภาวะสมองตายถาวรให้ชัดเจนก่อนพูดถึงทางเลือกการบริจาค
4. การไม่เร่งรัดและให้ความมั่นใจเรื่องเกียรติของร่าง (Zero Pressure & Dignity): ให้เวลาครอบครัวปรึกษากันอย่างเต็มที่ เคารพความเชื่อ-ศาสนา และรับรองการดูแลตกแต่งร่างอย่างประณีตที่สุด`;
