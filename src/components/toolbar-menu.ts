import { Menu, MenuItem, clientApi } from "siyuan";
import { currentDiaryStatus, openDiary } from "../func";
import notebooks from "../global-notebooks";
import { settings } from "../global-setting";
import { info, StaticText } from "../utils";

const TOOLBAR_ITEMS = 'toolbar__item b3-tooltips b3-tooltips__sw';

export class ToolbarMenuItem {
    ele: HTMLElement;
    menu: Menu;
    icons: Map<string, string> = new Map();

    constructor() {
        this.ele = document.createElement('div');
        this.ele.setAttribute('aria-label', StaticText.ToolbarAriaLabel);
        this.ele.classList.add(...TOOLBAR_ITEMS.split(/\s/));
        let svg_icon = `<svg><use xlink:href="#iconCalendar"></use></svg>`;
        this.ele.innerHTML = svg_icon;
        this.ele.addEventListener('click', this.showMenu.bind(this));
        clientApi.addToolbarRight(this.ele);
    }

    release() {
        this.ele.removeEventListener('click', this.showMenu.bind(this));
        this.ele.remove();
    }

    async showMenu(event) {
        info('点击了今日日记按钮');
        // await this.updateDailyNoteStatus();
        let menu = new Menu("dntoday-menu");
        let menuItems = this.createMenuItems();
        for (let item of menuItems) {
            menu.addItem(new MenuItem(item));
        }
        menu.showAtMouseEvent(event);
        event.stopPropagation();
        this.updateDailyNoteStatus();
    }

    createMenuItems() {
        let menuItems: any[] = [];
        for (let notebook of notebooks) {
            let item = {
                label: notebook.name,
                icon: this.icons.get(notebook.id),
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
        notebooks.notebooks.forEach((notebook) => {
            let status = diaryStatus.get(notebook.id);
            if (status) {
                this.icons.set(notebook.id, 'iconSelect');
            } else {
                this.icons.set(notebook.id, '');
            }
        });
    }

}
