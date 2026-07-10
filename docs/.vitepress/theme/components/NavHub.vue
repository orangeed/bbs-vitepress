<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useData } from 'vitepress'

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

// --- Navigation Data ---
interface SiteItem {
  name: string
  url: string
  displayUrl: string
  desc: string
  favicon: string
  faviconBg: string
  tag: string
  tagBg: string
  tagColor: string
  accent: string
}

interface Category {
  id: string
  icon: string
  name: string
  desc: string
  iconBg: string
  sites: SiteItem[]
}

const categories: Category[] = [
  {
    id: 'ai',
    icon: '🤖',
    name: 'AI 工具',
    desc: '提升效率的人工智能平台',
    iconBg: 'rgba(99,102,241,0.15)',
    sites: [
      { name: 'ChatGPT', url: 'https://chat.openai.com', displayUrl: 'chat.openai.com', desc: 'OpenAI 推出的智能对话助手，支持文本生成、代码编写、问题解答等多种任务', favicon: 'C', faviconBg: '#10a37f', tag: '对话 AI', tagBg: 'rgba(16,163,127,0.12)', tagColor: '#10a37f', accent: '#10a37f' },
      { name: 'Claude', url: 'https://claude.ai', displayUrl: 'claude.ai', desc: 'Anthropic 开发的 AI 助手，擅长长文本分析、推理和代码生成', favicon: 'Cl', faviconBg: '#a855f7', tag: '对话 AI', tagBg: 'rgba(168,85,247,0.12)', tagColor: '#a855f7', accent: '#a855f7' },
      { name: 'Midjourney', url: 'https://www.midjourney.com', displayUrl: 'midjourney.com', desc: '强大的 AI 图像生成工具，输入文字描述即可创作高质量艺术作品', favicon: 'M', faviconBg: '#ec4899', tag: 'AI 绘画', tagBg: 'rgba(236,72,153,0.12)', tagColor: '#ec4899', accent: '#ec4899' },
      { name: 'Stable Diffusion', url: 'https://stability.ai', displayUrl: 'stability.ai', desc: '开源 AI 图像生成模型，支持本地部署，自由创作无限可能', favicon: 'S', faviconBg: '#f97316', tag: 'AI 绘画', tagBg: 'rgba(249,115,22,0.12)', tagColor: '#f97316', accent: '#f97316' },
      { name: 'Perplexity', url: 'https://www.perplexity.ai', displayUrl: 'perplexity.ai', desc: 'AI 驱动的搜索引擎，结合实时网络信息给出精准答案和引用来源', favicon: 'P', faviconBg: '#06b6d4', tag: 'AI 搜索', tagBg: 'rgba(6,182,212,0.12)', tagColor: '#06b6d4', accent: '#06b6d4' },
      { name: 'GitHub Copilot', url: 'https://github.com/features/copilot', displayUrl: 'github.com/copilot', desc: 'AI 编程助手，在编辑器中实时提供代码建议和自动补全', favicon: 'G', faviconBg: '#eab308', tag: 'AI 编程', tagBg: 'rgba(234,179,8,0.12)', tagColor: '#eab308', accent: '#eab308' },
      { name: 'Notion AI', url: 'https://www.notion.so/product/ai', displayUrl: 'notion.so/product/ai', desc: '集成在 Notion 中的 AI 助手，支持写作、总结、翻译等工作流', favicon: 'N', faviconBg: '#3b82f6', tag: 'AI 写作', tagBg: 'rgba(59,130,246,0.12)', tagColor: '#3b82f6', accent: '#3b82f6' },
      { name: 'Runway', url: 'https://runwayml.com', displayUrl: 'runwayml.com', desc: 'AI 视频创作平台，支持文生视频、视频编辑、特效生成等功能', favicon: 'R', faviconBg: '#ef4444', tag: 'AI 视频', tagBg: 'rgba(239,68,68,0.12)', tagColor: '#ef4444', accent: '#ef4444' },
    ]
  },
  {
    id: 'video',
    icon: '🎬',
    name: '影视娱乐',
    desc: '追剧观影、视频创作一站式直达',
    iconBg: 'rgba(239,68,68,0.15)',
    sites: [
      { name: '哔哩哔哩', url: 'https://www.bilibili.com', displayUrl: 'bilibili.com', desc: '年轻人喜爱的弹幕视频网站，涵盖动画、游戏、知识等丰富内容', favicon: 'B', faviconBg: '#fb7299', tag: '视频平台', tagBg: 'rgba(251,114,153,0.12)', tagColor: '#fb7299', accent: '#fb7299' },
      { name: 'YouTube', url: 'https://www.youtube.com', displayUrl: 'youtube.com', desc: '全球最大的视频分享平台，海量创作者内容和多元频道', favicon: 'Y', faviconBg: '#ff0000', tag: '视频平台', tagBg: 'rgba(255,0,0,0.12)', tagColor: '#ff5252', accent: '#ff0000' },
      { name: 'Netflix', url: 'https://www.netflix.com', displayUrl: 'netflix.com', desc: '全球领先的流媒体平台，原创剧集、电影和纪录片资源丰富', favicon: 'N', faviconBg: '#e50914', tag: '影视', tagBg: 'rgba(229,9,20,0.12)', tagColor: '#e50914', accent: '#e50914' },
      { name: '爱奇艺', url: 'https://www.iqiyi.com', displayUrl: 'iqiyi.com', desc: '国内领先的视频平台，提供热播剧集、综艺、电影等正版内容', favicon: 'i', faviconBg: '#00a1d6', tag: '影视', tagBg: 'rgba(0,161,214,0.12)', tagColor: '#00a1d6', accent: '#00a1d6' },
      { name: '豆瓣', url: 'https://www.douban.com', displayUrl: 'douban.com', desc: '发现好电影、好书、好音乐的文艺青年聚集地，评分参考首选', favicon: '豆', faviconBg: '#ff6010', tag: '影视评分', tagBg: 'rgba(255,96,16,0.12)', tagColor: '#ff6010', accent: '#ff6010' },
      { name: 'Twitch', url: 'https://www.twitch.tv', displayUrl: 'twitch.tv', desc: '全球最大的游戏直播平台，也涵盖音乐、聊天等多元直播内容', favicon: 'T', faviconBg: '#8b5cf6', tag: '直播', tagBg: 'rgba(139,92,246,0.12)', tagColor: '#8b5cf6', accent: '#8b5cf6' },
    ]
  },
  {
    id: 'dev',
    icon: '💻',
    name: '开发工具',
    desc: '程序员的高效工具箱',
    iconBg: 'rgba(129,140,248,0.15)',
    sites: [
      { name: 'GitHub', url: 'https://github.com', displayUrl: 'github.com', desc: '全球最大的代码托管平台，开源协作和版本控制的首选', favicon: 'G', faviconBg: '#24292e', tag: '代码托管', tagBg: 'rgba(240,246,252,0.1)', tagColor: '#c9d1d9', accent: '#f0f6fc' },
      { name: 'Stack Overflow', url: 'https://stackoverflow.com', displayUrl: 'stackoverflow.com', desc: '程序员问答社区，几乎所有技术问题都能找到答案', favicon: 'S', faviconBg: '#f48024', tag: '技术问答', tagBg: 'rgba(244,128,36,0.12)', tagColor: '#f48024', accent: '#f48024' },
      { name: 'MDN Web Docs', url: 'https://developer.mozilla.org', displayUrl: 'developer.mozilla.org', desc: 'Web 开发权威文档，HTML、CSS、JavaScript 的参考圣经', favicon: 'MD', faviconBg: '#1a1a1a', tag: '技术文档', tagBg: 'rgba(128,128,128,0.15)', tagColor: '#8b949e', accent: '#000000' },
      { name: 'VS Code', url: 'https://code.visualstudio.com', displayUrl: 'code.visualstudio.com', desc: '微软出品的免费代码编辑器，插件丰富，开发体验一流', favicon: 'VS', faviconBg: '#007acc', tag: '编辑器', tagBg: 'rgba(0,122,204,0.12)', tagColor: '#007acc', accent: '#007acc' },
      { name: 'Kubernetes', url: 'https://kubernetes.io', displayUrl: 'kubernetes.io', desc: '容器编排标准平台，云原生时代的核心基础设施', favicon: 'K8', faviconBg: '#326ce5', tag: 'DevOps', tagBg: 'rgba(50,108,229,0.12)', tagColor: '#326ce5', accent: '#326ce5' },
      { name: 'Docker', url: 'https://www.docker.com', displayUrl: 'docker.com', desc: '容器化开发部署工具，一次构建到处运行', favicon: 'D', faviconBg: '#2496ed', tag: 'DevOps', tagBg: 'rgba(36,150,237,0.12)', tagColor: '#2496ed', accent: '#2496ed' },
      { name: 'npm', url: 'https://www.npmjs.com', displayUrl: 'npmjs.com', desc: 'Node.js 包管理仓库，前端开发必不可少的依赖管理平台', favicon: 'np', faviconBg: '#cb171e', tag: '包管理', tagBg: 'rgba(203,23,30,0.12)', tagColor: '#cb171e', accent: '#cb171e' },
    ]
  },
  {
    id: 'design',
    icon: '🎨',
    name: '设计资源',
    desc: '灵感激发与设计工具集合',
    iconBg: 'rgba(236,72,153,0.15)',
    sites: [
      { name: 'Figma', url: 'https://www.figma.com', displayUrl: 'figma.com', desc: '协作式界面设计工具，支持实时多人编辑和原型交互', favicon: 'F', faviconBg: '#a259ff', tag: '设计工具', tagBg: 'rgba(162,89,255,0.12)', tagColor: '#a259ff', accent: '#a259ff' },
      { name: 'Dribbble', url: 'https://dribbble.com', displayUrl: 'dribbble.com', desc: '设计师作品展示社区，获取 UI/UX 设计灵感的最佳去处', favicon: 'Dr', faviconBg: '#ea4c89', tag: '设计灵感', tagBg: 'rgba(234,76,137,0.12)', tagColor: '#ea4c89', accent: '#ea4c89' },
      { name: 'Behance', url: 'https://www.behance.net', displayUrl: 'behance.net', desc: 'Adobe 旗下创意作品展示平台，涵盖平面、UI、插画等多领域', favicon: 'Be', faviconBg: '#1769ff', tag: '设计灵感', tagBg: 'rgba(23,105,255,0.12)', tagColor: '#1769ff', accent: '#1769ff' },
      { name: 'Storyset', url: 'https://storyset.com', displayUrl: 'storyset.com', desc: '免费可定制插画素材库，支持动画效果和颜色调整', favicon: 'St', faviconBg: '#ff4785', tag: '素材资源', tagBg: 'rgba(255,71,133,0.12)', tagColor: '#ff4785', accent: '#ff4785' },
      { name: 'unDraw', url: 'https://undraw.co', displayUrl: 'undraw.co', desc: '开源 MIT 协议的 SVG 插画集合，支持自定义品牌配色', favicon: 'un', faviconBg: '#4daf50', tag: '素材资源', tagBg: 'rgba(77,175,80,0.12)', tagColor: '#4daf50', accent: '#4daf50' },
      { name: 'Coolors', url: 'https://coolors.co', displayUrl: 'coolors.co', desc: '快速配色方案生成工具，按空格即可探索新的色彩组合', favicon: 'Co', faviconBg: '#ff7a59', tag: '配色工具', tagBg: 'rgba(255,122,89,0.12)', tagColor: '#ff7a59', accent: '#ff7a59' },
    ]
  },
  {
    id: 'social',
    icon: '💬',
    name: '社交媒体',
    desc: '连接世界，分享生活',
    iconBg: 'rgba(59,130,246,0.15)',
    sites: [
      { name: 'X (Twitter)', url: 'https://twitter.com', displayUrl: 'twitter.com', desc: '全球实时信息分享平台，关注科技、AI 等领域最新动态', favicon: 'X', faviconBg: '#000000', tag: '社交', tagBg: 'rgba(29,155,240,0.12)', tagColor: '#1d9bf0', accent: '#1d9bf0' },
      { name: '微博', url: 'https://weibo.com', displayUrl: 'weibo.com', desc: '中文社交媒体平台，热点话题、明星动态和资讯分享', favicon: '微', faviconBg: '#e6162d', tag: '社交', tagBg: 'rgba(230,22,45,0.12)', tagColor: '#e6162d', accent: '#e6162d' },
      { name: '微信', url: 'https://weixin.qq.com', displayUrl: 'weixin.qq.com', desc: '国民级社交通信应用，集即时通讯、朋友圈、小程序于一体', favicon: '微', faviconBg: '#07c160', tag: '社交', tagBg: 'rgba(7,193,96,0.12)', tagColor: '#07c160', accent: '#07c160' },
      { name: 'Reddit', url: 'https://www.reddit.com', displayUrl: 'reddit.com', desc: '全球最大的论坛社区，涵盖几乎所有兴趣话题的 Subreddit', favicon: 'R', faviconBg: '#ff4500', tag: '社区', tagBg: 'rgba(255,69,0,0.12)', tagColor: '#ff4500', accent: '#ff4500' },
      { name: 'Telegram', url: 'https://t.me', displayUrl: 't.me', desc: '注重隐私的即时通讯应用，支持大型群组和频道功能', favicon: 'Tg', faviconBg: '#0084ff', tag: '社交', tagBg: 'rgba(0,132,255,0.12)', tagColor: '#0084ff', accent: '#0084ff' },
    ]
  },
  {
    id: 'news',
    icon: '📰',
    name: '新闻资讯',
    desc: '保持信息敏锐，洞察行业趋势',
    iconBg: 'rgba(255,159,28,0.15)',
    sites: [
      { name: 'Hacker News', url: 'https://news.ycombinator.com', displayUrl: 'news.ycombinator.com', desc: 'Y Combinator 旗下技术新闻社区，关注创业、编程和科技趋势', favicon: 'Y', faviconBg: '#ff6600', tag: '科技', tagBg: 'rgba(255,102,0,0.12)', tagColor: '#ff6600', accent: '#ff6600' },
      { name: '36氪', url: 'https://www.36kr.com', displayUrl: '36kr.com', desc: '国内领先的科技商业媒体，聚焦创业、投资和前沿科技', favicon: '36', faviconBg: '#0a9928', tag: '科技', tagBg: 'rgba(10,153,40,0.12)', tagColor: '#0a9928', accent: '#0a9928' },
      { name: 'The Verge', url: 'https://www.theverge.com', displayUrl: 'theverge.com', desc: '科技文化媒体，深度报道科技、科学和未来趋势', favicon: 'TV', faviconBg: '#cb3837', tag: '科技', tagBg: 'rgba(203,56,55,0.12)', tagColor: '#cb3837', accent: '#cb3837' },
      { name: 'TechCrunch', url: 'https://www.techcrunch.com', displayUrl: 'techcrunch.com', desc: '专注科技创业和风险投资新闻的权威媒体', favicon: 'TC', faviconBg: '#cf000f', tag: '科技', tagBg: 'rgba(207,0,15,0.12)', tagColor: '#cf000f', accent: '#cf000f' },
      { name: 'BBC News', url: 'https://www.bbc.com/news', displayUrl: 'bbc.com/news', desc: '英国广播公司新闻频道，全球视角的权威新闻来源', favicon: 'B', faviconBg: '#bb1919', tag: '新闻', tagBg: 'rgba(187,25,25,0.12)', tagColor: '#bb1919', accent: '#bb1919' },
    ]
  },
  {
    id: 'learn',
    icon: '📚',
    name: '学习教育',
    desc: '持续学习，不断成长',
    iconBg: 'rgba(16,185,129,0.15)',
    sites: [
      { name: 'Coursera', url: 'https://www.coursera.org', displayUrl: 'coursera.org', desc: '全球顶尖大学和企业的在线课程平台，提供学位证书和专业认证', favicon: 'C', faviconBg: '#0056d3', tag: '在线课程', tagBg: 'rgba(0,86,211,0.12)', tagColor: '#0056d3', accent: '#0056d3' },
      { name: 'Khan Academy', url: 'https://www.khanacademy.org', displayUrl: 'khanacademy.org', desc: '非营利教育平台，提供数学、科学等学科的免费优质课程', favicon: 'K', faviconBg: '#14b8a6', tag: '免费课程', tagBg: 'rgba(20,184,166,0.12)', tagColor: '#14b8a6', accent: '#14b8a6' },
      { name: 'Udemy', url: 'https://www.udemy.com', displayUrl: 'udemy.com', desc: '全球最大的在线学习市场，涵盖编程、设计、商业等海量课程', favicon: 'U', faviconBg: '#a435f0', tag: '在线课程', tagBg: 'rgba(164,53,240,0.12)', tagColor: '#a435f0', accent: '#a435f0' },
      { name: 'freeCodeCamp', url: 'https://www.freecodecamp.org', displayUrl: 'freecodecamp.org', desc: '免费的编程学习平台，通过实战项目学习 Web 开发技能', favicon: 'f', faviconBg: '#f6821f', tag: '编程学习', tagBg: 'rgba(246,130,31,0.12)', tagColor: '#f6821f', accent: '#f6821f' },
      { name: '中国大学MOOC', url: 'https://www.icourse163.org', displayUrl: 'icourse163.org', desc: '汇集国内顶尖高校的公开课平台，免费学习名校优质课程', favicon: 'Z', faviconBg: '#ee3158', tag: '公开课', tagBg: 'rgba(238,49,88,0.12)', tagColor: '#ee3158', accent: '#ee3158' },
    ]
  },
]

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
  <div class="navhub-app" :class="{ 'is-dark': isDark, 'is-light': !isDark }">
    <!-- Mobile Top Bar -->
    <header class="mobile-topbar" v-if="isMobile">
      <div class="mobile-topbar-left">
        <button class="hamburger" @click="toggleDrawer" aria-label="打开菜单">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div class="logo">
          <div class="logo-icon">N</div>
          <div class="logo-text">Nav<span>Hub</span></div>
        </div>
      </div>
      <div class="mobile-topbar-actions">
        <button class="mobile-icon-btn" @click="focusSearch" aria-label="搜索">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>
        <button class="mobile-icon-btn" @click="toggleTheme" aria-label="切换明暗主题">
          <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
      </div>
    </header>

    <!-- Drawer Backdrop -->
    <div class="drawer-backdrop" :class="{ visible: drawerOpen }" @click="closeDrawer" v-if="isMobile"></div>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ open: drawerOpen && isMobile }">
      <div class="logo">
        <div class="logo-icon">N</div>
        <div class="logo-text">Nav<span>Hub</span></div>
      </div>

      <div class="sidebar-label">全部分类</div>
      <ul class="nav-list">
        <li
          v-for="item in navItems"
          :key="item.id"
          class="nav-item"
          :class="{ active: activeCat === item.id }"
          @click="setCategory(item.id)"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span>{{ item.name }}</span>
          <span class="nav-count">{{ item.count }}</span>
        </li>
      </ul>

      <div class="sidebar-footer">
        <div class="theme-toggle" @click="toggleTheme" role="button" tabindex="0" aria-label="切换明暗主题">
          <div class="theme-toggle-knob"></div>
          <div class="theme-toggle-option theme-toggle-option--light">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            <span>亮色</span>
          </div>
          <div class="theme-toggle-option theme-toggle-option--dark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            <span>暗色</span>
          </div>
        </div>
        <div class="sidebar-link">
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
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main">
      <!-- Hero / Search -->
      <section class="hero">
        <h1 class="hero-title">探索 <span>优质网站</span></h1>
        <p class="hero-subtitle">精选 {{ totalSiteCount }}+ 常用网站，让你的上网效率翻倍</p>

        <div class="search-wrapper">
          <div class="search-box">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              class="search-input"
              placeholder="搜索网站名称或关键词..."
              v-model="searchQuery"
              @input="onSearchInput"
              ref="searchInputRef"
            />
            <div class="search-shortcut" v-if="!isMobile">
              <kbd>⌘</kbd><kbd>K</kbd>
            </div>
          </div>
        </div>

        <div class="quick-tags" v-if="!searchQuery">
          <span
            v-for="tag in quickTags"
            :key="tag.keyword"
            class="quick-tag"
            @click="handleQuickTag(tag.keyword)"
          >{{ tag.label }}</span>
        </div>
      </section>

      <!-- Category Sections -->
      <section
        v-for="cat in visibleCategories"
        :key="cat.id"
        class="category-section"
        :id="`cat-${cat.id}`"
      >
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
          <a
            v-for="(site, idx) in cat.sites"
            :key="site.name"
            class="site-card"
            :style="{ '--card-accent': site.accent }"
            :href="site.url"
            target="_blank"
            :animation-delay="`${idx * 50}ms`"
          >
            <div class="site-card-header">
              <div
                class="site-favicon"
                :style="{ background: site.faviconBg }"
                :class="{ 'has-border': site.name === 'X (Twitter)' || site.name === 'MDN Web Docs' }"
              >{{ site.favicon }}</div>
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
        <p>NavHub — 让每一次点击都更高效</p>
        <p style="margin-top: 8px; font-size: 12px;">© 2026 NavHub. 精选优质网站导航 · 持续更新中</p>
      </footer>
    </main>
  </div>
</template>

<style scoped>
/* ============================================
   Design Token System (Dark default)
   ============================================ */
.navhub-app {
  /* Background Colors */
  --bg-base: #0d1117;
  --bg-surface: #161b22;
  --bg-elevated: #1c2330;
  --bg-hover: #21283a;

  /* Brand Colors */
  --brand-primary: #6366f1;
  --brand-primary-light: #818cf8;
  --brand-primary-dark: #4f46e5;
  --brand-gradient: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);

  /* Accent Colors */
  --accent-blue: #3b82f6;
  --accent-purple: #a855f7;
  --accent-pink: #ec4899;
  --accent-orange: #f97316;
  --accent-green: #10b981;
  --accent-cyan: #06b6d4;
  --accent-yellow: #eab308;
  --accent-red: #ef4444;

  /* Text Colors */
  --text-primary: #f0f6fc;
  --text-secondary: #c9d1d9;
  --text-tertiary: #8b949e;
  --text-muted: #6e7681;

  /* Border Colors */
  --border-default: #30363d;
  --border-subtle: #21262d;
  --border-active: #6366f1;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.5);
  --shadow-glow: 0 0 20px rgba(99,102,241,0.15);

  /* Theme-aware composites */
  --sidebar-bg: rgba(22, 27, 34, 0.6);
  --glow-primary: rgba(99, 102, 241, 0.08);
  --glow-secondary: rgba(168, 85, 247, 0.06);
  --shadow-search-focus: 0 0 0 4px rgba(99, 102, 241, 0.12);
  --nav-active-bg: rgba(99, 102, 241, 0.12);
  --nav-active-count-bg: rgba(99, 102, 241, 0.2);
  --favicon-border: #30363d;

  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 400ms cubic-bezier(0.4, 0, 0.2, 1);

  /* Spacing & Radius */
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-5: 20px; --space-6: 24px; --space-8: 32px; --space-10: 40px;
  --space-12: 48px; --space-16: 64px;
  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 14px;
  --radius-xl: 20px; --radius-full: 9999px;
}

/* ============================================
   Light Theme Tokens
   ============================================ */
.navhub-app.is-light {
  --bg-base: #f5f6f8;
  --bg-surface: #ffffff;
  --bg-elevated: #f0f1f4;
  --bg-hover: #e8eaef;

  --brand-primary: #6366f1;
  --brand-primary-light: #4f46e5;
  --brand-primary-dark: #4338ca;

  --text-primary: #1a1d26;
  --text-secondary: #424a5e;
  --text-tertiary: #6b7280;
  --text-muted: #9ca3af;

  --border-default: #d4d7de;
  --border-subtle: #e4e6ec;
  --border-active: #6366f1;

  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
  --shadow-glow: 0 0 20px rgba(99, 102, 241, 0.08);

  --sidebar-bg: rgba(255, 255, 255, 0.72);
  --glow-primary: rgba(99, 102, 241, 0.06);
  --glow-secondary: rgba(168, 85, 247, 0.04);
  --shadow-search-focus: 0 0 0 4px rgba(99, 102, 241, 0.1);
  --nav-active-bg: rgba(99, 102, 241, 0.1);
  --nav-active-count-bg: rgba(99, 102, 241, 0.15);
  --favicon-border: #c4c7ce;
}

/* ============================================
   Base Reset & Layout
   ============================================ */
.navhub-app * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.navhub-app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  background: var(--bg-base);
  color: var(--text-primary);
  min-height: 100vh;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
  position: relative;
  z-index: 1;
  transition: background-color var(--transition-normal), color var(--transition-normal);
}

/* Ambient Background Glow */
.navhub-app::before {
  content: '';
  position: fixed;
  top: -200px;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 600px;
  background: radial-gradient(ellipse at center, var(--glow-primary) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.navhub-app::after {
  content: '';
  position: fixed;
  bottom: -300px;
  right: -200px;
  width: 700px;
  height: 700px;
  background: radial-gradient(ellipse at center, var(--glow-secondary) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

/* ============================================
   Sidebar
   ============================================ */
.sidebar {
  width: 240px;
  flex-shrink: 0;
  background: var(--sidebar-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid var(--border-subtle);
  padding: var(--space-6) var(--space-4);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  transition: background-color var(--transition-normal), border-color var(--transition-normal);
}

.sidebar::-webkit-scrollbar {
  width: 4px;
}
.sidebar::-webkit-scrollbar-track {
  background: transparent;
}
.sidebar::-webkit-scrollbar-thumb {
  background: var(--border-default);
  border-radius: var(--radius-full);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  margin-bottom: var(--space-8);
}

.logo-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--brand-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: white;
  box-shadow: 0 4px 12px rgba(99,102,241,0.3);
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.logo-text span {
  background: var(--brand-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sidebar-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  padding: 0 var(--space-3);
  margin-bottom: var(--space-3);
}

.nav-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: var(--space-6);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  position: relative;
  user-select: none;
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--nav-active-bg);
  color: var(--brand-primary-light);
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: var(--brand-primary);
  border-radius: var(--radius-full);
}

.nav-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.nav-count {
  margin-left: auto;
  font-size: 12px;
  color: var(--text-muted);
  background: var(--bg-elevated);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  transition: background-color var(--transition-normal), color var(--transition-normal);
}

.nav-item.active .nav-count {
  background: var(--nav-active-count-bg);
  color: var(--brand-primary-light);
}

.sidebar-footer {
  margin-top: auto;
  padding-top: var(--space-6);
  border-top: 1px solid var(--border-subtle);
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  color: var(--text-tertiary);
  font-size: 13px;
  text-decoration: none;
  transition: all var(--transition-fast);
  cursor: pointer;
}

.sidebar-link:hover {
  background: var(--bg-hover);
  color: var(--text-secondary);
}

/* ============================================
   Main Content
   ============================================ */
.main {
  flex: 1;
  padding: var(--space-8) var(--space-10);
  max-width: calc(100vw - 240px);
  overflow-x: hidden;
}

/* ============================================
   Hero / Search Section
   ============================================ */
.hero {
  text-align: center;
  margin-bottom: var(--space-12);
  padding-top: var(--space-8);
}

.hero-title {
  font-size: 36px;
  font-weight: 700;
  letter-spacing: -0.03em;
  margin-bottom: var(--space-3);
}

.hero-title span {
  background: var(--brand-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 15px;
  color: var(--text-tertiary);
  margin-bottom: var(--space-8);
}

.search-wrapper {
  max-width: 560px;
  margin: 0 auto;
  position: relative;
}

.search-box {
  display: flex;
  align-items: center;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  padding: 0 var(--space-5);
  height: 52px;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-md);
}

.search-box:focus-within {
  border-color: var(--brand-primary);
  box-shadow: var(--shadow-search-focus), var(--shadow-md);
}

.search-icon {
  width: 20px;
  height: 20px;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 15px;
  font-family: inherit;
  padding: 0 var(--space-4);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-shortcut {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--text-tertiary);
  font-family: 'Inter', monospace;
  transition: background-color var(--transition-normal), border-color var(--transition-normal);
}

.search-shortcut kbd {
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
}

/* Quick Tags */
.quick-tags {
  display: flex;
  justify-content: center;
  gap: var(--space-2);
  margin-top: var(--space-5);
  flex-wrap: wrap;
}

.quick-tag {
  padding: 6px 14px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  font-size: 13px;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all var(--transition-fast);
  user-select: none;
}

.quick-tag:hover {
  background: var(--bg-hover);
  border-color: var(--border-default);
  color: var(--text-secondary);
}

/* ============================================
   Category Section
   ============================================ */
.category-section {
  margin-bottom: var(--space-12);
  animation: fadeInUp var(--transition-slow) ease-out;
}

.category-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}

.category-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.category-title {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.category-desc {
  font-size: 13px;
  color: var(--text-tertiary);
  margin-top: 2px;
}

.category-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, var(--border-default), transparent);
}

/* ============================================
   Site Cards Grid
   ============================================ */
.sites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-4);
}

.site-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  transition: all var(--transition-normal);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  text-decoration: none;
  animation: fadeInUp var(--transition-slow) ease-out backwards;
}

.site-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--card-accent, var(--brand-primary));
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.site-card:hover {
  background: var(--bg-elevated);
  border-color: var(--border-default);
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}

.site-card:hover::before {
  opacity: 1;
}

.site-card-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.site-favicon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
  font-weight: 700;
  color: white;
}

.site-favicon.has-border {
  border: 1px solid var(--favicon-border);
}

.site-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
}

.site-url {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

.site-desc {
  font-size: 13px;
  color: var(--text-tertiary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.site-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 500;
  align-self: flex-start;
}

/* ============================================
   Footer
   ============================================ */
.footer {
  text-align: center;
  padding: var(--space-12) var(--space-4);
  color: var(--text-muted);
  font-size: 13px;
}

.footer a {
  color: var(--text-tertiary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.footer a:hover {
  color: var(--brand-primary-light);
}

.footer-divider {
  width: 48px;
  height: 2px;
  background: var(--brand-gradient);
  border-radius: var(--radius-full);
  margin: 0 auto var(--space-4);
}

/* ============================================
   Mobile Top Bar
   ============================================ */
.mobile-topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: var(--sidebar-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-subtle);
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-4);
  z-index: 100;
  display: flex;
  transition: background-color var(--transition-normal), border-color var(--transition-normal);
}

.mobile-topbar-left {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.hamburger {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
  background: none;
  border: none;
}

.hamburger:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.hamburger svg {
  width: 22px;
  height: 22px;
}

.mobile-topbar .logo {
  margin-bottom: 0;
  padding: 0;
}

.mobile-topbar .logo-icon {
  width: 28px;
  height: 28px;
  font-size: 14px;
  border-radius: var(--radius-sm);
}

.mobile-topbar .logo-text {
  font-size: 16px;
}

.mobile-topbar-actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.mobile-icon-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
  background: none;
  border: none;
}

.mobile-icon-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.mobile-icon-btn svg {
  width: 20px;
  height: 20px;
}

/* Mobile icon button theme icons */
.mobile-icon-btn .icon-sun { display: none; }
.mobile-icon-btn .icon-moon { display: block; }
.is-light .mobile-icon-btn .icon-sun { display: block; }
.is-light .mobile-icon-btn .icon-moon { display: none; }

/* Drawer Backdrop */
.drawer-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
  opacity: 1;
  transition: opacity var(--transition-normal);
}

/* Theme Toggle */
.theme-toggle {
  display: flex;
  align-items: center;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  padding: 3px;
  position: relative;
  cursor: pointer;
  user-select: none;
  transition: border-color var(--transition-fast);
  margin-bottom: var(--space-4);
}

.theme-toggle:hover {
  border-color: var(--border-default);
}

.theme-toggle-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: calc(50% - 3px);
  height: calc(100% - 6px);
  background: var(--brand-gradient);
  border-radius: var(--radius-full);
  transition: transform var(--transition-normal);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.35);
}

.is-dark .theme-toggle-knob {
  transform: translateX(100%);
}

.theme-toggle-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 0;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  z-index: 1;
  transition: color var(--transition-fast);
  position: relative;
}

.is-light .theme-toggle-option--light,
.is-dark .theme-toggle-option--dark {
  color: #ffffff;
}

.theme-toggle-option svg {
  width: 14px;
  height: 14px;
}

/* ============================================
   Responsive — Mobile / Tablet / Desktop
   ============================================ */

/* Tablet (<= 1024px) */
@media (max-width: 1024px) {
  .sites-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }

  .main {
    padding: var(--space-8) var(--space-6);
  }
}

/* Mobile (<= 768px) — show topbar & drawer */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 280px;
    transform: translateX(-100%);
    z-index: 101;
    box-shadow: var(--shadow-lg);
    transition: transform var(--transition-normal), background-color var(--transition-normal);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .main {
    max-width: 100%;
    padding: 72px var(--space-4) var(--space-6);
  }

  .hero {
    padding-top: var(--space-2);
    margin-bottom: var(--space-8);
  }

  .hero-title {
    font-size: 26px;
  }

  .hero-subtitle {
    font-size: 14px;
    margin-bottom: var(--space-6);
  }

  .search-wrapper {
    max-width: 100%;
  }

  .search-box {
    height: 48px;
  }

  .search-input {
    font-size: 14px;
  }

  .search-shortcut {
    display: none;
  }

  .quick-tags {
    gap: var(--space-2);
    margin-top: var(--space-4);
  }

  .quick-tag {
    font-size: 12px;
    padding: 5px 12px;
  }

  .sites-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-3);
  }

  .site-card {
    padding: var(--space-3);
    gap: var(--space-2);
  }

  .site-favicon {
    width: 32px;
    height: 32px;
    font-size: 15px;
    border-radius: var(--radius-sm);
  }

  .site-name {
    font-size: 13px;
  }

  .site-url {
    font-size: 11px;
  }

  .site-desc {
    font-size: 12px;
    -webkit-line-clamp: 2;
  }

  .site-tag {
    font-size: 10px;
    padding: 2px 8px;
  }

  .category-header {
    margin-bottom: var(--space-4);
  }

  .category-icon-wrapper {
    width: 32px;
    height: 32px;
    font-size: 16px;
    border-radius: var(--radius-sm);
  }

  .category-title {
    font-size: 17px;
  }

  .category-desc {
    font-size: 12px;
  }

  .category-section {
    margin-bottom: var(--space-8);
  }

  .footer {
    padding: var(--space-8) var(--space-4);
  }
}

/* Small Mobile (<= 380px) */
@media (max-width: 380px) {
  .sites-grid {
    grid-template-columns: 1fr;
  }

  .hero-title {
    font-size: 22px;
  }

  .quick-tags {
    justify-content: flex-start;
    overflow-x: auto;
    flex-wrap: nowrap;
    -webkit-overflow-scrolling: touch;
    padding-bottom: var(--space-2);
  }

  .quick-tag {
    flex-shrink: 0;
  }
}

/* ============================================
   Animations
   ============================================ */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
