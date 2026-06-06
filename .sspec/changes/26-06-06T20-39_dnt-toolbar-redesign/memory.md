# Memory: dnt-toolbar-redesign

**Updated**: <!-- ISO timestamp, minute precision -->

## Git Baseline (Immutable)
<!-- Captured during `sspec change new` before any change files are written.
This section records the change starting point in git and MUST NOT be edited or refreshed later. -->

- Captured: before change file creation
- Repository: `H:/SrcCode/开源项目/siyuan-dailynote-today`
- Branch: `main`
- HEAD: `dde99a81c5fa2c0c30bacd667e0ccee4435f32c2`
- Worktree: `clean`
- Status Snapshot: raw `git status --short --branch` output

```text
## main...origin/main
```

## State
<!-- Where we are and what's next — one to three lines.
This is the resume entry point; the first section an agent reads on cold start. -->

DONE. 工具栏重构全部落地，build 绿，审查修复完成，用户验证通过，待 commit。

## Key Files
<!-- Files critical to understanding/continuing this change.
- `path/file` — what it contains, why it matters -->

- `.sspec/tmp/toolbar-redesign-compare.html` — 可交互方案对比报告，方案 A 为选定方向
- `src/func/dailynote-view/state.ts` — 状态模型 + buildLaneSeeds，Refactor A/B 主战场
- `src/components/dailynote-view/view-toolbar.svelte` — 工具栏，完全重写
- `src/types/index.d.ts` (L97-117) — DailyNoteViewState 类型定义
- `src/types/i18n.d.ts` — 手维护的 i18n interface，需同步
- `src/index.scss` (L1-323) — dnt-view 全部样式

## Knowledge
<!-- MUST apply write-gate: "If this item were lost, would the next agent make a wrong decision?"
Yes → write it. No → skip.

Target reader: a cold-starting agent that can only see spec + design + tasks + this Knowledge.
Exclude: anything already covered by spec/design/tasks (no restating).
Include: rejected approaches with reasons, implicit constraints, user preferences, API/env traps, insights that shaped design choices.

Format: - [timestamp] [Type] content
Types: Decision | Constraint | Gotcha | Rejected | Insight
  Decision  = directional choice made (with rationale)
  Constraint = hard limit imposed externally or by user
  Gotcha     = trap invisible without reading code/docs
  Rejected   = approach considered and discarded (with why — prevents successor from re-trying)
  Insight    = finding that shaped understanding but is not itself a decision

Project-level discoveries → ALSO append to project.md Notes.
Obsolete items → mark [obsolete: timestamp], never silently delete. -->

- [2026-06-06T20:41+08:00] [Constraint] DailyNoteView 状态无任何外部持久化：tab.ts 每次 open 都用 defaultDailyNoteViewState()，无 saveData/loadData。故 mode 是纯内部运行时状态，重构无外部兼容成本。
- [2026-06-06T20:41+08:00] [Decision] mode 三态(content/week/month)重塑为 form 二态(content/calendar) + 各形态独立子配置字段。理由：week/month 实为日历跨度参数，与 content 不对等。
- [2026-06-06T20:41+08:00] [Decision] 笔记本轴语义由 count 离散窗口(centeredNotebookWindow 取中心 N 个)改为 notebookScope:'single'|'all'。用户指出旧的「只加载两三个笔记本」怪异。
- [2026-06-06T20:41+08:00] [Decision] 时间轴天数用 segmented(1/2/3/5)；自由步进 stepper 以注释形式保留在组件中（用户要求便于未来切换）。
- [2026-06-06T20:41+08:00] [Constraint] src/types/i18n.d.ts 是手维护的（无 auto-gen 标记），改 i18n 必须同步它。i18n 源是 src/i18n/*.yaml，非 JSON。
- [2026-06-06T20:41+08:00] [Gotcha] DailyNoteView.Notebooks 被 calendar-grid.svelte 使用，不可删；可删的是 ThreeDays/Expand/Count/CalendarMode/ContentMode（仅 view-toolbar 引用，将被重写）。
- [2026-06-06T20:41+08:00] [Rejected] 方案 B(preset+参数面板)、方案 C(双行) 均被否：B 仍保留不对等 preset 平铺，C 占两行压缩内容区。

## Milestones
<!-- MUST append one line per session. Pure facts; new entries appended at the end.
CLI treats the last valid bullet as the latest milestone.
- [ISO timestamp] one-sentence summary -->

- [2026-06-06T20:41+08:00] 完成 UI/UX 分析 + 方案对比 HTML 报告，用户选定方案 A，建 change 并填好 spec.md/design.md，待 @align gate。
- [2026-06-06] Phase 1-5 实现完成，`pnpm build` 绿；gpt-5.5 子代理审查出 single 轴 anchor fallback (Major) + 多余 Axis key (Minor)，均已修；stepper 注释按预留意图保留；用户验证通过，版本提 1.9.1，标 DONE。
