<template>
  <!-- 图片清单：标出正文里的本地图（粘贴进公众号会丢失），引导上传图床 -->
  <div class="modal" :class="{ show: open }">
    <h3>图片清单</h3>
    <p class="sub">共 {{ images.length }} 张。标红的 <b>本地图片</b> 粘贴进公众号后会丢失：可点「上传图床」换成外链，或下载后去公众号后台上传替换。</p>
    <template v-if="images.length">
      <div v-for="(im, i) in images" :key="i" class="img-row">
        <img :src="im.url" alt="">
        <div class="meta">
          <div class="name" v-html="altName(im)"></div>
          <span class="tagx" :class="im.local ? 'local' : 'remote'">{{ im.local ? '本地 · 微信粘贴会丢失，需替换' : '外链 · ' + im.host }}</span>
        </div>
        <button v-if="im.local && /^data:/.test(im.url)" class="mini" :disabled="uploading" @click="$emit('upload-one', im)">上传图床</button>
        <button v-if="im.local" class="mini" @click="$emit('download', im)">下载</button>
      </div>
    </template>
    <p v-else class="sub">文中还没有图片。可以直接 Ctrl+V 把截图粘到左侧编辑器里。</p>
    <p v-if="hasLocalData && !hostReady" class="host-warn">
      还没登录：登录后点「全部上传图床」，就能把本地图片换成对象存储外链（按账号归档，CDN 加速）。
    </p>
    <div style="margin-top:16px;display:flex;align-items:center;justify-content:space-between;gap:10px">
      <button v-if="hasLocalData" class="mini" :disabled="uploading" @click="$emit('upload-all')">{{ uploading ? '上传中…' : '全部上传图床' }}</button>
      <span v-else></span>
      <button class="primary" @click="$emit('close')">知道了</button>
    </div>
  </div>
</template>

<script setup>
/** 图片清单弹层：纯展示 + 事件上抛，上传 / 下载逻辑在主组件（需要改写正文） */
import { computed } from 'vue';
import { esc } from '../renderer';
import { useAuth } from '../utils/authStore';

const props = defineProps({
  open: Boolean,
  images: { type: Array, default: () => [] },
  uploading: Boolean,
});
defineEmits(['close', 'upload-one', 'download', 'upload-all']);

const { hostReady } = useAuth();

/* 是否存在 base64 内嵌图：决定「全部上传图床」按钮与未登录警告的展示 */
const hasLocalData = computed(() => props.images.some((im) => /^data:/.test(im.url)));

function altName(im) {
  return im.alt ? esc(im.alt) : '<span style="color:#9A9A9A">（未写图注）</span>';
}
</script>

<style scoped src="../utils/modal-base.css"></style>
<style scoped>
.host-warn{
  margin:-6px 0 14px;padding:9px 11px;background:#FBEDE9;border-radius:6px;
  font-size:12px;color:#B4603F;line-height:1.7;
}
</style>
