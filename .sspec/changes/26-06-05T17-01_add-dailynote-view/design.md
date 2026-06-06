---
change: "add-dailynote-view"
created: 2026-06-05T17:01:37
---

# Design: add-dailynote-view

<!-- MUST maintain quality bar (non-negotiable):
Use semi-structured, formalized expression over flat prose.
Goal: maximize information density, minimize ambiguity, optimize reader comprehension.
In short: show, don't describe.

Fence nesting: when showing content that contains ```, outer fence MUST use more backticks. Always outer > inner.

Recommended tools (non-exhaustive):
- typed code block: interfaces, types, schemas, config, prompts...
- ASCII diagram: call chains, state machines, module trees, content outlines...
- table: before/after comparison, option tradeoffs, scope mapping...
- labeled items: multi-change annotation (Fix A / Feat B / Step 1...)
- pseudocode, decision trees, constraint lists

Anti-pattern:
  ❌ "We will add a function that accepts X and returns Y"
  ✅ `def process(x: Input) -> Output: ...`

  ❌ "The request first goes through module A, then is passed to B"
  ✅ request → A.validate() → B.process() → response
-->

## 1. Design Constraints

| Constraint | Design consequence |
|---|---|
| Daily Note identity is `date × notebook`. | View state models both dimensions explicitly. |
| Navigating to a missing daily note MUST NOT write. | Cell resolution is read-only; creation only happens from a lane button. |
| Multiple Protyles stacked vertically cause gutter/scroll issues. | Content lanes expand horizontally; the view never renders a vertical doc-flow list of Protyles. |
| Week/Month should support navigation/status, not bulk editing. | Calendar views replace the content-lane body, show existence/duplicate markers, and route clicks back to content view. |
| Existing plugin flows are stable. | Open-today, reservation, move, auto-open, and duplicate handlers remain separate entry points. |
| User wants UI/UX preview before implementation. | This design includes ASCII wireframes and a static prototype: [`reference/dailynote-view-prototype.html`](./reference/dailynote-view-prototype.html). |

## 2. Core Model

```txt
DailyNoteView
  state = { mode, anchorDate, anchorNotebookId, axis, count }

Coordinate cell
  (date, notebook) → missing | single | duplicate

Body render is mutually exclusive:
  mode=content → render ContentLanes only
  mode=week    → render Week CalendarGrid only
  mode=month   → render Month CalendarGrid only

Content mode
  axis=time     → lanes are dates; notebook fixed
  axis=notebook → lanes are notebooks; date fixed

Calendar mode
  mode=week  → 7 date cells for anchor week; notebook scope = anchor notebook
  mode=month → month grid for anchor month; notebook scope = anchor notebook
```

```ts
type ViewMode = "content" | "week" | "month";
type ExpandAxis = "time" | "notebook";
type CountSpec =
  | { kind: "number"; value: 1 | 3 | 5 }
  | { kind: "all" }; // valid only for axis="notebook"

interface DailyNoteViewState {
  mode: ViewMode;
  anchorDate: Date;              // normalized to local day start
  anchorNotebookId: NotebookId;  // defaults to notebooks.default.id
  axis: ExpandAxis;              // defaults to "time"
  count: CountSpec;              // defaults to { kind: "number", value: 1 }
}

interface DailyNoteLane {
  key: string;                   // `${dateKey}:${notebookId}`
  date: Date;
  notebook: Notebook;
  cell: DailyNoteCell;
}

type DailyNoteCell =
  | { status: "missing"; hpath: string }
  | { status: "single"; doc: DocBlock; hpath: string }
  | { status: "duplicate"; primary: DocBlock; docs: DocBlock[]; hpath: string };
```

## 3. Presets and Control Semantics

### Presets

| Preset label | State patch | User-visible result |
|---|---|---|
| Today | `mode=content, axis=time, count=1, anchorDate=today` | One lane: today's DN for anchor notebook. |
| Three days | `mode=content, axis=time, count=3` | Three date lanes centered on anchor date. |
| Notebooks | `mode=content, axis=notebook, count=all` | One date, all opened non-blacklisted notebooks as horizontal lanes. |
| Week | `mode=week` | Calendar week status grid for anchor notebook. |
| Month | `mode=month` | Calendar month status grid for anchor notebook. |

### Controls

```txt
┌ Daily Note View ─────────────────────────────────────────────────────────┐
│ Presets: [Today] [Three days] [Notebooks] [Week] [Month]                │
│ Date:     < 2026-06-05 > [Today] [Calendar]                             │
│ Notebook: < 工作笔记本 > [Select]     Expand: [time|notebook] Count:[1|3|5|All] │
└─────────────────────────────────────────────────────────────────────────┘
```

| Control | Behavior |
|---|---|
| Date `<` / `>` | Always shifts `anchorDate` by ±1 day. |
| Today | Sets `anchorDate = today`, keeps notebook/axis/count unless using the Today preset. |
| Calendar picker | Sets `anchorDate` to selected date. |
| Notebook `<` / `>` | Shifts `anchorNotebookId` by ±1 in the current notebook order. |
| Notebook selector | Sets `anchorNotebookId`. |
| Expand axis | Changes which dimension becomes horizontal lanes. |
| Count | Changes number of horizontal lanes. `All` is enabled only for notebook axis. |
| Calendar cell click | Sets `anchorDate = cell.date`, `mode=content`; preserves anchor notebook. |

### Lane calculation

```ts
function buildLanes(state: DailyNoteViewState, notebooks: Notebook[]): LaneSeed[] {
  if (state.mode !== "content") return [];

  if (state.axis === "time") {
    const n = numericCount(state.count); // 1 | 3 | 5; All is coerced to 1
    const startOffset = -Math.floor((n - 1) / 2);
    return range(n).map(i => ({
      date: addDays(state.anchorDate, startOffset + i),
      notebook: findNotebook(state.anchorNotebookId),
    }));
  }

  const ordered = visibleNotebooks(notebooks);
  const selectedIndex = ordered.findIndex(n => n.id === state.anchorNotebookId);
  const window = state.count.kind === "all"
    ? ordered
    : centeredWindow(ordered, selectedIndex, state.count.value);

  return window.map(notebook => ({
    date: state.anchorDate,
    notebook,
  }));
}
```

## 4. UI Layout

### Content view: `axis=time, count=3` body

```txt
┌─────────────────────────────────────────────────────────────────────────────┐
│ Toolbar                                                                     │
├───────────────────┬───────────────────┬───────────────────┐               │
│ Wed Jun 04         │ Thu Jun 05         │ Fri Jun 06         │  horizontal   │
│ 工作笔记本          │ 工作笔记本          │ 工作笔记本          │  scroll if     │
│                   │                   │                   │  overflow      │
│ [Protyle/doc]      │ Missing           │ Duplicate warning  │               │
│                   │ hpath preview      │ primary Protyle    │               │
│                   │ [Create DN]        │ [Open duplicates]  │               │
└───────────────────┴───────────────────┴───────────────────┘               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Content view: `axis=notebook, count=all` body

```txt
┌─────────────────────────────────────────────────────────────────────────────┐
│ Toolbar                                                                     │
├───────────────────┬───────────────────┬───────────────────┬───────────────┐
│ Thu Jun 05         │ Thu Jun 05         │ Thu Jun 05         │ Thu Jun 05    │
│ 工作笔记本          │ 生活笔记本          │ 项目笔记本          │ Inbox         │
│ [Protyle/doc]      │ Missing           │ [Protyle/doc]      │ Missing       │
│                   │ [Create DN]        │                   │ [Create DN]   │
└───────────────────┴───────────────────┴───────────────────┴───────────────┘
```

### Calendar view body, replacing content lanes

```txt
Month: Jun 2026 / Notebook: 工作笔记本

Mon       Tue       Wed       Thu       Fri       Sat       Sun
┌───────┬───────┬───────┬───────┬───────┬───────┬───────┐
│ 1  ●  │ 2     │ 3  ●  │ 4  ⚠  │ 5  ◎  │ 6     │ 7     │
│ DN    │ empty │ DN    │ dup   │ today │ empty │ empty │
└───────┴───────┴───────┴───────┴───────┴───────┴───────┘
```

Legend:

| Marker | Meaning |
|---|---|
| `●` | One daily note exists. |
| `⚠` | More than one daily note exists for the same `date × notebook`. |
| blank | Missing daily note. |
| `◎` | Today marker; can combine with existence marker. |

## 5. Runtime Structure

```txt
DailyNoteTodayPlugin.onload()
  → initPluginUI()
    → new ToolbarMenuItem(plugin)
    → new DailyNoteViewHub(plugin)

ToolbarMenuItem.showMenu()
  → menu.addItem("Open Daily Note View")
  → existing notebook direct-open items

DailyNoteViewHub.open(initialState?)
  → plugin.addTab({ type: "dnt-dailynote-view", init, beforeDestroy })
  → openTab({ custom: { id, title, icon, data } })

DailyNoteView.svelte
  ├─ DailyNoteViewToolbar.svelte
  └─ Body switch by state.mode
     ├─ mode=content → ContentLanes.svelte
     │  └─ DailyNoteLane.svelte
     │     ├─ ProtyleHost.svelte
     │     ├─ MissingDailyNote.svelte
     │     └─ DuplicateDailyNote.svelte
     ├─ mode=week → CalendarGrid.svelte
     └─ mode=month → CalendarGrid.svelte
```

Proposed files:

```txt
src/func/dailynote-view/
├─ index.ts              # exports hub + resolver helpers
├─ tab.ts                # DailyNoteViewHub
├─ state.ts              # state defaults, date/notebook shifts, lane seeds
└─ resolver.ts           # resolveDailyNoteCell, createDailyNoteCell

src/components/dailynote-view/
├─ daily-note-view.svelte
├─ view-toolbar.svelte
├─ content-lanes.svelte
├─ daily-note-lane.svelte
├─ protyle-host.svelte
├─ missing-daily-note.svelte
├─ duplicate-daily-note.svelte
└─ calendar-grid.svelte
```

## 6. Daily-note Data Flow

Use `@frostime/siyuan-plugin-kits@1.6.0+` root exports:

```ts
import {
  createDailynote,
  getDailynoteHpath,
  searchDailynote,
  listDailynote,
} from "@frostime/siyuan-plugin-kits";
```

Resolver contract:

```ts
async function resolveDailyNoteCell(
  notebook: Notebook,
  date: Date,
): Promise<DailyNoteCell> {
  const [hpath, docs] = await Promise.all([
    getDailynoteHpath(notebook.id, date),
    searchDailynote(notebook.id, date, { returnAll: true }) as Promise<DocBlock[] | null>,
  ]);

  if (!docs || docs.length === 0) {
    return { status: "missing", hpath };
  }

  const sorted = docs.slice().sort((a, b) => a.created.localeCompare(b.created));
  if (sorted.length === 1) {
    return { status: "single", doc: sorted[0], hpath };
  }

  return {
    status: "duplicate",
    primary: sorted[0],
    docs: sorted,
    hpath,
  };
}
```

Create contract:

```ts
async function createDailyNoteCell(
  notebook: Notebook,
  date: Date,
  appId: string,
): Promise<DocBlock | null> {
  const docId = await createDailynote(notebook.id, date, { appId });
  if (!docId) return null;
  return serverApi.getBlockByID(docId) as Promise<DocBlock>;
}
```

Behavioral flow:

```txt
User changes state
  → buildLanes(state)
  → resolve each lane coordinate
  → render lane by cell.status

Missing lane [Create DN]
  → createDailynote(notebook.id, date, { appId })
  → refresh that lane
  → mount Protyle when created doc is resolved

Duplicate lane
  → show warning count + hpath
  → mount primary doc only
  → provide direct-open entries for all duplicate docs
```

Calendar status flow:

```ts
async function resolveCalendarStatus(
  notebook: Notebook,
  range: { from: Date; to: Date },
): Promise<Map<string, "missing" | "single" | "duplicate">> {
  const docs = await listDailynote({
    boxId: notebook.id,
    after: range.from,
    before: range.to,
    limit: 512,
  });
  return groupByCustomDailynoteDate(docs);
}
```

`groupByCustomDailynoteDate` reads the joined `A.value` returned by `listDailynote` in plugin-kit `1.6.0+`.

## 7. Protyle Mounting

```ts
new Protyle(app, target, {
  mode: "wysiwyg",
  action: ["cb-get-all"],
  blockId: doc.id,
  render: {
    background: false,
    title: true,
    gutter: true,
    scroll: true,
    breadcrumb: true,
    breadcrumbDocName: false,
  },
});
```

Lifecycle rules:

| Event | Action |
|---|---|
| Lane coordinate changes | Destroy old Protyle, resolve new cell, mount new Protyle if `single` or `duplicate`. |
| Mode changes from content to calendar | Destroy all lane Protyles. |
| Tab beforeDestroy | Destroy Svelte component and all Protyles. |
| Missing lane create succeeds | Refresh lane and mount Protyle for created doc. |

Layout rule:

```scss
.dnt-view__lanes {
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  overflow-y: hidden;
  height: 100%;
}

.dnt-view__lane {
  flex: 0 0 min(42rem, 90vw);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.dnt-view__protyle {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}
```

## 8. UI Prototype

Static prototype path:

```txt
.sspec/changes/26-06-05T17-01_add-dailynote-view/reference/dailynote-view-prototype.html
```

Prototype coverage:

| Area | Shown |
|---|---|
| Top toolbar | Presets, date controls, notebook controls, axis/count controls. |
| Content mode | Existing, missing, and duplicate states in horizontal layout. |
| Calendar mode | Month grid with existence/duplicate/today markers as an alternate body state, not simultaneous with content lanes. |

The prototype is a design artifact only. It is not bundled into the plugin.

## 9. Dependency/Migration Notes

| Item | Requirement |
|---|---|
| plugin-kit version | `@frostime/siyuan-plugin-kits@1.6.0+`. Current repo lockfile is `1.5.3`. |
| arbitrary-date create | `createDailynote(boxId, date, { appId })`. Today uses SiYuan `/api/filetree/createDailyNote`; non-today creates by hpath and applies configured daily-note template when `content` is omitted. |
| duplicate query | `searchDailynote(boxId, date, { returnAll: true })`. |
| calendar batch status | `listDailynote({ boxId, after, before, limit })`. |
| project fallback | If package update cannot be installed, copy no code from plugin-kit; instead wrap the same behavior with project-local `serverApi` calls during implementation and record the reason in `memory.md`. |

## 10. Non-goals

- No mobile-specific Daily Note View layout.
- No saved custom presets/defaults.
- No replacement of existing direct-open toolbar behavior.
- No automatic duplicate merge/delete/trash inside Daily Note View.
- No implicit creation from navigation, calendar click, or Protyle focus.
