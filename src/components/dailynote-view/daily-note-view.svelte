<script lang="ts">
    import { listDailynote } from "@frostime/siyuan-plugin-kits";
    import { dateKey, dailyNoteDate, dailyNoteDateKey, defaultDailyNoteViewState, docsToLanes, findNotebook, normalizeDate, visibleNotebooks } from "@/func/dailynote-view/state";
    import { i18n } from "@/utils";
    import ViewToolbar from "./view-toolbar.svelte";
    import ContentLanes from "./content-lanes.svelte";
    import CalendarGrid from "./calendar-grid.svelte";
    import CreateDailyNoteDialog from "./create-daily-note-dialog.svelte";

    export let app: any;

    const COLUMN_COUNTS: DailyNoteViewCount[] = [2, 3, 4, 5];
    const SEQUENCE_COUNTS: DailyNoteViewCount[] = [1, 2, 3, 5];

    let state: DailyNoteViewState = defaultDailyNoteViewState();
    let queriedDocs: DailyNoteDocument[] = [];
    let optimisticDocs: DailyNoteDocument[] = [];
    let lanes: DailyNoteLane[] = [];
    let sequenceDates: Date[] = [];
    let loading = false;
    let queryKey = '';
    let createOpen = false;
    let contextOpen = false;

    function setState(next: DailyNoteViewState) {
        state = { ...next, anchorDate: normalizeDate(next.anchorDate) };
    }

    function mergeOptimistic(docs: DailyNoteDocument[]): DailyNoteDocument[] {
        const byId = new Map(docs.map((doc) => [doc.id, doc]));
        optimisticDocs.forEach((doc) => byId.set(doc.id, doc));
        return Array.from(byId.values());
    }

    function queryIdentity(): string {
        const scope = `${state.notebookScope}:${state.anchorNotebookId}`;
        return state.group === 'day'
            ? `day:${dateKey(state.anchorDate)}:${scope}`
            : `sequence:${scope}`;
    }

    async function refreshDocuments() {
        if (state.form !== 'content') return;
        if (state.group === 'sequence' && state.notebookScope === 'all') {
            queriedDocs = [];
            loading = false;
            return;
        }

        const key = queryIdentity();
        if (key === queryKey) return;
        queryKey = key;
        loading = true;
        const options = state.group === 'day'
            ? {
                after: state.anchorDate,
                before: state.anchorDate,
                boxId: state.notebookScope === 'single' ? state.anchorNotebookId : undefined,
                limit: 2048,
            }
            : { boxId: state.anchorNotebookId, limit: 4096 };
        const docs = await listDailynote(options) as DailyNoteDocument[];
        if (key !== queryKey) return;
        const visibleIds = new Set(visibleNotebooks().map((notebook) => notebook.id));
        queriedDocs = docs.filter((doc) => visibleIds.has(doc.box));
        loading = false;
    }

    function updateResults() {
        const docs = mergeOptimistic(queriedDocs);
        if (state.group === 'day') {
            const key = dateKey(state.anchorDate);
            lanes = docsToLanes(docs.filter((doc) => dailyNoteDateKey(doc) === key && (state.notebookScope === 'all' || doc.box === state.anchorNotebookId)));
            sequenceDates = [];
            return;
        }

        const notebookDocs = docs.filter((doc) => doc.box === state.anchorNotebookId && dailyNoteDate(doc));
        const dates = Array.from(new Set(notebookDocs.map(dailyNoteDateKey).filter(Boolean) as string[]))
            .sort()
            .map((key) => {
                const [year, month, day] = key.split('-').map(Number);
                return new Date(year, month - 1, day);
            });
        sequenceDates = dates;
        if (dates.length === 0) {
            lanes = [];
            return;
        }
        let index = dates.findIndex((date) => dateKey(date) === dateKey(state.anchorDate));
        if (index < 0) {
            index = dates.findIndex((date) => date.getTime() >= state.anchorDate.getTime());
            if (index < 0) index = dates.length - 1;
        }
        const start = Math.max(0, Math.min(index - Math.floor((state.sequenceCount - 1) / 2), dates.length - state.sequenceCount));
        const visibleDateKeys = new Set(dates.slice(start, start + state.sequenceCount).map(dateKey));
        lanes = docsToLanes(notebookDocs.filter((doc) => visibleDateKeys.has(dailyNoteDateKey(doc))));
    }

    function selectDocument(event: CustomEvent<{ docId: DocumentId; date: Date; notebookId: NotebookId }>) {
        setState({
            ...state,
            anchorDate: event.detail.date,
            selectedDocId: event.detail.docId,
            layout: 'single',
        });
    }

    function selectCalendarDate(event: CustomEvent<{ date: Date; notebookId?: NotebookId; docId?: DocumentId }>) {
        setState({
            ...state,
            form: 'content',
            group: 'day',
            layout: 'single',
            anchorDate: event.detail.date,
            selectedDocId: event.detail.docId,
        });
    }

    function handleCreated(event: CustomEvent<{ doc: DailyNoteDocument; date: Date; notebookId: NotebookId }>) {
        optimisticDocs = [...optimisticDocs.filter((doc) => doc.id !== event.detail.doc.id), event.detail.doc];
        createOpen = false;
        queryKey = '';
        setState({
            ...state,
            form: 'content',
            group: 'day',
            layout: 'single',
            notebookScope: 'single',
            anchorNotebookId: event.detail.notebookId,
            anchorDate: event.detail.date,
            selectedDocId: event.detail.doc.id,
        });
    }

    $: notebook = findNotebook(state.anchorNotebookId);
    $: if (state.form === 'content' && state.group && state.anchorDate) refreshDocuments();
    $: if (queriedDocs || optimisticDocs || state.anchorDate || state.sequenceCount || state.notebookScope) updateResults();
</script>

<div class="dnt-view fn__flex-1 fn__flex-column">
    <ViewToolbar {state} {sequenceDates} on:state={(event) => setState(event.detail)} on:create={() => createOpen = true} />

    {#if state.form === 'content'}
        <ContentLanes {app} {state} {lanes} {loading} on:selectDocument={selectDocument} on:create={() => createOpen = true} />
    {:else}
        <CalendarGrid span={state.span} anchorDate={state.anchorDate} notebookScope={state.notebookScope} notebookId={state.anchorNotebookId} on:selectDate={selectCalendarDate} />
    {/if}

    <button class:dnt-view__context-fab--on={contextOpen} class="dnt-view__context-fab" aria-label={i18n.DailyNoteView.MoreControls} on:click={() => contextOpen = !contextOpen}>⋯</button>
    {#if contextOpen}
        <div class="dnt-view__context-menu">
            {#if state.form === 'calendar'}
                <span>{i18n.DailyNoteView.Span}</span>
                <div class="dnt-view__seg">
                    <button class:dnt-view__seg-item--on={state.span === 'week'} on:click={() => setState({ ...state, span: 'week' })}>{i18n.DailyNoteView.Week}</button>
                    <button class:dnt-view__seg-item--on={state.span === 'month'} on:click={() => setState({ ...state, span: 'month' })}>{i18n.DailyNoteView.Month}</button>
                    <button class:dnt-view__seg-item--on={state.span === 'year'} on:click={() => setState({ ...state, span: 'year' })}>{i18n.DailyNoteView.Year}</button>
                </div>
            {:else if state.group === 'sequence'}
                <span>{i18n.DailyNoteView.Days}</span>
                <div class="dnt-view__seg">
                    {#each SEQUENCE_COUNTS as count}
                        <button class:dnt-view__seg-item--on={state.sequenceCount === count} on:click={() => setState({ ...state, sequenceCount: count })}>{count}</button>
                    {/each}
                </div>
            {:else if state.layout === 'columns'}
                <span>{i18n.DailyNoteView.ColumnCount}</span>
                <div class="dnt-view__seg">
                    {#each COLUMN_COUNTS as count}
                        <button class:dnt-view__seg-item--on={state.columnCount === count} on:click={() => setState({ ...state, columnCount: count })}>{count}</button>
                    {/each}
                </div>
            {:else}
                <span>{i18n.DailyNoteView.NoMoreControls}</span>
            {/if}
        </div>
    {/if}

    <CreateDailyNoteDialog
        open={createOpen}
        initialDate={state.anchorDate}
        initialNotebookId={state.anchorNotebookId || notebook?.id}
        on:close={() => createOpen = false}
        on:created={handleCreated}
    />
</div>
