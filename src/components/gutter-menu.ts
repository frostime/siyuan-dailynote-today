import { i18n } from "../utils";
import { Menu } from "siyuan";
import { iconDiary } from "./svg";
import { settings } from "../global-status";
import { reserveBlock } from "./libs/reserve";
import { createMenuItems } from "./libs/move";

let clickEvent: any;

//后面会用来替代原来的菜单组件
export class GutterMenu {
    menuItems: any[] = [];
    eventBus: any;

    constructor(eventBus) {
        clickEvent = (e) => this.onGutterClicked(e);
        this.eventBus = eventBus;
        eventBus.on("click-blockicon", clickEvent);
    }

    release() {
        this.eventBus.off("click-blockicon", clickEvent);
    }

    onGutterClicked({ detail }: any) {
        // console.log(detail);

        //一次只移动一个块
        if (detail.blockElements.length > 1) {
            return;
        }

        // detail.menu.addSeparator(0);
        let menu: Menu = detail.menu;
        let blockId = detail.blockElements[0].getAttribute('data-node-id');

        let menuList = [];
        if (settings.get("EnableMove") === true) {
            let items = createMenuItems(blockId);
            menuList.push({
                label: i18n.MoveMenu.Move,
                type: 'submenu',
                icon: 'iconMove',
                submenu: items,
            });
        }

        if (settings.get("EnableReserve") === true) {
            menuList.push({
                label: i18n.ReserveMenu.name,
                icon: 'iconHistory',
                click: () => reserveBlock(blockId)
            });
        }

        if (menuList.length > 0) {
            menu.addItem({
                iconHTML: iconDiary.icon16,
                label: i18n.Name,
                type: 'submenu',
                submenu: menuList
            });
        }
    }
}
