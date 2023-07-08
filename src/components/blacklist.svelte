<!--
 Copyright (c) 2023 by frostime (Yp Z), All Rights Reserved.
 Author       : Yp Z
 Date         : 2023-07-08 17:18:57
 FilePath     : /src/components/blacklist.svelte
 LastEditTime : 2023-07-08 18:39:24
 Description  : 
-->
<script lang="ts">
    import { lsNotebooks } from '@/serverApi';
    import { settings } from '@/global-status';

    export let close: Function;

    const hiddenNotebook: Set<string> = new Set(["思源笔记用户指南", "SiYuan User Guide"]);

    let checkboxTop: HTMLInputElement;
    let checkedStatus: { [key: NotebookId]: boolean } = settings.get('NotebookBlacklist');

    function parseEmoji(code: string) {
        try {
            return String.fromCodePoint(parseInt(code, 16));
        } catch (error) {
            return '📔';
        }
    }

    async function query() {
        let result = await lsNotebooks();
        let all_notebooks: Array<Notebook> = result.notebooks;

        all_notebooks = all_notebooks.filter(
            notebook => !hiddenNotebook.has(notebook.name)
        );
        checkedStatus = {};
        all_notebooks.forEach(notebook => {
            let status = checkedStatus?.[notebook.id];
            status = status === undefined ? false : status;
            checkedStatus[notebook.id] = status;
        });
        return all_notebooks;
    }

    function toggleNotebook() {
        let hasChecked: number = Object.values(checkedStatus).filter(
            checked => checked
        ).length;
        const cnt = Object.keys(checkedStatus).length;
        if (hasChecked === cnt) {
            checkboxTop.checked = true;
            checkboxTop.indeterminate = false;
        } else if (hasChecked === 0) {
            checkboxTop.checked = false;
            checkboxTop.indeterminate = false;
        } else {
            checkboxTop.checked = false;
            checkboxTop.indeterminate = true;
        }
    }

    function toggleTop() {
        let topChecked = checkboxTop.checked;
        if (topChecked) {
            Object.keys(checkedStatus).forEach(key => {
                checkedStatus[key] = true;
            });
        } else {
            Object.keys(checkedStatus).forEach(key => {
                checkedStatus[key] = false;
            });
        }
    }

    function update() {
        console.log(checkedStatus);
        settings.set('NotebookBlacklist', checkedStatus);
        close()
    }

</script>

<div class="fn__flex-column">
    <div
        class="fn__flex-1"
        style="border-bottom: 1px solid var(--b3-border-color);"
    >
        <ul>
            <li
                class="b3-list-item b3-list-item--hide-action"
                style="border-bottom: 1px solid var(--b3-border-color);"
            >
                <svg class="b3-list-item__graphic"><use xlink:href="#iconEdit"></use></svg>
                <span class="b3-list-item__text">Toggle</span>

                <input type="checkbox" bind:this={checkboxTop} on:change={toggleTop}/>
            </li>

            {#await query()}
                Wait...
            {:then notebooks} 
                {#each notebooks as notebook (notebook.id)}
                    <li
                        class="b3-list-item b3-list-item--hide-action"
                    >
                        <span class="b3-list-item__icon">{parseEmoji(notebook.icon)}</span>
                        <span class="b3-list-item__text">{notebook.name}</span>

                        <input
                            type="checkbox"
                            class="b3-switch fn__flex-center"
                            value={notebook.id}
                            bind:checked={checkedStatus[notebook.id]}
                            on:change={toggleNotebook}
                        />
                    </li>
                {/each}
            {/await}

        </ul>
    </div>
    <div class="fn__flex b3-label">
        <div class="fn__flex-1" />
        <button
            class="b3-button b3-button--outline fn__flex-center fn__size200"
            on:click={update}
        >
            应用黑名单
        </button>
    </div>
</div>

<style lang="scss">
    .fn__flex-column > div.fn__flex-1 {
        padding: 16px 24px;
    }
</style>
