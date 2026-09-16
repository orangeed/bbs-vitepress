<template>
  <!-- 图床设置：展示上传目标与登录状态（图片上传到自己的对象存储，按登录账号归档） -->
  <aside class="modal host-modal" :class="{ show: open }" :aria-hidden="String(!open)">
    <h3>图床设置</h3>
    <p class="sub">
      粘贴 / 拖入的图片会先压缩，再上传到<b>你自己的对象存储</b>，正文里写入 CDN 外链 ——
      图片都在自己的桶里，可随时在「我的图片」中查看、插入或删除。
    </p>

    <div class="host-state-box" :class="hostReady ? 'ok' : 'warn'">
      <template v-if="hostReady">
        已就绪 · 当前账号 <b>{{ displayName }}</b>，图片归档到分组 <b>{{ myGroup }}</b>
      </template>
      <template v-else>
        未就绪 · 上传需要登录：后端按登录账号归档图片。未登录时图片会内嵌成 base64，粘贴进公众号会丢失。
      </template>
    </div>

    <p class="host-tip">
      外链前缀 <code>{{ IMG_HOST }}</code>（由后端配置，换域名无需改前端）；<br>
      上传前自动压缩到宽 {{ MAX_IMG_W }}px 以内。
    </p>

    <div class="host-foot">
      <template v-if="hostReady">
        <button class="mini" @click="$emit('images')">我的图片</button>
      </template>
      <template v-else>
        <button class="mini" @click="$emit('login')">登录 / 注册</button>
      </template>
      <span style="flex:1"></span>
      <span class="host-state">{{ hostReady ? '图床已就绪' : '未登录 · 图片会内嵌 base64' }}</span>
      <button class="primary" @click="$emit('close')">关闭</button>
    </div>
  </aside>
</template>

<script setup>
/** 图床设置弹层：纯展示 + 跳转事件上抛（登录 / 我的图片由主组件打开对应弹层） */
import { useAuth } from '../utils/authStore';
import { IMG_HOST, MAX_IMG_W } from '../utils/constants';

defineProps({ open: Boolean });
defineEmits(['close', 'login', 'images']);

const { hostReady, displayName, myGroup } = useAuth();
</script>

<style scoped src="../utils/modal-base.css"></style>
<style scoped>
.host-modal{width:min(470px,92vw);padding:24px 26px 20px}
.host-modal h3{margin:0 0 3px;font-size:17px}
.host-modal .sub b{color:var(--primary)}
.host-state-box{
  margin:0 0 12px;padding:10px 12px;border-radius:6px;
  font-size:12px;line-height:1.7;
}
.host-state-box b{color:var(--primary)}
.host-state-box.ok{background:var(--accent-soft);color:#2F7D5A}
.host-state-box.warn{background:#FBEDE9;color:#B4603F}
.host-tip{margin:0 0 12px;font-size:11.5px;color:var(--muted);line-height:1.85}
.host-tip a{color:var(--primary)}
.host-tip code{
  padding:1px 5px;border-radius:4px;background:var(--bg);
  font-family:ui-monospace,Consolas,monospace;font-size:11px;color:var(--primary);
  word-break:break-all;
}
.host-foot{display:flex;align-items:center;gap:8px;margin-top:14px;padding-top:14px;border-top:1px solid var(--line)}
.host-foot .primary{padding:7px 18px}
.host-state{font-size:11.5px;color:var(--muted);white-space:nowrap}
</style>
