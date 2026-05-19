import { defineConfig } from "vitepress";
import { artalkPlugin } from "vitepress-plugin-artalk";
// 导入主题的配置
import { blogTheme } from "./blog-theme";

// 如果使用 GitHub/Gitee Pages 等公共平台部署
// 通常需要修改 base 路径，通常为“/仓库名/”
// 如果项目名已经为 name.github.io 域名，则不需要修改！
// const base = process.env.GITHUB_ACTIONS === 'true'
//   ? '/vitepress-blog-sugar-template/'
//   : '/'

// Vitepress 默认配置
// 详见文档：https://vitepress.dev/reference/site-config
export default defineConfig({
  // 继承博客主题(@sugarat/theme)
  extends: blogTheme,
  // base,
  lang: "zh-cn",
  title: "橘子的分享",
  description: "橘子的分享，分享华丽花哨，乱七八糟的东西",
  // lastUpdated: true,
  // 详见：https://vitepress.dev/zh/reference/site-config#head
  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }],
    // ["link", { rel: "stylesheet", href: "./theme/style/base.css" }],
  ],
  themeConfig: {
    // 展示 2,3 级标题在目录中
    outline: {
      level: [2, 3],
      label: "目录",
    },
    // 默认文案修改
    returnToTopLabel: "回到顶部",
    sidebarMenuLabel: "相关文章",
    lastUpdatedText: "上次更新于",

    // 设置logo
    logo: "/logo.png",
    // editLink: {
    //   pattern:
    //     'https://github.com/ATQQ/sugar-blog/tree/master/packages/blogpress/:path',
    //   text: '去 GitHub 上编辑内容'
    // },
    // nav: [
    //   { text: "首页", link: "/" },
    //   { text: "关于作者", link: "https://sugarat.top/aboutme.html" },
    // ],
    // socialLinks: [
    //   {
    //     icon: 'github',
    //     link: 'https://github.com/ATQQ/sugar-blog/tree/master/packages/theme'
    //   }
    // ]
  },
  vite: {
    plugins: [
      artalkPlugin({
        site: "橘子的分享",
        server: "https://orangecj.cn/artalk/",
      }),
    ],
  },

});
