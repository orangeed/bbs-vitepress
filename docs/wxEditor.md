---
layout: false
---

<script setup>
import { ref } from 'vue'
import AiLoading from './.vitepress/theme/components/AiLoading.vue'
import WxEditor from './components/wx-editor/WxEditor.vue'

// 组件挂载后会动态加载 highlight.js 并重渲染，就绪前先盖 Loading，避免看到未高亮的闪烁
const ready = ref(false)
</script>

<div style='position:absolute; width:100vw; height:100vh; top:0'>
  <WxEditor @ready="ready = true" />
  <AiLoading v-if="!ready" :active="true" style="z-index:100" />
</div>
