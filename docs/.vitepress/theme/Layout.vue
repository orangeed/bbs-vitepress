<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import DefaultTheme from 'vitepress/theme'
import { useData, useRoute } from 'vitepress'
import BlogHome from './components/BlogHome.vue'
import SiteFooter from './components/SiteFooter.vue'
import HeaderBrand from './components/HeaderBrand.vue'
import SearchModal from './components/SearchModal.vue'
import ArtalkComment from './components/ArtalkComment.vue'
import { Cursor } from 'animal-island-vue';

const { frontmatter, isDark } = useData()
const route = useRoute()

const isHome = computed(
  () => route.path === '/' && frontmatter.value.layout !== 'page'
)

const darkValue = ref(isDark.value)
watch(isDark, (v) => { darkValue.value = v })
watch(darkValue, (v) => { isDark.value = v })
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
