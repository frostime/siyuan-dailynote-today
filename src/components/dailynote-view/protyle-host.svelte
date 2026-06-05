<script lang="ts">
    import { onDestroy, tick } from "svelte";
    import { Protyle } from "siyuan";

    export let app: any;
    export let docId: DocumentId;

    let target: HTMLDivElement;
    let protyle: Protyle;
    let loadedDocId: DocumentId;

    async function load() {
        if (!target || loadedDocId === docId) {
            return;
        }
        unload();
        await tick();
        protyle = new Protyle(app, target, {
            mode: "wysiwyg",
            action: ["cb-get-all"],
            blockId: docId,
            render: {
                background: false,
                title: true,
                gutter: true,
                scroll: true,
                breadcrumb: true,
                breadcrumbDocName: false,
            },
        });
        loadedDocId = docId;
    }

    function unload() {
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
