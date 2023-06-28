<script>
    import { onDestroy, onMount } from "svelte";
    import { settings } from "../global-status";
    import { i18n } from "../utils";
    import SettingItem from "./settings/setting-item.svelte";
    let checked = settings.get("OpenOnStart");
    let defaultNotebook = settings.get("DefaultNotebook");
    let iconPosition = settings.get("IconPosition");

    let contents = i18n.Setting;

    onMount(() => {
        console.log("Setting Svelte Mounted");
    });

    onDestroy(() => {
        console.log("Setting Svelte Destroyed");
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
        type="checkbox"
        content={contents.EnableResvDock}
        settingKey="EnableResvDock"
        settingValue={settings.get("EnableResvDock")}
    />
    <SettingItem
        type="checkbox"
        content={contents.ExpandGutterMenu}
        settingKey="ExpandGutterMenu"
        settingValue={settings.get("ExpandGutterMenu")}
    />
    <SettingItem
        type="checkbox"
        content={contents.PopupReserveDialog}
        settingKey="PopupReserveDialog"
        settingValue={settings.get("PopupReserveDialog")}
    />
    <SettingItem
        type="select"
        content={contents.ResvEmbedAt}
        settingKey="ResvEmbedAt"
        settingValue={settings.get("ResvEmbedAt")}
    />
    <SettingItem
        type="select"
        content={contents.RetvType}
        settingKey="RetvType"
        settingValue={settings.get("RetvType")}
    />
</div>
