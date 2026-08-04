<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import HeroBanner from './HeroBanner.vue'
import NoticeBar from './NoticeBar.vue'
import PostCard from './PostCard.vue'
import FeaturedPosts from './FeaturedPosts.vue'
import SideCard from './SideCard.vue'
import { posts, categories } from '../data/scanPosts'

const PAGE_SIZE = 10
const activeCat = ref('all')
const currentPage = ref(1)

const filteredPosts = computed(() =>
  activeCat.value === 'all'
    ? posts
    : posts.filter((p) => p.tag === activeCat.value)
)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredPosts.value.length / PAGE_SIZE))
)

// 当前页文章
const pagedPosts = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredPosts.value.slice(start, start + PAGE_SIZE)
})

// 切换分类时回到第 1 页
watch(activeCat, () => {
  currentPage.value = 1
})

// 页码列表（最多展示 7 个，超出用省略号）
const pageList = computed(() => {
  const total = totalPages.value
  const cur = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const list: (number | '...')[] = [1]
  const left = Math.max(2, cur - 1)
  const right = Math.min(total - 1, cur + 1)
  if (left > 2) list.push('...')
  for (let i = left; i <= right; i++) list.push(i)
  if (right < total - 1) list.push('...')
  list.push(total)
  return list
})

function goPage(p: number) {
  if (p < 1 || p > totalPages.value) return
  currentPage.value = p
  // 回到列表顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="island-home">

    <NoticeBar />

    <HeroBanner />

    <!-- 两栏布局：左侧文章流，右侧精选/侧边 -->
    <div class="island-layout">
      <div>
        <!-- 分类标签（按 md 的 tag 字段） -->
        <div class="ai-tag-row" style="margin: 22px 0 16px;">
          <span v-for="c in categories" :key="c.key" class="ai-tag" :class="{ 'is-active': activeCat === c.key }"
            @click="activeCat = c.key">
            {{ c.label }} ({{ c.count }})
          </span>
        </div>

        <div class="post-grid">
          <PostCard v-for="post in pagedPosts" :key="post.href" :post="post" />
        </div>

        <p v-if="!filteredPosts.length" class="ai-muted" style="text-align:center;padding:40px 0;">
          该分类下暂无文章～
        </p>

        <!-- 分页 -->
        <div v-if="totalPages > 1" class="pager">
          <button class="pager__btn" :disabled="currentPage === 1" @click="goPage(currentPage - 1)">上一页</button>
          <template v-for="(p, i) in pageList" :key="i">
            <span v-if="p === '...'" class="pager__ellipsis">…</span>
            <button v-else class="pager__btn" :class="{ 'is-active': p === currentPage }" @click="goPage(p)">{{ p
            }}</button>
          </template>
          <button class="pager__btn" :disabled="currentPage === totalPages"
            @click="goPage(currentPage + 1)">下一页</button>
        </div>
      </div>

      <!-- 右侧：个人介绍+时间 → 精选文章 -->
      <aside class="featured-wrap">
        <SideCard />
        <FeaturedPosts />
      </aside>
    </div>
  </div>
</template>
