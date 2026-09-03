---
layout: false
---

<script setup>
import IframeEmbed from './components/IframeEmbed.vue'
const height = document.documentElement.clientHeight
</script>

<div style='position:absolute; width:100vw; height:100vh; top:0'>
    <IframeEmbed src="/wx-editor/wxEditor.html" :height="height" width='100%' />
</div>
