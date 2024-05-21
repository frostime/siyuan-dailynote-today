/**
 * Copyright (c) 2023 frostime. All rights reserved.
 */
import { Plugin, getFrontend, showMessage, Dialog } from 'siyuan';
import Setting from './components/setting-gui.svelte'
import ShowReserve from './components/dock-reserve.svelte';
import { ToolbarMenuItem } from './components/toolbar-menu';
import { GutterMenu } from './components/gutter-menu';

import { RoutineEventHandler } from './func';
import { updateTodayReservation, reserveBlock, dereserveBlock } from './func/reserve';
import { updateStyleSheet, removeStyleSheet, toggleGeneralDailynoteKeymap, openDefaultDailyNote } from './func';

import { setApp, setI18n, setIsMobile, setPlugin, getFocusedBlock } from './utils';
import { settings, reservation } from './global-status';
import notebooks from './global-notebooks';

import { eventBus } from './event-bus';

import { changelog } from 'sy-plugin-changelog';

import "./index.scss";


export default class DailyNoteTodayPlugin extends Plugin {

    version: string;
    upToDate: any = null;
    enableBlockIconClickEvent: boolean = false;
    isMobile: boolean = false;

    toolbarItem: ToolbarMenuItem;

    gutterMenu: GutterMenu;

    routineHandler: RoutineEventHandler;

    async onload() {
        console.debug('Plugin load');
        let start = performance.now();

        const frontEnd = getFrontend();
        this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";

        setIsMobile(this.isMobile);

        setI18n(this.i18n); //设置全局 i18n
        setApp(this.app); //设置全局 app
        setPlugin(this); //设置全局 plugin

        settings.setPlugin(this);
        reservation.setPlugin(this);

        //初始化 UI
        this.initPluginUI();

        //初始化数据
        await Promise.all([reservation.load(), settings.load(), notebooks.init()]);

        this.toggleDnHotkey(settings.get('ReplaceAlt5Hotkey'));

        this.initBlockIconClickEvent();  //绑定点击块图标事件

        this.initUpToDate();  //更新计时器

        eventBus.subscribe(eventBus.EventUpdateAll, () => { this.updateAll() });

        updateStyleSheet('');

        this.routineHandler = new RoutineEventHandler(this);
        this.routineHandler.onPluginLoad();

        let end = performance.now();
        console.debug(`启动耗时: ${end - start} ms`);

        let ans = await changelog(this, 'i18n/CHANGELOG.md');
        if (ans?.Dialog) {
            let dialog = ans.Dialog;
            dialog.setSize({ width: '50rem', height: '25rem' });
            dialog.setFont('1.1rem');
        }
    }

    private initPluginUI() {
        this.addCommand({
            langKey: 'reserve',
            langText: `${this.i18n.ReserveMenu.name}/${this.i18n.DeReserveMenu.name}`,
            hotkey: '⌥⇧R',
            editorCallback: async () => {
                let block: HTMLElement = getFocusedBlock();
                if (block) {
                    //解决列表块的特殊情况
                    let datatype = block.getAttribute('data-type');
                    if (datatype === 'NodeParagraph') {
                        let parent = block?.parentElement;
                        datatype = parent?.getAttribute('data-type');
                        if (datatype === 'NodeListItem') {
                            block = parent;
                        }
                    }

                    const blockId = block.getAttribute('data-node-id');
                    let reservation: Attr = block.attributes.getNamedItem('custom-reservation');
                    if (settings.get("EnableReserve") === true) {
                        //存在预约, 可以用于取消
                        if (reservation) {
                            dereserveBlock(blockId)
                        } else {
                            reserveBlock(blockId)
                        }
                    }
                }
            }
        });

        this.toolbarItem = new ToolbarMenuItem(this);

        eventBus.subscribe(eventBus.EventSettingLoaded, this.onSettingLoaded.bind(this));
        eventBus.subscribe('OpenSetting', this.openSetting.bind(this));
    }

    /**
     * 打开日记的 hotkey
     * @param enable 
     */
    toggleDnHotkey(enable: boolean) {
        if (enable === true) {
            this.addCommand({
                langKey: 'open-dn',
                langText: this.i18n.Open,
                hotkey: '⌥5',
                callback: openDefaultDailyNote
            });
            toggleGeneralDailynoteKeymap(false);
        } else {
            this.commands = this.commands.filter((cmd) => cmd.langKey !== 'open-dn');
            const siyuanKeymap = window.siyuan.config.keymap.plugin[this.name];
            if (siyuanKeymap && siyuanKeymap?.['open-dn']) {
                delete siyuanKeymap['open-dn'];
            }
            toggleGeneralDailynoteKeymap(true);
        }
    }

    private initUpToDate() {
        this.upToDate = null;
        this.startUpdateOnNextDay();
    }

    private initBlockIconClickEvent() {
        if (settings.get("EnableMove") === true || settings.get("EnableReserve") === true) {
            // console.log(settings.get("EnableMove"));
            console.debug('添加块菜单项目');
            this.enableBlockIconClickEvent = true;
            this.gutterMenu = new GutterMenu(this.eventBus);
        }
    }

    private onSettingLoaded() {

        if (settings.get('EnableResvDock') === true) {
            this.addDock({
                config: {
                    position: "RightBottom",
                    size: { width: 250, height: 0 },
                    icon: "iconHistory",
                    //@ts-ignore
                    title: this.i18n.DockReserve.arial,
                    show: false
                },
                data: {
                    text: "This is my custom dock"
                },
                type: 'dock_tab',
                init() {
                    this.element.innerHTML = '<div id="ShowResv"/>';
                    new ShowReserve({
                        target: this.element.querySelector('#ShowResv')
                    });
                }
            });
        }

    }


    private async updateAll() {
        console.debug('updateAll');
        await notebooks.update(); // 更新笔记本状态
        this.toolbarItem.updateDailyNoteStatus(); // 更新下拉框中的日记存在状态
        updateTodayReservation(notebooks.default, true);
        showMessage(this.i18n.UpdateAll, 2500, 'info');
    }

    openSetting(): void {
        let dialog = new Dialog({
            //@ts-ignore
            title: `${this.i18n.Name}`,
            content: `<div id="SettingPanel" style="height: 100%"></div>`,
            width: '50%',
            height: '27rem',
            destroyCallback: () => {
                pannel.$destroy();
            }
        });
        let pannel = new Setting({
            target: dialog.element.querySelector("#SettingPanel"),
        });
    }

    /**
     * 只要在运行，就每天 0 点更新一次
     */
    startUpdateOnNextDay() {

        //当前时间，到明天 0 点的时间间隔
        let now = new Date();
        let tomorrow = new Date();
        tomorrow.setDate(now.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        //For test
        // tomorrow.setDate(now.getDate());
        // tomorrow.setMinutes(now.getMinutes() + 1, 0, 0);

        let millisTill24 = tomorrow.getTime() - now.getTime();

        //等 0 点的时候，就更新状态
        this.upToDate = setTimeout(this.updateOnNewDay.bind(this), millisTill24);
        console.log(`当前时间: ${now}, 下次更新时间: ${tomorrow}, ${millisTill24} ms 后更新`);
    }

    private async updateOnNewDay() {
        await notebooks.update();
        this.toolbarItem.updateDailyNoteStatus();
        this.startUpdateOnNextDay();
        let today = new Date();
        today.toDateString();
        let msg = `${this.i18n.NewDay[0]} ${today.toLocaleDateString()} ${this.i18n.NewDay[1]}`

        //新的一天，重置检查状态
        this.routineHandler.resetStatusFlag();
        this.routineHandler.updateResvIconStyle();

        showMessage(msg, 5000, 'info');
    }

    onunload() {
        console.debug('Plugin unload')
        removeStyleSheet();
        this.toolbarItem.release();
        if (this.upToDate) {
            console.debug(`清理定时器 ${this.upToDate}`);
            clearTimeout(this.upToDate);
            this.upToDate = null;
        }
        if (this.enableBlockIconClickEvent) {
            this.gutterMenu.release();
        }
        toggleGeneralDailynoteKeymap(true);
    }
}


