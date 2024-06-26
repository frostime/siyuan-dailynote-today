import { i18n } from "@/utils";
import { EventBus, Menu } from "siyuan";
import { iconDiary } from "./svg";
import { settings } from "@/global-status";
import { reserveBlock, dereserveBlock } from "@/func/reserve";
import { createMenuItems } from "@/func/move";

let blockGutterClickEvent: EventListener;
let docGutterClickEvent: EventListener;

//后面会用来替代原来的菜单组件
export class GutterMenu {
    menuItems: any[] = [];
    eventBus: any;

    constructor(eventBus: EventBus) {
        blockGutterClickEvent = (e) => this.onBlockGutterClicked(e);
        docGutterClickEvent = (e) => this.onDocGutterClicked(e);
        this.eventBus = eventBus;
        eventBus.on("click-blockicon", blockGutterClickEvent);
        eventBus.on("click-editortitleicon", docGutterClickEvent);
    }

    release() {
        this.eventBus.off("click-blockicon", blockGutterClickEvent);
        this.eventBus.off("click-editortitleicon", docGutterClickEvent);
    }

    onBlockGutterClicked({ detail }: any) {
        //一次只移动一个块
        if (detail.blockElements.length > 1) {
            return;
        }

        // detail.menu.addSeparator(0);
        let menu: Menu = detail.menu;
        let protype: HTMLElement = detail.blockElements[0];
        let blockId = protype.getAttribute('data-node-id');
        let reservation: Attr = protype.attributes.getNamedItem('custom-reservation');
        let menuList = [];

        // console.log(detail)

        if (settings.get("EnableReserve") === true) {
            //存在预约, 可以用于取消
            if (reservation) {
                menuList.push({
                    label: i18n.DeReserveMenu.name,
                    icon: 'iconClose',
                    click: () => dereserveBlock(blockId)
                });
            } else {
                menuList.push({
                    label: i18n.ReserveMenu.name,
                    icon: 'iconHistory',
                    click: () => reserveBlock(blockId)
                });
            }
        }

        if (settings.get("EnableMove") === true) {
            let items = createMenuItems(blockId);
            menuList.push({
                label: i18n.MoveMenu.Move,
                type: 'submenu',
                icon: 'iconMove',
                submenu: items,
            });
        }

        if (menuList.length > 0) {
            let expand = settings.get("ExpandGutterMenu");
            if (expand === true) {
                menuList.forEach(item => {
                    menu.addItem(item);
                });
            } else {
                menu.addItem({
                    iconHTML: iconDiary.icon16,
                    label: i18n.Name,
                    type: 'submenu',
                    submenu: menuList
                });
            }
        }
    }

    onDocGutterClicked({ detail }: any) {
        // console.log(detail);

        let docId = detail.data.id;
        if (docId === undefined) {
            return;
        }

        let menu: Menu = detail.menu;
        // let protyle: HTMLElement = detail.protyle.title.element;

        let items = createMenuItems(docId, 'doc');
        menu.addItem({
            label: i18n.MoveMenu.Move,
            type: 'submenu',
            icon: 'iconMove',
            submenu: items,
        });
    }
}
