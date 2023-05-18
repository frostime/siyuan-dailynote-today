import { IMenuItemOption, Menu, Plugin, showMessage } from "siyuan";
import { currentDiaryStatus, openDiary } from "../func";
import notebooks from "../global-notebooks";
import { settings } from "../global-setting";
import { info, i18n } from "../utils";
import { eventBus } from "../event-bus";
import { iconDiary } from "./svg";

export class ToolbarMenuItem {
    plugin: Plugin;
    ele: HTMLDivElement;
    iconStatus: Map<string, string>;

    constructor(plugin: Plugin) {
        this.plugin = plugin;
        this.ele = this.plugin.addTopBar({
            // icon: 'iconCalendar',
            icon: iconDiary.icon1,
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

    showMenu() {
        // await this.updateDailyNoteStatus();
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
        this.updateDailyNoteStatus();
    }

    createMenuItems() {
        let menuItems: any[] = [];
        for (let notebook of notebooks) {
            let item: IMenuItemOption = {
                label: notebook.name,
                icon: this.iconStatus.get(notebook.id),
                click: (ele) => {
                    openDiary(notebook);
                }
            }
            menuItems.push(item);
        }
        return menuItems;
    }

    /**
     * 初始化的时候，加载所有的笔记本
     */
    autoOpenDailyNote() {
        info('自动开启日记');
        if (notebooks.notebooks.length > 0) {
            if (settings.settings.OpenOnStart === true) {
                let notebookId: string = settings.get('DefaultNotebook');
                notebookId = notebookId.trim();
                if (notebookId != '') {
                    let notebook = notebooks.find(notebookId);
                    if (notebook) {
                        openDiary(notebook);
                    } else {
                        showMessage(`${notebookId}: ${i18n.InvalidDefaultNotebook}`, 5000, "error");
                        // openDiary(notebooks.get(0));
                    }
                } else {
                    openDiary(notebooks.get(0));
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
