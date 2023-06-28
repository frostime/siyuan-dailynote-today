<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { settings } from "../global-status";
    import { i18n } from "../utils";
    import SettingContainer from "./settings/setting-container.svelte";

    let contents = i18n.Setting;

    let items = [
        {
            name: "OpenOnStart",
            type: "checkbox",
        },
        {
            name: "DefaultNotebook",
            type: "input",
        },
        {
            name: "IconPosition",
            type: "select",
        },
        {
            name: "EnableMove",
            type: "checkbox",
        },
        {
            name: "EnableReserve",
            type: "checkbox",
        },
        {
            name: "EnableResvDock",
            type: "checkbox",
        },
        {
            name: "ExpandGutterMenu",
            type: "checkbox",
        },
        {
            name: "PopupReserveDialog",
            type: "checkbox",
        },
        {
            name: "ResvEmbedAt",
            type: "select",
        },
        {
            name: "RetvType",
            type: "select",
        },
    ];
    let settingItems: ISettingItem[] = [];
    for (let item of items) {
        //@ts-ignore
        settingItems.push({
            type: item.type,
            content: contents[item.name],
            key: item.name,
            value: settings.get(<SettingKey>item.name),
        });
    }

    onMount(() => {
        console.log("Setting Svelte Mounted");
    });

    onDestroy(() => {
        console.log("Setting Svelte Destroyed");
        settings.save();
    });
</script>

<SettingContainer dataname="global" {settingItems} />
