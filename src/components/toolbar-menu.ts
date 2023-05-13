import { IMenuItemOption, Menu, Plugin } from "siyuan";
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
        //TODO 更换 icon
        this.ele = this.plugin.addTopBar({
            // icon: 'iconCalendar',
            icon: iconDiary.icon1,
            title: i18n.ToolbarAriaLabel,
            position: 'left',
            callback: () => { this.showMenu(); }
        })
        this.iconStatus = new Map();

        eventBus.subscribe('moveBlocks', this.updateDailyNoteStatus.bind(this));
    }

    showMenu() {
        info('点击了今日日记按钮');
        // await this.updateDailyNoteStatus();
        let menu = new Menu("dntoday-menu");
        let menuItems = this.createMenuItems();
        for (let item of menuItems) {
            menu.addItem(item);
        }
        let rect = this.ele.getBoundingClientRect();
        menu.open({
            x: rect.right,
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
        info('Auto open daily note');
        if (notebooks.notebooks.length > 0) {
            if (settings.settings.OpenOnStart === true) {
                openDiary(notebooks.get(0));
            }
        }
    }

    async updateDailyNoteStatus() {
        info('Update daily note status');
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
