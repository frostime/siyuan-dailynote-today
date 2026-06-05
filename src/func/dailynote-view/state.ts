import notebooks from "@/global-notebooks";
import { settings } from "@/global-status";

export type LaneSeed = {
    key: string;
    date: Date;
    notebook: Notebook;
}

export function dateKey(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function normalizeDate(date: Date): Date {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
}

export function addDays(date: Date, days: number): Date {
    const next = normalizeDate(date);
    next.setDate(next.getDate() + days);
    return next;
}

export function defaultDailyNoteViewState(): DailyNoteViewState {
    const notebook = notebooks.default || notebooks.get(0);
    return {
        mode: 'content',
        anchorDate: normalizeDate(new Date()),
        anchorNotebookId: notebook?.id,
        axis: 'time',
        count: 1,
    };
}

export function visibleNotebooks(): Notebook[] {
    const blacklist = settings.get('NotebookBlacklist');
    return notebooks.notebooks.filter((notebook) => blacklist?.[notebook.id] !== true);
}

export function findNotebook(notebookId: NotebookId): Notebook {
    return notebooks.find(notebookId) || notebooks.default || notebooks.get(0);
}

export function shiftNotebook(notebookId: NotebookId, offset: number): NotebookId {
    const list = visibleNotebooks();
    if (list.length === 0) {
        return notebookId;
    }
    const current = list.findIndex((notebook) => notebook.id === notebookId);
    const index = current < 0 ? 0 : current;
    const next = (index + offset + list.length) % list.length;
    return list[next].id;
}

export function applyPreset(state: DailyNoteViewState, preset: 'today' | 'three-days' | 'notebooks' | 'week' | 'month'): DailyNoteViewState {
    if (preset === 'today') {
        return { ...state, mode: 'content', axis: 'time', count: 1, anchorDate: normalizeDate(new Date()) };
    }
    if (preset === 'three-days') {
        return { ...state, mode: 'content', axis: 'time', count: 3 };
    }
    if (preset === 'notebooks') {
        return { ...state, mode: 'content', axis: 'notebook', count: 'all' };
    }
    return { ...state, mode: preset };
}

function numericCount(count: DailyNoteViewCount): 1 | 3 | 5 {
    return typeof count === 'number' ? count : 1;
}

function centeredNotebookWindow(list: Notebook[], anchorNotebookId: NotebookId, count: 1 | 3 | 5): Notebook[] {
    if (list.length <= count) {
        return list;
    }
    const current = Math.max(0, list.findIndex((notebook) => notebook.id === anchorNotebookId));
    let start = current - Math.floor((count - 1) / 2);
    start = Math.max(0, Math.min(start, list.length - count));
    return list.slice(start, start + count);
}

export function buildLaneSeeds(state: DailyNoteViewState): LaneSeed[] {
    if (state.mode !== 'content') {
        return [];
    }

    if (state.axis === 'time') {
        const notebook = findNotebook(state.anchorNotebookId);
        if (!notebook) {
            return [];
        }
        const count = numericCount(state.count);
        const startOffset = -Math.floor((count - 1) / 2);
        return Array.from({ length: count }, (_, index) => {
            const date = addDays(state.anchorDate, startOffset + index);
            return {
                key: `${dateKey(date)}:${notebook.id}`,
                date,
                notebook,
            };
        });
    }

    const list = visibleNotebooks();
    const lanes = state.count === 'all'
        ? list
        : centeredNotebookWindow(list, state.anchorNotebookId, state.count);

    return lanes.map((notebook) => ({
        key: `${dateKey(state.anchorDate)}:${notebook.id}`,
        date: normalizeDate(state.anchorDate),
        notebook,
    }));
}
