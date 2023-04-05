import { Plugin, clientApi, serverApi } from 'siyuan';
import { getFocusedBlockID } from './blocks';

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
        console.log(`Diary Start: ${new Date()}`);
        this.openDiary = this.openDiary.bind(this);
        this.notebooks = [];
        this.selectFolded = true;
    }

    async onload() {
        this.initSelctor();
        this.onloadTask();
    }

    /**
     * 开启插件后等待 DOM 加载完成，并初始化插件
     */
    async onloadTask() {
        const MAX_RETRY = 5;
        let retry = 0;
        let start = performance.now();
        // 等待 notebook 加载完成
        while (retry < MAX_RETRY) {
            const success = await this.queryNotebooks();
            if (success) {  
                break
            } else {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            retry++;
        }

        //打开默认日记
        if (this.notebooks.length > 0) {
            await this.openDiary(0);
        } else {
            console.log('打开默认日记失败');
        }
        // 初始化下拉框，并添加事件
        this.notebooks.forEach((notebook, index) => {
            let option = document.createElement('option');
            option.value = index.toString();
            option.innerText = notebook.name;
            this.openDiarySelector.appendChild(option);
        });
        let option = document.createElement('option');
        option.value = '-1';
        option.innerText = '';
        this.openDiarySelector.appendChild(option);

        this.openDiarySelector.addEventListener('click', (event) => {
            if (this.selectFolded) {
                this.selectFolded = false;
            } else {
                let index = parseInt((event.target as HTMLSelectElement).value);
                this.openDiary(index);
                this.selectFolded = true;
            }
        });

        let end = performance.now();
        console.log(`Diary 启动，经过了: ${end - start} ms`);
        console.log(`Diary Finished: ${new Date()}`);
    }

    async initSelctor() {
        this.openDiarySelector = document.createElement('select');
        this.openDiarySelector.className = TOOLBAR_ITEMS;
        this.openDiarySelector.setAttribute('aria-label', '打开指定的日记')
        this.openDiarySelector.innerHTML = '<空>';
        // this.openDiarySelector.style.border = "0 0.5rem"
        this.openDiarySelector.style.margin = "0 0.5rem"
        clientApi.addToolbarRight(this.openDiarySelector);
    }


    /**
     * 打开指定的笔记本下今天的日记，如果不存在则创建
     * @param notebook_index 笔记本的 index
     */
    async openDiary(notebook_index: number) {
        if (this.notebooks.length > 0) {
            let notebook: NoteBook = this.notebooks[notebook_index];
            let notebookId = notebook.id;
            let todayDiaryPath = getTodayDiaryPath();
            console.log(`${notebookId}: ${notebook.name}${todayDiaryPath}`);
            let doc = await this.getDocByHpath(notebook, todayDiaryPath);

            if (doc != null) {
                let id = doc.id;
                window.open(`siyuan://blocks/${id}`);
            } else {
                let id = await this.createDiary(notebook, todayDiaryPath);
                window.open(`siyuan://blocks/${id}`);
            }
        } else {
            console.log('no notebook');
        }
    }

    async getDocByHpath(notebook: NoteBook, hpath: string) {
        let sql = `select * from blocks where type='d' and hpath = '${hpath}' and box = '${notebook.id}'`;
        let result: any[] = await serverApi.sql(sql);
        if (result.length > 0) {
            console.log(result);
            return result[0];
        } else {
            return null;
        }
    }

    async createDiary(notebook: NoteBook, todayDiaryHpath: string) {
        console.log(`createDiary: ${notebook.name} ${todayDiaryHpath}`);
        let doc_id = await serverApi.createDocWithMd(notebook.id, todayDiaryHpath, "");
        console.log(`doc_id: ${doc_id}`);
        return doc_id;
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
            all_notebooks = all_notebooks.filter(notebook => notebook.name !== "思源笔记用户指南");
            console.log(all_notebooks);
            this.notebooks = all_notebooks;
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    onunload() {
        console.log('plugin unload')
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
