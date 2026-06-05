<script lang="ts">
    import { applyPreset, buildLaneSeeds, defaultDailyNoteViewState, findNotebook, normalizeDate } from "@/func/dailynote-view/state";
    import ViewToolbar from "./view-toolbar.svelte";
    import ContentLanes from "./content-lanes.svelte";
    import CalendarGrid from "./calendar-grid.svelte";

    export let app: any;

    let state: DailyNoteViewState = defaultDailyNoteViewState();

    $: notebook = findNotebook(state.anchorNotebookId);
    $: lanes = buildLaneSeeds(state);

    function setState(next: DailyNoteViewState) {
        state = {
            ...next,
            anchorDate: normalizeDate(next.anchorDate),
            count: next.axis === 'time' && next.count === 'all' ? 1 : next.count,
        };
    }

    function setPreset(event: CustomEvent<'today' | 'three-days' | 'notebooks' | 'week' | 'month'>) {
        setState(applyPreset(state, event.detail));
    }

    function selectCalendarDate(event: CustomEvent<Date>) {
        setState({
            ...state,
            mode: 'content',
            anchorDate: event.detail,
        });
    }
</script>

<div class="dnt-view fn__flex-1 fn__flex-column">
    <ViewToolbar {state} {notebook} on:preset={setPreset} on:state={(event) => setState(event.detail)} />
    {#if state.mode === 'content'}
        <ContentLanes {app} {lanes} />
    {:else}
        <CalendarGrid mode={state.mode} anchorDate={state.anchorDate} {notebook} on:selectDate={selectCalendarDate} />
    {/if}
</div>
