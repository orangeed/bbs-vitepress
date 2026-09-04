import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import 'animal-island-vue/style'

// 全局注册 animal-island-vue 组件（按需）
import {
  Button,
  Card,
  Title,
  Tabs,
  Divider,
  Footer as IslandFooter,
  Time,
  Icon,
  Input,
  Typewriter,
  Switch,
  Tooltip,
  Modal,
  Cursor,
  Image
} from 'animal-island-vue'

import './styles/custom.css'
import './styles/artalk-custom.css'
import './styles/loading.css'
import Layout from './Layout.vue'
import { installGlobalLoading } from './globalLoading'
// 自定义样式重载
import "./style/style.css";

// 自定义主题色
import "./style/user-theme.css";

import './style/dark.css'

import './style/base.css'

import './styles/header.css'

import './style/doc.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app, router }) {
    installGlobalLoading(router)
    app.component('AButton', Button)
    app.component('ACard', Card)
    app.component('ATitle', Title)
    app.component('ATabs', Tabs)
    app.component('ADivider', Divider)
    app.component('AFooter', IslandFooter)
    app.component('ATime', Time)
    app.component('AIcon', Icon)
    app.component('AInput', Input)
    app.component('ATypewriter', Typewriter)
    app.component('ASwitch', Switch)
    app.component('ATooltip', Tooltip)
    app.component('AModal', Modal)
    app.component('ACursor', Cursor)
    app.component('AImage', Image)
  }
} satisfies Theme
