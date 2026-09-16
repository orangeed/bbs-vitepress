<template>
  <aside class="keys-modal" :class="{ open }" :aria-hidden="String(!open)">
    <header>
      <span class="keys-title">⌨ 快捷键</span>
      <button class="cheat-close" title="关闭（Esc）" @click="$emit('close')">×</button>
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
</template>

<script setup>
/** 快捷键弹层：纯展示，开关由父组件控制 */
defineProps({ open: Boolean });
defineEmits(['close']);
</script>

<style scoped src="../utils/modal-base.css"></style>
<style scoped>
/* ---------- 快捷键浮层（居中弹层） ---------- */
.keys-modal{
  position:fixed;left:50%;top:50%;transform:translate(-50%,-50%) scale(.96);
  width:min(440px,92vw);max-height:80vh;background:#fff;border:1px solid var(--line);
  border-radius:10px;
  z-index:50;opacity:0;pointer-events:none;transition:opacity .18s ease,transform .18s ease;
  display:flex;flex-direction:column;overflow:hidden;
  --soft:transparent;
}
.keys-modal.open{opacity:1;pointer-events:auto;transform:translate(-50%,-50%) scale(1)}
.keys-modal header{
  height:56px;flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;
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
</style>
