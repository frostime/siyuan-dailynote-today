<script>
    import { createEventDispatcher, onDestroy } from "svelte";
    import { settings } from "../global-setting";
    import { eventBus } from "../event-bus";
    import SettingItem from "./setting-item.svelte";
    let checked = settings.get("OpenOnStart");
    let notebookSort = settings.get("NotebookSort");
    let defaultNotebook = settings.get("DefaultNotebook");
    let iconPosition = settings.get("IconPosition");

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
                eventBus.publish(eventBus.EventSetting, {
                    key: "OpenOnStart",
                    value: e.target.checked,
                });
            }}
        />
    </SettingItem>
    <SettingItem content={contents.defaultNotebook}>
        <input
            class="b3-text-field fn__flex-center fn__size200"
            id="defaultNotebook"
            placeholder="请复制笔记本的 ID"
            bind:value={defaultNotebook}
            on:change={(e) => {
                eventBus.publish(eventBus.EventSetting, {
                    key: "DefaultNotebook",
                    value: defaultNotebook,
                });
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
                eventBus.publish(eventBus.EventSetting, {
                    key: "NotebookSort",
                    value: value,
                });
            }}
        >
            <option value="custom-sort"
                >{contents.sorting.options["custom-sort"]}</option
            >
            <option value="doc-tree"
                >{contents.sorting.options["doc-tree"]}</option
            >
        </select>
    </SettingItem>
    <SettingItem content={contents.position}>
        <select
            class="b3-select fn__flex-center fn__size200"
            id="iconPosition"
            bind:value={iconPosition}
            on:change={(e) => {
                let value = e.target.value;
                eventBus.publish(eventBus.EventSetting, {
                    key: "IconPosition",
                    value: value,
                });
            }}
        >
            <option value="left"
                >{contents.position.options["left"]}</option
            >
            <option value="right"
                >{contents.position.options["right"]}</option
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
