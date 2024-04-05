<script lang="ts">
    import { Dialog } from "siyuan";
    import { onDestroy, onMount } from "svelte";
    import { settings } from "../global-status";
    import { i18n } from "../utils";

    import SettingPanels from "./settings/setting-panels.svelte";
    import Blacklist from "./blacklist.svelte";

    import { setDNAttrDialog } from "./set-past-dn-attr";

    let contents = i18n.Setting;

    let groups = {
        enable: [
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
            }
        ],
        interact: [
            {
                name: "IconPosition",
                type: "select",
            },
            {
                name: "ExpandGutterMenu",
                type: "checkbox",
            },
        ],
        dailynote: [
            {
                name: "DefaultNotebook",
                type: "input",
            },
            {
                name: "NotebookBlacklist",
                type: "button"
            },
            {
                name: "DisableAutoCreateOnMobile",
                type: "checkbox"
            },
            {
                name: "SetPastDailyNoteAttr",
                type: "button"
            },
            {
                name: "AutoOpenAfterSync",
                type: "checkbox"
            },
            // {
            //     name: "AutoHandleDuplicate",
            //     type: "checkbox"
            // },
            // {
            //     name: "AutoHandleDuplicateMethod",
            //     type: "select"
            // }
        ],
        reservation: [
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
            {
                name: "HighlightResv",
                type: "checkbox"
            }
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

    function onClick({ detail }) {
        console.log(detail);
        let key = detail.key;
        if (key === 'NotebookBlacklist') {
            let dialog = new Dialog({
                title: i18n.Blacklist.name,
                content: `<div id="blacklist" style="height: 100%;"></div>`,
                height: "25rem",
                width: "30rem",
            });
            new Blacklist({
                target: dialog.element.querySelector("#blacklist"),
                props: {
                    close: () => {
                        dialog.destroy();
                    },
                },
            });
        } else if (key === 'SetPastDailyNoteAttr') {
            setDNAttrDialog();
        }
    }
</script>

<!-- <SettingPanel dataname="global" {settingItems} />
 -->
<SettingPanels panels={allSettingPanels} on:click={onClick}/>
