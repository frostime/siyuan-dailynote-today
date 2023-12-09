/**
 * Copyright (c) 2023 frostime all rights reserved.
 */
import { settings } from '@/global-status';
import { autoOpenDailyNote, checkDuplicateDiary } from './dailynote';

import type DailyNoteTodayPlugin from '@/index';
import type { EventBus } from 'siyuan';
import { debouncer } from '@/utils';

export * from './dailynote';
export * from './misc';
export * from './reserve';


// const WAIT_TIME_FOR_SYNC_CHECK: Milisecond = 1000 * 60 * 5;
const MAX_CHECK_SYNC_TIMES: number = 10; //为了避免每次同步都检查，最多检查10次

/**
 * 处理插件加载完成后一系列关于日记、同步、预约等复杂的逻辑
 */
export class StartupEventHandler {
    plugin: DailyNoteTodayPlugin;
    eventBus: EventBus;

    //About sync
    isSyncChecked = false;
    hasCheckSyncFor: number = 0;

    onSyncEndBindThis = this.onSyncEnd.bind(this);

    constructor(plugin: DailyNoteTodayPlugin) {
        this.plugin = plugin;
        this.eventBus = plugin.eventBus;

        // this.openOnStart = settings.get('OpenOnStart');
        // this.autoOpenAfterSync = settings.get('AutoOpenAfterSync');
    }

    bindSyncEvent() {
        this.eventBus.on('sync-end', this.onSyncEndBindThis);
    }

    unbindSyncEvent() {
        this.eventBus.off('sync-end', this.onSyncEndBindThis);
    }

    async onPluginLoad() {
        // const SYNC_ENABLED = window.siyuan.config.sync.enabled;
        //如果思源没有开启同步, 就直接创建
        await autoOpenDailyNote();
        this.checkDuplicateDiary();
        this.checkDuplicateDiary_Debounce = debouncer.debounce(
            this.checkDuplicateDiary.bind(this), 2000, 'CheckDuplicateDiary'
        );  // 防抖, 避免频繁检查

        this.bindSyncEvent();

    }

    onSyncEnd({ detail }) {
        console.log('sync-end', detail);
        console.info('onSyncEnd', detail);
        if (!this.isSyncChecked) {
            this.checkDuplicateDiary_Debounce();
        }
    }


    public resetSyncCheckStatus() {
        this.isSyncChecked = false; //重置同步检查状态
        this.hasCheckSyncFor = 0; //重置同步检查次数
    }

    /********** Duplicate **********/
    private async checkDuplicateDiary() {
        let hasDuplicate = await checkDuplicateDiary();
        if (hasDuplicate) {
            this.isSyncChecked = true;
            this.unbindSyncEvent();
        }
        this.hasCheckSyncFor++;
        //多次检查后，如果还是没有同步，则认为没有必要再检查了
        if (this.hasCheckSyncFor >= MAX_CHECK_SYNC_TIMES) {
            this.isSyncChecked = true;
            console.debug('关闭自动检查同步文件');
            this.unbindSyncEvent();
        }
    }
    private checkDuplicateDiary_Debounce: typeof this.checkDuplicateDiary = null;
}
