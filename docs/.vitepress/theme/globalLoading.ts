import { createApp, h, ref } from 'vue'
import type { Router } from 'vitepress'
import RouteLoading from './components/RouteLoading.vue'

/**
 * 路由切换显示 Loading 的两个关键参数：
 *
 * - SHOW_DELAY：触发 onBefore 后，等多久才挂遮罩。
 *   设太短：秒开的页面也闪一下遮罩，体感"卡"。
 *   设太长：用户看到旧页面僵在那，体感"卡死了"。
 *   60ms 是经验值，比一帧稍长，命中缓存的 SPA 跳转能在显示前完成。
 *
 * - MIN_VISIBLE_MS：一旦挂上遮罩，最少让它转多久。
 *   设太短：动画刚露脸就关，跟没显示一样（之前 navhub 的问题）。
 *   设太长：每次跳转都强制等，看不到"秒开"的优势。
 *   320ms 是动画播一帧 + 圆形擦除刚启动的时长。
 */
const SHOW_DELAY = 60
const MIN_VISIBLE_MS = 320

/**
 * ALoading 关闭时是圆形擦除动画，时长由组件内部按
 * `max(0.1, (对角线 / 2 + 50) / 1500)` 计算。
 * 这里用同样的公式推算，等动画播完再卸载遮罩，避免中途露出旧页面。
 */
function closingDuration(mask: HTMLElement) {
  const { width, height } = mask.getBoundingClientRect()
  const radius = Math.ceil(Math.hypot(width, height) / 2) + 50
  return Math.max(0.1, radius / 1500)
}

/**
 * 站点内跳转是客户端路由：目标页的 JS chunk 下载解析完之前，
 * 页面上一直停留着上一个页面。这里用动物森友会的 Loading 盖住，
 * 让用户看到的是加载动画，而不是"上一个页面卡住了"。
 *
 * 注意：/navhub、/wxEditor 这类页面是 layout: false，不渲染主题 Layout，
 * 所以遮罩挂在独立的 Vue 应用上，不能放进 Layout 插槽。
 */
export function installGlobalLoading(router: Router) {
  // SSR 阶段没有 document
  if (typeof document === 'undefined') return

  const visible = ref(false)
  const active = ref(true)

  const host = document.createElement('div')
  document.body.appendChild(host)
  createApp({
    render: () => h(RouteLoading, { visible: visible.value, active: active.value })
  }).mount(host)

  const getMask = () => host.querySelector<HTMLElement>('.route-loading')
  let showTimer: ReturnType<typeof setTimeout> | undefined
  let closeTimer: ReturnType<typeof setTimeout> | undefined
  // 遮罩挂上去的时刻，用来计算 MIN_VISIBLE_MS
  let shownAt = 0

  function show() {
    clearTimeout(showTimer)
    showTimer = setTimeout(() => {
      active.value = true
      visible.value = true
      shownAt = performance.now()
    }, SHOW_DELAY)
  }

  function doHide() {
    active.value = false
    const mask = getMask()
    closeTimer = setTimeout(
      () => {
        visible.value = false
      },
      (mask ? closingDuration(mask) : 0.8) * 1000 + 80
    )
  }

  function hide() {
    // 取消还没挂上的延迟显示
    clearTimeout(showTimer)
    if (!visible.value) return
    // 已经挂上了：凑足最短显示时长，否则"露脸就关"
    const elapsed = performance.now() - shownAt
    const remain = Math.max(0, MIN_VISIBLE_MS - elapsed)
    closeTimer = setTimeout(doHide, remain)
  }

  /** 收起首屏兜底的 splash（内联在 HTML 里） */
  function hideSplash() {
    ;(window as unknown as { __aiSplashHide?: () => void }).__aiSplashHide?.()
  }

  const before = router.onBeforeRouteChange
  const after = router.onAfterRouteChange
  let isFirstNavigation = true
  // 连续跳转时，只有最后一次导航有权收起遮罩
  let navSeq = 0

  router.onBeforeRouteChange = (to) => {
    // 首屏由 splash / SSR 内容兜底，不叠加遮罩
    if (!isFirstNavigation) show()
    return before?.(to)
  }

  router.onAfterRouteChange = async (to) => {
    isFirstNavigation = false
    const seq = ++navSeq
    await after?.(to)
    // 等新页面真正渲染出来（两帧）再收遮罩，否则会闪回旧页面
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (seq === navSeq) hide()
        hideSplash()
      })
    )
  }

  // 浏览器前进/后退不走 onBeforeRouteChange，单独补一下
  window.addEventListener('popstate', () => {
    if (!isFirstNavigation) show()
  })
}
