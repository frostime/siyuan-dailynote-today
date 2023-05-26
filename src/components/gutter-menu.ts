import notebooks from "../global-notebooks";
import { moveBlocksToDailyNote } from "../func";
import { i18n, info } from "../utils";
import { eventBus } from "../event-bus";
import { Menu } from "siyuan";
import { iconDiary } from "./svg";

function createMenuItems(data_id: string) {
    let menuItems: any[] = [];
    for (let notebook of notebooks) {
        let item = {
            label: notebook.name,
            icon: `icon-${notebook.icon}`,
            click: async () => {
                info(`Move ${data_id} to ${notebook.id} [${notebook.name}]`);
                await moveBlocksToDailyNote(data_id, notebook);
                eventBus.publish('moveBlocks', '');
            }
        }
        menuItems.push(item);
    }
    return menuItems;
}

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

    onGutterClicked({detail}: any) {
        console.log(detail);

        //一次只移动一个块
        if (detail.blockElements.length > 1) {
            return;
        }

        // detail.menu.addSeparator(0);
        let menu: Menu = detail.menu;
        let blockId = detail.blockElements[0].getAttribute('data-node-id');
        let items = createMenuItems(blockId);
        menu.addItem({
            iconHTML: iconDiary.icon16,
            label: i18n.Name,
            type: 'submenu',
            submenu: [
                {
                    label: i18n.MoveMenu.Move,
                    type: 'submenu',
                    icon: 'iconMove',
                    submenu: items,
                }
            ]
        });
    }
}