import notebooks from "../global-notebooks";
import { moveBlocksToDailyNote } from "../func";
import { i18n, info, lute } from "../utils";
import { eventBus } from "../event-bus";
import { Menu, showMessage, confirm, Dialog } from "siyuan";
import { iconDiary } from "./svg";
import * as serverApi from "../serverApi";
import { Block } from "../types";

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

const DatePattern = [
    //xxxx年xx月xx日, xxxx-xx-xx, xxxx/xx/xx
    /(?:(?<year>\d{4})[ ]?[-年/])?(?:[ ]?(?<month>\d{1,2})[ ]?[-月/])[ ]?(?<day>\d{1,2})[ ]?[日号]?/
]

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
        // console.log(detail);

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
                },
                {
                    label: i18n.ReserveMenu.name,
                    icon: 'iconHistory',
                    click: () => this.reserveBlock(blockId)
                }
            ]
        });
    }

    async reserveBlock(blockId) {
        let block = await serverApi.getBlockByID(blockId);
        let content: string = block.content;
        // console.log(content);
        let match = null
        //匹配日期正则表达式
        for (let pattern of DatePattern) {
            //find
            match = content.match(pattern);
            if (match) {
                break;
            }
        }
        if (!match) {
            showMessage(i18n.ReserveMenu.Date404, 3000, 'error');
            return;
        }
        let year = match.groups.year;
        let month = match.groups.month;
        let day = match.groups.day;
        if (!year) {
            let today = new Date();
            year = today.getFullYear().toString();
        }
        console.log(year, month, day);
        //检查是否是有效日期
        let date = new Date(`${year}-${month}-${day}`);
        if (date.toString() === 'Invalid Date') {
            confirm('Error', `${year}-${month}-${day}: ${i18n.ReserveMenu.DateInvalid}`);
            return;
        }
        //检查是不是过去
        let today = new Date();
        if (date < today) {
            confirm('Error', `${year}-${month}-${day}: ${i18n.ReserveMenu.DatePast}`);
            return;
        }

        ShowReserveDialog(block, date);
    }
}

async function ShowReserveDialog(block: Block, date: Date) {
    let kram = await serverApi.getBlockKramdown(block.id);
    let kramdown: string = kram.kramdown;
    kramdown = kramdown.replace(/{: (?:\w+=".+")+}/g, '');
    // console.log(kramdown);
    let html = lute.Md2HTML(kramdown);
    console.log(html);
    html = `<div id="dialog" class="b3-typography" style="margin: 1.5rem">${html}</div>`;
    new Dialog({
        title: i18n.ReserveMenu.name,
        content: html,
        width: '50%',
    })
}
