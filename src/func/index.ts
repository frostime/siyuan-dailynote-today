/**
 * Copyright (c) 2023 frostime all rights reserved.
 */
import { showMessage, confirm, Dialog, openTab } from 'siyuan';
import notebooks from '../global-notebooks';
import { info, warn, error, i18n, lute, app, isMobile, formatBlockTime, debug } from "../utils";
import * as serverApi from '../serverApi';
import * as utils from '@/utils';
import { reservation, settings } from '../global-status';
import { Retrieve, RetvFactory } from './reserve';
import { getDailynoteSprig, renderDailynotePath } from './dailynote';


const default_sprig = `/daily note/{{now | date "2006/01"}}/{{now | date "2006-01-02"}}`
const hiddenNotebook: Set<string> = new Set(["思源笔记用户指南", "SiYuan User Guide"]);

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
        const blacklist = settings.get("NotebookBlacklist");
        all_notebooks = all_notebooks.filter(
            notebook => {
                return !notebook.closed && !hiddenNotebook.has(notebook.name);
            }
        );

        let all_notebook_names = all_notebooks.map(notebook => notebook.name);

        //Get all daily note sprig
        for (let notebook of all_notebooks) {
            let sprig = await getDailynoteSprig(notebook.id);
            notebook.dailynoteSprig = sprig != "" ? sprig : default_sprig;
            notebook.dailynoteHpath = await renderDailynotePath(notebook.dailynoteSprig);

            //防止出现不符合规范的 sprig, 不过根据 debug 情况看似乎不会出现这种情况
            if (notebook.dailynoteHpath == "") {
                warn(`Invalid daily note srpig of ${notebook.name}`);
                notebook.dailynoteSprig = default_sprig;
                notebook.dailynoteHpath = await renderDailynotePath(default_sprig);
            }

            if (notebook.icon == "") {
                notebook.icon = "1f5c3";
            }
        }

        debug(`Read all notebooks: ${all_notebook_names}`);
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


/**
 * 由于同步的问题，默认的笔记本中可能出现重复的日记，这里检查下是否有重复的日记
 * @param notebook 
 * @param todayDiaryHpath 
 */
export async function checkDuplicateDiary(): Promise<boolean> {
    let notebook: Notebook = notebooks.default;
    let hpath = notebook.dailynoteHpath!;
    let docs = await getDocsByHpath(hpath, notebook);

    if (docs.length <= 1) {
        return false;
    }
    //莫名其妙出现了重复的 id, 所以还是去重一下
    let idSet: Set<string> = new Set();
    let uniqueDocs: Array<Block> = [];
    docs.forEach((doc) => {
        if (!idSet.has(doc.id)) {
            uniqueDocs.push(doc);
            idSet.add(doc.id);
        }
    });
    docs = uniqueDocs;

    if (docs.length <= 1) {
        return false;
    }

    console.warn(`Conflict daily note: ${notebook.name} ${hpath}`);

    let confilctTable = [];
    for (let doc of docs) {
        let id = doc.id;
        let created = doc.created;
        created = `${created.slice(0, 4)}-${created.slice(4, 6)}-${created.slice(6, 8)} ${created.slice(8, 10)}:${created.slice(10, 12)}:${created.slice(12, 14)}`
        let updated = doc.updated;
        updated = `${updated.slice(0, 4)}-${updated.slice(4, 6)}-${updated.slice(6, 8)} ${updated.slice(8, 10)}:${updated.slice(10, 12)}:${updated.slice(12, 14)}`
        let row = `| ${id} | ${doc.content} | ${created} | ${updated} | ${notebook.name} |\n`;
        confilctTable.push(row);
    }

    let content: string = i18n.ConflictDiary.part1.join("\n") + "\n";
    for (let row of confilctTable) {
        content += row;
    }
    content += "\n" + i18n.ConflictDiary.part2.join("\n");
    content = lute.Md2HTML(content);
    let html = `
        <div class="b3-typography typofont-1rem"
            style="margin: 0.5rem;"
        >
            ${content}
        </div>
        <div class="fn__flex b3-label" style="border-top: 1px solid var(--b3-theme-surface-lighter);">
            <div class="fn__flex-1"></div>
            <span class="fn__space"></span>
            <button class="b3-button b3-button--outline fn__flex-center fn__size200" id="merge">
                ${i18n.ConflictDiary.AutoMerge}
            </button>
        </div>
        `;
    let dialog = new Dialog({
        title: i18n.Name,
        content: html,
        width: isMobile ? "80%" : "50%",
    });
    dialog.element.querySelector("#merge")?.addEventListener("click", async () => {
        showMessage("Merge", 1000, "info");
        docs = docs.sort((a, b) => {
            return a.created >= b.created ? -1 : 1;
        });
        //选择最早的日记
        let latestDoc = docs.pop();
        // let childs: Block[] = await serverApi.getChildBlocks(latestDoc.id);
        // let lastChildBlockID = childs[childs.length - 1].id;
        let result = await serverApi.appendBlock(latestDoc.id, i18n.ConflictDiary.HeadingMarkdown, "markdown");
        let lastChildBlockID = result?.[0]?.doOperations[0].id;
        if (lastChildBlockID === undefined) {
            error(`无法获取最新日记的最后一个 block id`);
            showMessage(i18n.ConflictDiary.fail, 2000, "error");
            dialog.destroy();
            return;
        }

        //将其他的日记合并到最新的日记中
        for (let doc of docs) {
            let id = doc.id;
            let created: string = doc.created;

            /* 可能存在不安全的情况, 保守一点, 不删除无用文档
            let updated: string = doc.updated;
            let stat = await serverApi.getTreeStat(id);
            //if all value is 0
            let empty = true;
            Object.keys(stat).forEach(key => {
                if (stat[key] != 0) {
                    empty = false;
                }
            });

            //空白日记, 直接删除
            if (empty) {
                await serverApi.removeDoc(doc.box, doc.path);
                console.log(`Remove empty doc ${id}`);
                continue;
            }

            const noRefLink = stat.refCount == 0 && stat.linkCount == 0;

            //如果无链接, 且创建时间和更新时间相差超过 5 秒, 大概率是模板日记, 可以直接删除
            if (noRefLink && parseInt(created) + 5 >= parseInt(updated)) {
                await serverApi.removeDoc(doc.box, doc.path);
                console.log(`Remove not modified doc ${id} ${created} ${updated}`);
            } else {
                let time = formatBlockTime(created);
                await serverApi.renameDoc(doc.box, doc.path, `${doc.content} [${time}]`);
                await serverApi.doc2Heading(id, lastChildBlockID, true);
                console.log(`Merge doc ${id}`);
            }
            */
            let time = formatBlockTime(created);
            await serverApi.renameDoc(doc.box, doc.path, `${doc.content} [${time}]`);
            await serverApi.doc2Heading(id, lastChildBlockID, true);
            console.log(`Merge doc ${id}`);
        }
        showMessage(i18n.ConflictDiary.success, 2000, "info");
        dialog.destroy();
    });
    return true;
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

export async function filterExistsBlocks(blockIds: string[]): Promise<Set<string>> {
    let idStr = blockIds.map(id => `'${id}'`).join(",");
    const sql = `select distinct id from blocks where id in (${idStr})`;
    let blocks: Array<Block> = await serverApi.sql(sql);
    let idSet: Set<string> = new Set();
    blocks.forEach(block => {
        idSet.add(block.id);
    });
    return idSet;
}

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
