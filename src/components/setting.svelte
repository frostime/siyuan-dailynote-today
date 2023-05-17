<script>
    import { createEventDispatcher, onDestroy } from "svelte";
    import { settings } from "../global-setting";
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
    <SettingItem
        type="checkbox"
        content={contents.autoOpen}
        settingKey="OpenOnStart"
        settingValue={checked}
    />
    <SettingItem
        type="input"
        content={contents.defaultNotebook}
        settingKey="DefaultNotebook"
        settingValue={defaultNotebook}
    />
    <SettingItem
        type="select"
        content={contents.sorting}
        settingKey="NotebookSort"
        settingValue={notebookSort}
    />
    <SettingItem
        type="select"
        content={contents.position}
        settingKey="IconPosition"
        settingValue={iconPosition}
    />
    <SettingItem
        type="button"
        content={contents.update}
        settingKey="Update"
        on:click={onClick}
    />
</div>
