/**
 * ============================================================================
 * rjcloud.organ 2.0 — Offline-Ready Service Worker (sw.js • ไฟล์ 7/7)
 * Organ Transplantation Center of Rajavithi Hospital
 *
 * ความสามารถหลัก (Zero-Cost PWA Architecture):
 * 1. Pre-cache ไฟล์หลักของแพลตฟอร์มแบบ Resilient (ไม่ล่มแม้บางไฟล์ยังไม่ถูกอัปโหลด)
 * 2. Network-First สำหรับหน้า HTML — ได้เวอร์ชันล่าสุดเสมอเมื่อมีเน็ต และสลับใช้ออฟไลน์ทันทีในห้อง ICU/ER
 *    (เปิดดูสรุป 1 นาที 20 บท, Flashcards, Pocket Phrasebook และโหมดอุ่นเครื่อง 30 วิได้แม้ออฟไลน์)
 * 3. Stale-While-Revalidate สำหรับไฟล์โมดูล JS/CSS และไลบรารี UI ภายนอกที่เชื่อถือได้
 * 4. PDPA & Real-Time Guard — ห้ามแคชคำขอ POST, Firebase Auth/Firestore, OTP, Gemini AI, TTS และวิดีโอ
 * ============================================================================
 */

const CACHE_VERSION = 'v2027-01';
const APP_SHELL_CACHE = `rjcloud-shell-${CACHE_VERSION}`;
const RUNTIME_CDN_CACHE = `rjcloud-cdn-${CACHE_VERSION}`;

/**
 * รายการไฟล์หลักภายในโดเมนเดียวกันที่จะแคชไว้ใช้ออฟไลน์ในห้อง ICU/ER
 */
const APP_SHELL_ASSETS = [
  './',
  './index.html',
  './aiskilllab.html',
  './verify.html',
  './executive.html',
  './manifest.json',
  './styles.css',
  './data.js',
  './learning-core.js',
  './cert-engine.js',
  './ai-interactive.js',
  './skilllab-engine.js',
  './keynote-launch.js'
];

/**
 * โดเมนภายนอกที่อนุญาตให้แคชแบบ Stale-While-Revalidate เพื่อให้ UI/ฟอนต์เปิดได้แม้ออฟไลน์
 */
const ALLOWED_CDN_HOSTS = [
  'cdn.tailwindcss.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'esm.sh',
  'unpkg.com',
  'cdnjs.cloudflare.com',
  'cdn.jsdelivr.net'
];

/**
 * โดเมนหรือเส้นทางที่ห้ามแคชเด็ดขาด (เพื่อความปลอดภัย PDPA และความสดใหม่ของข้อมูล Cloud)
 */
const BYPASS_HOST_PATTERNS = [
  'firestore.googleapis.com',
  'firebase.googleapis.com',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'script.google.com',
  'script.googleusercontent.com',
  'generativelanguage.googleapis.com',
  'youtube.com',
  'ytimg.com',
  'googlevideo.com',
  'drive.google.com',
  'docs.google.com',
  'www.gstatic.com/firebasejs'
];

/**
 * ตรวจสอบว่า URL นี้ควรข้ามแคช (Network-Only) หรือไม่
 */
function shouldBypassCache(urlObj) {
  if (!urlObj || (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:')) {
    return true;
  }
  const full = `${urlObj.hostname}${urlObj.pathname}`.toLowerCase();
  if (full.endsWith('/admin.html') || full.endsWith('admin.html')) {
    return true;
  }
  return BYPASS_HOST_PATTERNS.some((pattern) => full.includes(pattern));
}

/**
 * ตรวจสอบว่าเป็นโดเมน CDN ที่เชื่อถือได้สำหรับแคช UI/Fonts หรือไม่
 */
function isAllowedCdn(urlObj) {
  return ALLOWED_CDN_HOSTS.some((host) => urlObj.hostname === host || urlObj.hostname.endsWith(`.${host}`));
}

/**
 * สร้างหน้า HTML สำรองกรณีผู้เรียนเปิดหน้าใหม่ขณะออฟไลน์ที่ยังไม่เคยถูกแคชไว้
 */
function buildOfflineFallbackResponse() {
  const html = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>โหมดออฟไลน์ — rjcloud.organ 2.0</title>
  <style>
    body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; background:#020612; color:#f8fafc; font-family:-apple-system,BlinkMacSystemFont,'Anuphan','Sarabun',sans-serif; text-align:center; }
    .card { max-width:420px; width:100%; background:#061229; border:1px solid rgba(186,230,253,0.28); border-radius:24px; padding:28px 22px; box-shadow:0 24px 48px rgba(0,0,0,0.65); }
    h1 { margin:0 0 8px; font-size:20px; color:#6ee7b7; }
    p { margin:0 0 18px; font-size:14px; line-height:1.65; color:#dbeafe; }
    .actions { display:flex; gap:10px; justify-content:center; flex-wrap:wrap; }
    a, button { padding:11px 20px; border-radius:9999px; font-weight:700; font-size:13px; text-decoration:none; border:none; cursor:pointer; }
    .primary { background:linear-gradient(95deg,#d7fbe6,#c6f3f9,#b3c8ff); color:#050b16; }
    .soft { background:rgba(147,197,253,0.14); color:#f8fafc; border:1px solid rgba(186,230,253,0.25); }
  </style>
</head>
<body>
  <div class="card">
    <h1>โหมดออฟไลน์ (สัญญาณอินเทอร์เน็ตขาดหาย)</h1>
    <p>ขณะนี้ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้ แต่คุณยังสามารถกลับไปเปิดหน้าหลักเพื่ออ่านสรุป 1 นาที, Flashcards, คลังคำพูดพกพา และโหมดอุ่นเครื่อง 30 วิที่แคชไว้บนเครื่องได้ค่ะ</p>
    <div class="actions">
      <a href="./index.html" class="primary">กลับหน้าหลัก rjcloud.organ 2.0</a>
      <button type="button" class="soft" onclick="window.location.reload()">ลองเชื่อมต่อใหม่</button>
    </div>
  </div>
</body>
</html>`;
  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

// ============================================================================
// 1. INSTALL: แคชไฟล์หลักแบบ Resilient (ทีละไฟล์เพื่อไม่ให้ล่มหากบางไฟล์ยังไม่พร้อม)
// ============================================================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(APP_SHELL_CACHE);
        await Promise.allSettled(
          APP_SHELL_ASSETS.map(async (assetPath) => {
            try {
              const req = new Request(assetPath, { cache: 'reload' });
              const res = await fetch(req);
              if (res && res.ok) {
                await cache.put(assetPath, res.clone());
              }
            } catch (_) {
              // ข้ามไฟล์ที่โหลดไม่สำเร็จชั่วคราวโดยไม่ขัดขวางการติดตั้ง SW
            }
          })
        );
      } catch (_) {}
      await self.skipWaiting();
    })()
  );
});

// ============================================================================
// 2. ACTIVATE: ลบแคชเวอร์ชันเก่าอัตโนมัติและเข้าควบคุมทุกแท็บทันที
// ============================================================================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(
          keys.map((key) => {
            if (key !== APP_SHELL_CACHE && key !== RUNTIME_CDN_CACHE) {
              return caches.delete(key);
            }
            return Promise.resolve();
          })
        );
      } catch (_) {}
      await self.clients.claim();
    })()
  );
});

// ============================================================================
// 3. FETCH: แยกกลยุทธ์แคชตามประเภททรัพยากร (Network-First vs Stale-While-Revalidate)
// ============================================================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (!request || request.method !== 'GET') return;

  let urlObj = null;
  try {
    urlObj = new URL(request.url);
  } catch (_) {
    return;
  }

  // 1) ข้ามคำขอที่เกี่ยวกับ PDPA, Firebase, OTP, AI และวิดีโอสตรีม
  if (shouldBypassCache(urlObj)) return;

  const isSameOrigin = urlObj.origin === self.location.origin;

  // 2) หน้าเว็บ HTML (Navigation): ใช้ Network-First เพื่อให้ได้อัปเดตล่าสุดจาก GitHub Pages เสมอ
  if (request.mode === 'navigate' || (isSameOrigin && urlObj.pathname.endsWith('.html'))) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(APP_SHELL_CACHE);
        try {
          const networkRes = await fetch(request);
          if (networkRes && networkRes.ok) {
            cache.put(request, networkRes.clone()).catch(() => {});
          }
          return networkRes;
        } catch (_) {
          const cachedExact = await cache.match(request, { ignoreSearch: true });
          if (cachedExact) return cachedExact;
          const cachedIndex = await cache.match('./index.html');
          return cachedIndex || buildOfflineFallbackResponse();
        }
      })()
    );
    return;
  }

  // 3) ไฟล์โมดูลภายในโดเมนเดียวกัน (JS / CSS / JSON): Stale-While-Revalidate
  if (isSameOrigin) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(APP_SHELL_CACHE);
        const cached = (await cache.match(request)) || (await cache.match(request, { ignoreSearch: true }));
        const networkPromise = fetch(request)
          .then((res) => {
            if (res && res.ok) {
              cache.put(request, res.clone()).catch(() => {});
            }
            return res;
          })
          .catch(() => null);

        if (cached) {
          event.waitUntil(networkPromise);
          return cached;
        }
        const fresh = await networkPromise;
        return fresh || new Response('', { status: 503, statusText: 'Offline' });
      })()
    );
    return;
  }

  // 4) ไลบรารี UI และฟอนต์จาก CDN ที่เชื่อถือได้: Stale-While-Revalidate
  if (isAllowedCdn(urlObj)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(RUNTIME_CDN_CACHE);
        const cached = await cache.match(request);
        const networkPromise = fetch(request)
          .then((res) => {
            if (res && (res.ok || res.type === 'opaque')) {
              cache.put(request, res.clone()).catch(() => {});
            }
            return res;
          })
          .catch(() => null);

        if (cached) {
          event.waitUntil(networkPromise);
          return cached;
        }
        const fresh = await networkPromise;
        return fresh || new Response('', { status: 503, statusText: 'Offline CDN' });
      })()
    );
  }
});

// ============================================================================
// 4. MESSAGE CHANNEL: รองรับคำสั่งอัปเดตเวอร์ชันหรือล้างแคชจากหน้าเว็บ
// ============================================================================
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (data.type === 'CLEAR_OFFLINE_CACHE') {
    event.waitUntil(
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
    );
  }
});
