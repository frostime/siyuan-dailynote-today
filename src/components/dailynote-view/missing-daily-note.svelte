<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { i18n } from "@/utils";

    export let cell: Extract<DailyNoteCell, { status: 'missing' }>;

    const dispatch = createEventDispatcher<{ create: void }>();
</script>

<div class="dnt-view__empty">
    <strong>{i18n.DailyNoteView.Missing}</strong>
    <code>{cell.hpath}</code>
    <button class="b3-button b3-button--outline" on:click={() => dispatch('create')}>
        + {i18n.DailyNoteView.CreateDailyNote}
    </button>
    <span>{i18n.DailyNoteView.MissingHint}</span>
</div>
