<h1 align="center"> 橘子的分享 </h1>

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