export interface Post {
  title: string
  desc: string
  category: string
  tags: string[]
  date: string
  cover: string
  color: string
  reading: number
  href: string
  featured?: boolean
}

// 文章列表数据（与 posts/*.md 对应）
export const posts: Post[] = [
  {
    title: '在无人的小岛上，种下第一朵花',
    desc: '搬来无人岛的第一天，我用铲子松土、用喷壶浇水，把一颗小小的花苗埋进松软的泥土里。',
    category: '日常生活',
    tags: ['日常', '种花'],
    date: '2026-07-28',
    cover: '🌷',
    color: 'app-pink',
    reading: 5,
    href: '/posts/post-1',
    featured: true
  },
  {
    title: '资源荟萃：动森玩家不可错过的 8 个工具',
    desc: '从地图规划到家具设计，整理一份私藏工具清单，让你的小岛建设事半功倍。',
    category: '资源荟萃',
    tags: ['工具', '合集'],
    date: '2026-07-25',
    cover: '🗺️',
    color: 'app-blue',
    reading: 8,
    href: '/posts/post-2',
    featured: true
  },
  {
    title: '用 Vue 3 写一个会呼吸的卡片组件',
    desc: '借助过渡与缓动函数，让普通的卡片拥有动物森友会般柔软的生命力。',
    category: '软件技术',
    tags: ['Vue', '前端'],
    date: '2026-07-22',
    cover: '💡',
    color: 'purple',
    reading: 12,
    href: '/posts/post-3',
    featured: true
  },
  {
    title: '今天钓到了一条鲈鱼，纪念一下',
    desc: '虽然大家都说鲈鱼没用，但它在我的池塘里闪着银光，也算一种小确幸。',
    category: '日常生活',
    tags: ['钓鱼', '日常'],
    date: '2026-07-20',
    cover: '🐟',
    color: 'app-teal',
    reading: 4,
    href: '/posts/post-4'
  },
  {
    title: '把家门口的铃钱树养成了摇钱树',
    desc: '种下铃钱袋的诀窍其实很简单，关键是 timing 和一点点耐心。',
    category: '资源荟萃',
    tags: ['攻略', '铃钱'],
    date: '2026-07-18',
    cover: '🌳',
    color: 'app-green',
    reading: 6,
    href: '/posts/post-5'
  },
  {
    title: '从零搭建一个动森风格的个人网站',
    desc: '使用 VitePress + animal-island-vue，半天时间拥有一个可爱又实用的博客。',
    category: '软件技术',
    tags: ['VitePress', '教程'],
    date: '2026-07-15',
    cover: '🏝️',
    color: 'app-orange',
    reading: 15,
    href: '/posts/post-6',
    featured: true
  }
]

// 分类标签（用于首页 Tabs）
export const categories = [
  { key: 'all', label: '全部文章' },
  { key: '日常生活', label: '日常生活' },
  { key: '资源荟萃', label: '资源荟萃' },
  { key: '软件技术', label: '软件技术' }
]

// 精选文章（右侧模块数据，按阅读量/推荐排序）
export const featuredPosts = posts
  .filter((p) => p.featured)
  .sort((a, b) => b.reading - a.reading)

// 热门标签
export const hotTags = ['Vue', '日常', '攻略', '教程', '工具', '铃钱', '种花', '钓鱼']
