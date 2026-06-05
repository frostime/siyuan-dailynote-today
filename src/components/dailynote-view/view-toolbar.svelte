<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { i18n } from "@/utils";
    import { addDays, dateKey, isFutureDate, shiftNotebook, todayDate } from "@/func/dailynote-view/state";

    export let state: DailyNoteViewState;
    export let notebook: Notebook;

    const dispatch = createEventDispatcher<{
        preset: 'today' | 'three-days' | 'notebooks' | 'week' | 'month';
        state: DailyNoteViewState;
    }>();

    $: isAnchorToday = dateKey(state.anchorDate) === dateKey(todayDate());
    $: activePreset = (() => {
        if (state.mode === 'week') return 'week';
        if (state.mode === 'month') return 'month';
        if (state.axis === 'notebook') return 'notebooks';
        if (state.count === 3) return 'three-days';
        return isAnchorToday ? 'today' : 'day';
    })();
    $: activeModeLabel = (() => {
        if (state.mode === 'week') return i18n.DailyNoteView.Week;
        if (state.mode === 'month') return i18n.DailyNoteView.Month;
        if (state.axis === 'notebook') return i18n.DailyNoteView.Notebooks;
        if (state.count === 3) return i18n.DailyNoteView.ThreeDays;
        return isAnchorToday ? i18n.DailyNoteView.Today : dateKey(state.anchorDate);
    })();
    $: canShiftDateForward = !isFutureDate(addDays(state.anchorDate, 1));
    $: showNotebookNav = state.mode === 'content' && state.axis === 'time';
    $: showContentOptions = state.mode === 'content';

    function presetClass(preset: string) {
        return `b3-button b3-button--outline ${activePreset === preset ? 'dnt-view__button--active' : ''}`;
    }

    function shiftDate(days: number) {
        const date = addDays(state.anchorDate, days);
        if (isFutureDate(date)) {
            return;
        }
        dispatch('state', { ...state, anchorDate: date });
    }

    function setToday() {
        dispatch('state', { ...state, anchorDate: todayDate() });
    }

    function shiftNotebookBy(offset: number) {
        dispatch('state', { ...state, anchorNotebookId: shiftNotebook(state.anchorNotebookId, offset) });
    }
</script>

<header class="dnt-view__toolbar">
    <div class="dnt-view__title">
        <span>{i18n.DailyNoteView.title}</span>
        <span class="dnt-view__mode-chip">{activeModeLabel}</span>
    </div>
    <div class="dnt-view__presets">
        <button class={presetClass('today')} on:click={() => dispatch('preset', 'today')}>{i18n.DailyNoteView.Today}</button>
        <button class={presetClass('three-days')} on:click={() => dispatch('preset', 'three-days')}>{i18n.DailyNoteView.ThreeDays}</button>
        <button class={presetClass('notebooks')} on:click={() => dispatch('preset', 'notebooks')}>{i18n.DailyNoteView.Notebooks}</button>
        <button class={presetClass('week')} on:click={() => dispatch('preset', 'week')}>{i18n.DailyNoteView.Week}</button>
        <button class={presetClass('month')} on:click={() => dispatch('preset', 'month')}>{i18n.DailyNoteView.Month}</button>
    </div>
    <div class="dnt-view__controls">
        <div class="dnt-view__control-group">
            <button class="b3-button b3-button--outline" on:click={() => shiftDate(-1)}>‹</button>
            <span class="dnt-view__chip">{dateKey(state.anchorDate)}</span>
            <button class="b3-button b3-button--outline" disabled={!canShiftDateForward} on:click={() => shiftDate(1)}>›</button>
            <button class="b3-button b3-button--outline" disabled={isAnchorToday} on:click={setToday}>{i18n.DailyNoteView.Today}</button>
        </div>

        <div class="dnt-view__control-group">
            <span>{i18n.DailyNoteView.Notebook}</span>
            {#if showNotebookNav}
                <button class="b3-button b3-button--outline" on:click={() => shiftNotebookBy(-1)}>‹</button>
            {/if}
            <span class="dnt-view__chip">{state.mode !== 'content' || state.axis === 'notebook' ? i18n.DailyNoteView.Notebooks : notebook?.name || '-'}</span>
            {#if showNotebookNav}
                <button class="b3-button b3-button--outline" on:click={() => shiftNotebookBy(1)}>›</button>
            {/if}
        </div>

        {#if showContentOptions}
            <div class="dnt-view__control-group dnt-view__control-group--end">
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
        {/if}
    </div>
</header>
