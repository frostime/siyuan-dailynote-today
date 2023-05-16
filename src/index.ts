/**
 * Copyright (c) 2023 frostime. All rights reserved.
 */
import { isMobile, openTab, Plugin } from 'siyuan';
import Setting from './components/setting.svelte'
import { ToolbarMenuItem } from './components/toolbar-menu';
import { notify, compareVersion } from './func';
import { info, setI18n, i18n } from './utils';
import { settings } from './global-setting';
import notebooks from './global-notebooks';
import { ContextMenu } from './components/move-menu';
import { eventBus } from './event-bus';
import * as serverApi from './serverApi';


export default class DailyNoteTodayPlugin extends Plugin {

    toolbar_item: ToolbarMenuItem;

    component_setting: Setting;
    tab_setting: any;

    menu: ContextMenu;

    test() {
        notify('Test', 'info', 1500);
    }

    async onload() {
        info('plugin load');
        console.log(this);
        setI18n(this.i18n); //设置全局 i18n

        info(`Start: ${new Date()}`);
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

        // 如果有笔记本，且设置中允许启动时打开，则打开第一个笔记本
        this.toolbar_item.autoOpenDailyNote();
        // 等日记创建，完成了状态更新后再读取新的状态
        setTimeout(this.toolbar_item.updateDailyNoteStatus.bind(this), 2000);

        eventBus.subscribe('UpdateAll', () => {this.updateAll()});

        let end = performance.now();
        info(`Onload, 耗时: ${end - start} ms`);
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
        info('initSetting');
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
        info('initContextMenu');
        this.menu = new ContextMenu();
        this.menu.bindMenuOnCurrentTabs();
        this.menu.addEditorTabObserver();
    }

    private initToolbarItem() {
        info('initToolbarItem');
        this.toolbar_item = new ToolbarMenuItem(this);
        this.toolbar_item.updateDailyNoteStatus();
    }


    private async updateAll() {
        info('updateAll');
        await notebooks.update(); // 更新笔记本状态
        this.toolbar_item.updateDailyNoteStatus(); // 更新下拉框中的日记存在状态

        this.menu.bindMenuOnCurrentTabs(); //TODO
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

    onunload() {
        info('plugin unload')
        this.menu.removeEditorTabObserver();
        settings.save();
    }
}


