<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { createDailyNoteCell } from "@/func/dailynote-view";
    import { dateKey, findNotebook, visibleNotebooks } from "@/func/dailynote-view/state";
    import { i18n } from "@/utils";

    export let open = false;
    export let initialDate: Date;
    export let initialNotebookId: NotebookId;

    const dispatch = createEventDispatcher<{
        close: void;
        created: { doc: DailyNoteDocument; date: Date; notebookId: NotebookId };
    }>();

    let dateValue = '';
    let notebookId: NotebookId;
    let submitting = false;
    let previousOpen = false;

    function parseDate(value: string): Date {
        const [year, month, day] = value.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    async function create() {
        const date = parseDate(dateValue);
        const notebook = findNotebook(notebookId);
        if (!dateValue || !notebook || submitting) return;
        submitting = true;
        try {
            const doc = await createDailyNoteCell(notebook, date);
            if (doc) {
                dispatch('created', {
                    doc: { ...doc, value: dateValue.replaceAll('-', '') },
                    date,
                    notebookId,
                });
            }
        } finally {
            submitting = false;
        }
    }

    $: if (open && !previousOpen) {
        dateValue = dateKey(initialDate);
        notebookId = initialNotebookId || visibleNotebooks()[0]?.id;
    }
    $: previousOpen = open;
</script>

{#if open}
    <div class="dnt-view__modal-backdrop" role="presentation" on:click|self={() => dispatch('close')}>
        <section class="dnt-view__modal" role="dialog" aria-modal="true" aria-label={i18n.DailyNoteView.CreateDailyNote}>
            <h2>{i18n.DailyNoteView.CreateDailyNote}</h2>
            <p>{i18n.DailyNoteView.CreateHint}</p>
            <label>
                <span>{i18n.DailyNoteView.Date}</span>
                <input class="b3-text-field" type="date" bind:value={dateValue} />
            </label>
            <label>
                <span>{i18n.DailyNoteView.Notebook}</span>
                <select class="b3-select" bind:value={notebookId}>
                    {#each visibleNotebooks() as notebook}
                        <option value={notebook.id}>{notebook.name}</option>
                    {/each}
                </select>
            </label>
            <div class="dnt-view__modal-actions">
                <button class="b3-button b3-button--cancel" on:click={() => dispatch('close')}>{i18n.DailyNoteView.Cancel}</button>
                <button class="b3-button b3-button--text" disabled={submitting || !dateValue} on:click={create}>
                    {submitting ? 'Loading...' : i18n.DailyNoteView.CreateAndShow}
                </button>
            </div>
        </section>
    </div>
{/if}
