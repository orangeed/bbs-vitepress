/**
 * 首屏兜底 Loading。
 *
 * 它是**内联进 HTML** 的（零 JS 依赖），所以浏览器一解析到就能画出来，
 * 不用等 app 那 1MB+ 的 JS。
 *
 * 关键设计：命中 SSR 直出的页面会立刻自己消失（见 splashScript），
 * 只有 `#app` 是空的时候才真的留下来挡白屏——否则反而会把已经能看的内容遮住。
 */

export const splashStyle = `
.ai-splash{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:#ece6d4;transition:opacity .4s ease,visibility .4s}
html.dark .ai-splash{background:#2d3554}
.ai-splash.is-hidden{opacity:0;visibility:hidden;pointer-events:none}
.ai-splash__art{width:160px;height:120px;animation:ai-splash-float 1.8s ease-in-out infinite}
.ai-splash__w1{animation:ai-splash-wave 2.6s linear infinite}
.ai-splash__w2{animation:ai-splash-wave 3.4s linear infinite reverse}
@keyframes ai-splash-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes ai-splash-wave{from{transform:translateX(0)}to{transform:translateX(60px)}}
@media (prefers-reduced-motion:reduce){.ai-splash__art,.ai-splash__w1,.ai-splash__w2{animation:none}}
`.trim()

export const splashHtml = `<div id="ai-splash" class="ai-splash"><svg class="ai-splash__art" viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg"><ellipse cx="60" cy="66" rx="33" ry="9" fill="#c8a06a"/><ellipse cx="60" cy="62" rx="33" ry="10" fill="#78bb4d"/><rect x="56.5" y="42" width="7" height="22" rx="3.5" fill="#8a5a3b"/><circle cx="51" cy="48" r="9" fill="#4f9c3f"/><circle cx="69" cy="48" r="9" fill="#4f9c3f"/><circle cx="60" cy="38" r="13" fill="#5cb04a"/><path class="ai-splash__w2" d="M-60 70 q15 -7 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 V90 H-60 Z" fill="#2ec3ec" opacity=".45"/><path class="ai-splash__w1" d="M-60 76 q15 -7 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 V90 H-60 Z" fill="#bae4f0"/></svg></div>`

export const splashScript = `<script>(function(){var s=document.getElementById('ai-splash');if(!s)return;var done=false;function hide(){if(done)return;done=true;s.classList.add('is-hidden');setTimeout(function(){if(s.parentNode)s.parentNode.removeChild(s)},600)}window.__aiSplashHide=hide;document.addEventListener('DOMContentLoaded',function(){var app=document.getElementById('app');if(app&&(app.textContent||'').trim().length>20)hide()});setTimeout(hide,8000)})();<\/script>`
