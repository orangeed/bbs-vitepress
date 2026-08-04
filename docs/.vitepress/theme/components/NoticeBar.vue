<script setup lang="ts">
import { ref, onMounted } from 'vue'

const sentences = [
  '欢迎来到「橘子的分享」！',
  '小扇引微凉，悠悠夏日长。 ---顾太清',
  '千万不要因为走得太久，而忘记了我们为什么出发',
  '人生就像一场修行，你不可能一开始就修成正果',
  '无论多么沉重的负担，也不要忘记微笑；无论多么漫长的路程，也不要忘记坚持',
  '生活的真谛不在繁华，而在于淡泊',
  '人生不能像做菜，把所有的材料都准备好了才下锅。'
]

const currentIndex = ref(0)
const trigger = ref(0)
const showText = ref(false)

function nextSentence() {
  setTimeout(() => {
    currentIndex.value = (currentIndex.value + 1) % sentences.length
    trigger.value++
  }, 2000)
}

onMounted(() => {
  showText.value = true
})
</script>

<template>
  <div class="notice-bar">
    <AIcon name="icon-chat" :size="20" />
    <ATypewriter
      v-if="showText"
      :text="sentences[currentIndex]"
      :speed="60"
      :trigger="trigger"
      @done="nextSentence"
    />
  </div>
</template>
