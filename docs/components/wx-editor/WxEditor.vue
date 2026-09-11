<template>
  <div class="tf-editor">
    <header>
      <div class="brand"><b>听风入画</b><span>Markdown 排版工具</span></div>
      <div class="hint-bar">
        <span><kbd>Ctrl</kbd>+<kbd>S</kbd> 存草稿</span>
        <span><kbd>Ctrl</kbd>+<kbd>B</kbd> 加粗</span>
        <span>右侧预览 · 一键粘进公众号</span>
      </div>
      <!-- 账号状态：未登录显示 登录/注册，已登录显示用户名 + 退出 -->
      <div class="auth-area">
        <template v-if="authToken">
          <span class="user">
            <span class="avatar">{{ avatarChar }}</span>
            <span class="name" :title="displayName">{{ displayName }}</span>
          </span>
          <button class="hd" :disabled="logoutBusy" @click="doLogout">{{ logoutBusy ? '退出中…' : '退出' }}</button>
        </template>
        <template v-else>
          <button class="hd" @click="openAuth('login')">登录</button>
          <button class="hd primary" @click="openAuth('register')">注册</button>
        </template>
      </div>
    </header>

    <main>
      <!-- 左：编辑 -->
      <section class="pane pane-left">
        <div class="pane-head">
          <span class="title">MARKDOWN 原稿</span>
          <button class="ghost" @click="modalOpen = true">图片清单</button>
          <button class="ghost" @click="pickFile">导入 .md</button>
          <button class="ghost" @click="loadSample">载入示例</button>
          <button class="ghost" @click="downloadMd">下载</button>
          <button class="ghost" @click="clearAll">清空</button>
          <button class="ghost" title="查看所有快捷键（Ctrl+?）" @click="keysOpen = !keysOpen">⌨ 快捷键</button>
        </div>
        <textarea
          ref="editorEl"
          v-model="text"
          class="editor"
          spellcheck="false"
          placeholder="在这里粘贴或撰写 Markdown 原文……"
          @input="onInput"
          @keydown="onKeydown"
          @paste="onPaste"
          @drop="onDrop"
        ></textarea>
        <div class="snippets">
          <span class="lbl">快捷插入：</span>
          <button v-for="s in SNIPPETS" :key="s.label" class="mini" @click="insertText(s.text)">{{ s.label }}</button>
        </div>
        <div class="stat" v-html="statHtml"></div>
      </section>

      <!-- 右：预览 -->
      <section class="pane pane-right">
        <div class="pane-head">
          <span class="title">公众号预览</span>
          <select v-model="conf.theme" class="ctrl" title="整体配色">
            <option v-for="(t, k) in THEMES" :key="k" :value="k">{{ t.name }}</option>
          </select>
          <select v-model="conf.archiveStyle" class="ctrl" title="往期推荐模块样式">
            <option value="dash">往期 · 虚线框</option>
            <option value="card">往期 · 卡片列表</option>
            <option value="plain">往期 · 简约条目</option>
            <option value="dark">往期 · 深色块</option>
          </select>
          <select v-model="conf.followStyle" class="ctrl" title="关注引导模块样式">
            <option value="card">引导 · 居中卡片</option>
            <option value="quote">引导 · 左侧金条</option>
            <option value="dark">引导 · 深色块</option>
          </select>
          <select v-model="conf.codeStyle" class="ctrl" title="代码块与行内代码样式">
            <option value="github">代码 · GitHub 浅色</option>
            <option value="github-dark">代码 · GitHub 深色</option>
            <option value="theme">代码 · 跟随主题</option>
          </select>
          <label class="ctrl"><input v-model="conf.hl" type="checkbox"> 语法高亮</label>
          <label class="ctrl" :title="hostReady ? '粘贴/拖入的图片会从浏览器直传 ImgBB，换取可直接引用的外链（不经过你的服务器）' : '还没配置图床：点右侧「图床设置」填 ImgBB API Key；未配置时图片会内嵌成 base64'"><input v-model="conf.uploadImg" type="checkbox"> 图片上传图床</label>
          <button v-if="BACKEND_GALLERY" class="ghost" title="查看 / 管理我上传的图片（按登录账号分组）" @click="openImgs">我的图片</button>
          <button class="ghost" :class="{ 'need-key': !hostReady }" title="配置 ImgBB API Key：图片直传第三方图床，不占你的服务器" @click="openHost">图床设置</button>
          <label class="ctrl">字号 <input v-model.number="conf.size" type="range" min="14" max="17" step="1"><span>{{ conf.size }}px</span></label>
          <label class="ctrl"><input v-model="conf.showUrl" type="checkbox"> 显示链接地址</label>
          <button class="ghost" @click="cheatOpen = !cheatOpen">语法速查</button>
          <button class="ghost" @click="copyHtmlSource">复制 HTML</button>
          <button class="primary" @click="copyToMp">复制到公众号</button>
        </div>
        <div class="preview-wrap">
          <div class="phone">
            <div class="phone-bar"><i></i><i></i><i></i></div>
            <div class="phone-body" v-html="previewDisplay"></div>
          </div>
        </div>
      </section>
    </main>

    <!-- 快捷键浮层（居中弹层） -->
    <aside class="keys-modal" :class="{ open: keysOpen }" :aria-hidden="String(!keysOpen)">
      <header>
        <span class="keys-title">⌨ 快捷键</span>
        <button class="cheat-close" title="关闭（Esc）" @click="keysOpen = false">×</button>
      </header>
      <section class="keys-body">
        <h4>撤销 / 重做</h4>
        <dl>
          <dt><kbd>Ctrl</kbd>+<kbd>Z</kbd></dt><dd>撤销（Mac 同样为 ⌘+Z）</dd>
          <dt><kbd>Ctrl</kbd>+<kbd>Y</kbd></dt><dd>重做</dd>
          <dt><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd></dt><dd>重做（Mac 习惯写法）</dd>
        </dl>
        <h4>格式</h4>
        <dl>
          <dt><kbd>Ctrl</kbd>+<kbd>B</kbd></dt><dd>加粗（无选区时插入「加粗」）</dd>
          <dt><kbd>Ctrl</kbd>+<kbd>I</kbd></dt><dd>高亮 ==xx==（无选区时插入「高亮」）</dd>
          <dt><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd></dt><dd>删除线 ~~xx~~（无选区时插入「删除线」）</dd>
        </dl>
        <h4>操作</h4>
        <dl>
          <dt><kbd>Ctrl</kbd>+<kbd>S</kbd></dt><dd>手动保存草稿到 localStorage</dd>
          <dt><kbd>Esc</kbd></dt><dd>关闭弹窗 / 速查 / 快捷键面板</dd>
        </dl>
        <p class="keys-hint">提示：撤销/重做基于输入停顿 500ms 自动快照，最多保留 50 步历史。</p>
      </section>
    </aside>

    <!-- 语法速查抽屉（内容含多行代码示例，必须用 v-html，否则模板会吃掉换行） -->
    <aside class="cheat" :class="{ open: cheatOpen }">
      <button class="cheat-close" title="关闭（Esc）" @click="cheatOpen = false">×</button>
      <div v-html="CHEAT_HTML"></div>
    </aside>

    <div class="mask" :class="{ show: maskShow }" @click="closeAllPanels"></div>

    <!-- 图片清单 -->
    <div class="modal" :class="{ show: modalOpen }">
      <h3>图片清单</h3>
      <p class="sub">共 {{ images.length }} 张。标红的 <b>本地图片</b> 粘贴进公众号后会丢失：可点「上传图床」换成外链，或下载后去公众号后台上传替换。</p>
      <template v-if="images.length">
        <div v-for="(im, i) in images" :key="i" class="img-row">
          <img :src="im.url" alt="">
          <div class="meta">
            <div class="name" v-html="altName(im)"></div>
            <span class="tagx" :class="im.local ? 'local' : 'remote'">{{ im.local ? '本地 · 微信粘贴会丢失，需替换' : '外链 · ' + im.host }}</span>
          </div>
          <button v-if="im.local && /^data:/.test(im.url)" class="mini" :disabled="uploading" @click="uploadOneLocal(im)">上传图床</button>
          <button v-if="im.local" class="mini" @click="downloadImage(im)">下载</button>
        </div>
      </template>
      <p v-else class="sub">文中还没有图片。可以直接 Ctrl+V 把截图粘到左侧编辑器里。</p>
      <p v-if="images.some((im) => /^data:/.test(im.url)) && !hostReady" class="host-warn">
        还没配置图床：点右上角「图床设置」填入 ImgBB API Key，就能把本地图片换成外链（图片直传 ImgBB，不占你的服务器）。
      </p>
      <div style="margin-top:16px;display:flex;align-items:center;justify-content:space-between;gap:10px">
        <button
          v-if="images.some((im) => /^data:/.test(im.url))"
          class="mini"
          :disabled="uploading"
          @click="uploadAllLocal"
        >{{ uploading ? '上传中…' : '全部上传图床' }}</button>
        <span v-else></span>
        <button class="primary" @click="modalOpen = false">知道了</button>
      </div>
    </div>

    <!-- 登录 / 注册 弹层 -->
    <aside class="modal auth-modal" :class="{ show: authOpen }" :aria-hidden="String(!authOpen)">
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

    <!-- 图床设置：ImgBB 直传，Key 只存本机浏览器 -->
    <aside class="modal host-modal" :class="{ show: hostOpen }" :aria-hidden="String(!hostOpen)">
      <h3>图床设置</h3>
      <p class="sub">
        粘贴 / 拖入的图片会从浏览器<b>直传 ImgBB</b>，换取可直接引用的外链 ——
        不经过你自己的服务器，不占服务器磁盘和带宽。
      </p>

      <div class="field">
        <label>ImgBB API Key</label>
        <input
          v-model.trim="imgbbDraft"
          type="text"
          placeholder="粘贴你的 API Key"
          spellcheck="false"
          autocomplete="off"
          @keyup.enter="saveImgbbKey"
        >
      </div>

      <p class="host-tip">
        在 <a href="https://api.imgbb.com/" target="_blank" rel="noreferrer">api.imgbb.com</a> 登录后点
        「Get API key」即可免费获取（一个账号一个 Key）。Key 只保存在本机浏览器，不会被上传到任何服务器。
        注意：ImgBB 没有相册 / 分组概念，所有图都会混在同一个 Key 下，且第三方外链有失效风险。
      </p>

      <p class="auth-msg" :class="hostMsgType">{{ hostMsgText }}</p>

      <div class="host-foot">
        <button class="mini" @click="saveImgbbKey">保存</button>
        <button v-if="imgbbKey" class="mini danger" @click="clearImgbbKey">清除 Key</button>
        <span style="flex:1"></span>
        <span class="host-state">{{ hostReady ? '图床已就绪' : '未配置 · 图片会内嵌 base64' }}</span>
        <button class="primary" @click="hostOpen = false">关闭</button>
      </div>
    </aside>

    <!-- 我的图片：按登录账号分组（依赖自建后端，方案 A 下不展示入口） -->
    <aside
      v-if="BACKEND_GALLERY"
      class="modal imgs-modal"
      :class="{ show: imgsOpen }"
      :aria-hidden="String(!imgsOpen)"
    >
      <h3>我的图片</h3>
      <p class="sub">
        <template v-if="hostReady">
          当前账号 <b>{{ displayName }}</b> 上传的图，分组 <b>{{ myGroup }}</b>。点「插入」放到正文光标处，或复制链接自行引用。
        </template>
        <template v-else>登录后这里会按账号分组，展示你自己上传的图片。</template>
      </p>

      <div v-if="!hostReady" class="imgs-login">
        <button class="primary" @click="openAuth('login')">登录 / 注册</button>
      </div>
      <template v-else>
        <div class="imgs-toolbar">
          <input
            v-model.trim="imgsKeyword"
            class="ctrl"
            type="text"
            placeholder="按文件名筛选"
            @keyup.enter="loadMyImages(true)"
          >
          <button class="mini" :disabled="imgsLoading" @click="loadMyImages(true)">{{ imgsLoading ? '加载中…' : '刷新' }}</button>
          <span style="flex:1"></span>
          <span class="imgs-count">共 {{ imgsTotal }} 张</span>
        </div>

        <p v-if="imgsMsgText" class="auth-msg" :class="imgsMsgType">{{ imgsMsgText }}</p>

        <div v-if="!myImgs.length" class="imgs-empty">
          <template v-if="imgsLoading">正在加载…</template>
          <template v-else-if="imgsKeyword">没有匹配「{{ imgsKeyword }}」的图片</template>
          <template v-else>还没有上传过图片。在编辑器里粘贴 / 拖入图片，就会自动传到你的分组。</template>
        </div>
        <template v-else>
          <div v-for="im in myImgs" :key="im.id" class="img-row">
            <img :src="im.url" alt="">
            <div class="meta">
              <div class="name">{{ im.name }}</div>
              <span class="tagx remote">{{ kbSize(im.size) }} · {{ fmtTime(im.createTime) }}</span>
            </div>
            <div class="imgs-acts">
              <button class="mini" @click="useMyImage(im)">插入</button>
              <button class="mini" @click="copyMyImage(im)">复制链接</button>
              <button class="mini danger" :disabled="imgsBusyId === im.id" @click="removeMyImage(im)">
                {{ imgsBusyId === im.id ? '删除中…' : '删除' }}
              </button>
            </div>
          </div>
          <div v-if="myImgs.length < imgsTotal" class="imgs-more">
            <button class="mini" :disabled="imgsLoading" @click="loadMyImages(false)">
              {{ imgsLoading ? '加载中…' : `加载更多（还有 ${imgsTotal - myImgs.length} 张）` }}
            </button>
          </div>
        </template>
      </template>

      <div class="imgs-foot">
        <span style="flex:1"></span>
        <button class="primary" @click="imgsOpen = false">关闭</button>
      </div>
    </aside>

    <div class="toast" :class="{ show: toastShow }">{{ toastText }}</div>
    <input ref="fileEl" type="file" accept=".md,.markdown,.txt" style="display:none" @change="onFileChange">
  </div>
</template>

<script setup>
/**
 * 「听风入画」公众号 Markdown 排版工具
 *
 * 由 public/wx-editor/wxEditor.html 迁移而来：渲染引擎在同目录的 ./renderer.ts，
 * 快捷片段与示例文稿在 ./content.ts，本文件只负责界面与交互。
 *
 * 注意：高亮资源从同目录的 ./lib 动态加载（浏览器版 highlight.js 不能按 ESM 打包），
 * 缺失时自动回退到 renderer.ts 里的内置高亮。组件按 SSR 安全写法实现：
 * 所有 window / document / localStorage 访问都在 onMounted 之后或事件回调里。
 */
import { ref, reactive, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { THEMES, buildHtml, esc } from './renderer';
import { SNIPPETS, SAMPLE, CHEAT_HTML } from './content';

/** ready：初始化完成（草稿/配置已恢复、highlight.js 已加载并重渲染），供外层收起 Loading */
const emit = defineEmits(['ready']);

/* ---------------- 常量 ---------------- */
const LS_DRAFT = 'tingfeng_md_draft';
const LS_CONF = 'tingfeng_md_conf';
const LS_TOKEN = 'tingfeng_token';
const LS_USER = 'tingfeng_user';
const LS_IMGBB = 'tingfeng_imgbb_key';

/* 方案 A：图片从浏览器直传 ImgBB，不经过自家后端。
   「我的图片」分组画廊依赖自建后端（部署后把这里改成 true 即可恢复入口）。 */
const BACKEND_GALLERY = false;
const IMGBB_UPLOAD = 'https://api.imgbb.com/1/upload';

const MAX_IMG_W = 1080;
const UNDO_MAX = 50;
const UNDO_DEBOUNCE = 500;
const IMG_RE = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const PREVIEW_EMPTY = '<p style="color:#C4C4C4;font-size:13px;text-align:center;padding:60px 0">左侧开始写，这里实时预览</p>';

/* highlight.js 资源（与组件同目录的 ./lib，整站部署 / 打包 App 均离线可用）
   浏览器版 highlight.js 是 UMD 脚本、不能按 ESM 打包，所以交给 Vite 当静态资源处理：
   ?url 会带上 base 前缀和内容 hash，换域名或部署到子路径都不用改代码。 */
const LIB_URLS = import.meta.glob('./lib/*.js', { query: '?url', import: 'default', eager: true });
const HLJS_CORE = './lib/highlight.min.js';
const HLJS_LANGS = [
  './lib/lang-javascript.min.js', './lib/lang-typescript.min.js', './lib/lang-python.min.js', './lib/lang-bash.min.js',
  './lib/lang-shell.min.js', './lib/lang-sql.min.js', './lib/lang-json.min.js', './lib/lang-yaml.min.js', './lib/lang-xml.min.js',
  './lib/lang-css.min.js', './lib/lang-c.min.js', './lib/lang-cpp.min.js', './lib/lang-csharp.min.js', './lib/lang-objectivec.min.js',
  './lib/lang-java.min.js', './lib/lang-go.min.js', './lib/lang-php.min.js',
];

/* ---------------- 编辑器状态 ---------------- */
const editorEl = ref(null);
const fileEl = ref(null);
const text = ref(SAMPLE);
const previewHtml = ref('');
const statHtml = ref('0 字');
const conf = reactive({
  theme: 'moqing', size: 15, showUrl: true, archiveStyle: 'dash',
  followStyle: 'card', codeStyle: 'github', hl: true, uploadImg: true,
});

/* 浮层 */
const cheatOpen = ref(false);
const keysOpen = ref(false);
const modalOpen = ref(false);
const toastShow = ref(false);
const toastText = ref('');
const uploading = ref(false); // 图床上传中

/* 图床设置弹层（ImgBB API Key，只存本机 localStorage） */
const hostOpen = ref(false);
const imgbbKey = ref('');
const imgbbDraft = ref('');
const hostMsgText = ref('');
const hostMsgType = ref('');

/* 我的图片弹层（按登录账号分组） */
const imgsOpen = ref(false);
const myImgs = ref([]);
const imgsTotal = ref(0);
const imgsPage = ref(1);
const imgsLoading = ref(false);
const imgsBusyId = ref(0);
const imgsKeyword = ref('');
const imgsMsgText = ref('');
const imgsMsgType = ref('');

/* 账号 */
const authOpen = ref(false);
const authTab = ref('login');
const authMsgText = ref('');
const authMsgType = ref('');
const authToken = ref('');
const authUser = ref(null);
const loginForm = reactive({ account: '', password: '' });
const regForm = reactive({ email: '', code: '', username: '', password: '' });
const loginBusy = ref(false);
const registerBusy = ref(false);
const logoutBusy = ref(false);
const codeSending = ref(false);
const codeLeft = ref(0);
const loginAccountEl = ref(null);
const regEmailEl = ref(null);

/* ---------------- 计算属性 ---------------- */
const previewDisplay = computed(() => previewHtml.value || PREVIEW_EMPTY);
const maskShow = computed(
  () =>
    cheatOpen.value || keysOpen.value || modalOpen.value || authOpen.value || imgsOpen.value || hostOpen.value,
);
/* 图床是否可用：配好 ImgBB API Key 即可 —— 浏览器直传 ImgBB，不经过自家服务器 */
const hostReady = computed(() => !!imgbbKey.value.trim());
/* 当前账号的分组名，与后端 uploads/u{uid}/ 一一对应 */
const myGroup = computed(() => (authUser.value && authUser.value.id ? 'u' + authUser.value.id : ''));
const displayName = computed(() => (authUser.value && (authUser.value.username || authUser.value.email)) || '已登录');
const avatarChar = computed(() => displayName.value.slice(0, 1).toUpperCase());
const authTitle = computed(() => (authTab.value === 'login' ? '登录' : '注册'));
const authSub = computed(() =>
  authTab.value === 'login' ? '登录后可同步你的排版偏好' : '先获取邮箱验证码，验证通过后完成注册',
);
const codeBtnText = computed(() => {
  if (codeLeft.value > 0) return `${codeLeft.value}s 后重发`;
  return codeSending.value ? '发送中…' : '获取验证码';
});
const images = computed(() =>
  scanImages(text.value).map((im) => {
    let host = '本地图片';
    if (!im.local) {
      try {
        host = new URL(im.url).hostname;
      } catch (e) {
        host = im.url.slice(0, 30);
      }
    }
    return { ...im, host };
  }),
);

/* ---------------- 工具 ---------------- */
/* 扫描文中图片，区分本地（data:/相对路径，微信粘不了）与外链 */
function scanImages(src) {
  const out = [];
  const re = new RegExp(IMG_RE.source, 'g');
  let m;
  while ((m = re.exec(src))) {
    out.push({ alt: m[1], url: m[2], local: /^(data:|file:|blob:|\.{0,2}\/|[A-Za-z]:)/.test(m[2]) });
  }
  return out;
}

function altName(im) {
  return im.alt ? esc(im.alt) : '<span style="color:#9A9A9A">（未写图注）</span>';
}

let toastTimer = null;
function toast(msg) {
  toastText.value = msg;
  toastShow.value = true;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastShow.value = false;
  }, 2000);
}

/* ---------------- 渲染 ---------------- */
let renderTimer = null;
let draftTimer = null;

function currentHtml() {
  return buildHtml(
    text.value, conf.theme, Number(conf.size), conf.showUrl,
    conf.archiveStyle, conf.followStyle, conf.codeStyle, conf.hl,
  );
}

function render() {
  previewHtml.value = currentHtml();

  const imgs = scanImages(text.value);
  const localN = imgs.filter((i) => i.local).length;
  const len = text.value.replace(/\s/g, '').length;
  statHtml.value =
    `${len} 字 · ${text.value.split('\n').length} 行` +
    (imgs.length ? ` · 图片 ${imgs.length} 张` : '') +
    (localN ? ` · <b>${localN} 张为本地图，发布前需替换</b>` : '');

  clearTimeout(draftTimer);
  draftTimer = setTimeout(() => {
    try {
      localStorage.setItem(LS_DRAFT, text.value);
    } catch (e) {
      /* 草稿超出 localStorage 配额（多为 base64 图片），跳过自动保存 */
    }
  }, 400);
}

/* 输入改防抖：正文含 base64 图片时文档可达数 MB，逐帧渲染会拖垮页面 */
function scheduleRender() {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(render, text.value.length > 100000 ? 320 : 90);
}

let ready = false;
watch(conf, () => {
  if (!ready) return;
  try {
    localStorage.setItem(LS_CONF, JSON.stringify(conf));
  } catch (e) {
    /* 忽略隐私模式下的写入失败 */
  }
  render();
});

/* ---------------- 撤销 / 重做（手动历史栈，500ms 停顿自动快照） ---------------- */
let undoStack = [''];
let undoIndex = 0;
let undoTimer = null;
let isUndoing = false;

function pushHistory() {
  if (isUndoing) return; // 自己设值时跳过
  // 截断未来分支：撤销后改过内容就回不去了
  if (undoIndex < undoStack.length - 1) undoStack.length = undoIndex + 1;
  const v = text.value;
  if (v === undoStack[undoStack.length - 1]) return; // 去重：内容未变不推
  undoStack.push(v);
  if (undoStack.length > UNDO_MAX) undoStack.shift();
  undoIndex = undoStack.length - 1;
}

function schedulePush() {
  clearTimeout(undoTimer);
  undoTimer = setTimeout(pushHistory, UNDO_DEBOUNCE);
}

function undo() {
  if (undoIndex <= 0) return toast('已是最早');
  undoIndex--;
  isUndoing = true;
  text.value = undoStack[undoIndex];
  render();
  isUndoing = false;
  toast('已撤销');
}

function redo() {
  if (undoIndex >= undoStack.length - 1) return toast('已是最新');
  undoIndex++;
  isUndoing = true;
  text.value = undoStack[undoIndex];
  render();
  isUndoing = false;
  toast('已重做');
}

function resetHistory(v) {
  clearTimeout(undoTimer);
  undoStack = [v || ''];
  undoIndex = 0;
  isUndoing = false;
}

/* ---------------- 编辑区交互 ---------------- */
function onInput() {
  scheduleRender();
  schedulePush();
}

async function insertText(t) {
  const el = editorEl.value;
  if (!el) return;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const v = text.value;
  const before = v.slice(0, start);
  const after = v.slice(end);
  const pre = before && !before.endsWith('\n') ? '\n\n' : '';

  text.value = before + pre + t + '\n\n' + after;
  await nextTick();
  const pos = (before + pre + t + '\n\n').length;
  el.focus();
  el.setSelectionRange(pos, pos);
  render();
  pushHistory();
}

function onKeydown(e) {
  const el = editorEl.value;
  if (!el) return;
  const mod = e.ctrlKey || e.metaKey; // 兼容 Mac 的 ⌘

  // 撤销 / 重做（优先拦截，避免与浏览器原生 undo 冲突）
  if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) {
    e.preventDefault();
    undo();
    return;
  }
  if ((mod && e.key.toLowerCase() === 'y') || (mod && e.shiftKey && e.key.toLowerCase() === 'z')) {
    e.preventDefault();
    redo();
    return;
  }
  if (mod && e.key.toLowerCase() === 's') {
    e.preventDefault();
    try {
      localStorage.setItem(LS_DRAFT, text.value);
    } catch (err) {
      /* 配额超限时忽略 */
    }
    toast('草稿已保存到本地');
    return;
  }

  // 包裹类语法：**加粗** ==高亮== ~~删除线~~
  const wrap = (marker, placeholder) => {
    e.preventDefault();
    const s = el.selectionStart;
    const en = el.selectionEnd;
    const v = text.value;
    const inner = v.slice(s, en) || placeholder;
    text.value = v.slice(0, s) + marker + inner + marker + v.slice(en);
    const endPos = en + marker.length;
    nextTick(() => {
      el.focus();
      el.setSelectionRange(endPos, endPos);
    });
    render();
    pushHistory();
  };
  if (mod && e.key.toLowerCase() === 'b') return wrap('**', '加粗');
  if (mod && e.key.toLowerCase() === 'i') return wrap('==', '高亮');
  if (mod && e.shiftKey && e.key.toLowerCase() === 'x') return wrap('~~', '删除线');
}

/* ---------------- 粘贴 / 拖拽图片（压缩后转 dataURL，图注占位自动选中） ---------------- */
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;
        if (w > MAX_IMG_W) {
          h = Math.round((h * MAX_IMG_W) / w);
          w = MAX_IMG_W;
        }
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const g = c.getContext('2d');
        g.fillStyle = '#FFFFFF';
        g.fillRect(0, 0, w, h);
        g.drawImage(img, 0, 0, w, h);
        let out = c.toDataURL('image/png');
        if (out.length > 900 * 1024) out = c.toDataURL('image/jpeg', 0.85);
        resolve(out);
      };
      img.onerror = reject;
      img.src = fr.result;
    };
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

/* pos 为 null 时插到当前光标处；返回 alt 的起止位置与下一次插入点 */
function insertImageMd(dataUrl, alt, pos) {
  const el = editorEl.value;
  const v = text.value;
  const s = pos == null ? (el ? el.selectionStart : v.length) : pos;
  const e = pos == null ? (el ? el.selectionEnd : v.length) : pos;
  const before = v.slice(0, s);
  const after = v.slice(e);
  const pre = before && !before.endsWith('\n') ? '\n\n' : '';
  const ins = `${pre}![${alt}](${dataUrl})\n\n`;

  text.value = before + ins + after;
  const altStart = (before + pre + '![').length;
  return { altStart, altEnd: altStart + alt.length, next: (before + ins).length };
}

async function handleImageFiles(files) {
  const imgs = [...files].filter((f) => f.type.startsWith('image/'));
  if (!imgs.length) return;

  // 是否走图床：开关打开且配好了 ImgBB Key（浏览器直传第三方），否则退回本地 base64
  const useHost = conf.uploadImg && hostReady.value;
  toast(useHost ? '正在压缩并上传图床…' : '正在处理图片…');

  let pos = null;
  let first = null;
  let uploaded = 0;
  let lastErr = '';
  for (const f of imgs) {
    const dataUrl = await fileToDataUrl(f);
    let url = dataUrl;
    if (useHost) {
      try {
        url = await uploadToHost(dataUrl);
        uploaded++;
      } catch (e) {
        lastErr = e.message || String(e);
      }
    }
    const r = insertImageMd(url, '图片描述', pos);
    if (!first) first = r;
    pos = r.next;
  }

  render();
  await nextTick();
  const el = editorEl.value;
  if (el) {
    el.focus();
    el.setSelectionRange(first.altStart, first.altEnd);
  }

  const n = imgs.length;
  if (!conf.uploadImg) {
    toast(n === 1 ? '已插入 1 张（未开启图床，内嵌 base64）' : `已插入 ${n} 张（未开启图床，内嵌 base64）`);
  } else if (!hostReady.value) {
    toast('还没配置图床，图片已内嵌为 base64；点「图床设置」填 ImgBB Key 即可自动换外链');
  } else if (!uploaded) {
    // 配了图床但全部失败：必须显式告知，否则用户只会看到文中出现一大串 base64
    toast(`图床上传失败：${lastErr || '图床不可用'}，已改为本地 base64 插入`);
  } else if (uploaded === n) {
    toast(n === 1 ? '已上传图床并插入，图注已选中，直接打字替换' : `已上传 ${n} 张到图床并插入，第一张的图注已选中`);
  } else {
    toast(`已插入 ${n} 张（${uploaded} 张已上传图床，其余失败改为 base64），第一张的图注已选中`);
  }
}

/* ---------------- 图床：ImgBB 直传（浏览器 → ImgBB，不经过自家服务器） ----------------
   为什么不走自建后端：图片不落自家服务器，磁盘 / 带宽零占用，2 核 2G 的机器毫无压力。
   代价：ImgBB 官方 API 只有 key / image / name / expiration 四个参数，没有相册 / 分组概念，
        图片都混在同一个 Key 下；且外链属第三方，随时可能被清理。
   接口：POST https://api.imgbb.com/1/upload?key=xxx，form-data 传 image（base64，不含 data: 前缀） */
async function uploadToImgbb(dataUrl) {
  const key = imgbbKey.value.trim();
  if (!key) throw new Error('还没配置图床，点「图床设置」填入 ImgBB API Key');

  const fd = new FormData();
  fd.append('image', String(dataUrl).replace(/^data:[^;,]+;base64,/, ''));
  fd.append('name', `wx-editor-${Date.now().toString(36)}`);

  let res;
  try {
    res = await fetch(`${IMGBB_UPLOAD}?key=${encodeURIComponent(key)}`, { method: 'POST', body: fd });
  } catch (e) {
    throw new Error('连不上 ImgBB（网络不通或跨域被拦）');
  }

  let json = null;
  try {
    json = await res.json();
  } catch (e) {
    /* 无响应体时忽略 */
  }

  if (!json || !json.success || !json.data || !json.data.url) {
    // 失败时 ImgBB 返回 { error: { message, code } }，例如 code 103 表示 Key 无效
    const msg = (json && json.error && json.error.message) || `HTTP ${res.status}`;
    throw new Error(`ImgBB 返回错误：${msg}`);
  }
  return json.data.url;
}

/* 上传入口：当前实现为 ImgBB 直传；将来若改走自建后端，只改这一处 */
async function uploadToHost(dataUrl) {
  return uploadToImgbb(dataUrl);
}

/* 上传前的统一检查：没配 Key 就打开「图床设置」引导 */
function ensureHost() {
  if (hostReady.value) return true;
  openHost();
  toast('请先填写 ImgBB API Key：图片直传 ImgBB，不经过你的服务器');
  return false;
}

/* ---------- 图床设置：ImgBB API Key（只存本机 localStorage） ---------- */
function hostMsg(text, type) {
  hostMsgText.value = text || '';
  hostMsgType.value = type || '';
}

function openHost() {
  closeAllPanels();
  imgbbDraft.value = imgbbKey.value;
  hostMsg('', '');
  hostOpen.value = true;
}

function saveImgbbKey() {
  const k = imgbbDraft.value.trim();
  imgbbKey.value = k;
  try {
    if (k) localStorage.setItem(LS_IMGBB, k);
    else localStorage.removeItem(LS_IMGBB);
  } catch (e) {
    /* 隐私模式下忽略 */
  }
  if (k) {
    hostMsg('已保存。以后粘贴 / 拖入图片会直传 ImgBB，正文里写的是外链。', 'ok');
    toast('图床已就绪，粘贴图片会自动上传');
  } else {
    hostMsg('已清空，图片会内嵌成 base64（粘贴进公众号会丢失）。', 'err');
  }
}

function clearImgbbKey() {
  imgbbDraft.value = '';
  saveImgbbKey();
}

/* 启动时恢复本机保存的 Key */
function initHost() {
  try {
    imgbbKey.value = localStorage.getItem(LS_IMGBB) || '';
  } catch (e) {
    /* 忽略 */
  }
}

/* ---------- 我的图片：只列当前登录账号自己的图 ---------- */
function imgsMsg(text, type) {
  imgsMsgText.value = text || '';
  imgsMsgType.value = type || '';
}

function openImgs() {
  closeAllPanels();
  imgsOpen.value = true;
  imgsMsg('');
  if (hostReady.value) loadMyImages(true);
}

/** reset=true 回到第一页（替换列表）；false 追加下一页 */
async function loadMyImages(reset) {
  if (!authToken.value || imgsLoading.value) return;
  if (reset) {
    imgsPage.value = 1;
    imgsMsg('');
  }
  imgsLoading.value = true;
  try {
    const qs = new URLSearchParams({ page: String(imgsPage.value), size: '20' });
    if (imgsKeyword.value) qs.set('keyword', imgsKeyword.value);
    const data = await apiRequest('/upload/images?' + qs.toString(), { auth: true });
    const list = (data && data.list) || [];
    myImgs.value = reset ? list : myImgs.value.concat(list);
    imgsTotal.value = (data && data.total) || 0;
    imgsPage.value += 1;
  } catch (e) {
    imgsMsg(e.message || '加载失败', 'err');
  } finally {
    imgsLoading.value = false;
  }
}

function kbSize(n) {
  const v = Number(n) || 0;
  if (v >= 1024 * 1024) return (v / 1024 / 1024).toFixed(1) + ' MB';
  return Math.max(1, Math.round(v / 1024)) + ' KB';
}

function fmtTime(t) {
  const d = new Date(t);
  if (!t || Number.isNaN(d.getTime())) return '';
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/* 插入到正文当前光标处，图注占位自动选中 */
async function useMyImage(im) {
  const r = insertImageMd(im.url, '图片描述', null);
  closeAllPanels();
  render();
  await nextTick();
  const el = editorEl.value;
  if (el) {
    el.focus();
    el.setSelectionRange(r.altStart, r.altEnd);
  }
  pushHistory();
  toast('已插入正文，图注已选中，直接打字替换');
}

function copyMyImage(im) {
  fallbackCopy(im.url, '图片链接已复制');
}

/* 删除自己的图：后端按 uid 校验归属，删别人的会被挡掉 */
async function removeMyImage(im) {
  if (imgsBusyId.value) return;
  const used = text.value.includes(im.url);
  const tip = used
    ? '这张图正在正文里引用，删除后正文里的链接会失效。确定删除？'
    : '确定删除这张图片？删除后外链立即失效。';
  if (!confirm(tip)) return;

  imgsBusyId.value = im.id;
  try {
    await apiRequest('/upload/images/' + im.id, { method: 'DELETE', auth: true });
    myImgs.value = myImgs.value.filter((x) => x.id !== im.id);
    imgsTotal.value = Math.max(0, imgsTotal.value - 1);
    toast('已删除');
  } catch (e) {
    imgsMsg(e.message || '删除失败', 'err');
  } finally {
    imgsBusyId.value = 0;
  }
}

/* 把文中所有该地址替换为新地址（图片语法为 ![alt](url)，故匹配 "](url)" 精确替换） */
function replaceImageUrl(oldUrl, newUrl) {
  if (!oldUrl || !newUrl || oldUrl === newUrl) return;
  text.value = text.value.split('](' + oldUrl + ')').join('](' + newUrl + ')');
}

/* 单张本地图上传并就地替换 */
async function uploadOneLocal(im) {
  if (uploading.value) return;
  if (!ensureHost()) return;
  uploading.value = true;
  try {
    const url = await uploadToHost(im.url);
    replaceImageUrl(im.url, url);
    render();
    pushHistory();
    toast('已上传图床，链接已替换');
  } catch (e) {
    toast('上传失败：' + (e.message || e));
  } finally {
    uploading.value = false;
  }
}

/* 批量把文中所有 data: 本地图上传图床，逐张替换；单张失败不打断整体 */
async function uploadAllLocal() {
  // 去重：同一张 base64 可能被粘贴多次，只上传一次，替换时会一并命中
  const seen = new Set();
  const list = scanImages(text.value).filter(
    (im) => /^data:/.test(im.url) && !seen.has(im.url) && seen.add(im.url),
  );
  if (!list.length) return toast('没有需要上传的本地图片');
  if (uploading.value) return;
  if (!ensureHost()) return;

  uploading.value = true;
  let ok = 0;
  try {
    for (const im of list) {
      try {
        const url = await uploadToHost(im.url);
        replaceImageUrl(im.url, url);
        ok++;
      } catch (e) {
        /* 单张失败继续处理下一张 */
      }
    }
    render();
    pushHistory();
  } finally {
    uploading.value = false;
  }
  toast(ok === list.length ? `已上传 ${ok} 张到图床` : `已上传 ${ok}/${list.length} 张，其余失败`);
}

function onPaste(e) {
  const items = e.clipboardData && e.clipboardData.items;
  if (!items) return;
  const files = [];
  for (const it of items) {
    if (it.type.startsWith('image/')) {
      const f = it.getAsFile();
      if (f) files.push(f);
    }
  }
  if (!files.length) return;
  e.preventDefault();
  handleImageFiles(files);
}

function onDrop(e) {
  const files = e.dataTransfer && e.dataTransfer.files;
  if (!files || !files.length) return;
  const imgs = [...files].filter((f) => f.type.startsWith('image/'));
  if (!imgs.length) return;
  e.preventDefault();
  handleImageFiles(imgs);
}

/* ---------------- 导入 / 下载 / 清空 / 示例 ---------------- */
function pickFile() {
  if (fileEl.value) fileEl.value.click();
}

function onFileChange(e) {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    text.value = r.result;
    render();
    resetHistory(text.value);
    toast('已导入 ' + f.name);
  };
  r.readAsText(f, 'utf-8');
  e.target.value = '';
}

function downloadMd() {
  const blob = new Blob([text.value], { type: 'text/markdown;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `听风入画-${new Date().toISOString().slice(0, 10)}.md`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function clearAll() {
  if (text.value.trim() && !confirm('清空当前内容？')) return;
  text.value = '';
  render();
  resetHistory('');
}

function loadSample() {
  if (text.value.trim() && !confirm('载入示例会覆盖当前内容，继续？')) return;
  text.value = SAMPLE;
  render();
  resetHistory(text.value);
  toast('已载入示例');
}

function downloadImage(im) {
  const a = document.createElement('a');
  a.href = im.url;
  a.download = `${(im.alt || 'image').replace(/[\\/:*?"<>|]/g, '_')}.png`;
  a.click();
}

/* ---------------- 复制（富文本 / HTML 源码） ---------------- */
function copyToMp() {
  if (!text.value.trim()) return toast('先写点内容吧');
  copyRich(currentHtml());
  const localN = scanImages(text.value).filter((i) => i.local).length;
  if (localN) toast(`已复制，但 ${localN} 张本地图片粘贴后会丢失，建议先在「图片清单」里上传图床`);
  else toast('已复制，去公众号编辑器 Ctrl+V 即可');
}

function copyRich(html) {
  // 优先用现代 Clipboard API 直接写 text/html，避免 contenteditable + execCommand('copy')
  // 把内嵌 <a> 链接的 selection 提权到整个内容块（公众号会把所有文字按"链接色+高亮"渲染）
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const htmlBlob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const textBlob = new Blob([stripTags(html)], { type: 'text/plain;charset=utf-8' });
      navigator.clipboard.write([new ClipboardItem({ 'text/html': htmlBlob, 'text/plain': textBlob })]);
      return;
    }
  } catch (e) {
    /* 降级到 execCommand */
  }
  fallbackCopyRich(html);
}

function fallbackCopyRich(html) {
  const holder = document.createElement('div');
  holder.contentEditable = 'true';
  holder.innerHTML = html;
  holder.style.cssText = 'position:fixed;left:-9999px;top:0;width:420px;opacity:0';
  document.body.appendChild(holder);

  // 临时移除所有 <a> 的 href，避免 Chromium execCommand('copy') 跨链接 selection 时
  // 把整个选区都按"链接色+高亮"渲染（selection 提权）
  const links = holder.querySelectorAll('a[href]');
  const saved = [];
  links.forEach((a) => {
    saved.push([a, a.getAttribute('href')]);
    a.removeAttribute('href');
  });

  const range = document.createRange();
  range.selectNodeContents(holder);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch (e) {
    /* 部分浏览器禁用 execCommand */
  }
  sel.removeAllRanges();

  saved.forEach(([a, href]) => a.setAttribute('href', href));
  document.body.removeChild(holder);
  if (!ok) fallbackCopy(html);
}

function stripTags(html) {
  const d = document.createElement('div');
  d.innerHTML = html;
  return d.innerText || d.textContent || '';
}

function fallbackCopy(text_, msg) {
  const ta = document.createElement('textarea');
  ta.value = text_;
  ta.style.cssText = 'position:fixed;left:-9999px';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
  } catch (e) {
    /* 忽略 */
  }
  document.body.removeChild(ta);
  if (msg) toast(msg);
}

function copyHtmlSource() {
  fallbackCopy(currentHtml(), 'HTML 源码已复制');
}

/* ---------------- 浮层开关 ---------------- */
function closeAllPanels() {
  cheatOpen.value = false;
  modalOpen.value = false;
  keysOpen.value = false;
  authOpen.value = false;
  imgsOpen.value = false;
  hostOpen.value = false;
}

function onDocKeydown(e) {
  if (e.key === 'Escape') closeAllPanels();
}

/* ---------------- 账号体系（对接 NestJS 后端 /api/login/*）
   接口约定（后端统一响应）：
     成功 { code:200, data, msg }
     失败 { code:4xx/5xx, message, data:null }
   鉴权：请求头 Authorization: Bearer <token>，token 有效期 7 天
   ---------------- */
/* 接口基地址：优先取 window.TINGFENG_API_BASE，方便整站部署/换域名时覆盖 */
function apiBase() {
  const custom = (typeof window !== 'undefined' && window.TINGFENG_API_BASE) || '';
  return (custom || 'https://api.orangecj.cn/api').replace(/\/+$/, '');
}

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

/* 统一请求：自动带 token、统一解包 data 与错误文案 */
async function apiRequest(path, { method = 'GET', body, auth = false } = {}) {
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
async function encryptPassword(plain) {
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

/* ---------- 弹层开关 / Tab ---------- */
function openAuth(tab) {
  closeAllPanels(); // 先关掉其它面板（如「我的图片」），避免新弹层被遮挡
  authTab.value = tab === 'register' ? 'register' : 'login';
  authMsg('');
  authOpen.value = true;
  setTimeout(() => {
    const el = authTab.value === 'register' ? regEmailEl.value : loginAccountEl.value;
    if (el) el.focus();
  }, 60);
}

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
    authOpen.value = false;
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
    authOpen.value = false;
    toast('注册成功，已登录：' + username);
  } catch (err) {
    switchTab('login');
    loginForm.account = username;
    authMsg('注册成功，请使用刚设置的密码登录', 'ok');
  }
}

/* ---------- 退出登录（后端拉黑 token + 清本地） ---------- */
async function doLogout() {
  logoutBusy.value = true;
  try {
    await apiRequest('/login/logout', { method: 'POST', auth: true });
  } catch (e) {
    // 后端失败（如 token 已过期）也要清掉本地登录态
  } finally {
    logoutBusy.value = false;
    clearSession();
    toast('已退出登录');
  }
}

/* ---------------- 高亮引擎：动态加载 highlight.js（失败则用内置高亮） ---------------- */
function loadScript(src) {
  return new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = false;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });
}

async function loadHighlight() {
  if (!(await loadScript(LIB_URLS[HLJS_CORE]))) return false;
  if (!(window.hljs && window.hljs.highlight)) return false;
  try {
    window.hljs.configure({ style: true, ignoreIllegals: true });
  } catch (e) {
    /* 忽略 */
  }
  await Promise.all(HLJS_LANGS.filter((f) => LIB_URLS[f]).map((f) => loadScript(LIB_URLS[f])));
  window.__HLJS_AVAILABLE__ = true;
  return true;
}

/* ---------------- 生命周期 ---------------- */
onMounted(async () => {
  // 初始化（若本地草稿导致异常，用 ?safe=1 打开即可跳过草稿载入）
  if (/[?&]safe=1/.test(location.search)) {
    text.value = SAMPLE;
    resetHistory(text.value);
    toast('安全模式：已跳过本地草稿，原文请从「下载」备份中恢复');
  } else {
    let draft = null;
    try {
      draft = localStorage.getItem(LS_DRAFT);
    } catch (e) {
      /* 忽略 */
    }
    text.value = draft || SAMPLE;
    resetHistory(text.value);
  }

  // 恢复排版偏好
  try {
    Object.assign(conf, JSON.parse(localStorage.getItem(LS_CONF) || '{}'));
  } catch (e) {
    /* 配置损坏时用默认值 */
  }

  render();
  ready = true;
  initAuth();
  initHost();
  document.addEventListener('keydown', onDocKeydown);

  // 高亮资源就绪后重渲染一次，让代码块用上 highlight.js
  await nextTick();
  if (await loadHighlight()) render();
  emit('ready');
});

onUnmounted(() => {
  document.removeEventListener('keydown', onDocKeydown);
  clearTimeout(renderTimer);
  clearTimeout(draftTimer);
  clearTimeout(undoTimer);
  clearTimeout(toastTimer);
  clearInterval(codeTimer);
});
</script>

<style scoped>
.tf-editor{
  --primary:#1F3D3A;
  --primary-soft:#2E5450;
  --accent:#B08D57;
  --accent-soft:#F3EDE2;
  --bg:#F4F3F0;
  --panel:#FFFFFF;
  --ink:#2E2E2E;
  --muted:#7C7C7C;
  --line:#E4E0D8;
  --radius:10px;
  /* 快捷键弹层头部引用了 --soft（原独立页里也没定义，实际就是透明）；
     这里显式声明，避免站点主题将来定义同名变量时被悄悄改色 */
  --soft:transparent;
}
*{box-sizing:border-box}
.tf-editor{
  position:fixed;inset:0;display:flex;flex-direction:column;overflow:hidden;
  margin:0;background:var(--bg);color:var(--ink);
  font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei","Helvetica Neue",Arial,sans-serif;
  font-size:14px;-webkit-font-smoothing:antialiased;
}
/* ---------- 隔离站点全局样式 ----------
   本组件现在直接长在 VitePress 页面里（原来是 public 下的独立页面），
   主题的 base.css 会重置标签默认值、并顺着继承链渗进来，导致与原页面「所见有出入」。
   这里逐条把被改掉的默认表现还原回去，保证预览与复制结果一致。 */
.tf-editor{
  /* 主题在 body 上写了 line-height:24px，会顺着继承把按钮、标题、工具条整体撑高 */
  line-height:normal;
  /* 站点切深色时 color-scheme 会跟着变，原生控件（下拉 / 滚动条）会渲染成深色 */
  color-scheme:light;
}
/* 主题把 h1~h6 的字重统一重置成了 400（弹层标题因此不再加粗） */
.tf-editor h1,.tf-editor h2,.tf-editor h3,.tf-editor h4,.tf-editor h5,.tf-editor h6{font-weight:700}
.tf-editor b,.tf-editor strong{font-weight:700}
/* 主题给 select 加了 appearance:none，下拉箭头会消失 */
.tf-editor select{-webkit-appearance:auto;appearance:auto}
/* 主题把 placeholder 换成了它自己的灰，深色模式下白底输入框会看不清 */
.tf-editor input::placeholder,.tf-editor textarea::placeholder{color:#BEBEBE;opacity:1}
/* ---------- 顶栏 ---------- */
header{
  height:56px;background:var(--primary);display:flex;align-items:center;
  padding:10px 20px;gap:16px;color:#fff;position:sticky;top:0;z-index:20;
}
.brand{display:flex;align-items:baseline;gap:10px}
.brand b{font-size:17px;letter-spacing:2px;font-weight:600}
.brand span{font-size:12px;color:#C9B98F;letter-spacing:1px}
.hint-bar{margin-left:auto;font-size:12px;color:#A9BDB8;display:flex;align-items:center;gap:14px}
.hint-bar kbd{
  background:rgba(255,255,255,.12);border-radius:4px;padding:2px 6px;
  font-family:ui-monospace,Consolas,monospace;font-size:11px;color:#D8E2DF;
}
/* ---------- 布局 ---------- */
main{
  display:flex;flex:1 1 auto;min-height:0;
}
.pane{display:flex;flex-direction:column;min-width:0}
.pane-left{flex:0 0 46%;border-right:1px solid var(--line);background:#FCFBF9}
.pane-right{flex:1;background:var(--bg);overflow:auto;position:relative}
.pane-head{
  display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px;padding:9px 14px;
  border-bottom:1px solid var(--line);background:var(--panel);
  position:sticky;top:0;z-index:20;
  box-shadow:0 2px 10px rgba(31,61,58,.05);
}
.pane-head .title{
  font-size:12px;color:var(--muted);letter-spacing:1px;margin-right:auto;
  align-self:center;white-space:nowrap;padding:2px 0;
}
.pane-head .ctrl,.pane-head button{flex:0 0 auto}
/* ---------- 按钮 ---------- */
button{
  font-family:inherit;font-size:12px;cursor:pointer;border-radius:6px;
  border:1px solid var(--line);background:#fff;color:var(--ink);
  padding:6px 11px;transition:all .15s;
}
button:hover{border-color:var(--accent);color:var(--accent)}
button.primary{background:var(--accent);border-color:var(--accent);color:#fff;font-weight:600}
button.primary:hover{background:#9E7C48;border-color:#9E7C48;color:#fff}
button.ghost{border-color:transparent;background:transparent}
button.ghost:hover{background:var(--accent-soft)}
button.mini{padding:4px 9px;font-size:11px;border-radius:20px}
.ctrl{
  font-family:inherit;font-size:12px;border:1px solid var(--line);border-radius:6px;
  padding:5px 8px;background:#fff;color:var(--ink);
}
input[type=range]{width:96px;accent-color:var(--accent)}
label.ctrl{display:inline-flex;align-items:center;gap:6px;color:var(--muted)}
/* ---------- 编辑区 ---------- */
.editor{
  flex:1;width:100%;border:0;outline:none;resize:none;padding:20px 22px;
  font-family:ui-monospace,"SFMono-Regular",Consolas,"Courier New",monospace;
  font-size:13.5px;line-height:1.85;color:#3A3A3A;background:transparent;
  tab-size:2;
}
.editor::placeholder{color:#BEBEBE}
.snippets{
  display:flex;flex-wrap:wrap;gap:6px;padding:10px 14px;border-top:1px solid var(--line);
  background:#fff;flex:0 0 auto;
}
.snippets .lbl{font-size:11px;color:var(--muted);margin-right:2px;align-self:center}
.stat{padding:6px 14px;border-top:1px solid var(--line);background:#fff;font-size:11px;color:var(--muted);flex:0 0 auto}
/* ---------- 预览 ---------- */
.preview-wrap{padding:26px 20px 60px;display:flex;justify-content:center}
.phone{
  width:420px;background:#fff;border-radius:14px;box-shadow:0 6px 26px rgba(31,61,58,.10);
  overflow:hidden;flex:0 0 auto;
}
.phone-bar{
  height:30px;background:#fff;border-bottom:1px solid #F0EDE7;
  display:flex;align-items:center;justify-content:center;gap:5px;
}
.phone-bar i{width:5px;height:5px;border-radius:50%;background:#DDD8CE;display:block}
.phone-body{padding:22px 20px 40px;min-height:520px;min-width:0;overflow-x:hidden}
/* ---------- 速查 ---------- */
.cheat{
  position:fixed;right:0;top:56px;bottom:0;width:340px;background:#fff;
  border-left:1px solid var(--line);box-shadow:-8px 0 24px rgba(0,0,0,.06);
  transform:translateX(105%);transition:transform .25s ease;z-index:45;overflow:auto;padding:18px 20px;
}
.cheat.open{transform:translateX(0)}
.cheat :deep(h4){margin:16px 0 8px;font-size:13px;color:var(--primary)}
.cheat :deep(h4:first-child){margin-top:0}
/* GitHub 风格代码块（速查 & 正文统一语言） */
.cheat :deep(code){
  display:block;background:#F6F8FA;border:1px solid #D0D7DE;border-radius:6px;
  padding:12px 14px;font-size:12.5px;line-height:1.7;color:#24292F;white-space:pre-wrap;
  font-family:ui-monospace,"SFMono-Regular",Consolas,"Courier New",monospace;
  overflow-x:auto;
}
.cheat :deep(p code){
  display:inline;background:rgba(175,184,193,.2);border:0;border-radius:6px;
  padding:.2em .4em;color:#24292F;font-size:12px;white-space:normal;
}
.cheat :deep(p){margin:6px 0 0;font-size:12px;color:var(--muted);line-height:1.7}
.cheat-close{
  position:sticky;top:0;float:right;margin:-6px -6px 0 0;border:0;background:transparent;
  font-size:20px;line-height:1;color:var(--muted);padding:2px 8px;border-radius:6px;
}
.cheat-close:hover{background:var(--accent-soft);color:var(--primary)}

/* ---------- 快捷键浮层（居中弹层） ---------- */
.keys-modal{
  position:fixed;left:50%;top:50%;transform:translate(-50%,-50%) scale(.96);
  width:min(440px,92vw);max-height:80vh;background:#fff;border:1px solid var(--line);
  border-radius:10px;box-shadow:0 10px 40px rgba(0,0,0,.18);
  z-index:50;opacity:0;pointer-events:none;transition:opacity .18s ease,transform .18s ease;
  display:flex;flex-direction:column;overflow:hidden;
}
.keys-modal.open{opacity:1;pointer-events:auto;transform:translate(-50%,-50%) scale(1)}
.keys-modal header{
  display:flex;align-items:center;justify-content:space-between;
  padding:12px 16px;border-bottom:1px solid var(--line);background:var(--soft);
}
.keys-modal .keys-title{font-size:14px;font-weight:600;color:var(--primary);letter-spacing:.5px}
.keys-modal .keys-body{padding:14px 18px 18px;overflow:auto}
.keys-modal h4{margin:14px 0 8px;font-size:12px;color:var(--muted);letter-spacing:1px;font-weight:600}
.keys-modal h4:first-child{margin-top:0}
.keys-modal dl{display:grid;grid-template-columns:auto 1fr;gap:6px 14px;align-items:center;margin:0}
.keys-modal dt{display:flex;align-items:center;gap:3px;white-space:nowrap}
.keys-modal dd{margin:0;font-size:12.5px;color:var(--ink);line-height:1.6}
.keys-modal kbd{
  display:inline-block;min-width:22px;padding:2px 7px;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;
  font-size:11.5px;line-height:1.4;color:var(--primary);background:#fff;
  border:1px solid var(--line);border-bottom-width:2px;border-radius:4px;
  text-align:center;font-weight:500;
}
.keys-modal .keys-hint{margin:14px 0 0;padding:10px 12px;background:var(--accent-soft);border-radius:6px;font-size:12px;color:var(--primary);line-height:1.7}
/* 遮罩 + 图片清单 */
.mask{
  position:fixed;inset:0;background:rgba(31,61,58,.28);z-index:40;opacity:0;
  pointer-events:none;transition:opacity .2s;
}
.mask.show{opacity:1;pointer-events:auto}
.modal{
  position:fixed;left:50%;top:50%;transform:translate(-50%,-48%) scale(.98);z-index:50;
  width:min(560px,92vw);max-height:76vh;overflow:auto;background:#fff;border-radius:12px;
  box-shadow:0 18px 50px rgba(0,0,0,.22);padding:20px 22px;opacity:0;pointer-events:none;
  transition:all .2s;
}
.modal.show{opacity:1;transform:translate(-50%,-50%) scale(1);pointer-events:auto}
.modal h3{margin:0 0 4px;font-size:15px;color:var(--primary)}
.modal .sub{margin:0 0 16px;font-size:12px;color:var(--muted);line-height:1.7}
.img-row{display:flex;gap:12px;align-items:flex-start;padding:11px 0;border-bottom:1px solid var(--line)}
.img-row:last-of-type{border-bottom:0}
.img-row img{width:88px;height:60px;object-fit:cover;border-radius:6px;background:#F2F2F2;flex:0 0 auto}
.img-row .meta{flex:1;min-width:0}
.img-row .name{font-size:13px;color:var(--ink);word-break:break-all;line-height:1.5}
.img-row .tagx{display:inline-block;margin-top:5px;font-size:11px;padding:2px 7px;border-radius:20px}
.tagx.local{background:#FBEDE9;color:#B4603F}
.tagx.remote{background:var(--accent-soft);color:var(--primary)}
.stat b{color:#B4603F;font-weight:600}
.toast{
  position:fixed;left:50%;bottom:34px;transform:translateX(-50%) translateY(20px);
  background:var(--primary);color:#fff;padding:10px 20px;border-radius:22px;font-size:13px;
  opacity:0;pointer-events:none;transition:all .25s;z-index:60;box-shadow:0 6px 20px rgba(0,0,0,.18);
}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}

/* ---------- 账号：顶栏状态区 ---------- */
.auth-area{display:flex;align-items:center;gap:9px;margin-left:4px;flex:0 0 auto}
.auth-area .user{display:flex;align-items:center;gap:8px;max-width:170px}
.auth-area .avatar{
  width:24px;height:24px;border-radius:50%;background:var(--accent);color:#fff;flex:0 0 auto;
  display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;
}
.auth-area .name{
  font-size:12px;color:#F3EDE2;font-weight:600;max-width:120px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
header button.hd{border-color:rgba(255,255,255,.3);background:rgba(255,255,255,.06);color:#E7E1D5}
header button.hd:hover{border-color:var(--accent);background:rgba(176,141,87,.2);color:#fff}
header button.hd.primary{background:var(--accent);border-color:var(--accent);color:#fff;font-weight:600}
header button.hd.primary:hover{background:#9E7C48;border-color:#9E7C48;color:#fff}
button:disabled{opacity:.55;cursor:not-allowed}

/* ---------- 账号：登录 / 注册 弹层 ---------- */
.auth-modal{width:min(400px,92vw);padding:24px 26px 22px}
.auth-modal h3{margin:0 0 3px;font-size:17px;color:var(--primary)}
.auth-modal .sub{margin:0 0 16px}
.auth-tabs{display:flex;gap:5px;padding:4px;margin-bottom:18px;background:var(--accent-soft);border-radius:8px}
.auth-tabs button{flex:1;padding:7px 0;border:0;border-radius:6px;background:transparent;color:var(--muted);font-size:13px}
.auth-tabs button.active{background:#fff;color:var(--primary);font-weight:600;box-shadow:0 1px 3px rgba(31,61,58,.12)}
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
.auth-msg{min-height:18px;margin:11px 0 0;font-size:12px;line-height:1.6}
.auth-msg.err{color:#B4603F}
.auth-msg.ok{color:#2F7D5A}

/* ---------- 图床：我的图片（按登录账号分组） ---------- */
button.need-key{color:#B4603F;border-color:rgba(180,96,63,.4)}
button.need-key:hover{color:#B4603F;background:#FBEDE9;border-color:#B4603F}
.imgs-modal{width:min(620px,94vw);padding:24px 26px 18px}
.imgs-modal h3{margin:0 0 3px;font-size:17px}
.imgs-modal .sub b{color:var(--primary)}
.imgs-login{display:flex;justify-content:center;padding:20px 0 8px}
.imgs-login .primary{padding:10px 24px;border-radius:8px;font-size:13px}
.imgs-toolbar{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.imgs-toolbar .ctrl{flex:0 0 190px}
.imgs-count{font-size:11.5px;color:var(--muted);white-space:nowrap}
.imgs-empty{padding:26px 10px;text-align:center;font-size:12.5px;color:var(--muted);line-height:1.8}
.imgs-acts{display:flex;flex-direction:column;gap:5px;flex:0 0 auto}
.imgs-acts .mini{white-space:nowrap}
button.mini.danger{color:#B4603F;border-color:rgba(180,96,63,.4)}
button.mini.danger:hover{background:#FBEDE9;border-color:#B4603F;color:#B4603F}
.imgs-more{display:flex;justify-content:center;padding:12px 0 2px}
.imgs-foot{display:flex;align-items:center;margin-top:14px;padding-top:14px;border-top:1px solid var(--line)}
.imgs-foot .primary{padding:7px 18px}
.host-warn{
  margin:-6px 0 14px;padding:9px 11px;background:#FBEDE9;border-radius:6px;
  font-size:12px;color:#B4603F;line-height:1.7;
}

/* ---------- 图床设置（ImgBB 直传） ---------- */
.host-modal{width:min(470px,92vw);padding:24px 26px 20px}
.host-modal h3{margin:0 0 3px;font-size:17px}
.host-modal .sub b{color:var(--primary)}
.host-tip{margin:0 0 12px;font-size:11.5px;color:var(--muted);line-height:1.85}
.host-tip a{color:var(--primary)}
.host-foot{display:flex;align-items:center;gap:8px;margin-top:14px;padding-top:14px;border-top:1px solid var(--line)}
.host-foot .primary{padding:7px 18px}
.host-state{font-size:11.5px;color:var(--muted);white-space:nowrap}

@media (max-width:980px){
  main{flex:none;flex-direction:column;height:auto}
  .tf-editor{overflow-y:auto}
  .pane-left{flex:none;height:52vh;border-right:0;border-bottom:1px solid var(--line)}
}
@media (max-width:760px){
  .hint-bar{display:none}
  .auth-area{margin-left:auto}
}
</style>
