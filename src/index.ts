/**
 * Copyright (c) 2023 frostime. All rights reserved.
 */
import { Plugin } from 'siyuan';
// import Setting from './components/setting.svelte'
import { ToolbarMenuItem } from './components/toolbar-menu';
import { notify } from './func';
import { info, StaticText, setI18n } from './utils';
import { settings } from './global-setting';
import notebooks from './global-notebooks';
import { ContextMenu } from './components/move-menu';
import * as serverApi from './serverApi';


export default class DailyNoteTodayPlugin extends Plugin {

    toolbar_item: ToolbarMenuItem;

    div_setting: HTMLElement;
    //TODO 后续添加 setting 面板
    // component_setting: Setting;

    menu: ContextMenu;

    test() {
        console.log('test');
        serverApi.test();
    }

    async onload() {
        info('plugin load');
        console.log(this);
        setI18n(this.i18n); //设置全局 i18n

        info(`Start: ${new Date()}`);
        settings.setPlugin(this);

        let start = performance.now();
        // await notebooks.init();

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
        // this.toolbar_item.autoOpenDailyNote();
        // this.toolbar_item.updateDailyNoteStatus();

        let end = performance.now();
        info(`Onload, 耗时: ${end - start} ms`);

        this.addTopBar({
            icon: 'iconCalendar',
            title: '今日笔记',
            position: 'left',
            callback: this.test.bind(this)
        })
    }

    private initSetting() {
        //TODO 注册设置面板
        // this.div_setting = document.createElement('div');
        // this.component_setting = new Setting({
        //     target: this.div_setting,
        //     props: {
        //         contents: StaticText.Setting
        //     }
        // });

        // this.registerSettingRender((el) => {
        //     el.appendChild(this.div_setting);
        // })

        // this.component_setting.$on("updateAll", () => { this.updateAll() })
    }

    private initContextMenu() {
        // this.menu = new ContextMenu();
        // this.menu.bindMenuOnCurrentTabs();
        // this.menu.addEditorTabObserver();
    }

    private initToolbarItem() {
        // this.toolbar_item = new ToolbarMenuItem();
        // this.toolbar_item.updateNotebookStatus();
        // // clientApi.addToolbarRight(this.toolbar_item.ele);
        // this.addTopBar({
        //     icon: 'iconCalendar',
        //     title: '今日笔记',
        //     position: 'right',
        //     callback: () => {
        //         this.toolbar_item.showMenu();
        //     }
        // })
    }


    private async updateAll() {
        info('updateAll');
        // await notebooks.update(); // 更新笔记本状态
        // this.toolbar_item.updateNotebookStatus(); //更新下拉框中笔记本显示
        // this.toolbar_item.updateDailyNoteStatus(); // 更新下拉框中的日记存在状态

        // this.menu.bindMenuOnCurrentTabs();
        // notify(StaticText.UpdateAll, 'info', 2500);
    }

    onunload() {
        info('plugin unload')
        // this.toolbar_item.release();
        // this.menu.removeEditorTabObserver();
        settings.save();
    }
}


