import type { Category } from './types'

/** 测试集合 —— 众多测试网站集合地 */
export const test: Category = {
  id: "test",
  icon: "👳‍♀️",
  name: "测试集合",
  desc: "众多测试网站集合地",
  iconBg: "rgba(250, 103, 5, 0.58)",
  sites: [
    {
      name: "人格测试",
      url: "https://www.16personalities.com/ch",
      displayUrl: "16personalities.com",
      desc: "梦寐以求的被理解之感终于降临，这种滋味妙不可言。",
      favicon: "16",
      faviconBg: "rgb(118, 84, 134)",
      tag: "测试",
      tagBg: "rgba(118, 84, 134,.12)",
      tagColor: "rgb(118, 84, 134)",
      accent: "rgb(118, 84, 134)",
    },
    {
      name: "颜值分析器",
      url: "https://www.prettyscale.com/zh",
      displayUrl: "prettyscale.com",
      desc: "一张照片就能算出你到底是不是帅哥美女",
      favicon: "颜",
      faviconBg: "rgb(175, 90, 74)",
      tag: "测试",
      tagBg: "rgba(175, 90, 74,.12)",
      tagColor: "rgb(175, 90, 74)",
      accent: "rgb(175, 90, 74)",
    },
    {
      name: "测试集合",
      url: "https://www.arealme.com/zh",
      displayUrl: "arealme.com",
      desc: "多种测试集合地",
      favicon: "颜",
      faviconBg: "rgb(255, 127, 0)",
      tag: "测试",
      tagBg: "rgba(255, 127, 0,.12)",
      tagColor: "rgb(255, 127, 0)",
      accent: "rgb(255, 127, 0)",
    },
  ],
}
