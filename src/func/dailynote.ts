/*
 * Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 * @Author       : Yp Z
 * @Date         : 2023-06-16 21:00:30
 * @FilePath     : /src/func/dailynote.ts
 * @LastEditTime : 2023-11-12 18:01:37
 * @Description  : 
 */
import * as serverApi from '../serverApi';
import * as utils from '@/utils';
import { info, i18n, isMobile, debug } from '@/utils';
import { showMessage, confirm } from 'siyuan';
import notebooks from "../global-notebooks";
import { settings } from '@/global-status';

import { getDocsByHpath } from '@/func';

import type DailyNoteTodayPlugin from '@/index';

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
    info(`更新日记状态: 当前日记共 ${count_diary} 篇`);
    return diaryStatus;
}

/**
 * 初始化的时候，加载所有的笔记本
 */
export async function autoOpenDailyNote() {
    debug('自动开启日记');
    if (isMobile && settings.get('DisableAutoCreateOnMobile') === true) {
        // showMessage('移动端不开放');
        return;
    }
    //小窗打开模式下, 不再自动打开
    const url = new URL(window.location.href);
    // showMessage(url.pathname);
    if (url.pathname.startsWith('/stage/build/app/window.html')) {
        debug('小窗模式, 无需自动打开日记');
        return;
    }

    if (notebooks.notebooks.length > 0) {
        if (settings.settings.OpenOnStart === true) {
            let notebookId: string = settings.get('DefaultNotebook');
            let notebook: Notebook = notebooks.default;
            if (notebook) {
                await openDiary(notebook);
                // initTodayReservation(notebook);
            } else {
                confirm(i18n.Name, `${notebookId} ${i18n.InvalidDefaultNotebook}`)
                return
            }
        }
    }
}

//@ts-ignore
const SYNC_ENABLED = window.siyuan.config.sync.enabled;

class AutoOpenDailyNoteHandler {
    plugin: DailyNoteTodayPlugin;
    openOnStart: boolean;
    autoOpenAfterSync: boolean;

    constructor(plugin: DailyNoteTodayPlugin) {
        this.plugin = plugin;
        this.openOnStart = settings.get('OpenOnStart');
        this.autoOpenAfterSync = settings.get('AutoOpenAfterSync');
    }

    onPluginLoad() {
        //如果思源没有开启
        if (SYNC_ENABLED === false) {

        }
    }
}

