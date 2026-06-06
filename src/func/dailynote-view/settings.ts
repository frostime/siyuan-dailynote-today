import { settings } from "@/global-status";

export const DEFAULT_DAILY_NOTE_VIEW_LANE_MIN_WIDTH = '30rem';
export const DAILY_NOTE_VIEW_LANE_MIN_WIDTH_PATTERN = /^(?:\d+(?:\.\d+)?|\.\d+)(?:px|rem|em|vw|%)$/i;

export function isDailyNoteViewLaneMinWidth(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    return DAILY_NOTE_VIEW_LANE_MIN_WIDTH_PATTERN.test(value.trim());
}

export function normalizeDailyNoteViewLaneMinWidth(value: unknown): string {
    if (typeof value !== 'string') return DEFAULT_DAILY_NOTE_VIEW_LANE_MIN_WIDTH;
    const text = value.trim();
    return isDailyNoteViewLaneMinWidth(text) ? text : DEFAULT_DAILY_NOTE_VIEW_LANE_MIN_WIDTH;
}

export function dailyNoteViewLaneMinWidth(): string {
    return normalizeDailyNoteViewLaneMinWidth(settings.get('DailyNoteViewLaneMinWidth'));
}
