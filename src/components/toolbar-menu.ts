import { IMenuItemOption, Menu, Plugin, showMessage, confirm } from "siyuan";
import { currentDiaryStatus, insertTodayReservation, openDiary, updateTodayReservation } from "../func";
import notebooks from "../global-notebooks";
import { reservation, settings } from "../global-status";
import { info, i18n } from "../utils";
import { eventBus } from "../event-bus";
import { iconDiary } from "./svg";
import * as serverApi from '../serverApi';
import { Notebook } from "../types";

export class ToolbarMenuItem {
    plugin: Plugin;
    ele: HTMLDivElement;
    iconStatus: Map<string, string>;

    constructor(plugin: Plugin) {
        this.plugin = plugin;
        this.ele = this.plugin.addTopBar({
            // icon: 'iconCalendar',
            icon: iconDiary.icon32,
            title: i18n.Name,
            position: settings.get('IconPosition'),
            callback: () => { this.showMenu(); }
        })
        this.iconStatus = new Map();

        //右键展开配置菜单
        this.ele.addEventListener('contextmenu', this.contextMenu.bind(this));
        //注册事件总线，以防 moveBlocks 完成后新的日记被创建，而状态没有更新
        eventBus.subscribe('moveBlocks', this.updateDailyNoteStatus.bind(this));
    }

    contextMenu(event: MouseEvent) {
        //阻止浏览器上弹出右键菜单
        event.preventDefault();
        let menu = new Menu("dntoday-config");
        menu.addItem({
            label: i18n.Setting.name,
            icon: 'iconSettings',
            click: () => {eventBus.publish('OpenSetting', '');}
        })
        menu.addItem({
            label: i18n.Setting.update.title,
            icon: 'iconRefresh',
            click: () => {eventBus.publish('UpdateAll', '');}
        })

        let rect = this.ele.getBoundingClientRect();
        menu.open({
            x: rect.left,
            y: rect.bottom,
        })
        event.stopPropagation();
    }

    async showMenu() {
        await this.updateDailyNoteStatus();
        let menu = new Menu("dntoday-menu");
        let menuItems = this.createMenuItems();
        for (let item of menuItems) {
            menu.addItem(item);
        }
        let rect = this.ele.getBoundingClientRect();
        menu.open({
            x: rect.left,
            y: rect.bottom,
        });
        // this.updateDailyNoteStatus();
    }

    createMenuItems() {
        let menuItems: any[] = [];
        for (let notebook of notebooks) {
            let item: IMenuItemOption = {
                label: notebook.name,
                icon: this.iconStatus.get(notebook.id),
                click: async (ele) => openDiary(notebook),
            }
            menuItems.push(item);
        }
        return menuItems;
    }

    /**
     * 初始化的时候，加载所有的笔记本
     */
    async autoOpenDailyNote() {
        info('自动开启日记');
        if (notebooks.notebooks.length > 0) {
            if (settings.settings.OpenOnStart === true) {
                let notebookId: string = settings.get('DefaultNotebook');
                notebookId = notebookId.trim();
                let notebook: Notebook;
                if (notebookId != '') {
                    notebook = notebooks.find(notebookId);
                    if (notebook) {
                        await openDiary(notebook);
                    } else {
                        // showMessage(`${notebookId}: ${i18n.InvalidDefaultNotebook}`, 5000, "error");
                        confirm(i18n.Name, `${notebookId} ${i18n.InvalidDefaultNotebook}`)
                        // openDiary(notebooks.get(0));
                        return
                    }
                } else {
                    await openDiary(notebooks.get(0));
                    notebook = notebooks.get(0);
                }
                if (notebook) {
                    console.log(`open diary: ${notebook.name}`);
                    //不等一会的话, 会拿不到新创建的日记的 ID
                    setTimeout(() => updateTodayReservation(notebook), 2000);
                }
            }
        }
    }

    async updateDailyNoteStatus() {
        let diaryStatus: Map<string, boolean> = await currentDiaryStatus();
        notebooks.notebooks.forEach((notebook) => {
            let status = diaryStatus.get(notebook.id);
            if (status) {
                this.iconStatus.set(notebook.id, 'iconSelect');
            } else {
                this.iconStatus.set(notebook.id, '');
            }
        });
    }

}
