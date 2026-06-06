---
name: dnt-toolbar-redesign
status: DONE
change-type: single
created: 2026-06-06T20:39:29
reference: null
---

# dnt-toolbar-redesign

## Problem Statement

Daily Note View 的顶部工具栏功能可用但交互毛糙，核心是三个结构性问题：

1. **概念错位**：`state.mode` 把 `content` / `week` / `month` 平铺成三态，但 `content` 是「渲染形态」，而 `week`/`month` 实为「日历形态的跨度参数」。导致 5 个语义不对等的 preset 按钮被压成一排。
2. **双入口状态脱节**：preset 按钮组与下方 `axis`/`count` 裸 select 是同一组状态的两个入口，靠 `activePreset` 反推高亮，易脱节。
3. **空间跳动**：`showNotebookSelector` / `showContentOptions` 条件显隐导致工具栏宽度跳变、换行重排。

附带语义缺陷：笔记本轴 `count=3/5` 时 `centeredNotebookWindow` 取「中心窗口」，只加载相邻两三个笔记本，行为怪异。

## Proposed Solution

### Approach

采用分层结构（对比 HTML 报告中的方案 A）：顶层 segmented 只切「内容 / 日历」，将 week/month 降级为日历形态内的「跨度」子切换。日期导航固定居中不漂移。右侧上下文区在固定容器内按形态切换控件，消除空间跳动。

由于 DailyNoteView 状态**无任何外部持久化**（`tab.ts` 每次打开都用 `defaultDailyNoteViewState()`，无 saveData/loadData），`mode` 纯属内部运行时状态，可自由重塑。重塑为「形态 + 各形态独立子配置」，使「切 form 不丢子配置」「记住上次子配置」天然成立。

替代方案：方案 B(preset 主导+参数面板) 仍保留不对等 preset 平铺；方案 C(双行) 占用两行高度压缩内容区。均不如 A 直接修正概念错位。

### Key Change

**Refactor A: 状态模型重塑**
将 `DailyNoteViewState` 从 `{mode, anchorDate, anchorNotebookId, axis, count}` 重塑为形态分层结构。`mode` 三态 → `form: 'content'|'calendar'`；各形态子配置独立字段。删除 `applyPreset`、`centeredNotebookWindow`。详见 design.md「State Model」。

**Refactor B: 笔记本轴语义修正**
笔记本轴的 `count` 离散窗口语义改为 `notebookScope: 'single'|'all'`：`single` 渲染单个 anchor 笔记本(可切换)，`all` 渲染全部 visibleNotebooks。消除「只加载两三个」的怪异行为。

**Feat C: 分层工具栏 UI**
重写 `view-toolbar.svelte`：顶层 `[内容|日历]` segmented + 固定日期导航 + 今日键 + 右侧固定上下文区。去掉旧 preset 排与冗余 mode-chip。控件清单见 design.md「Toolbar Layout」。

**Feat D: 控件组件化**
新增 segmented 控件样式（替代裸 select）。时间轴天数用 segmented `1 2 3 5`（当前实现）；笔记本轴用 segmented `单个|全部`；日历用 segmented `周|月`。
时间轴「自由步进 stepper」作为**注释保留**在组件中，便于未来切换。

**Chore E: i18n 补全**
补 `Axis`/`Time`/`Notebook(轴)`/`Single`/`All`/`Span`/`Days` 等控件文案；移除不再使用的 `ThreeDays`/`Expand`/`Count` 等 key（若无其他引用）。

### Scope Summary

| File | Change |
|------|--------|
| `src/types/index.d.ts` | Refactor A: 重定义 `DailyNoteViewState`、新增 `DailyNoteViewForm` 等类型，删 `DailyNoteViewMode`/`Axis`/`Count` |
| `src/func/dailynote-view/state.ts` | Refactor A+B: 改 `defaultDailyNoteViewState`/`buildLaneSeeds`，删 `applyPreset`/`centeredNotebookWindow`，新增 form/scope 辅助 |
| `src/components/dailynote-view/view-toolbar.svelte` | Feat C+D: 完全重写工具栏 |
| `src/components/dailynote-view/daily-note-view.svelte` | Refactor A: 适配新 state 字段与事件（删 `setPreset`/`applyPreset` 调用，改 calendar 分支判断） |
| `src/components/dailynote-view/calendar-grid.svelte` | Refactor A: `mode` prop 改为 `span`('week'/'month') |
| `src/index.scss` | Feat C+D: 新增 segmented/datenav 样式，调整 toolbar 布局，清理无用 class |
| `src/i18n/zh_CN.yaml` / `en_US.yaml` | Chore E: 增删控件文案 |
| `src/types/i18n.d.ts` | Chore E: 同步 `DailyNoteView` interface 字段（手维护，无自动生成） |

### What Stays Unchanged

- `content-lanes.svelte` / `daily-note-lane.svelte` / `protyle-host.svelte` / `missing-daily-note.svelte` / `duplicate-daily-note.svelte`：lane 渲染逻辑不动（仅消费 LaneSeed，不感知工具栏）。
- `tab.ts`：无持久化，不动。
- `resolver.ts`：cell 解析逻辑不动。
- LaneSeed 结构不变。

### Design Reference

→ See [design.md](./design.md)
