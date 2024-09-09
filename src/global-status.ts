/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-05-21 14:14:08
 * @FilePath     : /src/global-status.ts
 * @LastEditTime : 2024-09-09 21:46:44
 * @Description  : 
 */
import { eventBus } from './event-bus';
import { filterExistsBlocks } from './func';
import { retrieveResvFromBlocks } from '@/func/reserve';
import notebooks from './global-notebooks';

import type DailyNoteTodayPlugin from '@/index';


// type NotebookSorting = 'doc-tree' | 'custom-sort'

interface Item {
    key: SettingKey,
    value: any
}

const SettingFile = 'DailyNoteToday.json.txt';

class SettingManager {
    plugin: DailyNoteTodayPlugin;

    settings: any = {
        OpenOnStart: true as boolean, //启动的时候自动打开日记
        AutoOpenAfterSync: false as boolean, //在第一次同步之后再自动打开日记
        DefaultNotebook: '', //默认笔记本的 ID
        DisableAutoCreateOnMobile: false as boolean, //移动端自动创建日记
        IconPosition: 'left' as IconPosition, //图标放置位置
        EnableMove: true as boolean,
        EnableReserve: true as boolean,
        EnableResvDock: true as boolean,
        ExpandGutterMenu: true as boolean, //是否将菜单项目展开
        PopupReserveDialog: true as boolean, //是否弹出预约对话框
        ResvEmbedAt: 'top' as RetvPosition, //Retrieved 块嵌入位置
        RetvType: 'embed' as RetvType, //Retrieved 块的类型
        NotebookBlacklist: {}, //笔记本黑名单
        HighlightResv: true as boolean, //高亮显示预约块
        AutoHandleDuplicateMethod: 'None' as TDuplicateHandleMethod, // 自动处理重复日记的方法
        ReplaceAlt5Hotkey: false as boolean, //替换 Alt+5 快捷键
    };

    constructor() {
        eventBus.subscribe(eventBus.EventSetting, (data: Item) => {
            this.set(data.key, data.value);
            this.save();

            if (data.key === 'ReplaceAlt5Hotkey') {
                this.plugin.toggleDnHotkey(data.value);
            }
        });
    }

    setPlugin(plugin: DailyNoteTodayPlugin) {
        this.plugin = plugin;
    }

    get(key: SettingKey) {
        return this.settings?.[key];
    }

    set(key: any, value: any) {
        // console.log(`Setting update: ${key} = ${value}`)
        if (!(key in this.settings)) {
            console.error(`"${key}" is not a setting`);
            return;
        }

        this.settings[key] = value;

        if (key === 'DefaultNotebook') {
            notebooks.updateDefault();
        }

    }

    /**
     * 导入的时候，需要先加载设置；如果没有设置，则使用默认设置
     */
    async load() {
        let loaded = await this.plugin.loadData(SettingFile);
        if (loaded == null || loaded == undefined || loaded == '') {
            //如果没有配置文件，则使用默认配置，并保存
            console.debug(`没有配置文件，使用默认配置`)
            this.save();
        } else {
            //如果有配置文件，则使用配置文件
            console.log(`读入配置文件: ${SettingFile}`)
            console.log(loaded);
            //Docker 和  Windows 不知为何行为不一致, 一个读入字符串，一个读入对象
            //为了兼容，这里做一下判断
            if (typeof loaded === 'string') {
                loaded = JSON.parse(loaded);
            }
            try {
                for (let key in loaded) {
                    this.set(key, loaded[key]);
                }
            } catch (error_msg) {
                console.error(`Setting load error: ${error_msg}`);
            }
            this.save();
        }
        eventBus.publish(eventBus.EventSettingLoaded, {});
    }

    async save() {
        //检查一下默认笔记本是否在黑名单中，如果在，则移除
        let defaultNodebook = notebooks.default;
        if (!defaultNodebook) {
            return;
        }
        let flag = this.settings['NotebookBlacklist']?.[defaultNodebook.id];
        if (flag === true) {
            this.settings['NotebookBlacklist'][defaultNodebook.id] = false;
        }

        let json = JSON.stringify(this.settings);
        console.debug(`写入配置文件: ${json}`);
        this.plugin.saveData(SettingFile, json);
    }
}

export const settings: SettingManager = new SettingManager();

const ReserveFile = 'Reservation.json';

class ReservationManger {
    plugin: DailyNoteTodayPlugin;
    reserved: Map<string, string>;
    //@deprecated 后期把内置的缓存删掉，完全基于块属性来
    reservations: { "OnDate": { [date: string]: string[] } } = { "OnDate": {} };

    constructor() {
        this.reserved = new Map<string, string>();
    }

    /**
     * 更新预约信息, 更新预约的块对应的日期的缓存
     */
    private updateReserved() {
        for (let date in this.reservations.OnDate) {
            for (let blockId of this.reservations.OnDate[date]) {
                this.reserved.set(blockId, date);
            }
        }
    }

    /**
     * 检查块是否已经被预约, 以避免出现重复预约的情况
     * @param blockId 预约块的 ID
     * @returns 返回预约的日期，如果没有预约，则返回 undefined
     */
    findReserved(blockId: string): string | undefined {
        return this.reserved.get(blockId);
    }

    /**
     * 删除某个已经被预约的块
     * @param date 预约块预约到的日期
     * @param blockId 预约块的 ID 
     */
    removeReservation(date: string, blockId: string) {
        let index = this.reservations.OnDate[date].indexOf(blockId);
        if (index >= 0) {
            this.reservations.OnDate[date].splice(index, 1);
        }
    }

    dateTemplate(date: Date) {
        //确保日期格式为 YYYYMMDD
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        return `${year}${month < 10 ? '0' + month : month}${day < 10 ? '0' + day : day}`;
    }

    setPlugin(plugin: DailyNoteTodayPlugin) {
        this.plugin = plugin;
    }

    async load() {
        let loaded = await this.plugin.loadData(ReserveFile);
        if (loaded == null || loaded == undefined || loaded == '') {
            //如果没有配置文件，则使用默认配置，并保存
            console.debug(`没有预约文件，使用默认配置`)
        } else {
            //如果有配置文件，则使用配置文件
            console.log(`读入预约文件: ${ReserveFile}`)
            console.log(loaded);
            if (typeof loaded === 'string') {
                loaded = JSON.parse(loaded);
            }
            try {
                for (let key in loaded) {
                    this.reservations[key] = loaded[key];
                }
            } catch (error_msg) {
                console.error(`Setting load error: ${error_msg}`);
            }
        }
        await this.syncWithBlock();
        this.doPurgeExpired();
        this.updateReserved();
        this.save();
    }

    async syncWithBlock() {
        let reservations: Reservation[] = await retrieveResvFromBlocks('future');
        for (let reservation of reservations) {
            let blockId = reservation.id;
            let date = reservation.date;
            if (!(date in this.reservations.OnDate)) {
                this.reservations.OnDate[date] = [];
            }
            if (this.reservations.OnDate[date].indexOf(blockId) < 0) {
                this.reservations.OnDate[date].push(blockId);
            }
            this.reserved.set(blockId, date);
        }
    }

    save() {
        let json = JSON.stringify(this.reservations);
        console.debug(`写入预约文件: ${json}`);
        this.plugin.saveData(ReserveFile, json);
    }

    //添加预约
    doReserve(date: Date, blockId: string) {
        // YYYYMMDD
        console.debug(`预约: ${blockId} 到 ${date}`);

        let reserved = this.findReserved(blockId);
        if (reserved) {
            this.removeReservation(reserved, blockId);
            console.debug(`已经预约到 ${reserved} 的 ${blockId} , 现在删除原来的预约`);
        }
        let date_str = this.dateTemplate(date);
        //如果没有这个日期的预约，则创建
        if (!(date_str in this.reservations.OnDate)) {
            this.reservations.OnDate[date_str] = [];
        }
        if (this.reservations.OnDate[date_str].indexOf(blockId) < 0) {
            this.reservations.OnDate[date_str].push(blockId);
        }
        this.reserved.set(blockId, date_str);
    }

    async isTodayReserved(): Promise<boolean> {
        let resv = await this.getTodayReservations();
        return resv.length > 0;
    }

    //获取今天的预约
    async getTodayReservations(): Promise<string[]> {
        let reservations: Reservation[] = await retrieveResvFromBlocks('today');
        return reservations.map(r => r.id);
    }

    //清理已经过期的预约
    doPurgeExpired() {
        let date = new Date();
        let date_str = this.dateTemplate(date);
        let datenum = parseInt(date_str);
        for (let key in this.reservations.OnDate) {
            if (parseInt(key) + 2 < datenum) {
                delete this.reservations.OnDate[key];
            }
            if (this.reservations.OnDate[key]?.length === 0) {
                delete this.reservations.OnDate[key];
            }
        }
    }

    //删除所有空掉的块
    async doPrune() {
        let allBlockId: Set<string> = new Set();
        for (const date of Object.keys(this.reservations.OnDate)) {
            for (const blockId of this.reservations.OnDate[date]) {
                allBlockId.add(blockId);
            }
        }
        if (allBlockId.size == 0) {
            return;
        }
        let allBlockIdArray = Array.from(allBlockId);
        let existsBlockIds: Set<string> = await filterExistsBlocks(allBlockIdArray);
        // console.log(allBlockIdArray, existsBlockIds);
        const OnDate = this.reservations.OnDate;
        for (const date of Object.keys(OnDate)) {
            const before = OnDate[date];
            OnDate[date] = OnDate[date].filter(blockId => existsBlockIds.has(blockId));
            console.debug(`Filter ${date}: [${before}] --> [${OnDate[date]}]`)
        }
        this.save();
    }
}

export const reservation: ReservationManger = new ReservationManger();

