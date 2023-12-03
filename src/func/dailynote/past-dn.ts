import notebooks from "@/global-notebooks";

import * as api from "@/serverApi";
import { formatDate } from './basic';
import { getDocsByHpath } from '@/func/misc';
import { setCustomDNAttr } from "./dn-attr";
import { debug, info } from "@/utils";

export async function getPastDNHPath(notebook: NotebookId | Notebook, date: Date): Promise<string> {
    if (typeof notebook === 'string') {
        notebook = notebooks.find(notebook);
    }
    if (notebook === null) {
        // throw new Error('DailyNoteToday: 请先设置日记本');
        return null;
    }

    let dnSprig = notebook?.dailynoteSprig;
    if (dnSprig === undefined) {
        // throw new Error('DailyNoteToday: 请先设置日记本');
        return null;
    }

    let dateStr = formatDate(date, '-');
    let sprig = `toDate "2006-01-02" "${dateStr}"`;

    dnSprig = dnSprig.replaceAll(/now/g, sprig);

    let hpath = await api.renderSprig(dnSprig)

    return hpath;
}

interface IDailyNote {
    date: Date,
    hpath: string,
    docs: Block[]
}


/**
 * Specify the date and search the daily note at that date.
 * @param notebook 
 * @param date 
 * @returns IDailyNote`
 *  - `date`: the date of the daily note
 *  - `hpath`: the hpath of the daily note
 *  - `docs`: the blocks of the daily note, or null if the daily note does not exist.
 */
export async function searchDailyNote(notebook: Notebook, date: Date): Promise<IDailyNote> {
    let hpath = await getPastDNHPath(notebook, date);
    if (hpath === null) {
        return null;
    }
    let docs: Block[] = await getDocsByHpath(hpath, notebook);
    let ans = {
        date: date,
        hpath: hpath,
        docs: docs.length === 0 ? null : docs
    };
    return ans;
}

/**
 * 查找过去的日记
 */
export async function searchDailyNotesBetween(notebook: Notebook, begin: Date, end?: Date, callback?: (dailynote: IDailyNote) => void): Promise<IDailyNote[]> {
    let dnSprig = notebook?.dailynoteSprig;

    if (dnSprig === undefined) {
        // throw new Error('DailyNoteToday: 请先设置日记本');
        return [];
    }

    end = end === undefined ? new Date() : end;
    begin.setHours(0, 0, 0, 0);
    let currentDate = new Date(end);
    currentDate.setHours(0, 0, 0, 0);
    let allDates: Date[] = []
    while (currentDate >= begin) {
        allDates.push(currentDate);
        currentDate = new Date(currentDate);
        currentDate.setDate(currentDate.getDate() - 1);
    }
    let allDnDocs = allDates.map(async (date: Date) => {
        let ans = await searchDailyNote(notebook, date);
        if (callback !== undefined && callback !== null) {
            callback(ans);
        }
        return ans;
    });
    let ansDNDocs = await Promise.all(allDnDocs);
    ansDNDocs = ansDNDocs.filter((dnDoc) => {
        return dnDoc.docs !== null;
    });
    return ansDNDocs;
}


/**
 * 查询、遍历之前所有的日记, 并为每个日记设置自定义属性 custom-dailynote-yyyyMMdd
 * @param notebook 
 */
export async function searchAndSearchAllDNAttr(notebook: Notebook) {

    let dailynoteSprig = notebook?.dailynoteSprig;
    if (dailynoteSprig === undefined || dailynoteSprig === null || dailynoteSprig === '') {
        return;
    }
    if (dailynoteSprig.startsWith('/')) {
        dailynoteSprig = dailynoteSprig.substring(1);
    }

    let parts = dailynoteSprig.split('/');
    let pathPrefix = '';  // 找到 sprig 当中不含 {{ }} 的前缀部分
    for (let i = 0; i < parts.length; i++) {
        let part = parts[i];
        if (part.match('{{') !== null) {
            break;
        }
        pathPrefix += `/${part}`;
    }
    info(`${notebook.name} PathPrefix`, pathPrefix);

    //获取最先创建的文档的日期
    let sql = `
        select * from blocks where box='${notebook.id}' and hpath like '${pathPrefix}%' and type='d'
        order by created asc limit 1;`;
    let docs = await api.sql(sql);
    if (docs.length === 0) {
        console.warn(`未找到日记本 ${notebook.name} 的日记`);
        return;
    }
    let firstDoc = docs[0];
    let created: string = firstDoc.created;
    let year = created.substring(0, 4);
    let month = created.substring(4, 6);
    let day = created.substring(6, 8);
    let firstDate = new Date(`${year}-${month}-${day}`);

    // set custom attr for all past daily notes
    let dailynotes = await searchDailyNotesBetween(
        notebook, firstDate, new Date(),
        async (dn) => {
            if (dn.docs === null) {
                return;
            }
            dn.docs.forEach(async (doc) => {
                setCustomDNAttr(doc.id, dn.date);
            });
        }
    );
    return dailynotes;
}

