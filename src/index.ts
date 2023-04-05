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
    el: HTMLElement;
    notebooks: Array<NoteBook>;

    constructor() {
        super();
        this.openDiary = this.openDiary.bind(this);
        this.notebooks = [];
    }

    onload() {
        this.el = document.createElement('button');
        this.el.innerText = 'Diary Today';
        this.el.className = TOOLBAR_ITEMS;
        this.el.setAttribute('aria-label', '打开今日的日记')
        clientApi.addToolbarRight(this.el);
        this.el.addEventListener('click', () => this.openDiary(0));
        console.log('plugin load');
        this.openDiaryOnload();
    }

    async openDiaryOnload() {
        let start = performance.now();
        let flag = await this.queryNotebooks();
        if (flag && this.notebooks.length > 0) {
            await this.openDiary(0);
        } else {
            console.log('打开默认日记失败');
        }
        let end = performance.now();
        console.log(`尝试打开默认日记，经过了: ${end - start} ms`);
    }

    /**
     * 打开指定的笔记本下今天的日记，如果不存在则创建
     * @param notebook_sort 笔记本的 sort 字段
     */
    async openDiary(notebook_sort: number) {
        if (this.notebooks.length > 0) {
            let notebook: NoteBook = this.notebooks[notebook_sort];
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

function onBtnClick() {
    let blockId = getFocusedBlockID();
    console.log(`blockId: ${blockId}`);
}
