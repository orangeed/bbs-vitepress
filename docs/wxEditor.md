---
layout: false
---

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import AiLoading from './.vitepress/theme/components/AiLoading.vue'
import IframeEmbed from './components/IframeEmbed.vue'

// SSR 阶段没有 document，给默认值，真实高度在挂载后同步
const height = ref(800)
function syncHeight() {
  height.value = document.documentElement.clientHeight
}
onMounted(() => {
  syncHeight()
  window.addEventListener('resize', syncHeight)
})
onUnmounted(() => {
  window.removeEventListener('resize', syncHeight)
})

// 编辑器本体 80KB+ HTML + 一堆依赖，加载完成前先盖 Loading
const loaded = ref(false)
</script>

<div style='position:absolute; width:100vw; height:100vh; top:0'>
  <IframeEmbed
    src="/wx-editor/wxEditor.html"
    :height="height"
    width='100%'
    @load="loaded = true"
  />
  <AiLoading v-if="!loaded" :active="true" />
</div>
