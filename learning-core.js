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
  // 1. CONFIGURATION & BUILT-IN FALLBACK DEFAULTS
  // ============================================================================
  const BUILTIN_CONFIG = {
    appName: 'rjcloud.organ',
    edition: '2027 Clinical Edition',
    contactEmail: 'rjcloud.organ@gmail.com',
    appId: 'rjcloud-organ-2027',
    heroBannerUrl:
      'https://res.cloudinary.com/djwclucoz/image/upload/v1795227615/%E0%B8%94%E0%B8%B5%E0%B9%84%E0%B8%8B%E0%B8%99%E0%B9%8C%E0%B8%97%E0%B8%B5%E0%B9%88%E0%B8%A2%E0%B8%B1%E0%B8%87%E0%B9%84%E0%B8%A1%E0%B9%88%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%95%E0%B8%B1%E0%B9%89%E0%B8%87%E0%B8%8A%E0%B8%B7%E0%B9%88%E0%B8%AD_geidhl.png',
    learningRules: {
      allowedUserTypes: ['เรียนใหม่', 'เรียนต่อเนื่อง'],
      minStudyPercent: 80,
      minPosttestPercent: 80
    },
    theme: {
      defaultMode: 'dark',
      storageKey: 'rjcloud_theme'
    },
    firebaseConfig: {
      apiKey: 'AIzaSyCpvK0FCVVk9dt0ylHn_VzUStl7540UsbY',
      authDomain: 'rj-cloud-organ.firebaseapp.com',
      projectId: 'rj-cloud-organ',
      storageBucket: 'rj-cloud-organ.firebasestorage.app',
      messagingSenderId: '1030088973707',
      appId: '1:1030088973707:web:8104bb1d90ac6a58f8e38e',
      measurementId: 'G-X5YLDTC6V4'
    },
    appsScriptUrl:
      'https://script.google.com/macros/s/AKfycbwuN8MeZhhhomEhpkfXtpoTP341cugDqw1DbQPK_6NSHun2pGZCE0Kfc3eH4YYJ6aWQIg/exec'
  };

  /**
   * รวมค่าตั้งต้นจาก data.js เข้ากับค่าสำรองภายในระบบอย่างปลอดภัย
   */
  function getResolvedConfig() {
    const ext = global.RJCLOUD_CONFIG || {};
    return {
      ...BUILTIN_CONFIG,
      ...ext,
      learningRules: {
        ...BUILTIN_CONFIG.learningRules,
        ...(ext.learningRules || {})
      },
      theme: {
        ...BUILTIN_CONFIG.theme,
        ...(ext.theme || {})
      },
      firebaseConfig:
        ext.firebaseConfig && ext.firebaseConfig.apiKey
          ? ext.firebaseConfig
          : BUILTIN_CONFIG.firebaseConfig,
      appsScriptUrl: ext.appsScriptUrl || BUILTIN_CONFIG.appsScriptUrl
    };
  }

  const DEFAULT_CERT_TEMPLATE = global.DEFAULT_CERT_TEMPLATE || {
    certPrefix: 'RJC-2027',
    orgTitleTH: 'ศูนย์ความเป็นเลิศทางการแพทย์ด้านการรับบริจาคและปลูกถ่ายอวัยวะ',
    orgTitleEN: 'rjcloud.organ • Clinical Organ Donation & Transplantation Network',
    courseTitleTH: 'หลักสูตรการพยาบาลและการประสานงานการรับบริจาคและปลูกถ่ายอวัยวะ',
    courseTitleEN: 'Organ Donation & Transplantation Clinical Coordination Program',
    subtitleTH: 'ขอมอบประกาศนียบัตรฉบับนี้เพื่อแสดงว่า',
    completionTextTH: 'ได้ผ่านการอบรมและประเมินผลตามเกณฑ์มาตรฐานหลักสูตรประจำปี 2027',
    signerName: 'ผู้อำนวยการศูนย์ความเป็นเลิศทางการแพทย์',
    signerPosition: 'ศูนย์ความเป็นเลิศทางการแพทย์ด้านการรับบริจาคและปลูกถ่ายอวัยวะ',
    hoursText: 'ระยะเวลาการเรียนรู้ตามเกณฑ์มาตรฐานวิชาชีพ',
    logoUrl: '',
    signatureUrl: ''
  };

  const DEFAULT_CNEU_CONFIG = {
    logoUrl: '',
    orgName: 'ศูนย์ความเป็นเลิศทางการแพทย์ด้านการรับบริจาคและปลูกถ่ายอวัยวะ โรงพยาบาลราชวิถี',
    courseName: 'หลักสูตรการพยาบาลและการประสานงานการรับบริจาคและปลูกถ่ายอวัยวะ (rjcloud.organ)',
    activityCode: 'CNEU-2027-0148',
    batchLabel: 'รุ่นที่ 1 ประจำปีงบประมาณ 2570',
    cneuCredits: '8.0',
    dateRange: '1 – 31 มกราคม 2570',
    criteriaText: 'ยืนยันตัวตน OTP + เรียน ≥ 80% + AI Skill Lab + Post-test ≥ 80%',
    coordinatorName: 'พว.ผู้ประสานงานโครงการ (ศูนย์รับบริจาคอวัยวะ)',
    coordinatorContact: 'rjcloud.organ@gmail.com',
    reporterName: 'พว.ผู้ประสานงานโครงการ (ศูนย์รับบริจาคอวัยวะ)',
    reporterPosition: 'ผู้ประสานงานโครงการ',
    approverName: 'ผู้อำนวยการศูนย์ความเป็นเลิศทางการแพทย์',
    approverPosition: 'ศูนย์ความเป็นเลิศทางการแพทย์ด้านการรับบริจาคและปลูกถ่ายอวัยวะ'
  };

  const CLINICAL_DOMAINS = global.CLINICAL_DOMAINS || {
    policy_ethics: {
      id: 'policy_ethics',
      nameTH: 'นโยบาย กฎหมาย และจริยธรรมวิชาชีพ',
      shortName: 'กฎหมาย & จริยธรรม',
      color: '#38bdf8',
      lessonIds: [1, 3, 4, 7, 8],
      remediationGuide:
        'ทบทวนเป้าหมาย Service Plan, เกณฑ์อายุ 18 ปี, บทบาท ODC สภากาชาดไทย และหลักจริยธรรม Autonomy'
    },
    brain_death_donor: {
      id: 'brain_death_donor',
      nameTH: 'การวินิจฉัยภาวะสมองตายและการดูแลผู้บริจาค',
      shortName: 'สมองตาย & Donor',
      color: '#34d399',
      lessonIds: [5, 9, 12, 13],
      remediationGuide:
        'ทบทวน GCS=3, การตรวจคลินิก 2 ครั้งห่างกัน ≥ 6 ชม. โดยแพทย์ 3 ท่าน, Apnea Test, Lazarus Sign และ DDAVP คุมเบาจืด'
    },
    procurement_transplant: {
      id: 'procurement_transplant',
      nameTH: 'การจัดเก็บ ขนส่ง และดูแลผู้ป่วยปลูกถ่ายอวัยวะ',
      shortName: 'จัดเก็บ & ปลูกถ่าย',
      color: '#a78bfa',
      lessonIds: [2, 6, 10, 14, 15, 16, 17, 18, 19, 20],
      remediationGuide:
        'ทบทวนระยะเวลาทองหัวใจ ≤ 4 ชม., ดวงตา 6–8 ชม., บรรจุไต 2–4°C, HLA Typing และการตกแต่งร่างให้เรียบร้อยที่สุด'
    },
    family_communication: {
      id: 'family_communication',
      nameTH: 'การสื่อสารและให้ข้อมูลญาติผู้เสียชีวิต',
      shortName: 'สื่อสารกับญาติ',
      color: '#fbbf24',
      lessonIds: [11],
      remediationGuide:
        'ทบทวนหลัก Decoupling, SPIKES (S = Setting พื้นที่ส่วนตัว), B.A.L.I., การตอบคำถามความเชื่อ และ Bereavement Care'
    }
  };

  const HOSPITAL_MAPPING = global.HOSPITAL_MAPPING || {
    'กรมการแพทย์': [{ name: 'รพ.ราชวิถี', prov: 'กรุงเทพมหานคร' }],
    'เขตสุขภาพที่ 1': [{ name: 'รพ.มหาราชนครเชียงใหม่', prov: 'เชียงใหม่' }],
    'อื่นๆ': [{ name: 'อื่นๆ', prov: '' }]
  };

  const FALLBACK_LESSONS = [
    {
      id: 1,
      domain: 'policy_ethics',
      title: 'ยุทธศาสตร์และเป้าหมายการพัฒนาระบบบริการสุขภาพ (Service plan)',
      videoId: '1-sX4LnWRMSjoEQmWee-9GuiQ2XMvkSro',
      documentUrl: ''
    }
  ];

  const FALLBACK_QUIZ_RAW = [
    'เป้าหมายหลักของ Service Plan สาขาการรับบริจาคและปลูกถ่ายอวัยวะคือข้อใด?|ลดค่าใช้จ่ายในการดูแลผู้ป่วยวิกฤต|เพิ่มจำนวนผู้บริจาคอวัยวะสมองตายและผู้ได้รับการปลูกถ่ายอวัยวะให้เพียงพอ|ลดภาระงานของบุคลากรทางการแพทย์ในห้อง ICU|สร้างศูนย์ปลูกถ่ายอวัยวะในทุกชุมชน|1',
    'การบรรจุไตเพื่อขนส่ง (Kidney Packaging) ต้องรักษาอุณหภูมิให้อยู่ในช่วงใด?|แช่แข็งในน้ำแข็งแห้ง (-20 องศาเซลเซียส)|อุณหภูมิห้อง (25 องศาเซลเซียส)|2-4 องศาเซลเซียส (แช่ในน้ำแข็งเกล็ดที่กำลังละลาย)|แช่ในน้ำอุ่น (37 องศาเซลเซียส)|2',
    'การทำ Decoupling หมายถึงการแยกเรื่องใดออกจากเรื่องใด?|แยกการทำงานของหัวใจออกจากปอด|แยกหมอออกจากพยาบาล|แยกการแจ้งข่าวสมองตาย ออกจากการเจรจาขอรับบริจาคอวัยวะ|แยกญาติผู้ชายออกจากญาติผู้หญิง|2',
    'ยาตัวใดมักถูกใช้เพื่อควบคุมภาวะเบาจืด (Diabetes Insipidus) ในผู้ป่วยสมองตาย?|Epinephrine|Desmopressin (DDAVP)|Insulin|Dopamine|1'
  ];

  const ROLE_ADAPTIVE_PROFILES = global.ROLE_ADAPTIVE_PROFILES || {
    donor_team: {
      id: 'donor_team',
      badgeTH: 'มุมมองทีมรับบริจาค / TC',
      focusSummary:
        'เน้นการประสานงาน ODC, หลักสื่อสาร Decoupling & SPIKES, กฎหมาย-จริยธรรม และการดูแลครอบครัวผู้บริจาค',
      aiPromptAddon:
        'ผู้เรียนปฏิบัติงานด้านรับบริจาค/ปลูกถ่ายอวัยวะ (TC) โดยตรง ให้เน้นมุมมองการประสานงานทีม การสื่อสารกับครอบครัว และความถูกต้องตามเกณฑ์ ODC'
    },
    icu_er_or: {
      id: 'icu_er_or',
      badgeTH: 'มุมมอง ICU / ER / OR',
      focusSummary:
        'เน้นคัดกรอง Potential Donor (GCS=3), รักษาสัญญาณชีพ (DDAVP), Cold Chain 2–4°C และการตกแต่งร่างใน OR',
      aiPromptAddon:
        'ผู้เรียนปฏิบัติงานหอผู้ป่วยวิกฤต (ICU) ห้องฉุกเฉิน (ER) หรือห้องผ่าตัด (OR) ให้เน้นประเด็นหน้างานคลินิก สัญญาณชีพ ภาวะเบาจืด และมาตรฐานจัดเก็บ/ขนส่ง'
    },
    general: {
      id: 'general',
      badgeTH: 'มุมมองผู้สนใจศึกษาทั่วไป',
      focusSummary:
        'อธิบายศัพท์การแพทย์และเกณฑ์ทางคลินิกด้วยภาษาเข้าใจง่าย พร้อมเชื่อมโยงคุณค่าการต่อชีวิตเพื่อนมนุษย์',
      aiPromptAddon:
        'ผู้เรียนไม่ได้ปฏิบัติงานด้านนี้โดยตรง ให้เริ่มต้นอธิบายศัพท์การแพทย์อย่างเข้าใจง่าย กระชับ เป็นมิตร ก่อนเชื่อมโยงสู่มาตรฐานวิชาชีพ'
    }
  };

  const CLINICAL_CASE_SIMULATIONS =
    Array.isArray(global.CLINICAL_CASE_SIMULATIONS) && global.CLINICAL_CASE_SIMULATIONS.length > 0
      ? global.CLINICAL_CASE_SIMULATIONS
      : [
          {
            id: 'case_donor_di',
            domain: 'brain_death_donor',
            badge: 'DONOR MANAGEMENT • ICU',
            title: 'เคสที่ 1: ดูแลผู้บริจาคสมองตายภาวะความดันตกและเบาจืด',
            patientSummary:
              'ชายอายุ 34 ปี อุบัติเหตุทางศีรษะ (TBI) คะแนน GCS = 3 แพทย์ประเมินเข้าข่าย Potential Donor',
            steps: [
              {
                vitals: { bp: '74/44 mmHg', hr: '118 /min', uo: '680 mL/hr', na: '154 mEq/L' },
                situation:
                  'ขณะดูแลใน ICU ความดันโลหิตลดลงเหลือ 74/44 mmHg และปัสสาวะออกมากผิดปกติ 680 mL/hr คุณจะจัดการขั้นตอนแรกอย่างไร?',
                options: [
                  {
                    label: 'รีบแจ้งศูนย์ ODC และหยุดสารน้ำทั้งหมดทันทีเพื่อรอดูอาการ',
                    correct: false,
                    outcome:
                      'ความดันตกลงอีก! หลัก Donor Management ต้องรักษาสัญญาณชีพให้คงที่ก่อนเสมอค่ะ',
                    nextVitals: { bp: '60/38 mmHg', hr: '132 /min', uo: '720 mL/hr', na: '158 mEq/L' }
                  },
                  {
                    label: 'รายงานแพทย์เพื่อพยุงความดันโลหิต (Fluid/Vasopressor) และประเมินภาวะเบาจืด (DI)',
                    correct: true,
                    outcome:
                      'ยอดเยี่ยมค่ะ! การพยุงความดันและตรวจจับภาวะเบาจืดตั้งแต่ต้นช่วยรักษาคุณภาพอวัยวะได้ทันท่วงที',
                    nextVitals: { bp: '102/64 mmHg', hr: '96 /min', uo: '520 mL/hr', na: '151 mEq/L' }
                  }
                ]
              },
              {
                vitals: { bp: '102/64 mmHg', hr: '96 /min', uo: '520 mL/hr', na: '151 mEq/L' },
                situation:
                  'ปัสสาวะยังคงออก > 500 mL/hr และค่าโซเดียมสูง ยาหลักที่นิยมใช้ควบคุมภาวะเบาจืดในผู้ป่วยสมองตายคือข้อใด?',
                options: [
                  {
                    label: 'Desmopressin (DDAVP) ควบคู่การติดตามปริมาณปัสสาวะและเกลือแร่ใกล้ชิด',
                    correct: true,
                    outcome:
                      'แม่นยำมากค่ะ! DDAVP ช่วยควบคุมภาวะเบาจืด ทำให้ปัสสาวะกลับสู่เกณฑ์ปกติและคงคุณภาพอวัยวะได้ดีเยี่ยม',
                    nextVitals: { bp: '112/70 mmHg', hr: '84 /min', uo: '120 mL/hr', na: '142 mEq/L' }
                  },
                  {
                    label: 'ให้ยาขับปัสสาวะ (Furosemide) เพื่อลดบวมสมองเพิ่มเติม',
                    correct: false,
                    outcome: 'ไม่เหมาะสมค่ะ จะยิ่งทำให้ผู้ป่วยสูญเสียน้ำรุนแรงและความดันตกมากขึ้นค่ะ',
                    nextVitals: { bp: '82/50 mmHg', hr: '124 /min', uo: '810 mL/hr', na: '160 mEq/L' }
                  }
                ]
              }
            ]
          }
        ];

  const SPACED_FLASHCARDS =
    Array.isArray(global.SPACED_FLASHCARDS) && global.SPACED_FLASHCARDS.length > 0
      ? global.SPACED_FLASHCARDS
      : [
          {
            id: 'fc1',
            domain: 'brain_death_donor',
            front: 'เกณฑ์ตรวจยืนยันภาวะสมองตายในผู้ใหญ่ต้องตรวจกี่ครั้ง ห่างกันกี่ชั่วโมง และแพทย์กี่ท่าน?',
            back: 'ตรวจทางคลินิกอย่างน้อย 2 ครั้ง ห่างกันอย่างน้อย 6 ชั่วโมง และลงนามรับรองโดยแพทย์ 3 ท่าน (ไม่อยู่ในทีมปลูกถ่าย) ร่วมกับ Apnea Test'
          },
          {
            id: 'fc2',
            domain: 'brain_death_donor',
            front: 'ผู้ป่วยสมองตายมีภาวะเบาจืด (Diabetes Insipidus) ใช้ยาอะไรคุม?',
            back: 'Desmopressin (DDAVP) ควบคู่การรักษาความดันโลหิตให้คงที่และติดตามเกลือแร่โซเดียม'
          },
          {
            id: 'fc3',
            domain: 'procurement_transplant',
            front: 'ตัวเลข Cold Chain สำคัญ: หัวใจ / ดวงตา / อุณหภูมิบรรจุไต',
            back: '• หัวใจ: ≤ 4 ชม.\n• ดวงตา: 6–8 ชม.\n• บรรจุขนส่งไต: 2–4°C (น้ำแข็งเกล็ดที่กำลังละลาย ห้ามใช้น้ำแข็งแห้ง -20°C)'
          },
          {
            id: 'fc4',
            domain: 'family_communication',
            front: 'หลัก Decoupling และ SPIKES ตัว S ตัวแรก หมายถึงอะไร?',
            back: '• Decoupling: แยกการแจ้งข่าวสมองตายออกจากการขอรับบริจาคอวัยวะ\n• S (Setting): เตรียมสถานที่ที่เป็นส่วนตัว สงบ และเหมาะสมก่อนพูดคุย'
          },
          {
            id: 'fc5',
            domain: 'policy_ethics',
            front: 'เกณฑ์อายุแสดงความจำนงบริจาคด้วยตนเอง และจริยธรรมสูงสุดคือ?',
            back: '• อายุขั้นต่ำ 18 ปีบริบูรณ์\n• จริยธรรมสูงสุดคือ Autonomy (การเคารพสิทธิ์การตัดสินใจของผู้ป่วยและญาติ)'
          }
        ];

  const PRE_APPROACH_TAGS = global.PRE_APPROACH_TAGS || {
    ageGroups: ['เด็ก/วัยรุ่น', 'วัยทำงาน (20–45 ปี)', 'วัยกลางคน (46–65 ปี)', 'ผู้สูงอายุ (>65 ปี)'],
    causes: ['อุบัติเหตุทางศีรษะ (TBI)', 'โรคหลอดเลือดสมองแตก/ตีบ', 'ภาวะขาดออกซิเจนเฉียบพลัน'],
    familyMoods: [
      'ช็อก / ยังไม่ยอมรับ',
      'โศกเศร้าร้องไห้หนัก',
      'สับสนเรื่องเครื่องช่วยหายใจ',
      'ความเห็นในครอบครัวต่างกัน',
      'สงบและเปิดใจรับฟัง'
    ],
    concerns: [
      'กังวลความเชื่อ/พิธีกรรมศาสนา',
      'กลัวร่างไม่เรียบร้อย',
      'กังวลค่าใช้จ่าย/ความโปร่งใส',
      'ไม่แน่ใจความต้องการของผู้เสียชีวิต'
    ]
  };

  const CSAT_RATING_LABELS = {
    1: 'น้อยที่สุด (1)',
    2: 'น้อย (2)',
    3: 'ปานกลาง (3)',
    4: 'มาก (4)',
    5: 'มากที่สุด (5)'
  };

  const CNEU_EVAL_CRITERIA = [
    {
      key: 'content',
      title: '1. ความทันสมัย ความถูกต้อง และประโยชน์ของเนื้อหาหลักสูตร',
      desc: 'ครอบคลุมเกณฑ์วินิจฉัยภาวะสมองตาย Donor Management และการจัดเก็บอวัยวะ'
    },
    {
      key: 'speaker',
      title: '2. คุณภาพสื่อวิดีโอ เอกสารประกอบ และการถ่ายทอดของวิทยากร',
      desc: 'ความชัดเจนในการอธิบายและลำดับขั้นตอนการเรียนรู้ 20 บทเรียน'
    },
    {
      key: 'platform',
      title: '3. ความสะดวกและความเสถียรของระบบเรียนออนไลน์ (rjcloud.organ)',
      desc: 'การลงทะเบียน OTP, การทำแบบทดสอบ และการใช้งานผ่านมือถือ/คอมพิวเตอร์'
    },
    {
      key: 'aiLab',
      title: '4. ประโยชน์ของระบบผู้ช่วย AI และห้องฝึกสื่อสาร 3 มิติ (AI Skill Lab)',
      desc: 'AI Study Companion สรุปบทเรียน และห้องฝึกสื่อสารกับญาติผู้เสียชีวิต'
    },
    {
      key: 'application',
      title: '5. ความมั่นใจในการนำความรู้และทักษะไปประยุกต์ใช้ในงานจริง',
      desc: 'สามารถนำไปปรับใช้ดูแลผู้ป่วยและสื่อสารกับครอบครัวในหน่วยงานได้จริง'
    }
  ];

  // ============================================================================
  // 2. EXAM PARSER & 4-DOMAIN AI DIAGNOSTIC ROADMAP ENGINE
  // ============================================================================

  /**
   * แปลงสตริงคลังข้อสอบรูปแบบ "คำถาม|ตัวเลือก...|เฉลย" เป็นอ็อบเจกต์ข้อสอบพร้อมผูกหมวดคลินิก
   */
  function parseRawExams(raw) {
    if (!Array.isArray(raw)) return [];
    const domMap = Array.isArray(global.QUESTION_DOMAIN_MAP) ? global.QUESTION_DOMAIN_MAP : [];
    const fallbackDoms = [
      'policy_ethics',
      'procurement_transplant',
      'family_communication',
      'brain_death_donor'
    ];
    return raw.map(function (str, idx) {
      const parts = String(str).split('|').map(function (s) {
        return s.trim();
      });
      return {
        id: idx + 1,
        origIdx: idx,
        domain: domMap[idx] || fallbackDoms[idx % fallbackDoms.length],
        question: parts[0] ? parts[0].replace(/^[0-9]+\.\s*/, '') : '',
        options: parts.slice(1, Math.max(2, parts.length - 1)),
        answer: parseInt((parts[parts.length - 1] || '0').replace(/[^0-9]/g, ''), 10) || 0
      };
    });
  }

  /**
   * แปลงชุดข้อสอบจาก Firestore (ที่อาจเก็บเป็น Object map หรือ Array) ให้เป็น Array เสมอ
   */
  function normalizeQuestionSets(rawSets) {
    if (!rawSets) return [parseRawExams(global.QUIZ_QUESTIONS_RAW || FALLBACK_QUIZ_RAW)];
    if (Array.isArray(rawSets)) return rawSets;
    if (typeof rawSets === 'object') {
      return Object.keys(rawSets)
        .sort(function (a, b) {
          return Number(a) - Number(b);
        })
        .map(function (k) {
          return Array.isArray(rawSets[k]) ? rawSets[k] : [];
        });
    }
    return [parseRawExams(FALLBACK_QUIZ_RAW)];
  }

  /**
   * วิเคราะห์ผลสอบแยก 4 หมวดคลินิก เพื่อสร้าง AI Diagnostic Roadmap และรายการบทเรียนที่แนะนำ
   */
  function computeDomainDiagnosis(questions, answers, minPosttestPercent) {
    const passGate = Number(minPosttestPercent || getResolvedConfig().learningRules.minPosttestPercent || 80);
    const bucket = {};
    Object.values(CLINICAL_DOMAINS).forEach(function (d) {
      bucket[d.id] = { ...d, correct: 0, total: 0 };
    });

    (questions || []).forEach(function (q, idx) {
      const domId = bucket[q.domain] ? q.domain : 'policy_ethics';
      bucket[domId].total += 1;
      if (answers && answers[idx] === q.answer) {
        bucket[domId].correct += 1;
      }
    });

    const domains = Object.values(bucket).map(function (d) {
      return {
        ...d,
        percent: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 100
      };
    });

    const sorted = [...domains].sort(function (a, b) {
      return a.percent - b.percent;
    });
    const weakDomains = sorted.filter(function (d) {
      return d.percent < passGate;
    });
    const focusDomains = weakDomains.length > 0 ? weakDomains : sorted.slice(0, 1);
    const recommendedLessonIds = Array.from(
      new Set(
        focusDomains.reduce(function (acc, d) {
          return acc.concat(Array.isArray(d.lessonIds) ? d.lessonIds : []);
        }, [])
      )
    );

    const summaryText =
      weakDomains.length > 0
        ? 'AI วิเคราะห์พบว่าคุณควรเน้นทบทวนหมวด “' +
          weakDomains
            .map(function (d) {
              return d.shortName;
            })
            .join('” และ “') +
          '” เป็นพิเศษ โดยระบบได้ติดดาว ★ แนะนำบทเรียนที่เกี่ยวข้องให้ในห้องเรียนแล้วค่ะ'
        : 'ยอดเยี่ยมมากค่ะ! คุณมีพื้นฐานความรู้แข็งแรงครบทั้ง 4 หมวดคลินิก สามารถทบทวนบทเรียนและเข้าฝึก AI Skill Lab 3 มิติได้เลยค่ะ';

    return {
      domains: domains,
      weakDomains: weakDomains,
      recommendedLessonIds: recommendedLessonIds,
      summaryText: summaryText,
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * คำนวณเปอร์เซ็นต์คะแนน Post-test จากสตริงเช่น "36/40"
   */
  function parsePosttestPercent(u, minPosttestPercent) {
    const passGate = Number(minPosttestPercent || getResolvedConfig().learningRules.minPosttestPercent || 80);
    const m = String((u && u.posttest) || '').match(/(\d+)\s*\/\s*(\d+)/);
    if (!m) return u && u.status === 'ผ่าน' ? passGate : 0;
    const score = parseInt(m[1], 10);
    const total = parseInt(m[2], 10) || 1;
    return Math.round((score / total) * 100);
  }

  // ============================================================================
  // 3. ROLE-ADAPTIVE PROFILE, STUDY TIMER & THAI DATE FORMATTERS
  // ============================================================================

  /**
   * เลือกโปรไฟล์มุมมองผู้ช่วย AI ตามลักษณะงานและตำแหน่งจริงของผู้เรียน
   */
  function resolveRoleProfile(u) {
    const ctx = String((u && (u.workContext || u.position)) || '').toLowerCase();
    if (ctx.includes('รับบริจาค') || ctx.includes('ปลูกถ่าย') || ctx.includes('tc')) {
      return ROLE_ADAPTIVE_PROFILES.donor_team;
    }
    if (
      ctx.includes('icu') ||
      ctx.includes('er') ||
      ctx.includes('or') ||
      ctx.includes('วิกฤต') ||
      ctx.includes('ผ่าตัด') ||
      ctx.includes('ฉุกเฉิน') ||
      ctx.includes('พยาบาล')
    ) {
      return ROLE_ADAPTIVE_PROFILES.icu_er_or;
    }
    return ROLE_ADAPTIVE_PROFILES.general;
  }

  /**
   * คำนวณจำนวนชั่วโมงเป้าหมายตามประเภทการเรียน (เรียนใหม่ vs เรียนต่อเนื่อง)
   */
  function getTargetHoursForUser(u, liveCfg) {
    const baseHours = Math.max(1, Number((liveCfg && liveCfg.hours) || 8));
    if (u && u.userType === 'เรียนต่อเนื่อง') {
      return Math.max(2, Math.round(baseHours * 0.75));
    }
    return baseHours;
  }

  /**
   * แปลงวินาทีเวลาเรียนสะสมเป็นข้อความภาษาไทยอ่านง่าย
   */
  function formatStudyTime(seconds) {
    const total = Math.max(0, Math.floor(Number(seconds || 0)));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (h > 0) return h + ' ชม. ' + m + ' น.';
    if (m > 0) return m + ' น. ' + s + ' วิ';
    return s + ' วินาที';
  }

  /**
   * แปลงวันที่ ISO เป็นรูปแบบภาษาไทยเต็ม (เช่น 12 มกราคม 2570)
   */
  function formatThaiDate(isoStr) {
    try {
      const d = isoStr ? new Date(isoStr) : new Date();
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (_) {
      return '-';
    }
  }

  // ============================================================================
  // 4. PDPA PRIVACY MASKING (PRE-OTP) & ZERO-PII EXECUTIVE TELEMETRY BUILDER
  // ============================================================================

  /**
   * ปกปิดอีเมลบางส่วนก่อนยืนยัน OTP เช่น ka••••@rajavithi.go.th
   */
  function maskEmail(email) {
    const clean = String(email || '').trim();
    if (!clean || !clean.includes('@')) return clean ? '••••••' : '';
    const parts = clean.split('@');
    const local = parts[0];
    const domain = parts[1];
    const head = local.slice(0, Math.min(2, local.length));
    return head + '••••@' + domain;
  }

  /**
   * ปกปิดเบอร์โทรศัพท์บางส่วนก่อนยืนยัน OTP เช่น 081••••890
   */
  function maskPhone(phone) {
    const digits = String(phone || '').replace(/[^0-9]/g, '');
    if (!digits) return '';
    if (digits.length <= 5) return '•••••';
    return digits.slice(0, 3) + '••••' + digits.slice(-3);
  }

  /**
   * แปลงสังกัดเป็นรหัสเขตสุขภาพ 13 เขต (R1-R12, BKK, OTHER)
   */
  function resolveRegionId(department) {
    const d = String(department || '').trim();
    if (d.startsWith('เขตสุขภาพที่')) {
      const num = d.replace(/[^0-9]/g, '');
      if (num && Number(num) >= 1 && Number(num) <= 12) return 'R' + num;
    }
    if (
      ['กรมการแพทย์', 'สำนักการแพทย์ กรุงเทพฯ', 'สำนักอนามัย กรุงเทพฯ', 'กรุงเทพมหานคร'].some(
        function (k) {
          return d.includes(k);
        }
      )
    ) {
      return 'BKK';
    }
    return 'OTHER';
  }

  /**
   * สร้างรหัสแฮชแบบไม่ระบุตัวตน (FNV-1a 32-bit) สำหรับคอลเลกชัน executive_telemetry
   * ใช้สูตรเดียวกับ aiskilllab.html เพื่อให้ระเบียนสถิติผสานกันโดยไม่มี PII
   */
  function buildAnonTelemetryId(rawId) {
    const str = 'RJCLOUD_PDPA_ANON|' + String(rawId || '') + '|2027';
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return 'ANON-' + (h >>> 0).toString(16).toUpperCase().padStart(8, '0');
  }

  /**
   * สร้างก้อนข้อมูลสถิติไม่ระบุตัวตน (Zero-PII) สำหรับส่งให้หน้าแดชบอร์ดผู้บริหาร (executive.html)
   * ไม่เก็บชื่อ-สกุล เลขใบอนุญาต อีเมล หรือเบอร์โทรศัพท์เด็ดขาด
   */
  function buildExecutiveTelemetryPayload(u) {
    if (!u) return null;
    const domains =
      u.aiRoadmap && Array.isArray(u.aiRoadmap.domains)
        ? u.aiRoadmap.domains.map(function (d) {
            return { id: d.id, percent: Number(d.percent || 0) };
          })
        : [];
    return {
      regionId: resolveRegionId(u.department),
      department: u.department || '',
      status: u.status === 'ผ่าน' ? 'ผ่าน' : 'กำลังเรียน',
      progress: Number(u.progress || 0),
      hasLab: Boolean(
        u.skillLabPassed || (Array.isArray(u.skillLabHistory) && u.skillLabHistory.length > 0)
      ),
      skillLabBestScore: typeof u.skillLabBestScore === 'number' ? u.skillLabBestScore : null,
      radar: u.skillLabLatestRadar || null,
      domains: domains,
      satisfactionScore: typeof u.satisfactionScore === 'number' ? u.satisfactionScore : null,
      updatedAt: new Date().toISOString()
    };
  }

  // ============================================================================
  // 5. PCM16-TO-WAV AUDIO CONVERTER & INDEXEDDB VOICE CACHE
  // ============================================================================
  const AUDIO_DB_NAME = 'rjcloud_lesson_audio_cache_v1';
  const AUDIO_STORE_NAME = 'clips';
  let audioDbPromise = null;

  /**
   * แปลงเสียง Base64 PCM16 จาก Gemini TTS เป็น Blob ไฟล์ WAV พร้อมเล่นบนเบราว์เซอร์
   */
  function pcm16ToWavBlob(base64PCM, sampleRate) {
    const rate = sampleRate || 24000;
    const binaryString = global.atob(base64PCM);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const buffer = new ArrayBuffer(44 + bytes.length);
    const view = new DataView(buffer);
    const writeStr = function (offset, str) {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };
    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + bytes.length, true);
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
    view.setUint32(40, bytes.length, true);
    new Uint8Array(buffer, 44).set(bytes);
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
