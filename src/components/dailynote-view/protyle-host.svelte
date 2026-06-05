<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { Protyle } from "siyuan";

    export let app: any;
    export let docId: DocumentId;

    let target: HTMLDivElement;
    let protyle: Protyle;

    onMount(() => {
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
    });

    onDestroy(() => {
        protyle?.destroy();
        protyle = null;
    });
</script>

<div class="dnt-view__protyle" bind:this={target}></div>
