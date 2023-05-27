<script>
    import { createEventDispatcher, onDestroy } from "svelte";
    import { settings } from "../global-status";
    import SettingItem from "./setting-item.svelte";
    let checked = settings.get("OpenOnStart");
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
        content={contents.OpenOnStart}
        settingKey="OpenOnStart"
        settingValue={checked}
    />
    <SettingItem
        type="checkbox"
        content={contents.DiaryUpToDate}
        settingKey="DiaryUpToDate"
        settingValue={settings.get("DiaryUpToDate")}
    />
    <SettingItem
        type="input"
        content={contents.DefaultNotebook}
        settingKey="DefaultNotebook"
        settingValue={defaultNotebook}
    />
    <SettingItem
        type="select"
        content={contents.IconPosition}
        settingKey="IconPosition"
        settingValue={iconPosition}
    />
    <SettingItem
        type="checkbox"
        content={contents.EnableMove}
        settingKey="EnableMove"
        settingValue={settings.get("EnableMove")}
    />
    <SettingItem
        type="checkbox"
        content={contents.EnableReserve}
        settingKey="EnableReserve"
        settingValue={settings.get("EnableReserve")}
    />
    <SettingItem
        type="button"
        content={contents.update}
        settingKey="Update"
        settingValue={""}
        on:click={onClick}
    />
</div>
