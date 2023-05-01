import { Menu, MenuItem, clientApi } from "siyuan";
import { currentDiaryStatus, openDiary } from "../func";
import notebooks from "../global-notebooks";
import { ToolbarItem } from "./interface";
import { settings } from "../global-setting";
import { info } from "../utils";

const TOOLBAR_ITEMS = 'toolbar__item b3-tooltips b3-tooltips__sw';

export class ToolbarMenuItem implements ToolbarItem {
    ele: HTMLElement;
    menu: Menu;

    constructor() {
        this.ele = document.createElement('div');
        this.ele.setAttribute('aria-label', '打开今日的日记');
        this.ele.classList.add(...TOOLBAR_ITEMS.split(/\s/));
        let svg_icon = `<svg><use xlink:href="#iconEdit"></use></svg>`;
        this.ele.innerHTML = svg_icon;
        this.ele.addEventListener('click', this.showMenu.bind(this));
        clientApi.addToolbarRight(this.ele);
    }

    release() {
        this.ele.removeEventListener('click', this.showMenu.bind(this));
        this.ele.remove();
    }

    showMenu(event) {
        info('点击了今日日记按钮');
        let menu = new Menu("dntoday-menu");
        let menuItems = this.createMenuItems();
        for (let item of menuItems) {
            menu.addItem(new MenuItem(item));
        }
        menu.showAtMouseEvent(event);
    }

    createMenuItems() {
        let menuItems: any[] = [];
        for (let notebook of notebooks) {
            let item = {
                label: notebook.name,
                icon: 'icon-select',
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
        if (notebooks.notebooks.length > 0) {
            if (settings.settings.OpenOnStart === true) {
                openDiary(notebooks.get(0));
            }
        }
    }

    /**
     * 
     */
    updateNotebookStatus(): void {
        this.menu = new Menu("dntoday-menu");
        let menuItems = this.createMenuItems();
        for (let item of menuItems) {
            this.menu.addItem(new MenuItem(item));
        }
    }

    async updateDailyNoteStatus() {
        //TODO
        let diaryStatus: Map<string, boolean> = await currentDiaryStatus();
    }

}
