---
name: Protyle integration and parameter behavior
description: Daily Note View 中嵌入的 SiYuan Protyle 参数、DOM/滚动关系、打字机模式留白行为及上游维护约束。
updated: 2026-08-07
scope:
  - /src/components/dailynote-view/protyle-host.svelte
  - /src/components/dailynote-view/daily-note-lane.svelte
  - /src/components/dailynote-view/duplicate-daily-note.svelte
  - /src/index.scss
---

# Protyle integration and parameter behavior

## Overview

Daily Note View 使用 SiYuan 官方 Protyle 渲染和编辑日记文档，而不是实现第二套编辑器。本文件只记录本项目依赖的 Protyle 行为；完整 API 以运行时 SiYuan 版本为准，`node_modules/siyuan/types/protyle.d.ts` 只提供编译期类型。

## Current integration contract

入口是 `/src/components/dailynote-view/protyle-host.svelte → load()`。同一个 `ProtyleHost` 同时用于普通日记栏和重复日记的主文档。

| 参数 | 当前值 | 行为与项目影响 |
|---|---|---|
| `mode` | `"wysiwyg"` | 以可编辑所见即所得模式渲染文档。 |
| `blockId` | 当前日记文档 ID | 作为 Protyle 的初始文档目标。 |
| `action` | `["cb-get-all"]` | 初次加载全部块；上游会标记 `block.showAll`，因此不会按普通文档滚动触发前后块的动态加载。 |
| `typewriterMode` | `true` | 启用官方打字机模式，为编辑区底部增加与编辑器高度相关的留白。见下文。 |
| `render.background` | `false` | 不渲染文档背景。 |
| `render.title` | `true` | 渲染并允许编辑文档标题。 |
| `render.gutter` | `true` | 显示块标及其操作入口。 |
| `render.scroll` | `true` | 初始化 Protyle 的动态滚动控制条；使用 `cb-get-all` 全量加载时上游可能将控制条隐藏。它不是普通内容滚动，也不是底部留白开关。 |
| `render.breadcrumb` | `true` | 显示面包屑。 |
| `render.breadcrumbDocName` | `false` | 面包屑不额外显示文档名。 |

`cb-get-all` 是当前视图的完整文档展示约束。若以后改为动态加载，必须重新检查滚动边界、块加载和编辑定位行为。

## Typewriter mode and bottom space

`typewriterMode: true` 是为了复用官方编辑器的末尾定位行为，不是文档内容的一部分。

上游 Protyle 的相关流程为：

```text
Protyle constructor
→ load document
→ onGet / setHTML
→ resize()
→ setPadding()
```

在 `getPadding()` 中：

```text
普通模式：bottom = 16px
打字机模式：bottom = protyle.element.clientHeight / 2
```

`setPadding()` 会把这个值写入 `.protyle-wysiwyg` 的底部 padding。因此短文档也能继续向下滚动，末尾编辑块可以移动到编辑区中央；该留白不会插入块、不会保存到文档，也不应通过伪造空段落实现。

## DOM and scroll ownership

项目和 Protyle 目前存在两层可能的纵向滚动容器：

| 层级 | 选择器 | 当前行为 |
|---|---|---|
| 视图宿主 | `.dnt-view__protyle` | `overflow-y: auto`，由项目布局提供栏位滚动空间。 |
| Protyle 内容区 | `.protyle-content` | 官方样式为 `overflow: auto; flex: 1`，承载编辑器内容滚动。 |
| 编辑内容 | `.protyle-wysiwyg` | 承载块内容和官方 padding；打字机模式的底部留白属于这一层。 |

修改滚动样式时，应先确认实际滚动的元素，再决定调整宿主还是 Protyle 内容区。需要官方末尾留白时优先使用 `typewriterMode`，不要在项目 CSS 中复制一份固定高度或 `padding-bottom` 计算，以免与 Protyle 的 `setPadding()`、窗口尺寸变化和编辑器宽度计算冲突。

## Maintenance constraints

- 运行时行为以宿主 SiYuan 的 Protyle 实现为准；本地 `siyuan` 包的声明不能证明旧版宿主一定支持某个行为。
- 修改 `mode`、`action`、`typewriterMode` 或 `render` 参数时，同时检查普通日记、重复日记和文档销毁流程。
- 升级 SiYuan 兼容版本后，至少复核 `IProtyleOptions`、Protyle 初始化、`getPadding()`/`setPadding()` 及滚动事件实现。
- `typewriterMode` 是当前 Daily Note View 的固定交互选择；若未来需要跟随用户全局设置，应先定义设置来源和未设置时的默认行为。

## Upstream references

以下链接指向本次核对的 SiYuan 上游源码版本：

- [Protyle options and initialization](https://github.com/siyuan-note/siyuan/blob/eef10568384e2e7cf547adb029ae46a72e43c287/app/src/protyle/index.ts)
- [`setPadding()` and `getPadding()`](https://github.com/siyuan-note/siyuan/blob/eef10568384e2e7cf547adb029ae46a72e43c287/app/src/protyle/ui/initUI.ts)
- [Protyle content scrolling styles](https://github.com/siyuan-note/siyuan/blob/eef10568384e2e7cf547adb029ae46a72e43c287/app/src/assets/scss/protyle/_content.scss)
- [Protyle container and WYSIWYG styles](https://github.com/siyuan-note/siyuan/blob/eef10568384e2e7cf547adb029ae46a72e43c287/app/src/assets/scss/protyle/_protyle.scss)

