---
layout: false
---

<h1 align="center"> 橘子的分享v2版本 </h1>

## 简介

本次主题修改时看到了一个组件库`animal-island-vue`，动森风格的，感觉蛮有意思的，所以根据这个组件库，将现有的重构样式.

采用的是`vitepress` + `animal-island-vue`开发。

如果你也喜欢这个，不妨点个赞吧！

## Usage

先安装 `pnpm`

```sh
npm i -g pnpm
```

安装依赖

```sh
pnpm install
```

开发启动

```sh
pnpm dev
```

构建

```sh
pnpm build
```

预览产物

```sh
pnpm serve
```

## 问题

- 电影票房的接口国内无法访问，使用了cloudfare的worker，作为了代理。同时worker绑定了自定义二级域名，根域名的dns交给了cloudfare托管。