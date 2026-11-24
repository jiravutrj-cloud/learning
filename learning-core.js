/* ============================================================================
 * rjcloud.organ 2.0 — Core Learning, AI Diagnosis, PDPA & Audio Engine (learning-core.js)
 * ชื่อธีมอย่างเป็นทางการ: rjcloud.organ 2.0 (Atmospheric Horizon + Liquid Glass)
 * ไฟล์โมดูลกลาง (Zero-Build) เผยแพร่ผ่าน window.RJCLOUD_CORE
 *
 * โครงสร้างภายในไฟล์ (ครบทั้ง 6 ส่วน 100%):
 * 1. Configuration & Built-in Fallback Defaults (ธีม rjcloud.organ 2.0 + ค่าสำรองครบชุด)
 * 2. Exam Parser & 4-Domain AI Diagnostic Roadmap Engine
 * 3. Role-Adaptive Profile, Study Timer & Thai Date Formatters
 * 4. PDPA Privacy Masking (Pre-OTP) & Zero-PII Executive Telemetry Builder
 * 5. Natural Thai Speech Polisher, Exact RIFF-Data WAV Converter & IndexedDB Cache (v4)
 * 6. Public API Export (window.RJCLOUD_CORE)
 * ============================================================================ */

(function (global) {
  'use strict';

  // ============================================================================
  // 1. CONFIGURATION & BUILT-IN FALLBACK DEFAULTS
  // ============================================================================
  const BUILTIN_CONFIG = {
    appName: 'rjcloud.organ',
    themeName: 'rjcloud.organ 2.0',
    edition: 'rjcloud.organ 2.0 • Cloud AI (2027)',
    taglineEN: 'e-Learning Organ Donation Training',
    contactEmail: 'rjcloud.organ@gmail.com',
    appId: 'rjcloud-organ-2027',
    adminEmails: ['rjcloud.organ@gmail.com'],
    learningRules: {
      allowedUserTypes: ['เรียนใหม่', 'เรียนต่อเนื่อง'],
      minStudyPercent: 80,
      minPosttestPercent: 80
    },
    theme: {
      name: 'rjcloud.organ 2.0',
      subtitle: 'Cloud AI',
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
   * รวมค่าการตั้งค่าจาก data.js (window.RJCLOUD_CONFIG) เข้ากับค่ามาตรฐานในตัว
   * เพื่อป้องกันการทำงานขัดข้องหากบางฟิลด์ยังไม่ได้กำหนดไว้ใน data.js
   */
  function getResolvedConfig() {
    const ext = global.RJCLOUD_CONFIG && typeof global.RJCLOUD_CONFIG === 'object' ? global.RJCLOUD_CONFIG : {};
    const extFb = ext.firebaseConfig && ext.firebaseConfig.apiKey ? ext.firebaseConfig : null;
    return Object.assign({}, BUILTIN_CONFIG, ext, {
      adminEmails:
        Array.isArray(ext.adminEmails) && ext.adminEmails.length > 0
          ? ext.adminEmails
          : BUILTIN_CONFIG.adminEmails,
      learningRules: Object.assign({}, BUILTIN_CONFIG.learningRules, ext.learningRules || {}),
      theme: Object.assign({}, BUILTIN_CONFIG.theme, ext.theme || {}),
      firebaseConfig: extFb
        ? Object.assign({}, BUILTIN_CONFIG.firebaseConfig, extFb)
        : Object.assign({}, BUILTIN_CONFIG.firebaseConfig),
      appsScriptUrl: ext.appsScriptUrl || BUILTIN_CONFIG.appsScriptUrl
    });
  }

  const DEFAULT_CERT_TEMPLATE = Object.assign(
    {
      certPrefix: 'RJC-2027',
      cneuActivityCode: '',
      cneuCredits: '',
      cmeActivityCode: '',
      cmeCredits: '',
      trainingHours: '8',
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
    },
    global.DEFAULT_CERT_TEMPLATE || {}
  );

  const DEFAULT_CNEU_CONFIG = {
    logoUrl: '',
    orgName: 'ศูนย์ความเป็นเลิศทางการแพทย์ด้านการรับบริจาคและปลูกถ่ายอวัยวะ โรงพยาบาลราชวิถี',
    courseName: 'หลักสูตรการพยาบาลและการประสานงานการรับบริจาคและปลูกถ่ายอวัยวะ (rjcloud.organ)',
    activityCode: 'CNEU-2027-0148',
    batchLabel: 'รุ่นที่ 1 ประจำปีงบประมาณ 2570',
    cneuCredits: '8.0',
    trainingHours: '8',
    cmeActivityCode: '',
    cmeCredits: '',
    dateRange: '1 – 31 มกราคม 2570',
    criteriaText: 'ยืนยันตัวตน OTP + ผ่านเกณฑ์ชั่วโมงอบรม + AI Skill Lab + Post-test ≥ 80%',
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
        'ทบทวนเป้าหมาย Service Plan, เกณฑ์อายุแสดงความจำนง (18 ปี), บทบาทจัดสรรอวัยวะของ ODC สภากาชาดไทย และหลักจริยธรรม Autonomy'
    },
    brain_death_donor: {
      id: 'brain_death_donor',
      nameTH: 'การวินิจฉัยภาวะสมองตายและการดูแลผู้บริจาค',
      shortName: 'สมองตาย & Donor',
      color: '#34d399',
      lessonIds: [5, 9, 12, 13],
      remediationGuide:
        'ทบทวนเกณฑ์ GCS=3, การตรวจทางคลินิก 2 ครั้งห่าง 6 ชม. โดยแพทย์ 3 ท่าน, Apnea Test, Lazarus Sign และการให้ DDAVP คุมภาวะเบาจืด (DI)'
    },
    procurement_transplant: {
      id: 'procurement_transplant',
      nameTH: 'การจัดเก็บ ขนส่ง และดูแลผู้ป่วยปลูกถ่ายอวัยวะ',
      shortName: 'จัดเก็บ & ปลูกถ่าย',
      color: '#a78bfa',
      lessonIds: [2, 6, 10, 14, 15, 16, 17, 18, 19, 20],
      remediationGuide:
        'ทบทวน Golden Period หัวใจ (≤ 4 ชม.), ดวงตา (6–8 ชม.), อุณหภูมิบรรจุไต (2–4°C), HLA Typing และการตกแต่งร่างอย่างประณีต'
    },
    family_communication: {
      id: 'family_communication',
      nameTH: 'การสื่อสารและให้ข้อมูลญาติผู้เสียชีวิต',
      shortName: 'สื่อสารกับญาติ',
      color: '#fbbf24',
      lessonIds: [11],
      remediationGuide:
        'ทบทวนหลัก Decoupling, หลัก SPIKES (Setting), การเว้นความเงียบ 2.5 วินาที และการตอบคำถามความเชื่ออย่างอ่อนโยน'
    }
  };

  const HOSPITAL_MAPPING = global.HOSPITAL_MAPPING || {
    'เขตสุขภาพที่ 1': [{ name: 'รพ.นครพิงค์', prov: 'เชียงใหม่' }],
    'เขตสุขภาพที่ 2': [{ name: 'รพ.พุทธชินราช', prov: 'พิษณุโลก' }],
    'เขตสุขภาพที่ 3': [{ name: 'รพ.สวรรค์ประชารักษ์', prov: 'นครสวรรค์' }],
    'เขตสุขภาพที่ 4': [{ name: 'รพ.สระบุรี', prov: 'สระบุรี' }],
    'เขตสุขภาพที่ 5': [{ name: 'รพ.ราชบุรี', prov: 'ราชบุรี' }],
    'เขตสุขภาพที่ 6': [{ name: 'รพ.ชลบุรี', prov: 'ชลบุรี' }],
    'เขตสุขภาพที่ 7': [{ name: 'รพ.ขอนแก่น', prov: 'ขอนแก่น' }],
    'เขตสุขภาพที่ 8': [{ name: 'รพ.อุดรธานี', prov: 'อุดรธานี' }],
    'เขตสุขภาพที่ 9': [{ name: 'รพ.มหาราชนครราชสีมา', prov: 'นครราชสีมา' }],
    'เขตสุขภาพที่ 10': [{ name: 'รพ.สรรพสิทธิประสงค์', prov: 'อุบลราชธานี' }],
    'เขตสุขภาพที่ 11': [{ name: 'รพ.สุราษฎร์ธานี', prov: 'สุราษฎร์ธานี' }],
    'เขตสุขภาพที่ 12': [{ name: 'รพ.หาดใหญ่', prov: 'สงขลา' }],
    'กรมการแพทย์': [
      { name: 'รพ.ราชวิถี', prov: 'กรุงเทพมหานคร' },
      { name: 'รพ.เลิดสิน', prov: 'กรุงเทพมหานคร' },
      { name: 'รพ.นพรัตนราชธานี', prov: 'กรุงเทพมหานคร' }
    ],
    'อื่นๆ': [{ name: 'อื่นๆ', prov: '' }]
  };

  const FALLBACK_LESSONS =
    Array.isArray(global.INITIAL_LESSONS) && global.INITIAL_LESSONS.length > 0
      ? global.INITIAL_LESSONS
      : [
          { id: 1, domain: 'policy_ethics', title: 'บทที่ 1: นโยบายและเป้าหมาย Service Plan ด้านการรับบริจาคอวัยวะ', videoId: '', documentUrl: '' },
          { id: 2, domain: 'brain_death_donor', title: 'บทที่ 2: เกณฑ์วินิจฉัยภาวะสมองตายและ Donor Management', videoId: '', documentUrl: '' },
          { id: 3, domain: 'family_communication', title: 'บทที่ 3: การสื่อสารกับครอบครัวด้วยหลัก SPIKES และ Decoupling', videoId: '', documentUrl: '' },
          { id: 4, domain: 'procurement_transplant', title: 'บทที่ 4: การจัดเก็บ ขนส่ง (Cold Chain) และดูแลหลังปลูกถ่าย', videoId: '', documentUrl: '' }
        ];

  const FALLBACK_QUIZ_RAW =
    Array.isArray(global.QUIZ_QUESTIONS_RAW) && global.QUIZ_QUESTIONS_RAW.length > 0
      ? global.QUIZ_QUESTIONS_RAW
      : [
          'เป้าหมายหลักของ Service Plan สาขาการรับบริจาคและปลูกถ่ายอวัยวะคือข้อใด?|ลดค่าใช้จ่าย|เพิ่มจำนวนผู้บริจาคสมองตายและผู้ได้รับการปลูกถ่ายอวัยวะให้เพียงพอ|ลดเตียง ICU|เปิดศูนย์ในทุกตำบล|1',
          'การประเมินผู้ป่วยสมองตายในผู้ใหญ่ต้องตรวจทางคลินิกอย่างน้อยกี่ครั้ง?|1 ครั้ง|2 ครั้ง ห่างกันอย่างน้อย 6 ชั่วโมง|3 ครั้ง|ไม่ต้องตรวจซ้ำ|1',
          'หลัก Decoupling หมายถึงการแยกเรื่องใดออกจากเรื่องใด?|แยกหมอออกจากพยาบาล|แยกการแจ้งข่าวสมองตายออกจากการเจรจาขอรับบริจาคอวัยวะ|แยกหัวใจออกจากปอด|แยกห้อง ICU|1',
          'การบรรจุไตเพื่อขนส่ง (Kidney Packaging) ต้องควบคุมอุณหภูมิในช่วงใด?|-20 องศาเซลเซียส|25 องศาเซลเซียส|2-4 องศาเซลเซียส|37 องศาเซลเซียส|2',
          'ยาหลักที่นิยมใช้ควบคุมภาวะเบาจืด (Diabetes Insipidus) ในผู้ป่วยสมองตายคือข้อใด?|Epinephrine|Desmopressin (DDAVP)|Insulin|Furosemide|1'
        ];

  const ROLE_ADAPTIVE_PROFILES = global.ROLE_ADAPTIVE_PROFILES || {
    donor_team: {
      id: 'donor_team',
      badgeTH: 'มุมมองทีมรับบริจาค / TC',
      focusSummary: 'เน้นการประสานงาน ODC, หลักการสื่อสาร Decoupling & SPIKES และจริยธรรมวิชาชีพ',
      aiPromptAddon: 'ผู้เรียนปฏิบัติงานด้านรับบริจาคและปลูกถ่ายอวัยวะ (TC) โดยตรง'
    },
    icu_er_or: {
      id: 'icu_er_or',
      badgeTH: 'มุมมอง ICU / ER / OR',
      focusSummary: 'เน้นการคัดกรอง Potential Donor (GCS=3), การรักษาสัญญาณชีพ (DDAVP) และ Cold Chain 2–4°C',
      aiPromptAddon: 'ผู้เรียนปฏิบัติงานหอผู้ป่วยวิกฤต (ICU) ห้องฉุกเฉิน (ER) หรือห้องผ่าตัด (OR)'
    },
    general: {
      id: 'general',
      badgeTH: 'มุมมองบุคลากรและผู้สนใจทั่วไป',
      focusSummary: 'อธิบายเกณฑ์ทางคลินิกด้วยภาษาเข้าใจง่าย พร้อมเชื่อมโยงมาตรฐานวิชาชีพ',
      aiPromptAddon: 'อธิบายศัพท์ทางการแพทย์อย่างกระชับ เป็นมิตร และเข้าใจง่าย'
    }
  };

  const CLINICAL_CASE_SIMULATIONS = Array.isArray(global.CLINICAL_CASE_SIMULATIONS)
    ? global.CLINICAL_CASE_SIMULATIONS
    : [];

  const SPACED_FLASHCARDS = Array.isArray(global.SPACED_FLASHCARDS) ? global.SPACED_FLASHCARDS : [];

  const PRE_APPROACH_TAGS = global.PRE_APPROACH_TAGS || {
    ageGroups: ['เด็ก/วัยรุ่น', 'วัยทำงาน (20–45 ปี)', 'วัยกลางคน (46–65 ปี)', 'ผู้สูงอายุ (>65 ปี)'],
    causes: ['อุบัติเหตุทางศีรษะ (TBI)', 'โรคหลอดเลือดสมองแตก/ตีบ', 'ภาวะขาดออกซิเจนเฉียบพลัน'],
    familyMoods: ['ช็อก / ยังไม่ยอมรับ', 'โศกเศร้าร้องไห้หนัก', 'สับสนเรื่องเครื่องช่วยหายใจ', 'ความเห็นในครอบครัวต่างกัน'],
    concerns: ['กังวลความเชื่อ/พิธีกรรมศาสนา', 'กลัวร่างไม่เรียบร้อย', 'กังวลค่าใช้จ่าย/ความโปร่งใส']
  };

  const CSAT_RATING_LABELS = {
    1: 'ควรปรับปรุงมาก',
    2: 'ควรปรับปรุง',
    3: 'ปานกลาง',
    4: 'ดี',
    5: 'ดีเยี่ยม'
  };

  const CNEU_EVAL_CRITERIA = [
    { key: 'content', labelTH: 'ความถูกต้อง ทันสมัย และประโยชน์ของเนื้อหาทางคลินิก' },
    { key: 'skillLab', labelTH: 'ประโยชน์ของห้องฝึกสื่อสาร 3 มิติ AI Skill Lab ต่อการปฏิบัติงานจริง' },
    { key: 'usability', labelTH: 'ความสะดวกในการใช้งานและความสวยงามของแพลตฟอร์ม' },
    { key: 'confidence', labelTH: 'ความมั่นใจที่เพิ่มขึ้นในการดูแลผู้บริจาคและสื่อสารกับครอบครัว' },
    { key: 'overall', labelTH: 'ความพึงพอใจภาพรวมต่อหลักสูตร rjcloud.organ 2.0' }
  ];

  // ============================================================================
  // 2. EXAM PARSER & 4-DOMAIN AI DIAGNOSTIC ROADMAP ENGINE
  // ============================================================================

  /**
   * แปลงคลังข้อสอบรูปแบบสตริง "คำถาม|ตัวเลือก0|ตัวเลือก1|ตัวเลือก2|ตัวเลือก3|ดัชนีคำตอบ" เป็นอ็อบเจกต์มาตรฐาน
   */
  function parseRawExams(rawList) {
    const list = Array.isArray(rawList) && rawList.length > 0 ? rawList : FALLBACK_QUIZ_RAW;
    const domainMap = Array.isArray(global.QUESTION_DOMAIN_MAP) ? global.QUESTION_DOMAIN_MAP : [];
    const domainKeys = Object.keys(CLINICAL_DOMAINS);

    return list
      .map(function (item, idx) {
        if (item && typeof item === 'object' && item.question) {
          return {
            id: item.id || idx + 1,
            domain: item.domain || domainMap[idx] || domainKeys[idx % domainKeys.length] || 'policy_ethics',
            question: String(item.question || '').trim(),
            options: Array.isArray(item.options) ? item.options : [],
            answer: Number(item.answer) || 0
          };
        }
        const parts = String(item || '')
          .split('|')
          .map(function (s) {
            return s.trim();
          });
        if (parts.length < 3) return null;
        const ansRaw = parts[parts.length - 1];
        const answerIdx = parseInt(String(ansRaw).replace(/[^0-9]/g, ''), 10);
        return {
          id: idx + 1,
          domain: domainMap[idx] || domainKeys[idx % domainKeys.length] || 'policy_ethics',
          question: parts[0].replace(/^[0-9]+\.\s*/, ''),
          options: parts.slice(1, parts.length - 1),
          answer: isNaN(answerIdx) ? 0 : answerIdx
        };
      })
      .filter(Boolean);
  }

  /**
   * ปรับโครงสร้างชุดข้อสอบจาก Firestore (รองรับทั้ง Array และ Object Map { '0': [...] })
   */
  function normalizeQuestionSets(rawSets) {
    if (!rawSets) return [parseRawExams(global.QUIZ_QUESTIONS_RAW || FALLBACK_QUIZ_RAW)];
    if (Array.isArray(rawSets)) {
      return rawSets.map(function (setItem) {
        return Array.isArray(setItem) ? parseRawExams(setItem) : [];
      });
    }
    if (typeof rawSets === 'object') {
      return Object.keys(rawSets)
        .sort(function (a, b) {
          return Number(a) - Number(b);
        })
        .map(function (k) {
          return Array.isArray(rawSets[k]) ? parseRawExams(rawSets[k]) : [];
        });
    }
    return [parseRawExams(global.QUIZ_QUESTIONS_RAW || FALLBACK_QUIZ_RAW)];
  }

  /**
   * วิเคราะห์ผลสอบแยกตาม 4 หมวดสมรรถนะคลินิก เพื่อสร้าง AI Diagnostic Roadmap แนะนำบทเรียนจุดอ่อน
   */
  function computeDomainDiagnosis(questions, answersObj) {
    const qList = Array.isArray(questions) ? questions : [];
    const ans = answersObj && typeof answersObj === 'object' ? answersObj : {};
    const stats = {};

    Object.keys(CLINICAL_DOMAINS).forEach(function (dk) {
      const meta = CLINICAL_DOMAINS[dk];
      stats[dk] = {
        id: dk,
        nameTH: meta.nameTH,
        shortName: meta.shortName,
        color: meta.color,
        lessonIds: meta.lessonIds || [],
        remediationGuide: meta.remediationGuide || '',
        correct: 0,
        total: 0,
        percent: 0
      };
    });

    let totalCorrect = 0;
    qList.forEach(function (q, idx) {
      const dk = stats[q.domain] ? q.domain : 'policy_ethics';
      stats[dk].total += 1;
      const picked = ans[q.id] !== undefined ? ans[q.id] : ans[idx];
      if (picked !== undefined && Number(picked) === Number(q.answer)) {
        stats[dk].correct += 1;
        totalCorrect += 1;
      }
    });

    const domains = Object.keys(stats).map(function (dk) {
      const d = stats[dk];
      d.percent = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
      return d;
    });

    const sortedByWeakest = domains.slice().sort(function (a, b) {
      return a.percent - b.percent;
    });
    const overallPercent = qList.length > 0 ? Math.round((totalCorrect / qList.length) * 100) : 0;
    const weakest = sortedByWeakest[0] || domains[0];

    return {
      totalCorrect: totalCorrect,
      totalQuestions: qList.length,
      overallPercent: overallPercent,
      domains: domains,
      weakestDomain: weakest,
      recommendedLessonIds: weakest ? weakest.lessonIds : [1, 11, 12, 13]
    };
  }

  /**
   * แปลงข้อความคะแนน Post-test (เช่น "37/40") เป็นเปอร์เซ็นต์เต็ม 100
   */
  function parsePosttestPercent(posttestStr) {
    const m = String(posttestStr || '').match(/(\d+)\s*\/\s*(\d+)/);
    if (!m) return 0;
    const num = Number(m[1]);
    const den = Number(m[2]) || 40;
    return Math.max(0, Math.min(100, Math.round((num / den) * 100)));
  }

  // ============================================================================
  // 3. ROLE-ADAPTIVE PROFILE, STUDY TIMER & THAI DATE FORMATTERS
  // ============================================================================

  /**
   * ระบุโปรไฟล์บทบาททางคลินิกของผู้เรียนเพื่อปรับคำแนะนำ AI Tutor ให้ตรงหน้างาน
   */
  function resolveRoleProfile(userObj) {
    const u = userObj || {};
    const txt = (String(u.position || '') + ' ' + String(u.department || '') + ' ' + String(u.name || '')).toLowerCase();
    if (/(tc|transplant|coordinator|รับบริจาค|ปลูกถ่าย|ประสานงาน)/.test(txt)) {
      return ROLE_ADAPTIVE_PROFILES.donor_team;
    }
    if (/(icu|er|or|วิกฤต|ฉุกเฉิน|ผ่าตัด|หอผู้ป่วย|พยาบาล|แพทย์)/.test(txt)) {
      return ROLE_ADAPTIVE_PROFILES.icu_er_or;
    }
    return ROLE_ADAPTIVE_PROFILES.general;
  }

  /**
   * คำนวณจำนวนชั่วโมงเรียนเป้าหมายของผู้เรียน (หากเทียบโอนชั่วโมง = 0 ชม.)
   */
  function getTargetHoursForUser(userObj, defaultHours) {
    const u = userObj || {};
    if (u.studyHoursExempt || u.userType === 'เรียนต่อเนื่อง') return 0;
    const hrs = Number(defaultHours || u.trainingHours || 8);
    return isNaN(hrs) || hrs <= 0 ? 8 : hrs;
  }

  /**
   * แปลงจำนวนวินาทีเรียนสะสมเป็นข้อความภาษาไทยอ่านง่าย
   */
  function formatStudyTime(seconds) {
    const total = Math.max(0, Math.floor(Number(seconds || 0)));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (h > 0) return h + ' ชม. ' + m + ' นาที';
    if (m > 0) return m + ' นาที ' + String(s).padStart(2, '0') + ' วิ';
    return s + ' วินาที';
  }

  /**
   * แปลงวันที่ ISO เป็นรูปแบบภาษาไทยเต็ม (พ.ศ.)
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
   * ปกปิดบางส่วนของอีเมลก่อนยืนยัน OTP เพื่อคุ้มครองข้อมูลส่วนบุคคลตาม PDPA
   */
  function maskEmail(email) {
    const str = String(email || '').trim();
    const parts = str.split('@');
    if (parts.length !== 2 || !parts[0]) return '***@***';
    const local = parts[0];
    const keep = local.length <= 2 ? 1 : 2;
    return local.slice(0, keep) + '***@' + parts[1];
  }

  /**
   * ปกปิดบางส่วนของเบอร์โทรศัพท์ก่อนยืนยัน OTP ตาม PDPA
   */
  function maskPhone(phone) {
    const digits = String(phone || '').replace(/[^0-9]/g, '');
    if (digits.length < 6) return '***';
    return digits.slice(0, 3) + '-***-' + digits.slice(-4);
  }

  /**
   * แปลงชื่อสังกัด/เขตสุขภาพเป็นรหัสแผนที่ 13 เขตสุขภาพ (R1–R12, BKK, OTHER)
   */
  function resolveRegionId(department) {
    const d = String(department || '').trim();
    if (!d) return 'OTHER';
    if (d.includes('เขตสุขภาพที่ 13') || ['กรมการแพทย์', 'สำนักการแพทย์', 'สำนักอนามัย', 'กรุงเทพมหานคร', 'รพ.ราชวิถี'].some(function (k) { return d.includes(k); })) {
      return 'BKK';
    }
    const m = d.match(/เขตสุขภาพที่\s*(\d+)/);
    if (m) {
      const num = Number(m[1]);
      if (num >= 1 && num <= 12) return 'R' + num;
    }
    return 'OTHER';
  }

  /**
   * สร้างรหัสเอกสาร Telemetry แบบไม่ระบุตัวตน (One-Way FNV-1a Hash • Zero-PII)
   */
  function buildAnonTelemetryId(seedStr) {
    const input = 'rjcloud_pdpa_salt_2027::' + String(seedStr || 'anon');
    let hash = 2166136261;
    for (let i = 0; i < input.length; i++) {
      hash ^= input.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return 'ANON_' + (hash >>> 0).toString(16).toUpperCase().padStart(8, '0');
  }

  /**
   * สร้างก้อนข้อมูลสถิติสำหรับ Dashboard ผู้บริหาร 13 เขต (ตัดชื่อ อีเมล เบอร์โทร เลขใบอนุญาตออก 100%)
   */
  function buildExecutiveTelemetryPayload(userObj) {
    const u = userObj || {};
    const hist = Array.isArray(u.skillLabHistory) ? u.skillLabHistory : [];
    const latestHist = hist.length > 0 ? hist[hist.length - 1] : null;

    let radar = null;
    if (u.skillLabLatestRadar && typeof u.skillLabLatestRadar === 'object') {
      radar = u.skillLabLatestRadar;
    } else if (latestHist && Array.isArray(latestHist.radar) && latestHist.radar.length > 0) {
      radar = {};
      latestHist.radar.forEach(function (item) {
        if (item && item.key) radar[item.key] = Number(item.value || 0);
      });
    }

    const domains = Array.isArray(u.aiRoadmap && u.aiRoadmap.domains)
      ? u.aiRoadmap.domains.map(function (d) {
          return { id: d.id, percent: Number(d.percent || 0) };
        })
      : [];

    const bestScore =
      typeof u.skillLabBestScore === 'number'
        ? u.skillLabBestScore
        : hist.length > 0
          ? Math.max.apply(
              null,
              hist.map(function (h) {
                return Number(h.score || 0);
              })
            )
          : null;

    return {
      regionId: resolveRegionId(u.department || u.region),
      professionGroup: u.professionGroup || 'บุคลากรสหวิชาชีพ',
      status: u.status === 'ผ่าน' ? 'ผ่าน' : 'กำลังเรียน',
      progress: Number(u.progress || 0),
      hasLab: Boolean(u.skillLabPassed || hist.length > 0 || radar),
      skillLabBestScore: bestScore,
      radar: radar,
      domains: domains,
      satisfactionScore:
        typeof u.satisfactionScore === 'number' && u.satisfactionScore > 0 ? Number(u.satisfactionScore) : null,
      susScore: typeof u.susScore === 'number' && u.susScore >= 0 ? Number(u.susScore) : null,
      preSelfEfficacyAvg:
        typeof u.preSelfEfficacyAvg === 'number' && u.preSelfEfficacyAvg > 0 ? Number(u.preSelfEfficacyAvg) : null,
      postSelfEfficacyAvg:
        typeof u.postSelfEfficacyAvg === 'number' && u.postSelfEfficacyAvg > 0 ? Number(u.postSelfEfficacyAvg) : null,
      updatedAt: new Date().toISOString()
    };
  }

  // ============================================================================
  // 5. NATURAL THAI SPEECH POLISHER, ANTI-HISS WAV CONVERTER & AUDIO CACHE (v4)
  // ============================================================================
  const AUDIO_DB_NAME = 'rjcloud_lesson_audio_cache_v4';
  const AUDIO_STORE_NAME = 'clips';
  let audioDbPromise = null;

  /**
   * แปลงสัญลักษณ์และคำย่อทางการแพทย์ให้เป็นคำอ่านภาษาไทยที่เป็นธรรมชาติ ลื่นหู ไม่ติดขัดแบบหุ่นยนต์
   */
  function prepareNaturalThaiSpeech(rawText) {
    return String(rawText || '')
      .replace(/\[[^\]]+\]:?\s*/g, '')
      .replace(/≥/g, 'ไม่น้อยกว่า ')
      .replace(/≤/g, 'ไม่เกิน ')
      .replace(/°C/g, ' องศาเซลเซียส')
      .replace(/(\d+)\s*[–-]\s*(\d+)/g, '$1 ถึง $2')
      .replace(/GCS\s*=\s*(\d+)/gi, 'คะแนนจีซีเอสเท่ากับ $1')
      .replace(/\bODC\b/g, 'ศูนย์รับบริจาคอวัยวะสภากาชาดไทย')
      .replace(/\bTC\b/g, 'พยาบาลผู้ประสานงาน')
      .replace(/\bTBI\b/g, 'อุบัติเหตุทางศีรษะ')
      .replace(/\bDDAVP\b/g, 'ยาดีดีเอวีพี')
      .replace(/\bHLA\s*Typing\b/gi, 'การตรวจความเข้ากันได้ของเนื้อเยื่อ เอชแอลเอ')
      .replace(/\bEEG\b/g, 'การตรวจคลื่นไฟฟ้าสมอง')
      .replace(/\bECMO\b/g, 'เครื่องเอ็กโม')
      .replace(/\bICU\b/g, 'ไอซียู')
      .replace(/\bER\b/g, 'ห้องฉุกเฉิน')
      .replace(/\bOR\b/g, 'ห้องผ่าตัด')
      .replace(/\bDCD\b/g, 'การบริจาคหลังหัวใจหยุดเต้น')
      .replace(/\bB\.A\.L\.I\.\b/gi, 'หลักบาลี')
      .replace(/\bSPIKES\b/gi, 'หลักสไปค์ส')
      .replace(/\bCNEU\b/g, 'หน่วยคะแนนซีเอ็นอียู')
      .replace(/\bPDPA\b/g, 'พีดีพีเอ')
      .replace(/\bHIV\b/g, 'เอชไอวี')
      .replace(/\bNSAIDs\b/gi, 'ยาแก้ปวดกลุ่มเอ็นเสด')
      .replace(/ชม\./g, 'ชั่วโมง')
      .replace(/รพ\./g, 'โรงพยาบาล')
      .replace(/สธ\./g, 'กระทรวงสาธารณสุข')
      .replace(/\s*•\s*/g, ', ')
      .replace(/[()*"#_]/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  /**
   * คัดเลือกเสียงพูดภาษาไทยหรืออังกฤษที่ลื่นหูที่สุดในอุปกรณ์ (กรณี fallback ไปใช้ speechSynthesis)
   */
  function pickNaturalBrowserVoice(lang) {
    if (!('speechSynthesis' in global)) return null;
    try {
      const voices = global.speechSynthesis.getVoices() || [];
      const prefix = lang === 'en' ? 'en' : 'th';
      const matches = voices.filter(function (v) {
        return String(v.lang || '').toLowerCase().startsWith(prefix);
      });
      if (matches.length === 0) return null;
      const preferred = matches.find(function (v) {
        return /premwadee|kanya|google|natural|samantha|aria|narisa/i.test(v.name || '');
      });
      return preferred || matches[0];
    } catch (_) {
      return null;
    }
  }

  /**
   * แปลงเสียง Base64 PCM16 หรือ WAV จาก Gemini TTS เป็นไฟล์ WAV สะอาด 100%
   * - หากต้นทางเป็นไฟล์ RIFF/WAVE จะอ่านเฉพาะช่วงไบต์ของก้อน 'data' เท่านั้น (ตัด Metadata ท้ายไฟล์ทิ้งทั้งหมด)
   * - เสริมระบบ DSP ตัดเสียงซ่าท้ายคลิป (Anti-Hiss) + Smooth Cosine Fade-out + เติมความเงียบ 45ms
   */
  function pcm16ToWavBlob(base64PCM, sampleRate) {
    let rate = sampleRate || 24000;
    const binaryString = global.atob(base64PCM);
    const rawBytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      rawBytes[i] = binaryString.charCodeAt(i);
    }

    let offsetBytes = 0;
    let byteLength = rawBytes.length;
    if (
      rawBytes.length >= 44 &&
      rawBytes[0] === 0x52 &&
      rawBytes[1] === 0x49 &&
      rawBytes[2] === 0x46 &&
      rawBytes[3] === 0x46 &&
      rawBytes[8] === 0x57 &&
      rawBytes[9] === 0x41 &&
      rawBytes[10] === 0x56 &&
      rawBytes[11] === 0x45
    ) {
      const hdrView = new DataView(rawBytes.buffer, rawBytes.byteOffset, rawBytes.byteLength);
      let pos = 12;
      let foundData = false;
      while (pos + 8 <= rawBytes.length) {
        const chunkId = String.fromCharCode(
          rawBytes[pos],
          rawBytes[pos + 1],
          rawBytes[pos + 2],
          rawBytes[pos + 3]
        );
        const chunkSize = hdrView.getUint32(pos + 4, true);
        if (chunkId === 'fmt ' && pos + 16 <= rawBytes.length) {
          const wavRate = hdrView.getUint32(pos + 12, true);
          if (wavRate >= 8000 && wavRate <= 96000) rate = wavRate;
        } else if (chunkId === 'data') {
          offsetBytes = pos + 8;
          byteLength = Math.min(chunkSize, rawBytes.length - offsetBytes);
          foundData = true;
          break;
        }
        const step = 8 + chunkSize + (chunkSize % 2);
        if (step <= 8) break;
        pos += step;
      }
      if (!foundData) {
        offsetBytes = 44;
        byteLength = Math.max(0, rawBytes.length - 44);
      }
    }

    const sampleCount = Math.floor(byteLength / 2);
    if (sampleCount <= 0) return new Blob([], { type: 'audio/wav' });

    const inView = new DataView(rawBytes.buffer, rawBytes.byteOffset + offsetBytes, sampleCount * 2);
    const samples = new Float32Array(sampleCount);
    for (let i = 0; i < sampleCount; i++) {
      samples[i] = inView.getInt16(i * 2, true) / 32768;
    }

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
    const padZeroSamples = Math.round(rate * 0.045);
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
   * เปิดฐานข้อมูล IndexedDB สำหรับแคชเสียงบรรยายสรุปบทเรียน AI (เวอร์ชัน v4 ไร้เสียงซ่า)
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

    prepareNaturalThaiSpeech: prepareNaturalThaiSpeech,
    pickNaturalBrowserVoice: pickNaturalBrowserVoice,
    pcm16ToWavBlob: pcm16ToWavBlob,
    openAudioCacheDb: openAudioCacheDb,
    getCachedAudio: getCachedAudio,
    setCachedAudio: setCachedAudio
  };
})(window);
