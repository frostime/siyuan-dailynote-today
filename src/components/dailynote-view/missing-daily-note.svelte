<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { i18n } from "@/utils";

    export let cell: Extract<DailyNoteCell, { status: 'missing' }>;
    export let creating = false;

    const dispatch = createEventDispatcher<{ create: void }>();
</script>

<div class="dnt-view__empty">
    <strong>{i18n.DailyNoteView.Missing}</strong>
    <code>{cell.hpath}</code>
    <button class="b3-button b3-button--outline" disabled={creating} on:click={() => dispatch('create')}>
        {creating ? i18n.DailyNoteView.Creating : `+ ${i18n.DailyNoteView.CreateDailyNote}`}
    </button>
    <span>{i18n.DailyNoteView.MissingHint}</span>
</div>
