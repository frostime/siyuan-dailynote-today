import { IMenuItemOption, Menu, Plugin, confirm, showMessage } from "siyuan";
import { currentDiaryStatus, openDiary, initTodayReservation, updateTodayReservation } from "../func";
import notebooks from "../global-notebooks";
import { reservation, settings } from "../global-status";
import { info, i18n, isMobile } from "../utils";
import { eventBus } from "../event-bus";
import { iconDiary } from "./svg";

import * as serverApi from '@/serverApi';


let ContextMenuListener: EventListener;
let UpdateDailyNoteStatusListener: EventListener;
export class ToolbarMenuItem {
    plugin: Plugin;
    ele: HTMLElement;
    iconStatus: Map<string, string>;

    private onProtyleLoadedBindThis = this.onProtyleLoaded.bind(this);

    constructor(plugin: Plugin) {
        this.plugin = plugin;
        ContextMenuListener = (event: MouseEvent) => this.contextMenu(event);
        UpdateDailyNoteStatusListener = () => this.updateDailyNoteStatus();
        this.iconStatus = new Map();
        //注册事件总线，以防 moveBlocks 完成后新的日记被创建，而状态没有更新
        eventBus.subscribe('moveBlocks', UpdateDailyNoteStatusListener);

        //1. 由于 SiYuan 要求 topbar 必须在 await 前, 所以这里姑且放一个 dummy icon
        //实测发现不需要提前创建, 也可以
        // this.ele = this.plugin.addTopBar({
        //     icon: iconDiary.icon32,
        //     title: i18n.Name,
        //     position: 'left',
        //     callback: () => { }
        // });
        // this.ele.style.display = 'none'; // FW icon, 不显示

        // setting 异步加载完成后, 发送 event bus
        eventBus.subscribe(eventBus.EventSettingLoaded, () => { this.addTopBarIcon(); });
        
    }

    /**
     * 根据预约情况, 监听日记本的加载, 如果是今天的日记本, 则更新预约状态
     * @returns 
     */
    startMonitorDailyNoteForReservation() {
        if (!reservation.isTodayReserved) {
            return
        }
        this.plugin.eventBus.on("loaded-protyle", this.onProtyleLoadedBindThis);
        // 3分钟后, 取消监听, 防止不必要的性能损耗
        setTimeout(
            () => {
                this.plugin.eventBus.off("loaded-protyle", this.onProtyleLoadedBindThis);
            }, 
            1000 * 60 * 2
        );
    }

    release() {
        this.ele.removeEventListener('contextmenu', ContextMenuListener);
        eventBus.unSubscribe('moveBlocks', UpdateDailyNoteStatusListener);
        this.ele.remove();
        this.ele = null;
        this.plugin.eventBus.off("loaded-protyle", this.onProtyleLoadedBindThis);
        info('TopBarIcon released');
    }

    //等到设置加载完毕后, 重新更新图标位置
    addTopBarIcon() {
        console.log('addTopBarIcon');
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
            click: () => {eventBus.publish('OpenSetting', '');}
        });
        menu.addItem({
            label: i18n.ContextMenu.PruneResv,
            icon: 'iconTrashcan',
            click: async () => {await reservation.doPrune(); showMessage(i18n.Msg.PruneResv);}
        });
        menu.addItem({
            label: i18n.Setting.update.title,
            icon: 'iconRefresh',
            click: () => {eventBus.publish(eventBus.EventUpdateAll, '');}
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
                click: async () => openDiary(notebook),
            }
            menuItems.push(item);
        }
        return menuItems;
    }

    /**
     * 初始化的时候，加载所有的笔记本
     */
    async autoOpenDailyNote() {
        info('自动开启日记');
        if (isMobile && settings.get('DisableAutoCreateOnMobile') === true) {
            // showMessage('移动端不开放');
            return;
        }
        //小窗打开模式下, 不再自动打开
        const url = new URL(window.location.href);
        // showMessage(url.pathname);
        if (url.pathname.startsWith('/stage/build/app/window.html')) {
            console.log('小窗模式');
            return;
        }

        if (notebooks.notebooks.length > 0) {
            if (settings.settings.OpenOnStart === true) {
                let notebookId: string = settings.get('DefaultNotebook');
                let notebook: Notebook = notebooks.default;
                if (notebook) {
                    await openDiary(notebook);
                    // initTodayReservation(notebook);
                } else {
                    confirm(i18n.Name, `${notebookId} ${i18n.InvalidDefaultNotebook}`)
                    return
                }
            }
        }
    }

    /**
     * 监听自动打开日记后，插入当天预约用
     */
    private async onProtyleLoaded({ detail }) {
        const block_ = detail.block;
        if (block_.id != block_.rootID) {
            return;
        }
        //是否为文档
        const headElement: HTMLElement = detail?.model?.headElement;
        if (!headElement) {
            return;
        }
        //笔记本是否是默认笔记本
        const notebookId = detail.notebookId;
        if (notebookId !== notebooks.default.id) {
            return;
        }


        const CheckReservation = async (blockId: BlockId, cnt: number =1) => {
            if (cnt > 3) {
                return;
            }
            console.debug("检查", blockId);
            const block: Block = await serverApi.getBlockByID(blockId);
            if (block === undefined) {
                console.warn(`New opened docId ${blockId} undefined`);
                //能调用这个函数，说明这个文档一定存在，查不到就继续等继续差
                setTimeout(() => CheckReservation(blockId, cnt++), 1000 * cnt);
                return
            }
            // console.log(block.hpath);
            if (notebooks.default.dailynoteHpath === block.hpath) {
                console.debug('Got Today\'s daily note');
                this.plugin.eventBus.off("loaded-protyle", this.onProtyleLoadedBindThis);
                await updateTodayReservation(notebooks.default, true);
            }
        }
        console.debug("2s后检查",  block_.id);
        //如果是新创建的日记，那么在这一刻后端是拿不到对应的块的，所以需要先等一下
        setTimeout(() => CheckReservation(block_.id), 1000 * 2);
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
