<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { createDailyNoteCell, resolveDailyNoteCell } from "@/func/dailynote-view";
    import { dateKey } from "@/func/dailynote-view/state";
    import { i18n } from "@/utils";
    import ProtyleHost from "./protyle-host.svelte";
    import MissingDailyNote from "./missing-daily-note.svelte";
    import DuplicateDailyNote from "./duplicate-daily-note.svelte";

    export let app: any;
    export let lane: DailyNoteLane;

    const dispatch = createEventDispatcher<{ created: void }>();

    let loading = true;
    let cell: DailyNoteCell | null = null;
    let resolvedKey = '';
    let resolvingKey = '';
    let creating = false;
    let failed = false;

    async function refresh(force = false) {
        const key = lane.key;
        if (!force && (key === resolvedKey || key === resolvingKey)) {
            return;
        }

        resolvingKey = key;
        loading = true;
        failed = false;
        try {
            const resolved = await resolveDailyNoteCell(lane.notebook, lane.date);
            if (lane.key !== key) return;
            cell = resolved;
            resolvedKey = key;
        } catch (error) {
            if (lane.key === key) failed = true;
            console.error(error);
        } finally {
            if (lane.key === key) {
                resolvingKey = '';
                loading = false;
            }
        }
    }

    async function createDailyNote() {
        if (creating) return;
        creating = true;
        try {
            const createdCell = await createDailyNoteCell(lane.notebook, lane.date);
            if (createdCell) {
                cell = createdCell;
                dispatch('created');
            }
        } finally {
            creating = false;
        }
    }

    function statusText(cell: DailyNoteCell) {
        if (cell.status === 'single') return i18n.DailyNoteView.exists;
        if (cell.status === 'missing') return i18n.DailyNoteView.Missing;
        return i18n.DailyNoteView.Duplicate;
    }

    $: if (lane?.key && lane.cell && lane.key !== resolvedKey) {
        cell = lane.cell;
        resolvedKey = lane.key;
        resolvingKey = '';
        loading = false;
        failed = false;
    } else if (lane?.key && lane.key !== resolvedKey && lane.key !== resolvingKey) {
        refresh();
    }
</script>

<article class="dnt-view__lane">
    <header class="dnt-view__lane-head">
        <div class="dnt-view__lane-title" title="{lane.notebook.name} / {dateKey(lane.date)}">
            <span>{lane.notebook.name}</span>
            <span class="dnt-view__lane-separator">/</span>
            <span>{dateKey(lane.date)}</span>
        </div>
        {#if cell}
            <span class="dnt-view__status dnt-view__status--{cell.status}">{statusText(cell)}</span>
        {/if}
    </header>

    {#if loading}
        <div class="dnt-view__empty">Loading...</div>
    {:else if failed}
        <div class="dnt-view__empty"><button class="b3-button b3-button--outline" on:click={() => refresh(true)}>{i18n.DailyNoteView.Retry}</button></div>
    {:else if cell?.status === 'missing'}
        <MissingDailyNote cell={cell} {creating} on:create={createDailyNote} />
    {:else if cell?.status === 'single'}
        <ProtyleHost {app} docId={cell.doc.id} />
    {:else if cell?.status === 'duplicate'}
        <DuplicateDailyNote {app} cell={cell} />
    {/if}
</article>
