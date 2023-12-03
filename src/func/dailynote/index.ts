/*
 * Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 * @Author       : Yp Z
 * @Date         : 2023-06-16 21:00:30
 * @FilePath     : /src/func/dailynote/index.ts
 * @LastEditTime : 2023-12-03 12:09:06
 * @Description  : 
 */
import { settings } from '@/global-status';

import type DailyNoteTodayPlugin from '@/index';
export * from './basic';
export * from './open-dn';
export * from './handle-duplicate';
export * from './dn-attr';
export * from './past-dn';

//@ts-ignore
const SYNC_ENABLED = window.siyuan.config.sync.enabled;

export class AutoOpenDailyNoteHandler {
    plugin: DailyNoteTodayPlugin;
    openOnStart: boolean;
    autoOpenAfterSync: boolean;

    constructor(plugin: DailyNoteTodayPlugin) {
        this.plugin = plugin;
        this.openOnStart = settings.get('OpenOnStart');
        this.autoOpenAfterSync = settings.get('AutoOpenAfterSync');
    }

    onPluginLoad() {
        //如果思源没有开启
        if (SYNC_ENABLED === false) {

        }
    }
}

