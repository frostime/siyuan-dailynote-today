<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { i18n } from "@/utils";
    import { dateKey, shiftNotebook } from "@/func/dailynote-view/state";

    export let state: DailyNoteViewState;
    export let notebook: Notebook;

    const dispatch = createEventDispatcher<{
        preset: 'today' | 'three-days' | 'notebooks' | 'week' | 'month';
        state: DailyNoteViewState;
    }>();

    function shiftDate(days: number) {
        const date = new Date(state.anchorDate);
        date.setDate(date.getDate() + days);
        dispatch('state', { ...state, anchorDate: date });
    }

    function setToday() {
        dispatch('state', { ...state, anchorDate: new Date() });
    }

    function shiftNotebookBy(offset: number) {
        dispatch('state', { ...state, anchorNotebookId: shiftNotebook(state.anchorNotebookId, offset) });
    }
</script>

<header class="dnt-view__toolbar">
    <div class="dnt-view__title">{i18n.DailyNoteView.title}</div>
    <div class="dnt-view__presets">
        <button class="b3-button b3-button--outline" on:click={() => dispatch('preset', 'today')}>{i18n.DailyNoteView.Today}</button>
        <button class="b3-button b3-button--outline" on:click={() => dispatch('preset', 'three-days')}>{i18n.DailyNoteView.ThreeDays}</button>
        <button class="b3-button b3-button--outline" on:click={() => dispatch('preset', 'notebooks')}>{i18n.DailyNoteView.Notebooks}</button>
        <button class="b3-button b3-button--outline" on:click={() => dispatch('preset', 'week')}>{i18n.DailyNoteView.Week}</button>
        <button class="b3-button b3-button--outline" on:click={() => dispatch('preset', 'month')}>{i18n.DailyNoteView.Month}</button>
    </div>
    <div class="dnt-view__controls">
        <button class="b3-button b3-button--outline" on:click={() => shiftDate(-1)}>‹</button>
        <span class="dnt-view__chip">{dateKey(state.anchorDate)}</span>
        <button class="b3-button b3-button--outline" on:click={() => shiftDate(1)}>›</button>
        <button class="b3-button b3-button--outline" on:click={setToday}>{i18n.DailyNoteView.Today}</button>
        <span>{i18n.DailyNoteView.Notebook}</span>
        <button class="b3-button b3-button--outline" on:click={() => shiftNotebookBy(-1)}>‹</button>
        <span class="dnt-view__chip">{notebook?.name || '-'}</span>
        <button class="b3-button b3-button--outline" on:click={() => shiftNotebookBy(1)}>›</button>
        <span>{i18n.DailyNoteView.Expand}</span>
        <select class="b3-select" bind:value={state.axis} on:change={() => dispatch('state', state)}>
            <option value="time">time</option>
            <option value="notebook">notebook</option>
        </select>
        <span>{i18n.DailyNoteView.Count}</span>
        <select class="b3-select" bind:value={state.count} on:change={() => dispatch('state', state)}>
            <option value={1}>1</option>
            <option value={3}>3</option>
            <option value={5}>5</option>
            <option value="all" disabled={state.axis !== 'notebook'}>All</option>
        </select>
    </div>
</header>
