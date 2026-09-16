<template>
  <!-- 语法速查抽屉（内容含多行代码示例，必须用 v-html / {{ }} 渲染，否则模板会吃掉换行） -->
  <aside class="cheat" :class="{ open }">
    <button class="cheat-close" title="关闭（Esc）" @click="$emit('close')">×</button>
    <div class="cheat-head">语法速查</div>
    <p class="cheat-sub">左侧编辑器支持的容器与行内语法，可用左下角「快捷插入」一键套用。</p>

    <div v-for="sec in CHEAT_SECTIONS" :key="sec.title" class="cheat-sec">
      <h4>{{ sec.title }}</h4>
      <pre class="cheat-code">{{ sec.code }}</pre>
      <template v-if="sec.note">
        <p v-for="(n, i) in noteList(sec.note)" :key="i" v-html="n"></p>
      </template>
    </div>
  </aside>
</template>

<script setup>
/**
 * 语法速查抽屉：内容来自 content.ts 的 CHEAT_SECTIONS（结构化数据）。
 * 代码示例用自有样式的 pre.cheat-code 渲染（暖调扁平，与整站质感统一）。
 */
import { CHEAT_SECTIONS } from '../content';

defineProps({ open: Boolean });
defineEmits(['close']);

function noteList(n) {
  return Array.isArray(n) ? n : [n];
}
</script>

<style scoped>
/* ---------- 抽屉容器 ---------- */
.cheat{
  position:fixed;right:0;top:56px;bottom:0;width:360px;background:#fff;
  border-left:1px solid var(--line);
  transform:translateX(105%);transition:transform .25s ease;z-index:45;
  overflow-y:auto;padding:20px 22px 48px;
}
.cheat.open{transform:translateX(0)}
/* 细滚动条（扁平） */
.cheat::-webkit-scrollbar{width:8px}
.cheat::-webkit-scrollbar-thumb{background:#E2DED4;border-radius:4px}
.cheat::-webkit-scrollbar-thumb:hover{background:#D2CEC2}
.cheat::-webkit-scrollbar-track{background:transparent}

/* ---------- 头部 ---------- */
.cheat-head{font-size:13px;font-weight:600;color:var(--primary);letter-spacing:1px;padding-right:32px}
.cheat-sub{margin:6px 0 2px;font-size:11.5px;color:var(--muted);line-height:1.7}
/* 关闭按钮：绝对定位右上角，方形热区 */
.cheat-close{
  position:absolute;top:16px;right:14px;width:26px;height:26px;
  display:flex;align-items:center;justify-content:center;
  font-size:16px;line-height:1;color:var(--muted);background:transparent;
  border:0;border-radius:6px;cursor:pointer;transition:background .15s,color .15s;
}
.cheat-close:hover{background:#F0EDE6;color:var(--primary)}

/* ---------- 小节 ---------- */
.cheat-sec{padding:16px 0 14px;border-bottom:1px solid #F0EDE6}
.cheat-sec:last-child{border-bottom:0;padding-bottom:0}
.cheat-sec h4{
  display:flex;align-items:center;gap:7px;margin:0 0 10px;
  font-size:12.5px;font-weight:600;color:var(--ink);line-height:1.4;
}
.cheat-sec h4::before{content:'';width:3px;height:12px;background:var(--accent);border-radius:2px;flex:0 0 auto}

/* 代码示例块：暖调扁平 */
.cheat-code{
  margin:0;padding:11px 13px;background:#F7F6F2;border:1px solid #E9E5DC;border-radius:8px;
  font-size:11.5px;line-height:1.75;color:#4A4A45;white-space:pre-wrap;word-break:break-word;
  font-family:ui-monospace,"SFMono-Regular",Consolas,"Courier New",monospace;
  overflow-x:auto;
}
.cheat-sec p{margin:9px 0 0;font-size:11.5px;color:var(--muted);line-height:1.8}
/* 说明文字里的行内代码（v-html 内容无 scope 属性，须用 :deep 穿透） */
.cheat-sec p :deep(code){
  display:inline;background:#EFECE4;color:#8A6D3B;border-radius:4px;
  padding:1px 5px;font-size:11px;white-space:normal;
  font-family:ui-monospace,"SFMono-Regular",Consolas,"Courier New",monospace;
}
.cheat-sec p :deep(b){font-weight:600;color:#5A5A5A}
</style>
