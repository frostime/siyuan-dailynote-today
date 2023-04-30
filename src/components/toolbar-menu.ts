import { Menu, MenuItem, clientApi } from "siyuan";
import { openDiary } from "../func";
import notebooks from "../global-notebooks";
import { settings } from "../global-setting";
import { info } from "../utils";

const TOOLBAR_ITEMS = 'toolbar__item b3-tooltips b3-tooltips__sw';

export class ToolbarMenuItem {
    ele: HTMLElement;
    menu: Menu;

    constructor() {
        this.ele = document.createElement('div');
        this.ele.setAttribute('aria-label', '打开今日的日记');
        this.ele.classList.add(...TOOLBAR_ITEMS.split(/\s/));
        let svg_icon = `<svg><use xlink:href="#iconEdit"></use></svg>`;
        this.ele.innerHTML = svg_icon;
        this.ele.addEventListener('click', this.onclick.bind(this));
        clientApi.addToolbarRight(this.ele);
    }

    release() {
        this.ele.removeEventListener('click', this.onclick.bind(this));
        this.ele.remove();
    }

    onclick(event) {
        info('点击了今日日记按钮');
        let menu = new Menu("dntoday-menu");
        let menuItems = this.createMenuItems();
        for (let item of menuItems) {
            menu.addItem(new MenuItem(item));
        }
        menu.showAtMouseEvent(event);
    }

    async initMenu() {
        this.menu = new Menu("dntoday-menu");
        let menuItems = this.createMenuItems();
        for (let item of menuItems) {
            this.menu.addItem(new MenuItem(item));
        }
    }

    createMenuItems() {
        let menuItems: any[] = [];
        for (let notebook of notebooks) {
            let item = {
                label: notebook.name,
                icon: `icon-${notebook.icon}`,
                click: (ele) => {
                    openDiary(notebook);
                }
            }
            menuItems.push(item);
        }
        return menuItems;
    }
}
