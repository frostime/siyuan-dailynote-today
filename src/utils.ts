import zh_Hans from "./i18n/zh_CN.json";
import en from "./i18n/en_US.json";

export type I18N = typeof zh_Hans;

type IsEqual<T, U> = 
    (<T1>() => T1 extends T ? 1 : 2) extends
    (<T2>() => T2 extends U ? 1 : 2)
    ? true : false;


export declare function i18NCheck<T, U>(): IsEqual<T, U>;
export declare function i18NChecks(checks: true[]): void;

i18NChecks([
    i18NCheck<I18N, typeof zh_Hans>(),
    i18NCheck<I18N, typeof en>()
]);

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
