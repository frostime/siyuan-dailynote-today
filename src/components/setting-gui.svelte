<script lang="ts">
    import { Dialog, confirm } from "siyuan";
    import { onDestroy, onMount } from "svelte";
    import { settings } from "../global-status";
    import { DebugKit, i18n } from "../utils";

    import { FormPanel } from "./libs/Form";
    import Blacklist from "./blacklist.svelte";
    import { setDNAttrDialog } from "./set-past-dn-attr";
    import notebooks from "@/global-notebooks";

    let I18n = i18n.Setting;
    let groups = [
        `✨ ${i18n.SettingGroups.enable}`,
        `🎯 ${i18n.SettingGroups.interact}`,
        `📝 ${i18n.SettingGroups.dailynote}`,
        `🔖 ${i18n.SettingGroups.reservation}`,
    ];
    let focusGroup = groups[0];

    const enableItems: ISettingItem[] = [
        {
            type: "checkbox",
            title: I18n.OpenOnStart.title,
            description: I18n.OpenOnStart.text,
            key: "OpenOnStart",
            value: settings.get("OpenOnStart"),
        },
        {
            type: "checkbox",
            title: I18n.EnableMove.title,
            description: I18n.EnableMove.text,
            key: "EnableMove",
            value: settings.get("EnableMove"),
        },
        {
            type: "checkbox",
            title: I18n.EnableReserve.title,
            description: I18n.EnableReserve.text,
            key: "EnableReserve",
            value: settings.get("EnableReserve"),
        },
        {
            type: "checkbox",
            title: I18n.EnableResvDock.title,
            description: I18n.EnableResvDock.text,
            key: "EnableResvDock",
            value: settings.get("EnableResvDock"),
        },
    ];

    const interactItems: ISettingItem[] = [
        {
            type: "select",
            title: I18n.IconPosition.title,
            description: I18n.IconPosition.text,
            key: "IconPosition",
            value: settings.get("IconPosition"),
            options: I18n.IconPosition.options,
        },
        {
            type: "checkbox",
            title: I18n.ExpandGutterMenu.title,
            description: I18n.ExpandGutterMenu.text,
            key: "ExpandGutterMenu",
            value: settings.get("ExpandGutterMenu"),
        },
        {
            type: "checkbox",
            title: I18n.ReplaceAlt5Hotkey.title,
            description: I18n.ReplaceAlt5Hotkey.text,
            key: "ReplaceAlt5Hotkey",
            value: settings.get("ReplaceAlt5Hotkey"),
        },
    ];

    const dailynoteItems: ISettingItem[] = [
        {
            type: "textinput",
            title: I18n.DefaultNotebook.title,
            description: I18n.DefaultNotebook.text,
            key: "DefaultNotebook",
            value: settings.get("DefaultNotebook"),
        },
        {
            type: "button",
            title: I18n.NotebookBlacklist.title,
            description: I18n.NotebookBlacklist.text,
            key: "NotebookBlacklist",
            value: "Configure",
            button: {
                label: I18n.NotebookBlacklist.button,
                callback: () => {
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
                },
            },
        },
        {
            type: "checkbox",
            title: I18n.DisableAutoCreateOnMobile.title,
            description: I18n.DisableAutoCreateOnMobile.text,
            key: "DisableAutoCreateOnMobile",
            value: settings.get("DisableAutoCreateOnMobile"),
        },
        {
            type: "button",
            title: I18n.SetPastDailyNoteAttr.title,
            description: I18n.SetPastDailyNoteAttr.text,
            key: "SetPastDailyNoteAttr",
            value: "Configure",
            button: {
                label: I18n.SetPastDailyNoteAttr.button,
                callback: () => {
                    setDNAttrDialog();
                },
            },
        },
        {
            type: "select",
            title: I18n.AutoHandleDuplicateMethod.title,
            description: I18n.AutoHandleDuplicateMethod.text,
            key: "AutoHandleDuplicateMethod",
            value: settings.get("AutoHandleDuplicateMethod"),
            options: I18n.AutoHandleDuplicateMethod.options,
        },
    ];

    const reservationItems: ISettingItem[] = [
        {
            type: "checkbox",
            title: I18n.PopupReserveDialog.title,
            description: I18n.PopupReserveDialog.text,
            key: "PopupReserveDialog",
            value: settings.get("PopupReserveDialog"),
        },
        {
            type: "select",
            title: I18n.ResvEmbedAt.title,
            description: I18n.ResvEmbedAt.text,
            key: "ResvEmbedAt",
            value: settings.get("ResvEmbedAt"),
            options: I18n.ResvEmbedAt.options,
        },
        {
            type: "select",
            title: I18n.RetvType.title,
            description: I18n.RetvType.text,
            key: "RetvType",
            value: settings.get("RetvType"),
            options: I18n.RetvType.options,
        },
        {
            type: "checkbox",
            title: I18n.HighlightResv.title,
            description: I18n.HighlightResv.text,
            key: "HighlightResv",
            value: settings.get("HighlightResv"),
        },
    ];

    onMount(() => {
        DebugKit.info("Setting Svelte Mounted");
    });

    onDestroy(() => {
        DebugKit.info("Setting Svelte Destroyed");
        settings.save();
    });

    function onClick({ detail }) {
        DebugKit.info(detail);
        // let key = detail.key;
        // if (key === "NotebookBlacklist") {
        //     let dialog = new Dialog({
        //         title: i18n.Blacklist.name,
        //         content: `<div id="blacklist" style="height: 100%;"></div>`,
        //         height: "25rem",
        //         width: "30rem",
        //     });
        //     new Blacklist({
        //         target: dialog.element.querySelector("#blacklist"),
        //         props: {
        //             close: () => {
        //                 dialog.destroy();
        //             },
        //         },
        //     });
        // } else if (key === "SetPastDailyNoteAttr") {
        //     setDNAttrDialog();
        // }
    }

    function onChanged({ detail }) {
        // console.log(detail);
        if (detail.key) {
            settings.set(detail.key, detail.value);
            if (detail.key === "DefaultNotebook") {
                if (detail.value !== '' && !notebooks.checkNotebookId(detail.value)) {
                    confirm(
                        i18n.Name,
                        `${detail.value} ${i18n.InvalidDefaultNotebook}`,
                    );
                }
            }
        }
    }
</script>

<div class="fn__flex-1 fn__flex config__panel">
    <ul class="b3-tab-bar b3-list b3-list--background">
        {#each groups as group}
            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
            <li
                data-name="editor"
                class:b3-list-item--focus={group === focusGroup}
                class="b3-list-item"
                on:click={() => {
                    focusGroup = group;
                }}
                on:keydown={() => {}}
            >
                <span class="b3-list-item__text">{group}</span>
            </li>
        {/each}
    </ul>
    <div class="config__tab-wrap">
        <FormPanel
            group={groups[0]}
            settingItems={enableItems}
            display={focusGroup === groups[0]}
            on:changed={onChanged}
            on:click={onClick}
        />
        <FormPanel
            group={groups[1]}
            settingItems={interactItems}
            display={focusGroup === groups[1]}
            on:changed={onChanged}
            on:click={onClick}
        />
        <FormPanel
            group={groups[2]}
            settingItems={dailynoteItems}
            display={focusGroup === groups[2]}
            on:changed={onChanged}
            on:click={onClick}
        />
        <FormPanel
            group={groups[3]}
            settingItems={reservationItems}
            display={focusGroup === groups[3]}
            on:changed={onChanged}
            on:click={onClick}
        />
    </div>
</div>

<style lang="scss">
    .config__panel {
        height: 100%;
    }
    .config__panel > ul > li {
        padding-left: 1rem;
    }

    .config__panel > .b3-tab-bar {
        width: 150px;
        flex-shrink: 0;
        min-width: 60px; /** at least 2 chars */
    }

    /* mobile opt */
    @media screen and (max-width: 768px) {
        .config__panel > .b3-tab-bar {
            width: 100px;
        }

        .b3-list-item__text {
            font-size: 12px;
        }

        .b3-list-item__text {
            font-size: 14px;
            overflow: visible !important; /* non chinese opt */
            text-overflow: clip !important; /* non chinese opt */
            white-space: normal !important; /* non chinese opt */
            word-wrap: break-word !important;
            display: block !important;
        }

        /* tab div */
        .b3-list-item {
            height: 40px !important;
            line-height: 40px !important; /* at least finger can touch */
            padding: 0 0.5rem !important;
            white-space: normal !important;
            word-break: break-word !important;
        }
    }
</style>
