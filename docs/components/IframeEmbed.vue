<template>
  <iframe
    :src="src"
    :height="height"
    :width="width"
    frameborder="0"
    @load="$emit('load')"
  ></iframe>
</template>

<script setup>
defineProps({
  src: String,
  height: { type: [String, Number], default: 500 },
  width: { type: [String, Number], default: 1000 },
})
defineEmits(['load'])
</script>
