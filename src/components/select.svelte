<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { Notebook } from "../types";
    import { info } from "../utils";

    const dispatch = createEventDispatcher();

    export let notebooks: Notebook[] = new Array();
    export let diaryStatus: Map<string, boolean> = new Map();
    export let selected: string = "";

    $: info("当前选中", selected);

    let isSelectFolded: boolean = true;
    const hintChar = ["\u2713", "\u00A0\u00A0"];

    function onClick(event: MouseEvent) {
        info("Event: click");
        if (isSelectFolded) {
            isSelectFolded = false;
            eventOpenSelector();
        } else {
            let id: string = (event.target as HTMLSelectElement).value;
            eventClickNotebook(id);
            isSelectFolded = true;
        }
    }
    function onBlur() {
        info("Event: blur");
        isSelectFolded = true;
    }

    function eventOpenSelector() {
        info("Event: openNotebook");
        dispatch("openSelector");
    }

    function eventClickNotebook(nid: string) {
        info("Event: openDiary");
        let notebook: Notebook = notebooks.find(
            (notebook) => notebook.id === nid
        );
        dispatch("openDiary", { notebook: notebook });
    }
</script>

<select
    class="b3-select"
    on:click={onClick}
    on:blur={onBlur}
    bind:value={selected}
>
    {#each notebooks as notebook}
        {#if !notebook.closed && diaryStatus.get(notebook.id) === true}
            <option value={notebook.id}>
                <span>{hintChar[0]}</span>
                <span>{notebook.name}</span>
            </option>
        {:else}
            <option value={notebook.id}>
                <span>{hintChar[1]}</span>
                <span>{notebook.name}</span>
            </option>
        {/if}
    {/each}
</select>

<style>
    select {
        margin: 0;
        /* padding: 0; */
        /* width: 9rem; */
        min-width: 8rem !important;
        height: 100%;
    }
</style>
