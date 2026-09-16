/**
 * 全局单例登录态：token / 用户信息保存在这里，
 * 主组件（顶栏）、AuthModal（写入）、ImgsModal（鉴权请求）等共用同一份。
 */
import { ref, computed } from 'vue';
import { LS_TOKEN, LS_USER } from './constants';

const authToken = ref('');
const authUser = ref(null);

/* 解析 JWT 载荷（仅用于本地判断是否过期，不校验签名） */
function decodeJwt(token) {
  try {
    const part = String(token).split('.')[1];
    if (!part) return null;
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(b64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

function tokenExpired(token) {
  const p = decodeJwt(token);
  return !p || !p.exp || p.exp * 1000 <= Date.now();
}

function saveSession(token, userInfo) {
  authToken.value = token;
  authUser.value = userInfo || null;
  try {
    localStorage.setItem(LS_TOKEN, token);
    if (userInfo) localStorage.setItem(LS_USER, JSON.stringify(userInfo));
  } catch (e) {
    /* 隐私模式下忽略 */
  }
}

function clearSession() {
  authToken.value = '';
  authUser.value = null;
  try {
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_USER);
  } catch (e) {
    /* 忽略 */
  }
}

/* 读取本地登录态；token 已过期则静默清理 */
function initAuth() {
  try {
    const t = localStorage.getItem(LS_TOKEN) || '';
    if (t && tokenExpired(t)) {
      clearSession();
      return;
    }
    authToken.value = t;
    try {
      authUser.value = JSON.parse(localStorage.getItem(LS_USER) || 'null');
    } catch (e) {
      authUser.value = null;
    }
  } catch (e) {
    /* 忽略 */
  }
}

/* 图床是否可用：后端按登录账号归档图片，所以「已登录」即可用 */
const hostReady = computed(() => !!authToken.value);
/* 当前账号在对象存储里的分组名：wx-editor/{用户名|邮箱}，规则与后端 resolveGroupName 一致 */
const myGroup = computed(() => {
  const u = authUser.value;
  if (!u) return '';
  const name = u.username || u.email || '';
  return name ? `wx-editor/${name}` : '';
});
const displayName = computed(() => (authUser.value && (authUser.value.username || authUser.value.email)) || '已登录');
const avatarChar = computed(() => displayName.value.slice(0, 1).toUpperCase());

export function useAuth() {
  return { authToken, authUser, hostReady, myGroup, displayName, avatarChar, saveSession, clearSession, initAuth };
}
