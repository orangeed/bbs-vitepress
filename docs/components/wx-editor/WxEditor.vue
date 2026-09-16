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
          <div class="ph-row">
            <span class="title">MARKDOWN 原稿</span>
            <button class="tbtn" @click="modalOpen = true">图片清单</button>
            <button class="tbtn" @click="pickFile">导入 .md</button>
            <button class="tbtn" @click="loadSample">载入示例</button>
            <button class="tbtn" @click="downloadMd">下载</button>
            <button class="tbtn" @click="clearAll">清空</button>
            <button class="tbtn" title="查看所有快捷键（Ctrl+?）" @click="keysOpen = !keysOpen">快捷键</button>
          </div>
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
          <span class="lbl">快捷插入</span>
          <button v-for="s in SNIPPETS" :key="s.label" class="mini" @click="insertText(s.text)">{{ s.label }}</button>
        </div>
        <div class="stat" v-html="statHtml"></div>
      </section>

      <!-- 右：预览 -->
      <section class="pane pane-right">
        <div class="pane-head">
          <div class="ph-row">
            <span class="title">公众号预览</span>
            <button v-if="BACKEND_GALLERY" class="tbtn" title="查看 / 管理我上传的图片（按登录账号分组）" @click="openImgs">我的图片</button>
            <button class="tbtn" :class="{ 'need-key': !hostReady }" title="图床状态：图片上传到自己的对象存储（CDN 加速），需先登录" @click="openHost">图床设置</button>
            <span class="tsep"></span>
            <button class="tbtn" @click="cheatOpen = !cheatOpen">语法速查</button>
            <button class="tbtn" @click="copyHtmlSource">复制 HTML</button>
            <button class="tbtn primary" @click="copyToMp">复制到公众号</button>
          </div>
          <div class="ph-row ph-controls">
            <Dropdown v-model="conf.theme" :options="THEME_OPTIONS" title="整体配色" />
            <Dropdown v-model="conf.archiveStyle" :options="ARCHIVE_OPTIONS" title="往期推荐模块样式" />
            <Dropdown v-model="conf.followStyle" :options="FOLLOW_OPTIONS" title="关注引导模块样式" />
            <span class="tsep"></span>
            <Dropdown v-model="conf.headingStyle" :options="HEADING_OPTIONS" title="标题样式（对二级标题生效）" />
            <Dropdown v-model="conf.quoteStyle" :options="QUOTE_OPTIONS" title="引用块样式" />
            <Dropdown v-model="conf.codeStyle" :options="CODE_OPTIONS" title="代码块与行内代码样式" />
            <span class="tsep"></span>
            <span class="tfield" title="开启后代码块优先使用 highlight.js 高亮">语法高亮
              <label class="sw"><input v-model="conf.hl" type="checkbox"><i></i></label>
            </span>
            <span class="tfield" :title="hostReady ? '粘贴/拖入的图片会自动压缩并上传到你的对象存储，正文里写入 CDN 外链' : '还没登录：登录后粘贴的图片才会自动上传；未登录时图片会内嵌成 base64'">图片上传图床
              <label class="sw"><input v-model="conf.uploadImg" type="checkbox"><i></i></label>
            </span>
            <span class="tfield" title="复制正文时在链接后追加真实地址">链接地址
              <label class="sw"><input v-model="conf.showUrl" type="checkbox"><i></i></label>
            </span>
            <span class="tsep"></span>
            <label class="tfield" title="正文字号">字号
              <input v-model.number="conf.size" class="rng" type="range" min="14" max="17" step="1">
              <span class="rng-v">{{ conf.size }}px</span>
            </label>
          </div>
        </div>
        <div class="preview-wrap">
          <div class="phone">
            <div class="phone-bar"><i></i><i></i><i></i></div>
            <div class="phone-body" v-html="previewDisplay"></div>
          </div>
        </div>
      </section>
    </main>

    <!-- 快捷键 -->
    <KeysModal :open="keysOpen" @close="keysOpen = false" />
    <!-- 语法速查 -->
    <CheatDrawer :open="cheatOpen" @close="cheatOpen = false" />
    <!-- 图片清单（上传 / 下载需要改写正文，逻辑在主组件） -->
    <ImagesModal
      :open="modalOpen"
      :images="images"
      :uploading="uploading"
      @close="modalOpen = false"
      @upload-one="uploadOneLocal"
      @download="downloadImage"
      @upload-all="uploadAllLocal"
    />
    <!-- 登录 / 注册 -->
    <AuthModal :open="authOpen" :tab="authTab" @close="authOpen = false" />
    <!-- 图床设置 -->
    <HostModal :open="hostOpen" @close="hostOpen = false" @login="openAuth('login')" @images="openImgs" />
    <!-- 我的图片（插入正文交给主组件） -->
    <ImgsModal
      v-if="BACKEND_GALLERY"
      :open="imgsOpen"
      :is-used="isUrlUsed"
      @close="imgsOpen = false"
      @insert="useMyImage"
      @login="openAuth('login')"
    />

    <div class="mask" :class="{ show: maskShow }" @click="closeAllPanels"></div>

    <div class="toast" :class="{ show: toastShow }">{{ toastText }}</div>
    <input ref="fileEl" type="file" accept=".md,.markdown,.txt" style="display:none" @change="onFileChange">
  </div>
</template>

<script setup>
/**
 * 「听风入画」公众号 Markdown 排版工具 —— 主组件（界面与编排）
 *
 * 渲染引擎在同目录 ./renderer.ts，快捷片段与示例文稿在 ./content.ts。
 * 目录职责划分：
 *  - components/  各弹层子组件
 *      AuthModal / HostModal / ImgsModal / ImagesModal / KeysModal / CheatDrawer
 *  - utils/       工具与全局状态
 *      constants.js    全局常量（localStorage 键、图床配置、高亮资源清单）
 *      toast.js        全局单例 toast 提示
 *      authStore.js    全局单例登录态（token / 用户信息 / 会话存取）
 *      api.js          后端接口（统一请求、密码加密、图片上传）
 *      clipboard.js    富文本 / 纯文本复制
 *      imageUtils.js   图片压缩（dataURL / Blob 转换）
 *      useUndo.js      撤销 / 重做历史栈
 *      modal-base.css  弹层公共样式（子组件 scoped 引入）
 *
 * 本组件只负责：编辑区状态与交互、正文改写（插入 / 替换图片链接）、
 * 预览渲染、排版偏好持久化、各弹层的开合编排。
 *
 * 注意：高亮资源从同目录的 ./lib 动态加载（浏览器版 highlight.js 不能按 ESM 打包），
 * 缺失时自动回退到 renderer.ts 里的内置高亮。组件按 SSR 安全写法实现：
 * 所有 window / document / localStorage 访问都在 onMounted 之后或事件回调里。
 */
import { ref, reactive, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { THEMES, buildHtml } from './renderer';
import { SNIPPETS, SAMPLE } from './content';
import {
  LS_DRAFT, LS_CONF, LS_IMGBB, IMG_RE, PREVIEW_EMPTY, BACKEND_GALLERY,
  LIB_URLS, HLJS_CORE, HLJS_LANGS,
} from './utils/constants';
import { useToast } from './utils/toast';
import { useAuth } from './utils/authStore';
import { useUndo } from './utils/useUndo';
import { copyRich, fallbackCopy } from './utils/clipboard';
import { fileToDataUrl } from './utils/imageUtils';
import { apiRequest, uploadImageToBackend } from './utils/api';
import Dropdown from './components/Dropdown.vue';
import KeysModal from './components/KeysModal.vue';
import CheatDrawer from './components/CheatDrawer.vue';
import ImagesModal from './components/ImagesModal.vue';
import AuthModal from './components/AuthModal.vue';
import HostModal from './components/HostModal.vue';
import ImgsModal from './components/ImgsModal.vue';

/** ready：初始化完成（草稿/配置已恢复、highlight.js 已加载并重渲染），供外层收起 Loading */
const emit = defineEmits(['ready']);

/* 全局单例状态：toast 提示 / 登录态 */
const { toast, toastShow, toastText } = useToast();
const { authToken, displayName, avatarChar, hostReady, initAuth, clearSession } = useAuth();

/* ---------------- 编辑器状态 ---------------- */
const editorEl = ref(null);
const fileEl = ref(null);
const text = ref(SAMPLE);
const previewHtml = ref('');
const statHtml = ref('0 字');
const conf = reactive({
  theme: 'moqing', size: 15, showUrl: true, archiveStyle: 'dash',
  followStyle: 'card', codeStyle: 'github', headingStyle: 'default', quoteStyle: 'default',
  hl: true, uploadImg: true,
});

/* ---------------- 下拉选项（自绘 Dropdown 组件） ---------------- */
const THEME_OPTIONS = Object.keys(THEMES).map((k) => ({ value: k, label: THEMES[k].name }));
const ARCHIVE_OPTIONS = [
  { value: 'dash', label: '往期 · 虚线框' },
  { value: 'card', label: '往期 · 卡片列表' },
  { value: 'plain', label: '往期 · 简约条目' },
  { value: 'dark', label: '往期 · 深色块' },
];
const FOLLOW_OPTIONS = [
  { value: 'card', label: '引导 · 居中卡片' },
  { value: 'quote', label: '引导 · 左侧金条' },
  { value: 'dark', label: '引导 · 深色块' },
];
const HEADING_OPTIONS = [
  { value: 'default', label: '标题 · 金条引导' },
  { value: 'number', label: '标题 · 序号衬线' },
  { value: 'bignum', label: '标题 · 大序号留白' },
  { value: 'frame', label: '标题 · 居中线框' },
  { value: 'dual', label: '标题 · 双线夹字' },
  { value: 'fade', label: '标题 · 渐变底纹' },
  { value: 'diamond', label: '标题 · 菱形对称' },
  { value: 'underline', label: '标题 · 短下划线' },
];
const QUOTE_OPTIONS = [
  { value: 'default', label: '引用 · 金条浅底' },
  { value: 'plain', label: '引用 · 极简竖线' },
  { value: 'card', label: '引用 · 白卡描边' },
  { value: 'mark', label: '引用 · 引号点缀' },
  { value: 'dark', label: '引用 · 深色块' },
];
const CODE_OPTIONS = [
  { value: 'github', label: '代码 · GitHub 浅色' },
  { value: 'github-dark', label: '代码 · GitHub 深色' },
  { value: 'theme', label: '代码 · 跟随主题' },
];

/* 浮层开关（统一由主组件编排，Esc / 遮罩一键全关） */
const cheatOpen = ref(false);
const keysOpen = ref(false);
const modalOpen = ref(false);
const authOpen = ref(false);
const hostOpen = ref(false);
const imgsOpen = ref(false);
const authTab = ref('login');
const uploading = ref(false); // 图床上传中
const logoutBusy = ref(false);

/* ---------------- 计算属性 ---------------- */
const previewDisplay = computed(() => previewHtml.value || PREVIEW_EMPTY);
const maskShow = computed(
  () =>
    cheatOpen.value || keysOpen.value || modalOpen.value || authOpen.value || imgsOpen.value || hostOpen.value,
);
/* 图片清单数据：扫描文中图片，区分本地（data:/相对路径，微信粘不了）与外链 */
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
/* 供「我的图片」删除前判断链接是否正被正文引用 */
function isUrlUsed(url) {
  return !!url && text.value.includes(url);
}

/* ---------------- 工具 ---------------- */
function scanImages(src) {
  const out = [];
  const re = new RegExp(IMG_RE.source, 'g');
  let m;
  while ((m = re.exec(src))) {
    out.push({ alt: m[1], url: m[2], local: /^(data:|file:|blob:|\.{0,2}\/|[A-Za-z]:)/.test(m[2]) });
  }
  return out;
}

/* ---------------- 渲染 ---------------- */
let renderTimer = null;
let draftTimer = null;

function currentHtml() {
  return buildHtml(
    text.value, conf.theme, Number(conf.size), conf.showUrl,
    conf.archiveStyle, conf.followStyle, conf.codeStyle, conf.hl,
    conf.headingStyle, conf.quoteStyle,
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

/* ---------------- 撤销 / 重做（useUndo：500ms 停顿自动快照） ---------------- */
const { pushHistory, schedulePush, undo, redo, resetHistory } = useUndo(text, { render, toast });

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

/* ---------------- 粘贴 / 拖拽图片（压缩后插入正文，图注占位自动选中） ---------------- */
/* pos 为 null 时插到当前光标处；返回 alt 的起止位置与下一次插入点 */
function insertImageMd(url, alt, pos) {
  const el = editorEl.value;
  const v = text.value;
  const s = pos == null ? (el ? el.selectionStart : v.length) : pos;
  const e = pos == null ? (el ? el.selectionEnd : v.length) : pos;
  const before = v.slice(0, s);
  const after = v.slice(e);
  const pre = before && !before.endsWith('\n') ? '\n\n' : '';
  const ins = `${pre}![${alt}](${url})\n\n`;

  text.value = before + ins + after;
  const altStart = (before + pre + '![').length;
  return { altStart, altEnd: altStart + alt.length, next: (before + ins).length };
}

async function handleImageFiles(files) {
  const imgs = [...files].filter((f) => f.type.startsWith('image/'));
  if (!imgs.length) return;

  // 是否走图床：开关打开且已登录（后端按账号归档），否则退回本地 base64
  const useHost = conf.uploadImg && hostReady.value;
  toast(useHost ? '正在压缩并上传到图床…' : '正在处理图片…');

  let pos = null;
  let first = null;
  let uploaded = 0;
  let lastErr = '';
  for (const f of imgs) {
    const dataUrl = await fileToDataUrl(f);
    let url = dataUrl;
    if (useHost) {
      try {
        url = await uploadImageToBackend(dataUrl);
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
    // 未登录：必须明确引导，否则用户粘完图直接发到公众号才发现图片丢失
    toast('请先登录，图片才能上传到图床；本次已临时内嵌 base64');
    openAuth('login');
  } else if (!uploaded) {
    // 已登录但全部失败：必须显式告知，否则用户只会看到文中出现一大串 base64
    toast(`图床上传失败：${lastErr || '图床不可用'}，已改为本地 base64 插入`);
  } else if (uploaded === n) {
    toast(n === 1 ? '已上传并插入，图注已选中，直接打字替换' : `已上传 ${n} 张并插入，第一张的图注已选中`);
  } else {
    toast(`已插入 ${n} 张（${uploaded} 张已上传图床，其余失败改为 base64），第一张的图注已选中`);
  }
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

/* ---------------- 图床上传（正文内本地图 → 外链） ---------------- */
/* 上传前的统一检查：未登录就直接打开登录弹层引导 */
function ensureHost() {
  if (hostReady.value) return true;
  openAuth('login');
  toast('请先登录：图片会上传到你自己的对象存储，按账号归档');
  return false;
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
    const url = await uploadImageToBackend(im.url);
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
        const url = await uploadImageToBackend(im.url);
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

/* 「我的图片」插入到正文当前光标处，图注占位自动选中 */
async function useMyImage(url) {
  const r = insertImageMd(url, '图片描述', null);
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
  copyRich(currentHtml(), toast);
  const localN = scanImages(text.value).filter((i) => i.local).length;
  if (localN) toast(`已复制，但 ${localN} 张本地图片粘贴后会丢失，建议先在「图片清单」里上传图床`);
  else toast('已复制，去公众号编辑器 Ctrl+V 即可');
}

function copyHtmlSource() {
  fallbackCopy(currentHtml(), 'HTML 源码已复制', toast);
}

/* ---------------- 浮层开关 ---------------- */
function openAuth(tab) {
  closeAllPanels(); // 先关掉其它面板，避免新弹层被遮挡
  authTab.value = tab === 'register' ? 'register' : 'login';
  authOpen.value = true;
}

function openHost() {
  closeAllPanels();
  hostOpen.value = true;
}

function openImgs() {
  closeAllPanels();
  imgsOpen.value = true;
}

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

/* ---------------- 退出登录（后端拉黑 token + 清本地） ---------------- */
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
  // 启动时清理早期遗留的 ImgBB Key（现已不再使用）
  try {
    localStorage.removeItem(LS_IMGBB);
  } catch (e) {
    /* 隐私模式下忽略 */
  }
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
  /* 弹层子组件引用了 --soft（实际就是透明）；
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
/* 主题把 placeholder 换成了它自己的灰，深色模式下白底输入框会看不清 */
.tf-editor input::placeholder,.tf-editor textarea::placeholder{color:#BEBEBE;opacity:1}
/* 主题给 select 加了 appearance:none，下拉箭头会消失 */
.tf-editor select{-webkit-appearance:auto;appearance:auto}
.tf-editor b,.tf-editor strong{font-weight:700}
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
/* ---------- 工具条（双行：动作行 + 配置行，国际简约风） ---------- */
.pane-head{
  display:flex;flex-direction:column;gap:4px;padding:8px 14px;
  border-bottom:1px solid var(--line);background:var(--panel);
  position:sticky;top:0;z-index:20;
}
.ph-row{display:flex;flex-wrap:wrap;align-items:center;gap:4px 6px}
.ph-row .title{
  font-size:11px;color:var(--muted);letter-spacing:1.5px;margin-right:auto;
  align-self:center;white-space:nowrap;padding:2px 0;
}
/* 幽灵按钮：无边框、悬停浮出浅底，视觉噪音最低 */
.tbtn{
  font-family:inherit;font-size:12px;color:#5A5A5A;background:transparent;
  border:0;border-radius:6px;padding:5px 10px;cursor:pointer;line-height:1.4;
  transition:background .15s,color .15s;white-space:nowrap;
}
.tbtn:hover{background:#EFECE4;color:var(--primary)}
.tbtn.primary{background:var(--primary);color:#fff;padding:5px 14px;font-weight:600}
.tbtn.primary:hover{background:var(--primary-soft);color:#fff}
.tbtn.need-key{color:#B4603F}
.tbtn.need-key:hover{background:#FBEDE9;color:#B4603F}
.tbtn:disabled{opacity:.55;cursor:not-allowed}
/* 工具条竖分隔线 */
.tsep{width:1px;height:16px;background:var(--line);margin:0 4px;flex:0 0 auto}
/* 下拉框：由 components/Dropdown.vue 自绘（原生 select 展开列表无法自定义样式） */
/* 胶囊开关（替代勾选框） */
.sw{position:relative;display:inline-block;width:30px;height:16px;flex:0 0 auto;vertical-align:middle}
.sw input{position:absolute;opacity:0;width:0;height:0}
.sw i{
  position:absolute;inset:0;background:#D9D5CC;border-radius:999px;transition:background .2s;
}
.sw i::after{
  content:'';position:absolute;left:2px;top:2px;width:12px;height:12px;background:#fff;
  border-radius:50%;transition:transform .2s;
}
.sw input:checked + i{background:var(--accent)}
.sw input:checked + i::after{transform:translateX(14px)}
.sw input:focus-visible + i{outline:2px solid var(--accent);outline-offset:2px}
/* 开关 / 滑杆字段的文字标签 */
.tfield{display:inline-flex;align-items:center;gap:7px;font-size:12px;color:#6B6B6B;white-space:nowrap;cursor:default}
.tfield .sw{cursor:pointer}
.rng{width:88px;accent-color:var(--accent);cursor:pointer}
.rng-v{font-size:11px;color:var(--muted);min-width:34px}
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
.snippets .lbl{font-size:11px;color:var(--muted);margin-right:6px;align-self:center;letter-spacing:.5px}
.snippets .mini{
  font-family:inherit;font-size:11px;color:#5A5A5A;background:#fff;
  border:1px solid var(--line);border-radius:999px;padding:3px 11px;cursor:pointer;
  transition:border-color .15s,color .15s;line-height:1.5;
}
.snippets .mini:hover{border-color:var(--accent);color:var(--accent)}
.stat{padding:6px 14px;border-top:1px solid var(--line);background:#fff;font-size:11px;color:var(--muted);flex:0 0 auto}
.stat b{color:#B4603F;font-weight:600}
/* ---------- 预览 ---------- */
.preview-wrap{padding:26px 20px 60px;display:flex;justify-content:center}
.phone{
  width:420px;background:#fff;border:1px solid var(--line);border-radius:14px;
  overflow:hidden;flex:0 0 auto;
}
.phone-bar{
  height:30px;background:#fff;border-bottom:1px solid #F0EDE7;
  display:flex;align-items:center;justify-content:center;gap:5px;
}
.phone-bar i{width:5px;height:5px;border-radius:50%;background:#DDD8CE;display:block}
.phone-body{padding:22px 20px 40px;min-height:520px;min-width:0;overflow-x:hidden}
/* ---------- 遮罩 + toast ---------- */
.mask{
  position:fixed;inset:0;background:rgba(31,61,58,.28);z-index:40;opacity:0;
  pointer-events:none;transition:opacity .2s;
}
.mask.show{opacity:1;pointer-events:auto}
.toast{
  position:fixed;left:50%;bottom:34px;transform:translateX(-50%) translateY(20px);
  background:var(--primary);color:#fff;padding:10px 20px;border-radius:6px;font-size:13px;
  opacity:0;pointer-events:none;transition:all .25s;z-index:60;
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
/* 顶栏深色背景上的原生按钮（自包含样式，不依赖全局 button 基础） */
header .hd{
  font-family:inherit;font-size:12px;cursor:pointer;border-radius:6px;
  border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.06);color:#E7E1D5;
  padding:5px 12px;transition:all .15s;line-height:1.4;
}
header .hd:hover{border-color:var(--accent);background:rgba(176,141,87,.2);color:#fff}
header .hd.primary{background:var(--accent);border-color:var(--accent);color:#fff;font-weight:600}
header .hd.primary:hover{background:#9E7C48;border-color:#9E7C48;color:#fff}
header .hd:disabled{opacity:.55;cursor:not-allowed}
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
