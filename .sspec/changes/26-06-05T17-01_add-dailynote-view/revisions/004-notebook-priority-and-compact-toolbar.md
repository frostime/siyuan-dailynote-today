---
revision: 4
date: 2026-06-06T00:41:14
trigger: review-feedback
---

# notebook-priority-and-compact-toolbar

## Reason

User feedback: when entering the Notebooks preset, notebooks that already have a daily note for the current anchor date should be shown first for practical navigation. User also observed that the Daily Note View toolbar currently consumes two rows with much empty space and requested a compact one-line default layout.

## Changes

### Spec Impact

- In content mode with `axis=notebook`, lanes SHOULD prioritize notebooks that already have a daily note for the anchor date, while preserving original notebook order within each priority group.
- Daily Note View toolbar SHOULD default to a single-row layout when horizontal space allows, with wrapping only as a responsive fallback.

### Design Impact

- The root Daily Note View component may asynchronously query the anchor date's daily-note status and reorder notebook-axis lane seeds after building the base lane list.
- The sorting rule is presentation-only; it does not change notebook order globally and does not affect time-axis lanes.
- Toolbar CSS changes from two-row grid layout to compact flex layout.

### Task Impact

Add feedback tasks in `tasks.md` for notebook-axis priority sorting, compact toolbar styling, and build verification.
