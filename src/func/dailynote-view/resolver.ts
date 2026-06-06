import { createDailynote, getDailynoteHpath, searchDailynote } from "@frostime/siyuan-plugin-kits";
import type { Block as KitBlock } from "@frostime/siyuan-plugin-kits";

import * as serverApi from "@/serverApi";
import { app } from "@/utils";
import { isFutureDate } from "./state";

function sortDocsByCreated(docs: DocBlock[]): DocBlock[] {
    return docs.slice().sort((a, b) => a.created.localeCompare(b.created));
}

function normalizeDailyNoteDocs(result: KitBlock | KitBlock[] | null | undefined): DocBlock[] {
    const blocks = Array.isArray(result) ? result : result ? [result] : [];
    return blocks.filter((block) => block.type === 'd') as unknown as DocBlock[];
}

export async function resolveDailyNoteCell(notebook: Notebook, date: Date): Promise<DailyNoteCell> {
    const [hpath, result] = await Promise.all([
        getDailynoteHpath(notebook.id, date),
        searchDailynote(notebook.id, date, { returnAll: true }),
    ]);

    const docs = normalizeDailyNoteDocs(result);
    if (docs.length === 0) {
        return isFutureDate(date)
            ? { status: 'future', hpath }
            : { status: 'missing', hpath };
    }

    const sorted = sortDocsByCreated(docs);
    if (sorted.length === 1) {
        return { status: 'single', doc: sorted[0], hpath };
    }

    return {
        status: 'duplicate',
        primary: sorted[0],
        docs: sorted,
        hpath,
    };
}

export async function createDailyNoteCell(notebook: Notebook, date: Date): Promise<DocBlock | null> {
    const docId = await createDailynote(notebook.id, date, { appId: app.appId });
    if (!docId) {
        return null;
    }
    return await serverApi.getBlockByID(docId) as DocBlock;
}

export async function resolveDailyNoteLane(seed: Omit<DailyNoteLane, 'cell'>): Promise<DailyNoteLane> {
    return {
        ...seed,
        cell: await resolveDailyNoteCell(seed.notebook, seed.date),
    };
}
