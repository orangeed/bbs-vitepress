import { defineConfig } from "vitepress";

export default defineConfig({
  title: "橘子的分享",
  description: "一个基于 VitePress 与 animal-island-vue 打造的动森风格博客",
  lang: "zh-CN",
  head: [
    ["meta", { name: "referrer", content: "no-referrer" }],
    // 51la 数据统计
    [
      "script",
      {
        charset: "UTF-8",
        id: "LA_COLLECT",
        src: "//sdk.51.la/js-sdk-pro.min.js",
      },
    ],
    [
      "script",
      {},
      `document.getElementById('LA_COLLECT')?.addEventListener('load',function(){LA.init({id:"3Pza9oQ74JEgxtxN",ck:"3Pza9oQ74JEgxtxN"})})`,
    ],
  ],
  vite: {
    ssr: {
      // 该组件库依赖浏览器 API，构建时需避免 SSR 转换出错
      noExternal: ["animal-island-vue"],
    },
  },
  themeConfig: {
    nav: [
      { text: "工具箱", link: "https://doc.orangecj.cn" },
      { text: "导航", link: "/navhub" },
      { text: "电影票房", link: "/movieMoney/" },
    ],
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/guokaigdg/animal-island-vue",
      },
    ],

    search: {
      provider: "local",
    },
  },
});
