<script>
    import { createEventDispatcher, onDestroy } from "svelte";
    import { settings } from "../global-setting";
    let checked = settings.get("OpenOnStart");
    let notebookSort = settings.get("NotebookSort");
    let notebookView = settings.get("NotebookView");

    const dispatch = createEventDispatcher();

    export let contents;

    function onClick() {
        dispatch("updateAll");
    }

    onDestroy(() => {
        settings.save();
    });

</script>

<div class="config__tab-container">
    <label class="fn__flex b3-label">
        <div class="fn__flex-1">
            {contents.autoOpen.title}
            <div class="b3-label__text">
                {contents.autoOpen.text}
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
            {contents.sorting.title}
            <div class="b3-label__text">{contents.sorting.text}</div>
        </div>
        <span class="fn__space" />
        <select
            class="b3-select fn__flex-center fn__size200"
            id="notebookSort"
            bind:value={notebookSort}
            on:change={(e) => {
                let value = e.target.value;
                settings.set("NotebookSort", value);
                settings.save();
            }}
        >
            <option value="custom-sort">{contents.sorting.options["custom-sort"]}</option>
            <option value="doc-tree">{contents.sorting.options["doc-tree"]}</option
            >
        </select>
    </label>
    <label class="fn__flex b3-label">
        <div class="fn__flex-1">
            {contents.display.title}
            <div class="b3-label__text">{contents.display.text}</div>
        </div>
        <span class="fn__space" />
        <select
            class="b3-select fn__flex-center fn__size200"
            id="NotebookView"
            bind:value={notebookView}
            on:change={(e) => {
                let value = e.target.value;
                settings.set("NotebookView", value);
                settings.save();
            }}
        >
            <option value="Selector">{contents.display.options["select"]}</option>
            <option value="Menu">{contents.display.options["menu"]}</option
            >
        </select>
    </label>
    <label class="fn__flex b3-label">
        <div class="fn__flex-1">
            {contents.update.title}
            <div class="b3-label__text">
                {contents.update.text}
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
