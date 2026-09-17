/** 导航站数据结构：NavHub 的分类数据按文件拆分维护（见 data/ 目录） */

export interface SiteItem {
  name: string;
  url: string;
  displayUrl: string;
  desc: string;
  favicon: string;
  faviconBg: string;
  tag: string;
  tagBg: string;
  tagColor: string;
  accent: string;
}

export interface Category {
  id: string;
  icon: string;
  name: string;
  desc: string;
  iconBg: string;
  sites: SiteItem[];
}
