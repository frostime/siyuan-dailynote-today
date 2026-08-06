<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { listDailynote } from "@frostime/siyuan-plugin-kits";
    import { addDays, dailyNoteDateKey, dateKey, normalizeDate, todayDate, visibleNotebooks } from "@/func/dailynote-view/state";
    import { i18n } from "@/utils";

    export let span: DailyNoteViewSpan;
    export let anchorDate: Date;
    export let notebookScope: DailyNoteViewNotebookScope;
    export let notebookId: NotebookId;

    const dispatch = createEventDispatcher<{
        selectDate: { date: Date; notebookId?: NotebookId; docId?: DocumentId };
        selectMonth: { date: Date };
    }>();

    let documentsByDate = new Map<string, DailyNoteDocument[]>();
    let refreshKey = '';

    function startOfWeek(date: Date): Date {
        const start = normalizeDate(date);
        const day = start.getDay() || 7;
        start.setDate(start.getDate() - day + 1);
        return start;
    }

    function periodRange(): [Date, Date] {
        if (span === 'week') {
            const start = startOfWeek(anchorDate);
            return [start, addDays(start, 6)];
        }
        const first = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
        const start = startOfWeek(first);
        return [start, addDays(start, 41)];
    }

    function monthCells(year: number, month: number, fixedWeeks = false): Date[] {
        const first = new Date(year, month, 1);
        const start = startOfWeek(first);
        const count = fixedWeeks ? 42 : Math.ceil(((first.getDay() || 7) - 1 + new Date(year, month + 1, 0).getDate()) / 7) * 7;
        return Array.from({ length: count }, (_, index) => addDays(start, index));
    }

    function docsFor(date: Date): DailyNoteDocument[] {
        return documentsByDate.get(dateKey(date)) || [];
    }

    function notebookEntriesFor(date: Date): Array<{ doc: DailyNoteDocument; duplicate: boolean }> {
        const byNotebook = new Map<NotebookId, DailyNoteDocument[]>();
        docsFor(date).forEach((doc) => byNotebook.set(doc.box, [...(byNotebook.get(doc.box) || []), doc]));
        return Array.from(byNotebook.values()).map((docs) => {
            const sorted = docs.slice().sort((a, b) => a.created.localeCompare(b.created));
            return { doc: sorted[0], duplicate: sorted.length > 1 };
        });
    }

    function notebookName(id: NotebookId): string {
        return visibleNotebooks().find((item) => item.id === id)?.name || id;
    }

    function isToday(date: Date): boolean {
        return dateKey(date) === dateKey(todayDate());
    }

    function isOutsideMonth(date: Date, month: number): boolean {
        return date.getMonth() !== month;
    }

    function selectMonth(month: number) {
        dispatch('selectMonth', { date: new Date(anchorDate.getFullYear(), month, 1) });
    }

    function selectDate(date: Date, doc?: DailyNoteDocument) {
        dispatch('selectDate', { date, notebookId: doc?.box, docId: doc?.id });
    }

    async function refresh() {
        if (span === 'year') {
            refreshKey = `year:${anchorDate.getFullYear()}`;
            documentsByDate = new Map();
            return;
        }
        const [after, before] = periodRange();
        const key = `${span}:${dateKey(after)}:${dateKey(before)}:${notebookScope}:${notebookId}`;
        if (key === refreshKey) return;
        refreshKey = key;
        const docs = await listDailynote({
            boxId: notebookScope === 'single' ? notebookId : undefined,
            after,
            before,
            limit: 2048,
        }) as DailyNoteDocument[];
        if (key !== refreshKey) return;
        const visibleIds = new Set(visibleNotebooks().map((item) => item.id));
        const grouped = new Map<string, DailyNoteDocument[]>();
        docs.forEach((doc) => {
            const key = dailyNoteDateKey(doc);
            if (!key || !visibleIds.has(doc.box)) return;
            grouped.set(key, [...(grouped.get(key) || []), doc]);
        });
        documentsByDate = grouped;
    }

    $: if (span && anchorDate && notebookId) refresh();
    $: weekCells = Array.from({ length: 7 }, (_, index) => addDays(startOfWeek(anchorDate), index));
    $: calendarMonthCells = monthCells(anchorDate.getFullYear(), anchorDate.getMonth(), true);
</script>

<section class="dnt-view__calendar dnt-view__calendar--{span}">
    <header class="dnt-view__calendar-head">
        <strong>{span === 'week' ? i18n.DailyNoteView.Week : span === 'month' ? i18n.DailyNoteView.Month : i18n.DailyNoteView.Year}</strong>
        <span>{span === 'year' ? i18n.DailyNoteView.YearHint : i18n.DailyNoteView.CalendarHint}</span>
    </header>

    {#if span === 'year'}
        <div class="dnt-view__year-grid">
            {#each Array.from({ length: 12 }, (_, index) => index) as month}
                <button class="dnt-view__year-month" on:click={() => selectMonth(month)}>
                    <strong>{month + 1} {i18n.DailyNoteView.Month}</strong>
                </button>
            {/each}
        </div>
    {:else}
        <div class="dnt-view__calendar-grid">
            {#each ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as day}
                <div class="dnt-view__calendar-cell dnt-view__calendar-dow">{day}</div>
            {/each}
            {#each span === 'week' ? weekCells : calendarMonthCells as date}
                <div
                    class:dnt-view__calendar-cell--today={isToday(date)}
                    class:dnt-view__calendar-cell--outside={span === 'month' && isOutsideMonth(date, anchorDate.getMonth())}
                    class="dnt-view__calendar-cell"
                    role="button"
                    tabindex="0"
                    on:click={() => selectDate(date)}
                    on:keydown={(event) => (event.key === 'Enter' || event.key === ' ') && selectDate(date)}
                >
                    <span class="dnt-view__calendar-date">{date.getDate()}</span>
                    <div class="dnt-view__calendar-notebook-list">
                        {#each notebookEntriesFor(date).slice(0, 4) as entry}
                            <button class="dnt-view__calendar-notebook-label" on:click|stopPropagation={() => selectDate(date, entry.doc)}>
                                {entry.duplicate ? '⚠ ' : ''}{notebookName(entry.doc.box)}
                            </button>
                        {/each}
                        {#if notebookEntriesFor(date).length > 4}
                            <span class="dnt-view__calendar-more">+{notebookEntriesFor(date).length - 4}</span>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</section>
