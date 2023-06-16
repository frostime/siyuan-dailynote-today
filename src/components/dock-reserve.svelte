<script lang="ts">
    import ListItem from "./list-item.svelte";

    let expandStatus = [
        false, false
    ]

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

    const doNothing = () => {};

</script>

<div
    class="fn__flex-1 fn__flex-column file-tree layout__tab"
>
    <div class="block__icons">
        <div class="block__logo">
            <svg><use xlink:href="#iconBookmark" /></svg>
            预约
        </div>
        <span class="fn__flex-1" />
        <span class="fn__space" />
        <span
            data-type="refresh"
            class="block__icon b3-tooltips b3-tooltips__sw"
            aria-label="刷新"
            ><svg class=""><use xlink:href="#iconRefresh" /></svg></span
        >
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
        <ListItem
            sectionTitle="20221012"
            bind:isExpanded={expandStatus[0]}
            blocks={[
                { id: "ddd", content: "ddd" },
                { id: "ddd", content: "ddd" },
                {
                    id: "ddd",
                    content:
                        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                },
            ]}
        />
        <ListItem
            sectionTitle="20221014"
            bind:isExpanded={expandStatus[1]}
            blocks={[
                { id: "ddd", content: "ddd" },
                { id: "ddd", content: "ddd" },
                {
                    id: "ddd",
                    content:
                        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                },
            ]}
        />
    </div>
</div>
