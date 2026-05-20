<template>
  <div class="iframe-wrapper">
    <iframe :src="src" :height="height" :width="width" frameborder="0"></iframe>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
  src: String,
  height: { type: [String, Number], default: 500 },
  width: { type: [String, Number], default: 1000 },
})
</script>