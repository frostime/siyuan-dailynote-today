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
        if (span === 'year') {
            return [new Date(anchorDate.getFullYear(), 0, 1), new Date(anchorDate.getFullYear(), 11, 31)];
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

    function notebookName(id: NotebookId): string {
        return visibleNotebooks().find((item) => item.id === id)?.name || id;
    }

    function isToday(date: Date): boolean {
        return dateKey(date) === dateKey(todayDate());
    }

    function isOutsideMonth(date: Date, month: number): boolean {
        return date.getMonth() !== month;
    }

    function selectDate(date: Date, doc?: DailyNoteDocument) {
        dispatch('selectDate', { date, notebookId: doc?.box, docId: doc?.id });
    }

    async function refresh() {
        const [after, before] = periodRange();
        const key = `${span}:${dateKey(after)}:${dateKey(before)}:${notebookScope}:${notebookId}`;
        if (key === refreshKey) return;
        refreshKey = key;
        const docs = await listDailynote({
            boxId: notebookScope === 'single' ? notebookId : undefined,
            after,
            before,
            limit: span === 'year' ? 4096 : 2048,
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
        <span>{i18n.DailyNoteView.CalendarHint}</span>
    </header>

    {#if span === 'year'}
        <div class="dnt-view__year-grid">
            {#each Array.from({ length: 12 }, (_, index) => index) as month}
                <section class="dnt-view__mini-month">
                    <strong>{month + 1} {i18n.DailyNoteView.Month}</strong>
                    <div class="dnt-view__mini-grid">
                        {#each ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as day}<span class="dnt-view__mini-dow">{day}</span>{/each}
                        {#each monthCells(anchorDate.getFullYear(), month) as date}
                            <button
                                class:dnt-view__mini-day--outside={isOutsideMonth(date, month)}
                                class:dnt-view__mini-day--today={isToday(date)}
                                class:dnt-view__mini-day--marked={docsFor(date).length > 0}
                                class="dnt-view__mini-day"
                                disabled={isOutsideMonth(date, month)}
                                on:click={() => selectDate(date)}
                            >{date.getDate()}</button>
                        {/each}
                    </div>
                </section>
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
                        {#each docsFor(date).slice(0, 4) as doc}
                            <button class="dnt-view__calendar-notebook-label" on:click|stopPropagation={() => selectDate(date, doc)}>
                                {notebookName(doc.box)}
                            </button>
                        {/each}
                        {#if docsFor(date).length > 4}
                            <span class="dnt-view__calendar-more">+{docsFor(date).length - 4}</span>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</section>
