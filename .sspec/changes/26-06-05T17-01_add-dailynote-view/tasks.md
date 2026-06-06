---
change: "add-dailynote-view"
updated: "2026-06-06T00:47+08:00"
---

# Tasks

## Legend
`[ ]` Todo | `[x]` Done

## Tasks

### Phase 1: Dependency and type surface ✅
- [x] Update `package.json` and `pnpm-lock.yaml` to `@frostime/siyuan-plugin-kits@1.6.0+`.
- [x] Update `src/types/index.d.ts` with Daily Note View state/cell/lane types used by implementation.
- [x] Add i18n keys in `src/i18n/zh_CN.yaml`, `src/i18n/en_US.yaml`, and `src/types/i18n.d.ts` for view labels/states.
**Verification**: `pnpm build` succeeds after approving dependency build scripts.

### Phase 2: Coordinate resolver and view state ✅
- [x] Create `src/func/dailynote-view/state.ts` for default state, date/notebook shifting, preset application, and lane seed calculation per `design.md`.
- [x] Create `src/func/dailynote-view/resolver.ts` for read-only cell resolution and explicit creation per `design.md`.
- [x] Create `src/func/dailynote-view/index.ts` exports.
**Verification**: `pnpm build` passes; resolver separates read-only resolution from explicit creation.

### Phase 3: Custom tab hub and plugin wiring ✅
- [x] Create `src/func/dailynote-view/tab.ts` to register/open the custom tab and mount/unmount the Svelte root.
- [x] Update `src/index.ts` to initialize/release the Daily Note View hub.
- [x] Update `src/components/toolbar-menu.ts` to add an "Open Daily Note View" menu item while preserving direct-open notebook items.
**Verification**: `pnpm build` passes; runtime tab reuse still needs manual SiYuan verification.

### Phase 4: Content view UI ✅
- [x] Create `src/components/dailynote-view/daily-note-view.svelte` root component with mutually exclusive body rendering.
- [x] Create `src/components/dailynote-view/view-toolbar.svelte` for presets, date controls, notebook controls, axis/count controls.
- [x] Create `src/components/dailynote-view/content-lanes.svelte` and `daily-note-lane.svelte` for horizontal lane rendering.
- [x] Create `src/components/dailynote-view/protyle-host.svelte`, `missing-daily-note.svelte`, and `duplicate-daily-note.svelte`.
**Verification**: `pnpm build` passes; lane behavior still needs manual SiYuan verification.

### Phase 5: Calendar views and styling ✅
- [x] Create `src/components/dailynote-view/calendar-grid.svelte` for Week/Month status modes.
- [x] Add styles in component SCSS or `src/index.scss` for toolbar, horizontal lanes, Protyle host, missing/duplicate states, and calendar grid.
- [x] Ensure Calendar modes replace content lanes rather than displaying below them.
**Verification**: `pnpm build` passes; calendar click/mount behavior still needs manual SiYuan verification.

### Phase 6: Build and manual acceptance ⏳
- [ ] Run `pnpm build` and fix compile errors.
- [ ] Manually verify existing direct-open Daily Note behavior still works.
- [ ] Manually verify Daily Note View: Today, Three days, Notebooks, Week, Month, create missing DN, duplicate display.
- [ ] Update `tasks.md` progress and `memory.md` before review.
**Verification**: `pnpm build` succeeds; manual checklist passes; change status ready for Review.

### Feedback Tasks (→ [001-review-ui-and-protyle-fixes](./revisions/001-review-ui-and-protyle-fixes.md)) ✅
- [x] Add active visual state for the current view preset in `src/components/dailynote-view/view-toolbar.svelte`.
- [x] Re-layout toolbar controls into context-aware groups and hide meaningless controls for current mode/axis.
- [x] Change content lanes from fixed width to adaptive min-width grid in `src/components/dailynote-view/content-lanes.svelte` and `src/index.scss`.
- [x] Prevent anchor date navigation beyond today while allowing future lanes in centered multi-day views.
- [x] Add a non-writable future daily-note cell state instead of a create action for future cells.
- [x] Fix lane resolution lifecycle so missing/single/duplicate states survive prop updates.
- [x] Fix Protyle host lifecycle so it remounts when `docId` changes.
**Verification**: `pnpm build` succeeds; user screenshots need re-check in SiYuan runtime.

### Feedback Tasks (→ [002-calendar-cross-notebook-status](./revisions/002-calendar-cross-notebook-status.md)) ✅
- [x] Change Week view to a notebook-row × date-column status matrix.
- [x] Change Month view date cells to list notebook names with daily notes.
- [x] Query calendar status across all visible non-blacklisted notebooks.
- [x] Route calendar clicks to content mode with selected `date × notebook`.
- [x] Update calendar and toolbar styling so calendar modes do not imply filtering to one notebook.
**Verification**: `pnpm build` succeeds; Week/Month runtime behavior needs user re-check in SiYuan.

### Feedback Tasks (→ [003-configurable-lane-min-width](./revisions/003-configurable-lane-min-width.md)) ✅
- [x] Add persisted `DailyNoteViewLaneMinWidth` setting with `30rem` default.
- [x] Add Settings → Daily Note free-text input for lane minimum width.
- [x] Reject invalid CSS length input in the settings UI without overwriting the persisted value.
- [x] Bind content-lane CSS variable to the validated setting and update open lanes on setting changes.
- [x] Keep month cell overflow visible with the existing `+N` marker instead of adding a new limit setting.
**Verification**: `pnpm build` succeeds; settings UI/runtime width change needs user re-check in SiYuan.

### Feedback Tasks (→ [004-notebook-priority-and-compact-toolbar](./revisions/004-notebook-priority-and-compact-toolbar.md)) ✅
- [x] Prioritize notebook-axis lanes that already have a daily note for the anchor date.
- [x] Preserve original notebook order within existing/missing priority groups.
- [x] Change Daily Note View toolbar to a one-line default layout with wrapping fallback.
**Verification**: `pnpm build` succeeds; notebook priority and compact toolbar need user re-check in SiYuan.

---

## Progress

**Overall**: 83%

| Phase | Progress | Status |
|-------|----------|--------|
| Phase 1 | 100% | ✅ |
| Phase 2 | 100% | ✅ |
| Phase 3 | 100% | ✅ |
| Phase 4 | 100% | ✅ |
| Phase 5 | 100% | ✅ |
| Phase 6 | 0% | ⏳ |
| Feedback 001 | 100% | ✅ |
| Feedback 002 | 100% | ✅ |
| Feedback 003 | 100% | ✅ |
| Feedback 004 | 100% | ✅ |

**Recent**:
- [2026-06-05T17:40+08:00] Plan initialized after design approval.
- [2026-06-05T17:45+08:00] Phase 1 complete: dependency, types, i18n; `pnpm build` passes.
- [2026-06-05T17:47+08:00] Phase 2 complete: state helpers and coordinate resolver; `pnpm build` passes.
- [2026-06-05T17:55+08:00] Phases 3-5 complete: custom tab wiring, content lanes, calendar body, and styles; `pnpm build` passes.
- [2026-06-05T19:36+08:00] Feedback 001 complete: toolbar state/layout, adaptive lanes, future cells, lane refresh, and Protyle remount; `pnpm build` passes.
- [2026-06-05T20:34+08:00] Feedback 002 complete: Week/Month calendar views now show cross-notebook status; `pnpm build` passes.
- [2026-06-05T22:27+08:00] Feedback 003 complete: lane minimum width setting with CSS length validation added; `pnpm build` passes.
- [2026-06-06T00:47+08:00] Feedback 004 complete: notebook-axis lanes prioritize existing notes and toolbar defaults to one compact row; `pnpm build` passes.
