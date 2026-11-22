/* ============================================================================
 * rjcloud.organ 2.0 — Core Learning, AI Diagnosis, PDPA & Audio Engine (learning-core.js)
 * ชื่อธีมอย่างเป็นทางการ: rjcloud.organ 2.0 (Atmospheric Horizon + Liquid Glass)
 * ไฟล์โมดูลกลาง (Zero-Build) เผยแพร่ผ่าน window.RJCLOUD_CORE
 *
 * โครงสร้างภายในไฟล์:
 * 1. Configuration & Built-in Fallback Defaults (ธีม rjcloud.organ 2.0 + ค่าสำรองครบชุด)
 * 2. Exam Parser & 4-Domain AI Diagnostic Roadmap Engine
 * 3. Role-Adaptive Profile, Study Timer & Thai Date Formatters
 * 4. PDPA Privacy Masking (Pre-OTP) & Zero-PII Executive Telemetry Builder
 * 5. Natural Thai Speech Polisher, Anti-Hiss WAV Converter & IndexedDB Cache (v3)
 * ============================================================================ */

(function (global) {
  'use strict';

  // ============================================================================
  // 1. CONFIGURATION & BUILT-IN FALLBACK DEFAULTS (RJCLOUD.ORGAN 2.0)
  // ============================================================================
  const BUILTIN_CONFIG = {
    appName: 'rjcloud.organ',
    themeName: 'rjcloud.organ 2.0',
    edition: 'rjcloud.organ 2.0 • Cloud AI (2027)',
    taglineEN: 'e-Learning Organ Donation Training',
    contactEmail: 'rjcloud.organ@gmail.com',
    appId: 'rjcloud-organ-2027',
    heroBannerUrl:
      'https://res.cloudinary.com/djwclucoz/image/upload/v1795227615/%E0%B8%94%E0%B8%B5%E0%B9%84%E0%B8%8B%E0%B8%99%E0%B9%8C%E0%B8%97%E0%B8%B5%E0%B9%88%E0%B8%A2%E0%B8%B1%E0%B8%87%E0%B9%84%E0%B8%A1%E0%B9%88%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%95%E0%B8%B1%E0%B9%89%E0%B8%87%E0%B8%8A%E0%B8%B7%E0%B9%88%E0%B8%AD_geidhl.png',
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
   * รวมค่าตั้งค่าจาก data.js (window.RJCLOUD_CONFIG) กับค่าสำรองมาตรฐาน rjcloud.organ 2.0
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
    orgName: 'ศูนย์ความเป็นเลิศทางการแพทย์ด้านการรับบริจาคและปลูกถ่ายอวัยวะ โรงพยาบาลราชวิถี',
    courseName: 'หลักสูตรการพยาบาลและการประสานงานการรับบริจาคและปลูกถ่ายอวัยวะ (rjcloud.organ)',
    activityCode: 'CNEU-2027-0148',
    batchLabel: 'รุ่นที่ 1 ประจำปีงบประมาณ 2570',
    cneuCredits: '8.0',
    dateRange: '1 – 31 มกราคม 2570',
    criteriaText: 'ยืนยันตัวตน OTP + เรียน ≥ 80% + AI Skill Lab + Post-test ≥ 80%',
    coordinatorName: 'พว.ผู้ประสานงานโครงการ (ศูนย์รับบริจาคอวัยวะ)',
    coordinatorContact: 'rjcloud.organ@gmail.com',
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
        'ทบทวนเกณฑ์ GCS=3, การตรวจทางคลินิก 2 ครั้งห่างกันอย่างน้อย 6 ชม. โดยแพทย์ 3 ท่าน, Apnea Test, Lazarus Sign และ DDAVP'
    },
    procurement_transplant: {
      id: 'procurement_transplant',
      nameTH: 'การจัดเก็บ ขนส่ง และดูแลผู้ป่วยปลูกถ่ายอวัยวะ',
      shortName: 'จัดเก็บ & ปลูกถ่าย',
      color: '#a78bfa',
      lessonIds: [2, 6, 10, 14, 15, 16, 17, 18, 19, 20],
      remediationGuide:
        'ทบทวนระยะเวลาทองของหัวใจ (ไม่เกิน 4 ชม.), ดวงตา (6–8 ชม.), อุณหภูมิบรรจุไต (2–4°C), HLA Typing และการตกแต่งร่างผู้บริจาค'
    },
    family_communication: {
      id: 'family_communication',
      nameTH: 'การสื่อสารและให้ข้อมูลญาติผู้เสียชีวิต',
      shortName: 'สื่อสารกับญาติ',
      color: '#fbbf24',
      lessonIds: [11],
      remediationGuide:
        'ทบทวนหลัก Decoupling, หลัก SPIKES (Setting), หลัก B.A.L.I., การตอบคำถามความเชื่อ และการดูแลจิตใจญาติ (Bereavement Care)'
    }
  };

  const HOSPITAL_MAPPING = global.HOSPITAL_MAPPING || {
    'เขตสุขภาพที่ 1': [{ name: 'รพ.มหาราชนครเชียงใหม่', prov: 'เชียงใหม่' }],
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
    'สำนักการแพทย์ กรุงเทพฯ': [
      { name: 'รพ.กลาง', prov: 'กรุงเทพมหานคร' },
      { name: 'รพ.ตากสิน', prov: 'กรุงเทพมหานคร' }
    ],
    'สำนักอนามัย กรุงเทพฯ': [{ name: 'ศูนย์บริการสาธารณสุข', prov: 'กรุงเทพมหานคร' }],
    'อื่นๆ': [{ name: 'อื่นๆ', prov: '' }]
  };

  const FALLBACK_LESSONS =
    Array.isArray(global.INITIAL_LESSONS) && global.INITIAL_LESSONS.length > 0
      ? global.INITIAL_LESSONS
      : [
          {
            id: 1,
            domain: 'policy_ethics',
            title: 'ยุทธศาสตร์และเป้าหมายการพัฒนาระบบบริการสุขภาพ (Service plan)',
            videoId: '1-sX4LnWRMSjoEQmWee-9GuiQ2XMvkSro',
            documentUrl: ''
          }
        ];

  const FALLBACK_QUIZ_RAW =
    Array.isArray(global.QUIZ_QUESTIONS_RAW) && global.QUIZ_QUESTIONS_RAW.length > 0
      ? global.QUIZ_QUESTIONS_RAW
      : [
          'การทำ Decoupling หมายถึงการแยกเรื่องใดออกจากเรื่องใด?|แยกการทำงานของหัวใจออกจากปอด|แยกหมอออกจากพยาบาล|แยกการแจ้งข่าวสมองตาย ออกจากการเจรจาขอรับบริจาคอวัยวะ|แยกญาติผู้ชายออกจากญาติผู้หญิง|2',
          'การบรรจุไตเพื่อขนส่ง (Kidney Packaging) ต้องรักษาอุณหภูมิให้อยู่ในช่วงใด?|แช่แข็งในน้ำแข็งแห้ง (-20°C)|อุณหภูมิห้อง (25°C)|2-4 องศาเซลเซียส (แช่ในน้ำแข็งเกล็ดที่กำลังละลาย)|แช่ในน้ำอุ่น (37°C)|2'
        ];

  const ROLE_ADAPTIVE_PROFILES = global.ROLE_ADAPTIVE_PROFILES || {
    donor_team: {
      id: 'donor_team',
      badgeTH: 'มุมมองทีมรับบริจาค / TC',
      focusSummary: 'เน้นการประสานงาน ODC, หลักการสื่อสาร Decoupling & SPIKES และจริยธรรมวิชาชีพ',
      aiPromptAddon:
        'ผู้เรียนปฏิบัติงานด้านรับบริจาค/ปลูกถ่ายอวัยวะ (TC) โดยตรง ให้เน้นมุมมองการประสานงานทีมสหสาขาวิชาชีพ การสื่อสารกับครอบครัว และความถูกต้องตามเกณฑ์ ODC'
    },
    icu_er_or: {
      id: 'icu_er_or',
      badgeTH: 'มุมมอง ICU / ER / OR',
      focusSummary: 'เน้นคัดกรอง Potential Donor (GCS=3), การคุมสัญญาณชีพ (DDAVP) และ Cold Chain 2–4°C',
      aiPromptAddon:
        'ผู้เรียนปฏิบัติงานหอผู้ป่วยวิกฤต (ICU) ห้องฉุกเฉิน (ER) หรือห้องผ่าตัด (OR) ให้เน้นประเด็นหน้างานคลินิก การเฝ้าระวังสัญญาณชีพ ภาวะเบาจืด และมาตรฐานจัดเก็บ/ขนส่งอวัยวะ'
    },
    general: {
      id: 'general',
      badgeTH: 'มุมมองผู้สนใจศึกษาทั่วไป',
      focusSummary: 'อธิบายศัพท์แพทย์และเกณฑ์ทางคลินิกด้วยภาษาที่เข้าใจง่าย เป็นมิตร',
      aiPromptAddon:
        'ผู้เรียนไม่ได้ปฏิบัติงานด้านนี้โดยตรง ให้เริ่มต้นอธิบายศัพท์การแพทย์อย่างเข้าใจง่าย กระชับ เป็นมิตร ก่อนเชื่อมโยงสู่มาตรฐานวิชาชีพ'
    }
  };

  const CLINICAL_CASE_SIMULATIONS = Array.isArray(global.CLINICAL_CASE_SIMULATIONS)
    ? global.CLINICAL_CASE_SIMULATIONS
    : [];

  const SPACED_FLASHCARDS = Array.isArray(global.SPACED_FLASHCARDS)
    ? global.SPACED_FLASHCARDS
    : [];

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
      desc: 'ครอบคลุมเกณฑ์สมองตาย Donor Management และการจัดเก็บอวัยวะ'
    },
    {
      key: 'speaker',
      title: '2. คุณภาพสื่อวิดีโอ เอกสารประกอบ และการถ่ายทอดของวิทยากร',
      desc: 'ความชัดเจนในการอธิบายและลำดับบทเรียน'
    },
    {
      key: 'platform',
      title: '3. ความสะดวกและความเสถียรของระบบเรียนออนไลน์ (rjcloud.organ)',
      desc: 'OTP, แบบทดสอบ และการใช้งานบนมือถือ/คอมพิวเตอร์'
    },
    {
      key: 'aiLab',
      title: '4. ประโยชน์ของระบบผู้ช่วย AI และห้องฝึกสื่อสาร 3 มิติ (AI Skill Lab)',
      desc: 'AI Study Companion และห้องฝึกสื่อสารกับญาติ'
    },
    {
      key: 'application',
      title: '5. ความมั่นใจในการนำความรู้และทักษะไปประยุกต์ใช้ในงานจริง',
      desc: 'สามารถนำไปปรับใช้ในหน่วยงานได้จริง'
    }
  ];

  // ============================================================================
  // 2. EXAM PARSER & 4-DOMAIN AI DIAGNOSTIC ROADMAP ENGINE
  // ============================================================================

  /**
   * แปลงสตริงคลังข้อสอบรูปแบบ "คำถาม|ตัวเลือก 0|...|ดัชนีเฉลย" เป็นอาร์เรย์อ็อบเจกต์มาตรฐาน
   */
  function parseRawExams(raw) {
    if (!Array.isArray(raw)) return [];
    const domainMap = Array.isArray(global.QUESTION_DOMAIN_MAP) ? global.QUESTION_DOMAIN_MAP : [];
    return raw.map(function (str, idx) {
      const parts = String(str || '')
        .split('|')
        .map(function (s) {
          return s.trim();
        });
      const question = (parts[0] || '').replace(/^[0-9]+\.\s*/, '');
      const options = parts.slice(1, Math.max(2, parts.length - 1));
      const answerRaw = parts[parts.length - 1] || '0';
      const answer = parseInt(String(answerRaw).replace(/[^0-9]/g, ''), 10) || 0;
      return {
        id: idx + 1,
        origIdx: idx,
        domain: domainMap[idx] || 'policy_ethics',
        question: question,
        options: options,
        answer: Math.max(0, Math.min(Math.max(0, options.length - 1), answer))
      };
    });
  }

  /**
   * ปรับโครงสร้างชุดข้อสอบจาก Firestore (รองรับทั้ง Array และ Object Map) ให้เป็น Array เสมอ
   */
  function normalizeQuestionSets(rawSets) {
    if (!rawSets) return [parseRawExams(FALLBACK_QUIZ_RAW)];
    if (Array.isArray(rawSets) && rawSets.length > 0) return rawSets;
    if (typeof rawSets === 'object') {
      const keys = Object.keys(rawSets).sort(function (a, b) {
        return Number(a) - Number(b);
      });
      const out = keys
        .map(function (k) {
          return Array.isArray(rawSets[k]) ? rawSets[k] : [];
        })
        .filter(function (arr) {
          return arr.length > 0;
        });
      if (out.length > 0) return out;
    }
    return [parseRawExams(FALLBACK_QUIZ_RAW)];
  }

  /**
   * วิเคราะห์คะแนนแยก 4 หมวดคลินิก (AI Diagnostic Roadmap) และแนะนำรหัสบทเรียนที่ควรทบทวน
   */
  function computeDomainDiagnosis(questions, answers, passThreshold) {
    const threshold = typeof passThreshold === 'number' ? passThreshold : 80;
    const list = Array.isArray(questions) ? questions : [];
    const ansMap = answers || {};
    const stats = {};

    Object.keys(CLINICAL_DOMAINS).forEach(function (domId) {
      stats[domId] = { correct: 0, total: 0 };
    });

    list.forEach(function (q, idx) {
      const domId = stats[q && q.domain] ? q.domain : 'policy_ethics';
      stats[domId].total += 1;
      if (ansMap[idx] === q.answer) {
        stats[domId].correct += 1;
      }
    });

    const domains = Object.keys(CLINICAL_DOMAINS).map(function (domId) {
      const meta = CLINICAL_DOMAINS[domId];
      const s = stats[domId];
      const percent = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 100;
      return {
        ...meta,
        correct: s.correct,
        total: s.total,
        percent: percent
      };
    });

    const weakDomains = domains
      .filter(function (d) {
        return d.total > 0 && d.percent < threshold;
      })
      .sort(function (a, b) {
        return a.percent - b.percent;
      });

    const recSet = {};
    const recommendedLessonIds = [];
    weakDomains.forEach(function (wd) {
      (wd.lessonIds || []).forEach(function (lid) {
        if (!recSet[lid]) {
          recSet[lid] = true;
          recommendedLessonIds.push(lid);
        }
      });
    });

    if (recommendedLessonIds.length === 0) {
      recommendedLessonIds.push(11, 12);
    }

    let summaryText = '';
    if (weakDomains.length === 0) {
      summaryText =
        'ยอดเยี่ยมมากค่ะ! พื้นฐานของคุณผ่านเกณฑ์ครบทั้ง 4 หมวดคลินิก แนะนำทบทวนบทเรียนไฮไลต์และเข้าฝึกสื่อสารในห้อง AI Skill Lab 3 มิติได้เลยค่ะ';
    } else {
      const names = weakDomains
        .map(function (d) {
          return d.shortName + ' (' + d.percent + '%)';
        })
        .join(', ');
      summaryText =
        'AI แนะนำให้เน้นทบทวนหมวดที่ยังไม่ถึงเกณฑ์ ' +
        threshold +
        '% ได้แก่ ' +
        names +
        ' โดยระบบติดดาว ★ ไว้บนบทเรียนที่เกี่ยวข้องให้แล้วค่ะ';
    }

    return {
      domains: domains,
      weakDomains: weakDomains,
      recommendedLessonIds: recommendedLessonIds,
      summaryText: summaryText
    };
  }

  /**
   * คำนวณร้อยละคะแนนสอบ Post-test จากสตริงเช่น "36/40"
   */
  function parsePosttestPercent(user) {
    const cfg = getResolvedConfig();
    const minPass = Number((cfg.learningRules && cfg.learningRules.minPosttestPercent) || 80);
    const match = String((user && user.posttest) || '').match(/(\d+)\s*\/\s*(\d+)/);
    if (!match) return user && user.status === 'ผ่าน' ? minPass : 0;
    const score = parseInt(match[1], 10) || 0;
    const total = parseInt(match[2], 10) || 1;
    return Math.round((score / total) * 100);
  }

  // ============================================================================
  // 3. ROLE-ADAPTIVE PROFILE, STUDY TIMER & THAI DATE FORMATTERS
  // ============================================================================

  /**
   * เลือกโปรไฟล์คำแนะนำ AI ให้เหมาะกับลักษณะงาน/แผนกของผู้เรียน
   */
  function resolveRoleProfile(user) {
    const ctx = String((user && (user.workContext || user.position)) || '').toLowerCase();
    if (ctx.includes('tc') || ctx.includes('รับบริจาค') || ctx.includes('ปลูกถ่าย') || ctx.includes('ประสานงาน')) {
      return ROLE_ADAPTIVE_PROFILES.donor_team;
    }
    if (ctx.includes('icu') || ctx.includes('er') || ctx.includes('or') || ctx.includes('วิกฤต') || ctx.includes('ฉุกเฉิน') || ctx.includes('ผ่าตัด') || ctx.includes('พยาบาล')) {
      return ROLE_ADAPTIVE_PROFILES.icu_er_or;
    }
    return ROLE_ADAPTIVE_PROFILES.general;
  }

  /**
   * คำนวณชั่วโมงเป้าหมายการเรียนตามประเภทผู้เรียน (เรียนใหม่ vs เรียนต่อเนื่อง)
   */
  function getTargetHoursForUser(user, liveConfig) {
    const baseHours = Math.max(1, Number((liveConfig && liveConfig.hours) || 8));
    if (user && user.userType === 'เรียนต่อเนื่อง') {
      return Math.max(2, Math.round(baseHours * 0.75));
    }
    return baseHours;
  }

  /**
   * จัดรูปแบบวินาทีสะสมการเรียนเป็นข้อความภาษาไทยอ่านง่าย
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
   * แปลงวันที่ ISO เป็นวันที่ภาษาไทยแบบเต็ม (เช่น 12 มกราคม 2570)
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
   * ปกปิดอีเมลบางส่วนตามหลัก PDPA ก่อนยืนยันตัวตน OTP (เช่น ji••••@gmail.com)
   */
  function maskEmail(email) {
    const clean = String(email || '').trim();
    if (!clean) return '';
    if (!clean.includes('@')) return '••••••';
    const parts = clean.split('@');
    const local = parts[0] || '';
    const domain = parts[1] || '';
    const keep = Math.min(2, local.length);
    return local.slice(0, keep) + '••••@' + domain;
  }

  /**
   * ปกปิดเบอร์โทรศัพท์บางส่วนตามหลัก PDPA (เช่น 085••••000)
   */
  function maskPhone(phone) {
    const digits = String(phone || '').replace(/[^0-9]/g, '');
    if (!digits) return '';
    if (digits.length <= 5) return '•••••';
    return digits.slice(0, 3) + '••••' + digits.slice(-3);
  }

  /**
   * แปลงชื่อสังกัด/เขตสุขภาพเป็นรหัสพื้นที่มาตรฐาน 13 เขต (R1–R12, BKK, OTHER)
   */
  function resolveRegionId(department) {
    const d = String(department || '').trim();
    if (d.startsWith('เขตสุขภาพที่')) {
      const num = d.replace(/[^0-9]/g, '');
      if (num && Number(num) >= 1 && Number(num) <= 12) return 'R' + num;
    }
    if (
      ['กรมการแพทย์', 'สำนักการแพทย์ กรุงเทพฯ', 'สำนักอนามัย กรุงเทพฯ', 'กรุงเทพมหานคร'].some(function (k) {
        return d.includes(k);
      })
    ) {
      return 'BKK';
    }
    return 'OTHER';
  }

  /**
   * สร้างรหัสไม่ระบุตัวตน (One-Way FNV-1a Hash) สำหรับคอลเลกชันสถิติผู้บริหาร (Zero-PII)
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
   * สร้างก้อนข้อมูลสถิติสำหรับ Dashboard ผู้บริหารโดยตัดข้อมูลส่วนบุคคลออก 100%
   */
  function buildExecutiveTelemetryPayload(user) {
    const u = user || {};
    return {
      regionId: resolveRegionId(u.department),
      department: u.department || '',
      status: u.status === 'ผ่าน' ? 'ผ่าน' : 'กำลังเรียน',
      progress: Number(u.progress || 0),
      hasLab: Boolean(u.skillLabPassed || (Array.isArray(u.skillLabHistory) && u.skillLabHistory.length > 0)),
      skillLabBestScore: typeof u.skillLabBestScore === 'number' ? u.skillLabBestScore : null,
      radar: u.skillLabLatestRadar || null,
      domains: Array.isArray(u.aiRoadmap && u.aiRoadmap.domains)
        ? u.aiRoadmap.domains.map(function (d) {
            return { id: d.id, percent: Number(d.percent || 0) };
          })
        : [],
      satisfactionScore: typeof u.satisfactionScore === 'number' ? u.satisfactionScore : null,
      updatedAt: new Date().toISOString()
    };
  }

  // ============================================================================
  // 5. NATURAL THAI SPEECH POLISHER, ANTI-HISS WAV CONVERTER & AUDIO CACHE (v3)
  // ============================================================================
  const AUDIO_DB_NAME = 'rjcloud_lesson_audio_cache_v3';
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
   * แปลงเสียง Base64 PCM16 จาก Gemini TTS เป็นไฟล์ WAV พร้อมระบบ DSP ตัดเสียงซ่าท้ายคลิป (Anti-Hiss)
   * และทำ Smooth Cosine Fade-out + เติมความเงียบ 45ms ป้องกันเสียงซ่าและเสียงแป๊ะตอนจบคำพูด
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
   * เปิดฐานข้อมูล IndexedDB สำหรับแคชเสียงบรรยายสรุปบทเรียน AI (เวอร์ชัน v3 ไร้เสียงซ่า)
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

    prepareNaturalThaiSpeech: prepareNaturalThaiSpeech,
    pickNaturalBrowserVoice: pickNaturalBrowserVoice,
    pcm16ToWavBlob: pcm16ToWavBlob,
    openAudioCacheDb: openAudioCacheDb,
    getCachedAudio: getCachedAudio,
    setCachedAudio: setCachedAudio
  };
})(window);
