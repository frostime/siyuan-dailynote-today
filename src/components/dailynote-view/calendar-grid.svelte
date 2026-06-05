<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import { listDailynote } from "@frostime/siyuan-plugin-kits";
    import { dateKey, normalizeDate } from "@/func/dailynote-view/state";
    import { i18n } from "@/utils";

    export let mode: Extract<DailyNoteViewMode, 'week' | 'month'>;
    export let anchorDate: Date;
    export let notebook: Notebook;

    const dispatch = createEventDispatcher<{ selectDate: Date }>();

    let cells: Date[] = [];
    let status = new Map<string, 'single' | 'duplicate'>();

    function startOfWeek(date: Date): Date {
        const start = normalizeDate(date);
        const day = start.getDay() || 7;
        start.setDate(start.getDate() - day + 1);
        return start;
    }

    function buildCells() {
        if (mode === 'week') {
            const start = startOfWeek(anchorDate);
            cells = Array.from({ length: 7 }, (_, index) => {
                const date = new Date(start);
                date.setDate(start.getDate() + index);
                return date;
            });
            return;
        }

        const first = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
        const start = startOfWeek(first);
        cells = Array.from({ length: 42 }, (_, index) => {
            const date = new Date(start);
            date.setDate(start.getDate() + index);
            return date;
        });
    }

    async function refreshStatus() {
        if (!notebook || cells.length === 0) {
            return;
        }
        const docs = await listDailynote({
            boxId: notebook.id,
            after: cells[0],
            before: cells[cells.length - 1],
            limit: 512,
        });
        const grouped = new Map<string, number>();
        docs.forEach((doc: any) => {
            if (!doc.value) return;
            const key = `${doc.value.slice(0, 4)}-${doc.value.slice(4, 6)}-${doc.value.slice(6, 8)}`;
            grouped.set(key, (grouped.get(key) || 0) + 1);
        });
        status = new Map(Array.from(grouped.entries()).map(([key, count]) => [key, count > 1 ? 'duplicate' : 'single']));
    }

    $: if (mode && anchorDate && notebook) {
        buildCells();
        refreshStatus();
    }

    onMount(() => {
        buildCells();
        refreshStatus();
    });
</script>

<section class="dnt-view__calendar">
    <header class="dnt-view__calendar-head">
        <strong>{mode === 'week' ? i18n.DailyNoteView.Week : i18n.DailyNoteView.Month}</strong>
        <span>{i18n.DailyNoteView.Notebook}: {notebook?.name}</span>
    </header>
    <div class="dnt-view__calendar-grid">
        {#each ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as day}
            <div class="dnt-view__calendar-cell dnt-view__calendar-dow">{day}</div>
        {/each}
        {#each cells as date}
            {@const key = dateKey(date)}
            {@const cellStatus = status.get(key)}
            <button class="dnt-view__calendar-cell" on:click={() => dispatch('selectDate', date)}>
                <span>{date.getDate()}</span>
                {#if cellStatus === 'single'}
                    <span class="dnt-view__calendar-marker">● DN</span>
                {:else if cellStatus === 'duplicate'}
                    <span class="dnt-view__calendar-marker dnt-view__calendar-marker--duplicate">⚠ dup</span>
                {/if}
            </button>
        {/each}
    </div>
</section>
