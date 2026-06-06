---
name: add-dailynote-view
created: 2026-06-04 18:02:42
status: DOING
kind: directive
attach-change: .sspec/changes/26-06-05T17-01_add-dailynote-view/spec.md
tldr: ''
---
<!-- MUST follow frontmatter schema:
status: OPEN | DOING | DONE | CLOSED
tldr: One-sentence summary for list views — fill this! -->

# Request: add-dailynote-view

## Background
<!-- Current situation, background information -->
我最近看到了 Capacity ，觉得它在 Daily Note 的 Navigation 上做的不错

[参考效果] {
Image materials:

1. image-1
   Path: C:\Users\EEG\AppData\Local\Temp\agent-temp\images\web-20260604-180832-916171f8\images\001-image-1-img_1447e26432884592bcd1e6d67ed3b743.png

2. image-2
   Path: C:\Users\EEG\AppData\Local\Temp\agent-temp\images\web-20260604-180832-916171f8\images\002-image-2-img_29b5f5408f5d47c28fde6a11e7fbfb30.png
注意他支持多种视图，而且能很方便地在多个视图中切换，并且右上角有 `< >` 按钮也可以快速切换“哪一天”的日记
} => 如果 AGENT 觉得有必要，也可以检索网络看其他笔记软件是如何处理日记文档的


## Problem
<!-- What is not working or missing -->
思源中，各个文档使用 Tab 打开，在日记这种快速跨维度切换方便的用户体验没有那么丝滑。

而且思源中的日记还比较复杂，大部分的笔记软件，比如 Capacity， tana 等可能 daily note 就一个；而思源中则是“每个笔记本都有自己的DN”
相当于思源中的 DN 维度有两个：时间维度 + 笔记本维度。

切换是一个麻烦的事情，当前的插件仅仅在顶层提供了一个 Menu 菜单，让用户「打开/选择」当前的日记。但是这明显不够。

另外要考虑“当前没有写”的情况，如果 Date 没有日记，那么查看的是就应该有一种显示方式； —— 直接自动创建一个空白日记文档是不行的，这是 implict write。

## Initial Direction
<!-- Your rough idea or preferred direction — details are fine but not required.
This becomes the starting point for the change's spec.md Approach. -->
思考仿照 Capacity 的思路吗，插件注册一个 Custom 的 Tab View，方便展示 Document 的内容和 Navigate。

这方面可以参考 H:\SrcCode\开源项目\sy-docs-flow ，使用 Protyle 对象来构造一个东西思源 wysiwyg 编辑区域，包裹在 Tab 组件中。

## Success Criteria
<!-- Conditions that indicate the problem has been resolved and meets the user's intention -->

从用户角度出发，使用日记起来更加方便了。

---

## @AGENT
<!-- What should Agent do to implement this request -->
Adhere to the SSPEC protocol and commence development from the current Request file, following the SSPEC Change Lifecycle.
Next step: Read `sspec-clarify` SKILL and talk to user about the problem.
