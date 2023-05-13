/**
 * Copyright (c) 2023 frostime. All rights reserved.
 */
import { Plugin } from 'siyuan';
import { info, error } from './utils';


type NotebookSorting = 'doc-tree' | 'custom-sort'
type NotebookView = 'Selector' | 'Menu'
type SettingKey = 'OpenOnStart' | 'NotebookSort' | 'NotebookView' | 'DefaultNotebook'

class SettingManager {
    plugin: Plugin;
    settings: any = {
        OpenOnStart: true as boolean,
        NotebookSort: 'custom-sort' as NotebookSorting,
        NotebookView: 'Selector' as NotebookView,
        DefaultNotebook: ''
    };

    setPlugin(plugin: Plugin) {
        this.plugin = plugin;
    }

    get(key: SettingKey) {
        return this.settings?.[key];
    }

    set(key: any, value: any) {
        info(`Setting update: ${key} = ${value}`)
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
        let loaded = await this?.plugin.loadData('DailyNoteToday.json');
        info(`Read storage:`)
        console.log(loaded);
        if (loaded == null || loaded == undefined || loaded == '') {
            //如果没有配置文件，则使用默认配置，并保存
            info(`Setting not found, use default setting`)
            this.save();
        } else {
            //如果有配置文件，则使用配置文件
            try {
                for (let key in loaded) {
                    this.set(key, loaded[key]);
                }
            } catch (error_msg) {
                error(`Setting load error: ${error_msg}`);
                console.log(error_msg);
            }
            this.save();
        }
    }

    save() {
        let json = JSON.stringify(this.settings);
        info(`Write storage: ${json}`);
        this.plugin.saveData('DailyNoteToday.json', json);
    }
}

export const settings: SettingManager = new SettingManager();
