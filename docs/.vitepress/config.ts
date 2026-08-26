import { defineConfig } from "vitepress";

export default defineConfig({
  title: "橘子的分享",
  description: "一个基于 VitePress 与 animal-island-vue 打造的动森风格博客",
  lang: "zh-CN",
  head: [
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
  vite: {
    ssr: {
      // 该组件库依赖浏览器 API，构建时需避免 SSR 转换出错
      noExternal: ["animal-island-vue"],
    },
    build: {
      // 拆分 chunk，避免单文件过大；并开启静态资源压缩提示
      chunkSizeWarningLimit: 600,
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
      options: {
        // 排除体积庞大的影视/书籍等目录，避免把它们的全文塞进搜索索引 chunk，
        // 从而大幅减小打包体积、提升加载速度。按需调整需被搜索的目录即可。
        exclude: ["Movie/**", "TVDrama/**", "book/**", "Meteorological/**"],
      },
    },
  },
});
