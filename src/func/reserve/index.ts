import { confirm } from 'siyuan';
import { i18n } from "@/utils";
import * as serverApi from '@/serverApi';
import { reservation, settings } from '@/global-status';
import { Retrieve, RetvFactory } from './retrieve';

export * from './retrieve';
export * from './reserve';


/**
 * 给定笔记本，将今日的预约块插入笔记本的 daily note 中
 * @param notebook 
 * @param refresh 
 * @returns
 *  - boolean, true 代表走完了流程; false 代表没有走完流程（比如日记不存在）
 */
export async function updateTodayReservation(notebook: Notebook, refresh: boolean = false) {
    let docId = notebook?.dailyNoteDocId; //dailyNoteDocId 是在 openDiary 和 createDiary 时动态设置的
    if (!docId) return false;
    updateDocReservation(docId, refresh);
    return true;
}

/**
 * 给定文档 ID, 插入今日的预约块
 * @param docId 
 * @param refresh 
 * @returns 
 */
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
        console.debug(`今日已经插入过预约了`);
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
