import { confirm } from 'siyuan';
import { error, i18n, debug } from "@/utils";
import * as serverApi from '@/serverApi';
import { reservation, settings } from '@/global-status';
import { Retrieve, RetvFactory } from './retrieve';

import { getDocsByHpath } from '../misc';

export * from './retrieve';
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
