<!--
 Copyright (c) 2023 by frostime (Yp Z), All Rights Reserved.
 Author       : Yp Z
 Date         : 2023-07-08 17:18:57
 FilePath     : /src/components/blacklist.svelte
 LastEditTime : 2023-07-08 17:44:12
 Description  : 
-->
<div class="fn__flex-column">
    <div
        class="fn__flex-1"
        style="border-bottom: 1px solid var(--b3-border-color);"
    >
        <ul>
            <li
                on:keydown={() => {}}
                class="b3-list-item b3-list-item--hide-action"
            >
                <span class="b3-list-item__icon">📔</span>
                <span class="b3-list-item__text">思源笔记用户指南</span>

                <input
                    type="checkbox"
                    class="b3-switch fn__flex-center"
                    checked={false}
                />
            </li>
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
