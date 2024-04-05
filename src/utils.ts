// import zh_Hans from "./i18n/zh_CN.json";
// // import en_US from "./i18n/en_US.json";
import zh_Hans from '../dev/i18n/zh_CN.json';


import { App, Plugin } from "siyuan";

//@ts-ignore
export const lute = window.Lute!.New();
export type I18N = typeof zh_Hans;
// export type I18N = any;


export function debug(...msg: any[]): void {
    console.debug(`[DailyNoteToday][DEBUG] ${msg}`);
}

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

export function formatBlockTime(time: string) {
    //time format: 20230729171305
    let year = time.slice(0, 4);
    let month = time.slice(4, 6);
    let day = time.slice(6, 8);
    let hour = time.slice(8, 10);
    let minute = time.slice(10, 12);
    let second = time.slice(12, 14);
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}


/**
 * Copyright (c) 2023 [Zuoqiu-Yingyi](https://github.com/Zuoqiu-Yingyi/siyuan-packages-monorepo)
 * 判断一个元素是否为思源块元素
 * @param element 元素
 * @returns 是否为思源块元素
 */
export function isSiyuanBlock(element: any): boolean {
    return !!(element
        && element instanceof HTMLElement
        && element.dataset.type
        && element.dataset.nodeId
        && /^\d{14}-[0-9a-z]{7}$/.test(element.dataset.nodeId)
    );
}

/**
 * Copyright (c) 2023 [Zuoqiu-Yingyi](https://github.com/Zuoqiu-Yingyi/siyuan-packages-monorepo)
 * 获取当前光标所在的块
 * @returns 当前光标所在的块的 HTML 元素
 */
export function getFocusedBlock(): HTMLElement | null | undefined {
    const selection = document.getSelection();
    let element = selection?.focusNode;
    while (element // 元素存在
        && (!(element instanceof HTMLElement) // 元素非 HTMLElement
            || !isSiyuanBlock(element) // 元素非思源块元素
        )
    ) {
        element = element.parentElement;
    }
    return element as HTMLElement;
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
