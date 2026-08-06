<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { listDailynote } from "@frostime/siyuan-plugin-kits";
    import { dateKey, findNotebook, visibleNotebooks } from "@/func/dailynote-view/state";
    import { i18n } from "@/utils";

    export let state: DailyNoteViewState;
    export let contentRevision = 0;

    const dispatch = createEventDispatcher<{ state: DailyNoteViewState }>();

    let open = false;
    let loading = false;
    let search = '';
    let statusCounts = new Map<NotebookId, number>();
    let statusKey = '';
    let draftMode: DailyNoteViewNotebookSelection = 'single';
    let draftNotebookIds: NotebookId[] = [];

    $: notebooks = (state, visibleNotebooks());
    $: selectedNotebook = state.contentMode === 'timeline'
        ? findNotebook(state.timelineNotebookId)
        : findNotebook(state.dayNotebookIds[0]);
    $: selectedExisting = state.dayNotebookIds.filter((id) => (statusCounts.get(id) || 0) > 0).length;
    $: selectedStatus = statusText(selectedNotebook?.id, statusCounts);
    $: summary = state.contentMode === 'timeline' || state.daySelection === 'single'
        ? `${selectedNotebook?.name || ''} · ${selectedStatus}`
        : `${state.dayNotebookIds.length} ${i18n.DailyNoteView.Selected} · ${selectedExisting} ${i18n.DailyNoteView.HasContent}`;
    $: filteredNotebooks = notebooks.filter((notebook) => notebook.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
    $: refreshStatuses(state.anchorDate, contentRevision);

    function patch(partial: Partial<DailyNoteViewState>) {
        dispatch('state', { ...state, ...partial });
    }

    function statusText(notebookId?: NotebookId, counts = statusCounts): string {
        const count = notebookId ? counts.get(notebookId) || 0 : 0;
        if (count > 1) return `${i18n.DailyNoteView.Duplicate} ${count}`;
        return count === 1 ? i18n.DailyNoteView.exists : i18n.DailyNoteView.Missing;
    }

    async function refreshStatuses(date: Date, revision: number) {
        const key = `${dateKey(date)}:${revision}`;
        if (key === statusKey) return;
        statusKey = key;
        statusCounts = new Map();
        loading = true;
        try {
            const docs = await listDailynote({ after: date, before: date, limit: 2048 });
            if (key !== statusKey) return;
            const next = new Map<NotebookId, number>();
            docs.forEach((doc: any) => next.set(doc.box, (next.get(doc.box) || 0) + 1));
            statusCounts = next;
        } catch (error) {
            if (key === statusKey) statusCounts = new Map();
            console.error(error);
        } finally {
            if (key === statusKey) loading = false;
        }
    }

    function togglePanel() {
        open = !open;
        if (!open) return;
        draftMode = state.contentMode === 'timeline' ? 'single' : state.daySelection;
        draftNotebookIds = [...state.dayNotebookIds];
        search = '';
    }

    function selectMode(mode: DailyNoteViewNotebookSelection) {
        if (mode === draftMode || (mode === 'multi' && loading)) return;
        draftMode = mode;
        if (mode === 'multi') {
            const existing = notebooks.filter((notebook) => (statusCounts.get(notebook.id) || 0) > 0).map((notebook) => notebook.id);
            draftNotebookIds = existing.length > 0 ? existing : [state.dayNotebookIds[0] || notebooks[0]?.id].filter(Boolean);
        }
    }

    function selectNotebook(notebookId: NotebookId) {
        if (state.contentMode === 'timeline') {
            patch({ timelineNotebookId: notebookId });
            open = false;
            return;
        }
        if (draftMode === 'single') {
            patch({ daySelection: 'single', dayNotebookIds: [notebookId] });
            open = false;
            return;
        }

        const selected = draftNotebookIds.includes(notebookId);
        if (selected && draftNotebookIds.length === 1) return;
        draftNotebookIds = selected
            ? draftNotebookIds.filter((id) => id !== notebookId)
            : notebooks.map((notebook) => notebook.id).filter((id) => draftNotebookIds.includes(id) || id === notebookId);
    }

    function applyMultiSelection() {
        patch({ daySelection: 'multi', dayNotebookIds: [...draftNotebookIds] });
        open = false;
    }
</script>

<div class="dnt-view__notebook-picker">
    <button class="b3-button b3-button--outline" title={i18n.DailyNoteView.NotebookStatus} on:click={togglePanel}>
        {i18n.DailyNoteView.NotebookStatus}: {summary}
    </button>

    {#if open}
        <div class="dnt-view__notebook-panel">
            <header class="dnt-view__notebook-panel-head">
                <strong>{i18n.DailyNoteView.NotebookStatus}</strong>
                {#if state.contentMode === 'day'}
                    <div class="dnt-view__seg">
                        <button class:dnt-view__seg-item--on={draftMode === 'single'} on:click={() => selectMode('single')}>{i18n.DailyNoteView.Single}</button>
                        <button disabled={loading} class:dnt-view__seg-item--on={draftMode === 'multi'} on:click={() => selectMode('multi')}>{i18n.DailyNoteView.Multi}</button>
                    </div>
                {:else}
                    <span class="dnt-view__ctx-label">{i18n.DailyNoteView.Single}</span>
                {/if}
            </header>

            <input class="b3-text-field" bind:value={search} placeholder={i18n.DailyNoteView.SearchNotebooks} />

            <div class="dnt-view__notebook-list">
                {#each filteredNotebooks as notebook}
                    {@const selected = state.contentMode === 'timeline'
                        ? state.timelineNotebookId === notebook.id
                        : draftMode === 'multi'
                            ? draftNotebookIds.includes(notebook.id)
                            : state.dayNotebookIds[0] === notebook.id}
                    <button class:dnt-view__notebook-row--on={selected} class="dnt-view__notebook-row" on:click={() => selectNotebook(notebook.id)}>
                        <span class="dnt-view__notebook-mark">{draftMode === 'multi' && state.contentMode === 'day' ? (selected ? '☑' : '☐') : '○'}</span>
                        <span class="dnt-view__notebook-name">{notebook.name}</span>
                        <span class:dnt-view__status--duplicate={(statusCounts.get(notebook.id) || 0) > 1} class="dnt-view__status">
                            {loading ? '…' : statusText(notebook.id)}
                        </span>
                    </button>
                {/each}
            </div>

            {#if state.contentMode === 'day' && draftMode === 'multi'}
                <footer class="dnt-view__notebook-panel-actions">
                    <button class="b3-button b3-button--cancel" on:click={() => open = false}>{i18n.DailyNoteView.Cancel}</button>
                    <button class="b3-button b3-button--text" on:click={applyMultiSelection}>{i18n.DailyNoteView.Apply}</button>
                </footer>
            {/if}
        </div>
    {/if}
</div>
