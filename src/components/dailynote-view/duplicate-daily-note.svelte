<script lang="ts">
    import { openBlock } from "@/func";
    import { i18n } from "@/utils";
    import ProtyleHost from "./protyle-host.svelte";

    export let app: any;
    export let cell: Extract<DailyNoteCell, { status: 'duplicate' }>;
</script>

<div class="dnt-view__duplicate">
    <div class="dnt-view__warning">
        ⚠ {i18n.DailyNoteView.DuplicateHint}
    </div>
    <ProtyleHost {app} docId={cell.primary.id} />
    <div class="dnt-view__duplicate-actions">
        {#each cell.docs.filter((doc) => doc.id !== cell.primary.id) as doc}
            <button class="b3-button b3-button--outline" on:click={() => openBlock(doc.id)}>
                {i18n.DailyNoteView.OpenDuplicateDocs}: {doc.hpath || doc.id}
            </button>
        {/each}
    </div>
</div>
