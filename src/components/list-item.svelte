<script lang="ts">
    import * as api from "@/serverApi";

    export let sectionTitle: string = "";
    export let blocks: any[] = [];
    export let isExpanded: boolean = false;

    export function toggleExpand(expand?: boolean) {
        isExpanded = expand === undefined ? !isExpanded : expand;
    }

    let liSvgClass = 'b3-list-item__arrow';
    let ulClass = 'fn__none';
    $: {
        if (isExpanded) {
            liSvgClass = 'b3-list-item__arrow b3-list-item__arrow--open';
            ulClass = '';
        } else {
            liSvgClass = 'b3-list-item__arrow';
            ulClass = 'fn__none';
        }
    }

    async function clickItem(docId: BlockId) {
        console.log('clickItem', docId);//
        // let block: Block = await api.getBlockByID(id);
        if (docId) {
            window.open(`siyuan://blocks/${docId}`);
        }
    }

</script>

<li
    class="b3-list-item b3-list-item--hide-action"
    data-treetype="bookmark"
    data-type="undefined"
    data-subtype="undefined"
    on:click={() => toggleExpand()}
    on:keydown={() => {}}
>
    <span
        style="padding-left: 4px;margin-right: 2px"
        class="b3-list-item__toggle b3-list-item__toggle--hl"
    >
        <svg
            data-id="Doing0"
            class={liSvgClass}
            ><use xlink:href="#iconRight" /></svg
        >
    </span>
    <svg class="b3-list-item__graphic"><use xlink:href="#iconHistory" /></svg>
    <span class="b3-list-item__text">{sectionTitle}</span>
    <!-- <span class="b3-list-item__action"
        ><svg><use xlink:href="#iconMore" /></svg></span
    > -->
    <span class="counter">{blocks.length}</span>
</li>

<ul class={ulClass}>
    {#each blocks as block}
        <li
            on:click={() => clickItem(block.doc)}
            on:keydown={() => {}}
            class="b3-list-item b3-list-item--hide-action"
            data-node-id={block.id}
            data-ref-text=""
            data-def-id=""
            data-treetype="bookmark"
            data-def-path=""
        >
            <span
                style="padding-left: 22px;margin-right: 2px"
                class="b3-list-item__toggle fn__hidden"
            >
                <svg
                    data-id="20230612111658-489nla8"
                    class="b3-list-item__arrow"
                    ><use xlink:href="#iconRight" /></svg
                >
            </span>
            <span class="b3-list-item__text">{block.content}</span>

            <!-- <span class="b3-list-item__action"
                ><svg><use xlink:href="#iconMore" /></svg></span
            > -->
        </li>
    {/each}
</ul>
