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

export function addDays(date: Date, days: number): Date {
    const next = normalizeDate(date);
    next.setDate(next.getDate() + days);
    return next;
}

export function defaultDailyNoteViewState(): DailyNoteViewState {
    const available = visibleNotebooks();
    const notebook = available.find((item) => item.id === notebooks.default?.id) || available[0];
    const notebookId = notebook?.id;
    return {
        form: 'content',
        anchorDate: todayDate(),
        contentMode: 'timeline',
        daySelection: 'single',
        dayNotebookIds: notebookId ? [notebookId] : [],
        timelineNotebookId: notebookId,
        timelineCount: 1,
        timelineFilter: 'daily',
        span: 'week',
    };
}

export function visibleNotebooks(): Notebook[] {
    const blacklist = settings.get('NotebookBlacklist');
    return notebooks.notebooks.filter((notebook) => blacklist?.[notebook.id] !== true);
}

export function findNotebook(notebookId: NotebookId): Notebook | undefined {
    const available = visibleNotebooks();
    return available.find((notebook) => notebook.id === notebookId) || available[0];
}

function dayNotebooks(state: DailyNoteViewState): Notebook[] {
    const available = new Map(visibleNotebooks().map((notebook) => [notebook.id, notebook]));
    return state.dayNotebookIds
        .map((notebookId) => available.get(notebookId))
        .filter((notebook): notebook is Notebook => Boolean(notebook));
}

export function buildLaneSeeds(state: DailyNoteViewState, timelineDates: Date[] = []): LaneSeed[] {
    if (state.form !== 'content') {
        return [];
    }

    if (state.contentMode === 'day') {
        return dayNotebooks(state).map((notebook) => ({
            key: `${dateKey(state.anchorDate)}:${notebook.id}`,
            date: normalizeDate(state.anchorDate),
            notebook,
        }));
    }

    const notebook = findNotebook(state.timelineNotebookId);
    if (!notebook) {
        return [];
    }
    const dates = state.timelineFilter === 'existing'
        ? timelineDates
        : Array.from({ length: state.timelineCount }, (_, index) => addDays(state.anchorDate, index));

    return dates.map((date) => ({
        key: `${dateKey(date)}:${notebook.id}`,
        date,
        notebook,
    }));
}
