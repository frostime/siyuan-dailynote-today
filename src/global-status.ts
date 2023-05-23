/**
 * Copyright (c) 2023 frostime. All rights reserved.
 */
import { Plugin } from 'siyuan';
import { info, error } from './utils';
import { eventBus } from './event-bus';


type NotebookSorting = 'doc-tree' | 'custom-sort'
type IconPosition = 'left' | 'right';
type SettingKey = (
    'OpenOnStart' | 'NotebookSort' | 'DefaultNotebook' | 'IconPosition' |
    'DiaryUpToDate' | 'PluginVersion' | "EnableMove"
);

interface Item {
    key: SettingKey,
    value: any
}

const SettingFile = 'DailyNoteToday.json.txt';

class SettingManager {
    plugin: Plugin;

    settings: any = {
        OpenOnStart: true as boolean, //启动的时候自动打开日记
        DiaryUpToDate: false as boolean, //自动更新日记的日期
        NotebookSort: 'doc-tree' as NotebookSorting, //笔记本排序方式
        DefaultNotebook: '', //默认笔记本的 ID
        IconPosition: 'left' as IconPosition, //图标放置位置
        PluginVersion: '',
        EnableMove: true as boolean
    };

    constructor() {
        eventBus.subscribe(eventBus.EventSetting, (data: Item) => {
            this.set(data.key, data.value);
            this.save();
        });
    }

    setPlugin(plugin: Plugin) {
        this.plugin = plugin;
    }

    get(key: SettingKey) {
        return this.settings?.[key];
    }

    set(key: any, value: any) {
        // info(`Setting update: ${key} = ${value}`)
        if (!(key in this.settings)) {
            error(`"${key}" is not a setting`);
            return;
        }

        this.settings[key] = value;
    }

    /**
     * 导入的时候，需要先加载设置；如果没有设置，则使用默认设置
     */
    async load() {
        let loaded = await this.plugin.loadData(SettingFile);
        if (loaded == null || loaded == undefined || loaded == '') {
            //如果没有配置文件，则使用默认配置，并保存
            info(`没有配置文件，使用默认配置`)
            this.save();
        } else {
            //如果有配置文件，则使用配置文件
            info(`读入配置文件: ${SettingFile}`)
            console.log(loaded);
            loaded = JSON.parse(loaded);
            try {
                for (let key in loaded) {
                    this.set(key, loaded[key]);
                }
            } catch (error_msg) {
                error(`Setting load error: ${error_msg}`);
            }
            this.save();
        }
    }

    async save() {
        let json = JSON.stringify(this.settings);
        info(`写入配置文件: ${json}`);
        this.plugin.saveData(SettingFile, json);
    }
}

export const settings: SettingManager = new SettingManager();
