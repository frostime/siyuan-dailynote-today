import { IMenuItemOption, Menu } from "siyuan";
import { currentDiaryStatus, openDiary } from "../func";
import notebooks from "../global-notebooks";
import { settings } from "../global-status";
import { i18n, isMobile } from "../utils";
import { eventBus } from "../event-bus";
import { iconDiary } from "./svg";

import type DailyNoteTodayPlugin from '@/index';
// import * as serverApi from '@/serverApi';


let ContextMenuListener: EventListener;
let UpdateDailyNoteStatusListener: EventListener;
export class ToolbarMenuItem {
    plugin: DailyNoteTodayPlugin;
    ele: HTMLElement;
    iconStatus: Map<string, string>;

    constructor(plugin: DailyNoteTodayPlugin) {
        this.plugin = plugin;
        ContextMenuListener = (event: MouseEvent) => this.contextMenu(event);
        UpdateDailyNoteStatusListener = () => this.updateDailyNoteStatus();
        this.iconStatus = new Map();
        //注册事件总线，以防 moveBlocks 完成后新的日记被创建，而状态没有更新
        eventBus.subscribe('moveBlocks', UpdateDailyNoteStatusListener);

        // setting 异步加载完成后, 发送 event bus
        eventBus.subscribe(eventBus.EventSettingLoaded, () => { this.addTopBarIcon(); });
    }

    release() {
        this.ele.removeEventListener('contextmenu', ContextMenuListener);
        eventBus.unSubscribe('moveBlocks', UpdateDailyNoteStatusListener);
        this.ele.remove();
        this.ele = null;
        console.debug('TopBarIcon released');
    }

    //等到设置加载完毕后, 重新更新图标位置
    addTopBarIcon() {
        // console.log('addTopBarIcon');
        // this.ele.remove();
        this.ele = this.plugin.addTopBar({
            icon: iconDiary.icon32,
            title: i18n.Name,
            position: settings.get('IconPosition'),
            callback: () => { this.showMenu(); }
        });
        this.ele.addEventListener('contextmenu', ContextMenuListener);
        this.updateDailyNoteStatus();
    }

    contextMenu(event: MouseEvent) {
        //阻止浏览器上弹出右键菜单
        event.preventDefault();
        let menu = new Menu("dntoday-config");
        menu.addItem({
            label: i18n.Setting.name,
            icon: 'iconSettings',
            click: () => { eventBus.publish('OpenSetting', ''); }
        });

        menu.addItem({
            label: i18n.Setting.update.title,
            icon: 'iconRefresh',
            click: () => { eventBus.publish(eventBus.EventUpdateAll, ''); }
        });

        let rect = this.ele.getBoundingClientRect();
        const iconIsRight = settings.get('IconPosition') === 'right';
        menu.open({
            x: iconIsRight ? rect.right : rect.left,
            y: rect.bottom,
            isLeft: iconIsRight,
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
        // Plugin sample
        if (rect.width === 0) {
            rect = document.querySelector("#barMore").getBoundingClientRect();
        }
        if (isMobile) {
            menu.fullscreen();
        } else {
            const iconIsRight = settings.get('IconPosition') === 'right';
            menu.open({
                x: iconIsRight ? rect.right : rect.left,
                y: rect.bottom,
                isLeft: iconIsRight,
            });
        }
        // this.updateDailyNoteStatus();
    }

    createMenuItems() {
        let blacklist = settings.get('NotebookBlacklist');
        let menuItems: any[] = [];
        for (let notebook of notebooks) {
            let forbidden = blacklist?.[notebook.id];
            forbidden = forbidden === undefined ? false : forbidden;
            if (forbidden === true) {
                continue;
            }

            let item: IMenuItemOption = {
                label: notebook.name,
                icon: this.iconStatus.get(notebook.id),
                click: async () => {
                    if (notebook.id === notebooks.default.id) {
                        await openDiary(notebook);
                        this.plugin.routineHandler.tryAutoInsertResv();
                    } else {
                        openDiary(notebook);
                    }
                }
            }
            menuItems.push(item);
        }
        return menuItems;
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
