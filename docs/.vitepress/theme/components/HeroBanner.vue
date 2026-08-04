<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vitepress'
import { posts } from '../data/scanPosts'

const router = useRouter()

const slideGradients = [
  'linear-gradient(120deg, #f6a8b6, #ffd66b)',
  'linear-gradient(120deg, #5bbfb0, #7fd1c0)',
  'linear-gradient(120deg, #b89cff, #f6a8b6)',
  'linear-gradient(120deg, #ff9a76, #fecf6d)',
  'linear-gradient(120deg, #a18cd1, #fbc2eb)'
]

const slides = posts
  .filter((p) => (p.top || 0) > 0)
  .sort((a, b) => (a.top || 0) - (b.top || 0))
  .map((p, i) => ({
    title: p.title,
    desc: p.desc || p.title,
    bg: slideGradients[i % slideGradients.length],
    color: p.color as any,
    href: p.href
  }))

const current = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  if (slides.length > 1) {
    timer = setInterval(() => {
      current.value = (current.value + 1) % slides.length
    }, 4000)
  }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

function go(i: number) {
  current.value = i
}

function goPost() {
  if (slides[current.value]?.href) {
    router.go(slides[current.value].href)
  }
}
</script>

<template>
  <div v-if="slides.length" class="hero-banner" :style="{ background: slides[current].bg }" @click="goPost">
    <div v-if="slides.length > 1" class="hero-banner__dots">
      <span
        v-for="(s, i) in slides"
        :key="i"
        class="hero-banner__dot"
        :class="{ 'is-active': current === i }"
        @click.stop="go(i)"
      />
    </div>
    <div class="hero-banner__inner">
      <ATitle :color="slides[current].color" size="large">{{ slides[current].title }}</ATitle>
      <p style="margin: 30px 0 10px 0px; opacity: 0.95; font-size: 16px;">{{ slides[current].desc }}</p>
    </div>
  </div>
</template>
