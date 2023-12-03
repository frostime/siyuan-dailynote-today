import notebooks from "@/global-notebooks";

import * as api from "@/serverApi";
import { formatDate } from './basic';
import { getDocsByHpath } from '@/func/misc';

export async function getPastDNHPath(notebook: NotebookId | Notebook, date: Date): Promise<string> {
    if (typeof notebook === 'string') {
        notebook = notebooks.find(notebook);
    }
    if (notebook === null) {
        throw new Error('DailyNoteToday: 请先设置日记本');
    }

    let dnSprig = notebook?.dailynoteSprig;
    if (dnSprig === undefined) {
        throw new Error('DailyNoteToday: 请先设置日记本');
    }

    let dateStr = formatDate(date, '-');
    let sprig = `toDate "2006-01-02" "${dateStr}"`;

    dnSprig = dnSprig.replaceAll(/now/g, sprig);

    let hpath = await api.renderSprig(dnSprig)

    return hpath;
}

interface DailyNote {
    date: Date,
    hpath: string,
    docs: Block[]
}

/**
 * 查找过去的日记
 */
export async function searchPastDailyNotes(notebook: Notebook, begin: Date): Promise<DailyNote[]> {
    let dnSprig = notebook?.dailynoteSprig;

    if (dnSprig === undefined) {
        throw new Error('DailyNoteToday: 请先设置日记本');
    }

    let today: Date = new Date();
    //从 begin 开始一直迭代到 today
    let currentDate = new Date(today);
    currentDate.setHours(0, 0, 0, 0);
    let allDates: Date[] = []
    while (currentDate >= begin) {
        allDates.push(currentDate);
        currentDate = new Date(currentDate);
        currentDate.setDate(currentDate.getDate() - 1);
    }
    let allDnDocs = allDates.map(async (date: Date) => {
        let hpath = await getPastDNHPath(notebook, date);
        let docs: Block[] = await getDocsByHpath(hpath, notebook);
        if (docs.length > 0) {
            return {
                date: date,
                hpath: hpath,
                docs: docs
            };
        } else {
            return {
                date: date,
                hpath: hpath,
                docs: null
            }
        }
    });
    let ansDNDocs = await Promise.all(allDnDocs);
    ansDNDocs = ansDNDocs.filter((dnDoc) => {
        return dnDoc.docs !== null;
    });
    return ansDNDocs;
}

