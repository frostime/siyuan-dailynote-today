---
revision: 1
date: 2026-06-05T19:21:30
trigger: review-feedback
---

# review-ui-and-protyle-fixes

## Reason

User review found Daily Note View rendered but failed acceptance in toolbar clarity, lane sizing, future-date navigation, missing/future daily-note states, and Protyle stability after date shifts.

## Changes

### Spec Impact

The feature still remains a Daily Note View custom tab over `date × notebook`, but acceptance now additionally requires:

- The toolbar MUST visually indicate the active view mode/preset.
- The toolbar SHOULD hide or disable controls that are irrelevant to the current mode/axis.
- Date navigation MUST NOT move the anchor date beyond today.
- Content lanes MUST fill available width and only overflow horizontally when the container cannot satisfy each lane's minimum width.
- Future daily-note cells MAY appear in multi-day views as a special non-writable marker; they MUST NOT show a create button.
- Lane resolution and Protyle mounting MUST remain stable when lane props/state change.

### Design Impact

- Content lane sizing changes from fixed basis (`flex: 0 0 ...`) to adaptive grid columns: `repeat(laneCount, minmax(minWidth, 1fr))` with horizontal overflow only when `laneCount × minWidth` exceeds available width.
- `DailyNoteCell` adds a `future` display state for dates after today.
- `DailyNoteLane` must not mutate its exported `lane` prop to store resolution results. It must keep local `cell/loading/resolvedKey` state and refresh when `lane.key` changes.
- `ProtyleHost` must reload/destroy Protyle when `docId` changes.
- Toolbar controls are grouped by responsibility: view preset, date, notebook, and content-axis options.

### Task Impact

Add feedback tasks in `tasks.md` for toolbar state/layout, adaptive lane sizing, future-date handling, lane resolution lifecycle, and Protyle remount behavior.
