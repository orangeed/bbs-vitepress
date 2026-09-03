<script setup lang="ts">
import { watch, ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useData } from 'vitepress'
import { Drawer } from './Drawer'

const router = useRouter()
const { isDark } = useData()
const darkValue = ref(isDark.value)
watch(isDark, (v) => { darkValue.value = v })
watch(darkValue, (v) => {
  const enableTransitions = 'startViewTransition' in document && window.matchMedia('(prefers-reduced-motion: no-preference)').matches
  if (!enableTransitions) {
    isDark.value = v
    return
  }
  document.startViewTransition(() => {
    isDark.value = v
  })
})

function goHome() {
  router.go('/')
}
function openSearch() {
  ; (window as any).__openSearchModal?.()
}

// 移动端抽屉
const drawerOpen = ref(false)
function openDrawer() { drawerOpen.value = true }
function closeDrawer() { drawerOpen.value = false }
const drawerLinks = [
  { label: '工具箱', href: 'https://doc.orangecj.cn', emoji: '🧰' },
  { label: '导航', href: '/navhub', emoji: '🧭' },
  { label: '公众号排版', href: '/wxEditor', emoji: '🎬' },
]
function navTo(href: string) {
  closeDrawer()
  if (href.startsWith('http')) {
    window.open(href, '_blank')
  } else {
    router.go(href)
  }
}

// 滚动阴影
const headerEl = ref<HTMLElement | null>(null)
function onScroll() {
  if (!headerEl.value) return
  headerEl.value.classList.toggle('has-shadow', window.scrollY > 0)
}
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <div ref="headerEl" class="header">
    <div class="header-brand" @click="goHome">
      <img class="header-brand__logo" src="/logo.png" alt="橘子的分享" />
      <div class="header-brand__text">
        <span class="header-brand__title">橘子的分享</span>
        <span class="header-brand__sub">Discover Infinity</span>
      </div>
    </div>
    <!-- 桌面端导航 -->
    <div class="header-nav">
      <a href="https://doc.orangecj.cn" target="_blank">工具箱</a>
      <a href="/navhub" target="_blank">导航</a>
      <a href="/wxEditor" target="_blank">公众号排版</a>
    </div>
    <!-- 桌面端搜索 + Switch -->
    <div class="header-actions desktop-only">
      <span class="header-search-input" @click="openSearch">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"
          class="search-input-icon">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <span class="search-input-text">搜索文章</span>
        <kbd class="search-input-kbd">Ctrl K</kbd>
      </span>
      <ASwitch v-model="darkValue">
        <template #checked>☀️</template>
        <template #unchecked>🌙</template>
      </ASwitch>
    </div>
    <!-- 移动端汉堡按钮 -->
    <button class="hamburger-btn" @click="openDrawer" aria-label="菜单">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>
  </div>

  <!-- 移动端抽屉 -->
  <Drawer :open="drawerOpen" title="菜单" :width="'80%'" @close="drawerOpen = false">
    <div class="drawer-body">
      <span class="drawer-search-btn" @click="openSearch(); closeDrawer()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        搜索文章
      </span>
      <div class="drawer-divider" />
      <a v-for="item in drawerLinks" :key="item.label" class="drawer-link" @click="navTo(item.href)">
        <span>{{ item.emoji }}</span>
        <span>{{ item.label }}</span>
      </a>
      <div class="drawer-divider" />
      <div class="drawer-theme-row">
        <span>模式</span>
        <ASwitch v-model="darkValue" size="small">
          <template #checked>☀️</template>
          <template #unchecked>🌙</template>
        </ASwitch>
      </div>
    </div>
  </Drawer>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10%;
  /* background: rgba(253, 246, 236, 0.75) !important; */
  background: var(--ai-bg-t) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  height: 64px;
  position: fixed;
  width: 100vw;
  /* top: 0;
  left: 0;
  right: 0; */
  z-index: 100;
  box-shadow: none;
  transition: box-shadow 0.3s ease;
}

.header.has-shadow {
  box-shadow: 0 2px 12px var(--ai-shadow);
}

:global(html.dark) .header {
  background: rgba(31, 26, 22, 0.75) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.header-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  text-decoration: none;
  flex-shrink: 0;
}

.header-brand__logo {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.header-brand__text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.header-brand__title {
  font-size: 18px;
  font-weight: 700;
  color: var(--ai-brown);
}

:global(html.dark) .header-brand__title {
  color: var(--ai-yellow);
}

.header-brand__sub {
  font-size: 11px;
  color: var(--ai-text-soft);
  letter-spacing: 0.5px;
}

.header-nav {
  display: flex;
  gap: 6px;
  align-items: center;
  margin: 0 auto;
}

.header-nav a {
  font-size: 15px;
  color: var(--ai-text);
  padding: 6px 16px;
  border-radius: 999px;
  text-decoration: none;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.header-nav a:hover {
  color: var(--ai-brown);
  background: rgba(0, 0, 0, 0.03);
}

:global(html.dark) .header-nav a:hover {
  color: var(--ai-yellow);
  background: rgba(255, 255, 255, 0.05);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

/* 搜索输入框 */
.header-search-input {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px solid var(--ai-text-soft);
  border-radius: 999px;
  background: transparent;
  color: var(--ai-text-soft);
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  font-size: 14px;
}

.header-search-input:hover {
  border-color: var(--ai-brown);
  color: var(--ai-brown);
}

:global(html.dark) .header-search-input:hover {
  border-color: var(--ai-yellow);
  color: var(--ai-yellow);
}

.search-input-icon {
  flex-shrink: 0;
}

.search-input-text {
  white-space: nowrap;
}

.search-input-kbd {
  background: var(--ai-bg);
  color: var(--ai-text-soft);
  border: 1px solid var(--ai-text-soft);
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 11px;
  font-family: inherit;
  line-height: 1.4;
}

/* 汉堡按钮 */
.hamburger-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--ai-text-soft);
  border-radius: 50%;
  background: transparent;
  color: var(--ai-text-soft);
  cursor: pointer;
  flex-shrink: 0;
}

/* 抽屉 */
.drawer-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 0;
  color: var(--ai-text);
}

.drawer-search-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  font-size: 15px;
  cursor: pointer;
  border-radius: 10px;
  transition: background 0.2s ease;
}

.drawer-search-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

:global(html.dark) .drawer-search-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

.drawer-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  font-size: 15px;
  color: inherit;
  text-decoration: none;
  cursor: pointer;
  border-radius: 10px;
  transition: background 0.2s ease;
}

.drawer-link:hover {
  background: rgba(0, 0, 0, 0.05);
}

:global(html.dark) .drawer-link:hover {
  background: rgba(255, 255, 255, 0.05);
}

.drawer-divider {
  height: 1px;
  background: #8a7563;
  opacity: 0.3;
  margin: 4px 0;
}

.drawer-theme-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  font-size: 15px;
  color: inherit;
}

/* 移动端 */
@media (max-width: 768px) {
  .header {
    height: 56px;
    padding: 6px 16px;
  }

  .header-brand__logo {
    width: 28px;
    height: 28px;
  }

  .header-brand__title {
    font-size: 15px;
  }

  .header-brand__sub {
    display: none;
  }

  .header-nav {
    display: none;
  }

  .header-search-input {
    display: none;
  }

  .desktop-only {
    display: none;
  }

  .hamburger-btn {
    display: flex;
  }
}
</style>
