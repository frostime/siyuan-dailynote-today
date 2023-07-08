<!--
 Copyright (c) 2023 by frostime (Yp Z), All Rights Reserved.
 Author       : Yp Z
 Date         : 2023-07-08 17:18:57
 FilePath     : /src/components/blacklist.svelte
 LastEditTime : 2023-07-08 18:10:51
 Description  : 
-->
<script lang="ts">
    import { lsNotebooks } from '@/serverApi';

    const hiddenNotebook: Set<string> = new Set(["思源笔记用户指南", "SiYuan User Guide"]);

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
        return all_notebooks;
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

                <input
                    type="checkbox"
                    class="b3-switch fn__flex-center"
                    checked={false}
                />
            </li>

            {#await query()}
                Wait...
            {:then notebooks} 
                {#each notebooks as notebook}
                    <li
                        class="b3-list-item b3-list-item--hide-action"
                    >
                        <span class="b3-list-item__icon">{parseEmoji(notebook.icon)}</span>
                        <span class="b3-list-item__text">{notebook.name}</span>

                        <input
                            type="checkbox"
                            class="b3-switch fn__flex-center"
                            checked={false}
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
        >
            更新
        </button>
    </div>
</div>

<style lang="scss">
    .fn__flex-column > div.fn__flex-1 {
        padding: 16px 24px;
    }
</style>
