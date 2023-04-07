<script lang="ts">
    import { Notebook } from "./TypesDef";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    export let notebooks: Notebook[] = new Array();
    export let diaryStatus: Map<string, boolean> = new Map();
    let isSelectFolded: boolean = true;

    function onClick(event: MouseEvent) {
        console.log("[OpenDiary] Event: click");
        if (isSelectFolded) {
            isSelectFolded = false;
            // this.updateDiaryStatus();
        } else {
            let id: string = (event.target as HTMLSelectElement).value;
            eventClickNotebook(id);
            isSelectFolded = true;
        }
    }
    function onBlur() {
        console.log("[OpenDiary] Event: blur");
        isSelectFolded = true;
    }

    function eventClickNotebook(nid: string) {
        console.log("[OpenDiary] Event: openDiary");
        console.log("[OpenDiary] [DEBUG]: click", nid);
        dispatch("openDiary", { notebook: nid });
    }
</script>

<select class="toolbar__item b3-tooltips b3-tooltips__sw" on:click={onClick} on:blur={onBlur}>
    {#each notebooks as notebook}
        {#if !notebook.closed && diaryStatus.get(notebook.id) === true}
            <option value={notebook.id}>√{notebook.name}</option>
        {:else}
            <option value={notebook.id}>{notebook.name}</option>
        {/if}
    {/each}
</select>

<style>
    select {
        margin: 0 0.5rem;
        padding: 0 0.1rem;
        max-width: 7rem;
    }
</style>
