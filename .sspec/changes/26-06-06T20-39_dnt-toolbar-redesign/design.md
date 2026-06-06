---
change: "dnt-toolbar-redesign"
created: 2026-06-06T20:39:29
---

# Design: dnt-toolbar-redesign

## 1. State Model

### Before

```ts
type DailyNoteViewMode = 'content' | 'week' | 'month';
type DailyNoteViewAxis = 'time' | 'notebook';
type DailyNoteViewCount = 1 | 3 | 5 | 'all';
type DailyNoteViewState = {
    mode: DailyNoteViewMode;
    anchorDate: Date;
    anchorNotebookId: NotebookId;
    axis: DailyNoteViewAxis;
    count: DailyNoteViewCount;
};
```

### After

```ts
type DailyNoteViewForm = 'content' | 'calendar';
type DailyNoteViewAxis = 'time' | 'notebook';
type DailyNoteViewTimeCount = 1 | 2 | 3 | 5;          // 时间轴：天数
type DailyNoteViewNotebookScope = 'single' | 'all';   // 笔记本轴：范围
type DailyNoteViewSpan = 'week' | 'month';            // 日历：跨度

type DailyNoteViewState = {
    form: DailyNoteViewForm;
    anchorDate: Date;
    anchorNotebookId: NotebookId;
    // content-form sub-config (retained across form switches)
    axis: DailyNoteViewAxis;
    timeCount: DailyNoteViewTimeCount;
    notebookScope: DailyNoteViewNotebookScope;
    // calendar-form sub-config
    span: DailyNoteViewSpan;
};
```

子配置全部为独立字段 → 切 `form` 不丢；「记住各形态上次子配置」天然成立（同一 state 对象持有所有维度，切 form 只读不写其它字段）。

### Default

```ts
function defaultDailyNoteViewState(): DailyNoteViewState {
    const notebook = notebooks.default || notebooks.get(0);
    return {
        form: 'content',
        anchorDate: todayDate(),
        anchorNotebookId: notebook?.id,
        axis: 'time',
        timeCount: 1,
        notebookScope: 'all',
        span: 'week',
    };
}
```

## 2. buildLaneSeeds

### Behavioral Spec

```
buildLaneSeeds(state):
  form !== 'content'          → []                        (calendar 不产 lane)
  axis === 'time':
      count = timeCount (1|2|3|5)
      startOffset = -floor((count-1)/2)                   (居中：3→[-1,0,+1])
      lanes = [anchorDate+startOffset .. +count-1] × anchorNotebook
  axis === 'notebook':
      scope === 'single' → [anchorNotebook]               (单栏，可切换)
      scope === 'all'    → visibleNotebooks()             (全部)
      每栏 date = anchorDate
```

删除 `centeredNotebookWindow`（笔记本中心窗口语义废弃）与 `applyPreset`（preset 入口废弃）。
`numericCount` 简化为直接读 `timeCount`（已是 1|2|3|5，无需归一）。

注：当前 timeCount 不含 4，沿用原 1/3/5 并补 2（用户要求 1 2 3 5）。

## 3. Toolbar Layout

### Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│ [内容│日历]  │  ‹  2024-06-06  ›  [今日]   ····spacer····  «上下文区» │
└─────────────────────────────────────────────────────────────────────┘
   form seg     divider   date nav (固定居中)              固定容器，按 form 换内容
```

固定容器 = 始终存在的 `.dnt-view__ctx` 槽位，内部按 form 切换，避免整条 toolbar 重排。

### Context Zone (by form)

| form | axis/state | 控件 |
|------|-----------|------|
| content | axis=time | `[时间轴│笔记本轴]` seg · `天数 [1│2│3│5]` seg · `笔记本 ▾`(select) |
| content | axis=notebook | `[时间轴│笔记本轴]` seg · `范围 [单个│全部]` seg · scope=single 时显示 `笔记本 ▾` |
| calendar | —          | `跨度 [周│月]` seg |

笔记本选择器显隐规则：`axis==='time'` 或 `(axis==='notebook' && scope==='single')` 时显示。

### Date Nav Behavior

```
‹ / ›  shiftDate(∓1):
   content → ±1 day
   calendar+week → ±7 day
   calendar+month → ±1 month
今日键 disabled 条件：当前周期已含今日 (按 form/span 判断，沿用现有 isCurrentPeriod 逻辑)
› 前进键 disabled 条件：前进后越过今日 (沿用现有 canShiftDateForward)
periodLabel：content/week→日期或区间；month→YYYY-MM
```

shift 的周期判断逻辑从「mode」改读「form + span」，但算法不变（startOfWeek/addMonths 等保留）。

## 4. Component Annotation (Feat D)

时间轴天数控件落地为 segmented `1 2 3 5`。组件内**注释保留**自由步进 stepper 实现：

```svelte
<!-- 时间轴天数：当前用离散 segmented (1/2/3/5)。
     若未来需要自由步进，取消下方注释并移除上方 segmented：
<div class="stepper">
  <button on:click={() => setTimeCount(state.timeCount - 1)}>−</button>
  <span>{state.timeCount}</span>
  <button on:click={() => setTimeCount(state.timeCount + 1)}>+</button>
</div>
-->
<div class="seg">
  {#each [1,2,3,5] as n}
    <button class:on={state.timeCount===n} on:click={() => set('timeCount', n)}>{n}</button>
  {/each}
</div>
```

## 5. calendar-grid Prop Migration

```
Before: export let mode: Extract<DailyNoteViewMode,'week'|'month'>
After:  export let span: 'week' | 'month'
```

`daily-note-view.svelte` 分支：
```
Before: {#if state.mode === 'content'} ... {:else} <CalendarGrid mode={state.mode} .../>
After:  {#if state.form === 'content'} ... {:else} <CalendarGrid span={state.span} .../>
```
`selectCalendarDate` 事件回写：`mode:'content'` → `form:'content'`，并设 `axis:'time', timeCount:1`。

## 6. i18n Delta

```yaml
# 新增 (zh_CN / en_US)
DailyNoteView:
  Content: 内容 / Content          # form seg
  Calendar: 日历 / Calendar        # form seg
  Axis: 展开 / Expand              # axis seg label
  TimeAxis: 时间轴 / By Date
  NotebookAxis: 笔记本轴 / By Notebook
  Days: 天数 / Days                # timeCount seg label
  Scope: 范围 / Scope              # notebookScope seg label
  ScopeSingle: 单个 / Single
  ScopeAll: 全部 / All
  Span: 跨度 / Span                # calendar span seg label
# 移除 (确认无其它引用后): ThreeDays, Expand, Count, CalendarMode, ContentMode
# 保留: Week, Month, Notebook, Today, Future, Missing, Duplicate, exists, title 等
```

移除前必须 `rg` 确认无其它文件引用。
