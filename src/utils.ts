import zh_Hans from "./i18n/zh_CN.json";
import en_US from "./i18n/en_US.json";
import { App, Plugin } from "siyuan";

//@ts-ignore
export const lute = window.Lute!.New();
export type I18N = typeof zh_Hans;

export function checkI18n(): boolean {
    function checkKeys(obj1: any, obj2: any): boolean {
        if (typeof obj1 !== typeof obj2) return false;
        if (typeof obj1 === "object") {
            for (const key in obj1) {
                if (!checkKeys(obj1[key], obj2[key])) return false;
            }
        }
        return true;
    }
    return checkKeys(zh_Hans, en_US);
}

// if (!checkI18n()) {
//     showMessage('i18n check failed', 5000, 'error');
// }

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

export let isMobile: boolean;
export function setIsMobile(isMobile_: boolean) {
    isMobile = isMobile_;
}

export let app: App;
export function setApp(app_: App) {
    app = app_;
}

export let plugin: Plugin;
export function setPlugin(plugin_: Plugin) {
    plugin = plugin_;
}

export function merge<T>(list: T[] | undefined, item: T): T[] {
    list = list || [];
    if (list.indexOf(item) < 0) {
        list.push(item);
    }
    return list;
}


export function clipString(str: string, len: number) {
    if (str.length > len) {
        return str.slice(0, len) + '...';
    } else {
        return str;
    }
}

export function wrapString(str: string, len: number) {
    let lineArr = [];
    for (let i = 0; i < str.length; i += len) {
        lineArr.push(str.slice(i, i + len));
    }
    return lineArr.join('\n');
}


class Debouncer {
    Timer: { [key: string]: any } = {};
    DefaultTimer: any = null;

    getTimer(key?: string) { 
        return key ? this.Timer[key] : this.DefaultTimer;
    }

    setTimer(timer: any, key?: string) {
        if (key) {
            this.Timer[key] = timer;
        } else {
            this.DefaultTimer = timer;
        }
    }

    clearTimer(key?: string) {
        let timer = this.getTimer(key);
        if (timer) {
            clearTimeout(timer);
            this.setTimer(null, key);
        }
    }

    /**
     * 返回一个经过防抖处理的函数
     * @param cb 待调用的函数
     * @param wait ms
     * @param key string
     * @returns Function
     */
    debounce<T extends Function>(cb: T, wait = 20, key?: string) {
        let callable = (...args: any) => {
            this.clearTimer(key);
            let timer = setTimeout(() => cb(...args), wait);
            this.setTimer(timer, key);
        };
        return <T><any>callable;
    }
}

export const debouncer = new Debouncer();
