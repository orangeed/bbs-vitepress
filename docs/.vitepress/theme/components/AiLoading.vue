<script setup lang="ts">
import { Loading } from 'animal-island-vue'

defineProps<{
  /** true 显示；false 触发圆形擦除关闭动画 */
  active: boolean
}>()
</script>

<template>
  <div class="ai-loading">
    <Loading :active="active" />
  </div>
</template>

<style scoped>
.ai-loading {
  position: absolute;
  inset: 0;
}

/* 组件默认是纯黑底 + 右下角小图，改成站点主题底色并居中放大 */
.ai-loading :deep(.animal-loading__container) {
  align-items: center;
  justify-content: center;
  padding: 0;
  background: var(--ai-bg, #ece6d4);
}

.ai-loading :deep(.illustration) {
  max-width: min(60vw, 360px);
  max-height: min(60vh, 440px);
}
</style>
