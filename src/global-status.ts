/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-05-21 14:14:08
 * @FilePath     : /src/global-status.ts
 * @LastEditTime : 2025-01-24 18:07:54
 * @Description  : 
 */
import { eventBus } from './event-bus';
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
        // AutoOpenAfterSync: false as boolean, //在第一次同步之后再自动打开日记
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
        console.debug(`写入配置文件: ${JSON.stringify(this.settings, null, 2)}`);
        this.plugin.saveData(SettingFile, json);
    }
}

export const settings: SettingManager = new SettingManager();

