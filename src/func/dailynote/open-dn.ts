/*
 * Copyright (c) 2023 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2023-11-12 19:53:10
 * @FilePath     : /src/func/dailynote/open-dn.ts
 * @LastEditTime : 2023-11-21 14:18:09
 * @Description  : 
 */
import { showMessage, confirm, openTab, openMobileFileById } from 'siyuan';


import notebooks from "@/global-notebooks";
import { settings } from '@/global-status';

import * as serverApi from '@/serverApi';
import * as utils from '@/utils';
import { info, i18n, isMobile, debug } from '@/utils';


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
    let appId = utils.app.appId;
    let dailynote = await serverApi.createDailyNote(notebook.id, appId);
    showMessage(`${i18n.Open}: ${notebook.name}`, 2000, 'info');
    //打开文档
    if (isMobile === true) {
        openMobileFileById(utils.app, dailynote.id, ['cb-get-all']);
    } else {
        openTab({
            app: utils.app,
            doc: {
                id: dailynote.id,
                zoomIn: false
            }
        });
    }
    //设置日记日期的自定义属性 (现在也没啥用, 以后也不一定会用到, 但是加一个也不碍事)
    serverApi.setBlockAttrs(dailynote.id, { "custom-dailynote": today() });
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