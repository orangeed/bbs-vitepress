<script setup lang="ts">
import { useRouter } from 'vitepress'
import type { Post } from '../data/scanPosts'
import dayjs from 'dayjs'

defineProps<{ post: Post }>()
const router = useRouter()
</script>

<template>
  <ACard class="island-card post-card" @click="router.go(post.href)">
    <div class="post-card__body">
      <div v-if="post.coverType === 'image'" class="post-card__cover is-image">
        <img :src="post.cover" :alt="post.title" loading="lazy" />
      </div>
      <div class="post-card__content">
        <h2>{{ post.title }}</h2>
        <p class="post-desc ai-muted">
          {{ post.desc }}
        </p>
        <ADivider type="dashed-brown" />
        <div class="ai-meta">
          <span>
            <AIcon name="icon-camera" :size="14" /> {{ dayjs(post.date).format('YYYY-MM-DD HH:mm:ss') }}
          </span>
          <span>
            <AIcon name="icon-diy" :size="14" /> {{ post.reading }} 分钟
          </span>
        </div>
        <div style="margin-top: 10px;">
          <span class="ai-tag" style="cursor: default;">#{{ post.tag }}</span>
        </div>
      </div>
    </div>
  </ACard>
</template>

<style scoped>
.post-card {
  /* background: var(--ai-bg) !important; */
  cursor: pointer;
  transition: transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94),
    box-shadow 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94),
    background 0.35s ease;
  border: 1px solid var(--ai-shadow) !important;
}

.post-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 14px 28px var(--ai-shadow);
  /* background: var(--ai-bg-soft) !important; */
}

.post-card__body {
  display: flex;
  flex-direction: row-reverse;
  gap: 16px;
  align-items: flex-start;
}

.post-card__cover.is-image {
  flex: 0 0 200px;
  width: 200px;
  line-height: 0;
}

.post-card__cover.is-image img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
  border-radius: 14px;
}

.post-card__content {
  flex: 1;
  min-width: 0;
}

.ai-meta {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 13px;
  color: var(--ai-text-soft, #8a7563);
  margin-top: 4px;
}

.ai-meta span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

@media (max-width: 640px) {
  .post-card__body {
    flex-direction: column;
  }

  .post-card__content {
    order: 1;
  }

  .post-card__cover.is-image {
    order: 2;
    flex-basis: auto;
    width: 100%;
  }

  .post-card__cover.is-image img {
    height: 180px;
  }
}
</style>
