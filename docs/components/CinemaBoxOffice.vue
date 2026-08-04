<script setup>
// ============================================================
// CinePulse · 影脉  —  Vue 3 单文件组件（自包含，直接 import 即用）
// 功能：正在上映影片网格 / Hero 精选轮播 / 详情模态 / 三主题 /
//       地区切换 / 60s 自动刷新 / 分页(每页可选100) / 票房懒加载 /
//       骨架屏 / 错误兜底 / 磁性按钮 / 玻璃拟态 / 全响应式
//
// 用法：
//   import CinemaBoxOffice from './CinemaBoxOffice.vue'
//   // 国内直连 TMDB 被墙，推荐走代理（见 proxy/cf-worker.js），代理持有 key、浏览器不暴露：
//   <CinemaBoxOffice api-base="https://your-proxy.workers.dev" region="CN" />
//   // 也可直连（仅限可访问 TMDB 的网络）：
//   <CinemaBoxOffice api-key="你的TMDB_Key" region="CN" />
// 不传 api-key 且不指定代理时自动回退到内置示例数据（演示实时刷新交互）。
// ============================================================
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

const props = defineProps({
  apiKey: { type: String, default: '' },
  // 代理基址：国内直连 api.themoviedb.org 会被墙，设为你的代理（如 Cloudflare Worker）即可。
  // 例：api-base="https://your-proxy.workers.dev"
  apiBase: { type: String, default: 'https://api.themoviedb.org/3' },
  // 海报图片基址：image.tmdb.org 在国内也可能不稳定，可由代理一并代理（见 /img/ 路由）。
  imageBase: { type: String, default: 'https://image.tmdb.org/t/p' },
  region: { type: String, default: 'CN' },
  refreshInterval: { type: Number, default: 60000 },
  pageSizes: { type: Array, default: () => [18, 20, 40, 100] },
  defaultPageSize: { type: Number, default: 20 },
  title: { type: String, default: '影脉' },
})

// ---------- 常量 ----------
const DEFAULT_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'
const TMDB_PAGE_SIZE = 20
const RMB_RATE = 7.2
const GENRES = {
  28: '动作', 12: '冒险', 16: '动画', 35: '喜剧', 80: '犯罪', 99: '纪录',
  18: '剧情', 10751: '家庭', 14: '奇幻', 36: '历史', 27: '恐怖', 10402: '音乐',
  9648: '悬疑', 10749: '爱情', 878: '科幻', 10770: '电视', 53: '惊悚',
  10752: '战争', 37: '西部',
}
const REGIONS = [
  { code: 'CN', label: '中国大陆' },
  { code: 'US', label: '北美' },
  { code: 'HK', label: '中国香港' },
  { code: 'TW', label: '中国台湾' },
  { code: 'GB', label: '英国' },
]
const THEMES = ['dark', 'light', 'system']

// ---------- 时间筛选预设与日期工具 ----------
const PRESETS = [
  { key: 'week', label: '本周', start: (d) => { const x = new Date(d); const day = (x.getDay() + 6) % 7; x.setDate(x.getDate() - day); x.setHours(0, 0, 0, 0); return x } },
  { key: 'month', label: '本月', start: (d) => new Date(d.getFullYear(), d.getMonth(), 1) },
  { key: 'quarter', label: '本季', start: (d) => new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1) },
  { key: 'year', label: '本年', start: (d) => new Date(d.getFullYear(), 0, 1) },
]
// 将 Date 转为本地时区的 YYYY-MM-DD（避免 toISOString 的 UTC 偏移导致日期错位）
function toISO(d) {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return z.toISOString().slice(0, 10)
}

// ---------- 示例数据（无 key 时回退，结构对齐 TMDB）----------
const SAMPLE_MOVIES = [
  { id: 9001, title: '流浪地球2', original_title: 'The Wandering Earth II', release_date: '2023-01-22', vote_average: 8.3, revenue: 600000000, genre_ids: [878, 12, 28], runtime: 173, overview: '太阳即将毁灭，人类启动「移山计划」，带着地球逃离太阳系。', gradient: ['#1e3a8a', '#0ea5e9'] },
  { id: 9002, title: '满江红', original_title: 'Full River Red', release_date: '2023-01-22', vote_average: 7.0, revenue: 670000000, genre_ids: [35, 28, 18], runtime: 159, overview: '南宋绍兴年间，一场诡谲的阴谋在宰相驻地展开。', gradient: ['#7f1d1d', '#f59e0b'] },
  { id: 9003, title: '奥本海默', original_title: 'Oppenheimer', release_date: '2023-08-30', vote_average: 8.6, revenue: 950000000, genre_ids: [18, 36], runtime: 180, overview: '二战期间，「原子弹之父」奥本海默领导曼哈顿计划。', gradient: ['#312e81', '#a855f7'] },
  { id: 9004, title: '封神第一部：朝歌风云', original_title: 'Creation of the Gods I', release_date: '2023-07-20', vote_average: 7.8, revenue: 380000000, genre_ids: [12, 14, 28], runtime: 148, overview: '商王殷寿勾结狐妖祸乱朝纲，姬发在朝歌历经信仰与背叛的洗礼。', gradient: ['#78350f', '#fbbf24'] },
  { id: 9005, title: '芭比', original_title: 'Barbie', release_date: '2023-07-21', vote_average: 7.0, revenue: 1440000000, genre_ids: [35, 14], runtime: 114, overview: '完美乐园里一切井然有序，直到芭比开始思考死亡。', gradient: ['#db2777', '#f472b6'] },
  { id: 9006, title: '孤注一掷', original_title: 'No More Bets', release_date: '2023-08-08', vote_average: 6.8, revenue: 540000000, genre_ids: [53, 80, 28], runtime: 130, overview: '程序员被海外高薪招聘诱骗，落入境外诈骗工厂。', gradient: ['#0f172a', '#22d3ee'] },
  { id: 9007, title: '消失的她', original_title: 'Lost in the Stars', release_date: '2023-06-22', vote_average: 6.4, revenue: 480000000, genre_ids: [53, 18], runtime: 121, overview: '何非的妻子在潜水旅行中离奇失踪，真相愈发扑朔迷离。', gradient: ['#134e4a', '#34d399'] },
  { id: 9008, title: '蜘蛛侠：纵横宇宙', original_title: 'Spider-Man: Across the Spider-Verse', release_date: '2023-06-02', vote_average: 8.4, revenue: 690000000, genre_ids: [16, 28, 878], runtime: 140, overview: '少年迈尔斯跨越多元宇宙，与不同维度的蜘蛛侠并肩作战。', gradient: ['#7c3aed', '#f97316'] },
  { id: 9009, title: '长安三万里', original_title: 'Chang An', release_date: '2023-07-08', vote_average: 8.3, revenue: 280000000, genre_ids: [16, 18, 36], runtime: 168, overview: '安史之乱后，暮年高适回忆与李白一生的交游。', gradient: ['#b91c1c', '#fcd34d'] },
  { id: 9010, title: '速度与激情10', original_title: 'Fast X', release_date: '2023-05-17', vote_average: 6.0, revenue: 715000000, genre_ids: [28, 12], runtime: 141, overview: '唐老大与家族再次集结，面对复仇者但丁设下的致命陷阱。', gradient: ['#1f2937', '#ef4444'] },
  { id: 9011, title: '变形金刚：超能勇士崛起', original_title: 'Transformers: Rise of the Beasts', release_date: '2023-06-09', vote_average: 6.2, revenue: 440000000, genre_ids: [28, 12, 878], runtime: 127, overview: '1990 年代，青年诺亚意外卷入汽车人与巨无霸对抗宇宙大帝的战斗。', gradient: ['#1e40af', '#f59e0b'] },
  { id: 9012, title: '碟中谍7：致命清算（上）', original_title: 'Mission: Impossible – Dead Reckoning', release_date: '2023-07-12', vote_average: 7.7, revenue: 570000000, genre_ids: [28, 53, 12], runtime: 163, overview: '伊森·亨特重出江湖，追查一件足以颠覆世界的危险人工智能武器。', gradient: ['#0c4a6e', '#38bdf8'] },
  { id: 9013, title: '热烈', original_title: 'One and Only', release_date: '2023-07-28', vote_average: 6.7, revenue: 230000000, genre_ids: [35, 18], runtime: 124, overview: '街舞老炮丁雷经营濒临倒闭的舞团，偶遇天赋异禀的追梦少年。', gradient: ['#9d174d', '#fb7185'] },
  { id: 9014, title: '巨齿鲨2：深渊', original_title: 'Meg 2: The Trench', release_date: '2023-08-04', vote_average: 5.4, revenue: 390000000, genre_ids: [28, 878, 53], runtime: 116, overview: '乔纳斯与科研团队深入马里亚纳海沟，却遭阴谋集团破坏。', gradient: ['#082f49', '#2dd4bf'] },
]

// ---------- 缓存 ----------
const listCache = new Map()
const detailsCache = new Map()

// 实时模式判定：传了 apiKey，或指定了非默认的代理地址（代理自行注入 key）即视为实时。
const isLive = () => !!(String(props.apiKey || '').trim() || (props.apiBase && props.apiBase !== DEFAULT_BASE))
function imgPath(path, size) {
  const base = (props.imageBase || TMDB_IMAGE_BASE).replace(/\/+$/, '')
  return path ? `${base}/${size}${path}` : null
}

async function tmdb(path, params = {}) {
  const base = (props.apiBase || DEFAULT_BASE).replace(/\/+$/, '')
  const url = new URL(base + path)
  // 仅当浏览器端持有 key 时才带上；若走代理且代理自行注入 key，则不传（避免暴露）。
  if (String(props.apiKey || '').trim()) url.searchParams.set('api_key', props.apiKey)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`TMDB ${res.status}`)
  return res.json()
}

function listNormalize(m) {
  const c = detailsCache.get(m.id)
  return {
    id: m.id,
    title: m.title || m.original_title,
    original_title: m.original_title,
    release_date: m.release_date || null,
    vote_average: typeof m.vote_average === 'number' ? m.vote_average : 0,
    poster_path: imgPath(m.poster_path, 'w500'),
    backdrop_path: imgPath(m.backdrop_path, 'w1280'),
    genre_ids: m.genre_ids || (m.genres ? m.genres.map((g) => g.id) : []),
    overview: c?.overview || m.overview || '',
    revenue: c?.revenue || 0,
    runtime: c?.runtime || null,
    _sample: false,
  }
}
async function getListPage(region, p, range) {
  const key = `${region}:${p}:${range ? range.key : 'now'}`
  if (listCache.has(key)) return listCache.get(key)
  const params = { region, language: 'zh-CN', page: String(p) }
  let path = '/movie/now_playing'
  // 指定时间范围时切换到 discover/movie，按 primary_release_date 过滤并依票房降序
  if (range) {
    path = '/discover/movie'
    params['primary_release_date.gte'] = range.from
    params['primary_release_date.lte'] = range.to
    params.sort_by = 'revenue.desc'
  }
  const json = await tmdb(path, params)
  const arr = (json.results || []).map(listNormalize)
  const data = { arr, totalPages: json.total_pages || 1, totalResults: json.total_results || arr.length }
  listCache.set(key, data)
  return data
}

async function fetchNowPlaying(region = 'CN', page = 1, size = 20) {
  const range = dateRange.value
  if (!isLive()) {
    let all = SAMPLE_MOVIES.map((m) => ({
      ...m,
      revenue: Math.round(m.revenue * (1 + (Math.random() * 0.04 - 0.01))),
      vote_average: Math.min(10, Math.max(0, +(m.vote_average + (Math.random() * 0.2 - 0.1)).toFixed(1))),
      _sample: true,
    }))
    if (range) all = all.filter((m) => m.release_date >= range.from && m.release_date <= range.to)
    const total = all.length
    const start = (page - 1) * size
    const movies = all.slice(start, start + size)
    return { movies, page, totalPages: Math.max(1, Math.ceil(total / size)), totalResults: total }
  }
  listCache.clear()
  const startIdx = (page - 1) * size
  const endIdx = page * size
  const startTmdb = Math.floor(startIdx / TMDB_PAGE_SIZE) + 1
  const endTmdb = Math.ceil(endIdx / TMDB_PAGE_SIZE)
  const pages = []
  let first = null
  for (let p = startTmdb; p <= endTmdb; p++) {
    const d = await getListPage(region, p, range)
    if (p === startTmdb) first = d
    pages.push(d)
  }
  const combined = pages.flatMap((d) => d.arr)
  const offset = startIdx - (startTmdb - 1) * TMDB_PAGE_SIZE
  const movies = combined.slice(offset, offset + size)
  const totalResults = first.totalResults
  return { movies, page, totalPages: Math.max(1, Math.ceil(totalResults / size)), totalResults }
}

async function fetchMovieDetails(id) {
  if (detailsCache.has(id)) return detailsCache.get(id)
  const d = await tmdb(`/movie/${id}`, { language: 'zh-CN' })
  const info = { revenue: d.revenue || 0, runtime: d.runtime || null, genres: d.genres || null, overview: d.overview || '' }
  detailsCache.set(id, info)
  return info
}

// ---------- 状态 ----------
const state = reactive({
  region: REGIONS.some((r) => r.code === props.region) ? props.region : 'CN',
  theme: localStorage.getItem('cp-theme') || 'dark',
  autoRefresh: true,
  page: 1,
  size: props.pageSizes.includes(props.defaultPageSize) ? props.defaultPageSize : (props.pageSizes[0] || 20),
  totalPages: 1,
  totalResults: 0,
  movies: [],
  heroList: [],
  heroIndex: 0,
  heroPaused: false,
  loading: false,
  navigating: false,
  lastUpdated: null,
  error: false,
  dateFrom: '',
  dateTo: '',
  activePreset: '',
})

const rootEl = ref(null)
const gridEl = ref(null)
const heroTimer = ref(null)
const pollTimer = ref(null)

const sysDark = ref(window.matchMedia('(prefers-color-scheme: dark)').matches)
const resolvedTheme = computed(() => (state.theme === 'system' ? (sysDark.value ? 'dark' : 'light') : state.theme))
const themeIcon = computed(() => ({ dark: '🌙', light: '☀️', system: '🌗' }[state.theme]))
const hasDateRange = computed(() => !!(state.dateFrom && state.dateTo))
const dateRange = computed(() => {
  const { from, to } = resolveDateRange()
  return (from && to) ? { from, to, key: from + '|' + to } : null
})
const sectionTitle = computed(() => (dateRange.value ? `上映时间筛选 · ${state.dateFrom} ~ ${state.dateTo}` : '正在上映'))

// ---------- 工具 ----------
function truncate(s, n) { s = s || ''; return s.length > n ? s.slice(0, n) + '…' : s }
function formatDate(d) {
  if (!d) return '待定'
  const [y, m, day] = d.split('-')
  return `${y}年${+m}月${+day}日`
}
function formatBoxOffice(usd) {
  if (!usd) return '票房未公开'
  const rmb = usd * RMB_RATE
  if (rmb >= 1e8) return '¥' + (rmb / 1e8).toFixed(2) + ' 亿'
  if (rmb >= 1e4) return '¥' + (rmb / 1e4).toFixed(1) + ' 万'
  return '¥' + Math.round(rmb).toLocaleString('zh-CN')
}
function fmtTime(d) { return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }
// 解析当前时间筛选区间：只填一端时自动补齐另一端（起始→1900，结束→今天）
function resolveDateRange() {
  const today = toISO(new Date())
  let from = state.dateFrom
  let to = state.dateTo
  if (from && !to) to = today
  if (to && !from) from = '1900-01-01'
  return { from, to }
}

// ---------- Hero ----------
const currentHero = computed(() => state.heroList[state.heroIndex] || null)
function heroStyle(m) {
  if (!m) return {}
  return m.backdrop_path
    ? { backgroundImage: `url('${m.backdrop_path}')` }
    : { background: `linear-gradient(135deg, ${m.gradient?.[0] || '#1e3a8a'}, ${m.gradient?.[1] || '#0ea5e9'})` }
}
function setHero(i) { state.heroIndex = (i + state.heroList.length) % state.heroList.length }
function startHero() {
  clearInterval(heroTimer.value)
  if (state.heroList.length > 1) heroTimer.value = setInterval(() => { if (!state.heroPaused) setHero(state.heroIndex + 1) }, 7000)
}

// ---------- 详情模态 ----------
const modalMovie = ref(null)
const modalGenres = computed(() => {
  if (!modalMovie.value) return []
  return (modalMovie.value.genre_ids || []).slice(0, 4).map((i) => GENRES[i]).filter(Boolean)
})
const modalHeroStyle = computed(() => {
  const m = modalMovie.value
  if (!m) return {}
  return m.backdrop_path
    ? { backgroundImage: `url('${m.backdrop_path}')` }
    : { background: `linear-gradient(135deg, ${m.gradient?.[0] || '#1e3a8a'}, ${m.gradient?.[1] || '#0ea5e9'})` }
})
function openModal(id) {
  const m = state.movies.find((x) => x.id === id)
  if (!m) return
  modalMovie.value = m
  document.body.style.overflow = 'hidden'
  if (isLive() && !detailsCache.has(id)) {
    fetchMovieDetails(id).then((info) => { Object.assign(m, info) }).catch(() => { })
  }
}
function closeModal() { modalMovie.value = null; document.body.style.overflow = '' }

// ---------- Toast ----------
const toasts = ref([])
let toastSeq = 0
function toast(msg, type = 'info') {
  const id = ++toastSeq
  toasts.value.push({ id, msg, type })
  setTimeout(() => { toasts.value = toasts.value.filter((t) => t.id !== id) }, 3200)
}

// ---------- 磁性指令 ----------
const vMagnetic = {
  mounted(el) {
    const move = (e) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left - r.width / 2) / r.width
      const y = (e.clientY - r.top - r.height / 2) / r.height
      el.style.transform = `translate(${x * 10}px, ${y * 10}px)`
    }
    const leave = () => { el.style.transform = '' }
    el.addEventListener('mousemove', move)
    el.addEventListener('mouseleave', leave)
    el._magCleanup = () => { el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', leave) }
  },
  unmounted(el) { el._magCleanup && el._magCleanup() },
}

// ---------- 主题 ----------
function cycleTheme() {
  const i = THEMES.indexOf(state.theme)
  state.theme = THEMES[(i + 1) % THEMES.length]
  localStorage.setItem('cp-theme', state.theme)
}

// ---------- 状态条 ----------
const modeText = computed(() => (state.error ? '刷新失败' : isLive() ? '实时' : '示例数据'))
const modeClass = computed(() => (state.error ? 'error' : isLive() ? 'live' : 'sample'))
const lastUpdatedText = computed(() => (state.lastUpdated ? fmtTime(state.lastUpdated) : '—'))

// ---------- 分页 ----------
function pageTokens(page, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const tokens = [1]
  if (page > 3) tokens.push('…')
  for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) tokens.push(i)
  if (page < total - 2) tokens.push('…')
  tokens.push(total)
  return tokens
}
const pagerTokens = computed(() => pageTokens(state.page, state.totalPages))
const showSkeleton = computed(() => state.loading && (state.navigating || state.movies.length === 0))
const skeletonCount = computed(() => Math.min(state.size, 12))
function prevPage() { if (state.page > 1) { state.page--; goPage() } }
function nextPage() { if (state.page < state.totalPages) { state.page++; goPage() } }
function goPageTo(p) { if (p && p !== state.page) { state.page = p; goPage() } }
function goPage() {
  state.navigating = true
  nextTick(() => gridEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  loadData(true)
}

// ---------- 数据加载 + 轮询 ----------
async function loadDetailsForPage(movies) {
  if (!isLive()) return
  const pending = movies.filter((m) => !detailsCache.has(m.id) && !m._sample)
  if (!pending.length) return
  let i = 0
  const worker = async () => {
    while (i < pending.length) {
      const m = pending[i++]
      try { Object.assign(m, await fetchMovieDetails(m.id)) } catch { /* 单部失败忽略，保留未公开 */ }
    }
  }
  const n = Math.min(6, pending.length)
  await Promise.all(Array.from({ length: n }, worker))
}
function startPolling() {
  clearInterval(pollTimer.value)
  if (state.autoRefresh) pollTimer.value = setInterval(() => loadData(), props.refreshInterval)
}
async function loadData(force) {
  if (state.loading && !force) return
  state.loading = true
  try {
    const { movies, page, totalPages, totalResults } = await fetchNowPlaying(state.region, state.page, state.size)
    state.movies = movies
    state.totalPages = totalPages
    state.totalResults = totalResults
    state.lastUpdated = new Date()
    state.error = false
    state.heroList = [...movies].sort((a, b) => b.vote_average - a.vote_average).slice(0, 5)
    state.heroIndex = 0
    startHero()
    loadDetailsForPage(movies)
  } catch (err) {
    console.error(err)
    state.error = true
    toast('刷新失败：' + err.message, 'error')
  } finally {
    state.loading = false
    state.navigating = false
  }
}

// ---------- 交互回调 ----------
function onRegionChange() { state.page = 1; state.navigating = true; loadData(true) }
function onSizeChange() { state.page = 1; state.navigating = true; loadData(true) }
function toggleAuto() { state.autoRefresh = !state.autoRefresh; startPolling() }
function onImgError(e) { e.target.style.display = 'none' }
function onDateChange() {
  state.activePreset = ''
  state.page = 1; state.navigating = true; loadData(true)
}
function clearDate() {
  state.dateFrom = ''; state.dateTo = ''; state.activePreset = ''
  state.page = 1; state.navigating = true; loadData(true)
}
function applyPreset(p) {
  const now = new Date()
  state.dateFrom = toISO(p.start(now))
  state.dateTo = toISO(now)
  state.activePreset = p.key
  state.page = 1; state.navigating = true; loadData(true)
}

// ---------- 监听 props 变化 ----------
watch(() => props.region, (v) => {
  if (v && v !== state.region) { state.region = v; state.page = 1; state.navigating = true; loadData(true) }
})
watch(() => props.apiKey, () => {
  listCache.clear(); detailsCache.clear(); state.page = 1; state.navigating = true; loadData(true)
})

// ---------- 系统主题监听 ----------
const onSysChange = (e) => { sysDark.value = e.matches }
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', onSysChange)

// ---------- 生命周期 ----------
onMounted(() => {
  loadData(true)
  startPolling()
  if (!isLive()) toast('当前为示例数据模式 · 传入 api-key 即可切换实时', 'info')
})
onBeforeUnmount(() => {
  clearInterval(heroTimer.value)
  clearInterval(pollTimer.value)
  window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', onSysChange)
  document.body.style.overflow = ''
})
</script>

<template>
  <section class="cinema-box-office" :data-theme="resolvedTheme" ref="rootEl">
    <!-- 顶栏 -->
    <header class="topbar">
      <div class="brand">
        <span class="brand-mark">影</span>
        <span class="brand-name">{{ title }}<i>CINEPULSE</i></span>
      </div>
      <div class="topbar-actions">
        <span class="select-wrap">
          <select id="region" v-model="state.region" @change="onRegionChange">
            <option v-for="r in REGIONS" :key="r.code" :value="r.code">{{ r.label }}</option>
          </select>
        </span>
        <button class="icon-btn" id="autoToggle" :aria-pressed="state.autoRefresh" @click="toggleAuto">
          <span class="live-dot"></span><span class="btn-label">自动刷新</span>
        </button>
        <button class="icon-btn" id="theme" @click="cycleTheme" :aria-label="state.theme + ' 主题'">
          <span class="ico-theme">{{ themeIcon }}</span>
        </button>
        <button class="icon-btn" id="refresh" :class="{ spinning: state.loading }" @click="loadData(true)">
          <span class="ico-refresh">⟳</span><span class="btn-label">刷新</span>
        </button>
      </div>
    </header>

    <!-- 时间筛选 -->
    <div class="filters">
      <div class="filters-inner">
        <div class="range-pick">
          <span class="rp-label">上映时间</span>
          <div class="rp-fields">
            <input type="date" class="date-in" :class="resolvedTheme" v-model="state.dateFrom" :max="state.dateTo || undefined" @change="onDateChange" aria-label="起始日期">
            <span class="rp-dash">→</span>
            <input type="date" class="date-in" :class="resolvedTheme" v-model="state.dateTo" :min="state.dateFrom || undefined" @change="onDateChange" aria-label="结束日期">
            <button class="rp-clear" v-if="hasDateRange" @click="clearDate" aria-label="清除时间筛选" title="清除筛选">✕</button>
          </div>
        </div>
        <div class="presets">
          <button v-for="p in PRESETS" :key="p.key" class="preset" :class="{ active: state.activePreset === p.key }" @click="applyPreset(p)">{{ p.label }}</button>
        </div>
      </div>
    </div>

    <!-- Hero 精选 -->
    <div v-if="currentHero" class="hero" @mouseenter="state.heroPaused = true" @mouseleave="state.heroPaused = false">
      <div class="hero-slide" :style="heroStyle(currentHero)">
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <span class="hero-kicker">{{ dateRange ? '时间精选' : '本周精选' }}{{ currentHero._sample ? ' · 示例' : '' }}</span>
          <h1 class="hero-title">{{ currentHero.title }}</h1>
          <div class="hero-meta">
            <span class="chip">★ {{ currentHero.vote_average?.toFixed(1) }}</span>
            <span class="chip">{{ formatDate(currentHero.release_date) }}</span>
            <span class="chip">{{ formatBoxOffice(currentHero.revenue) }}</span>
          </div>
          <p class="hero-overview">{{ truncate(currentHero.overview || '', 110) }}</p>
          <button class="btn-primary magnetic" v-magnetic @click="openModal(currentHero.id)">查看详情</button>
        </div>
      </div>
      <div class="hero-dots">
        <button v-for="(h, i) in state.heroList" :key="i" :class="{ active: i === state.heroIndex }" @click="setHero(i)"
          :aria-label="`第${i + 1}部`"></button>
      </div>
    </div>

    <!-- 内容 -->
    <main class="container">
      <div class="section-head">
        <h2 class="section-title">{{ sectionTitle }}</h2>
        <div class="status">
          <span class="mode" :class="modeClass">{{ modeText }}</span>
          <span class="updated">更新于 {{ lastUpdatedText }}</span>
        </div>
      </div>

      <div class="grid" ref="gridEl" scroll-margin-top="84">
        <template v-if="showSkeleton">
          <div class="card skeleton" v-for="n in skeletonCount" :key="'sk' + n">
            <div class="poster">
              <div class="sk" style="width:100%;height:100%"></div>
            </div>
            <div class="sk-line"></div>
            <div class="sk-line sm"></div>
          </div>
        </template>
        <article v-else v-for="m in state.movies" :key="m.id" class="card" tabindex="0" role="button"
          :aria-label="m.title + ' 详情'" @click="openModal(m.id)" @keydown.enter="openModal(m.id)">
          <div class="poster">
            <img v-if="m.poster_path" :src="m.poster_path" :alt="m.title" loading="lazy" @error="onImgError">
            <div v-else class="poster-fallback"
              :style="{ background: `linear-gradient(135deg, ${m.gradient?.[0] || '#334155'}, ${m.gradient?.[1] || '#0ea5e9'})` }">
              <span>{{ m.title }}</span>
            </div>
            <span class="rating">★ {{ m.vote_average?.toFixed(1) ?? '—' }}</span>
          </div>
          <div class="card-body">
            <h3 class="card-title">{{ m.title }}</h3>
            <div class="card-meta">{{ formatDate(m.release_date) }} · {{ formatBoxOffice(m.revenue) }}</div>
          </div>
        </article>
      </div>

      <!-- 分页 -->
      <div class="pager" v-if="!showSkeleton && state.totalPages > 0">
        <div class="pager-info">共 {{ state.totalResults }} 部 · 第 {{ state.page }}/{{ state.totalPages }} 页</div>
        <div class="pager-pages">
          <button class="pg prev" :disabled="state.page <= 1" @click="prevPage" aria-label="上一页">‹</button>
          <template v-for="(t, i) in pagerTokens" :key="i">
            <span v-if="t === '…'" class="pg-ellipsis">…</span>
            <button v-else class="pg" :class="{ active: t === state.page }" @click="goPageTo(t)">{{ t }}</button>
          </template>
          <button class="pg next" :disabled="state.page >= state.totalPages" @click="nextPage"
            aria-label="下一页">›</button>
        </div>
        <label class="pager-size"><span>每页</span>
          <select v-model.number="state.size" @change="onSizeChange">
            <option v-for="o in props.pageSizes" :key="o" :value="o">{{ o }}</option>
          </select>
        </label>
      </div>
    </main>

    <footer class="footer">数据来源 TMDB · 票房为累计值，仅供参考</footer>

    <!-- 详情模态 -->
    <div class="modal" v-if="modalMovie" @click.self="closeModal">
      <div class="modal-backdrop" @click="closeModal"></div>
      <div class="modal-card">
        <button class="modal-close" @click="closeModal" aria-label="关闭">✕</button>
        <div class="modal-hero" :style="modalHeroStyle"></div>
        <div class="modal-body">
          <h2 class="modal-title">{{ modalMovie.title }}</h2>
          <div class="modal-sub" v-if="modalMovie.original_title && modalMovie.original_title !== modalMovie.title">{{
            modalMovie.original_title }}</div>
          <div class="modal-chips">
            <span class="chip">★ {{ modalMovie.vote_average?.toFixed(1) }}</span>
            <span class="chip ghost" v-for="g in modalGenres" :key="g">{{ g }}</span>
          </div>
          <div class="modal-facts">
            <div><span>上映日期</span><b>{{ formatDate(modalMovie.release_date) }}</b></div>
            <div><span>时长</span><b>{{ modalMovie.runtime ? modalMovie.runtime + ' 分钟' : '未公开' }}</b></div>
            <div><span>全球累计票房</span><b>{{ formatBoxOffice(modalMovie.revenue) }}</b></div>
          </div>
          <p class="modal-overview">{{ modalMovie.overview || '暂无简介。' }}</p>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div class="toasts">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="t.type">{{ t.msg }}</div>
    </div>
  </section>
</template>

<style scoped>
/* ---------- 主题变量（作用域挂根元素，避免污染宿主） ---------- */
.cinema-box-office,
.cinema-box-office[data-theme='dark'] {
  --bg: #07070f;
  --bg-2: #0e0e1a;
  --text: #f3f3fb;
  --muted: #9a9ab5;
  --accent: #f5b942;
  --accent-2: #c084fc;
  --accent-3: #22d3ee;
  --glass: rgba(255, 255, 255, 0.06);
  --glass-strong: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.1);
  --card-bg: rgba(255, 255, 255, 0.04);
  --shadow: 0 24px 70px rgba(0, 0, 0, 0.6);
  --glow-1: rgba(245, 185, 66, 0.18);
  --glow-2: rgba(192, 132, 252, 0.16);
  --glow-3: rgba(34, 211, 238, 0.12);
}

.cinema-box-office[data-theme='light'] {
  --bg: #f4f4fb;
  --bg-2: #ffffff;
  --text: #15151f;
  --muted: #5d5d76;
  --accent: #d9940a;
  --accent-2: #7c3aed;
  --accent-3: #0891b2;
  --glass: rgba(255, 255, 255, 0.65);
  --glass-strong: rgba(255, 255, 255, 0.85);
  --glass-border: rgba(20, 20, 50, 0.08);
  --card-bg: rgba(255, 255, 255, 0.72);
  --shadow: 0 22px 55px rgba(20, 20, 70, 0.14);
  --glow-1: rgba(217, 148, 10, 0.16);
  --glow-2: rgba(124, 58, 237, 0.12);
  --glow-3: rgba(8, 145, 178, 0.1);
}

/* ---------- 基础 ---------- */
.cinema-box-office {
  box-sizing: border-box;
}

.cinema-box-office *,
.cinema-box-office *::before,
.cinema-box-office *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.cinema-box-office {
  position: relative;
  display: block;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
  transition: background 0.4s ease, color 0.4s ease;
}

.cinema-box-office::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(60vw 60vw at 12% -10%, var(--glow-1), transparent 60%),
    radial-gradient(50vw 50vw at 100% 0%, var(--glow-2), transparent 55%),
    radial-gradient(55vw 55vw at 50% 120%, var(--glow-3), transparent 60%);
}

.cinema-box-office img {
  max-width: 100%;
  display: block;
}

.cinema-box-office button {
  font-family: inherit;
}

.cinema-box-office ::selection {
  background: var(--accent);
  color: #1a1205;
}

.cinema-box-office ::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.cinema-box-office ::-webkit-scrollbar-thumb {
  background: var(--glass-strong);
  border-radius: 999px;
}

.cinema-box-office ::-webkit-scrollbar-track {
  background: transparent;
}

.cinema-box-office .glass {
  background: var(--glass);
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
}

/* ---------- 顶栏 ---------- */
.cinema-box-office .topbar {
  position: sticky;
  top: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 12px clamp(16px, 4vw, 40px);
  border-bottom: 1px solid var(--glass-border);
  background: var(--bg);
  backdrop-filter: blur(14px);
}

.cinema-box-office .brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cinema-box-office .brand-mark {
  font-size: 1.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: cp-spin 9s linear infinite;
}

.cinema-box-office .brand-name {
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: 0.3px;
}

.cinema-box-office .brand-name i {
  font-style: normal;
  font-weight: 500;
  font-size: 0.78rem;
  color: var(--muted);
  margin-left: 7px;
  letter-spacing: 2px;
}

.cinema-box-office .topbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cinema-box-office .select-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.cinema-box-office .select-wrap::after {
  content: '▾';
  position: absolute;
  right: 10px;
  pointer-events: none;
  color: var(--muted);
  font-size: 0.7rem;
}

.cinema-box-office #region {
  appearance: none;
  -webkit-appearance: none;
  background: var(--glass);
  color: var(--text);
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  padding: 9px 30px 9px 14px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: border-color 0.25s, background 0.25s;
}

.cinema-box-office #region:hover {
  border-color: var(--accent);
}

.cinema-box-office #region option {
  background: var(--bg-2);
  color: var(--text);
}

.cinema-box-office .icon-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: var(--glass);
  color: var(--text);
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  padding: 9px 14px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s, background 0.25s;
}

.cinema-box-office .icon-btn:hover {
  border-color: var(--accent);
  background: var(--glass-strong);
}

.cinema-box-office .btn-label {
  font-weight: 600;
}

.cinema-box-office .live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6);
  animation: cp-pulse 1.8s infinite;
}

.cinema-box-office #autoToggle[aria-pressed='false'] .live-dot {
  background: #6b7280;
  animation: none;
  box-shadow: none;
}

.cinema-box-office #autoToggle[aria-pressed='false'] .btn-label::after {
  content: '（停）';
  color: var(--muted);
}

.cinema-box-office #refresh .ico-refresh {
  display: inline-block;
  transition: transform 0.3s;
}

.cinema-box-office #refresh.spinning .ico-refresh {
  animation: cp-spin 0.8s linear infinite;
}

/* ---------- 磁性元素 ---------- */
.cinema-box-office .magnetic {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}

/* ---------- Hero ---------- */
.cinema-box-office .hero {
  position: relative;
  height: 62vh;
  min-height: 420px;
  max-height: 680px;
  overflow: hidden;
}

.cinema-box-office .hero-slide {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  animation: cp-heroFade 0.8s ease;
}

@keyframes cp-heroFade {
  from {
    opacity: 0;
    transform: scale(1.04);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

.cinema-box-office .hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(7, 7, 16, 0.05) 0%, rgba(7, 7, 16, 0.45) 50%, rgba(7, 7, 16, 0.95) 100%);
}

.cinema-box-office[data-theme='light'] .hero-overlay {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0.96) 100%);
}

.cinema-box-office .hero-content {
  position: relative;
  z-index: 1;
  padding: 0 clamp(20px, 5vw, 72px) clamp(30px, 5vw, 64px);
  max-width: 780px;
}

.cinema-box-office .hero-kicker {
  display: inline-block;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 10px;
}

.cinema-box-office .hero-title {
  font-size: clamp(2rem, 5.2vw, 3.6rem);
  font-weight: 800;
  line-height: 1.04;
  letter-spacing: -0.5px;
  margin-bottom: 14px;
  text-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
}

.cinema-box-office .hero-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.cinema-box-office .chip {
  background: var(--glass);
  border: 1px solid var(--glass-border);
  padding: 6px 13px;
  border-radius: 999px;
  font-size: 0.82rem;
  backdrop-filter: blur(10px);
  white-space: nowrap;
}

.cinema-box-office .chip.ghost {
  color: var(--muted);
}

.cinema-box-office .hero-overview {
  color: var(--muted);
  font-size: 0.96rem;
  line-height: 1.65;
  margin: 0 0 22px;
  max-width: 62ch;
}

.cinema-box-office .btn-primary {
  background: linear-gradient(135deg, var(--accent), #ff9d2f);
  color: #1a1205;
  font-weight: 700;
  border: none;
  cursor: pointer;
  padding: 13px 28px;
  border-radius: 999px;
  font-size: 0.96rem;
  box-shadow: 0 12px 34px rgba(245, 185, 66, 0.35);
}

.cinema-box-office .btn-primary:hover {
  filter: brightness(1.06);
}

.cinema-box-office .hero-dots {
  position: absolute;
  z-index: 2;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 9px;
}

.cinema-box-office .hero-dots button {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  border: none;
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  padding: 0;
  transition: width 0.3s, background 0.3s;
}

.cinema-box-office .hero-dots button.active {
  width: 26px;
  background: var(--accent);
}

/* ---------- 内容容器 ---------- */
.cinema-box-office .container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 40px clamp(16px, 4vw, 40px) 20px;
}

.cinema-box-office .section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 22px;
  flex-wrap: wrap;
}

.cinema-box-office .section-title {
  font-size: clamp(1.4rem, 3vw, 1.9rem);
  font-weight: 800;
  letter-spacing: -0.3px;
}

.cinema-box-office .section-title::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 1.1em;
  background: linear-gradient(var(--accent), var(--accent-2));
  border-radius: 4px;
  margin-right: 12px;
  vertical-align: -0.18em;
}

.cinema-box-office .status {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.82rem;
}

.cinema-box-office .mode {
  padding: 4px 11px;
  border-radius: 999px;
  font-weight: 600;
  border: 1px solid var(--glass-border);
}

.cinema-box-office .mode.live {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.4);
  background: rgba(34, 197, 94, 0.1);
}

.cinema-box-office .mode.sample {
  color: var(--accent);
  border-color: rgba(245, 185, 66, 0.4);
  background: rgba(245, 185, 66, 0.1);
}

.cinema-box-office .mode.error {
  color: #f87171;
  border-color: rgba(248, 113, 113, 0.4);
  background: rgba(248, 113, 113, 0.1);
}

.cinema-box-office .updated {
  color: var(--muted);
}

/* ---------- 电影网格 ---------- */
.cinema-box-office .grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(165px, 1fr));
  gap: 18px;
  scroll-margin-top: 84px;
}

.cinema-box-office .card {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  background: var(--card-bg);
  border: 1px solid var(--glass-border);
  cursor: pointer;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s, border-color 0.35s;
}

.cinema-box-office .card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: var(--shadow);
  border-color: color-mix(in srgb, var(--accent) 45%, transparent);
}

.cinema-box-office .card:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.cinema-box-office .poster {
  position: relative;
  aspect-ratio: 2 / 3;
  background: #13131f;
  overflow: hidden;
}

.cinema-box-office .poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.cinema-box-office .card:hover .poster img {
  transform: scale(1.06);
}

.cinema-box-office .poster-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  text-align: center;
  color: #fff;
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 14px rgba(0, 0, 0, 0.45);
  line-height: 1.4;
}

.cinema-box-office .rating {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  color: #ffd76a;
  font-weight: 700;
  font-size: 0.78rem;
  padding: 4px 9px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.cinema-box-office .card-body {
  padding: 12px 13px 15px;
}

.cinema-box-office .card-title {
  font-size: 0.95rem;
  font-weight: 650;
  line-height: 1.35;
  margin: 0 0 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cinema-box-office .card-meta {
  font-size: 0.78rem;
  color: var(--muted);
}

/* ---------- 骨架屏 ---------- */
.cinema-box-office .skeleton .poster {
  background: #16161f;
}

.cinema-box-office .sk {
  background: linear-gradient(100deg, rgba(255, 255, 255, 0.05) 30%, rgba(255, 255, 255, 0.14) 50%, rgba(255, 255, 255, 0.05) 70%);
  background-size: 200% 100%;
  animation: cp-shimmer 1.3s infinite;
  border-radius: 8px;
}

@keyframes cp-shimmer {
  to {
    background-position: -200% 0;
  }
}

.cinema-box-office .sk-line {
  height: 12px;
  margin: 10px 13px 0;
}

.cinema-box-office .sk-line.sm {
  width: 60%;
  height: 10px;
  margin-bottom: 14px;
}

/* ---------- 模态 ---------- */
.cinema-box-office .modal {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.cinema-box-office .modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
}

.cinema-box-office .modal-card {
  position: relative;
  width: min(880px, 100%);
  max-height: 90vh;
  overflow: auto;
  border-radius: 24px;
  background: var(--bg-2);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow);
  animation: cp-modalIn 0.32s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes cp-modalIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

.cinema-box-office .modal-hero {
  height: 240px;
  background-size: cover;
  background-position: center 22%;
  position: relative;
}

.cinema-box-office .modal-hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 40%, var(--bg-2) 100%);
}

.cinema-box-office .modal-close {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 2;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid var(--glass-border);
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s, transform 0.2s;
}

.cinema-box-office .modal-close:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: rotate(90deg);
}

.cinema-box-office .modal-body {
  padding: 22px clamp(20px, 4vw, 34px) 32px;
}

.cinema-box-office .modal-title {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0;
}

.cinema-box-office .modal-sub {
  color: var(--muted);
  margin-top: 5px;
  font-size: 0.95rem;
}

.cinema-box-office .modal-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin: 14px 0 18px;
}

.cinema-box-office .modal-facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 14px;
  padding: 16px;
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  margin-bottom: 18px;
}

.cinema-box-office .modal-facts span {
  display: block;
  font-size: 0.76rem;
  color: var(--muted);
  margin-bottom: 5px;
}

.cinema-box-office .modal-facts b {
  font-size: 1.05rem;
  font-weight: 700;
}

.cinema-box-office .modal-overview {
  line-height: 1.78;
  color: var(--text);
  opacity: 0.9;
}

/* ---------- Toast ---------- */
.cinema-box-office .toasts {
  position: fixed;
  left: 50%;
  bottom: 26px;
  transform: translateX(-50%);
  z-index: 80;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  pointer-events: none;
}

.cinema-box-office .toast {
  background: var(--bg-2);
  color: var(--text);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 11px 18px;
  font-size: 0.88rem;
  box-shadow: var(--shadow);
  animation: cp-toastIn 0.3s ease;
  max-width: 90vw;
}

.cinema-box-office .toast.error {
  border-color: rgba(248, 113, 113, 0.5);
  color: #fca5a5;
}

@keyframes cp-toastIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

/* ---------- 页脚 ---------- */
.cinema-box-office .footer {
  text-align: center;
  color: var(--muted);
  font-size: 0.8rem;
  padding: 40px 20px 30px;
}

/* ---------- 时间筛选 ---------- */
.cinema-box-office .filters {
  display: flex;
  justify-content: center;
  padding: 12px clamp(16px, 4vw, 40px);
  border-bottom: 1px solid var(--glass-border);
  background: var(--bg);
}
.cinema-box-office .filters-inner {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 1280px;
  width: 100%;
}
.cinema-box-office .range-pick {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  padding: 7px 12px 7px 16px;
}
.cinema-box-office .rp-label {
  font-size: 0.8rem;
  color: var(--muted);
  font-weight: 600;
  white-space: nowrap;
}
.cinema-box-office .rp-fields {
  display: flex;
  align-items: center;
  gap: 8px;
}
.cinema-box-office .date-in {
  background: var(--bg-2);
  color: var(--text);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  padding: 6px 8px;
  font-size: 0.82rem;
  font-family: inherit;
  transition: border-color 0.2s;
}
.cinema-box-office .date-in:hover,
.cinema-box-office .date-in:focus {
  border-color: var(--accent);
  outline: none;
}
.cinema-box-office .date-in.dark { color-scheme: dark; }
.cinema-box-office .date-in.light { color-scheme: light; }
.cinema-box-office .rp-dash { color: var(--muted); }
.cinema-box-office .rp-clear {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1px solid var(--glass-border);
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  font-size: 0.72rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.cinema-box-office .rp-clear:hover {
  color: #fff;
  background: rgba(248, 113, 113, 0.25);
  border-color: rgba(248, 113, 113, 0.5);
}
.cinema-box-office .presets {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.cinema-box-office .preset {
  background: var(--glass);
  color: var(--text);
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  padding: 8px 15px;
  font-size: 0.82rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}
.cinema-box-office .preset:hover { border-color: var(--accent); }
.cinema-box-office .preset.active {
  background: linear-gradient(135deg, var(--accent), #ff9d2f);
  color: #1a1205;
  border-color: transparent;
}

/* ---------- 动画 ---------- */
@keyframes cp-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes cp-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5);
  }

  70% {
    box-shadow: 0 0 0 7px rgba(34, 197, 94, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}

/* ---------- 分页 ---------- */
.cinema-box-office .pager {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 14px;
  margin: 34px 0 10px;
}

.cinema-box-office .pager-info {
  font-size: 0.85rem;
  color: var(--muted);
}

.cinema-box-office .pager-pages {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.cinema-box-office .pg {
  min-width: 38px;
  height: 38px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--glass);
  color: var(--text);
  border: 1px solid var(--glass-border);
  border-radius: 11px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s, background 0.2s;
}

.cinema-box-office .pg:hover:not(:disabled):not(.active) {
  border-color: var(--accent);
  transform: translateY(-2px);
}

.cinema-box-office .pg.active {
  background: linear-gradient(135deg, var(--accent), #ff9d2f);
  color: #1a1205;
  border-color: transparent;
  font-weight: 700;
}

.cinema-box-office .pg:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.cinema-box-office .pg-ellipsis {
  color: var(--muted);
  padding: 0 2px;
}

.cinema-box-office .pager-size {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 0.82rem;
  color: var(--muted);
}

.cinema-box-office .pager-size select {
  appearance: none;
  -webkit-appearance: none;
  background: var(--glass);
  color: var(--text);
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  padding: 8px 28px 8px 13px;
  font-size: 0.85rem;
  cursor: pointer;
  background-image: linear-gradient(45deg, transparent 50%, var(--muted) 50%), linear-gradient(135deg, var(--muted) 50%, transparent 50%);
  background-position: calc(100% - 16px) center, calc(100% - 11px) center;
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;
}

.cinema-box-office .pager-size select:hover {
  border-color: var(--accent);
}

.cinema-box-office .pager-size option {
  background: var(--bg-2);
  color: var(--text);
}

/* ---------- 响应式 ---------- */
@media (max-width: 640px) {
  .cinema-box-office .grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 13px;
  }

  .cinema-box-office .topbar {
    flex-wrap: wrap;
  }

  .cinema-box-office .filters-inner {
    flex-direction: column;
    gap: 12px;
  }

  .cinema-box-office .range-pick {
    flex-wrap: wrap;
    justify-content: center;
  }

  .cinema-box-office .btn-label {
    display: none;
  }

  .cinema-box-office .icon-btn {
    padding: 9px 11px;
  }

  .cinema-box-office .hero {
    height: 54vh;
    min-height: 360px;
  }

  .cinema-box-office .modal {
    padding: 0;
    align-items: flex-end;
  }

  .cinema-box-office .modal-card {
    width: 100%;
    max-height: 92vh;
    border-radius: 24px 24px 0 0;
  }

  .cinema-box-office .modal-hero {
    height: 190px;
  }

  .cinema-box-office .pager {
    gap: 10px;
    margin: 26px 0 6px;
  }

  .cinema-box-office .pager-info {
    width: 100%;
    text-align: center;
    order: -1;
  }
}

@media (prefers-reduced-motion: reduce) {

  .cinema-box-office *,
  .cinema-box-office *::before,
  .cinema-box-office *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
</style>
