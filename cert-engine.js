/* ============================================================================
 * rjcloud.organ — Certificate, Real QR Code & Export Engine (cert-engine.js)
 * แยกออกมาจาก index.html ตามแนวทาง Modular Zero-Build (ไฟล์ที่ 3/4)
 *
 * โครงสร้างภายในไฟล์ (เผยแพร่ผ่าน window.RJCLOUD_CERT):
 * 1. Safe Image Loader, Verify URL Builder & Thai Date Formatter
 * 2. Real QR Code Canvas Renderer (qrcode-generator + CORS Fallback)
 * 3. Apple-Minimalist Certificate Canvas Renderer (1600×1131 px • A4 Landscape)
 * 4. Public Certificate Registry Payload Builder (PDPA-Safe: No Email/Phone)
 * 5. PNG / PDF Exporters & Individual A4 CNEU Print Controller
 * ============================================================================ */

(function (global) {
  'use strict';

  const FALLBACK_TEMPLATE = {
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

  // ============================================================================
  // 1. SAFE IMAGE LOADER, VERIFY URL BUILDER & THAI DATE FORMATTER
  // ============================================================================

  /**
   * โหลดรูปภาพภายนอก (โลโก้/ลายเซ็น/QR สำรอง) แบบปลอดภัย ไม่ทำให้ Canvas ค้างเมื่อโหลดไม่ได้
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
        img.src = url;
      } catch (_) {
        resolve(null);
      }
    });
  }

  /**
   * แปลงวันที่เป็นรูปแบบภาษาไทยเต็ม (ใช้ร่วมกับ window.RJCLOUD_CORE หากโหลดแล้ว)
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
        .replace(/index\.html$/i, '');
      return base + 'verify.html?code=' + encodeURIComponent(code);
    } catch (_) {
      return 'https://learn.coerj.com/verify.html?code=' + encodeURIComponent(code);
    }
  }

  // ============================================================================
  // 2. REAL QR CODE CANVAS RENDERER (ANTI-BLANK BOX GUARANTEE)
  // ============================================================================

  /**
   * วาด QR Code จริงลงบน Canvas โดยตรงด้วย qrcode-generator
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
          for (let c = 0; c < count; c++) {
            if (qr.isDark(r, c)) {
              ctx.fillRect(x + c * cell, y + r * cell, Math.ceil(cell), Math.ceil(cell));
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
  // 3. APPLE-MINIMALIST CERTIFICATE CANVAS RENDERER (1600×1131 • A4 LANDSCAPE)
  // ============================================================================

  /**
   * วาดใบประกาศนียบัตรสไตล์มินิมอลเรียบหรู (พื้นสีขาวบริสุทธิ์ ตัดเส้นทองเมทัลลิกบางเฉียบ + QR Code จริง)
   */
  async function drawMinimalistCertificate(canvas, tplInput, userObj, verifyUrl) {
    if (!canvas) return false;
    const tpl = {
      ...FALLBACK_TEMPLATE,
      ...(global.RJCLOUD_CORE ? global.RJCLOUD_CORE.DEFAULT_CERT_TEMPLATE : {}),
      ...(tplInput || {})
    };
    const u = userObj || {};

    const W = 1600;
    const H = 1131;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    const [logoImg, sigImg] = await Promise.all([
      loadImageSafe(tpl.logoUrl),
      loadImageSafe(tpl.signatureUrl)
    ]);

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
      const drawW = maxH * (logoImg.width / (logoImg.height || 1));
      ctx.drawImage(logoImg, W / 2 - drawW / 2, 82, drawW, maxH);
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
    ctx.fillText(tpl.orgTitleTH, W / 2, topY);

    ctx.fillStyle = '#86868b';
    ctx.font = '500 15px "JetBrains Mono", monospace';
    ctx.fillText(tpl.orgTitleEN, W / 2, topY + 32);

    ctx.fillStyle = '#a8843b';
    ctx.font = '600 16px "JetBrains Mono", monospace';
    ctx.fillText('C E R T I F I C A T E   O F   C O M P L E T I O N', W / 2, topY + 86);

    ctx.fillStyle = '#1d1d1f';
    ctx.font = '700 54px "Prompt", sans-serif';
    ctx.fillText('ประกาศนียบัตร', W / 2, topY + 150);

    ctx.fillStyle = '#6e6e73';
    ctx.font = '500 22px "Sarabun", sans-serif';
    ctx.fillText(tpl.subtitleTH, W / 2, topY + 196);

    // 6. ชื่อผู้สำเร็จการอบรม (รองรับทั้งชื่อไทยและชื่อภาษาอังกฤษแบบไม่บังคับ)
    ctx.fillStyle = '#1d1d1f';
    ctx.font = '700 56px "Prompt", sans-serif';
    ctx.fillText(u.name || 'ผู้สำเร็จการอบรม', W / 2, topY + 272);

    if (u.nameEN) {
      ctx.fillStyle = '#424245';
      ctx.font = '600 24px "Prompt", sans-serif';
      ctx.fillText(u.nameEN, W / 2, topY + 308);
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
    ctx.fillText(orgMeta, W / 2, ruleY + 38);

    // 7. ข้อความรับรอง ชื่อหลักสูตร และวันที่ออกเอกสาร
    ctx.fillStyle = '#424245';
    ctx.font = '500 23px "Sarabun", sans-serif';
    ctx.fillText(tpl.completionTextTH, W / 2, ruleY + 92);

    ctx.fillStyle = '#1d1d1f';
    ctx.font = '700 28px "Prompt", sans-serif';
    ctx.fillText(tpl.courseTitleTH, W / 2, ruleY + 142);

    ctx.fillStyle = '#a8843b';
    ctx.font = '500 18px "Prompt", sans-serif';
    ctx.fillText(tpl.courseTitleEN, W / 2, ruleY + 178);

    ctx.fillStyle = '#6e6e73';
    ctx.font = '500 18px "Sarabun", sans-serif';
    ctx.fillText('ให้ไว้ ณ วันที่ ' + formatThaiDateSafe(u.certificateIssuedAt), W / 2, ruleY + 216);

    // 8. ส่วนลายเซ็นกึ่งกลาง
    const sigBaseY = H - 186;
    if (sigImg) {
      const sigH = 68;
      const sigW = sigH * (sigImg.width / (sigImg.height || 1));
      ctx.drawImage(sigImg, W / 2 - sigW / 2, sigBaseY - 76, sigW, sigH);
    }
    ctx.strokeStyle = '#c5a059';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 160, sigBaseY);
    ctx.lineTo(W / 2 + 160, sigBaseY);
    ctx.stroke();

    ctx.fillStyle = '#1d1d1f';
    ctx.font = '600 23px "Prompt", sans-serif';
    ctx.fillText(tpl.signerName, W / 2, sigBaseY + 38);

    ctx.fillStyle = '#6e6e73';
    ctx.font = '500 18px "Sarabun", sans-serif';
    ctx.fillText(tpl.signerPosition, W / 2, sigBaseY + 68);

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
    ctx.fillText(certCode, 114, H - 134);
    ctx.fillStyle = '#86868b';
    ctx.font = '500 15px "Sarabun", sans-serif';
    ctx.fillText('ตรวจสอบความถูกต้องผ่าน QR Code ที่ rjcloud.organ', 114, H - 110);

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
  // 4. PUBLIC CERTIFICATE REGISTRY PAYLOAD BUILDER (PDPA-SAFE)
  // ============================================================================

  /**
   * สร้างก้อนข้อมูลสำหรับบันทึกในทะเบียนสาธารณะ certificates/{code}
   * คุ้มครอง PDPA: ไม่เก็บอีเมลและเบอร์โทรศัพท์ในคอลเลกชันสาธารณะเด็ดขาด
   */
  function buildPublicCertPayload(params) {
    const p = params || {};
    const u = p.user || {};
    const tpl = { ...FALLBACK_TEMPLATE, ...(p.certTemplate || {}) };
    const cneu = p.cneuConfig || {};
    return {
      code: p.code,
      name: p.finalName || u.name || 'ผู้สำเร็จการอบรม',
      nameEN: p.nameEN || u.nameEN || '',
      license: p.license || u.license || u.id || '',
      position: u.position || 'พยาบาลวิชาชีพ',
      hospital: p.finalHospital || u.hospital || '',
      department: u.department || '',
      province: u.province || '',
      userType: u.userType || 'เรียนใหม่',
      courseTitleTH: tpl.courseTitleTH,
      orgTitleTH: tpl.orgTitleTH,
      signerName: tpl.signerName,
      signerPosition: tpl.signerPosition,
      posttestScore: u.posttest || 'ผ่านเกณฑ์ (≥ 80%)',
      skillLabBestScore: typeof u.skillLabBestScore === 'number' ? u.skillLabBestScore : null,
      cneuActivityCode: cneu.activityCode || '',
      cneuCredits: cneu.cneuCredits || '',
      issuedAt: p.issuedAt || new Date().toISOString(),
      status: 'valid'
    };
  }

  // ============================================================================
  // 5. PNG / PDF EXPORTERS & INDIVIDUAL A4 CNEU PRINT CONTROLLER
  // ============================================================================

  /**
   * ดาวน์โหลดใบประกาศนียบัตรเป็นไฟล์รูปภาพ PNG ความละเอียดสูง
   */
  function downloadCanvasAsPng(canvas, code) {
    if (!canvas) return false;
    try {
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png', 1.0);
      a.download = 'Certificate_' + (code || 'rjcloud') + '.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
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
   * สั่งพิมพ์หรือบันทึก PDF หนังสือรับรอง CNEU รายบุคคล (A4 แนวตั้ง)
   */
  function printIndividualCneuLetter() {
    document.body.classList.add('printing-cneu-letter');
    setTimeout(function () {
      try {
        global.print();
      } finally {
        setTimeout(function () {
          document.body.classList.remove('printing-cneu-letter');
        }, 500);
      }
    }, 150);
  }

  // ============================================================================
  // 6. EXPORT PUBLIC API TO window.RJCLOUD_CERT
  // ============================================================================
  global.RJCLOUD_CERT = {
    loadImageSafe: loadImageSafe,
    buildVerifyUrl: buildVerifyUrl,
    drawRealQrOnCanvas: drawRealQrOnCanvas,
    drawMinimalistCertificate: drawMinimalistCertificate,
    buildPublicCertPayload: buildPublicCertPayload,
    downloadCanvasAsPng: downloadCanvasAsPng,
    downloadCanvasAsPdf: downloadCanvasAsPdf,
    printIndividualCneuLetter: printIndividualCneuLetter
  };
})(window);
