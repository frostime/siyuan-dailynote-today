<script lang="ts">
    import { listDailynote } from "@frostime/siyuan-plugin-kits";
    import { buildLaneSeeds, clampToToday, dateKey, defaultDailyNoteViewState, findNotebook } from "@/func/dailynote-view/state";
    import type { LaneSeed } from "@/func/dailynote-view/state";
    import ViewToolbar from "./view-toolbar.svelte";
    import ContentLanes from "./content-lanes.svelte";
    import CalendarGrid from "./calendar-grid.svelte";

    export let app: any;

    let state: DailyNoteViewState = defaultDailyNoteViewState();
    let lanes: LaneSeed[] = [];
    let notebookPriorityKey = '';

    $: notebook = findNotebook(state.anchorNotebookId);
    $: baseLanes = buildLaneSeeds(state);
    $: updateLanes(state, baseLanes);

    function setState(next: DailyNoteViewState) {
        state = {
            ...next,
            anchorDate: clampToToday(next.anchorDate),
        };
    }

    function sortNotebookLanesByExisting(lanes: LaneSeed[], existingNotebookIds: Set<NotebookId>): LaneSeed[] {
        return lanes
            .map((lane, index) => ({ lane, index }))
            .sort((a, b) => {
                const aExists = existingNotebookIds.has(a.lane.notebook.id) ? 1 : 0;
                const bExists = existingNotebookIds.has(b.lane.notebook.id) ? 1 : 0;
                return bExists - aExists || a.index - b.index;
            })
            .map((item) => item.lane);
    }

    async function dailyNoteNotebookIds(date: Date): Promise<Set<NotebookId>> {
        const docs = await listDailynote({ after: date, before: date, limit: 2048 });
        return new Set(docs.map((doc: any) => doc.box));
    }

    async function updateLanes(nextState: DailyNoteViewState, nextLanes: LaneSeed[]) {
        if (nextState.form !== 'content' || nextState.axis !== 'notebook') {
            notebookPriorityKey = '';
            lanes = nextLanes;
            return;
        }

        const key = `${dateKey(nextState.anchorDate)}:${nextLanes.map((lane) => lane.notebook.id).join(',')}`;
        if (key === notebookPriorityKey) {
            return;
        }
        notebookPriorityKey = key;
        lanes = nextLanes;

        const existingNotebookIds = await dailyNoteNotebookIds(nextState.anchorDate);
        if (key !== notebookPriorityKey) {
            return;
        }
        lanes = sortNotebookLanesByExisting(nextLanes, existingNotebookIds);
    }

    function selectCalendarDate(event: CustomEvent<{ date: Date; notebookId: NotebookId }>) {
        setState({
            ...state,
            form: 'content',
            anchorDate: event.detail.date,
            anchorNotebookId: event.detail.notebookId,
            axis: 'time',
            timeCount: 1,
        });
    }
</script>

<div class="dnt-view fn__flex-1 fn__flex-column">
    <ViewToolbar {state} on:state={(event) => setState(event.detail)} />
    {#if state.form === 'content'}
        <ContentLanes {app} {lanes} />
    {:else}
        <CalendarGrid span={state.span} anchorDate={state.anchorDate} {notebook} on:selectDate={selectCalendarDate} />
    {/if}
</div>
