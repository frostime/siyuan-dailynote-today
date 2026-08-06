<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { i18n } from "@/utils";
    import { addDays, dateKey, visibleNotebooks } from "@/func/dailynote-view/state";

    export let state: DailyNoteViewState;
    export let sequenceDates: Date[] = [];

    const dispatch = createEventDispatcher<{
        state: DailyNoteViewState;
        create: void;
    }>();

    let notebookMenuOpen = false;

    function patch(partial: Partial<DailyNoteViewState>) {
        dispatch('state', { ...state, ...partial });
    }

    function addMonths(date: Date, offset: number): Date {
        return new Date(date.getFullYear(), date.getMonth() + offset, 1);
    }

    function addYears(date: Date, offset: number): Date {
        return new Date(date.getFullYear() + offset, date.getMonth(), 1);
    }

    function startOfWeek(date: Date): Date {
        const start = new Date(date);
        const day = start.getDay() || 7;
        start.setDate(start.getDate() - day + 1);
        return start;
    }

    function shiftDate(offset: number) {
        if (state.form === 'calendar') {
            const anchorDate = state.span === 'year'
                ? addYears(state.anchorDate, offset)
                : state.span === 'month'
                    ? addMonths(state.anchorDate, offset)
                    : addDays(state.anchorDate, offset * 7);
            patch({ anchorDate });
            return;
        }

        if (state.group === 'sequence') {
            const index = sequenceDates.findIndex((date) => dateKey(date) === dateKey(state.anchorDate));
            const target = sequenceDates[index + offset];
            if (target) patch({ anchorDate: target });
            return;
        }
        patch({ anchorDate: addDays(state.anchorDate, offset) });
    }

    function selectNotebook(notebookId?: NotebookId) {
        notebookMenuOpen = false;
        patch({
            anchorNotebookId: notebookId || state.anchorNotebookId,
            notebookScope: notebookId ? 'single' : 'all',
        });
    }

    function currentSequenceIndex(): number {
        const exact = sequenceDates.findIndex((date) => dateKey(date) === dateKey(state.anchorDate));
        if (exact >= 0) return exact;
        const next = sequenceDates.findIndex((date) => date.getTime() >= state.anchorDate.getTime());
        return next >= 0 ? next : sequenceDates.length - 1;
    }

    $: notebookOptions = visibleNotebooks();
    $: selectedNotebook = notebookOptions.find((item) => item.id === state.anchorNotebookId);
    $: notebookLabel = state.notebookScope === 'all'
        ? i18n.DailyNoteView.ScopeAll
        : selectedNotebook?.name || i18n.DailyNoteView.Notebook;
    $: periodLabel = (() => {
        if (state.form === 'calendar') {
            if (state.span === 'year') return `${state.anchorDate.getFullYear()}`;
            if (state.span === 'month') return `${state.anchorDate.getFullYear()}-${`${state.anchorDate.getMonth() + 1}`.padStart(2, '0')}`;
            const start = startOfWeek(state.anchorDate);
            return `${dateKey(start)} ~ ${dateKey(addDays(start, 6))}`;
        }
        return dateKey(state.anchorDate);
    })();
    $: sequenceIndex = currentSequenceIndex();
    $: canShiftBack = state.form !== 'content' || state.group !== 'sequence' || sequenceIndex > 0;
    $: canShiftForward = state.form !== 'content' || state.group !== 'sequence' || (sequenceIndex >= 0 && sequenceIndex < sequenceDates.length - 1);
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

    <div class="dnt-view__notebook-menu">
        <button class="b3-button b3-button--outline" on:click={() => notebookMenuOpen = !notebookMenuOpen}>
            {notebookLabel} ▾
        </button>
        {#if notebookMenuOpen}
            <div class="dnt-view__notebook-popover">
                <button class:dnt-view__notebook-option--on={state.notebookScope === 'all'} on:click={() => selectNotebook()}>
                    <span>{i18n.DailyNoteView.ScopeAll}</span>
                </button>
                {#each notebookOptions as option}
                    <button class:dnt-view__notebook-option--on={state.notebookScope === 'single' && option.id === state.anchorNotebookId} on:click={() => selectNotebook(option.id)}>
                        <span>{option.name}</span>
                    </button>
                {/each}
            </div>
        {/if}
    </div>

    <div class="dnt-view__datenav">
        <button class="dnt-view__iconbtn" aria-label="prev" disabled={!canShiftBack} on:click={() => shiftDate(-1)}>‹</button>
        <span class="dnt-view__datenav-label">{periodLabel}</span>
        <button class="dnt-view__iconbtn" aria-label="next" disabled={!canShiftForward} on:click={() => shiftDate(1)}>›</button>
    </div>

    {#if state.form === 'content'}
        <div class="dnt-view__seg">
            <button class:dnt-view__seg-item--on={state.group === 'day'} on:click={() => patch({ group: 'day' })}>
                {i18n.DailyNoteView.SameDay}
            </button>
            <button class:dnt-view__seg-item--on={state.group === 'sequence'} on:click={() => patch({ group: 'sequence' })}>
                {i18n.DailyNoteView.Sequence}
            </button>
        </div>
        <div class="dnt-view__seg">
            <button class:dnt-view__seg-item--on={state.layout === 'single'} on:click={() => patch({ layout: 'single' })}>{i18n.DailyNoteView.Single}</button>
            <button class:dnt-view__seg-item--on={state.layout === 'columns'} on:click={() => patch({ layout: 'columns' })}>{i18n.DailyNoteView.Columns}</button>
            <button class:dnt-view__seg-item--on={state.layout === 'cards'} on:click={() => patch({ layout: 'cards' })}>{i18n.DailyNoteView.Cards}</button>
        </div>
    {/if}

    <div class="dnt-view__spacer"></div>
    <button class="b3-button b3-button--text" on:click={() => dispatch('create')}>+ {i18n.DailyNoteView.CreateDailyNote}</button>
</header>
