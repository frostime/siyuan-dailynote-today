export interface ToolbarItem {
    ele: HTMLElement;
    release(): void;
    autoOpenDailyNote();
    updateNotebookStatus();
    updateDailyNoteStatus();
}