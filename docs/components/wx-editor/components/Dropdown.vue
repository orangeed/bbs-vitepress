<template>
  <span ref="rootEl" class="dd">
    <button type="button" class="dd-trigger" :title="title" :aria-expanded="open ? 'true' : 'false'" @click="toggle">
      <span>{{ currentLabel }}</span>
      <svg class="dd-caret" width="10" height="6" viewBox="0 0 10 6" fill="none">
        <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
    <!-- fixed 定位面板：脱离工具条滚动容器的裁剪；不裁剪的原因与弹层一致 -->
    <div v-if="open" ref="panelEl" class="dd-panel" :style="panelStyle">
      <button
        v-for="op in options"
        :key="op.value"
        type="button"
        class="dd-item"
        :class="{ active: op.value === modelValue }"
        @click="pick(op.value)"
      >
        <span>{{ op.label }}</span>
        <svg v-if="op.value === modelValue" width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6.5L5 9l5-6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
  </span>
</template>

<script setup>
/**
 * 极简扁平下拉：原生 select 的展开列表无法自定义样式，这里整体自绘。
 * 面板用 position:fixed（触发钮矩形定位），与弹层同理不受 overflow 裁剪。
 * 交互：点击开合、点击面板外 / Esc / 页面滚动 / 窗口缩放自动关闭。
 */
import { ref, computed, nextTick, onUnmounted } from 'vue';

const props = defineProps({
  modelValue: { type: String, default: '' },
  options: { type: Array, default: () => [] }, // [{ value, label }]
  title: { type: String, default: '' },
});
const emit = defineEmits(['update:modelValue']);

const open = ref(false);
const rootEl = ref(null);
const panelEl = ref(null);
const panelStyle = ref({});

const currentLabel = computed(() => {
  const hit = props.options.find((o) => o.value === props.modelValue);
  return hit ? hit.label : (props.options[0] && props.options[0].label) || '';
});

function toggle() {
  open.value ? close() : show();
}

function show() {
  const r = rootEl.value.getBoundingClientRect();
  const panelW = Math.max(r.width + 24, 176);
  let left = r.left;
  if (left + panelW > window.innerWidth - 8) left = window.innerWidth - panelW - 8;
  panelStyle.value = { left: left + 'px', top: r.bottom + 4 + 'px', minWidth: panelW + 'px' };
  open.value = true;
  nextTick(() => {
    document.addEventListener('mousedown', onDocMousedown, true);
    document.addEventListener('keydown', onDocKeydown, true);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
  });
}

function close() {
  if (!open.value) return;
  open.value = false;
  document.removeEventListener('mousedown', onDocMousedown, true);
  document.removeEventListener('keydown', onDocKeydown, true);
  window.removeEventListener('scroll', close, true);
  window.removeEventListener('resize', close);
}

function onDocMousedown(e) {
  const t = e.target;
  if (rootEl.value && !rootEl.value.contains(t) && panelEl.value && !panelEl.value.contains(t)) close();
}

function onDocKeydown(e) {
  if (e.key === 'Escape') close();
}

function pick(v) {
  emit('update:modelValue', v);
  close();
}

onUnmounted(close);
</script>

<style scoped>
.dd{position:relative;display:inline-flex}
.dd-trigger{
  appearance:none;font-family:inherit;font-size:12px;color:#3A3A3A;line-height:1.4;
  display:inline-flex;align-items:center;gap:7px;
  background:transparent;border:0;border-radius:6px;padding:5px 10px;cursor:pointer;white-space:nowrap;
  transition:background-color .15s;
}
.dd-trigger:hover,.dd-trigger:focus-visible{background-color:#EFECE4;outline:none}
.dd-caret{color:#999;flex:0 0 auto;transition:transform .15s}
.dd-trigger[aria-expanded='true'] .dd-caret{transform:rotate(180deg)}
.dd-panel{
  position:fixed;z-index:80;box-sizing:border-box;
  background:#fff;border:1px solid #E4E0D8;border-radius:8px;
  padding:4px;max-height:300px;overflow-y:auto;
}
.dd-item{
  display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;
  font-family:inherit;font-size:12px;color:#3A3A3A;line-height:1.4;text-align:left;
  background:transparent;border:0;border-radius:6px;padding:7px 10px;cursor:pointer;white-space:nowrap;
}
.dd-item:hover{background:#F3F1EA}
.dd-item.active{color:#B08D57;font-weight:600}
.dd-item svg{color:#B08D57;flex:0 0 auto}
</style>
