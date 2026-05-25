import BlogTheme from "@sugarat/theme";
import Layout from "./Layout.vue";

// 自定义样式重载
import "./style/style.css";

// 自定义主题色
import "./style/user-theme.css";

import './style/dark.css'

import './style/base.css'

export default {
  ...BlogTheme,
  Layout,
};
