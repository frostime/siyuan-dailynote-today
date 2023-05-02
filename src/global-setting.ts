/**
 * Copyright (c) 2023 frostime. All rights reserved.
 */
import { Plugin } from 'siyuan';
import { info, error } from './utils';


type NotebookSorting = 'doc-tree' | 'custom-sort'
type NotebookView = 'Selector' | 'Menu'

class SettingManager {
    plugin: Plugin;
    settings = {
        OpenOnStart: true as boolean,
        NotebookSort: 'custom-sort' as NotebookSorting,
        NotebookView: 'Selector' as NotebookView
    };

    setPlugin(plugin: Plugin) {
        this.plugin = plugin;
    }

    get(key: string) {
        return this.settings?.[key];
    }

    set(key: string, value: any) {
        if (!(key in this.settings)) {
            error(`Setting ${key} not found`);
            return;
        }

        this.settings[key] = value;
    }

    /**
     * 导入的时候，需要先加载设置；如果没有设置，则使用默认设置
     */
    async load() {
        let loaded = await this?.plugin.loadStorage('DailyNoteToday.json');
        info(`Read storage: ${loaded}`)
        if (loaded == null) {
            //如果没有配置文件，则使用默认配置，并保存
            this.save();
        } else {
            //如果有配置文件，则使用配置文件
            loaded = JSON.parse(loaded);
            let openOnStart = loaded?.OpenOnStart;
            if (openOnStart != null) {
                this.set('OpenOnStart', openOnStart);
            }
            let notebookSort = loaded?.NotebookSort;
            if (notebookSort != null) {
                this.set('NotebookSort', notebookSort);
            }
            let notebookView = loaded?.NotebookView;
            if (notebookView != null) {
                this.set('NotebookView', notebookView);
            }
        }
    }

    save() {
        let json = JSON.stringify(this.settings);
        info(`Write storage: ${json}`);
        this.plugin.writeStorage('DailyNoteToday.json', json);
    }
}

export const settings: SettingManager = new SettingManager();
