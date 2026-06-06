<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { i18n } from "@/utils";
    import { addDays, dateKey, isFutureDate, todayDate, visibleNotebooks } from "@/func/dailynote-view/state";

    export let state: DailyNoteViewState;

    const dispatch = createEventDispatcher<{
        preset: 'today' | 'three-days' | 'notebooks' | 'week' | 'month';
        state: DailyNoteViewState;
    }>();

    function startOfWeek(date: Date): Date {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const day = start.getDay() || 7;
        start.setDate(start.getDate() - day + 1);
        return start;
    }

    function endOfWeek(date: Date): Date {
        return addDays(startOfWeek(date), 6);
    }

    function startOfMonth(date: Date): Date {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    }

    function addMonths(date: Date, months: number): Date {
        return new Date(date.getFullYear(), date.getMonth() + months, 1);
    }

    function monthKey(date: Date): string {
        return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`;
    }

    // function periodStartAfterShift(offset: number): Date {
    //     if (state.mode === 'week') {
    //         return startOfWeek(addDays(state.anchorDate, offset * 7));
    //     }
    //     if (state.mode === 'month') {
    //         return startOfMonth(addMonths(state.anchorDate, offset));
    //     }
    //     return addDays(state.anchorDate, offset);
    // }

    function periodTargetAfterShift(offset: number): Date {
        if (state.mode === 'week') {
            return addDays(state.anchorDate, offset * 7);
        }
        if (state.mode === 'month') {
            return addMonths(state.anchorDate, offset);
        }
        return addDays(state.anchorDate, offset);
    }

    $: isAnchorToday = dateKey(state.anchorDate) === dateKey(todayDate());
    $: isCurrentPeriod = (() => {
        if (state.mode === 'week') return dateKey(startOfWeek(state.anchorDate)) === dateKey(startOfWeek(todayDate()));
        if (state.mode === 'month') return monthKey(state.anchorDate) === monthKey(todayDate());
        return isAnchorToday;
    })();
    $: periodLabel = (() => {
        if (state.mode === 'week') return `${dateKey(startOfWeek(state.anchorDate))} ~ ${dateKey(endOfWeek(state.anchorDate))}`;
        if (state.mode === 'month') return monthKey(state.anchorDate);
        return dateKey(state.anchorDate);
    })();
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
    $: canShiftDateForward = (() => {
        const mode = state.mode;
        const anchorDate = state.anchorDate;
        if (mode === 'week') {
            return !isFutureDate(startOfWeek(addDays(anchorDate, 7)));
        }
        if (mode === 'month') {
            return !isFutureDate(startOfMonth(addMonths(anchorDate, 1)));
        }
        return !isFutureDate(addDays(anchorDate, 1));
    })();
    $: notebookOptions = visibleNotebooks();
    $: showNotebookSelector = state.mode === 'content' && state.axis === 'time';
    $: showContentOptions = state.mode === 'content';

    function presetClass(preset: string) {
        return `b3-button b3-button--outline ${activePreset === preset ? 'dnt-view__button--active' : ''}`;
    }

    function shiftDate(offset: number) {
        if (offset > 0 && !canShiftDateForward) {
            return;
        }
        dispatch('state', { ...state, anchorDate: periodTargetAfterShift(offset) });
    }

    function setToday() {
        dispatch('state', { ...state, anchorDate: todayDate() });
    }

    function selectNotebook(event: Event) {
        dispatch('state', { ...state, anchorNotebookId: (event.currentTarget as HTMLSelectElement).value });
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
            <span class="dnt-view__chip">{periodLabel}</span>
            <button class="b3-button b3-button--outline" disabled={!canShiftDateForward} on:click={() => shiftDate(1)}>›</button>
            <button class="b3-button b3-button--outline" disabled={isCurrentPeriod} on:click={setToday}>{i18n.DailyNoteView.Today}</button>
        </div>

        {#if showNotebookSelector}
            <div class="dnt-view__control-group">
                <span>{i18n.DailyNoteView.Notebook}</span>
                <select class="b3-select" value={state.anchorNotebookId} on:change={selectNotebook}>
                    {#each notebookOptions as option}
                        <option value={option.id}>{option.name}</option>
                    {/each}
                </select>
            </div>
        {/if}

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
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={5}>5</option>
                    <option value="all" disabled={state.axis !== 'notebook'}>All</option>
                </select>
            </div>
        {/if}
    </div>
</header>
