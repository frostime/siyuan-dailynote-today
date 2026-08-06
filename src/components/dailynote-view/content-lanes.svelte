<script lang="ts">
    import { createEventDispatcher, onDestroy, onMount } from "svelte";
    import { eventBus } from "@/event-bus";
    import { dateKey } from "@/func/dailynote-view/state";
    import { dailyNoteViewLaneMinWidth } from "@/func/dailynote-view/settings";
    import { i18n } from "@/utils";
    import DailyNoteLane from "./daily-note-lane.svelte";

    export let app: any;
    export let state: DailyNoteViewState;
    export let lanes: DailyNoteLane[] = [];
    export let loading = false;

    const dispatch = createEventDispatcher<{
        selectDocument: { docId: DocumentId; date: Date; notebookId: NotebookId };
        create: void;
    }>();

    let laneMinWidth = dailyNoteViewLaneMinWidth();

    function primaryDoc(lane: DailyNoteLane): DocBlock {
        return lane.cell.status === 'single' ? lane.cell.doc : lane.cell.primary;
    }

    function selectLane(lane: DailyNoteLane) {
        dispatch('selectDocument', {
            docId: primaryDoc(lane).id,
            date: lane.date,
            notebookId: lane.notebook.id,
        });
    }

    function updateLaneMinWidth() {
        laneMinWidth = dailyNoteViewLaneMinWidth();
    }

    function onSettingChanged(data: { key: SettingKey }) {
        if (data.key === 'DailyNoteViewLaneMinWidth') updateLaneMinWidth();
    }

    onMount(() => {
        eventBus.subscribe(eventBus.EventSetting, onSettingChanged);
        updateLaneMinWidth();
    });

    onDestroy(() => eventBus.unSubscribe(eventBus.EventSetting, onSettingChanged));

    $: selectedLane = lanes.find((lane) => primaryDoc(lane).id === state.selectedDocId) || lanes[0];
</script>

<section class="dnt-view__content">
    <header class="dnt-view__content-head">
        <div>
            <div class="dnt-view__content-title-row">
                <strong>{state.group === 'day' ? dateKey(state.anchorDate) : i18n.DailyNoteView.Sequence}</strong>
                <span class="dnt-view__result-count">{lanes.length} {i18n.DailyNoteView.Documents}</span>
                {#if state.layout === 'single'}
                    <div class="dnt-view__document-tabs">
                        {#each lanes as lane (lane.key)}
                            <button class:dnt-view__document-tab--on={lane === selectedLane} on:click={() => selectLane(lane)}>
                                {state.group === 'day' ? lane.notebook.name : dateKey(lane.date)}
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>
            <span class="dnt-view__content-subtitle">
                {state.group === 'day' ? i18n.DailyNoteView.SameDayHint : i18n.DailyNoteView.SequenceHint}
            </span>
        </div>
        <button class="b3-button b3-button--outline" on:click={() => dispatch('create')}>+ {i18n.DailyNoteView.CreateForDate}</button>
    </header>

    {#if loading && lanes.length === 0}
        <div class="dnt-view__empty">Loading...</div>
    {:else if state.group === 'sequence' && state.notebookScope === 'all'}
        <div class="dnt-view__empty">
            <strong>{i18n.DailyNoteView.SelectNotebook}</strong>
            <span>{i18n.DailyNoteView.SelectNotebookHint}</span>
        </div>
    {:else if lanes.length === 0}
        <div class="dnt-view__empty">
            <strong>{i18n.DailyNoteView.NoDocuments}</strong>
            <span>{i18n.DailyNoteView.MissingHint}</span>
            <button class="b3-button b3-button--text" on:click={() => dispatch('create')}>+ {i18n.DailyNoteView.CreateDailyNote}</button>
        </div>
    {:else if state.layout === 'single'}
        <div class="dnt-view__single">
            {#if selectedLane}<DailyNoteLane {app} lane={selectedLane} />{/if}
        </div>
    {:else if state.layout === 'columns'}
        <div class="dnt-view__lanes" style="--dnt-view-lane-count: {Math.min(lanes.length, state.columnCount)}; --dnt-view-lane-min-width: {laneMinWidth};">
            {#each lanes as lane (lane.key)}
                <DailyNoteLane {app} {lane} />
            {/each}
        </div>
    {:else}
        <div class="dnt-view__cards">
            {#each lanes as lane (lane.key)}
                {@const doc = primaryDoc(lane)}
                <button class="dnt-view__card" on:click={() => selectLane(lane)}>
                    <span class="dnt-view__card-meta">{lane.notebook.name} · {dateKey(lane.date)}</span>
                    <strong>{doc.content || doc.hpath || doc.id}</strong>
                    <span class="dnt-view__card-path">{doc.hpath}</span>
                    <span class="dnt-view__card-open">{i18n.DailyNoteView.OpenDocument} →</span>
                </button>
            {/each}
        </div>
    {/if}
</section>
