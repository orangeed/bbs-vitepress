<template>
  <!-- 我的图片：按登录账号分组（依赖自建后端），列表 / 筛选 / 删除逻辑自包含 -->
  <aside class="modal imgs-modal" :class="{ show: open }" :aria-hidden="String(!open)">
    <h3>我的图片</h3>
    <p class="sub">
      <template v-if="hostReady">
        当前账号 <b>{{ displayName }}</b> 上传的图，分组 <b>{{ myGroup }}</b>。点「插入」放到正文光标处，或复制链接自行引用。
      </template>
      <template v-else>登录后这里会按账号分组，展示你自己上传的图片。</template>
    </p>

    <div v-if="!hostReady" class="imgs-login">
      <button class="primary" @click="$emit('login')">登录 / 注册</button>
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
            <button class="mini" @click="$emit('insert', im.url)">插入</button>
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
      <button class="primary" @click="$emit('close')">关闭</button>
    </div>
  </aside>
</template>

<script setup>
/**
 * 我的图片弹层：列表 / 分页 / 筛选 / 删除自包含（只依赖 authStore 与 api 层）；
 * 「插入」通过 insert 事件交给主组件写正文（需要光标定位与重渲染）。
 */
import { ref, watch } from 'vue';
import { apiRequest } from '../utils/api';
import { useAuth } from '../utils/authStore';
import { useToast } from '../utils/toast';
import { fallbackCopy } from '../utils/clipboard';

const props = defineProps({
  open: Boolean,
  /** 供删除前判断链接是否正被正文引用（主组件持有正文） */
  isUsed: { type: Function, default: null },
});
const emit = defineEmits(['close', 'insert', 'login']);

const { authToken, hostReady, displayName, myGroup } = useAuth();
const { toast } = useToast();

const myImgs = ref([]);
const imgsTotal = ref(0);
const imgsPage = ref(1);
const imgsLoading = ref(false);
const imgsBusyId = ref(0);
const imgsKeyword = ref('');
const imgsMsgText = ref('');
const imgsMsgType = ref('');

/* 每次打开：清提示；已登录则刷新第一页 */
watch(() => props.open, (v) => {
  if (!v) return;
  imgsMsg('');
  if (hostReady.value) loadMyImages(true);
});

function imgsMsg(text, type) {
  imgsMsgText.value = text || '';
  imgsMsgType.value = type || '';
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

function copyMyImage(im) {
  fallbackCopy(im.url, '图片链接已复制', toast);
}

/* 删除自己的图：后端按 uid 校验归属，删别人的会被挡掉 */
async function removeMyImage(im) {
  if (imgsBusyId.value) return;
  const used = props.isUsed ? props.isUsed(im.url) : false;
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
</script>

<style scoped src="../utils/modal-base.css"></style>
<style scoped>
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
</style>
