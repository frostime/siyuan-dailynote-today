/**
 * Copyright (c) 2023 frostime all rights reserved.
 */
import { confirm, openTab } from 'siyuan';
import { error, i18n, app, debug } from "../utils";
import * as serverApi from '../serverApi';
import { reservation, settings } from '../global-status';
import { Retrieve, RetvFactory } from './reserve';

import { getDocsByHpath } from './misc';

export * from './dailynote';
export * from './misc';
export * from './reserve';



export async function initTodayReservation(notebook: Notebook) {
    let todayDiaryPath = notebook.dailynoteHpath;
    let docId;
    let retry = 0;
    const MAX_RETRY = 5;
    const INTERVAL = 2500;
    while (retry < MAX_RETRY) {
        //插件自动创建日记的情况下可能会出现第一次拿不到的情况, 需要重试几次
        let docs = await getDocsByHpath(todayDiaryPath!, notebook);
        debug(`In initResrv, retry: ${retry}`);
        if (docs[0]?.id !== undefined) {
            docId = docs[0].id;
            break;
        }
        await new Promise(resolve => setTimeout(resolve, INTERVAL));
        retry++;
    }
    if (docId === undefined) {
        error(`无法获取今日日记的 docId`);
        return;
    }
    updateDocReservation(docId, false);
}

export async function updateTodayReservation(notebook: Notebook, refresh: boolean = false) {
    let todayDiaryPath = notebook.dailynoteHpath;
    let docs = await getDocsByHpath(todayDiaryPath!, notebook);
    let docId = docs[0].id;
    updateDocReservation(docId, refresh);
}

export async function updateDocReservation(docId: string, refresh: boolean = false) {
    let resvBlockIds = reservation.getTodayReservations();
    if (resvBlockIds.length == 0) {
        return;
    }
    let retvType = settings.get('RetvType');
    let retv: Retrieve = RetvFactory(retvType, settings.get('ResvEmbedAt'), resvBlockIds, docId);
    let retvBlocks = await retv.checkRetv();
    const hasInserted = retvBlocks.length > 0;

    if (hasInserted && !refresh) {
        debug(`今日已经插入过预约了`);
        return;
    } else {
        resvBlockIds = resvBlockIds.map((id) => `"${id}"`);
        let sql = `select * from blocks where id in (${resvBlockIds.join(',')})`;
        // console.log(resvBlockIds);
        //1. 先检查预约块是否存在
        let resvBlocks: Block[] = await serverApi.sql(sql);
        if (resvBlocks.length === 0) {
            confirm(i18n.Name, i18n.Msg.Resv404);
            return;
        }
        //如果是初次创建, 则插入到日记的最前面
        if (hasInserted) {
            retv.update();
        } else {
            //否则, 就更新
            retv.insert();
        }
    }
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

export function openBlock(blockId: BlockId) {
    openTab({
        app: app,
        doc: {
            id: blockId,
            action: ['cb-get-focus'],
            zoomIn: true
        }
    });
}
