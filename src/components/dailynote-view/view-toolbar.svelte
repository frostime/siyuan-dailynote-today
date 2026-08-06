<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { addDays, dateKey, todayDate } from "@/func/dailynote-view/state";
    import { i18n } from "@/utils";
    import NotebookStatusPanel from "./notebook-status-panel.svelte";

    export let state: DailyNoteViewState;
    export let visibleDates: Date[] = [];
    export let canNavigatePrevious = true;
    export let canNavigateNext = true;
    export let contentRevision = 0;

    const dispatch = createEventDispatcher<{
        state: DailyNoteViewState;
        navigate: number;
        today: void;
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

    function monthKey(date: Date): string {
        return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`;
    }

    $: periodLabel = (() => {
        if (state.form === 'calendar') {
            if (state.span === 'week') return `${dateKey(startOfWeek(state.anchorDate))} ~ ${dateKey(endOfWeek(state.anchorDate))}`;
            if (state.span === 'month') return monthKey(state.anchorDate);
            return `${state.anchorDate.getFullYear()}`;
        }
        if (state.contentMode === 'timeline' && visibleDates.length > 1) {
            return `${dateKey(visibleDates[0])} ~ ${dateKey(visibleDates[visibleDates.length - 1])}`;
        }
        return dateKey(visibleDates[0] || state.anchorDate);
    })();

    $: isCurrentPeriod = (() => {
        const today = todayDate();
        if (state.form === 'calendar') {
            if (state.span === 'week') return dateKey(startOfWeek(state.anchorDate)) === dateKey(startOfWeek(today));
            if (state.span === 'month') return monthKey(state.anchorDate) === monthKey(today);
            return state.anchorDate.getFullYear() === today.getFullYear();
        }
        return dateKey(state.anchorDate) === dateKey(today);
    })();

    function patch(partial: Partial<DailyNoteViewState>) {
        dispatch('state', { ...state, ...partial });
    }
</script>

<header class="dnt-view__toolbar">
    <div class="dnt-view__seg dnt-view__seg--primary">
        <button class:dnt-view__seg-item--on={state.form === 'content'} on:click={() => patch({ form: 'content' })}>
            {i18n.DailyNoteView.Content}
        </button>
        <button class:dnt-view__seg-item--on={state.form === 'calendar'} on:click={() => patch({ form: 'calendar' })}>
            {i18n.DailyNoteView.Calendar}
        </button>
    </div>

    <div class="dnt-view__divider"></div>

    <div class="dnt-view__datenav">
        <button class="dnt-view__iconbtn" aria-label="prev" disabled={!canNavigatePrevious} on:click={() => dispatch('navigate', -1)}>‹</button>
        <span class="dnt-view__datenav-label">{periodLabel}</span>
        <button class="dnt-view__iconbtn" aria-label="next" disabled={!canNavigateNext} on:click={() => dispatch('navigate', 1)}>›</button>
    </div>
    <button class="b3-button b3-button--outline" disabled={isCurrentPeriod} on:click={() => dispatch('today')}>{i18n.DailyNoteView.Today}</button>

    {#if state.form === 'content'}
        <div class="dnt-view__seg">
            <button
                title={i18n.DailyNoteView.SingleDayHint}
                class:dnt-view__seg-item--on={state.contentMode === 'day'}
                on:click={() => patch({ contentMode: 'day' })}
            >{i18n.DailyNoteView.SingleDay}</button>
            <button
                title={i18n.DailyNoteView.TimelineHint}
                class:dnt-view__seg-item--on={state.contentMode === 'timeline'}
                on:click={() => patch({ contentMode: 'timeline' })}
            >{i18n.DailyNoteView.Timeline}</button>
        </div>
    {/if}

    <div class="dnt-view__spacer"></div>

    {#if state.form === 'content'}
        <NotebookStatusPanel {state} {contentRevision} on:state={(event) => dispatch('state', event.detail)} />
    {/if}
</header>
