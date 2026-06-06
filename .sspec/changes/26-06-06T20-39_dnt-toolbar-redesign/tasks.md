---
change: "dnt-toolbar-redesign"
updated: "2026-06-06T20:41+08:00"
---

# Tasks

## Legend
`[ ]` Todo | `[x]` Done

## Tasks

### Phase 1: 类型与状态层 ⏳
- [x] 重定义类型 per design §1 `src/types/index.d.ts`：新增 `DailyNoteViewForm`/`DailyNoteViewTimeCount`/`DailyNoteViewNotebookScope`/`DailyNoteViewSpan`，重写 `DailyNoteViewState`，删 `DailyNoteViewMode`/`DailyNoteViewCount`
- [x] 改 `defaultDailyNoteViewState` per design §1 `src/func/dailynote-view/state.ts`
- [x] 重写 `buildLaneSeeds` per design §2，删 `applyPreset`/`centeredNotebookWindow`/`numericCount` `src/func/dailynote-view/state.ts`
- [x] 检查 state.ts 残留导出引用（`shiftNotebook` 等保留项）
**Verification**: `pnpm build`（或 `tsc --noEmit`）类型层无报错；`rg "applyPreset|centeredNotebookWindow|DailyNoteViewMode" src` 仅余预期

### Phase 2: 组件适配 ⏳
- [x] 重写工具栏 per design §3 `src/components/dailynote-view/view-toolbar.svelte`：form seg + 固定日期导航 + 上下文区；segmented 控件 + stepper 注释 (Feat D, design §4)
- [x] 适配主视图 per design §5 `src/components/dailynote-view/daily-note-view.svelte`：`state.mode`→`state.form`，删 `setPreset`，`selectCalendarDate` 回写新字段
- [x] calendar-grid prop `mode`→`span` per design §5 `src/components/dailynote-view/calendar-grid.svelte`
**Verification**: `pnpm build` 无 svelte/ts 报错；grep 确认无残留 `state.mode`/`dispatch('preset'`

### Phase 3: 样式 ⏳
- [x] 新增 segmented / datenav 样式，调整 `.dnt-view__toolbar` 布局，移除旧 preset/control-group/mode-chip 相关无用 class `src/index.scss`
**Verification**: `pnpm build` 通过；视觉自检（toolbar 不换行、上下文区切换不跳动）

### Phase 4: i18n ⏳
- [x] 增删 zh_CN/en_US 文案 per design §6 `src/i18n/zh_CN.yaml` `src/i18n/en_US.yaml`
- [x] 同步手维护 interface `src/types/i18n.d.ts`
**Verification**: `pnpm build` 通过；`rg "DailyNoteView\.(ThreeDays|Expand|Count|CalendarMode|ContentMode)" src` 零结果 ✓

### Phase 5: 集成验证 ⏳
- [x] full `pnpm build` 通过
- [x] 自检四态切换：内容·时间轴(1/2/3/5)、内容·笔记本轴(单个/全部)、日历·周、日历·月；日期导航 ‹›/今日 边界（用户在 SiYuan 中验证通过）
- [x] 子代理代码审查（codex-for-me/gpt-5.5）：修 Major(single 轴 anchor fallback) + 删多余 Axis key；stepper 注释按预留意图保留；重构后 `pnpm build` 绿
- [x] 清理 `.sspec/tmp/toolbar-redesign-compare.html`（用户同意保留，不删）
**Verification**: build 绿；手动走查无控制台报错；状态切换不丢子配置

---

## Progress

**Overall**: 100%

| Phase | Progress | Status |
|-------|----------|--------|
| Phase 1: 类型与状态 | 100% | ✅ |
| Phase 2: 组件适配 | 100% | ✅ |
| Phase 3: 样式 | 100% | ✅ |
| Phase 4: i18n | 100% | ✅ |
| Phase 5: 集成验证 | 100% | ✅ |

**Recent**:
- [2026-06-06] Phase 1-4 完成，`pnpm build` 绿
- [2026-06-06] 子代理审查修复(single 轴 fallback + 删多余 Axis key)，用户验证通过，标 DONE
