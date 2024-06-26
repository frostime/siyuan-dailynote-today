/*
 * Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 * @Author       : Yp Z
 * @Date         : 2023-11-12 18:06:46
 * @FilePath     : /src/func/dailynote/basic.ts
 * @LastEditTime : 2024-05-15 15:18:28
 * @Description  : 
 */
import * as serverApi from '@/serverApi';
import notebooks from "@/global-notebooks";
import { getDocsByHpath } from '@/func/misc';


export function formatDate(date?: Date, sep=''): string {
    date = date === undefined ? new Date() : date;
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    return `${year}${sep}${month < 10 ? '0' + month : month}${sep}${day < 10 ? '0' + day : day}`;
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
 * 
 */
export async function queryTodayDailyNoteDoc(notebookId: NotebookId): Promise<Block[]> {
    let td = formatDate(new Date());
    const sql = `
    select distinct B.* from blocks as B join attributes as A
    on B.id = A.block_id
    where A.name = 'custom-dailynote-${td}' and B.box = '${notebookId}'
    `;
    const blocks: Block[] = await serverApi.sql(sql);
    return blocks;
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
        hpath_set.add(notebook.dailynoteHpath!);
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
    console.log(`更新日记状态: 当前日记共 ${count_diary} 篇`);
    return diaryStatus;
}


/**
 * 启用或者禁用默认的 Alt+5 日记快捷键
 * @param enable 是否启用
 */
export function toggleGeneralDailynoteKeymap(enable: boolean) {
    const config = window.siyuan.config.keymap.general.dailyNote;
    if (enable) {
        config.custom = config.default;
    } else {
        config.custom = '';
    }
}
