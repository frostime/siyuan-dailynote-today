---
name: Reservation subsystem
description: Reservation block contracts, date parsing, retrieval insertion, settings, and Dock behavior.
updated: 2026-06-04
scope:
  - /src/index.ts
  - /src/func/index.ts
  - /src/func/reserve/**
  - /src/func/move.ts
  - /src/global-status.ts
  - /src/serverApi.ts
  - /src/components/gutter-menu.ts
  - /src/components/dock-reserve.svelte
  - /src/components/list-item.svelte
  - /src/components/setting-gui.svelte
---

# Reservation subsystem

<!-- MUST update 'updated' field when modifying.
Structure: start with Overview, then invent sections that fit the content.
See write-spec-doc SKILL for examples and style guide. -->

## Overview

The reservation subsystem lets a user mark a SiYuan block for a future date, stores the reservation as block attributes, and inserts today's reservations into today's daily note as an embed, link list, or block-reference list.

Primary implementation:

| Concern | Source |
|---|---|
| Reservation commands and hotkeys | `/src/index.ts` |
| Gutter menu entries | `/src/components/gutter-menu.ts` |
| Date parsing and reservation attrs | `/src/func/reserve/reserve.ts` |
| Query and insertion orchestration | `/src/func/reserve/index.ts` |
| Retrieval block format | `/src/func/reserve/retrieve.ts` |
| Dock reservation list | `/src/components/dock-reserve.svelte`, `/src/components/list-item.svelte` |
| Settings UI | `/src/components/setting-gui.svelte` |

## Core Contracts

| Contract | Meaning | Source |
|---|---|---|
| Reservation identity | Reserved blocks have `custom-reservation=YYYYMMDD`. | `/src/func/reserve/reserve.ts`, `/src/func/reserve/index.ts` |
| User-visible marker | Reserved blocks also get `memo="<localized reservation label> YYYYMMDD"`. | `/src/func/reserve/reserve.ts` |
| Cancellation | Cancel reservation clears `custom-reservation` and `memo`. | `/src/func/reserve/reserve.ts` |
| Retrieval block marker | Inserted reservation summary block has attrs `name=Reservation` and `breadcrumb=true`. | `/src/func/reserve/retrieve.ts` |
| Today query | Today's reservations are blocks whose `custom-reservation` equals local date `strftime('%Y%m%d', datetime('now', 'localtime'))`. | `/src/func/reserve/retrieve.ts` |
| Future query | Future reservations are blocks whose `custom-reservation` is greater than or equal to local today. | `/src/func/reserve/retrieve.ts` |

## User Entry Points

| Entry point | Condition | Behavior |
|---|---|---|
| Block icon menu | `EnableReserve=true` | Add `Reserve` or `Cancel Reservation` item. |
| Hotkey `Alt+Shift+R` | Focused block exists and `EnableReserve=true` | Reserve focused block or cancel existing reservation. |
| Toolbar right-click → Update | Default daily note has `dailyNoteDocId` | Refresh today's reservation retrieval block. |
| Auto-open default daily note | Today's reservations exist | Try to insert/update today's reservation retrieval block. |
| Alt+5 replacement open | `ReplaceAlt5Hotkey=true` | Open default daily note and try reservation insertion. |
| Dock | `EnableResvDock=true` | Show grouped reservation list. |

## Date Parsing Specification

`reserveBlock(blockId)` reads block kramdown through `/api/block/getBlockKramdown`, strips inline attribute suffixes, then resolves a reservation date.

Resolution order:

```txt
1. Custom DatePatternRules scan kramdown.
   - Numeric year/month/day, optional year
   - 明天/后天/大后天
   - 今天/今日
   - N 天后 / N days later
   - 周/星期/礼拜 weekday expressions
   - Chinese month/day numerals
2. If no custom rule matches, use chrono-node with forwardDate=true.
3. If still no date, show date-picker dialog.
4. Reject dates before local today.
5. Optionally show confirmation/date-picker dialog.
6. setBlockAttrs(custom-reservation, memo).
```

When multiple custom rules match, the earliest match index in the block text wins. Chrono is only used when no custom rule produced a date.

## Retrieval Insertion Flow

```txt
updateTodayReservation(notebook, refresh=false)
→ require notebook.dailyNoteDocId
→ updateDocReservation(docId, refresh)

updateDocReservation(docId, refresh)
→ getTodayReservations()
→ RetvFactory(settings.RetvType, settings.ResvEmbedAt, ids, docId)
→ retv.checkRetv()
→ if existing and !refresh: stop
→ verify reservation block IDs still exist
→ if existing: retv.update()
→ else: retv.insert()
```

`updateTodayReservation()` returns `false` when the notebook does not currently carry `dailyNoteDocId`. That field is populated by notebook query/open/create flows in the daily-note subsystem.

## Retrieval Formats

| `RetvType` | Class | Inserted markdown |
|---|---|---|
| `embed` | `RetvAsEmbed` | SQL embed block: `{{select * from blocks where id in (...)}}` |
| `link` | `RetvAsLink` | Task-list items linking to `siyuan://blocks/<id>` |
| `ref` | `RetvAsRef` | Task-list items using SiYuan block refs `((id "content"))` |

`ResvEmbedAt` controls insertion position:

| Value | API |
|---|---|
| `top` | `/api/block/prependBlock` |
| `bottom` | `/api/block/appendBlock` |

Existing retrieval block detection searches for blocks under the destination document path with `name = "Reservation"`.

## Dock Behavior

`/src/components/dock-reserve.svelte` displays reservations grouped by date.

Flow:

```txt
onMount or refresh click
→ retrieveResvFromBlocks("datetime", "-2 day")
→ group reservation IDs by YYYYMMDD
→ query block content/root_id for all IDs
→ render date sections with ListItem
```

Dock quirks:

| Quirk | Source |
|---|---|
| The Dock query starts from local today minus two days, not strictly future-only. | `/src/components/dock-reserve.svelte` |
| Empty/deleted reservation block IDs are filtered from display after the content query. | `/src/components/dock-reserve.svelte` |
| Date sections can open a floating block panel for all blocks in that date group. | `/src/components/list-item.svelte` |
| Today's section is visually highlighted. | `/src/components/list-item.svelte` |

## Settings

| Setting | Effect | Source |
|---|---|---|
| `EnableReserve` | Enables reserve/cancel menu and hotkey behavior. | `/src/index.ts`, `/src/components/gutter-menu.ts` |
| `EnableResvDock` | Adds reservation Dock tab after settings load. | `/src/index.ts` |
| `PopupReserveDialog` | Shows confirmation/date-picker dialog before setting attrs. | `/src/func/reserve/reserve.ts` |
| `ResvEmbedAt` | Controls top/bottom insertion of retrieval block. | `/src/func/reserve/index.ts`, `/src/func/reserve/retrieve.ts` |
| `RetvType` | Chooses embed/link/ref retrieval format. | `/src/func/reserve/index.ts`, `/src/func/reserve/retrieve.ts` |
| `HighlightResv` | Highlights Dock icon when today's reservations exist. | `/src/func/index.ts` |

## Cross-subsystem Dependency

Reservation insertion depends on the daily-note subsystem for `notebook.dailyNoteDocId`. A change to daily-note opening/querying can silently affect reservation insertion. When modifying daily-note creation, opening, or notebook refresh logic, verify:

1. `notebook.dailyNoteDocId` is set after opening/creating today's default daily note.
2. `updateTodayReservation(notebooks.default)` can find today's document.
3. Existing retrieval block update still targets the same daily note.
