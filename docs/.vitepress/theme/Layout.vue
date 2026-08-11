<script setup lang="ts">
import { computed, watch, ref, onMounted, onUnmounted } from 'vue'
import DefaultTheme from 'vitepress/theme'
import { useData, useRoute } from 'vitepress'
import BlogHome from './components/BlogHome.vue'
import SiteFooter from './components/SiteFooter.vue'
import HeaderBrand from './components/HeaderBrand.vue'
import SearchModal from './components/SearchModal.vue'
import ArtalkComment from './components/ArtalkComment.vue'
import { Cursor } from 'animal-island-vue'

const { frontmatter, isDark } = useData()
const route = useRoute()

const isHome = computed(
  () => route.path === '/' && frontmatter.value.layout !== 'page'
)

const darkValue = ref(isDark.value)
watch(isDark, (v) => { darkValue.value = v })
watch(darkValue, (v) => { isDark.value = v })

// ========== 图片点击放大灯箱 ==========
function openLightbox(img: HTMLImageElement) {
  const existing = document.querySelector('.doc-lightbox')
  if (existing) existing.remove()

  const overlay = document.createElement('div')
  overlay.className = 'doc-lightbox'

  const cloned = document.createElement('img')
  cloned.src = img.src
  cloned.alt = img.alt
  cloned.className = 'doc-lightbox__img'

  overlay.appendChild(cloned)
  document.body.appendChild(overlay)
  document.body.style.overflow = 'hidden'

  overlay.addEventListener('click', closeLightbox)
  document.addEventListener('keydown', onEscClose)
}

function closeLightbox() {
  const overlay = document.querySelector('.doc-lightbox')
  if (overlay) overlay.remove()
  document.body.style.overflow = ''
  document.removeEventListener('keydown', onEscClose)
}

function onEscClose(e: KeyboardEvent) {
  if (e.key === 'Escape') closeLightbox()
}

function onImgClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (target.tagName === 'IMG' && target.closest('.vp-doc')) {
    openLightbox(target as HTMLImageElement)
  }
}

onMounted(() => {
  document.addEventListener('click', onImgClick)
})
onUnmounted(() => {
  document.removeEventListener('click', onImgClick)
  document.removeEventListener('keydown', onEscClose)
})
</script>

<template>
  <DefaultTheme.Layout>
    <template #layout-top>
      <HeaderBrand />
      <Cursor v-if="isHome">
        <BlogHome />
      </Cursor>
    </template>
    <template #doc-after>
      <ArtalkComment v-if="!isHome" />
    </template>
    <template #layout-bottom>
      <SearchModal />
      <AFooter style="margin-top:48px" />
      <SiteFooter />
    </template>
  </DefaultTheme.Layout>
</template>
