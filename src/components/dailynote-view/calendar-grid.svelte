<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { listDailynote } from "@frostime/siyuan-plugin-kits";
    import type { DailyNoteIndexEntry } from "@/func/dailynote-view/resolver";
    import { createDailyNoteCell } from "@/func/dailynote-view/resolver";
    import { dateKey, normalizeDate, todayDate, visibleNotebooks } from "@/func/dailynote-view/state";
    import { showMessage } from "siyuan";
    import { i18n } from "@/utils";

    type CalendarDocs = Map<string, Map<NotebookId, number>>;
    type CalendarNotebookEntry = { notebook: Notebook; count: number };
    type CalendarCell = { date: Date; entries: CalendarNotebookEntry[] };

    const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    export let span: DailyNoteViewSpan;
    export let anchorDate: Date;

    const dispatch = createEventDispatcher<{
        selectDate: { date: Date; notebookId: NotebookId; cell?: DailyNoteCell };
        selectMonth: Date;
    }>();

    let cells: Date[] = [];
    let notebooks: Notebook[] = [];
    let docsByDate: CalendarDocs = new Map();
    let refreshKey = '';
    let refreshGeneration = 0;
    let loading = false;
    let dialogDate: Date | null = null;
    let creatingNotebookId: NotebookId | null = null;

    // Keep these dependencies explicit: Svelte does not track docsByDate when it is
    // only read inside a template helper, so async query results would not repaint cells.
    $: calendarCells = buildCalendarCells(cells, notebooks, docsByDate);
    $: dialogEntries = buildDialogEntries(dialogDate, notebooks, docsByDate);

    // ── Calendar geometry ────────────────────────────────────────────────────

    function startOfWeek(date: Date): Date {
        const start = normalizeDate(date);
        const day = start.getDay() || 7;
        start.setDate(start.getDate() - day + 1);
        return start;
    }

    function shortDate(date: Date): string {
        return `${date.getMonth() + 1}/${date.getDate()}`;
    }

    function isToday(date: Date): boolean {
        return dateKey(date) === dateKey(todayDate());
    }

    function isCurrentMonth(date: Date): boolean {
        return date.getFullYear() === anchorDate.getFullYear() && date.getMonth() === anchorDate.getMonth();
    }

    function buildCells(): Date[] {
        if (span === 'year') return [];
        if (span === 'week') {
            const start = startOfWeek(anchorDate);
            return Array.from({ length: 7 }, (_, index) => {
                const date = new Date(start);
                date.setDate(start.getDate() + index);
                return date;
            });
        }
        const first = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
        const start = startOfWeek(first);
        return Array.from({ length: 42 }, (_, index) => {
            const date = new Date(start);
            date.setDate(start.getDate() + index);
            return date;
        });
    }

    // ── Calendar query and projections ────────────────────────────────────────

    function groupDocs(docs: DailyNoteIndexEntry[], notebooksForView: Notebook[]): CalendarDocs {
        const result: CalendarDocs = new Map();
        docs.forEach((doc) => {
            if (!doc.value || !notebooksForView.some((notebook) => notebook.id === doc.box)) return;
            const key = `${doc.value.slice(0, 4)}-${doc.value.slice(4, 6)}-${doc.value.slice(6, 8)}`;
            if (!result.has(key)) result.set(key, new Map());
            const byNotebook = result.get(key);
            byNotebook.set(doc.box, (byNotebook.get(doc.box) || 0) + 1);
        });
        return result;
    }

    async function refreshCalendar() {
        const key = `${span}:${dateKey(anchorDate)}`;
        if (key === refreshKey) return;
        refreshKey = key;
        const generation = ++refreshGeneration;
        const requestNotebooks = visibleNotebooks();
        const requestCells = buildCells();

        notebooks = requestNotebooks;
        cells = requestCells;
        docsByDate = new Map();
        dialogDate = null;

        if (span === 'year' || requestCells.length === 0) {
            loading = false;
            return;
        }

        loading = true;
        try {
            const docs: DailyNoteIndexEntry[] = await listDailynote({
                after: requestCells[0],
                before: requestCells[requestCells.length - 1],
                limit: 2048,
            });
            if (generation !== refreshGeneration) return;
            docsByDate = groupDocs(docs, requestNotebooks);
        } catch (error) {
            if (generation === refreshGeneration) docsByDate = new Map();
            console.error(error);
        } finally {
            if (generation === refreshGeneration) loading = false;
        }
    }

    function buildCalendarCells(dates: Date[], notebooksForView: Notebook[], docs: CalendarDocs): CalendarCell[] {
        return dates.map((date) => {
            const byNotebook = docs.get(dateKey(date));
            const entries = byNotebook
                ? notebooksForView
                    .filter((notebook) => byNotebook.has(notebook.id))
                    .map((notebook) => ({ notebook, count: byNotebook.get(notebook.id) || 0 }))
                : [];
            return { date, entries };
        });
    }

    function buildDialogEntries(date: Date | null, notebooksForView: Notebook[], docs: CalendarDocs): CalendarNotebookEntry[] {
        if (!date) return [];
        const byNotebook = docs.get(dateKey(date));
        return notebooksForView.map((notebook) => ({
            notebook,
            count: byNotebook?.get(notebook.id) || 0,
        }));
    }

    // ── User actions ──────────────────────────────────────────────────────────

    function openDate(date: Date, notebookId: NotebookId) {
        dispatch('selectDate', { date, notebookId });
    }

    function reportCreateFailure(error?: unknown) {
        if (error) console.error(error);
        showMessage(i18n.DailyNoteView.CreateFailed, 5000, 'error');
    }

    async function createDate(notebook: Notebook) {
        if (!dialogDate || creatingNotebookId) return;
        const targetDate = dialogDate;
        creatingNotebookId = notebook.id;
        try {
            const cell = await createDailyNoteCell(notebook, targetDate);
            if (!cell) {
                reportCreateFailure();
                return;
            }
            dispatch('selectDate', { date: targetDate, notebookId: notebook.id, cell });
        } catch (error) {
            reportCreateFailure(error);
        } finally {
            creatingNotebookId = null;
        }
    }

    $: if (span && anchorDate) refreshCalendar();
</script>

<section class="dnt-view__calendar dnt-view__calendar--{span}">
    <header class="dnt-view__calendar-head">
        <strong>{span === 'week' ? i18n.DailyNoteView.Week : span === 'month' ? i18n.DailyNoteView.Month : i18n.DailyNoteView.Year}</strong>
        <span>{span === 'year' ? i18n.DailyNoteView.SelectMonth : i18n.DailyNoteView.AllNotebooks}</span>
    </header>

    {#if span === 'year'}
        <div class="dnt-view__calendar-year">
            {#each Array.from({ length: 12 }, (_, index) => index) as month}
                <button on:click={() => dispatch('selectMonth', new Date(anchorDate.getFullYear(), month, 1))}>{month + 1} {i18n.DailyNoteView.Month}</button>
            {/each}
        </div>
    {:else}
        <div class="dnt-view__calendar-grid dnt-view__calendar-grid--{span}">
            {#if span === 'month'}
                {#each WEEKDAYS as day}
                    <div class="dnt-view__calendar-cell dnt-view__calendar-dow">{day}</div>
                {/each}
            {/if}
            {#each calendarCells as cell, index (dateKey(cell.date))}
                <div
                    class:dnt-view__calendar-cell--today={isToday(cell.date)}
                    class:dnt-view__calendar-cell--dim={span === 'month' && !isCurrentMonth(cell.date)}
                    class:dnt-view__week-card={span === 'week'}
                    class="dnt-view__calendar-cell dnt-view__calendar-day"
                    role="button"
                    tabindex="0"
                    on:click={() => dialogDate = cell.date}
                    on:keydown={(event) => event.key === 'Enter' && (dialogDate = cell.date)}
                >
                    {#if span === 'week'}
                        <header class="dnt-view__week-card-head">
                            <span class="dnt-view__week-card-dow">{WEEKDAYS[index]}</span>
                            <span class="dnt-view__week-card-date">{shortDate(cell.date)}</span>
                            {#if isToday(cell.date)}
                                <span class="dnt-view__week-card-today">{i18n.DailyNoteView.Today}</span>
                            {/if}
                        </header>
                    {:else}
                        <span class="dnt-view__calendar-date">{cell.date.getDate()}</span>
                    {/if}
                    <div class="dnt-view__calendar-notebook-list">
                        {#each cell.entries.slice(0, 4) as entry}
                            <button
                                class:dnt-view__calendar-notebook-label--duplicate={entry.count > 1}
                                class="dnt-view__calendar-notebook-label"
                                on:click|stopPropagation={() => openDate(cell.date, entry.notebook.id)}
                            >
                                {entry.count > 1 ? '⚠ ' : ''}{entry.notebook.name}
                            </button>
                        {/each}
                        {#if cell.entries.length > 4}
                            <span class="dnt-view__calendar-more">+{cell.entries.length - 4}</span>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
        {#if loading}<div class="dnt-view__calendar-loading">Loading...</div>{/if}
    {/if}

    {#if dialogDate}
        <div class="dnt-view__dialog-backdrop" role="presentation" on:click|self={() => dialogDate = null}>
            <section class="dnt-view__dialog" role="dialog" aria-modal="true">
                <header>
                    <strong>{dateKey(dialogDate)}</strong>
                    <button class="dnt-view__iconbtn" on:click={() => dialogDate = null}>×</button>
                </header>
                <div class="dnt-view__dialog-list">
                    {#each dialogEntries as entry}
                        <div class="dnt-view__dialog-row">
                            <span>{entry.notebook.name}</span>
                            <small>{entry.count > 1 ? `${i18n.DailyNoteView.Duplicate} ${entry.count}` : entry.count === 1 ? i18n.DailyNoteView.exists : i18n.DailyNoteView.Missing}</small>
                            {#if entry.count > 0}
                                <button class="b3-button b3-button--outline" on:click={() => openDate(dialogDate, entry.notebook.id)}>{i18n.DailyNoteView.Open}</button>
                            {:else}
                                <button class="b3-button b3-button--outline" disabled={creatingNotebookId !== null} on:click={() => createDate(entry.notebook)}>
                                    {creatingNotebookId === entry.notebook.id ? i18n.DailyNoteView.Creating : i18n.DailyNoteView.CreateDailyNote}
                                </button>
                            {/if}
                        </div>
                    {/each}
                </div>
            </section>
        </div>
    {/if}
</section>
