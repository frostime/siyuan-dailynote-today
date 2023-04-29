/**
 * Copyright (c) 2023 frostime. All rights reserved.
 */
import { Plugin, clientApi } from 'siyuan';
import Setting from './components/setting.svelte'
import { ToolbarSelectItem } from './components/toolbar-select';
import { Notebook } from './types';
import { queryNotebooks, getDocsByHpath, openDiary, notify } from './func';
import { info, StaticText } from './utils';
import { settings } from './global-setting';
import notebooks from './global-notebooks';
import { ContextMenu } from './components/move-menu';


export default class SiyuanSamplePlugin extends Plugin {

    toolbar_item: ToolbarSelectItem;

    div_setting: HTMLElement;
    component_setting: Setting;

    menu: ContextMenu;

    constructor() {
        super();
        info(`Start: ${new Date()}`);
        settings.setPlugin(this);

        this.toolbar_item = new ToolbarSelectItem();
        this.menu = new ContextMenu();
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

        await this.updateDiaryStatus_();
        // 如果有笔记本，且设置中允许启动时打开，则打开第一个笔记本
        this.toolbar_item.autoOpenDailyNote();

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
        this.menu.bindMenuOnCurrentTabs();
        this.menu.addEditorTabObserver();
    }

    initToolbarItem() {
        this.toolbar_item.updateNotebooks();
        this.toolbar_item.bindEvent(
            'openSelector', this.updateDiaryStatus_.bind(this)
        )
        this.toolbar_item.bindEvent(
            'openDiary', async (event) => { 
                await openDiary(event.detail.notebook); this.updateDiaryStatus_()
            }
        )
    }


    async updateAll() {
        info('updateAll');
        await notebooks.update(); // 更新笔记本状态
        this.toolbar_item.updateNotebooks(); //更新下拉框中笔记本显示
        await this.updateDiaryStatus_(); // 更新下拉框中的日记存在状态

        this.menu.bindMenuOnCurrentTabs();
        notify(StaticText.UpdateAll, 'info', 2500);
    }


    /**
     * 根据思源中已经有 diary 的笔记本，更新下拉框中的笔记本状态
     * 注意，本函数不会更新 this.notebooks
     * @details
     * 1. 遍历所有笔记本，找到所有的 daily note 的 hpath
     * 2. 对每种 hpath，调用 `await getDocsByHpath(todayDNHpath)`，查询是否存在对应的文件
     */
    async updateDiaryStatus_() {
        info('updateDiaryStatus');
        // let todayDiary = getTodayDiaryPath();
        //所有 hpath 的配置方案
        let hpath_set: Set<string> = new Set();
        notebooks.notebooks.forEach((notebook) => {
            hpath_set.add(notebook.dailynotePath!);
        });

        let diaryStatus: Map<string, boolean> = new Map();
        let count_diary = 0;
        for (const todayDNHpath of hpath_set) {
            //对每种 daily note 的方案，看看是否存在对应的路径
            let docs = await getDocsByHpath(todayDNHpath);
            if (docs.length > 0) {
                let notebook_with_diary = docs.map(doc => doc.box);
                notebook_with_diary.forEach((notebookId: string) => {
                    diaryStatus.set(notebookId, true);
                });
                count_diary += notebook_with_diary.length;
                info(`${todayDNHpath} 共 ${notebook_with_diary.length} 篇`)
            }
        }
        this.toolbar_item.updateDailyNoteStatus(diaryStatus);
        info(`当前日记共 ${count_diary} 篇`);
    }

    onunload() {
        info('plugin unload')
        this.toolbar_item.release();
    }
}


