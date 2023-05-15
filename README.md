# 今日笔记

> Beta 预览版，用户开发者测试集市效果
> 2.8.7 正式版本不能正常使用插件功能，请至少使用 v2.8.7.dev3 预览插件效果

- 提交 Issue 请访问[Github](https://github.com/frostime/siyuan-dailynote-today)
- 国内用户可访问[国内托管](https://gitcode.net/frostime/siyuan-plugin-daily-note)

本插件比较适合笔记本比较多的人，用于快速在不同笔记本创建今日的笔记，并将块在不同笔记中移动。

## 功能介绍

### 1. 自动创建笔记

![](https://gitcode.net/frostime/siyuan-plugin-daily-note/-/raw/main/asset/AutoOpen.png)
<!-- ![](asset/AutoOpen.png) -->

- 启动插件时，自动创建/打开今天的笔记。
- 插件的设置面板中可以手动指定默认笔记本的 ID
    - 打开笔记本图标，点击「设置」按钮，再点击「复制ID」
    - 如果 ID 填写错误，则启动插件的时候会警告
- 如果不指定默认笔记本，自动选择当前排位第一的笔记本作为
    - 关于这个所谓的「排位第一」是什么意思，请阅读[FAQ](#q-笔记本的排序是如何确定的可以调整吗)
- 可以在设置面板中关闭这一功能
- 自动忽略「思源笔记用户指南」

### 2. 左键点击图标，快速创建/打开今天的笔记

![](https://gitcode.net/frostime/siyuan-plugin-daily-note/-/raw/main/asset/IconLeftClick.png)
<!-- ![](asset/IconLeftClick.png) -->

- 下拉框中按照笔记本顺序排列（见[FAQ](#q-笔记本的排序是如何确定的可以调整吗)），列出所有的笔记本
- 点击笔记本，自动打开/创建今日的笔记
- 笔记本名称前面带有「√」标识，表示该笔记本已经创建了笔记
    - 「√」标识会自动更新
- 同样会忽略「思源笔记用户指南」

### 3. 右键点击图标，快速配置插件

![](https://gitcode.net/frostime/siyuan-plugin-daily-note/-/raw/main/asset/IconRightClick.png)
<!-- ![](asset/IconRightClick.png) -->


- 点击进入插件设置面板
- 点击 “更新 ”更新插件全局状态

### 4. 设置面板

![](https://gitcode.net/frostime/siyuan-plugin-daily-note/-/raw/main/asset/Setting.png)
<!-- ![](asset/Setting.png) -->


### 5. 移动块到今天的 Daily Note 中

![](https://gitcode.net/frostime/siyuan-plugin-daily-note/-/raw/main/asset/MoveBlock.png)
<!-- ![](asset/MoveBlock.png) -->

- 选中块，「Alt+右键」，可以调出一个移动块的面板
- 选择笔记本，可以把当前块移动到对应笔记本今天的日记下
- 支持移动整个嵌套结构
- 支持移动标题块下方所有内容


## 常见问题


### Q: 我不想每次打开笔记的时候就创建日记。

请在插件设置里关闭「自动打开 Daily Note」。

### Q: 什么情况下我需要更新状态？

- 当打开、关闭、创建、移动笔记本的时候，请按更新状态
    - 插件可自动追踪笔记的创建情况，但是不会追踪笔记本的状态
- 如果发现「Alt + 右键」无法呼出移动菜单，尝试更新一下

### Q: 笔记本的排序是如何确定的？可以调整吗？

#### 背景知识

在思源软件本体中，「文档树展示的排序方案」可以分为两类：

1. 自定义排序

    可以自由拖动笔记本进行排序，这个顺序会被思源记录

2. 其他排序

    「自定义排序」之外所有的排序都算

![](https://gitcode.net/frostime/siyuan-plugin-daily-note/-/raw/main/asset/文档树排序.png)
<!-- ![](asset/文档树排序.png) -->


#### 插件设置

插件一共支持两种排序方案，均可在设置中配置。

1. 和自定义排序一致

    此种方案下，插件展示的笔记本排序只会和在「自定义排序」模式下的顺序一致，即使后面更换了别的「文档树展示的排序方案」，插件所展示的笔记本顺序也不会改变。

2. 和文档树一致

    此种方案下，插件展示的笔记本排序和文档树中的顺序完全一致。

在更改了思源的笔记本排序之后，请按 Ctrl + Alt + U 更新状态。


### Q: 为什么移动标题块的时候这么卡？

并不是卡，而是移动块有一个过程。

思源笔记中标题块并不是一个容器块，没有办法一次性移动完成，需要识别哪些块属于当前标题下，所以比较慢。

## CHANGELOG

[CHANGELOG](CHANGELOG.md)
