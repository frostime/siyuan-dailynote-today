<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { i18n } from "@/utils";

    export let state: DailyNoteViewState;

    const dispatch = createEventDispatcher<{ state: DailyNoteViewState }>();
    const COUNTS: DailyNoteViewTimelineCount[] = [1, 2, 3, 5];
    let open = false;

    $: visible = state.form === 'calendar' || state.contentMode === 'timeline';
    $: label = state.form === 'calendar'
        ? i18n.DailyNoteView[state.span === 'week' ? 'Week' : state.span === 'month' ? 'Month' : 'Year']
        : `${i18n.DailyNoteView[state.timelineFilter === 'daily' ? 'Daily' : 'ExistingOnly']} · ${state.timelineCount}`;
    $: if (!visible) open = false;

    function patch(partial: Partial<DailyNoteViewState>) {
        dispatch('state', { ...state, ...partial });
        open = false;
    }
</script>

{#if visible}
    <div class="dnt-view__floating-control">
        {#if open}
            <div class="dnt-view__floating-panel">
                {#if state.form === 'calendar'}
                    <div class="dnt-view__seg">
                        <button class:dnt-view__seg-item--on={state.span === 'week'} on:click={() => patch({ span: 'week' })}>{i18n.DailyNoteView.Week}</button>
                        <button class:dnt-view__seg-item--on={state.span === 'month'} on:click={() => patch({ span: 'month' })}>{i18n.DailyNoteView.Month}</button>
                        <button class:dnt-view__seg-item--on={state.span === 'year'} on:click={() => patch({ span: 'year' })}>{i18n.DailyNoteView.Year}</button>
                    </div>
                {:else}
                    <div class="dnt-view__seg">
                        <button title={i18n.DailyNoteView.DailyHint} class:dnt-view__seg-item--on={state.timelineFilter === 'daily'} on:click={() => patch({ timelineFilter: 'daily' })}>{i18n.DailyNoteView.Daily}</button>
                        <button title={i18n.DailyNoteView.ExistingOnlyHint} class:dnt-view__seg-item--on={state.timelineFilter === 'existing'} on:click={() => patch({ timelineFilter: 'existing' })}>{i18n.DailyNoteView.ExistingOnly}</button>
                    </div>
                    <div class="dnt-view__seg">
                        {#each COUNTS as count}
                            <button class:dnt-view__seg-item--on={state.timelineCount === count} on:click={() => patch({ timelineCount: count })}>{count}</button>
                        {/each}
                    </div>
                {/if}
            </div>
        {/if}
        <button class="dnt-view__floating-button" on:click={() => open = !open}>{label}</button>
    </div>
{/if}
