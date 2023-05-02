/**
 * Copyright (c) 2023 frostime. All rights reserved.
 */
import { Plugin, clientApi } from 'siyuan';
import Setting from './components/setting.svelte'
import { ToolbarMenuItem } from './components/toolbar-menu';
import { ToolbarSelectItem } from './components/toolbar-select';
import { ToolbarItem } from './components/interface';
import { queryNotebooks, getDocsByHpath, openDiary, notify } from './func';
import { info, StaticText } from './utils';
import { settings } from './global-setting';
import notebooks from './global-notebooks';
import { ContextMenu } from './components/move-menu';


export default class SiyuanSamplePlugin extends Plugin {

    toolbar_item: ToolbarItem;

    div_setting: HTMLElement;
    component_setting: Setting;

    menu: ContextMenu;

    constructor() {
        super();
        info(`Start: ${new Date()}`);
        settings.setPlugin(this);
    }

    async onload() {
        let start = performance.now();
        await notebooks.init();

        this.registerCommand({
            command: 'updateAll',
            shortcut: 'ctrl+alt+u,command+option+u',
            description: '全局更新',
            callback: this.updateAll.bind(this),
        });

        await settings.load();
        this.initSetting();
        this.initMenu();
        this.initToolbarItem();

        // 如果有笔记本，且设置中允许启动时打开，则打开第一个笔记本
        this.toolbar_item.autoOpenDailyNote();
        this.toolbar_item.updateDailyNoteStatus();

        let end = performance.now();
        info(`Onload, 耗时: ${end - start} ms`);
    }

    initSetting() {
        this.div_setting = document.createElement('div');
        this.component_setting = new Setting({
            target: this.div_setting,
            props: {
                contents: StaticText.Setting
            }
        });

        this.registerSettingRender((el) => {
            el.appendChild(this.div_setting);
        })

        this.component_setting.$on("updateAll", () => { this.updateAll() })
    }

    initMenu() {
        this.menu = new ContextMenu();
        this.menu.bindMenuOnCurrentTabs();
        this.menu.addEditorTabObserver();
    }

    initToolbarItem() {
        if (settings.settings.NotebookView === 'Selector') {
            this.toolbar_item = new ToolbarSelectItem();
        } else {
            this.toolbar_item = new ToolbarMenuItem();
        }
        this.toolbar_item.updateNotebookStatus();
        clientApi.addToolbarRight(this.toolbar_item.ele);
    }


    async updateAll() {
        info('updateAll');
        await notebooks.update(); // 更新笔记本状态
        this.toolbar_item.updateNotebookStatus(); //更新下拉框中笔记本显示
        this.toolbar_item.updateDailyNoteStatus(); // 更新下拉框中的日记存在状态

        this.menu.bindMenuOnCurrentTabs();
        notify(StaticText.UpdateAll, 'info', 2500);
    }

    onunload() {
        info('plugin unload')
        this.toolbar_item.release();
        this.menu.removeEditorTabObserver();
        settings.save();
    }
}


