/*
 * Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 * @Author       : Yp Z
 * @Date         : 2023-06-16 21:00:30
 * @FilePath     : /src/func/dailynote.ts
 * @LastEditTime : 2023-11-12 17:40:14
 * @Description  : 
 */
import * as serverApi from '../serverApi';
import * as utils from '@/utils';
import { info, i18n } from '@/utils';
import { showMessage } from 'siyuan';

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


function today(): string {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    return `${year}${month < 10 ? '0' + month : month}${day < 10 ? '0' + day : day}`;
}

export async function createDiary(notebook: Notebook, todayDiaryHpath: string) {
    let doc_id = await serverApi.createDocWithMd(notebook.id, todayDiaryHpath, "");
    info(`创建日记: ${notebook.name} ${todayDiaryHpath}`);
    serverApi.setBlockAttrs(doc_id, { "custom-dailynote": today() });
    return doc_id;
}


/**
 * 打开指定的笔记本下今天的日记，如果不存在则创建
 * @param notebook_index 笔记本的 index
 */
export async function openDiary(notebook: Notebook) {
    // console.log(utils.app)
    let appId = utils.app.appId;
    await serverApi.createDailyNote(notebook.id, appId);
    showMessage(`${i18n.Open}: ${notebook.name}`, 2000, 'info');
}

// class AutoOpenDailyNoteHandler {

    

//     constructor() {

//     }
// }

