<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { settings } from "../global-status";
    import { i18n } from "../utils";

    import SettingPanels from "./settings/setting-panels.svelte";

    let contents = i18n.Setting;

    let groups = {
        base: [
            {
            name: "OpenOnStart",
            type: "checkbox",
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
                name: "DefaultNotebook",
                type: "input",
            },
        ],
        func: [
            {
                name: "IconPosition",
                type: "select",
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
        ]
    };

    let allSettingPanels: {
        name: string;
        items: ISettingItem[];
    }[] = [];

    for (let key in groups) {
        let items: ISettingItem[] = [];
        for (let item of groups[key]) {
            items.push({
                type: item.type,
                key: item.name,
                value: settings.get(item.name),
                content: contents[item.name],
            });
        }
        allSettingPanels.push({
            name: key,
            items: items,
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

<!-- <SettingPanel dataname="global" {settingItems} />
 -->
<SettingPanels panels={allSettingPanels} />
