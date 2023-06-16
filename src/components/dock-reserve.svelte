<script lang="ts">
    import { onMount } from "svelte";
    import ListItem from "./list-item.svelte";
    import { reservation } from "@/global-status";
    import * as api from "@/serverApi";

    let expandStatus = [];
    let allResvs = [];

    function allExpand() {
        console.log("allExpand");
        for (let i = 0; i < expandStatus.length; i++) {
            expandStatus[i] = true;
        }
    }

    function allCollapse() {
        console.log("allCollapse");
        for (let i = 0; i < expandStatus.length; i++) {
            expandStatus[i] = false;
        }
    }

    async function updateWithReservations() {
        //[ [date, [blockIds]] ]
        let entries = Object.entries(reservation.reservations.OnDate);
        let dateCnt = entries.length;
        let allBlockIds = [];
        for (let i = 0; i < dateCnt; i++) {
            let entry = entries[i];
            let blocks = entry[1];
            allBlockIds = allBlockIds.concat(blocks);
        }
        let sql = `select id, content, root_id from blocks where id in (${allBlockIds.map((id) => `'${id}'`).join(",")})`;
        let results: any[] = await api.sql(sql);
        let resulsMap: any = {};
        results.forEach((result) => {
            resulsMap[result.id] = {
                content: result.content,
                doc: result.root_id
            }
        });

        expandStatus = new Array(dateCnt).fill(false);
        let newResvs = [];
        for (let i = 0; i < dateCnt; i++) {
            let entry = entries[i];
            let blocks = [];
            entry[1].forEach((blockId) => {
                blocks.push({
                    id: blockId,
                    content: resulsMap[blockId].content,
                    doc: resulsMap[blockId].doc
                });
            });
            newResvs.push({
                date: `${entry[0].slice(0, 4)}-${entry[0].slice(4, 6)}-${entry[0].slice(6, 8)}`,
                blocks: blocks,
            });
        }
        allResvs = newResvs;
    }

    const doNothing = () => {};

    onMount(() => {
        updateWithReservations();
    });
</script>

<div class="fn__flex-1 fn__flex-column file-tree layout__tab">
    <div class="block__icons">
        <div class="block__logo">
            <svg><use xlink:href="#iconBookmark" /></svg>
            预约
        </div>
        <span class="fn__flex-1" />
        <span class="fn__space" />
        <span
            on:click={() => updateWithReservations()}
            on:keydown={doNothing}
            data-type="refresh"
            class="block__icon b3-tooltips b3-tooltips__sw"
            aria-label="刷新"
        >
            <svg class=""><use xlink:href="#iconRefresh" /></svg>
        </span>
        <span class="fn__space" />
        <span
            on:click={() => allExpand()}
            on:keydown={doNothing}
            data-type="expand"
            class="block__icon b3-tooltips b3-tooltips__sw"
            aria-label="展开 Ctrl+↓"
        >
            <svg><use xlink:href="#iconExpand" /></svg>
        </span>
        <span class="fn__space" />
        <span
            on:click={() => allCollapse()}
            on:keydown={doNothing}
            data-type="collapse"
            class="block__icon b3-tooltips b3-tooltips__sw"
            aria-label="折叠 Ctrl+↑"
        >
            <svg><use xlink:href="#iconContract" /></svg>
        </span>
        <span class="fn__space" />
        <span
            data-type="min"
            class="block__icon b3-tooltips b3-tooltips__sw"
            aria-label="最小化 Ctrl+W"
            ><svg><use xlink:href="#iconMin" /></svg></span
        >
    </div>
    <div class="fn__flex-1">
        {#each allResvs as resv, i}
            <ListItem
                sectionTitle={resv.date}
                bind:isExpanded={expandStatus[i]}
                blocks={resv.blocks}
            />
        {/each}
    </div>
</div>
