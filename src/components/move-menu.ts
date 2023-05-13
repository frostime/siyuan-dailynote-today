/**
 * Copyright (c) 2023 frostime. All rights reserved.
 */
import { Menu } from "siyuan";
import { moveBlocksToDailyNote } from "../func";
import { Notebook } from "../types"
import { i18n, info, StaticText } from "../utils";
import notebooks from "../global-notebooks";
import { eventBus } from "../event-bus";

export class ContextMenu {

    private observer: MutationObserver | null = null;

    constructor() {
    }

    async bindMenuOnCurrentTabs() {
        let gutter: HTMLDivElement | null = document.querySelector(
            'div.protyle-gutters'
        );
        gutter?.addEventListener('contextmenu', this.gutterContextMenuEvent.bind(this));
    }

    addEditorTabObserver() {
        let centerLayout = document.querySelector('#layouts div.layout__center div.layout-tab-container') as HTMLElement;
        let gutterContextMenuEvent = (event: MouseEvent) => { this.gutterContextMenuEvent(event) };
        this.observer = new MutationObserver(function (mutationsList) {
            for (var mutation of mutationsList) {
                if (mutation.type == 'childList' && mutation.addedNodes.length) {
                    for (let node of mutation.addedNodes) {
                        let protyle: HTMLElement = node as HTMLElement;
                        let gutter: HTMLDivElement | null = protyle.querySelector(
                            'div.protyle-gutters'
                        );
                        gutter?.addEventListener('contextmenu', gutterContextMenuEvent);
                        let data_id = protyle.getAttribute('data-id');
                        info(`Add Listener: protyle-${data_id}`);
                    }
                }
                if (mutation.type == 'childList' && mutation.removedNodes.length) {
                    //删除 Listener
                    for (let node of mutation.removedNodes) {
                        let protyle: HTMLElement = node as HTMLElement;
                        let gutter: HTMLDivElement | null = protyle.querySelector(
                            'div.protyle-gutters'
                        );
                        gutter?.removeEventListener('contextmenu', gutterContextMenuEvent);
                        let data_id = protyle.getAttribute('data-id');
                        info(`Remove Listener: protyle-${data_id}`);
                    }
                }
            }
        });
        if (centerLayout) {
            this.observer.observe(centerLayout!, {
                childList: true,
                attributes: false,
                characterData: false,
                subtree: false
            });
        }
    }

    removeEditorTabObserver() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }

    gutterContextMenuEvent(event: MouseEvent) {
        let src_ele = event.target as HTMLElement;
        let tar_ele = event.currentTarget as HTMLElement;

        //找到最近的 btn，因为只有 btn 才有 data-node-id
        while (src_ele != tar_ele) {
            if (src_ele.tagName === 'BUTTON') {
                break;
            }
            if (src_ele.parentElement) {
                src_ele = src_ele.parentElement;
            } else {
                break;
            }
        }
        let data_id = src_ele.getAttribute('data-node-id');

        if (data_id && event.altKey) {
            info(`Contextemnu on: ${data_id}`);
            let menu = new Menu('MoveMenu');
            menu.addItem({
                label: i18n.Menu.Move,
                type: 'submenu',
                icon: 'iconMove',
                submenu: this.createMenuItems(data_id),
            });
            console.log(event);
            menu.open({
                x: event.x,
                y: event.y
            })
        }
        event.stopPropagation();
    }

    createMenuItems(data_id: string) {
        let menuItems: any[] = [];
        for (let notebook of notebooks) {
            let item = {
                label: notebook.name,
                icon: `icon-${notebook.icon}`,
                click: async () => {
                    info(`Move ${data_id} to ${notebook.id}`);
                    await moveBlocksToDailyNote(data_id, notebook);
                    eventBus.publish('moveBlocks', '');
                }
            }
            menuItems.push(item);
        }
        return menuItems;
    }
}