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

    onSyncEndBindThis = this.onSyncEnd.bind(this);

    flag = {
        hasOpened: false,

        openOnStart: false,
        autoOpenAfterSync: false,

        isSyncChecked: false,
        hasCheckSyncFor: 0
    }

    constructor(plugin: DailyNoteTodayPlugin) {
        this.plugin = plugin;
        this.eventBus = plugin.eventBus;

        this.flag.openOnStart = settings.get('OpenOnStart');
        this.flag.autoOpenAfterSync = settings.get('AutoOpenAfterSync');

        this.checkDuplicateDiary_Debounce = debouncer.debounce(
            this.checkDuplicateDiary.bind(this), 2000, 'CheckDuplicateDiary'
        );  // 防抖, 避免频繁检查
    }

    bindSyncEvent() {
        this.eventBus.on('sync-end', this.onSyncEndBindThis);
    }

    unbindSyncEvent() {
        this.eventBus.off('sync-end', this.onSyncEndBindThis);
    }

    async onPluginLoad() {

        const SYNC_ENABLED = window.siyuan.config.sync.enabled;
        if (!SYNC_ENABLED) {
            //Case 1: 如果思源没有开启同步, 就直接创建, 并无需绑定同步事件
            await this.tryToOpen();
        } else if (this.flag.autoOpenAfterSync === false) {
            //Case 2: 如果思源开启了同步, 但是用户没有设置在同步后打开, 就直接创建
            this.bindSyncEvent();
            this.tryToOpen();
        } else {
            //Case 3: 如果思源开启了同步, 并且用户设置了在同步后打开, 就绑定同步事件
            this.bindSyncEvent();
        }
    }

    async onSyncEnd({ detail }) {
        console.debug('sync-end', detail);

        if (this.flag.hasOpened === false && this.flag.autoOpenAfterSync === true) {
            this.tryToOpen();
        }

        if (!this.flag.isSyncChecked) {
            this.checkDuplicateDiary_Debounce();
        }
    }


    public resetSyncCheckStatus() {
        this.flag.isSyncChecked = false; //重置同步检查状态
        this.flag.hasCheckSyncFor = 0; //重置同步检查次数
        this.flag.hasOpened = false; //重置是否已经打开
    }

    /********** Duplicate **********/
    private async checkDuplicateDiary() {
        let hasDuplicate = await checkDuplicateDiary();
        if (hasDuplicate) {
            this.flag.isSyncChecked = true;
            this.unbindSyncEvent();
        }
        this.flag.hasCheckSyncFor++;
        //多次检查后，如果还是没有同步，则认为没有必要再检查了
        if (this.flag.hasCheckSyncFor >= MAX_CHECK_SYNC_TIMES) {
            this.flag.isSyncChecked = true;
            console.debug('关闭自动检查同步文件');
            this.unbindSyncEvent();
        }
    }
    private checkDuplicateDiary_Debounce: typeof this.checkDuplicateDiary = null;

    private async tryToOpen() {
        if (this.flag.openOnStart === false) return;
        await autoOpenDailyNote();
        this.flag.hasOpened = true;
        setTimeout(() => {
            this.checkDuplicateDiary();
        }, 1500);
    }

}
