<script setup lang="ts">
import { useRouter } from 'vitepress'
import { featuredPosts } from '../data/scanPosts'
import dayjs from 'dayjs'

const router = useRouter()
</script>

<template>
  <ACard color="app-orange" class="island-card" style="margin-bottom: 22px;">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
      <AIcon name="icon-diy" :size="20" />
      <ATitle color="app-orange" size="small">精选文章</ATitle>
    </div>
    <ADivider type="line-brown" />
    <div v-for="(post, idx) in featuredPosts" :key="post.href" class="featured-item" @click="router.go(post.href)">
      <span class="featured-rank">{{ idx + 1 }}</span>
      <div style="min-width: 0;">
        <div class="featured-title"
          style="font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          {{ post.title }}
        </div>
        <!-- <div class="ai-muted" style="font-size: 12px;">#{{ post.tag }} · {{ post.date }}</div> -->
        <div class="ai-muted" style="font-size: 12px;">{{ dayjs(post.date).format('YYYY-MM-DD HH:mm:ss') }}</div>
      </div>
    </div>
  </ACard>
</template>
