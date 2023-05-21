/**
 * Copyright (c) 2023 frostime. All rights reserved.
 */
import { openTab, Plugin } from 'siyuan';
import Setting from './components/setting.svelte'
import { ToolbarMenuItem } from './components/toolbar-menu';
import { notify, compareVersion } from './func';
import { info, setI18n } from './utils';
import { settings } from './global-setting';
import notebooks from './global-notebooks';
import { ContextMenu } from './components/move-menu';
import { eventBus } from './event-bus';
import * as serverApi from './serverApi';


export default class DailyNoteTodayPlugin extends Plugin {

    app: any;
    toolbar_item: ToolbarMenuItem;

    component_setting: Setting;
    tab_setting: any;

    menu: ContextMenu;

    upToDate: any = null;

    async onload() {
        info('Plugin load');

        setI18n(this.i18n); //设置全局 i18n

        settings.setPlugin(this);

        let start = performance.now();
        await notebooks.init();
        await this.checkSysVer();

        //TODO 注册快捷键
        // this.registerCommand({
        //     command: 'updateAll',
        //     shortcut: 'ctrl+alt+u,command+option+u',
        //     description: '全局更新',
        //     callback: this.updateAll.bind(this),
        // });

        await settings.load();
        this.initSetting();
        this.initContextMenu();
        this.initToolbarItem();
        this.initUpToDate();

        eventBus.subscribe('UpdateAll', () => {this.updateAll()});

        // 如果有笔记本，且设置中允许启动时打开，则打开第一个笔记本
        await this.toolbar_item.autoOpenDailyNote();
        // 等日记创建，完成了状态更新后再读取新的状态
        setTimeout(
            () => this.toolbar_item.updateDailyNoteStatus(), 1000
        );


        let end = performance.now();
        info(`启动耗时: ${end - start} ms`);
    }

    /**
     * Move 功能依赖的 API 只在 2.8.8 版本以上提供，所以要开机检查
     */
    private async checkSysVer() {
        let version: string = await serverApi.version();
        info(`当前版本 ${version}`);
        let cmp = compareVersion(version, '2.8.8'); //检查版本， 2.8.8 版本后才能完全解锁所有功能
        if (cmp < 0) {
            notify(`注意: 思源版本小于 2.8.8, 插件部分功能可能不可用`, 'info');
        }
    }

    private initSetting() {
        let div_setting: HTMLDivElement = document.createElement('div');
        this.component_setting = new Setting({
            target: div_setting,
            props: {
                contents: this.i18n.Setting
            }
        });

        this.component_setting.$on("updateAll", () => { this.updateAll() });

        //注册标签页内容
        this.tab_setting = this.addTab({
            type: "custom_tab",
            init() {
                this.element.appendChild(div_setting);
            }
        });
        eventBus.subscribe('OpenSetting', this.openSetting.bind(this));
    }

    private async initContextMenu() {
        this.menu = new ContextMenu();
        this.menu.bindMenuOnCurrentTabs();
        this.menu.addEditorTabObserver();
    }

    private initToolbarItem() {
        this.toolbar_item = new ToolbarMenuItem(this);
        this.toolbar_item.updateDailyNoteStatus();
    }

    private initUpToDate() {
        this.upToDate = null;
        if (settings.get('DiaryUpToDate')) {
            this.startUpdateOnNextDay();
        }
    }


    private async updateAll() {
        info('updateAll');
        await notebooks.update(); // 更新笔记本状态
        this.toolbar_item.updateDailyNoteStatus(); // 更新下拉框中的日记存在状态
        this.menu.releaseMenuOnCurrentTabs();
        this.menu.removeEditorTabObserver();
        this.menu.bindMenuOnCurrentTabs();
        this.menu.addEditorTabObserver();
        notify(this.i18n.UpdateAll, 'info', 2500);
    }

    openSetting(): void {
        openTab({
            custom: {
                icon: "iconSettings",
                title: "今日笔记 Setting",
                data: {
                    text: "This is my custom tab",
                },
                fn: this.tab_setting
            }
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
        info(`当前时间: ${now}, 下次更新时间: ${tomorrow}, ${millisTill24} ms 后更新`);
    }

    private async updateOnNewDay() {
        await notebooks.update();
        this.toolbar_item.updateDailyNoteStatus();
        this.startUpdateOnNextDay();
        let today = new Date();
        today.toDateString();
        let msg = `${this.i18n.NewDay[0]} ${today.toLocaleDateString()} ${this.i18n.NewDay[1]}`
        notify(msg, 'info', 5000);
    }

    onunload() {
        info('Plugin unload')
        this.menu.releaseMenuOnCurrentTabs();
        this.menu.removeEditorTabObserver();
        settings.save();
        if (this.upToDate) {
            info(`清理定时器 ${this.upToDate}`);
            clearTimeout(this.upToDate);
            this.upToDate = null;
        }
    }
}


