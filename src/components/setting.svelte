<script>
    import { createEventDispatcher, onDestroy } from "svelte";
    import { settings } from "../global-setting";
    import SettingItem from "./setting-item.svelte";
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
    <SettingItem content={contents.autoOpen}>
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
    </SettingItem>
    <SettingItem content={contents.sorting}>
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
    </SettingItem>
    <SettingItem content={contents.update}>
        <button
            class="b3-button b3-button--outline fn__flex-center fn__size200"
            id="updateNotebookStatus"
            on:click={onClick}
        >
            {contents.update.button}
        </button>
    </SettingItem>
</div>
