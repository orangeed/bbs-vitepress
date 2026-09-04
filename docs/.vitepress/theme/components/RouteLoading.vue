<script setup lang="ts">
import AiLoading from './AiLoading.vue'

defineProps<{
  /** 整层遮罩是否挂载显示 */
  visible: boolean
  /** 传给 ALoading：true 显示，false 触发圆形擦除关闭动画 */
  active: boolean
}>()
</script>

<template>
  <div v-show="visible" class="route-loading">
    <AiLoading :active="active" />
  </div>
</template>

<style scoped>
.route-loading {
  position: fixed;
  inset: 0;
  z-index: 9999;
}
</style>
