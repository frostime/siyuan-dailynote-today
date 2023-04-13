/**
 * Copyright (c) 2023 frostime. All rights reserved.
 */
import { Plugin, clientApi } from 'siyuan';
import Select from './select.svelte'
import Setting from './setting.svelte'
import { Notebook } from './types';
import { queryNotebooks, getDocsByHpath, openDiary, notify } from './func';
import { info, StaticText } from './utils';
import { settings } from './setting';

const TOOLBAR_ITEMS = 'toolbar__item b3-tooltips b3-tooltips__sw'

export default class SiyuanSamplePlugin extends Plugin {
    notebooks: Array<Notebook>;
    selectFolded: boolean;

    div_select: HTMLElement;
    component_select: Select;

    div_setting: HTMLElement;
    component_setting: Setting;


    constructor() {
        super();
        info(`Start: ${new Date()}`);
        settings.setPlugin(this);

        this.notebooks = [];
        this.selectFolded = true;
        this.div_select = document.createElement('div');
        this.div_select.setAttribute('aria-label', 'Open Today\'s Diary');
        this.div_select.classList.add(...TOOLBAR_ITEMS.split(/\s/));
        this.div_select.style.margin = '0 0.5rem';
        this.div_select.style.padding = '0rem 0rem';
    }

    async onload() {
        let start = performance.now();
        await this.initNotebooks();
        this.registerCommand({
            command: 'updateAll',
            shortcut: 'ctrl+alt+u,command+option+u',
            description: '全局更新',
            callback: this.updateAll.bind(this),
        });

        await settings.load();
        this.initSetting();

        this.component_select = new Select({
            target: this.div_select,
            props: {
                notebooks: this.notebooks
            }
        });
        this.component_select.$on(
            'openSelector', this.updateDiaryStatus_.bind(this)
        )
        this.component_select.$on(
            'openDiary', async (event) => { await openDiary(event.detail.notebook); this.updateDiaryStatus_() }
        )
        clientApi.addToolbarRight(this.div_select);
        await this.updateDiaryStatus_();

        // 如果有笔记本，且设置中允许启动时打开，则打开第一个笔记本
        if (this.notebooks.length > 0) {
            this.component_select.$set({ selected: this.notebooks[0].id });

            if (settings.settings.OpenOnStart === true) {
                openDiary(this.notebooks[0]);
            }
        }
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

    /**
     * 初始化 notebooks，了防止思源还没有加载完毕，故而需要等待
     * 只在第一次启动的时候调用
     * @calledby: this.onload()
     */
    async initNotebooks() {
        const MAX_RETRY = 5;
        let retry = 0;
        while (retry < MAX_RETRY) {
            let result = await queryNotebooks();
            if (result != null) {
                this.notebooks = result;
                break
            } else {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            retry++;
        }
    }


    async updateAll() {
        info('updateAll');
        let result = await queryNotebooks();
        this.notebooks = result ? result : [];
        this.component_select.$set({ notebooks: this.notebooks });
        await this.updateDiaryStatus_();
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
        this.notebooks.forEach((notebook) => {
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
        this.component_select.$set({ diaryStatus: diaryStatus });
        info(`当前日记共 ${count_diary} 篇`);
    }

    onunload() {
        info('plugin unload')
        this.component_select.$destroy();
        this.div_select.remove();
    }
}


