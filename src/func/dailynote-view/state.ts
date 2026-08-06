import notebooks from "@/global-notebooks";
import { settings } from "@/global-status";

export function dateKey(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function dailyNoteDate(doc: DailyNoteDocument): Date | null {
    const value = doc.value;
    if (!value || value.length < 8) return null;
    return new Date(Number(value.slice(0, 4)), Number(value.slice(4, 6)) - 1, Number(value.slice(6, 8)));
}

export function dailyNoteDateKey(doc: DailyNoteDocument): string | null {
    const date = dailyNoteDate(doc);
    return date ? dateKey(date) : null;
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
        notebookScope: 'all',
        group: 'day',
        layout: 'single',
        columnCount: 3,
        sequenceCount: 3,
        span: 'month',
    };
}

export function visibleNotebooks(): Notebook[] {
    const blacklist = settings.get('NotebookBlacklist');
    return notebooks.notebooks.filter((notebook) => blacklist?.[notebook.id] !== true);
}

export function findNotebook(notebookId: NotebookId): Notebook {
    return notebooks.find(notebookId) || notebooks.default || notebooks.get(0);
}

export function docsToLanes(docs: DailyNoteDocument[]): DailyNoteLane[] {
    const grouped = new Map<string, { date: Date; notebook: Notebook; docs: DailyNoteDocument[] }>();

    docs.forEach((doc) => {
        const date = dailyNoteDate(doc);
        const notebook = visibleNotebooks().find((item) => item.id === doc.box);
        if (!date || !notebook) return;
        const key = `${dateKey(date)}:${notebook.id}`;
        const group = grouped.get(key) || { date, notebook, docs: [] };
        group.docs.push(doc);
        grouped.set(key, group);
    });

    return Array.from(grouped.entries())
        .sort(([, a], [, b]) => a.date.getTime() - b.date.getTime())
        .map(([key, group]) => {
            const sorted = group.docs.slice().sort((a, b) => a.created.localeCompare(b.created));
            return {
                key,
                date: group.date,
                notebook: group.notebook,
                cell: sorted.length === 1
                    ? { status: 'single', doc: sorted[0], hpath: sorted[0].hpath }
                    : { status: 'duplicate', primary: sorted[0], docs: sorted, hpath: sorted[0].hpath },
            };
        });
}
