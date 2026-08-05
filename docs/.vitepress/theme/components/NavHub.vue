<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useData } from 'vitepress'
import { categories } from './data'

const { isDark: vpIsDark } = useData()

// Local theme state that syncs with VitePress dark mode
// Local theme state that syncs with VitePress dark mode.
// The original NavHub design defaults to dark, so we default to dark
// when no saved preference exists.
const savedTheme = typeof localStorage !== 'undefined'
  ? localStorage.getItem('vitepress-theme-appearance')
  : null
const isDark = ref(savedTheme ? savedTheme === 'dark' : true)

function updateThemeState() {
  if (typeof document !== 'undefined') {
    isDark.value = document.documentElement.classList.contains('dark')
  }
}

function toggleTheme() {
  if (typeof document !== 'undefined') {
    const html = document.documentElement
    const newDark = !html.classList.contains('dark')
    if (newDark) {
      html.classList.add('dark')
      localStorage.setItem('vitepress-theme-appearance', 'dark')
    } else {
      html.classList.remove('dark')
      localStorage.setItem('vitepress-theme-appearance', 'light')
    }
    // Also update the color-scheme meta if needed
    updateThemeState()
  }
}

const navItems = computed(() => {
  const totalSites = categories.reduce((sum, c) => sum + c.sites.length, 0)
  return [
    { id: 'all', icon: '🏠', name: '全部', count: totalSites },
    ...categories.map(c => ({ id: c.id, icon: c.icon, name: c.name, count: c.sites.length }))
  ]
})

const quickTags = [
  { label: '🔥 ChatGPT', keyword: 'chatgpt' },
  { label: '🎬 Bilibili', keyword: 'bilibili' },
  { label: '💻 GitHub', keyword: 'github' },
  { label: '🎨 Figma', keyword: 'figma' },
  { label: '📺 YouTube', keyword: 'youtube' },
]

// --- State ---
const activeCat = ref('all')
const searchQuery = ref('')
const drawerOpen = ref(false)
const searchInputRef = ref<HTMLInputElement | null>(null)
const isMobile = ref(false)

// --- Computed ---
const visibleCategories = computed(() => {
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    return categories
      .map(cat => ({
        ...cat,
        sites: cat.sites.filter(site =>
          site.name.toLowerCase().includes(q) ||
          site.desc.toLowerCase().includes(q) ||
          site.displayUrl.toLowerCase().includes(q)
        )
      }))
      .filter(cat => cat.sites.length > 0)
  }
  if (activeCat.value === 'all') return categories
  return categories.filter(c => c.id === activeCat.value)
})

const totalSiteCount = computed(() => categories.reduce((sum, c) => sum + c.sites.length, 0))

// Watch searchQuery to reset active category to 'all' when user types
function onSearchInput() {
  if (searchQuery.value.trim()) {
    activeCat.value = 'all'
  }
}

// --- Methods ---
function setCategory(catId: string) {
  activeCat.value = catId
  searchQuery.value = ''
  if (isMobile.value) {
    closeDrawer()
  }
  // Scroll to the section
  nextTick(() => {
    if (catId !== 'all') {
      const el = document.getElementById(`cat-${catId}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  })
}

function handleQuickTag(keyword: string) {
  searchQuery.value = keyword
  activeCat.value = 'all'
  nextTick(() => {
    if (searchInputRef.value) {
      searchInputRef.value.focus()
    }
  })
}

function toggleDrawer() {
  drawerOpen.value = !drawerOpen.value
  if (drawerOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

function closeDrawer() {
  drawerOpen.value = false
  document.body.style.overflow = ''
}

function focusSearch() {
  if (searchInputRef.value) {
    searchInputRef.value.focus()
    searchInputRef.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

// Keyboard shortcut: Cmd/Ctrl + K
function handleKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    focusSearch()
  }
}

// Check mobile
function checkMobile() {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkMobile()
  // Apply default/saved theme class on mount to match the original dark-by-default design.
  if (typeof document !== 'undefined') {
    const html = document.documentElement
    if (isDark.value) {
      html.classList.add('dark')
      localStorage.setItem('vitepress-theme-appearance', 'dark')
    } else {
      html.classList.remove('dark')
      localStorage.setItem('vitepress-theme-appearance', 'light')
    }
    updateThemeState()
  }
  const observer = new MutationObserver(updateThemeState)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  window.addEventListener('resize', checkMobile)
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <ACursor>
    <div class="navhub-app" :class="{ 'is-dark': isDark, 'is-light': !isDark }">
      <!-- Mobile Top Bar -->
      <header class="mobile-topbar" v-if="isMobile">
        <div class="mobile-topbar-left">
          <button class="hamburger" @click="toggleDrawer" aria-label="打开菜单">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div class="logo">
            <div class="logo-icon">O</div>
            <div class="logo-text">orange<span>导航</span></div>
          </div>
        </div>
        <div class="mobile-topbar-actions">
          <!-- <button class="mobile-icon-btn" @click="focusSearch" aria-label="搜索">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button> -->
          <button class="mobile-icon-btn" @click="toggleTheme" aria-label="切换明暗主题">
            <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>
        </div>
      </header>

      <!-- Drawer Backdrop -->
      <div class="drawer-backdrop" :class="{ visible: drawerOpen }" @click="closeDrawer" v-if="drawerOpen && isMobile">
      </div>

      <!-- Sidebar -->
      <aside class="sidebar" :class="{ open: drawerOpen && isMobile }">
        <div class="logo">
          <div class="logo-icon">O</div>
          <div class="logo-text">橘子的<span>导航</span></div>
        </div>

        <div class="sidebar-label">全部分类</div>
        <ul class="nav-list">
          <li v-for="item in navItems" :key="item.id" class="nav-item" :class="{ active: activeCat === item.id }"
            @click="setCategory(item.id)">
            <span class="nav-icon">{{ item.icon }}</span>
            <span>{{ item.name }}</span>
            <span class="nav-count">{{ item.count }}</span>
          </li>
        </ul>
        <div class="sidebar-footer">
          <ADivider type="dashed-brown" />
          <div class="theme-toggle" @click="toggleTheme" role="button" tabindex="0" aria-label="切换明暗主题">
            <div class="theme-toggle-knob"></div>
            <div class="theme-toggle-option theme-toggle-option--light">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
                stroke-linejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
              <span>亮色</span>
            </div>
            <div class="theme-toggle-option theme-toggle-option--dark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
                stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              <span>暗色</span>
            </div>
          </div>
          <!-- <div class="sidebar-link">
          <span>⭐</span>
          <span>收藏管理</span>
        </div>
        <div class="sidebar-link">
          <span>⚙️</span>
          <span>设置偏好</span>
        </div>
        <div class="sidebar-link">
          <span>💡</span>
          <span>提交网站</span>
        </div> -->
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main">
        <!-- Hero / Search -->
        <section class="hero">
          <h1 class="hero-title">探索 <span>优质网站</span></h1>
          <p class="hero-subtitle">精选 {{ totalSiteCount }}+ 常用网站，让你的上网效率翻倍</p>
          <div class="search-wrapper">
            <AInput allowClear shadow placeholder="搜索网站名称或关键词" size="large" v-model="searchQuery" @input="onSearchInput"
              ref="searchInputRef">
              <template #prefix> <span style="padding:0px 10px">🔍</span> </template>
            </AInput>
          </div>

        </section>

        <!-- Category Sections -->
        <section v-for="cat in visibleCategories" :key="cat.id" class="category-section" :id="`cat-${cat.id}`">
          <div class="category-header">
            <div class="category-icon-wrapper" :style="{ background: cat.iconBg }">
              <span>{{ cat.icon }}</span>
            </div>
            <div>
              <div class="category-title">{{ cat.name }}</div>
              <div class="category-desc">{{ cat.desc }}</div>
            </div>
            <div class="category-line"></div>
          </div>
          <div class="sites-grid">
            <a v-for="(site, idx) in cat.sites" :key="site.name" class="site-card"
              :style="{ '--card-accent': site.accent }" :href="site.url" target="_blank"
              :animation-delay="`${idx * 50}ms`">
              <div class="site-card-header">
                <div class="site-favicon" :style="{ background: site.faviconBg }"
                  :class="{ 'has-border': site.name === 'X (Twitter)' || site.name === 'MDN Web Docs' }">{{ site.favicon
                  }}</div>
                <div>
                  <div class="site-name">{{ site.name }}</div>
                  <div class="site-url">{{ site.displayUrl }}</div>
                </div>
              </div>
              <p class="site-desc">{{ site.desc }}</p>
              <span class="site-tag" :style="{ background: site.tagBg, color: site.tagColor }">{{ site.tag }}</span>
            </a>
          </div>
        </section>

        <!-- Footer -->
        <footer class="footer">
          <div class="footer-divider"></div>
          <p>橘子的导航 — 让每一次点击都更高效</p>
          <p style="margin-top: 8px; font-size: 12px;">© {{ new Date().getFullYear() }} 橘子的导航. 精选优质网站导航 · 持续更新中</p>
        </footer>
      </main>
    </div>
  </ACursor>
</template>

<style scoped lang="scss">
@import './NavHub.scss'
</style>