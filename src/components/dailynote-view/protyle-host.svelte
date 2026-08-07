<script lang="ts">
    import { onDestroy, tick } from "svelte";
    import { Protyle } from "siyuan";

    export let app: any;
    export let docId: DocumentId;

    let target: HTMLDivElement;
    let protyle: Protyle;
    let loadedDocId: DocumentId;
    let generation = 0;

    async function load() {
        if (!target || loadedDocId === docId) {
            return;
        }
        const requestedDocId = docId;
        const requestedGeneration = ++generation;
        unload(false);
        await tick();
        if (!target || requestedGeneration !== generation || requestedDocId !== docId) return;
        protyle = new Protyle(app, target, {
            mode: "wysiwyg",
            typewriterMode: true,
            action: ["cb-get-all"],
            blockId: requestedDocId,
            render: {
                background: false,
                title: true,
                gutter: true,
                scroll: true,
                breadcrumb: true,
                breadcrumbDocName: false,
            },
        });
        loadedDocId = requestedDocId;
    }

    function unload(invalidate = true) {
        if (invalidate) generation += 1;
        protyle?.destroy();
        protyle = null;
        loadedDocId = null;
    }

    $: if (target && docId) {
        load();
    }

    onDestroy(unload);
</script>

<div class="dnt-view__protyle" bind:this={target}></div>
