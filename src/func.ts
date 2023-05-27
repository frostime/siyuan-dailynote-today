/**
 * Copyright (c) 2023 frostime all rights reserved.
 */
import { showMessage } from 'siyuan';
import notebooks from './global-notebooks';
import { Notebook, Block } from "./types";
import { info, warn, error, i18n } from "./utils";
import * as serverApi from './serverApi';
import { reservation } from './global-status';


const default_sprig = `/daily note/{{now | date "2006/01"}}/{{now | date "2006-01-02"}}`
const hiddenNotebook: Set<string> = new Set(["思源笔记用户指南", "SiYuan User Guide"]);

export async function moveBlocksToDailyNote(srcBlockId: string, notebook: Notebook) {
    let block = await serverApi.getBlockByID(srcBlockId);

    if (block == null) {
        error(`Block ${srcBlockId} not found`);
        return;
    }

    //获取目标文档的 id
    let todayDiaryPath = notebook.dailynotePath;
    let docs = await getDocsByHpath(todayDiaryPath!, notebook);
    let doc_id;
    if (docs != null && docs.length > 0) {
        doc_id = docs[0].id;
    } else {
        doc_id = await createDiary(notebook, todayDiaryPath!);
        notify(`${i18n.Create}: ${notebook.name}`, 'info', 2500);
    }

    info(`Call 移动块: ${block.id} --> ${doc_id}`)

    //列表项需要额外特殊处理
    let moveLi = block.type === 'i';

    //移动块
    if (moveLi) {
        //如果是列表项，需要先新建一个列表块，然后把列表项插入到列表块中
        let ans = await serverApi.prependBlock(doc_id, '* ', 'markdown');
        let newListId = ans[0].doOperations[0].id;
        await serverApi.moveBlock(block.id, null, newListId);
        console.log(`移动列表项 ${block.id} --> ${newListId}`);
        //获取新的列表的子项
        let allChild = await serverApi.getChildBlocks(newListId);
        let blankItem = allChild[1]; // 上述行为会导致出现一个额外的多余列表项
        await serverApi.deleteBlock(blankItem.id);
    } else {
        await serverApi.moveBlock(block.id, null, doc_id);
    }
    notify(`${block.id} ${i18n.MoveMenu.Move} ${notebook.name}`, 'info', 2500);
}


export async function notify(msg: string, type: 'error' | 'info' = 'info', timeout?: number) {
    showMessage(msg, timeout = timeout, type = type);
}

/**
 * 获取所有笔记本，并解析今日日记路径
 * @details
 *  1. Call serverApi.lsNotebooks to get all notebooks
 *  2. Filter out Siyuan guide notebook
 *  3. Sort notebooks by sort
 *  4. Get all daily note sprig and today's diary path
 * @returns all_notebooks `Array<Notebook>|null`
 */
export async function queryNotebooks(): Promise<Array<Notebook> | null> {
    try {
        let result = await serverApi.lsNotebooks();
        let all_notebooks: Array<Notebook> = result.notebooks;
        //delete notebook with name "思源笔记用户指南"
        all_notebooks = all_notebooks.filter(
            notebook => !notebook.closed && !hiddenNotebook.has(notebook.name)
        );

        //没有必要了
        // if (settings.settings.NotebookSort == 'custom-sort') {
        //     all_notebooks = all_notebooks.sort((a, b) => {
        //         return a.sort - b.sort;
        //     });
        // }

        let all_notebook_names = all_notebooks.map(notebook => notebook.name);

        //Get all daily note sprig
        for (let notebook of all_notebooks) {
            let sprig = await getDailynoteSprig(notebook.id);
            notebook.dailynoteSprig = sprig != "" ? sprig : default_sprig;
            notebook.dailynotePath = await renderDailynotePath(notebook.dailynoteSprig);

            //防止出现不符合规范的 sprig, 不过根据 debug 情况看似乎不会出现这种情况
            if (notebook.dailynotePath == "") {
                warn(`Invalid daily note srpig of ${notebook.name}`);
                notebook.dailynoteSprig = default_sprig;
                notebook.dailynotePath = await renderDailynotePath(default_sprig);
            }

            if (notebook.icon == "") {
                notebook.icon = "1f5c3";
            }
        }

        info(`Read all notebooks: ${all_notebook_names}`);
        return all_notebooks;
    } catch (err) {
        error(err);
        return null;
    }
}


/**
 * 根据思源中已经有 diary 的笔记本，更新下拉框中的笔记本状态
 * 注意，本函数不会更新 notebooks
 * @details
 * 1. 遍历所有笔记本，找到所有的 daily note 的 hpath
 * 2. 对每种 hpath，调用 `await getDocsByHpath(todayDNHpath)`，查询是否存在对应的文件
 */
export async function currentDiaryStatus() {
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
        }
    }
    info(`更新日记状态: 当前日记共 ${count_diary} 篇`);
    return diaryStatus;
}


/**
 * 
 * @param notebook 笔记本对象
 * @returns 笔记本的 Daily Note 路径模板
 */
export async function getDailynoteSprig(notebookId: string): Promise<string> {
    let conf = await serverApi.getNotebookConf(notebookId);
    let sprig: string = conf.conf.dailyNoteSavePath;
    return sprig;
}


/**
 * 要求思源解析模板
 * @param sprig
 * @returns 
 */
export async function renderDailynotePath(sprig: string) {
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
    let doc_id = await serverApi.createDocWithMd(notebook.id, todayDiaryHpath, "");
    info(`创建日记: ${notebook.name} ${todayDiaryHpath}`);
    return doc_id;
}


/**
 * 打开指定的笔记本下今天的日记，如果不存在则创建
 * @param notebook_index 笔记本的 index
 */
export async function openDiary(notebook: Notebook) {

    await serverApi.createDailyNote(notebook.id, "");
    notify(`${i18n.Open}: ${notebook.name}`, 'info', 2000);
    let todayDiaryPath = notebook.dailynotePath;
    //BUG 初次创建的时候可能会拿不到
    let docs = await getDocsByHpath(todayDiaryPath!, notebook);
    let docId = docs[0].id;
    info(`打开日记 ${notebook.name}${todayDiaryPath}; ID: ${docId}`);
    return docId;

    // if (docs != null && docs.length > 0) {
    //     let doc = docs[0];
    //     let id = doc.id;
    //     window.open(`siyuan://blocks/${id}`);
    //     notify(`${i18n.Open}： ${notebook.name}`, 'info', 2500);
    // } else {
    //     let id = await createDiary(notebook, todayDiaryPath!);
    //     window.open(`siyuan://blocks/${id}`);
    //     notify(`${i18n.Create}: ${notebook.name}`, 'info', 2500);
    // }
}

export async function insertTodayReservation(docId: string) {
    let blockIDs = reservation.getTodayReservations();
    if (blockIDs.length == 0) {
        return;
    }
    //检查是否已经插入过
    let sql = `select * from blocks where path like "%${docId}%" and name = "Reservation"`;
    let blocks = await serverApi.sql(sql);
    console.log(blocks);
    if (blocks.length > 0) {
        console.log(`今日已经插入过预约了`);
        // let res = await serverApi.getBlockAttrs(blocks[0].id);
        // console.log(res);
        return;
    }
    //插入嵌入块
    blockIDs = blockIDs.map((id) => `"${id}"`);
    let sqlBlock = `{{select * from blocks where id in (${blockIDs.join(',')})}}`;
    let data = await serverApi.prependBlock(docId, sqlBlock, 'markdown');
    console.log(data);
    let blockId = data[0].doOperations[0].id;
    serverApi.setBlockAttrs(blockId, { name: 'Reservation', breadcrumb: "true"});
}

export function compareVersion(v1Str: string, v2Str: string) {
    let v1 = v1Str.split('.')
    let v2 = v2Str.split('.')
    const len = Math.max(v1.length, v2.length)

    while (v1.length < len) {
        v1.push('0')
    }
    while (v2.length < len) {
        v2.push('0')
    }

    for (let i = 0; i < len; i++) {
        const num1 = parseInt(v1[i])
        const num2 = parseInt(v2[i])

        if (num1 > num2) {
            return 1
        } else if (num1 < num2) {
            return -1
        }
    }

    return 0
}
