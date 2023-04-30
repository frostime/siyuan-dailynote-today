export interface ToolbarItem {
    ele: HTMLElement;
    release(): void;
    autoOpenDailyNote(): void;
    updateNotebookStatus(): void;
    updateDailyNoteStatus(): void;
}