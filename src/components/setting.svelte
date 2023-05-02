<script>
    import { createEventDispatcher } from "svelte";
    import { settings } from "../global-setting";
    let checked = settings.get("OpenOnStart");

    const dispatch = createEventDispatcher();

    export let contents;

    function onClick() {
        dispatch("updateAll");
    }
</script>

<div class="config__tab-container">
    <label class="fn__flex b3-label">
        <div class="fn__flex-1">
            {contents[0].title}
            <div class="b3-label__text">
                {contents[0].text}
            </div>
        </div>
        <span class="fn__space" />
        <input
            class="b3-switch fn__flex-center"
            id="openDNOnStart"
            type="checkbox"
            bind:checked
            on:change={(e) => {
                //设置发生变化的时候，保存设置
                settings.set("OpenOnStart", e.target.checked);
                settings.save();
            }}
        />
    </label>
    <label class="fn__flex b3-label">
        <div class="fn__flex-1">
            {contents[2].title}
            <div class="b3-label__text">{contents[2].text}</div>
        </div>
        <span class="fn__space" />
        <select
            class="b3-select fn__flex-center fn__size200"
            id="notebookSort"
            on:change={(e) => {
                let value = e.target.value;
                settings.set("NotebookSort", value);
                settings.save();
            }}
        >
            <option value="custom-sort">{contents[2].options["custom-sort"]}</option>
            <option value="doc-tree">{contents[2].options["doc-tree"]}</option
            >
        </select>
    </label>
    <label class="fn__flex b3-label">
        <div class="fn__flex-1">
            展示视图
            <div class="b3-label__text">Select or menu</div>
        </div>
        <span class="fn__space" />
        <select
            class="b3-select fn__flex-center fn__size200"
            id="NotebookView"
            on:change={(e) => {
                let value = e.target.value;
                settings.set("NotebookView", value);
                settings.save();
            }}
        >
            <option value="Selector">Selector</option>
            <option value="Menu">Menu</option
            >
        </select>
    </label>
    <label class="fn__flex b3-label">
        <div class="fn__flex-1">
            {contents[1].title}
            <div class="b3-label__text">
                {contents[1].text}
            </div>
        </div>
        <span class="fn__space" />
        <button
            class="b3-button b3-button--outline fn__flex-center fn__size200"
            id="updateNotebookStatus"
            on:click={onClick}
        >
            Update
        </button>
    </label>
</div>
