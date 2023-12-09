/**
 * Copyright (c) 2023 frostime all rights reserved.
 */
import { settings } from '@/global-status';
import { autoOpenDailyNote } from './dailynote/open-dn';

import type DailyNoteTodayPlugin from '@/index';

export * from './dailynote';
export * from './misc';
export * from './reserve';


/**
 * 处理插件加载完成后一系列关于日记、同步、预约等复杂的逻辑
 */
export class AfterLoadedEventHandler {
    plugin: DailyNoteTodayPlugin;
    openOnStart: boolean;
    autoOpenAfterSync: boolean;

    onSyncEndBindThis = this.onSyncEnd.bind(this);

    constructor(plugin: DailyNoteTodayPlugin) {
        this.plugin = plugin;
        this.openOnStart = settings.get('OpenOnStart');
        this.autoOpenAfterSync = settings.get('AutoOpenAfterSync');
    }

    bindSyncEvent() {
        this.plugin.eventBus.on('sync-end', this.onSyncEndBindThis);
    }

    unbindSyncEvent() {
        this.plugin.eventBus.off('sync-end', this.onSyncEndBindThis);
    }

    async onPluginLoad() {
        // const SYNC_ENABLED = window.siyuan.config.sync.enabled;
        //如果思源没有开启同步, 就直接创建
        await autoOpenDailyNote();

    }

    onSyncEnd({ detail }) {
        console.log('sync-end', detail);
    }
}
