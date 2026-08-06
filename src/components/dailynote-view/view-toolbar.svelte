<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { i18n } from "@/utils";
    import { addDays, dateKey, isFutureDate, todayDate, visibleNotebooks } from "@/func/dailynote-view/state";

    export let state: DailyNoteViewState;

    const dispatch = createEventDispatcher<{ state: DailyNoteViewState }>();

    const TIME_COUNTS: DailyNoteViewTimeCount[] = [1, 2, 3, 5];

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

    function isCalendarMonth(): boolean {
        return state.form === 'calendar' && state.span === 'month';
    }

    function periodTargetAfterShift(offset: number): Date {
        if (state.form === 'calendar' && state.span === 'week') {
            return addDays(state.anchorDate, offset * 7);
        }
        if (isCalendarMonth()) {
            return addMonths(state.anchorDate, offset);
        }
        return addDays(state.anchorDate, offset);
    }

    $: isAnchorToday = dateKey(state.anchorDate) === dateKey(todayDate());
    $: isCurrentPeriod = (() => {
        if (state.form === 'calendar' && state.span === 'week') {
            return dateKey(startOfWeek(state.anchorDate)) === dateKey(startOfWeek(todayDate()));
        }
        if (isCalendarMonth()) {
            return monthKey(state.anchorDate) === monthKey(todayDate());
        }
        return isAnchorToday;
    })();
    $: periodLabel = (() => {
        if (state.form === 'calendar' && state.span === 'week') {
            return `${dateKey(startOfWeek(state.anchorDate))} ~ ${dateKey(endOfWeek(state.anchorDate))}`;
        }
        if (isCalendarMonth()) {
            return monthKey(state.anchorDate);
        }
        return dateKey(state.anchorDate);
    })();
    $: canShiftDateForward = (() => {
        if (state.form === 'calendar' && state.span === 'week') {
            return !isFutureDate(startOfWeek(addDays(state.anchorDate, 7)));
        }
        if (isCalendarMonth()) {
            return !isFutureDate(startOfMonth(addMonths(state.anchorDate, 1)));
        }
        return !isFutureDate(addDays(state.anchorDate, 1));
    })();
    $: notebookOptions = visibleNotebooks();
    $: showNotebookSelector = state.form === 'content'
        && (state.axis === 'time' || state.notebookScope === 'single');

    function patch(partial: Partial<DailyNoteViewState>) {
        dispatch('state', { ...state, ...partial });
    }

    function shiftDate(offset: number) {
        if (offset > 0 && !canShiftDateForward) {
            return;
        }
        patch({ anchorDate: periodTargetAfterShift(offset) });
    }

    function setToday() {
        patch({ anchorDate: todayDate() });
    }

    function selectNotebook(event: Event) {
        patch({ anchorNotebookId: (event.currentTarget as HTMLSelectElement).value });
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
        <button class="dnt-view__iconbtn" aria-label="prev" on:click={() => shiftDate(-1)}>‹</button>
        <span class="dnt-view__datenav-label">{periodLabel}</span>
        <button class="dnt-view__iconbtn" aria-label="next" disabled={!canShiftDateForward} on:click={() => shiftDate(1)}>›</button>
    </div>
    <button class="b3-button b3-button--outline" disabled={isCurrentPeriod} on:click={setToday}>{i18n.DailyNoteView.Today}</button>

    <div class="dnt-view__spacer"></div>

    <div class="dnt-view__ctx">
        {#if state.form === 'content'}
            <div class="dnt-view__seg">
                <button class:dnt-view__seg-item--on={state.axis === 'time'} on:click={() => patch({ axis: 'time' })}>
                    {i18n.DailyNoteView.TimeAxis}
                </button>
                <button class:dnt-view__seg-item--on={state.axis === 'notebook'} on:click={() => patch({ axis: 'notebook' })}>
                    {i18n.DailyNoteView.NotebookAxis}
                </button>
            </div>

            {#if state.axis === 'time'}
                <span class="dnt-view__ctx-label">{i18n.DailyNoteView.Days}</span>
                <!-- 时间轴天数：当前用离散 segmented (1/2/3/5)。
                     若未来需要自由步进，取消下方 stepper 注释并移除此 segmented：
                <div class="dnt-view__stepper">
                    <button on:click={() => patch({ timeCount: Math.max(1, state.timeCount - 1) as DailyNoteViewTimeCount })}>−</button>
                    <span>{state.timeCount}</span>
                    <button on:click={() => patch({ timeCount: (state.timeCount + 1) as DailyNoteViewTimeCount })}>+</button>
                </div>
                -->
                <div class="dnt-view__seg">
                    {#each TIME_COUNTS as n}
                        <button class:dnt-view__seg-item--on={state.timeCount === n} on:click={() => patch({ timeCount: n })}>{n}</button>
                    {/each}
                </div>
            {:else}
                <span class="dnt-view__ctx-label">{i18n.DailyNoteView.Scope}</span>
                <div class="dnt-view__seg">
                    <button class:dnt-view__seg-item--on={state.notebookScope === 'single'} on:click={() => patch({ notebookScope: 'single' })}>
                        {i18n.DailyNoteView.ScopeSingle}
                    </button>
                    <button class:dnt-view__seg-item--on={state.notebookScope === 'all'} on:click={() => patch({ notebookScope: 'all' })}>
                        {i18n.DailyNoteView.ScopeAll}
                    </button>
                </div>
            {/if}

            {#if showNotebookSelector}
                <select class="b3-select" value={state.anchorNotebookId} on:change={selectNotebook}>
                    {#each notebookOptions as option}
                        <option value={option.id}>{option.name}</option>
                    {/each}
                </select>
            {/if}
        {:else}
            <span class="dnt-view__ctx-label">{i18n.DailyNoteView.Span}</span>
            <div class="dnt-view__seg">
                <button class:dnt-view__seg-item--on={state.span === 'week'} on:click={() => patch({ span: 'week' })}>
                    {i18n.DailyNoteView.Week}
                </button>
                <button class:dnt-view__seg-item--on={state.span === 'month'} on:click={() => patch({ span: 'month' })}>
                    {i18n.DailyNoteView.Month}
                </button>
            </div>
        {/if}
    </div>
</header>
