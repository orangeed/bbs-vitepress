/**
 * 导航站数据统一出口：各分类按文件拆分在 data/ 目录下，
 * 新增分类 = 新建 <id>.ts + 在下面 imports / categories 里各加一行。
 */
import type { Category } from './types'
import { source } from './source'
import { moyu } from './moyu'
import { test } from './test'
import { video } from './video'
import { music } from './music'
import { read } from './read'
import { dev } from './dev'
import { design } from './design'
import { social } from './social'
import { media } from './media'
import { news } from './news'
import { learn } from './learn'
import { ai } from './ai'
import { skill } from './skill'
import { wallpaper } from './wallpaper'

export const categories: Category[] = [
  source,
  moyu,
  test,
  video,
  music,
  read,
  dev,
  design,
  social,
  media,
  news,
  learn,
  ai,
  skill,
  wallpaper,
]

export type { Category, SiteItem } from './types'
