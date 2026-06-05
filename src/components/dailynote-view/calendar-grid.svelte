<script lang="ts">
    import { createEventDispatcher, onMount, tick } from "svelte";
    import { listDailynote } from "@frostime/siyuan-plugin-kits";
    import { dateKey, normalizeDate, todayDate, visibleNotebooks } from "@/func/dailynote-view/state";
    import { i18n } from "@/utils";

    type CalendarStatus = 'single' | 'duplicate';
    type CalendarStatusMap = Map<string, Map<NotebookId, CalendarStatus>>;

    export let mode: Extract<DailyNoteViewMode, 'week' | 'month'>;
    export let anchorDate: Date;
    export let notebook: Notebook;

    const dispatch = createEventDispatcher<{ selectDate: { date: Date; notebookId: NotebookId } }>();

    let cells: Date[] = [];
    let notebooks: Notebook[] = [];
    let status: CalendarStatusMap = new Map();
    let refreshKey = '';

    function startOfWeek(date: Date): Date {
        const start = normalizeDate(date);
        const day = start.getDay() || 7;
        start.setDate(start.getDate() - day + 1);
        return start;
    }

    function shortDate(date: Date): string {
        return `${date.getMonth() + 1}/${date.getDate()}`;
    }

    function isToday(date?: Date): boolean {
        return date ? dateKey(date) === dateKey(todayDate()) : false;
    }

    function buildCells() {
        if (mode === 'week') {
            const start = startOfWeek(anchorDate);
            cells = Array.from({ length: 7 }, (_, index) => {
                const date = new Date(start);
                date.setDate(start.getDate() + index);
                return date;
            });
            return;
        }

        const first = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
        const start = startOfWeek(first);
        cells = Array.from({ length: 42 }, (_, index) => {
            const date = new Date(start);
            date.setDate(start.getDate() + index);
            return date;
        });
    }

    function groupDocs(docs: any[]): CalendarStatusMap {
        const grouped = new Map<string, Map<NotebookId, number>>();
        docs.forEach((doc) => {
            if (!doc.value || !notebooks.some((notebook) => notebook.id === doc.box)) return;
            const key = `${doc.value.slice(0, 4)}-${doc.value.slice(4, 6)}-${doc.value.slice(6, 8)}`;
            if (!grouped.has(key)) {
                grouped.set(key, new Map());
            }
            const dateGroup = grouped.get(key);
            dateGroup.set(doc.box, (dateGroup.get(doc.box) || 0) + 1);
        });

        const result: CalendarStatusMap = new Map();
        grouped.forEach((byNotebook, key) => {
            result.set(key, new Map(Array.from(byNotebook.entries()).map(([box, count]) => [box, count > 1 ? 'duplicate' : 'single'])));
        });
        return result;
    }

    async function refreshStatus() {
        notebooks = visibleNotebooks();
        if (cells.length === 0 || notebooks.length === 0) {
            status = new Map();
            return;
        }
        const docs = await listDailynote({
            after: cells[0],
            before: cells[cells.length - 1],
            limit: 2048,
        });
        status = groupDocs(docs);
    }

    async function refreshCalendar(force = false) {
        const key = `${mode}:${dateKey(anchorDate)}`;
        if (!force && key === refreshKey) {
            return;
        }
        refreshKey = key;
        buildCells();
        await tick();
        await refreshStatus();
    }

    function selectDate(date: Date, notebookId?: NotebookId) {
        dispatch('selectDate', { date, notebookId: notebookId || notebook?.id || notebooks[0]?.id });
    }

    function notebookStatus(statusMap: CalendarStatusMap, date: Date, notebookId: NotebookId): CalendarStatus | undefined {
        return statusMap.get(dateKey(date))?.get(notebookId);
    }

    function notebooksWithDailyNote(statusMap: CalendarStatusMap, date: Date): Array<{ notebook: Notebook; status: CalendarStatus }> {
        const byNotebook = statusMap.get(dateKey(date));
        if (!byNotebook) return [];
        return notebooks
            .filter((notebook) => byNotebook.has(notebook.id))
            .map((notebook) => ({ notebook, status: byNotebook.get(notebook.id) }));
    }

    $: if (mode && anchorDate) {
        refreshCalendar();
    }

    onMount(() => {
        refreshCalendar(true);
    });
</script>

<section class="dnt-view__calendar dnt-view__calendar--{mode}">
    <header class="dnt-view__calendar-head">
        <strong>{mode === 'week' ? i18n.DailyNoteView.Week : i18n.DailyNoteView.Month}</strong>
        <span>{i18n.DailyNoteView.Notebooks}: {notebooks.length}</span>
    </header>

    {#if mode === 'week'}
        <div class="dnt-view__calendar-week-grid">
            <div class="dnt-view__calendar-cell dnt-view__calendar-dow">{i18n.DailyNoteView.Notebook}</div>
            {#each ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as day, index}
                <div class:dnt-view__calendar-cell--today={isToday(cells[index])} class="dnt-view__calendar-cell dnt-view__calendar-dow">
                    <span>{day}</span>
                    <span class="dnt-view__calendar-date">{cells[index] ? shortDate(cells[index]) : ''}</span>
                </div>
            {/each}
            {#each notebooks as rowNotebook}
                <div class="dnt-view__calendar-cell dnt-view__calendar-notebook">{rowNotebook.name}</div>
                {#each cells as date}
                    {@const cellStatus = notebookStatus(status, date, rowNotebook.id)}
                    <button class:dnt-view__calendar-cell--today={isToday(date)} class="dnt-view__calendar-cell" on:click={() => selectDate(date, rowNotebook.id)}>
                        {#if cellStatus === 'single'}
                            <span class="dnt-view__calendar-pill">{i18n.DailyNoteView.exists}</span>
                        {:else if cellStatus === 'duplicate'}
                            <span class="dnt-view__calendar-pill dnt-view__calendar-pill--duplicate">{i18n.DailyNoteView.Duplicate}</span>
                        {:else}
                            <span class="dnt-view__calendar-empty">—</span>
                        {/if}
                    </button>
                {/each}
            {/each}
        </div>
    {:else}
        <div class="dnt-view__calendar-grid">
            {#each ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as day}
                <div class="dnt-view__calendar-cell dnt-view__calendar-dow">{day}</div>
            {/each}
            {#each cells as date}
                {@const dateNotebooks = notebooksWithDailyNote(status, date)}
                <div class:dnt-view__calendar-cell--today={isToday(date)} class="dnt-view__calendar-cell" on:click={() => selectDate(date)} on:keydown={() => {}}>
                    <span class="dnt-view__calendar-date">{date.getDate()}</span>
                    <div class="dnt-view__calendar-notebook-list">
                        {#each dateNotebooks.slice(0, 4) as item}
                            <button class:dnt-view__calendar-notebook-label--duplicate={item.status === 'duplicate'} class="dnt-view__calendar-notebook-label" on:click|stopPropagation={() => selectDate(date, item.notebook.id)}>
                                {item.status === 'duplicate' ? '⚠ ' : ''}{item.notebook.name}
                            </button>
                        {/each}
                        {#if dateNotebooks.length > 4}
                            <span class="dnt-view__calendar-more">+{dateNotebooks.length - 4}</span>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</section>
