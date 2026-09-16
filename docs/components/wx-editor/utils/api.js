/**
 * 后端接口层（对接 NestJS 后端 /api/login/* 等 pure 函数，无 Vue 依赖）。
 * 接口约定（后端统一响应）：
 *   成功 { code:200, data, msg }
 *   失败 { code:4xx/5xx, message, data:null }
 * 鉴权：请求头 Authorization: Bearer <token>，token 有效期 7 天
 */
import { useAuth } from './authStore';
import { dataUrlToBlob } from './imageUtils';

const { authToken, clearSession } = useAuth();

/* 接口基地址：优先取 window.TINGFENG_API_BASE，方便整站部署/换域名时覆盖 */
export function apiBase() {
  const custom = (typeof window !== 'undefined' && window.TINGFENG_API_BASE) || '';
  return (custom || 'https://api.orangecj.cn/api').replace(/\/+$/, '');
}

/* 统一请求：自动带 token、统一解包 data 与错误文案 */
export async function apiRequest(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && authToken.value) headers.Authorization = 'Bearer ' + authToken.value;

  let res;
  try {
    res = await fetch(apiBase() + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new Error(`无法连接服务器，请确认后端已启动（${apiBase()}）`);
  }

  let payload = null;
  try {
    payload = await res.json();
  } catch (e) {
    /* 无响应体时忽略 */
  }

  if (!res.ok) {
    let msg = payload && (payload.message || payload.msg);
    if (Array.isArray(msg)) msg = msg.join('；');
    // 401/403：登录态已失效（过期或被拉黑），清理本地
    if (res.status === 401 || res.status === 403) clearSession();
    throw new Error(msg || `请求失败（HTTP ${res.status}）`);
  }
  return payload ? payload.data : null;
}

/* ---------- 密码传输加密：RSA-OAEP(SHA-256)，公钥由后端 /login/public-key 下发 ---------- */
function pemToBuffer(pem) {
  const b64 = String(pem)
    .replace(/-----[^-]+-----/g, '')
    .replace(/\s+/g, '');
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

function bufferToBase64(buf) {
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

/* 每次实时拉取公钥（不缓存）：后端重启会重新生成密钥，缓存会导致解密失败 */
export async function encryptPassword(plain) {
  if (!(window.crypto && crypto.subtle && crypto.subtle.importKey)) {
    throw new Error('当前环境不支持加密（浏览器要求 HTTPS 或 localhost），请更换访问方式');
  }
  const data = await apiRequest('/login/public-key');
  const pem = data && data.publicKey;
  if (!pem) throw new Error('获取加密公钥失败，请稍后重试');

  const key = await crypto.subtle.importKey('spki', pemToBuffer(pem), { name: 'RSA-OAEP', hash: 'SHA-256' }, false, [
    'encrypt',
  ]);
  const cipher = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, key, new TextEncoder().encode(plain));
  return bufferToBase64(cipher);
}

/* ---------- 图片上传：dataURL -> 后端图床，返回可直接引用的 CDN 外链 ----------
   流程：前端压缩 → POST /api/upload/file（multipart，字段名 image）
        → 后端按登录 token 决定渠道与分组，写入对象存储 → 返回 CDN 外链。
   注意：不能复用 apiRequest —— 它固定写死了 Content-Type: application/json，
   而 FormData 必须让浏览器自己带 multipart boundary，所以单独用 fetch。 */
export async function uploadImageToBackend(dataUrl) {
  if (!authToken.value) throw new Error('请先登录后再上传图片');

  const blob = dataUrlToBlob(dataUrl);
  const ext = (blob.type.split('/')[1] || 'png').replace('jpeg', 'jpg');
  const fd = new FormData();
  fd.append('image', blob, `wx-editor-${Date.now().toString(36)}.${ext}`);
  fd.append('source', 'wx-editor');

  let res;
  try {
    res = await fetch(apiBase() + '/upload/file', {
      method: 'POST',
      // 只带鉴权头；Content-Type 交给浏览器自动生成（含 multipart boundary）
      headers: { Authorization: 'Bearer ' + authToken.value },
      body: fd,
    });
  } catch (e) {
    throw new Error(`无法连接服务器（${apiBase()}）`);
  }

  let payload = null;
  try {
    payload = await res.json();
  } catch (e) {
    /* 无响应体时忽略 */
  }

  if (!res.ok) {
    let msg = payload && (payload.message || payload.msg);
    if (Array.isArray(msg)) msg = msg.join('；');
    // 登录态失效（过期或被拉黑）：清掉本地，下次操作会重新引导登录
    if (res.status === 401 || res.status === 403) clearSession();
    throw new Error(msg || `上传失败（HTTP ${res.status}）`);
  }

  const url = payload && payload.data && payload.data.url;
  if (!url) throw new Error('服务器未返回图片地址');
  return url;
}
