/**
 * Copyright (c) 2023 frostime all rights reserved.
 */
import { serverApi } from 'siyuan';
import { Notebook, Block } from "./types";
import { info, error } from "./utils";


export function getTodayDiaryPath() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    return `/daily note/${year}/${month}/${today}`;
}


const hiddenNotebook: Set<string> = new Set(["思源笔记用户指南", "SiYuan User Guide"]);

/**
 * 获取所有笔记本
 * @returns flag
 */
export async function queryNotebooks(): Promise<Array<Notebook> | null> {
    try {
        let result = await serverApi.lsNotebooks("");
        let all_notebooks: Array<Notebook> = result.notebooks;
        //delete notebook with name "思源笔记用户指南"
        all_notebooks = all_notebooks.filter(
            notebook => !notebook.closed && !hiddenNotebook.has(notebook.name)
        );
        all_notebooks = all_notebooks.sort((a, b) => {
            return a.sort - b.sort;
        });
        let all_notebook_names = all_notebooks.map(notebook => notebook.name);
        info(`Read all notebooks: ${all_notebook_names}`);
        return all_notebooks;
    } catch (err) {
        error(err);
        return null;
    }
}


export async function getDailyNoteSprig(notebook: Notebook): Promise<string> {
    let conf = await serverApi.getNotebookConf(notebook.id);
    let sprig: string = conf.conf.dailyNoteSavePath;
    return sprig;
}


export async function renderDailyNotePath(sprig: string) {
    //TODO 插件似乎没有实现这个 API
    return await serverApi.renderSprig(sprig);
}

/**
 * getDocsByHpath returns all documents in the database that have a given hpath. 
 * If a notebook is not null, then it only returns documents in that notebook that have the given hpath.
 * @param hpath 
 * @param notebook 
 * @returns blocks Array<Block>
 */
export async function getDocsByHpath(hpath: string, notebook: Notebook | null = null): Promise<Array<Block>> {
    let sql = `select * from blocks where type='d' and hpath = '${hpath}'`;
    if (notebook != null) {
        sql = `select * from blocks where type='d' and hpath = '${hpath}' and box = '${notebook.id}'`;
    }
    let result: Array<Block> = await serverApi.sql(sql);
    return result;
}


export async function createDiary(notebook: Notebook, todayDiaryHpath: string) {
    info(`Try to create: ${notebook.name} ${todayDiaryHpath}`);
    let doc_id = await serverApi.createDocWithMd(notebook.id, todayDiaryHpath, "");
    info(`Create new diary ${doc_id}`);
    return doc_id;
}


/**
 * 打开指定的笔记本下今天的日记，如果不存在则创建
 * @param notebook_index 笔记本的 index
 */
export async function openDiary(notebook: Notebook) {
    let todayDiaryPath = getTodayDiaryPath();
    info(`Open ${notebook.name}${todayDiaryPath}`);
    let docs = await getDocsByHpath(todayDiaryPath, notebook);

    if (docs != null && docs.length > 0) {
        let doc = docs[0];
        let id = doc.id;
        window.open(`siyuan://blocks/${id}`);
    } else {
        let id = await createDiary(notebook, todayDiaryPath);
        window.open(`siyuan://blocks/${id}`);
    }
}
