/**
 * Copyright (c) 2023 frostime. All rights reserved.
 */

export function info(...msg: any[]): void {
    console.log(`[DailyNoteToday][INFO] ${msg}`);
}

export function error(...msg: any[]): void {
    console.error(`[DailyNoteToday][ERROR] ${msg}`);
}

export function warn(...msg: any[]): void {
    console.warn(`[DailyNoteToday][WARN] ${msg}`);
}

export let i18n: any;
export function setI18n(i18n_: any) {
    i18n = i18n_;
}
