---
name: Glossary
description: Chinese-English terminology map for project-specific daily-note, notebook, reservation, duplicate-handling, and build terms.
updated: 2026-06-04
scope:
  - /README.md
  - /README_en_US.md
  - /plugin.json
  - /src/types/index.d.ts
  - /src/global-status.ts
  - /src/global-notebooks.ts
  - /src/func/**
  - /src/components/**
  - /vite.config.ts
---

# Glossary

<!-- MUST update 'updated' field when modifying.
Structure: start with Overview, then invent sections that fit the content.
See write-spec-doc SKILL for examples and style guide. -->

## Overview

This glossary defines project-specific terms in Chinese and English. It omits generic SiYuan concepts whose meaning is obvious from SiYuan itself, such as block, document, notebook, or plugin, unless the project gives the term a narrower contract.

## Naming Rules

| 中文术语 / Chinese signifier | English term | 所指 / Referent |
|---|---|---|
| 今日笔记 | Daily Note Today | The plugin product/display name. It is not a document. |
| 今日日记 | today's daily note | The daily-note document for the local current date. |
| 日记 / Daily Note / DN | daily note / DN | A SiYuan daily-note document for a specific notebook and date. |
| 预约 | reservation | A source block marked with `custom-reservation=YYYYMMDD`. |
| 预约块 | reserved block | The original user block carrying `custom-reservation`; avoid using this for generated summary blocks. |
| 预约汇总块 | retrieval block / Retv block | The generated block inserted into a daily note to surface reservations. |

## Daily-note Terms

| 中文术语 | English term | 所指 / Referent | Source |
|---|---|---|---|
| 默认笔记本 | default notebook | Notebook opened by startup auto-open and Alt+5 replacement; configured by notebook ID, empty means first open non-guide notebook returned by SiYuan. | `/src/global-notebooks.ts`, `/src/global-status.ts` |
| 笔记本黑名单 | notebook blacklist | Settings map that hides selected notebooks from toolbar/move menus; default notebook is kept out of the blacklist. | `/src/global-status.ts`, `/src/components/blacklist.svelte` |
| 运行时笔记本 | runtime notebook | A SiYuan notebook object enriched by this plugin with `dailynoteSprig`, `dailynoteHpath`, and sometimes `dailyNoteDocId`. | `/src/types/index.d.ts`, `/src/func/misc.ts` |
| 日记路径模板 | daily-note Sprig | Notebook daily-note path template from SiYuan notebook config, or project fallback template. | `/src/func/misc.ts` |
| 日记人类路径 | daily-note hpath | Today's rendered human-readable path for a notebook's daily-note Sprig. | `/src/func/misc.ts` |
| 日记文档 ID | `dailyNoteDocId` | Runtime field storing today's daily-note document ID when known. Reservation insertion depends on it. | `/src/types/index.d.ts`, `/src/func/misc.ts`, `/src/func/dailynote/open-dn.ts` |
| 日记自定义属性 | daily-note custom attribute | `custom-dailynote-YYYYMMDD=YYYYMMDD`; used to distinguish daily notes from normal documents. | `/src/func/dailynote/dn-attr.ts` |
| 补充过去日记属性 | past DN attribute repair | Compatibility function that sets missing `custom-dailynote-YYYYMMDD` attributes for historical daily notes. | `/src/components/set-past-dn-attr.ts`, `/src/func/dailynote/past-dn.ts` |

## Duplicate Daily-note Terms

| 中文术语 | English term | 所指 / Referent | Source |
|---|---|---|---|
| 重复日记 | duplicate daily note | More than one document found for the default notebook's current daily-note hpath. | `/src/func/dailynote/handle-duplicate.ts` |
| 主日记 | main daily note | Earliest-created document among duplicates; duplicate handlers preserve/open it. | `/src/func/dailynote/handle-duplicate.ts` |
| 重复文档 | duplicate document | Any duplicate daily-note document other than the main daily note. | `/src/func/dailynote/handle-duplicate.ts` |
| 全部合并 | merge all duplicates / `AllMerge` | Add conflict heading to main note, rename duplicates with creation timestamp, and convert duplicates to headings under main note. | `/src/func/dailynote/handle-duplicate.ts` |
| 直接删除 | delete duplicates / `DeleteDup` | Remove all duplicate documents except the main daily note. | `/src/func/dailynote/handle-duplicate.ts` |
| 智能合并 | smart merge / `SmartMerge` | Delete empty or unmodified duplicates; merge the rest into the main daily note. | `/src/func/dailynote/handle-duplicate.ts` |
| 移动到回收站 | move duplicates to trash / `TrashDup` | Move duplicates under the trash-bin document and clear `custom-dailynote-*` attrs on duplicates. | `/src/func/dailynote/handle-duplicate.ts` |
| 回收站文档 | trash-bin document | Document marked `custom-dn-trash-bin` where `TrashDup` moves duplicate documents. | `/src/func/dailynote/handle-duplicate.ts` |

## Reservation Terms

| 中文术语 | English term | 所指 / Referent | Source |
|---|---|---|---|
| 预约 | reservation | Scheduling a source block for a local date by setting `custom-reservation=YYYYMMDD`. | `/src/func/reserve/reserve.ts` |
| 预约块 | reserved block | The original user block carrying `custom-reservation`. | `/src/func/reserve/reserve.ts`, `/src/func/reserve/retrieve.ts` |
| 预约日期 | reservation date | Local date encoded as `YYYYMMDD` by `reservationAttrVal`. | `/src/func/reserve/index.ts` |
| 预约备注 | reservation memo | Block `memo` attribute set to localized reservation label plus `YYYYMMDD`. | `/src/func/reserve/reserve.ts` |
| 取消预约 | de-reserve / cancel reservation | Clearing `custom-reservation` and `memo` on a reserved block. | `/src/func/reserve/reserve.ts` |
| 日期匹配规则 | `DatePatternRules` | Project-specific date matchers applied before `chrono-node`. | `/src/func/reserve/reserve.ts` |
| 今日预约 | today reservations | Reserved blocks whose `custom-reservation` equals local today. | `/src/func/reserve/retrieve.ts` |
| 未来预约 | future reservations | Reserved blocks whose `custom-reservation` is greater than or equal to local today. | `/src/func/reserve/retrieve.ts` |
| 预约汇总 / 检索结果 | retrieve / Retv | Generated representation of reservations inserted into a daily note. | `/src/func/reserve/retrieve.ts` |
| 预约汇总块 | retrieval block | The inserted block marked `name=Reservation` and `breadcrumb=true`. | `/src/func/reserve/retrieve.ts` |
| 汇总类型 | retrieval type / `RetvType` | Setting selecting retrieval format: `embed`, `link`, or `ref`. | `/src/types/index.d.ts`, `/src/func/reserve/retrieve.ts` |
| 汇总位置 | retrieval position / `RetvPosition` | Setting selecting insertion position: `top` or `bottom`. | `/src/types/index.d.ts`, `/src/func/reserve/retrieve.ts` |
| 预约面板 | reservation Dock | Dock tab listing reservations grouped by date. | `/src/components/dock-reserve.svelte` |

## Runtime and Build Terms

| 中文术语 | English term | 所指 / Referent | Source |
|---|---|---|---|
| 设置管理器 | settings manager | The singleton `settings` object that loads/saves plugin settings. | `/src/global-status.ts` |
| 设置文件 | setting file | Persisted plugin settings file `DailyNoteToday.json.txt`. | `/src/global-status.ts` |
| 本地事件总线 | local eventBus | Compatibility event bus exported as `eventBus`; separate from SiYuan plugin `eventBus`. | `/src/event-bus.ts`, `/src/index.ts` |
| 顶栏菜单 | toolbar menu | Top-bar plugin icon and menus managed by `ToolbarMenuItem`. | `/src/components/toolbar-menu.ts` |
| 块图标菜单 | gutter menu | Menu entries added to SiYuan block/document icon menus. | `/src/components/gutter-menu.ts` |
| 源 i18n | source i18n | YAML dictionaries under `src/i18n/*.yaml`. | `/src/i18n/zh_CN.yaml`, `/src/i18n/en_US.yaml` |
| 生成的 i18n JSON | generated i18n JSON | JSON written to build output by `yaml-plugin.js`. | `/yaml-plugin.js`, `/vite.config.ts` |
| 开发输出目录 | development output / `dev/` | Development plugin output directory used by watch build and dev symlink. | `/vite.config.ts`, `/scripts/make_dev_link.js` |
| 生产输出目录 | production output / `dist/` | Production plugin output directory. | `/vite.config.ts`, `/scripts/make_install.js` |
| 发布压缩包 | release artifact / `package.zip` | Release artifact generated from `dist/` during production build. | `/vite.config.ts`, `/.github/workflows/deploy.yml` |

## Ambiguous Terms to Avoid

| Ambiguous signifier | Preferred Chinese | Preferred English |
|---|---|---|
| 笔记 / note | 日记、文档、块，按实际所指选择 | daily note, document, or block |
| 今日笔记 | 插件：今日笔记；文档：今日日记 | plugin: Daily Note Today; document: today's daily note |
| 预约块 | 源块：预约块；生成块：预约汇总块 | source: reserved block; generated block: retrieval block |
| 笔记本路径 | 内核路径：`path`；人类路径：`hpath` | kernel path: `path`; human path: `hpath` |
| event bus | 本地事件总线 / 思源插件事件总线 | local eventBus / SiYuan plugin eventBus |
