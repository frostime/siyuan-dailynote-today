/**
 * Copyright (c) 2023 frostime. All rights reserved.
 */
import { Plugin, clientApi } from 'siyuan';
import Select from './select.svelte'
import { Notebook } from './types';
import { getTodayDiaryPath, queryNotebooks, getDocsByHpath, openDiary } from './func';

const TOOLBAR_ITEMS = 'toolbar__item b3-tooltips b3-tooltips__sw'

export default class SiyuanSamplePlugin extends Plugin {
    notebooks: Array<Notebook>;
    selectFolded: boolean;

    div_select: HTMLElement;
    component_select: Select;

    logger: any;

    constructor() {
        super();
        console.log(`[OpenDiary]: Start: ${new Date()}`);
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

        this.component_select = new Select({
            target: this.div_select,
            props: {
                notebooks: this.notebooks,
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
        if (this.notebooks.length > 0) {
            openDiary(this.notebooks[0]);
            this.component_select.$set({ selected: this.notebooks[0].id });
        }
        let end = performance.now();
        console.log(`[OpenDiary]: onload, 耗时: ${end - start} ms`);
    }

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
        console.log('[OpenDiary]: updateAll');
        let result = await queryNotebooks();
        this.notebooks = result ? result : [];
        this.component_select.$set({ notebooks: this.notebooks });
        await this.updateDiaryStatus_();
    }


    /**
     * 根据思源中已经有 diary 的笔记本，更新下拉框中的笔记本状态
     * 注意，本函数不会更新 this.notebooks
     */
    async updateDiaryStatus_() {
        console.log('[OpenDiary]: updateDiaryStatus');
        let todayDiary = getTodayDiaryPath();
        let docs = await getDocsByHpath(todayDiary);
        if (docs.length > 0) {
            let notebook_with_diary = docs.map(doc => doc.box);
            let count_diary = notebook_with_diary.length;
            let diaryStatus: Map<string, boolean> = new Map();
            notebook_with_diary.forEach((notebook) => {
                diaryStatus.set(notebook, true);
            });
            console.log("update", this.component_select)
            this.component_select.$set({ diaryStatus: diaryStatus });
            console.log(`'[OpenDiary]: 当前日记共 ${count_diary} 篇`);
        }
    }

    onunload() {
        console.log('[OpenDiary]: plugin unload')
        this.component_select.$destroy();
        this.div_select.remove();
    }
}


