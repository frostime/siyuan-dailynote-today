---
revision: 2
date: 2026-06-05T19:40:00
trigger: review-feedback
---

# calendar-cross-notebook-status

## Reason

User review proposed that calendar views should expose the notebook dimension instead of showing a single generic DN marker for only the anchor notebook. This better matches the feature's core `date × notebook` model.

## Changes

### Spec Impact

Calendar status views now require cross-notebook visibility:

- Week view MUST show visible notebooks as rows and days as columns.
- Month view MUST show notebook names inside each date cell when those notebooks have daily notes.
- Calendar status queries MUST cover all visible non-blacklisted notebooks in the displayed date range.
- Clicking a week cell or a month notebook label SHOULD route to content mode with the selected `date × notebook` coordinate.

### Design Impact

- Replace calendar status model from `Map<date, status>` for one notebook to grouped status by both date and notebook.
- Week layout changes from a seven-day grid to a notebook-row matrix.
- Month layout keeps the month grid but cell content changes from generic `DN` markers to per-notebook labels.
- Toolbar notebook navigation is not meaningful for calendar status modes and should not imply calendar is filtered to one notebook.

### Task Impact

Add feedback tasks in `tasks.md` for cross-notebook calendar data grouping, week matrix layout, month notebook labels, and calendar click routing.
