---
name: add-dailynote-view
status: DOING
change-type: single
created: 2026-06-05 17:01:37
reference:
- source: .sspec/requests/26-06-04T18-02_add-dailynote-view.md
  type: request
  note: Linked from request
---
<!-- MUST follow frontmatter schema:
status: PLANNING | DOING | REVIEW | DONE | BLOCKED
change-type: single | sub
reference?: Array<{source, type: 'request'|'root-change'|'sub-change'|'prev-change'|'doc'|'revision', note?}>

Sub-change MUST link root:
reference:
  - source: ".sspec/changes/<root-change-dir>"
    type: "root-change"
    note: "Phase <n>: <phase-name>"

Single-change common reference:
reference:
  - source: ".sspec/requests/<request-file>.md"
    type: "request"
  - source: ".sspec/changes/<change-dir>"
    type: "prev-change"
    note: "Follow-up to <change-name>."
-->

# add-dailynote-view

## Problem Statement

<!-- Quantify impact. Format: "[metric] causing [impact]".
Simple: single paragraph. Complex: split into "Current state" + "User need". -->

Daily Note in SiYuan has a two-dimensional address space (`date × notebook`) but the plugin currently exposes it mainly as a one-shot "open/create today's daily note in a notebook" menu, causing cross-date and cross-notebook workflows to require repeated document-tab switching and risking accidental writes if missing daily notes are opened through create-oriented flows.

## Proposed Solution

### Approach
<!-- Core solution (1-3 paragraphs) + why this approach over alternatives -->

Add a desktop custom tab named **Daily Note View**. The tab is a coordinate navigator over `date × notebook`: it keeps an anchor date, an anchor notebook, a view mode, an expansion axis, and an expansion count. It resolves daily-note existence before rendering, so navigation is read-only until the user explicitly clicks **Create Daily Note**.

The content view uses horizontal lanes. `axis=time` shows several dates for one notebook; `axis=notebook` shows several notebooks for one date. This treats "Day", "Three days", and "Multi-notebook" as presets over the same model instead of hard-coding Capacity-style view names. Week and Month are calendar/status views: they show daily-note presence and route clicks back to the content view; they do not embed Protyle editors.

Use `@frostime/siyuan-plugin-kits` daily-note helpers from version `1.6.0+` for arbitrary-date create/search/path rendering. Existing open-today, reservation, move, auto-open, and duplicate-handling flows remain independent.

### Key Change
<!-- MUST label each independent change item as **Type Label: Title**.
Examples: **Fix A: Request linking** / **Feat B: Cache TTL jitter**
tasks.md references these labels — MUST NOT copy the design description.
If scope boundary is unclear, add a "What Stays Unchanged" block after Scope Summary.
Fence nesting: when showing content containing ```, outer fence MUST use more backticks (outer > inner). -->

**Feat A: Daily Note View custom tab**  
Register and open a custom SiYuan tab that hosts the Daily Note View Svelte UI. The toolbar gains an "Open Daily Note View" entry; existing direct-open notebook items remain available.

**Feat B: Daily-note coordinate resolver**  
Add a resolver for `(date, notebook)` that returns `missing`, `single`, or `duplicate` state without creating a document. Missing state includes the rendered target hpath.

**Feat C: Content lanes**  
Render horizontal lanes from `axis + count + anchor`. Existing daily notes mount one Protyle editor per lane; missing lanes show an explicit create action; duplicate lanes show a warning and render the earliest-created document as the primary editor.

**Feat D: Calendar status views**  
Add Week and Month status grids for the anchor notebook. Week/Month replace the content-lane body instead of appearing alongside it. Clicking a calendar date switches back to content mode at that date.

**Feat E: Dependency and localization integration**  
Update the plugin-kit dependency to a version exposing arbitrary-date daily-note helpers; add localized labels for the new view controls and states.

### Scope Summary
<!-- MUST end every spec with a File | Change table. -->

| File | Change |
|---|---|
| `package.json`, `pnpm-lock.yaml` | Bump `@frostime/siyuan-plugin-kits` to `1.6.0+` so arbitrary-date daily-note helpers are available. |
| `src/index.ts` | Wire the Daily Note View tab hub/command into plugin lifecycle. |
| `src/components/toolbar-menu.ts` | Add a toolbar menu entry for opening Daily Note View while preserving direct-open notebook items. |
| `src/func/dailynote-view/*` | New tab registration, view-state helpers, lane calculation, and daily-note coordinate resolver. |
| `src/components/dailynote-view/*` | New Svelte UI: toolbar, content lanes, Protyle host, missing/duplicate states, and calendar grid. |
| `src/index.scss` or component styles | Styles for the custom tab, horizontal lanes, and status calendar. |
| `src/i18n/zh_CN.yaml`, `src/i18n/en_US.yaml`, `src/types/i18n.d.ts` | Localized strings and type declarations for new UI text. |
| `.sspec/changes/26-06-05T17-01_add-dailynote-view/reference/dailynote-view-prototype.html` | Static UI/UX prototype used during design review only. |

What stays unchanged:

- Existing `openDiary`, `openDefaultDailyNote`, startup auto-open, move-to-DN, reservation insertion, and duplicate-handling routines are not replaced.
- Daily Note View navigation never creates a document. Only the lane-level **Create Daily Note** action writes.
- Mobile-specific Daily Note View UX is out of scope for this change; mobile keeps existing daily-note opening behavior.
- Persisting custom presets/defaults is out of scope; `axis` and `count` are configurable in the tab session.

### Design Reference
<!-- MUST create design.md when the change involves new interfaces, data model changes,
or architectural logic changes. Link here: → See [design.md](./design.md)
Simple changes MAY delete this section and describe the technical approach inline. -->

→ See [design.md](./design.md)
