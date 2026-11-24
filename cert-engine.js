/* ============================================================================
 * rjcloud.organ 2.0 — Certificate, Real QR Code & Profession-Aware Credit Engine
 * ไฟล์ที่ 1/5 (cert-engine.js • Zero-Build Standalone Module)
 *
 * นโยบายความเท่าเทียมและความถูกต้องตามสภาวิชาชีพ (Profession-Aware Equal Honor):
 * 1. มาตรฐานและเกียรติเท่าเทียมกัน 100% ทุกกลุ่มการเรียน (ไม่ระบุแยกผู้เรียนใหม่/ต่อเนื่อง/Onsite)
 * 2. คัดกรองหน่วยคะแนน CNEU เฉพาะกลุ่มวิชาชีพ "พยาบาล" (สภาการพยาบาล) เท่านั้น:
 *    - พยาบาล          -> แสดงรหัสกิจกรรม CNEU + หน่วยคะแนนบนใบประกาศฯ และทะเบียนสาธารณะ
 *    - แพทย์           -> ไม่แสดงคำว่า CNEU แสดงชั่วโมงการฝึกอบรมวิชาการมาตรฐาน (หรือ CME หากระบุ)
 *    - บุคลากรสหวิชาชีพ -> ไม่แสดงคำว่า CNEU แสดงชั่วโมงการพัฒนาสมรรถนะวิชาชีพมาตรฐาน
 * 3. คุ้มครอง PDPA 100%: ไม่เก็บอีเมลและเบอร์โทรศัพท์ในทะเบียนสาธารณะ certificates/{code}
 *
 * โครงสร้างภายในไฟล์ (เผยแพร่ผ่าน window.RJCLOUD_CERT):
 * 1. Profession & CNEU Eligibility Resolvers (Backward-Compatible กับข้อมูลผู้เรียนเก่า)
 * 2. Safe Image Loader, Font Ready Guard, Verify URL Builder & Thai Date Formatter
 * 3. Pixel-Perfect Real QR Code Canvas Renderer (qrcode-generator + Fallback)
 * 4. Apple-Minimalist Certificate Canvas Renderer (1600x1131 px • A4 Landscape)
 * 5. Profession-Aware Public Certificate Registry Payload Builder (PDPA-Safe)
 * 6. PNG / PDF Exporters & Individual A4 Certification Letter Print Controller
 * ============================================================================ */

(function (global) {
  'use strict';

  const FALLBACK_TEMPLATE = {
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
  };

  // ============================================================================
  // 1. PROFESSION & CNEU ELIGIBILITY RESOLVERS (BACKWARD-COMPATIBLE)
  // ============================================================================

  /**
   * วิเคราะห์กลุ่มวิชาชีพของผู้เรียนเป็น 3 กลุ่มมาตรฐาน: 'พยาบาล' | 'แพทย์' | 'บุคลากรสหวิชาชีพ'
   * - อ่านจากฟิลด์ professionGroup ก่อนเป็นอันดับแรก
   * - หากเป็นบัญชีเก่าที่ยังไม่มี professionGroup จะตรวจจับอัตโนมัติจากคำนำหน้าชื่อและตำแหน่ง
   */
  function resolveProfessionGroup(userObj) {
    const u = userObj || {};
    const explicit = String(u.professionGroup || '').trim();
    if (explicit === 'พยาบาล' || explicit === 'แพทย์' || explicit === 'บุคลากรสหวิชาชีพ') {
      return explicit;
    }

    const combined = (String(u.name || '') + ' ' + String(u.position || '')).trim();
    const lower = combined.toLowerCase();

    // ตรวจจับกลุ่มแพทย์ (นพ., พญ., แพทย์, Doctor, Physician, MD)
    if (
      /(นพ\.|พญ\.|แพทย์|ศ\.นพ\.|รศ\.นพ\.|ผศ\.นพ\.|หมอ|doctor|physician|\bm\.?d\.?\b)/i.test(combined) &&
      !/(พยาบาล|ผู้ช่วยแพทย์)/i.test(combined)
    ) {
      return 'แพทย์';
    }

    // ตรวจจับกลุ่มพยาบาล (พว., พยาบาล, Nurse, RN)
    if (/(พว\.|พยาบาล|nurse|\brn\b)/i.test(combined)) {
      return 'พยาบาล';
    }

    // ตรวจจับกลุ่มสหวิชาชีพชัดเจน (เภสัชกร, เทคนิคการแพทย์, สังคมสงเคราะห์, นักวิชาการ ฯลฯ)
    if (/(ภก\.|ภญ\.|ทนพ\.|ทพ\.|ทพญ\.|เภสัช|เทคนิคการแพทย์|สังคมสงเคราะห์|นักวิชาการ|รังสี|กายภาพ|เจ้าหน้าที่)/i.test(lower)) {
      return 'บุคลากรสหวิชาชีพ';
    }

    // ค่าเริ่มต้นสำหรับบุคลากรทั่วไปที่ยังไม่ได้ระบุ
    return 'บุคลากรสหวิชาชีพ';
  }

  /**
   * ตรวจสอบสิทธิ์การรับหน่วยคะแนน CNEU (เฉพาะพยาบาลวิชาชีพเท่านั้น)
   */
  function isNurseCneuEligible(userObj) {
    const u = userObj || {};
    if (typeof u.cneuEligible === 'boolean') {
      return u.cneuEligible;
    }
    return resolveProfessionGroup(u) === 'พยาบาล';
  }

  /**
   * สร้างข้อมูลหน่วยคะแนน/ชั่วโมงอบรมและข้อความรับรองให้ตรงตามกลุ่มวิชาชีพของแต่ละบุคคล
   * - พยาบาล: แสดงรหัสกิจกรรม CNEU + หน่วยคะแนน (สภาการพยาบาล)
   * - แพทย์: ไม่มีคำว่า CNEU แสดงชั่วโมงการฝึกอบรมวิชาการมาตรฐาน (หรือ CME หากผู้จัดกรอกไว้)
   * - บุคลากรสหวิชาชีพ: ไม่มีคำว่า CNEU แสดงชั่วโมงการพัฒนาสมรรถนะวิชาชีพมาตรฐาน
   */
  function getCertificateCreditMeta(userObj, tplInput, cneuInput) {
    const u = userObj || {};
    const tpl = tplInput || {};
    const cneu = cneuInput || {};
    const professionGroup = resolveProfessionGroup(u);
    const isNurseCneu = isNurseCneuEligible(u);

    const trainingHours = String(
      cneu.trainingHours || tpl.trainingHours || u.trainingHours || FALLBACK_TEMPLATE.trainingHours
    ).trim() || '8';

    const rawCneuCode = String(cneu.activityCode || tpl.cneuActivityCode || u.cneuActivityCode || '').trim();
    const rawCneuCredits = String(cneu.cneuCredits || tpl.cneuCredits || u.cneuCredits || '').trim();
    const rawCmeCode = String(cneu.cmeActivityCode || tpl.cmeActivityCode || u.cmeActivityCode || '').trim();
    const rawCmeCredits = String(cneu.cmeCredits || tpl.cmeCredits || u.cmeCredits || '').trim();

    if (isNurseCneu) {
      const hasCneu = Boolean(rawCneuCode || rawCneuCredits);
      const lineTextTH = hasCneu
        ? [
            rawCneuCode ? 'รหัสกิจกรรม CNEU: ' + rawCneuCode : '',
            rawCneuCredits ? 'จำนวน ' + rawCneuCredits + ' หน่วยคะแนน' : ''
          ].filter(Boolean).join('   •   ')
        : 'จำนวน ' + trainingHours + ' ชั่วโมงการฝึกอบรมมาตรฐานวิชาชีพ';

      return {
        professionGroup: 'พยาบาล',
        isNurseCneu: true,
        creditType: 'CNEU',
        badgeLabelTH: 'หน่วยคะแนนการศึกษาต่อเนื่อง (CNEU • สภาการพยาบาล)',
        letterHeadingTH: 'หนังสือรับรองการสำเร็จการอบรมและหน่วยคะแนนการศึกษาต่อเนื่อง (CNEU)',
        licenseLabelTH: 'เลขที่ใบอนุญาตประกอบวิชาชีพการพยาบาล',
        lineTextTH: lineTextTH,
        trainingHours: trainingHours,
        cneuActivityCode: rawCneuCode,
        cneuCredits: rawCneuCredits,
        cmeActivityCode: '',
        cmeCredits: ''
      };
    }

    if (professionGroup === 'แพทย์') {
      const hasCme = Boolean(rawCmeCode || rawCmeCredits);
      const lineTextTH = hasCme
        ? [
            rawCmeCode ? 'รหัสกิจกรรม CME: ' + rawCmeCode : '',
            rawCmeCredits ? 'จำนวน ' + rawCmeCredits + ' หน่วยคะแนน' : ''
          ].filter(Boolean).join('   •   ')
        : 'จำนวน ' + trainingHours + ' ชั่วโมงการฝึกอบรมวิชาการทางการแพทย์';

      return {
        professionGroup: 'แพทย์',
        isNurseCneu: false,
        creditType: hasCme ? 'CME' : 'HOURS',
        badgeLabelTH: hasCme ? 'หน่วยคะแนนการศึกษาต่อเนื่องแพทย์ (CME)' : 'ชั่วโมงการฝึกอบรมวิชาการทางการแพทย์',
        letterHeadingTH: 'หนังสือรับรองการสำเร็จการอบรมและชั่วโมงการฝึกอบรมวิชาการ',
        licenseLabelTH: 'เลขที่ใบอนุญาตประกอบวิชาชีพเวชกรรม',
        lineTextTH: lineTextTH,
        trainingHours: trainingHours,
        cneuActivityCode: '',
        cneuCredits: '',
        cmeActivityCode: rawCmeCode,
        cmeCredits: rawCmeCredits
      };
    }

    return {
      professionGroup: 'บุคลากรสหวิชาชีพ',
      isNurseCneu: false,
      creditType: 'HOURS',
      badgeLabelTH: 'ชั่วโมงการพัฒนาสมรรถนะบุคลากรทางการแพทย์',
      letterHeadingTH: 'หนังสือรับรองการสำเร็จการอบรมและชั่วโมงพัฒนาบุคลากร',
      licenseLabelTH: 'เลขที่ใบอนุญาตวิชาชีพ / รหัสประจำตัวบุคลากร',
      lineTextTH: 'จำนวน ' + trainingHours + ' ชั่วโมงการพัฒนาสมรรถนะวิชาชีพ',
      trainingHours: trainingHours,
      cneuActivityCode: '',
      cneuCredits: '',
      cmeActivityCode: '',
      cmeCredits: ''
    };
  }

  // ============================================================================
  // 2. SAFE IMAGE LOADER, FONT READY GUARD, VERIFY URL & THAI DATE FORMATTER
  // ============================================================================

  /**
   * โหลดรูปภาพภายนอก (โลโก้/ลายเซ็น/QR สำรอง) แบบปลอดภัย ป้องกัน Canvas ค้างหรือติด Tainted Canvas
   */
  function loadImageSafe(url) {
    return new Promise(function (resolve) {
      if (!url) return resolve(null);
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function () {
          resolve(img);
        };
        img.onerror = function () {
          resolve(null);
        };
        img.src = String(url).trim();
      } catch (_) {
        resolve(null);
      }
    });
  }

  /**
   * รอให้ฟอนต์เว็บ (Prompt / Sarabun / JetBrains Mono) พร้อมก่อนวาดลง Canvas
   * จำกัดเวลารอสูงสุด 1.5 วินาที เพื่อไม่ให้หน้าเว็บค้างหากเครือข่ายช้า
   */
  function waitFontsReadySafe(timeoutMs) {
    const limit = timeoutMs || 1500;
    if (!global.document || !global.document.fonts || !global.document.fonts.ready) {
      return Promise.resolve();
    }
    return Promise.race([
      global.document.fonts.ready.catch(function () {}),
      new Promise(function (resolve) {
        setTimeout(resolve, limit);
      })
    ]);
  }

  /**
   * แปลงวันที่เป็นรูปแบบภาษาไทยเต็ม
   */
  function formatThaiDateSafe(isoStr) {
    if (global.RJCLOUD_CORE && typeof global.RJCLOUD_CORE.formatThaiDate === 'function') {
      return global.RJCLOUD_CORE.formatThaiDate(isoStr);
    }
    try {
      const d = isoStr ? new Date(isoStr) : new Date();
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (_) {
      return '-';
    }
  }

  /**
   * สร้าง URL ตรวจสอบเอกสารจริงบนหน้า verify.html?code=...
   */
  function buildVerifyUrl(certificateCode, certPrefix) {
    const code = certificateCode || ((certPrefix || 'RJC-2027') + '-DEMO01');
    try {
      const base = global.location.href
        .split('?')[0]
        .split('#')[0]
        .replace(/[^/]*\.html$/i, '');
      const normalizedBase = base.endsWith('/') ? base : base + '/';
      return normalizedBase + 'verify.html?code=' + encodeURIComponent(code);
    } catch (_) {
      return 'https://learn.coerj.com/verify.html?code=' + encodeURIComponent(code);
    }
  }

  // ============================================================================
  // 3. PIXEL-PERFECT REAL QR CODE CANVAS RENDERER (ANTI-BLANK BOX GUARANTEE)
  // ============================================================================

  /**
   * วาด QR Code จริงลงบน Canvas โดยตรงด้วย qrcode-generator แบบคมชัดชิดพิกเซล
   * พร้อมระบบสำรอง (qrserver API) หาก CDN หลักถูกบล็อก ป้องกันช่อง QR สีขาวว่าง 100%
   */
  async function drawRealQrOnCanvas(ctx, urlText, x, y, size, darkColor) {
    if (!ctx || !urlText) return false;
    const fillHex = darkColor || '#1d1d1f';

    try {
      if (typeof global.qrcode === 'function') {
        const qr = global.qrcode(0, 'M');
        qr.addData(String(urlText));
        qr.make();
        const count = qr.getModuleCount();
        const cell = size / count;
        ctx.fillStyle = fillHex;
        for (let r = 0; r < count; r++) {
          const py = Math.floor(y + r * cell);
          const ph = Math.ceil(y + (r + 1) * cell) - py;
          for (let c = 0; c < count; c++) {
            if (qr.isDark(r, c)) {
              const px = Math.floor(x + c * cell);
              const pw = Math.ceil(x + (c + 1) * cell) - px;
              ctx.fillRect(px, py, pw, ph);
            }
          }
        }
        return true;
      }
    } catch (err) {
      console.warn('qrcode-generator draw warning:', err);
    }

    const fallbackUrl =
      'https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=1&data=' +
      encodeURIComponent(String(urlText));
    const qrImg = await loadImageSafe(fallbackUrl);
    if (qrImg) {
      ctx.drawImage(qrImg, x, y, size, size);
      return true;
    }
    return false;
  }

  // ============================================================================
  // 4. APPLE-MINIMALIST CERTIFICATE CANVAS RENDERER (1600x1131 • A4 LANDSCAPE)
  // ============================================================================

  /**
   * วาดใบประกาศนียบัตรสไตล์มินิมอลเรียบหรูมาตรฐานเดียวกันทุกวิชาชีพ
   * - พยาบาล: พิมพ์บรรทัด รหัสกิจกรรม CNEU + หน่วยคะแนน
   * - แพทย์และสหวิชาชีพ: พิมพ์บรรทัดจำนวนชั่วโมงการฝึกอบรมวิชาการ/พัฒนาสมรรถนะ (ไม่มีคำว่า CNEU)
   */
  async function drawMinimalistCertificate(canvas, tplInput, userObj, verifyUrl) {
    if (!canvas) return false;
    const tpl = Object.assign(
      {},
      FALLBACK_TEMPLATE,
      global.RJCLOUD_CORE && global.RJCLOUD_CORE.DEFAULT_CERT_TEMPLATE ? global.RJCLOUD_CORE.DEFAULT_CERT_TEMPLATE : {},
      tplInput || {}
    );
    const u = userObj || {};
    const creditMeta = getCertificateCreditMeta(u, tpl, tpl);

    const W = 1600;
    const H = 1131;
    const SAFE_TEXT_W = W - 240;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    const results = await Promise.all([
      waitFontsReadySafe(1500),
      loadImageSafe(tpl.logoUrl),
      loadImageSafe(tpl.signatureUrl)
    ]);
    const logoImg = results[1];
    const sigImg = results[2];

    // 1. พื้นหลังสีขาวบริสุทธิ์
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // 2. เส้นกรอบทองเมทัลลิก 2 ชั้น (Double Hairline Gold Frame)
    const goldGrad = ctx.createLinearGradient(0, 0, W, H);
    goldGrad.addColorStop(0, '#b89242');
    goldGrad.addColorStop(0.35, '#e2c785');
    goldGrad.addColorStop(0.7, '#c5a059');
    goldGrad.addColorStop(1, '#a67f32');
    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = 2.4;
    ctx.strokeRect(42, 42, W - 84, H - 84);
    ctx.strokeStyle = 'rgba(197, 160, 89, 0.42)';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(58, 58, W - 116, H - 116);

    // 3. เส้นมุมเรขาคณิตสีทองบาง 4 มุม
    const cLen = 36;
    const inset = 74;
    ctx.strokeStyle = '#c5a059';
    ctx.lineWidth = 2;
    [
      [inset, inset, 1, 1],
      [W - inset, inset, -1, 1],
      [inset, H - inset, 1, -1],
      [W - inset, H - inset, -1, -1]
    ].forEach(function (pt) {
      const cx = pt[0], cy = pt[1], dx = pt[2], dy = pt[3];
      ctx.beginPath();
      ctx.moveTo(cx + dx * cLen, cy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + dy * cLen);
      ctx.stroke();
    });

    // 4. โลโก้หน่วยงาน หรือแถบเส้นทองบางด้านบน
    let topY = 148;
    if (logoImg) {
      const maxH = 74;
      const drawW = Math.min(340, maxH * (logoImg.width / (logoImg.height || 1)));
      const drawH = drawW / (logoImg.width / (logoImg.height || 1));
      ctx.drawImage(logoImg, W / 2 - drawW / 2, 82 + (maxH - drawH) / 2, drawW, drawH);
      topY = 192;
    } else {
      const barGrad = ctx.createLinearGradient(W / 2 - 58, 0, W / 2 + 58, 0);
      barGrad.addColorStop(0, 'rgba(197, 160, 89, 0.15)');
      barGrad.addColorStop(0.5, '#c5a059');
      barGrad.addColorStop(1, 'rgba(197, 160, 89, 0.15)');
      ctx.fillStyle = barGrad;
      ctx.fillRect(W / 2 - 58, 98, 116, 2.4);
    }

    // 5. ชื่อหน่วยงานและหัวข้อประกาศนียบัตร
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1d1d1f';
    ctx.font = '600 22px "Prompt", sans-serif';
    ctx.fillText(tpl.orgTitleTH || '', W / 2, topY, SAFE_TEXT_W);

    ctx.fillStyle = '#86868b';
    ctx.font = '500 15px "JetBrains Mono", monospace';
    ctx.fillText(tpl.orgTitleEN || '', W / 2, topY + 32, SAFE_TEXT_W);

    ctx.fillStyle = '#a8843b';
    ctx.font = '600 16px "JetBrains Mono", monospace';
    ctx.fillText('C E R T I F I C A T E   O F   C O M P L E T I O N', W / 2, topY + 86, SAFE_TEXT_W);

    ctx.fillStyle = '#1d1d1f';
    ctx.font = '700 54px "Prompt", sans-serif';
    ctx.fillText('ประกาศนียบัตร', W / 2, topY + 150, SAFE_TEXT_W);

    ctx.fillStyle = '#6e6e73';
    ctx.font = '500 22px "Sarabun", sans-serif';
    ctx.fillText(tpl.subtitleTH || '', W / 2, topY + 196, SAFE_TEXT_W);

    // 6. ชื่อผู้สำเร็จการอบรม (รองรับทั้งชื่อไทยและชื่อภาษาอังกฤษ)
    ctx.fillStyle = '#1d1d1f';
    ctx.font = '700 56px "Prompt", sans-serif';
    ctx.fillText(u.name || 'ผู้สำเร็จการอบรม', W / 2, topY + 272, SAFE_TEXT_W);

    if (u.nameEN) {
      ctx.fillStyle = '#424245';
      ctx.font = '600 24px "Prompt", sans-serif';
      ctx.fillText(u.nameEN, W / 2, topY + 308, SAFE_TEXT_W);
    }

    const ruleY = u.nameEN ? topY + 324 : topY + 294;
    const nameRule = ctx.createLinearGradient(W / 2 - 170, 0, W / 2 + 170, 0);
    nameRule.addColorStop(0, 'rgba(197, 160, 89, 0)');
    nameRule.addColorStop(0.25, '#c5a059');
    nameRule.addColorStop(0.75, '#e2c785');
    nameRule.addColorStop(1, 'rgba(197, 160, 89, 0)');
    ctx.fillStyle = nameRule;
    ctx.fillRect(W / 2 - 170, ruleY, 340, 2);

    ctx.fillStyle = '#6e6e73';
    ctx.font = '500 21px "Sarabun", sans-serif';
    const orgMeta = [u.hospital || '', u.license ? 'เลขที่ใบอนุญาต ' + u.license : '']
      .filter(Boolean)
      .join('   •   ');
    ctx.fillText(orgMeta, W / 2, ruleY + 38, SAFE_TEXT_W);

    // 7. ข้อความรับรอง ชื่อหลักสูตร และหน่วยคะแนน/ชั่วโมงการฝึกอบรมตรงตามกลุ่มวิชาชีพ
    ctx.fillStyle = '#424245';
    ctx.font = '500 23px "Sarabun", sans-serif';
    ctx.fillText(tpl.completionTextTH || '', W / 2, ruleY + 92, SAFE_TEXT_W);

    ctx.fillStyle = '#1d1d1f';
    ctx.font = '700 28px "Prompt", sans-serif';
    ctx.fillText(tpl.courseTitleTH || '', W / 2, ruleY + 142, SAFE_TEXT_W);

    ctx.fillStyle = '#a8843b';
    ctx.font = '500 18px "Prompt", sans-serif';
    ctx.fillText(tpl.courseTitleEN || '', W / 2, ruleY + 178, SAFE_TEXT_W);

    if (creditMeta.lineTextTH) {
      // พยาบาล: สีเขียวมรกต (CNEU) | แพทย์ & สหวิชาชีพ: สีน้ำเงินกรมท่าสง่างาม (ชั่วโมงอบรม / CME)
      ctx.fillStyle = creditMeta.isNurseCneu ? '#047857' : '#0369a1';
      ctx.font = '600 19px "Prompt", sans-serif';
      ctx.fillText(creditMeta.lineTextTH, W / 2, ruleY + 212, SAFE_TEXT_W);

      ctx.fillStyle = '#6e6e73';
      ctx.font = '500 18px "Sarabun", sans-serif';
      ctx.fillText('ให้ไว้ ณ วันที่ ' + formatThaiDateSafe(u.certificateIssuedAt), W / 2, ruleY + 244, SAFE_TEXT_W);
    } else {
      ctx.fillStyle = '#6e6e73';
      ctx.font = '500 18px "Sarabun", sans-serif';
      ctx.fillText('ให้ไว้ ณ วันที่ ' + formatThaiDateSafe(u.certificateIssuedAt), W / 2, ruleY + 216, SAFE_TEXT_W);
    }

    // 8. ส่วนลายเซ็นกึ่งกลาง
    const sigBaseY = H - 186;
    if (sigImg) {
      const maxSigH = 68;
      const sigW = Math.min(240, maxSigH * (sigImg.width / (sigImg.height || 1)));
      const sigH = sigW / (sigImg.width / (sigImg.height || 1));
      ctx.drawImage(sigImg, W / 2 - sigW / 2, sigBaseY - sigH - 8, sigW, sigH);
    }
    ctx.strokeStyle = '#c5a059';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 160, sigBaseY);
    ctx.lineTo(W / 2 + 160, sigBaseY);
    ctx.stroke();

    ctx.fillStyle = '#1d1d1f';
    ctx.font = '600 23px "Prompt", sans-serif';
    ctx.fillText(tpl.signerName || '', W / 2, sigBaseY + 38, 560);

    ctx.fillStyle = '#6e6e73';
    ctx.font = '500 18px "Sarabun", sans-serif';
    ctx.fillText(tpl.signerPosition || '', W / 2, sigBaseY + 68, 620);

    // 9. รหัสอ้างอิงประกาศนียบัตร (มุมซ้ายล่าง)
    const certCode = u.certificateCode || ((tpl.certPrefix || 'RJC-2027') + '-DEMO01');
    ctx.fillStyle = '#c5a059';
    ctx.fillRect(98, H - 174, 2.5, 62);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#a8843b';
    ctx.font = '600 13px "JetBrains Mono", monospace';
    ctx.fillText('CERTIFICATE NO.', 114, H - 158);
    ctx.fillStyle = '#1d1d1f';
    ctx.font = '700 18px "JetBrains Mono", monospace';
    ctx.fillText(certCode, 114, H - 134, 340);
    ctx.fillStyle = '#86868b';
    ctx.font = '500 15px "Sarabun", sans-serif';
    ctx.fillText('ตรวจสอบความถูกต้องผ่าน QR Code ที่ rjcloud.organ', 114, H - 110, 380);

    // 10. กรอบ QR Code จริง (มุมขวาล่าง)
    const qrSize = 136;
    const qrX = W - 102 - qrSize;
    const qrY = H - 122 - qrSize;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = 'rgba(197, 160, 89, 0.65)';
    ctx.lineWidth = 1.6;
    ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
    ctx.strokeRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);

    const resolvedVerifyUrl = verifyUrl || buildVerifyUrl(certCode, tpl.certPrefix);
    await drawRealQrOnCanvas(ctx, resolvedVerifyUrl, qrX, qrY, qrSize, '#1d1d1f');

    ctx.textAlign = 'center';
    ctx.fillStyle = '#a8843b';
    ctx.font = '600 12px "JetBrains Mono", monospace';
    ctx.fillText('SCAN TO VERIFY', qrX + qrSize / 2, qrY + qrSize + 28);
    ctx.textAlign = 'left';

    return true;
  }

  // ============================================================================
  // 5. PROFESSION-AWARE PUBLIC CERTIFICATE REGISTRY PAYLOAD BUILDER (PDPA-SAFE)
  // ============================================================================

  /**
   * สร้างก้อนข้อมูลสำหรับบันทึกในทะเบียนสาธารณะ certificates/{code}
   * - ไม่ระบุแยกประเภทการเรียน (ตัด userType ออก 100% มอบสิทธิ์และเกียรติเท่าเทียมกัน)
   * - บันทึก creditType ('CNEU' | 'CME' | 'HOURS') และใส่รหัส CNEU เฉพาะกลุ่มพยาบาลเท่านั้น
   * - คุ้มครอง PDPA: ไม่เก็บอีเมลและเบอร์โทรศัพท์ในคอลเลกชันสาธารณะเด็ดขาด
   */
  function buildPublicCertPayload(params) {
    const p = params || {};
    const u = p.user || {};
    const tpl = Object.assign({}, FALLBACK_TEMPLATE, p.certTemplate || {});
    const cneu = p.cneuConfig || {};
    const creditMeta = getCertificateCreditMeta(u, tpl, cneu);

    return {
      code: p.code,
      name: p.finalName || u.name || 'ผู้สำเร็จการอบรม',
      nameEN: p.nameEN || u.nameEN || '',
      license: p.license || u.license || u.id || '',
      position: u.position || 'บุคลากรทางการแพทย์',
      professionGroup: creditMeta.professionGroup,
      cneuEligible: creditMeta.isNurseCneu,
      creditType: creditMeta.creditType,
      creditLabelTH: creditMeta.lineTextTH,
      trainingHours: creditMeta.trainingHours,
      hospital: p.finalHospital || u.hospital || '',
      department: u.department || '',
      province: u.province || '',
      courseTitleTH: tpl.courseTitleTH,
      courseTitleEN: tpl.courseTitleEN || '',
      orgTitleTH: tpl.orgTitleTH,
      signerName: tpl.signerName,
      signerPosition: tpl.signerPosition,
      posttestScore: u.posttest || 'ผ่านเกณฑ์มาตรฐาน (≥ 80%)',
      skillLabBestScore: typeof u.skillLabBestScore === 'number' ? u.skillLabBestScore : null,
      cneuActivityCode: creditMeta.isNurseCneu ? creditMeta.cneuActivityCode : '',
      cneuCredits: creditMeta.isNurseCneu ? creditMeta.cneuCredits : '',
      cmeActivityCode: creditMeta.creditType === 'CME' ? creditMeta.cmeActivityCode : '',
      cmeCredits: creditMeta.creditType === 'CME' ? creditMeta.cmeCredits : '',
      issuedAt: p.issuedAt || new Date().toISOString(),
      status: 'valid'
    };
  }

  // ============================================================================
  // 6. PNG / PDF EXPORTERS & INDIVIDUAL A4 CERTIFICATION LETTER PRINT CONTROLLER
  // ============================================================================

  /**
   * ดาวน์โหลดใบประกาศนียบัตรเป็นไฟล์รูปภาพ PNG ความละเอียดสูง
   */
  function downloadCanvasAsPng(canvas, code) {
    if (!canvas) return false;
    try {
      const a = global.document.createElement('a');
      a.href = canvas.toDataURL('image/png', 1.0);
      a.download = 'Certificate_' + (code || 'rjcloud') + '.png';
      global.document.body.appendChild(a);
      a.click();
      global.document.body.removeChild(a);
      return true;
    } catch (err) {
      console.warn('PNG export error:', err);
      return false;
    }
  }

  /**
   * ดาวน์โหลดใบประกาศนียบัตรเป็นไฟล์ PDF A4 แนวนอน (สลับเป็น PNG อัตโนมัติหาก jsPDF โหลดไม่สำเร็จ)
   */
  function downloadCanvasAsPdf(canvas, code) {
    if (!canvas) return { ok: false, format: 'none' };
    try {
      const jsPDFCtor = global.jspdf && global.jspdf.jsPDF;
      if (!jsPDFCtor) {
        const pngOk = downloadCanvasAsPng(canvas, code);
        return { ok: pngOk, format: 'png' };
      }
      const pdf = new jsPDFCtor({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
      pdf.save('Certificate_' + (code || 'rjcloud') + '.pdf');
      return { ok: true, format: 'pdf' };
    } catch (err) {
      console.warn('PDF export fallback to PNG:', err);
      const pngOk = downloadCanvasAsPng(canvas, code);
      return { ok: pngOk, format: 'png' };
    }
  }

  /**
   * สั่งพิมพ์หรือบันทึก PDF หนังสือรับรองรายบุคคล (A4 แนวตั้ง — รองรับทั้ง CNEU และชั่วโมงอบรม)
   */
  function printIndividualCneuLetter() {
    if (!global.document || !global.document.body) return;
    let cleaned = false;
    const cleanup = function () {
      if (cleaned) return;
      cleaned = true;
      global.document.body.classList.remove('printing-cneu-letter');
    };

    global.document.body.classList.add('printing-cneu-letter');
    try {
      global.addEventListener('afterprint', cleanup, { once: true });
    } catch (_) {}

    setTimeout(function () {
      try {
        global.print();
      } finally {
        setTimeout(cleanup, 1500);
      }
    }, 150);
  }

  // ============================================================================
  // 7. EXPORT PUBLIC API TO window.RJCLOUD_CERT
  // ============================================================================
  global.RJCLOUD_CERT = {
    resolveProfessionGroup: resolveProfessionGroup,
    isNurseCneuEligible: isNurseCneuEligible,
    getCertificateCreditMeta: getCertificateCreditMeta,
    loadImageSafe: loadImageSafe,
    waitFontsReadySafe: waitFontsReadySafe,
    buildVerifyUrl: buildVerifyUrl,
    drawRealQrOnCanvas: drawRealQrOnCanvas,
    drawMinimalistCertificate: drawMinimalistCertificate,
    buildPublicCertPayload: buildPublicCertPayload,
    downloadCanvasAsPng: downloadCanvasAsPng,
    downloadCanvasAsPdf: downloadCanvasAsPdf,
    printIndividualCneuLetter: printIndividualCneuLetter
  };
})(window);
