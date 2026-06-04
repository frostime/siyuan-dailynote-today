---
name: Daily-note lifecycle and duplicate handling
description: Daily-note startup/open/status flows, notebook state, custom attributes, sync duplicate detection, and duplicate handling methods.
updated: 2026-06-04
scope:
  - /src/index.ts
  - /src/global-status.ts
  - /src/global-notebooks.ts
  - /src/func/index.ts
  - /src/func/misc.ts
  - /src/func/dailynote/**
  - /src/serverApi.ts
  - /src/components/toolbar-menu.ts
  - /src/components/set-past-dn-attr.ts
---

# Daily-note lifecycle and duplicate handling

<!-- MUST update 'updated' field when modifying.
Structure: start with Overview, then invent sections that fit the content.
See write-spec-doc SKILL for examples and style guide. -->

## Overview

The daily-note subsystem makes SiYuan daily notes addressable by notebook and date, opens/creates today's daily note, tracks whether today's daily note exists per notebook, and handles duplicate daily notes caused by multi-device sync timing.

Primary implementation:

| Concern | Source |
|---|---|
| Plugin lifecycle and timers | `/src/index.ts` |
| Settings | `/src/global-status.ts` |
| Runtime notebook registry | `/src/global-notebooks.ts` |
| Startup/sync routine | `/src/func/index.ts` |
| Notebook query and hpath lookup | `/src/func/misc.ts` |
| Daily-note operations | `/src/func/dailynote/*` |
| SiYuan kernel API calls | `/src/serverApi.ts` |

## Core Contracts

| Contract | Meaning | Source |
|---|---|---|
| `Notebook` runtime enrichment | SiYuan notebook objects are enriched with `dailynoteSprig`, `dailynoteHpath`, and sometimes `dailyNoteDocId`. | `/src/func/misc.ts`, `/src/types/index.d.ts` |
| Default notebook | `settings.DefaultNotebook` is a notebook ID; empty means the first open non-guide notebook returned by SiYuan. | `/src/global-notebooks.ts` |
| Daily-note identity | A daily-note document has custom attribute `custom-dailynote-YYYYMMDD=YYYYMMDD`. | `/src/func/dailynote/dn-attr.ts` |
| Today's daily-note lookup | Query document blocks joined with attributes matching today's `custom-dailynote-YYYYMMDD` and notebook box. | `/src/func/dailynote/basic.ts` |
| Daily-note hpath | Computed from notebook daily-note Sprig template through SiYuan `/api/template/renderSprig`. | `/src/func/dailynote/basic.ts`, `/src/func/misc.ts` |
| Fallback daily-note path template | `/daily note/{{now | date "2006/01"}}/{{now | date "2006-01-02"}}` when notebook config has no daily-note save path. | `/src/func/misc.ts` |

## Startup Flow

```txt
DailyNoteTodayPlugin.onload()
→ set global app/plugin/i18n/mobile flags
→ settings.setPlugin(plugin)
→ initPluginUI()
→ Promise.all(settings.load(), notebooks.init())
→ toggleDnHotkey(settings.ReplaceAlt5Hotkey)
→ initBlockIconClickEvent()
→ startUpdateOnNextDay()
→ subscribe EventUpdateAll
→ RoutineEventHandler.onPluginLoad()
```

`notebooks.init()` retries `queryNotebooks()` up to 5 times because SiYuan notebooks may not be ready at plugin load. `queryNotebooks()`:

1. Calls `/api/notebook/lsNotebooks` through `/src/serverApi.ts`.
2. Removes closed notebooks and built-in guide notebooks.
3. Loads each notebook's daily-note Sprig template.
4. Renders today's hpath.
5. Queries today's `custom-dailynote-YYYYMMDD` document and fills `dailyNoteDocId` when found.
6. Ensures an icon fallback.

## Open/Create Flow

| Entry point | Behavior |
|---|---|
| Toolbar left click | Show notebooks; click opens/creates today's daily note in that notebook. `/src/components/toolbar-menu.ts` |
| Startup auto-open | Opens default notebook's daily note when `OpenOnStart` is true. `/src/func/dailynote/open-dn.ts` |
| Alt+5 replacement | Optional command opens default notebook's daily note and tries reservation insertion. `/src/index.ts` |
| Move block/doc | Creates today's daily note with `createDocWithMd` when target daily note does not exist. `/src/func/move.ts` |

Open/create rules:

```txt
openDiary(notebook)
→ serverApi.createDailyNote(notebook.id, appId)
→ notebook.dailyNoteDocId = result.id
→ open document by desktop openTab or mobile openMobileFileById
```

`createDailyNote` relies on SiYuan kernel daily-note behavior. `createDiary` exists for flows that need to create by hpath directly and then explicitly calls `setCustomDNAttr`.

## Status Refresh

| Trigger | Actions |
|---|---|
| Toolbar menu open | Recompute current diary status before showing menu. |
| Right-click toolbar → Update | `notebooks.update()`, toolbar status refresh, reservation refresh for default daily note. |
| Midnight timer | `notebooks.update()`, toolbar status refresh, reset routine flags, refresh reservation icon highlight, schedule next midnight timer. |
| Notebook opened/closed event | `notebooks.update()`. |
| Move completed | Publish `moveBlocks`; toolbar recomputes status. |

`currentDiaryStatus()` computes unique daily-note hpaths across notebooks and queries documents by hpath, then marks notebooks with existing documents.

## Auto-open Constraints

`autoOpenDailyNote()` skips opening when:

| Constraint | Source |
|---|---|
| `OpenOnStart` is false | `/src/global-status.ts`, `/src/func/index.ts` |
| Mobile frontend and `DisableAutoCreateOnMobile` is true | `/src/func/dailynote/open-dn.ts` |
| Current window path starts with `/stage/build/app/window.html` | `/src/func/dailynote/open-dn.ts` |
| No notebook is available | `/src/func/dailynote/open-dn.ts` |

## Duplicate Daily-note Handling

Duplicate handling exists because SiYuan plugin startup can run before data sync completes. A device can auto-create today's daily note before the earlier synced daily note arrives.

Detection:

```txt
RoutineEventHandler.onPluginLoad()
→ if sync disabled: tryAutoOpenDN()
→ if sync enabled: bind sync-end + tryAutoOpenDN()

tryAutoOpenDN()
→ autoOpenDailyNote()
→ after 1500ms: tryAutoInsertResv(); checkDuplicateDiary()

onSyncEnd()
→ debounced checkDuplicateDiary()
→ stop after first duplicate found or after 10 checks
```

Duplicate scope:

| Scope rule | Source |
|---|---|
| Only default notebook is checked. | `/src/func/dailynote/handle-duplicate.ts` |
| Documents are duplicates when multiple docs exist at default notebook's current `dailynoteHpath`. | `/src/func/dailynote/handle-duplicate.ts` |
| Duplicate query de-duplicates repeated block IDs before handling. | `/src/func/dailynote/handle-duplicate.ts` |
| The earliest-created document is the main daily note. | `/src/func/dailynote/handle-duplicate.ts` |
| Different ancestor paths are detected and shown as a warning in the dialog. | `/src/func/dailynote/handle-duplicate.ts` |

Handling methods:

| Setting value | Method | Behavior |
|---|---|---|
| `None` | Manual dialog | Show conflict dialog; user chooses a method. |
| `AllMerge` | `mergeDocs` | Add conflict heading to main note, rename duplicates with creation timestamp, convert duplicates to headings under main note. |
| `DeleteDup` | `deleteDocs` | Remove all duplicate documents except main note. |
| `SmartMerge` | `smartMergeDocs` | Remove empty/unmodified duplicates; merge the rest into main note. |
| `TrashDup` | `moveToTrashBin` | Move duplicates under a `trash-bin` document and clear `custom-dailynote-*` attrs on duplicates. |

After a handler succeeds or fails, the plugin opens the main daily note.

## Past Daily-note Attribute Repair

The compatibility UI in `/src/components/set-past-dn-attr.ts` fills missing `custom-dailynote-YYYYMMDD` attributes for historical daily notes.

Flow:

```txt
setDNAttrDialog()
→ for each notebook: findoutEarliestDN(notebook)
→ user can adjust start date
→ searchAndSetAllDNAttr(notebook, start)
→ searchDailyNotesBetween(...)
→ setCustomDNAttr(doc.id, date)
```

`findoutEarliestDN()` derives a static hpath prefix from the daily-note Sprig template and queries the earliest document under that prefix. If the inferred start date is wrong, the dialog allows manual override.
