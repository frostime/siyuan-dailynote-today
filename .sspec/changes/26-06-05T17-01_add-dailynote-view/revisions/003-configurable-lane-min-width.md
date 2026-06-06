---
revision: 3
date: 2026-06-05T22:17:19
trigger: review-feedback
---

# configurable-lane-min-width

## Reason

User requested a settings item for the minimum width of Daily Note View multi-lane note columns, with free-text input validated by a whitelist regex. User also confirmed that month cells should keep showing `+N` when notebook labels exceed the display cap to avoid hiding information.

## Changes

### Spec Impact

- Daily Note View content lane minimum width is now user-configurable in Settings → Daily Note.
- The setting accepts only CSS length values matching `number + unit`, where unit is one of `px`, `rem`, `em`, `vw`, `%`.
- Invalid setting input MUST be rejected in the settings UI and MUST NOT overwrite the persisted valid value.
- Month calendar cells continue to show the first visible notebook labels plus `+N` for overflow.

### Design Impact

- Add a Daily Note View settings helper to normalize and validate lane minimum width.
- Persist `DailyNoteViewLaneMinWidth`, defaulting to `30rem`.
- Inject the setting into `.dnt-view__lanes` through `--dnt-view-lane-min-width`.
- Subscribe content lanes to setting updates so an open Daily Note View can react to setting changes without reopening the tab.

### Task Impact

Add feedback tasks in `tasks.md` for settings schema, settings UI validation, lane CSS variable binding, i18n/type updates, and build verification.
