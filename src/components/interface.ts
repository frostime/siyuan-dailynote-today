export interface ToolbarItem {
    ele: HTMLElement;
    release(): void;
    bindEvent(event: 'openItem' | 'openDiary', callback: any): void;
    autoOpenDailyNote(): void;
    updateNotebooks(): void;
    updateDailyNoteStatus(diaryStatus: Map<string, boolean>): void;
}