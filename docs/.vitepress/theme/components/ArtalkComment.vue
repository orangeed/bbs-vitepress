<script setup lang="ts">
import { onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useData, useRoute } from 'vitepress'
import Artalk from 'artalk'

const { isDark, page } = useData()
const route = useRoute()

let artalkInstance: any = null

function initArtalk() {
  destroyArtalk()
  nextTick(() => {
    const el = document.getElementById('artalk-container')
    if (!el) return
    artalkInstance = Artalk.init({
      el: '#artalk-container',
      server: 'https://orangecj.cn/artalk',
      site: '橘子的分享',
      pageKey: route.path,
      pageTitle: page.value.title || route.path,
      darkMode: isDark.value,
      locale: 'zh-CN'
    })
  })
}

function destroyArtalk() {
  if (artalkInstance) {
    artalkInstance.destroy()
    artalkInstance = null
  }
}

function updateDarkMode(dark: boolean) {
  if (artalkInstance) {
    artalkInstance.setDarkMode(dark)
  }
}

onMounted(() => {
  initArtalk()
})

onUnmounted(() => {
  destroyArtalk()
})

watch(isDark, (v) => updateDarkMode(v))
watch(() => route.path, () => initArtalk())
</script>

<template>
  <div class="artalk-comment-wrapper">
    <div class="artalk-header">
      <div class="artalk-header-title">COMMUNITY NOTES</div>
      <div class="artalk-header-banner">橘子留言簿</div>
      <div class="artalk-header-desc">留下昵称和邮箱，就能把想说的话带到每个人。</div>
    </div>
    <div class="artalk-body">
      <div id="artalk-container" />
    </div>
  </div>
</template>

<style scoped>
.artalk-comment-wrapper {
  margin-top: 32px;
  padding: 0 24px;
  max-width: 752px;
}
.artalk-header {
  text-align: center;
  padding: 20px 0 18px;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.15);
  margin-bottom: 20px;
}
:global(html.dark) .artalk-header {
  border-bottom-color: rgba(255, 255, 255, 0.15);
}
.artalk-header-title {
  font-size: 13px;
  letter-spacing: 3px;
  color: #2a8a7a;
  font-weight: 700;
}
:global(html.dark) .artalk-header-title {
  color: #5bbfb0;
}
.artalk-header-banner {
  display: inline-block;
  background: linear-gradient(180deg, #ffd66b, #f9b94a);
  color: #6b4f3a;
  padding: 6px 26px;
  margin: 8px 0;
  font-weight: 700;
  font-size: 18px;
  border-radius: 4px;
  font-family: serif;
}
.artalk-header-desc {
  font-size: 13px;
  color: #8a7563;
  margin-top: 4px;
}
:global(html.dark) .artalk-header-desc {
  color: #c7b6a4;
}
@media (max-width: 768px) {
  .artalk-comment-wrapper {
    padding: 0px 16px 20px 16px;
  }
}
</style>