import zh_Hans from "./i18n/zh_CN.json";

export type I18N = typeof zh_Hans;

export function info(...msg: any[]): void {
    console.log(`[DailyNoteToday][INFO] ${msg}`);
}

export function error(...msg: any[]): void {
    console.error(`[DailyNoteToday][ERROR] ${msg}`);
}

export function warn(...msg: any[]): void {
    console.warn(`[DailyNoteToday][WARN] ${msg}`);
}

export let i18n: I18N;
export function setI18n(i18n_: any) {
    i18n = i18n_;
}
