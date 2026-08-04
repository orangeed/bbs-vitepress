// 自动扫描 docs 下所有 .md 文章，按 frontmatter 的 tag 字段聚合分类。
// 新增 md 文件后首页会自动更新，无需手动维护数据。

export interface Post {
  title: string
  desc: string
  tag: string
  date: string
  cover: string
  coverType: 'image' | 'emoji'
  color: string
  reading: number
  href: string
  featured?: boolean
  top?: number
}

export interface Category {
  key: string
  label: string
  count: number
}

// 读取所有文章模块（含 frontmatter），eager 模式在构建期一次性载入。
// VitePress 编译后的 .md 模块导出：default(组件) 与 __pageData(页面数据)。
const modules = import.meta.glob('../../../../**/*.md', {
  eager: true
}) as Record<string, any>

// 读取所有文章原始 markdown 文本，用于提取正文第一个标题与封面图
const rawTexts = import.meta.glob('../../../../**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>

const colorPalette = [
  'app-pink',
  'app-blue',
  'app-teal',
  'app-green',
  'app-orange',
  'purple'
]

// 分类对应的默认封面 emoji（当文章没有可用封面图时）
const tagEmoji: Record<string, string> = {
  电影: '🎬',
  电视剧: '📺',
  国漫: '🌸',
  网络小说: '📚',
  个人作品: '🎨',
  公众号: '📣',
  软件: '💻',
  其他: '📁'
}

function getFrontmatter(mod: any): Record<string, any> {
  if (!mod) return {}
  if (mod.__pageData && mod.__pageData.frontmatter) return mod.__pageData.frontmatter
  if (mod.__pageData) return mod.__pageData
  if (mod.frontmatter) return mod.frontmatter
  return {}
}

function hrefFromPath(path: string): string {
  const rel = path
    .replace(/^(\.\.\/)+/, '')
    .replace(/\.md$/, '')
  return `/${rel}`
}

function pickColor(i: number): string {
  return colorPalette[i % colorPalette.length]
}

// 从正文提取第一个一级标题（# xxx）
function extractTitle(raw: string): string {
  if (!raw) return ''
  const lines = raw.split('\n')
  for (const line of lines) {
    const m = line.match(/^#\s+(.+)$/)
    if (m) return m[1].trim()
  }
  return ''
}

// 从正文提取第一个图片地址（<img src="...">）
function extractFirstImage(raw: string): string {
  if (!raw) return ''
  const m = raw.match(/<img[^>]+src=["']([^"']+)["']/i)
  return m ? m[1] : ''
}

// 判断 cover 是否为图片地址（而非 emoji）
function isImageUrl(s: string): boolean {
  return /^https?:\/\//.test(s) || s.startsWith('/') || s.startsWith('./')
}

const rawPosts: Post[] = []

let idx = 0
for (const path in modules) {
  const fm = getFrontmatter(modules[path])
  if (/(^|\/)(index|about|links)\.md$/.test(path)) continue
  // 排除 layout: false 的页面（如 navhub、movieMoney 等独立页面）
  if (fm.layout === false) continue
  const href = hrefFromPath(path)
  const raw = rawTexts[path] || ''

  // 标题：frontmatter.title 优先，否则取正文第一个一级标题，再否则取 description 前 20 字
  const title =
    (fm.title as string) ||
    extractTitle(raw) ||
    (fm.description ? String(fm.description).slice(0, 20) : href)
  if (!title && !fm.description) continue

  // 封面：frontmatter.cover 且未隐藏 -> 用 cover；否则正文首个 img；都没有 -> emoji 占位
  let cover = ''
  let coverType: 'image' | 'emoji' = 'emoji'
  if (fm.cover && !fm.hiddenCover && isImageUrl(String(fm.cover))) {
    cover = String(fm.cover)
    coverType = 'image'
  } else {
    const img = extractFirstImage(raw)
    if (img && isImageUrl(img)) {
      cover = img
      coverType = 'image'
    } else {
      const tag = (fm.tag as string) || '其他'
      cover = tagEmoji[tag] || '📁'
      coverType = 'emoji'
    }
  }

  const tag = (fm.tag as string) || '其他'
  rawPosts.push({
    title,
    desc: (fm.description as string) || '',
    tag,
    date: (fm.date as string) || '',
    cover,
    coverType,
    color: pickColor(idx++),
    reading: Number(fm.reading) || 6,
    href,
    featured: !!fm.featured,
    top: Number(fm.top) || 0
  })
}

// 按日期倒序（新文章在前）
const posts: Post[] = rawPosts.sort((a, b) => {
  const ta = a.date ? new Date(a.date).getTime() : 0
  const tb = b.date ? new Date(b.date).getTime() : 0
  return tb - ta
})

// 按 tag 聚合分类（全部 + 各 tag）
const tagCount = new Map<string, number>()
for (const p of posts) {
  tagCount.set(p.tag, (tagCount.get(p.tag) || 0) + 1)
}

const categories: Category[] = [
  { key: 'all', label: '全部文章', count: posts.length },
  ...[...tagCount.entries()].map(([key, count]) => ({ key, label: key, count }))
]

// 精选文章：优先取 top > 0 的置顶文章（按 top 值升序），不足再用 featured 标记的文章补足，最多 6 篇
const featuredPosts: Post[] = (() => {
  const topped = posts.filter((p) => (p.top || 0) > 0).sort((a, b) => (a.top || 0) - (b.top || 0))
  if (topped.length >= 6) return topped.slice(0, 6)
  const remaining = posts.filter((p) => (p.top || 0) <= 0 && p.featured)
  return [...topped, ...remaining].slice(0, 6)
})()

// 热门标签：按出现频次取前 12 个
const hotTags = [...tagCount.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 12)
  .map(([t]) => t)

export { posts, categories, featuredPosts, hotTags }
