import type { Dish } from './types'

// 占位图渐变背景：由菜名生成稳定色相
function hashHue(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % 360
  return hash
}

// 运行时生成 SVG 占位图（data-URI），离线可用、无网络请求
export function buildDishImage(name: string): string {
  const h1 = hashHue(name)
  const h2 = (h1 + 40) % 360
  const c1 = `hsl(${h1}, 70%, 62%)`
  const c2 = `hsl(${h2}, 72%, 48%)`
  const text = name.length > 6 ? name.slice(0, 6) : name
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
  </linearGradient></defs>
  <rect width="200" height="200" rx="16" fill="url(#g)"/>
  <text x="100" y="108" font-family="-apple-system,'PingFang SC','Microsoft YaHei',sans-serif"
    font-size="30" font-weight="700" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${text}</text>
</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

// 返回菜品图片：
// 1) 若 image 为真实图片路径（非纯菜名，含 "." 后缀或 "/"），直接返回原值
// 2) 否则视为菜名，运行时生成 SVG 占位图
export function dishImage(dish: Dish): string {
  const v = dish.image || dish.name
  if (v.includes('/') || /\.(jpe?g|png|webp|gif|svg|avif)$/i.test(v)) return v
  return buildDishImage(v)
}
