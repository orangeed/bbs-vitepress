<template>
  <!-- 登录 / 注册 弹层 -->
  <aside class="modal auth-modal" :class="{ show: open }" :aria-hidden="String(!open)">
    <h3>{{ authTitle }}</h3>
    <p class="sub">{{ authSub }}</p>

    <div class="auth-tabs">
      <button type="button" :class="{ active: authTab === 'login' }" @click="switchTab('login')">登录</button>
      <button type="button" :class="{ active: authTab === 'register' }" @click="switchTab('register')">注册</button>
    </div>

    <!-- 登录 -->
    <form v-show="authTab === 'login'" @submit.prevent="doLogin">
      <div class="field">
        <label>账号（用户名或邮箱）</label>
        <input ref="loginAccountEl" v-model="loginForm.account" type="text" placeholder="用户名 / 邮箱" autocomplete="username">
      </div>
      <div class="field">
        <label>密码</label>
        <input v-model="loginForm.password" type="password" placeholder="请输入密码" autocomplete="current-password">
      </div>
      <button type="submit" class="primary auth-submit" :disabled="loginBusy">{{ loginBusy ? '登录中…' : '登录' }}</button>
    </form>

    <!-- 注册 -->
    <form v-show="authTab === 'register'" @submit.prevent="doRegister">
      <div class="field">
        <label>邮箱</label>
        <input ref="regEmailEl" v-model="regForm.email" type="email" placeholder="用于接收验证码" autocomplete="email">
      </div>
      <div class="field">
        <label>邮箱验证码</label>
        <div class="row">
          <input v-model="regForm.code" type="text" inputmode="numeric" maxlength="6" placeholder="6 位数字" autocomplete="one-time-code">
          <button type="button" :disabled="codeSending" @click="sendRegCode">{{ codeBtnText }}</button>
        </div>
      </div>
      <div class="field">
        <label>用户名</label>
        <input v-model="regForm.username" type="text" placeholder="2-20 个字符" autocomplete="username">
      </div>
      <div class="field">
        <label>密码</label>
        <input v-model="regForm.password" type="password" placeholder="6-32 个字符" autocomplete="new-password">
      </div>
      <button type="submit" class="primary auth-submit" :disabled="registerBusy">{{ registerBusy ? '注册中…' : '注册' }}</button>
    </form>

    <p class="auth-msg" :class="authMsgType">{{ authMsgText }}</p>
  </aside>
</template>

<script setup>
/**
 * 登录 / 注册弹层：表单、验证码倒计时、加解密与请求全部自包含；
 * 登录成功写入全局 authStore（顶栏 / 图床等立刻感知），并通知父组件关闭。
 */
import { ref, reactive, computed, watch, nextTick, onUnmounted } from 'vue';
import { apiRequest, encryptPassword } from '../utils/api';
import { useAuth } from '../utils/authStore';
import { useToast } from '../utils/toast';

const props = defineProps({
  open: Boolean,
  tab: { type: String, default: 'login' }, // 父组件 openAuth('login' | 'register') 指定初始页
});
const emit = defineEmits(['close']);

const { saveSession } = useAuth();
const { toast } = useToast();

const authTab = ref('login');
const authMsgText = ref('');
const authMsgType = ref('');
const loginForm = reactive({ account: '', password: '' });
const regForm = reactive({ email: '', code: '', username: '', password: '' });
const loginBusy = ref(false);
const registerBusy = ref(false);
const codeSending = ref(false);
const codeLeft = ref(0);
const loginAccountEl = ref(null);
const regEmailEl = ref(null);

const authTitle = computed(() => (authTab.value === 'login' ? '登录' : '注册'));
const authSub = computed(() =>
  authTab.value === 'login' ? '登录后可同步你的排版偏好' : '先获取邮箱验证码，验证通过后完成注册',
);
const codeBtnText = computed(() => {
  if (codeLeft.value > 0) return `${codeLeft.value}s 后重发`;
  return codeSending.value ? '发送中…' : '获取验证码';
});

watch(() => props.tab, (t) => {
  authTab.value = t === 'register' ? 'register' : 'login';
});

/* 每次打开：清提示并聚焦第一个输入框 */
watch(() => props.open, (v) => {
  if (!v) return;
  authMsg('');
  nextTick(() => {
    setTimeout(() => {
      const el = authTab.value === 'register' ? regEmailEl.value : loginAccountEl.value;
      if (el) el.focus();
    }, 60);
  });
});

function switchTab(tab) {
  authTab.value = tab === 'register' ? 'register' : 'login';
  authMsg('');
}

function authMsg(text_, type) {
  authMsgText.value = text_ || '';
  authMsgType.value = type || '';
}

let codeTimer = null;
function startCountdown(sec) {
  clearInterval(codeTimer);
  codeLeft.value = sec;
  codeSending.value = true;
  codeTimer = setInterval(() => {
    codeLeft.value--;
    if (codeLeft.value <= 0) {
      clearInterval(codeTimer);
      codeSending.value = false;
    }
  }, 1000);
}
onUnmounted(() => clearInterval(codeTimer));

/* ---------- 发送邮箱验证码（注册前，防恶意注册） ---------- */
async function sendRegCode() {
  const email = regForm.email.trim();
  if (!email) return authMsg('请先填写邮箱', 'err');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return authMsg('邮箱格式不正确', 'err');

  codeSending.value = true;
  try {
    await apiRequest('/login/send-code', { method: 'POST', body: { email } });
    authMsg('验证码已发送，请查收邮箱（5 分钟内有效）', 'ok');
    startCountdown(60);
  } catch (err) {
    authMsg(err.message, 'err');
    codeSending.value = false;
  }
}

/* ---------- 登录 ---------- */
async function doLogin() {
  const account = loginForm.account.trim();
  const password = loginForm.password;
  if (!account) return authMsg('请填写账号', 'err');
  if (!password) return authMsg('请填写密码', 'err');

  loginBusy.value = true;
  try {
    const encrypted = await encryptPassword(password);
    const data = await apiRequest('/login/login', { method: 'POST', body: { account, password: encrypted } });
    saveSession(data.token, data.userInfo);
    emit('close');
    loginForm.password = '';
    toast('欢迎回来，' + ((data.userInfo && data.userInfo.username) || account));
  } catch (err) {
    authMsg(err.message, 'err');
  } finally {
    loginBusy.value = false;
  }
}

/* ---------- 注册（校验邮箱验证码后落库，成功即自动登录） ---------- */
async function doRegister() {
  const email = regForm.email.trim();
  const code = regForm.code.trim();
  const username = regForm.username.trim();
  const password = regForm.password;

  if (!email) return authMsg('请填写邮箱', 'err');
  if (!/^\d{6}$/.test(code)) return authMsg('请填写 6 位邮箱验证码', 'err');
  if (username.length < 2 || username.length > 20) return authMsg('用户名长度为 2-20 个字符', 'err');
  if (password.length < 6 || password.length > 32) return authMsg('密码长度为 6-32 个字符', 'err');

  registerBusy.value = true;
  try {
    const encrypted = await encryptPassword(password);
    await apiRequest('/login/register', {
      method: 'POST',
      body: { email, code, username, password: encrypted },
    });
  } catch (err) {
    authMsg(err.message, 'err');
    return;
  } finally {
    registerBusy.value = false;
  }

  // 注册成功即自动登录；万一失败则切回登录页并回填账号
  try {
    const encrypted = await encryptPassword(password);
    const data = await apiRequest('/login/login', { method: 'POST', body: { account: username, password: encrypted } });
    saveSession(data.token, data.userInfo);
    emit('close');
    toast('注册成功，已登录：' + username);
  } catch (err) {
    switchTab('login');
    loginForm.account = username;
    authMsg('注册成功，请使用刚设置的密码登录', 'ok');
  }
}
</script>

<style scoped src="../utils/modal-base.css"></style>
<style scoped>
.auth-modal{width:min(400px,92vw);padding:24px 26px 22px}
.auth-modal h3{margin:0 0 3px;font-size:17px;color:var(--primary)}
.auth-modal .sub{margin:0 0 16px}
.auth-tabs{display:flex;gap:5px;padding:4px;margin-bottom:18px;background:var(--accent-soft);border-radius:8px}
.auth-tabs button{flex:1;padding:7px 0;border:0;border-radius:6px;background:transparent;color:var(--muted);font-size:13px}
.auth-tabs button.active{background:#fff;color:var(--primary);font-weight:600}
.field{margin-bottom:13px}
.field label{display:block;margin-bottom:6px;font-size:12px;color:var(--muted)}
.field input{
  width:100%;padding:10px 12px;font-family:inherit;font-size:13px;color:var(--ink);
  background:#fff;border:1px solid var(--line);border-radius:8px;outline:none;transition:border-color .15s;
}
.field input:focus{border-color:var(--accent)}
.field .row{display:flex;gap:8px}
.field .row input{flex:1;min-width:0}
.field .row button{flex:0 0 auto;padding:0 12px;border-radius:8px;white-space:nowrap}
.auth-submit{width:100%;margin-top:8px;padding:11px 0;border-radius:8px;font-size:14px}
</style>
