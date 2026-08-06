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

export function todayDate(): Date {
    return normalizeDate(new Date());
}

export function isFutureDate(date: Date): boolean {
    return normalizeDate(date).getTime() > todayDate().getTime();
}

export function clampToToday(date: Date): Date {
    const normalized = normalizeDate(date);
    return isFutureDate(normalized) ? todayDate() : normalized;
}

export function addDays(date: Date, days: number): Date {
    const next = normalizeDate(date);
    next.setDate(next.getDate() + days);
    return next;
}

export function defaultDailyNoteViewState(): DailyNoteViewState {
    const notebook = notebooks.default || notebooks.get(0);
    return {
        form: 'content',
        anchorDate: todayDate(),
        anchorNotebookId: notebook?.id,
        axis: 'time',
        timeCount: 1,
        notebookScope: 'all',
        span: 'week',
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

export function buildLaneSeeds(state: DailyNoteViewState): LaneSeed[] {
    if (state.form !== 'content') {
        return [];
    }

    if (state.axis === 'time') {
        const notebook = findNotebook(state.anchorNotebookId);
        if (!notebook) {
            return [];
        }
        const count = state.timeCount;
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
    const selected = list.find((notebook) => notebook.id === state.anchorNotebookId) ?? list[0];
    const lanes = state.notebookScope === 'single'
        ? selected ? [selected] : []
        : list;

    return lanes.map((notebook) => ({
        key: `${dateKey(state.anchorDate)}:${notebook.id}`,
        date: normalizeDate(state.anchorDate),
        notebook,
    }));
}
