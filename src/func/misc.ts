import { openTab } from 'siyuan';

import { warn, error, debug, app } from "@/utils";
import * as serverApi from '@/serverApi';
import { settings } from '@/global-status';
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
        // const blacklist = settings.get("NotebookBlacklist");
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
