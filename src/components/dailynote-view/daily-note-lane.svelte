<script lang="ts">
    import { onMount } from "svelte";
    import { createDailyNoteCell, resolveDailyNoteCell } from "@/func/dailynote-view";
    import { dateKey } from "@/func/dailynote-view/state";
    import { i18n } from "@/utils";
    import ProtyleHost from "./protyle-host.svelte";
    import MissingDailyNote from "./missing-daily-note.svelte";
    import DuplicateDailyNote from "./duplicate-daily-note.svelte";

    export let app: any;
    export let lane: DailyNoteLane;

    let loading = true;

    async function refresh() {
        loading = true;
        lane = {
            ...lane,
            cell: await resolveDailyNoteCell(lane.notebook, lane.date),
        };
        loading = false;
    }

    async function createDailyNote() {
        const doc = await createDailyNoteCell(lane.notebook, lane.date);
        if (doc) {
            await refresh();
        }
    }

    onMount(refresh);
</script>

<article class="dnt-view__lane">
    <header class="dnt-view__lane-head">
        <div>
            <div class="dnt-view__lane-date">{dateKey(lane.date)}</div>
            <div class="dnt-view__lane-notebook">{lane.notebook.name}</div>
        </div>
        {#if lane.cell}
            <span class="dnt-view__status dnt-view__status--{lane.cell.status}">
                {lane.cell.status === 'single' ? i18n.DailyNoteView.exists : lane.cell.status === 'missing' ? i18n.DailyNoteView.Missing : i18n.DailyNoteView.Duplicate}
            </span>
        {/if}
    </header>

    {#if loading}
        <div class="dnt-view__empty">Loading...</div>
    {:else if lane.cell?.status === 'missing'}
        <MissingDailyNote cell={lane.cell} on:create={createDailyNote} />
    {:else if lane.cell?.status === 'single'}
        <ProtyleHost {app} docId={lane.cell.doc.id} />
    {:else if lane.cell?.status === 'duplicate'}
        <DuplicateDailyNote {app} cell={lane.cell} />
    {/if}
</article>
