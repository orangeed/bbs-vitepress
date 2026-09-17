/**
 * 全站视觉风格的单一真源。
 *
 * 风格类名写在 <html> 上（theme-mono / theme-ink / …），
 * 对应样式在 styles/themes.scss 里生成；明暗模式仍由 VitePress 的 .dark 负责，
 * 两者正交：任意风格 × 明暗都能组合。
 *
 * 首屏由 config.ts head 里的内联脚本先行写入类名（防闪烁），
 * 这里负责运行期的读写与持久化。任何需要切换风格的 UI（顶栏切换器、
 * NavHub 侧栏的 Select 等）都应使用本模块，保证状态一致。
 */
import { ref, watch } from 'vue'

export interface StyleOption {
  id: string
  name: string
  hint: string
  /** 用于切换器里的色板预览（取该风格暗色下的强调色） */
  preview: string
}

export const STYLE_OPTIONS: StyleOption[] = [
  { id: 'mono', name: '黑白画廊', hint: '极简 · 无彩', preview: '#111111' },
  { id: 'ink', name: '墨与黄铜', hint: '静奢 · 发丝线', preview: '#c9a86a' },
  { id: 'warm', name: '暖木与橘', hint: '温暖 · 圆润', preview: '#ff9a4d' },
  { id: 'forest', name: '深绿香槟', hint: '沉稳 · 商务', preview: '#d9c08a' },
  { id: 'magazine', name: '暗夜杂志', hint: '编辑 · 绛红', preview: '#c04a3f' },
]

export const STYLE_KEY = 'site-style'
/** 默认风格：与 config.ts 首屏脚本、themes.scss 的 $default-theme 保持一致 */
export const DEFAULT_STYLE = 'mono'

const STYLE_IDS = STYLE_OPTIONS.map(s => s.id)

function readSaved(): string {
  if (typeof localStorage === 'undefined') return DEFAULT_STYLE
  try {
    const v = localStorage.getItem(STYLE_KEY)
    return v && STYLE_IDS.includes(v) ? v : DEFAULT_STYLE
  } catch {
    return DEFAULT_STYLE
  }
}

export const activeStyle = ref(readSaved())

/** 把风格类名写到 <html>（移除其它 style-* 类，保持唯一） */
export function applyStyle(id: string) {
  if (typeof document === 'undefined') return
  const cl = document.documentElement.classList
  STYLE_IDS.forEach(v => cl.remove(`theme-${v}`))
  cl.add(`theme-${id}`)
}

export function setStyle(id: string) {
  activeStyle.value = STYLE_IDS.includes(id) ? id : DEFAULT_STYLE
}

let watched = false

/** 在应用入口调用一次：应用当前风格并持久化后续变更 */
export function initStyleTheme() {
  activeStyle.value = readSaved()
  applyStyle(activeStyle.value)
  if (watched) return
  watched = true
  watch(activeStyle, (val) => {
    applyStyle(val)
    try {
      localStorage.setItem(STYLE_KEY, val)
    } catch {
      // 隐私模式忽略
    }
  })
}

export function useStyleTheme() {
  return { activeStyle, activeName: () => currentName(), setStyle, options: STYLE_OPTIONS }
}

export function currentOption(): StyleOption {
  return STYLE_OPTIONS.find(s => s.id === activeStyle.value) || STYLE_OPTIONS[0]
}

function currentName() {
  return currentOption().name
}
