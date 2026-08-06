import { createDailynote, getDailynoteHpath, searchDailynote } from "@frostime/siyuan-plugin-kits";
import type { Block as KitBlock } from "@frostime/siyuan-plugin-kits";

import * as serverApi from "@/serverApi";
import { app, repeatRun } from "@/utils";
import { dateKey } from "./state";

export type ExistingTimelineWindow = {
    dates: Date[];
    previousStart: Date | null;
    nextStart: Date | null;
}

function sortDocsByCreated(docs: DocBlock[]): DocBlock[] {
    return docs.slice().sort((a, b) => a.created.localeCompare(b.created));
}

function normalizeDailyNoteDocs(result: KitBlock | KitBlock[] | null | undefined): DocBlock[] {
    const blocks = Array.isArray(result) ? result : result ? [result] : [];
    return blocks.filter((block) => block.type === 'd') as unknown as DocBlock[];
}

function dailyNoteValue(date: Date): string {
    return dateKey(date).replaceAll('-', '');
}

function dateFromDailyNoteValue(value: string): Date {
    return new Date(Number(value.slice(0, 4)), Number(value.slice(4, 6)) - 1, Number(value.slice(6, 8)));
}

function sqlString(value: string): string {
    return value.replaceAll("'", "''");
}

async function queryDateValues(notebookId: NotebookId, condition: string, direction: 'ASC' | 'DESC', limit: number): Promise<string[]> {
    const rows = await serverApi.sql(`
        SELECT A.value
        FROM attributes AS A
        JOIN blocks AS B ON B.id = A.block_id
        WHERE B.type = 'd'
          AND B.box = '${sqlString(notebookId)}'
          AND A.name LIKE 'custom-dailynote-%'
          AND ${condition}
        GROUP BY A.value
        ORDER BY A.value ${direction}
        LIMIT ${limit}
    `) || [];
    return rows.map((row: { value: string }) => row.value).filter(Boolean);
}

export async function resolveExistingTimelineWindow(
    notebookId: NotebookId,
    anchorDate: Date,
    count: DailyNoteViewTimelineCount,
): Promise<ExistingTimelineWindow> {
    const anchor = dailyNoteValue(anchorDate);
    let values = await queryDateValues(notebookId, `A.value >= '${anchor}'`, 'ASC', count);

    if (values.length < count) {
        const boundary = values[0] || anchor;
        const earlier = await queryDateValues(notebookId, `A.value < '${boundary}'`, 'DESC', count - values.length);
        values = [...earlier.reverse(), ...values];
    }

    if (values.length === 0) {
        return { dates: [], previousStart: null, nextStart: null };
    }

    const previous = await queryDateValues(notebookId, `A.value < '${values[0]}'`, 'DESC', 1);
    const afterLast = await queryDateValues(notebookId, `A.value > '${values[values.length - 1]}'`, 'ASC', 1);
    const dates = values.map(dateFromDailyNoteValue);
    const nextStart = afterLast.length === 0
        ? null
        : dates.length > 1 ? dates[1] : dateFromDailyNoteValue(afterLast[0]);

    return {
        dates,
        previousStart: previous[0] ? dateFromDailyNoteValue(previous[0]) : null,
        nextStart,
    };
}

export async function resolveDailyNoteCell(notebook: Notebook, date: Date): Promise<DailyNoteCell> {
    const [hpath, result] = await Promise.all([
        getDailynoteHpath(notebook.id, date),
        searchDailynote(notebook.id, date, { returnAll: true }),
    ]);

    const docs = normalizeDailyNoteDocs(result);
    if (docs.length === 0) {
        return { status: 'missing', hpath };
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

export async function createDailyNoteCell(notebook: Notebook, date: Date): Promise<DailyNoteCell | null> {
    const docId = await createDailynote(notebook.id, date, { appId: app.appId });
    if (!docId) return null;

    const resolved = await repeatRun(async () => {
        try {
            const cell = await resolveDailyNoteCell(notebook, date);
            return cell.status === 'missing' ? null : cell;
        } catch (error) {
            console.error(error);
            return null;
        }
    }, 500, 6) as DailyNoteCell | null;
    if (resolved) return resolved;

    const [doc, hpath] = await Promise.all([
        repeatRun(() => serverApi.getBlockByID(docId), 500, 6),
        getDailynoteHpath(notebook.id, date),
    ]);
    return {
        status: 'single',
        doc: (doc || { id: docId, hpath }) as DocBlock,
        hpath,
    };
}

export async function resolveDailyNoteLane(seed: Omit<DailyNoteLane, 'cell'>): Promise<DailyNoteLane> {
    return {
        ...seed,
        cell: await resolveDailyNoteCell(seed.notebook, seed.date),
    };
}
