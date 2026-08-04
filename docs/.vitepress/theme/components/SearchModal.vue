<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vitepress'
import { posts } from '../data/scanPosts'

const router = useRouter()

const mounted = ref(false)
const open = ref(false)

const query = ref('')
const keyword = ref('')

// 顶层挂载，确保其他组件随时可调用
if (typeof window !== 'undefined') {
  ; (window as any).__openSearchModal = () => {
    open.value = true
    query.value = ''
    keyword.value = ''
    nextTick(() => {
      const input = document.querySelector('.search-modal-body input') as HTMLInputElement
      input?.focus()
    })
  }
}

interface SearchItem {
  title: string
  desc: string
  href: string
  tag: string
}

const searchIndex = posts.map((p) => ({
  title: p.title,
  desc: p.desc,
  href: p.href,
  tag: p.tag
}))

let timer: number

watch(query, (v) => {
  clearTimeout(timer)

  timer = window.setTimeout(() => {
    keyword.value = v.trim().toLowerCase()
  }, 150)
})

function calcScore(item: SearchItem, q: string) {
  let score = 0

  const title = item.title.toLowerCase()
  const desc = item.desc.toLowerCase()
  const tag = item.tag.toLowerCase()

  if (title === q) score += 100
  else if (title.startsWith(q)) score += 60
  else if (title.includes(q)) score += 40

  if (tag === q) score += 50
  else if (tag.includes(q)) score += 20

  if (desc.includes(q)) score += 10

  return score
}

const results = computed(() => {
  if (!keyword.value) return []

  return searchIndex
    .map((item) => ({
      ...item,
      score: calcScore(item, keyword.value)
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
})

function highlight(text: string) {
  if (!keyword.value) return text

  return text.replace(
    new RegExp(`(${keyword.value})`, 'ig'),
    '<mark>$1</mark>'
  )
}

function openSearch() {
  ; (window as any).__openSearchModal?.()
}

function closeSearch() {
  open.value = false
  query.value = ''
  keyword.value = ''
}

function goTo(item: SearchItem) {
  closeSearch()
  router.go(item.href)
}

function interceptSearchClick(e: MouseEvent) {
  const target = e.target as HTMLElement

  if (
    target.closest('.DocSearch-Button') ||
    target.closest('.DocSearch')
  ) {
    e.preventDefault()
    e.stopPropagation()

    openSearch()
  }
}

function handleKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    openSearch()
  }

  if (!open.value) return

  if (e.key === 'Escape') {
    closeSearch()
  }

  if (e.key === 'Enter' && results.value.length) {
    goTo(results.value[0])
  }
}

onMounted(() => {
  mounted.value = true

  document.addEventListener(
    'click',
    interceptSearchClick,
    true
  )

  document.addEventListener(
    'keydown',
    handleKeydown
  )
})

onUnmounted(() => {
  document.removeEventListener(
    'click',
    interceptSearchClick,
    true
  )

  document.removeEventListener(
    'keydown',
    handleKeydown
  )

  clearTimeout(timer)
})
</script>

<template>
  <div class="search-modal-instance">
    <AModal v-if="mounted" :open="open" title="搜索文章" :width="560" :show-footer="false" @update:open="closeSearch">
      <div class="search-modal-body">

        <AInput v-model="query" placeholder="输入标题、描述、标签..." allow-clear>
          <template #prefix> <span style="padding:0px 10px">🔍</span> </template>
        </AInput>

        <div class="search-results">

          <template v-if="query">
            <div v-if="results.length" v-for="item in results" :key="item.href" class="search-card" @click="goTo(item)">
              <div class="search-card__title" v-html="highlight(item.title)" />
              <div class="search-card__desc" v-html="highlight(item.desc)" />
              <div class="search-card__tag" v-html="'# ' + highlight(item.tag)" />
            </div>

            <div v-else class="search-empty">
              😥 未找到相关文章
            </div>

          </template>

          <div v-else class="search-empty">
            输入关键词开始搜索
          </div>

        </div>

      </div>
    </AModal>
  </div>
</template>

<style>
.search-modal-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.search-results {
  max-height: 620px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.search-empty {
  text-align: center;
  padding: 40px 20px;
  color: #8a7563;
}

html.dark .search-empty {
  color: #c7b6a4;
}

.search-card {
  cursor: pointer;
  padding: 14px 16px;
  background: #fdf6ec;
  border: 1px solid #8a7563;
  border-radius: 14px;
  transition: .2s;
}

html.dark .search-card {
  background: #1f1a16;
  border-color: #c7b6a4;
}

.search-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, .08);
  border-color: #6b4f3a;
}

html.dark .search-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, .35);
  border-color: #ffd66b;
}

.search-card__title {
  font-weight: 700;
  color: #3d2f23;
  font-size: 15px;
}

html.dark .search-card__title {
  color: #fff3e6;
}

.search-card__desc {
  margin-top: 6px;
  line-height: 1.6;
  color: #8a7563;
  font-size: 13px;
}

html.dark .search-card__desc {
  color: #c7b6a4;
}

.search-card__tag {
  margin-top: 10px;
  display: inline-block;
  font-size: 12px;
  color: #8a7563;
  background: rgba(138, 117, 99, .1);
  padding: 3px 10px;
  border-radius: 999px;
}

html.dark .search-card__tag {
  color: #c7b6a4;
  background: rgba(255, 255, 255, .08);
}

mark {
  background: #ffe58f;
  color: inherit;
  padding: 0 2px;
  border-radius: 2px;
}

html.dark mark {
  background: #b8860b;
  color: white;
}
</style>