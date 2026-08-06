<script lang="ts">
    import { dateKey } from "@/func/dailynote-view/state";
    import { i18n } from "@/utils";
    import ProtyleHost from "./protyle-host.svelte";
    import DuplicateDailyNote from "./duplicate-daily-note.svelte";

    export let app: any;
    export let lane: DailyNoteLane;

    function statusText(cell: DailyNoteLane['cell']) {
        return cell.status === 'single' ? i18n.DailyNoteView.exists : i18n.DailyNoteView.Duplicate;
    }
</script>

<article class="dnt-view__lane">
    <header class="dnt-view__lane-head">
        <div class="dnt-view__lane-title" title="{lane.notebook.name} / {dateKey(lane.date)}">
            <span>{lane.notebook.name}</span>
            <span class="dnt-view__lane-separator">/</span>
            <span>{dateKey(lane.date)}</span>
        </div>
        <span class="dnt-view__status dnt-view__status--{lane.cell.status}">{statusText(lane.cell)}</span>
    </header>

    {#if lane.cell.status === 'single'}
        <ProtyleHost {app} docId={lane.cell.doc.id} />
    {:else}
        <DuplicateDailyNote {app} cell={lane.cell} />
    {/if}
</article>
