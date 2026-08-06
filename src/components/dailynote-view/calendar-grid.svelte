<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { createDailyNoteCell, listDailyNotesBetween } from "@/func/dailynote-view/resolver";
    import { dateKey, normalizeDate, todayDate, visibleNotebooks } from "@/func/dailynote-view/state";
    import { i18n } from "@/utils";

    type CalendarDocs = Map<string, Map<NotebookId, DocBlock[]>>;

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
    let loading = false;
    let dialogDate: Date | null = null;
    let creatingNotebookId: NotebookId | null = null;

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

    function groupDocs(docs: any[]): CalendarDocs {
        const result: CalendarDocs = new Map();
        docs.forEach((doc) => {
            if (!doc.value || !notebooks.some((notebook) => notebook.id === doc.box)) return;
            const key = `${doc.value.slice(0, 4)}-${doc.value.slice(4, 6)}-${doc.value.slice(6, 8)}`;
            if (!result.has(key)) result.set(key, new Map());
            const byNotebook = result.get(key);
            const notebookDocs = byNotebook.get(doc.box) || [];
            notebookDocs.push(doc as DocBlock);
            notebookDocs.sort((a, b) => a.created.localeCompare(b.created));
            byNotebook.set(doc.box, notebookDocs);
        });
        return result;
    }

    async function refreshCalendar(force = false) {
        const key = `${span}:${dateKey(anchorDate)}`;
        if (!force && key === refreshKey) return;
        refreshKey = key;
        notebooks = visibleNotebooks();
        cells = buildCells();
        dialogDate = null;

        if (span === 'year' || cells.length === 0) {
            docsByDate = new Map();
            loading = false;
            return;
        }

        loading = true;
        try {
            const docs = await listDailyNotesBetween(cells[0], cells[cells.length - 1]);
            if (key !== refreshKey) return;
            docsByDate = groupDocs(docs);
        } catch (error) {
            if (key === refreshKey) docsByDate = new Map();
            console.error(error);
        } finally {
            if (key === refreshKey) loading = false;
        }
    }

    function dateNotebooks(date: Date): Array<{ notebook: Notebook; docs: DocBlock[] }> {
        const byNotebook = docsByDate.get(dateKey(date));
        if (!byNotebook) return [];
        return notebooks
            .filter((notebook) => byNotebook.has(notebook.id))
            .map((notebook) => ({ notebook, docs: byNotebook.get(notebook.id) }));
    }

    function notebookDocs(date: Date, notebookId: NotebookId): DocBlock[] {
        return docsByDate.get(dateKey(date))?.get(notebookId) || [];
    }

    function openDate(date: Date, notebookId: NotebookId) {
        dispatch('selectDate', { date, notebookId });
    }

    async function createDate(notebook: Notebook) {
        if (!dialogDate || creatingNotebookId) return;
        const targetDate = dialogDate;
        creatingNotebookId = notebook.id;
        try {
            const cell = await createDailyNoteCell(notebook, targetDate);
            if (cell) dispatch('selectDate', { date: targetDate, notebookId: notebook.id, cell });
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
            {#each ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as day}
                <div class="dnt-view__calendar-cell dnt-view__calendar-dow">{day}</div>
            {/each}
            {#each cells as date}
                {@const entries = dateNotebooks(date)}
                <div
                    class:dnt-view__calendar-cell--today={isToday(date)}
                    class:dnt-view__calendar-cell--dim={span === 'month' && !isCurrentMonth(date)}
                    class="dnt-view__calendar-cell dnt-view__calendar-day"
                    role="button"
                    tabindex="0"
                    on:click={() => dialogDate = date}
                    on:keydown={(event) => event.key === 'Enter' && (dialogDate = date)}
                >
                    <span class="dnt-view__calendar-date">{span === 'week' ? shortDate(date) : date.getDate()}</span>
                    <div class="dnt-view__calendar-notebook-list">
                        {#each entries.slice(0, 4) as entry}
                            <button
                                class:dnt-view__calendar-notebook-label--duplicate={entry.docs.length > 1}
                                class="dnt-view__calendar-notebook-label"
                                on:click|stopPropagation={() => openDate(date, entry.notebook.id)}
                            >
                                {entry.docs.length > 1 ? '⚠ ' : ''}{entry.notebook.name}
                            </button>
                        {/each}
                        {#if entries.length > 4}
                            <span class="dnt-view__calendar-more">+{entries.length - 4}</span>
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
                    {#each notebooks as notebook}
                        {@const docs = notebookDocs(dialogDate, notebook.id)}
                        <div class="dnt-view__dialog-row">
                            <span>{notebook.name}</span>
                            <small>{docs.length > 1 ? `${i18n.DailyNoteView.Duplicate} ${docs.length}` : docs.length === 1 ? i18n.DailyNoteView.exists : i18n.DailyNoteView.Missing}</small>
                            {#if docs.length > 0}
                                <button class="b3-button b3-button--outline" on:click={() => openDate(dialogDate, notebook.id)}>{i18n.DailyNoteView.Open}</button>
                            {:else}
                                <button class="b3-button b3-button--outline" disabled={creatingNotebookId !== null} on:click={() => createDate(notebook)}>
                                    {creatingNotebookId === notebook.id ? i18n.DailyNoteView.Creating : i18n.DailyNoteView.CreateDailyNote}
                                </button>
                            {/if}
                        </div>
                    {/each}
                </div>
            </section>
        </div>
    {/if}
</section>
