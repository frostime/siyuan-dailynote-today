<script lang="ts">
    import { addDays, buildLaneSeeds, dateKey, defaultDailyNoteViewState, normalizeDate, visibleNotebooks } from "@/func/dailynote-view/state";
    import { resolveExistingTimelineWindow } from "@/func/dailynote-view/resolver";
    import type { ExistingTimelineWindow } from "@/func/dailynote-view/resolver";
    import { i18n } from "@/utils";
    import ViewToolbar from "./view-toolbar.svelte";
    import ViewContextControl from "./view-context-control.svelte";
    import ContentLanes from "./content-lanes.svelte";
    import CalendarGrid from "./calendar-grid.svelte";

    type PendingCell = {
        key: string;
        cell: DailyNoteCell;
    };

    // The calendar has already resolved this cell. Keep one pending result for
    // the first lane render instead of immediately querying the same target again.
    function createPendingCellBuffer() {
        let pending: PendingCell | null = null;

        return {
            remember(key: string, cell: DailyNoteCell) {
                pending = { key, cell };
            },
            apply(seeds: DailyNoteLane[]): DailyNoteLane[] {
                if (!pending) return seeds;

                const index = seeds.findIndex((seed) => seed.key === pending.key);
                if (index < 0) {
                    pending = null;
                    return seeds;
                }

                const next = seeds.slice();
                next[index] = { ...next[index], cell: pending.cell };
                pending = null;
                return next;
            },
            clear() {
                pending = null;
            },
        };
    }

    export let app: any;

    let state: DailyNoteViewState = defaultDailyNoteViewState();
    let lanes: DailyNoteLane[] = [];
    const pendingCells = createPendingCellBuffer();
    let loadingTimeline = false;
    let statusRevision = 0;
    let contentRequestKey = '';
    let timelineWindow: ExistingTimelineWindow = { dates: [], previousStart: null, nextStart: null };

    // ── Derived view state ────────────────────────────────────────────────────

    $: refreshContent(state);
    $: visibleDates = lanes.map((lane) => lane.date);
    $: canNavigatePrevious = state.form !== 'content'
        || state.contentMode !== 'timeline'
        || state.timelineFilter !== 'existing'
        || timelineWindow.previousStart !== null;
    $: canNavigateNext = state.form !== 'content'
        || state.contentMode !== 'timeline'
        || state.timelineFilter !== 'existing'
        || timelineWindow.nextStart !== null;

    // ── State transitions ─────────────────────────────────────────────────────

    function setState(next: DailyNoteViewState) {
        const available = visibleNotebooks();
        const availableIds = new Set(available.map((notebook) => notebook.id));
        const fallbackId = available[0]?.id;
        const dayNotebookIds = next.dayNotebookIds.filter((id) => availableIds.has(id));
        state = {
            ...next,
            anchorDate: normalizeDate(next.anchorDate),
            timelineNotebookId: availableIds.has(next.timelineNotebookId) ? next.timelineNotebookId : fallbackId,
            dayNotebookIds: dayNotebookIds.length > 0 ? dayNotebookIds : fallbackId ? [fallbackId] : [],
        };
    }

    function navigate(offset: number) {
        if (state.form === 'calendar') {
            const date = new Date(state.anchorDate);
            if (state.span === 'week') date.setDate(date.getDate() + offset * 7);
            else if (state.span === 'month') date.setMonth(date.getMonth() + offset, 1);
            else date.setFullYear(date.getFullYear() + offset, 0, 1);
            setState({ ...state, anchorDate: date });
            return;
        }

        if (state.contentMode === 'timeline' && state.timelineFilter === 'existing') {
            const target = offset < 0 ? timelineWindow.previousStart : timelineWindow.nextStart;
            if (target) setState({ ...state, anchorDate: target });
            return;
        }
        setState({ ...state, anchorDate: addDays(state.anchorDate, offset) });
    }

    function selectCalendarDate(event: CustomEvent<{ date: Date; notebookId: NotebookId; cell?: DailyNoteCell }>) {
        if (event.detail.cell) {
            pendingCells.remember(`${dateKey(event.detail.date)}:${event.detail.notebookId}`, event.detail.cell);
        }
        setState({
            ...state,
            form: 'content',
            contentMode: 'day',
            daySelection: 'single',
            dayNotebookIds: [event.detail.notebookId],
            anchorDate: event.detail.date,
        });
    }

    function selectCalendarMonth(event: CustomEvent<Date>) {
        setState({ ...state, span: 'month', anchorDate: event.detail });
    }

    // ── Content loading ───────────────────────────────────────────────────────

    async function refreshContent(nextState: DailyNoteViewState) {
        const key = [
            nextState.form,
            nextState.contentMode,
            nextState.timelineFilter,
            nextState.timelineNotebookId,
            nextState.timelineCount,
            dateKey(nextState.anchorDate),
            nextState.dayNotebookIds.join(','),
        ].join(':');
        if (key === contentRequestKey) return;
        contentRequestKey = key;

        if (nextState.form === 'content' && nextState.contentMode === 'timeline' && !nextState.timelineNotebookId) {
            loadingTimeline = false;
            timelineWindow = { dates: [], previousStart: null, nextStart: null };
            pendingCells.clear();
            lanes = [];
            return;
        }

        if (nextState.form !== 'content' || nextState.contentMode !== 'timeline' || nextState.timelineFilter !== 'existing') {
            loadingTimeline = false;
            timelineWindow = { dates: [], previousStart: null, nextStart: null };
            lanes = pendingCells.apply(buildLaneSeeds(nextState));
            return;
        }

        loadingTimeline = true;
        timelineWindow = { dates: [], previousStart: null, nextStart: null };
        lanes = [];
        try {
            const resolved = await resolveExistingTimelineWindow(
                nextState.timelineNotebookId,
                nextState.anchorDate,
                nextState.timelineCount,
            );
            if (key !== contentRequestKey) return;
            timelineWindow = resolved;
            lanes = pendingCells.apply(buildLaneSeeds(nextState, resolved.dates));
        } catch (error) {
            if (key === contentRequestKey) {
                timelineWindow = { dates: [], previousStart: null, nextStart: null };
                lanes = [];
            }
            console.error(error);
        } finally {
            if (key === contentRequestKey) loadingTimeline = false;
        }
    }

</script>

<div class="dnt-view fn__flex-1 fn__flex-column">
    <ViewToolbar
        {state}
        {visibleDates}
        {canNavigatePrevious}
        {canNavigateNext}
        {statusRevision}
        on:state={(event) => setState(event.detail)}
        on:navigate={(event) => navigate(event.detail)}
        on:today={() => setState({ ...state, anchorDate: new Date() })}
    />

    {#if state.form === 'content'}
        {#if loadingTimeline}
            <div class="dnt-view__empty">Loading...</div>
        {:else if state.contentMode === 'timeline' && state.timelineFilter === 'existing' && lanes.length === 0}
            <div class="dnt-view__empty"><strong>{i18n.DailyNoteView.NoExistingNotes}</strong><span>{i18n.DailyNoteView.SwitchToDaily}</span></div>
        {:else}
            <ContentLanes {app} {lanes} on:created={() => statusRevision += 1} />
        {/if}
    {:else}
        <CalendarGrid
            span={state.span}
            anchorDate={state.anchorDate}
            on:selectDate={selectCalendarDate}
            on:selectMonth={selectCalendarMonth}
        />
    {/if}

    <ViewContextControl {state} on:state={(event) => setState(event.detail)} />
</div>
