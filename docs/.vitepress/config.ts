import { defineConfig } from "vitepress";
import {
  splashHtml,
  splashScript,
  splashStyle,
} from "../.vitepress/theme/splash";

export default defineConfig({
  title: "橘子的分享",
  description: "一个基于 VitePress 与 animal-island-vue 打造的动森风格博客",
  lang: "zh-CN",
  head: [
    // 首屏兜底 Loading 的样式，必须内联：外链 CSS 是渲染阻塞的，来不及
    ["style", {}, splashStyle],
    // 全站视觉风格（theme-*）必须在样式表生效前写到 <html> 上，否则会先闪一下默认风格。
    // 与 theme/styles/themes.scss 的 $default-theme 保持一致（默认「黑白画廊」）。
    [
      "script",
      {},
      `(function(){try{var K='site-style',D='mono',V=['mono','ink','warm','forest','magazine'];var s=localStorage.getItem(K);if(!s||V.indexOf(s)<0)s=D;var c=document.documentElement.classList;V.forEach(function(v){c.remove('theme-'+v)});c.add('theme-'+s)}catch(e){}})()`,
    ],
    ["meta", { name: "referrer", content: "no-referrer" }],
    // 51la 数据统计（async 避免阻塞首屏渲染）
    [
      "script",
      {
        charset: "UTF-8",
        id: "LA_COLLECT",
        src: "//sdk.51.la/js-sdk-pro.min.js",
        async: "",
      },
    ],
    [
      "script",
      { async: "" },
      `document.getElementById('LA_COLLECT')?.addEventListener('load',function(){LA.init({id:"3Pza9oQ74JEgxtxN",ck:"3Pza9oQ74JEgxtxN"})})`,
    ],
  ],
  // 把首屏兜底 Loading 插到 <body> 最前面：HTML 是流式解析的，
  // 越靠前就能越早画出来，不用等整个文档（navhub 有 280KB+）传完
  transformHtml(code) {
    return code.replace(
      /<body([^>]*)>/,
      (_, attrs) => `<body${attrs}>${splashHtml}${splashScript}`
    )
  },
  vite: {
    ssr: {
      // 该组件库依赖浏览器 API，构建时需避免 SSR 转换出错
      noExternal: ["animal-island-vue"],
    },
    build: {
      // 拆分 chunk，避免单文件过大；并开启静态资源压缩提示
      chunkSizeWarningLimit: 600,
      // highlight.js 资源要以 <script src> 动态注入，必须是真实文件：
      // lang-json / lang-shell 只有几百字节，默认会被内联成 data: URI。
      assetsInlineLimit: (filePath) =>
        filePath.replace(/\\/g, "/").includes("/wx-editor/lib/") ? false : undefined,
    },
  },
  themeConfig: {
    nav: [
      // { text: "工具箱", link: "https://doc.orangecj.cn" },
      { text: "导航", link: "/navhub" },
      { text: "公众号排版", link: "/wxEditor" },
    ],
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/guokaigdg/animal-island-vue",
      },
    ],

    search: {
      provider: "local",
      options: {
        // 排除体积庞大的影视/书籍等目录，避免把它们的全文塞进搜索索引 chunk，
        // 从而大幅减小打包体积、提升加载速度。按需调整需被搜索的目录即可。
        exclude: ["Movie/**", "TVDrama/**", "book/**", "Meteorological/**"],
      },
    },
  },
});
