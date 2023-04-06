/**
 * Copyright (c) 2023 [frostime](https://github.com/frostime). All rights reserved.
 */
import { Plugin, clientApi, serverApi } from 'siyuan';

const TOOLBAR_ITEMS = 'toolbar__item b3-tooltips b3-tooltips__sw'

type NoteBook = {
    id: string;
    name: string;
    icon: string;
    sort: number;
    closed: boolean;
}

export default class SiyuanSamplePlugin extends Plugin {
    openDiarySelector: HTMLElement;
    // openDefaultBtn: HTMLElement;
    notebooks: Array<NoteBook>;
    selectFolded: boolean;

    constructor() {
        super();
        console.log(`[OpenDiary]: Start: ${new Date()}`);
        this.openDiary = this.openDiary.bind(this);
        this.notebooks = [];
        this.selectFolded = true;
    }

    async onload() {
        let start = performance.now();
        await this.initDom();
        await this.initSelectorOptions();
        let end = performance.now();
        console.log(`[OpenDiary]: onload, 耗时: ${end - start} ms`);
        this.registerCommand({
            command: 'updateAll',
            shortcut: 'ctrl+alt+u,command+option+u',
            description: '全局更新',
            callback: this.updateAll.bind(this),
        });
    }


    async initDom() {
        this.openDiarySelector = document.createElement('select');
        this.openDiarySelector.className = TOOLBAR_ITEMS;
        this.openDiarySelector.setAttribute('aria-label', '打开指定的日记')
        this.openDiarySelector.innerHTML = '<空>';
        // this.openDiarySelector.style.border = "0 0.5rem"
        this.openDiarySelector.style.margin = "0 0.5rem"
        this.openDiarySelector.style.padding = "0 0.1rem"
        this.openDiarySelector.style.maxWidth = "7rem"

        /**
         * 为下拉框添加事件，使得点击下拉框打开对应的日记
         * 1. change 事件无法捕获到点击事件，因此使用 click 事件
         * 2. 为了过滤打开下拉框事件，使用 selectFolded 标记
         * 3. 为了避免打开下拉框后，点击其他地方关闭导致 selectFolded 标记错误，使用 blur 事件
         */
        this.openDiarySelector.addEventListener('click', (event) => {
            console.log('[OpenDiary] Event: click')
            if (this.selectFolded) {
                this.selectFolded = false;
                this.updateDiaryStatus();
            } else {
                let index = parseInt((event.target as HTMLSelectElement).value);
                this.openDiary(index);
                this.selectFolded = true;
            }
        });
        this.openDiarySelector.addEventListener('blur', () => {
            console.log('[OpenDiary] Event: blur')
            this.selectFolded = true;
        });

        clientApi.addToolbarRight(this.openDiarySelector);

        // 等待 notebook 加载完成
        const MAX_RETRY = 5;
        let retry = 0;
        while (retry < MAX_RETRY) {
            const success = await this.queryNotebooks();
            if (success) {
                break
            } else {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            retry++;
        }
    }

    /**
     * 开启插件后等待笔记的 DOM 加载完成，并根据 this.notebooks 初始化下拉框
     */
    async initSelectorOptions() {
        console.log('[OpenDiary]: initSelectorOptions');
        //打开默认日记
        if (this.notebooks.length > 0) {
            await this.openDiary(0);
        } else {
            console.log('打开默认日记失败');
        }
        // 初始化下拉框，并添加事件
        this.openDiarySelector.innerHTML = '';
        this.notebooks.forEach((notebook, index) => {
            let option = document.createElement('option');
            option.value = index.toString();
            option.innerText = notebook.name;
            this.openDiarySelector.appendChild(option);
        });

        await this.updateDiaryStatus();
    }

    async updateAll() {
        await this.queryNotebooks();
        await this.initSelectorOptions();
    }


    /**
     * 打开指定的笔记本下今天的日记，如果不存在则创建
     * @param notebook_index 笔记本的 index
     */
    async openDiary(notebook_index: number) {
        if (this.notebooks.length > 0) {
            let notebook: NoteBook = this.notebooks[notebook_index];
            let todayDiaryPath = getTodayDiaryPath();
            console.log(`[OpenDiary]: Open ${notebook.name}${todayDiaryPath}`);
            let docs = await this.getDocsByHpath(todayDiaryPath, notebook);

            if (docs != null && docs.length > 0) {
                let doc = docs[0];
                let id = doc.id;
                window.open(`siyuan://blocks/${id}`);
            } else {
                let id = await this.createDiary(notebook, todayDiaryPath);
                window.open(`siyuan://blocks/${id}`);
            }
        } else {
            console.log('[OpenDiary]: Can not open diary cause no notebook loaded');
        }
    }

    /**
     * 获取所有笔记本
     * @returns flag
     */
    async queryNotebooks(): Promise<boolean> {
        try {
            let result = await serverApi.lsNotebooks("");
            let all_notebooks: Array<NoteBook> = result.notebooks;
            //delete notebook with name "思源笔记用户指南"
            all_notebooks = all_notebooks.filter(
                notebook => notebook.name !== "思源笔记用户指南" && notebook.closed === false
            );
            let all_notebook_names = all_notebooks.map(notebook => notebook.name);
            console.log(`[OpenDiary]: Read all notebooks: ${all_notebook_names}`);
            this.notebooks = all_notebooks;
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    /**
     * 根据思源中已经有 diary 的笔记本，更新下拉框中的笔记本状态
     * 注意，本函数不会更新 this.notebooks
     */
    async updateDiaryStatus() {
        console.log('[OpenDiary]: updateDiaryStatus');
        let todayDiary = getTodayDiaryPath();
        let docs = await this.getDocsByHpath(todayDiary);
        if (docs != null) {
            let notebook_with_diary = docs.map(doc => doc.box);
            let count_diary = notebook_with_diary.length;
            this.notebooks.forEach((notebook, index) => {
                if (notebook_with_diary.includes(notebook.id)) {
                    let option = this.openDiarySelector.children[index] as HTMLOptionElement;
                    option.innerText = `√ ${notebook.name}`;
                } else {
                    let option = this.openDiarySelector.children[index] as HTMLOptionElement;
                    option.innerText = notebook.name;
                }
            });
            console.log(`'[OpenDiary]: 当前日记共 ${count_diary} 篇`);
        }
    }

    /**
     * getDocsByHpath returns all documents in the database that have a given hpath. 
     * If a notebook is not null, then it only returns documents in that notebook that have the given hpath.
     * @param hpath 
     * @param notebook 
     * @returns
     */
    async getDocsByHpath(hpath: string, notebook: NoteBook | null = null) {
        let sql = `select * from blocks where type='d' and hpath = '${hpath}'`;
        if (notebook != null) {
            sql = `select * from blocks where type='d' and hpath = '${hpath}' and box = '${notebook.id}'`;
        }
        let result: any[] = await serverApi.sql(sql);
        if (result.length > 0) {
            return result;
        } else {
            return null;
        }
    }

    async createDiary(notebook: NoteBook, todayDiaryHpath: string) {
        console.log(`[OpenDiary]: Try to create: ${notebook.name} ${todayDiaryHpath}`);
        let doc_id = await serverApi.createDocWithMd(notebook.id, todayDiaryHpath, "");
        console.log(`[OpenDiary]: Create new diary ${doc_id}`);
        return doc_id;
    }

    onunload() {
        console.log('[OpenDiary]: plugin unload')
        this.openDiarySelector.remove()
    }
}

function getTodayDiaryPath() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    return `/daily note/${year}/${month}/${today}`;
}
