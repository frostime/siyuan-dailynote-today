/**
 * Copyright (c) 2023 frostime. All rights reserved.
 */
import { Plugin, clientApi, serverApi } from 'siyuan';
import Select from './Select.svelte'
import { Notebook } from './TypesDef';
import { getTodayDiaryPath, queryNotebooks, getDocsByHpath, openDiary } from './func';

const TOOLBAR_ITEMS = 'toolbar__item b3-tooltips b3-tooltips__sw'

export default class SiyuanSamplePlugin extends Plugin {
    openDiarySelector: HTMLElement;
    // openDefaultBtn: HTMLElement;
    notebooks: Array<Notebook>;
    selectFolded: boolean;

    div_select: HTMLElement;
    component_select: Select;

    constructor() {
        super();
        console.log(`[OpenDiary]: Start: ${new Date()}`);
        // this.openDiary = this.openDiary.bind(this);
        this.notebooks = [];
        this.selectFolded = true;
        this.div_select = document.createElement('div');
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
                notebooks: this.notebooks
            }
        });
        this.component_select.$on(
            'openSelector', this.updateDiaryStatus_.bind(this)
        )
        this.component_select.$on(
            'openDiary', this.openDiary.bind(this)
        )
        clientApi.addToolbarRight(this.div_select);
        await this.updateDiaryStatus_();
        if (this.notebooks.length > 0) {
            openDiary(this.notebooks[0]);
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
        this.notebooks = result? result: [];
        this.component_select.$set({ notebooks: this.notebooks });
        await this.updateDiaryStatus_();
    }

    async openDiary(event) {
        console.log('[OpenDiary]: openDiary', event.detail);
        openDiary(event.detail.notebook)
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
        this.openDiarySelector.remove()
        this.component_select.$destroy();
        this.div_select.remove();
    }
}


