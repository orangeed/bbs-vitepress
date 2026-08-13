---
description: 现在AI时代了，`WorkBuddy`也可以换皮肤啦！
tag: 公众号
title: 难道你不喜欢给你的workbuddy还一个喜欢的皮肤吗？比如财神到？又比如你喜欢的游戏角色背景皮肤？
sidebar: false
cover: https://picx.zhimg.com/70/v2-3a16fb4086a538d6409d29feeeb0fc3b_1440w.avis?source=172ae18b&biz_tag=Post
hiddenCover: false
date: 2026-08-13 15:06:00
---

# 难道你不喜欢给你的workbuddy还一个喜欢的皮肤吗？比如财神到？又比如你喜欢的游戏角色背景皮肤？

![财神皮肤](https://files.mdnice.com/user/40283/8901d138-8c77-445a-8708-52577605fda5.jpg)

以前是换QQ皮肤。

后来玩游戏，换游戏角色皮肤。

现在AI时代了，`WorkBuddy`也可以换皮肤啦！

![紫夜限定](https://files.mdnice.com/user/40283/3983f365-5460-4989-ad68-95e066e872dc.jpg)


![bug神社](https://files.mdnice.com/user/40283/d124b45f-874c-45b3-9929-5269ddebd53e.jpg)

如何换皮肤？其实很简单的，本期就是介绍一个方法，下期再说另外一个。

在互联网上面有一个开源的项目叫做`WorkBuddy-Dream-Skin`。你所看的皮肤都是根据这个来换的。

## 1、前置要求

- 你的电脑只能是**windows系统**
- 将你的 `workbuddy` 更新至**最新版本**
- nodejs版本最好是>= 22
- PowerShell必须>=5.1，一般windows都是自带的

## 2、安装

- 1、关闭你现在使用的workbuddy，如果没有使用，跳过这条
-  2、先下载代码到本地

``` bash
git clone https://github.com/zhouwei713/WorkBuddy-Dream-Skin.git
```

**或者你不会使用命令，我这里有写在好的压缩包，你只需要拿过去解压即可。**

- 3、这个时候需要打开**PowerShell**终端，然后输入

``` bash
Set-ExecutionPolicy -Scope Process Bypass
```

再接着输入
``` bash
cd <你下载的代码放在哪>\WorkBuddy-Dream-Skin
```

- 4、做完以上步骤，接下来就是一键启动
``` bash
.\scripts\install-workbuddy-skin.ps1 -StartNow -RestartExisting
```

到这里为止就是完成了，你可以看右下角导航栏有大一点的`workbuddy`图标，就是专门用来控制的主题的。

![](https://files.mdnice.com/user/40283/8279ae57-0cd6-40fe-999c-c5391a9190f2.png)

> [!TIP]
> 这里以后打开`workbuddy`只能通过创建的快捷方式打开，不能直接使用原本的图标打开，不然还是原本的样子。



![快捷方式](https://files.mdnice.com/user/40283/efadc252-0d82-4878-add7-9161137b4796.png)

## 3、高阶用法

以上就是最近基本的内置的样式，当然你可以自己定制属于自己的样式，比如最简单的就是更换背景。

你只需要找一个你喜欢的图片，在刚刚说的右下角图标点击打开有一个**导入或更换图标**的选项，你只需要点击它，然后再打开的文件框中找到你想要的文件，选中即可替换。

![自定义的背景图片](https://files.mdnice.com/user/40283/1501baa6-b78f-4277-93dc-0060faffd0f2.jpg)

当然你觉得这个文字颜色或者哪里的框颜色不好看，你也可以自定义。

在你下载的代码中，`assets/theme.json`，有这么个文件，里面可以自定义样式。

``` json
{
  "schemaVersion": 2,
  "id": "example-theme",
  "style": "mint-bloom",
  "appearance": "light",
  "name": "示例主题",
  "eyebrow": "WORKBUDDY VISUAL THEME",
  "tagline": "让工作空间拥有自己的气质。",
  "status": "LOCAL LINK ACTIVE",
  "images": {
    "background": "background-image.jpg",
    "hero": "hero-image.jpg",
    "character": null
  },
  "layout": {
    "backgroundPosition": "50% 50%",
    "backgroundSize": "cover",
    "heroPosition": "50% 35%",
    "heroSize": "cover",
    "characterPosition": "right 14px top 170px",
    "characterSize": "154px auto"
  },
  "effects": {
    "backgroundOverlay": 0.82,
    "heroOverlay": 0.58,
    "characterOpacity": 1,
    "panelOpacity": 0.94
  },
  "decoration": {
    "mode": "auto",
    "style": "mint-bloom",
    "source": "hero-full",
    "variant": "full-image-card"
  },
  "colors": {
    "background": "#071318",
    "panel": "#0B2025",
    "panelAlt": "#102B30",
    "accent": "#58E6C2",
    "accentAlt": "#8BF3D8",
    "secondary": "#2F96A3",
    "highlight": "#F2B866",
    "text": "#E8F7F3",
    "muted": "#91AAA5",
    "line": "rgba(88, 230, 194, .22)"
  }
}
```

其中具体的参数说明，你可以看你下载的代码中`docs/THEME-SCHEMA.md`文件，里面都有说明的。

![字段说明](https://files.mdnice.com/user/40283/01efc60b-6d9b-4248-9087-284ed1fd2c12.png)

根据这个说明，修改这个配置文件，相信你一定可以做出来非常适合自己的主题！

**以上就是本期推荐的一个换肤方法了，当然还有个更简单的，下一期给你说！**
