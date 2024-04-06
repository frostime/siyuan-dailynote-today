/**
 * Copyright (c) 2023 frostime all rights reserved.
 */
import { reservation, settings } from '@/global-status';
import { autoOpenDailyNote, checkDuplicateDiary } from './dailynote';

import type DailyNoteTodayPlugin from '@/index';
import type { EventBus } from 'siyuan';
import { debouncer } from '@/utils';
import { updateTodayReservation } from './reserve';
import { updateStyleSheet } from './style';
import notebooks from '@/global-notebooks';

export * from './dailynote';
export * from './misc';
export * from './reserve';
export * from './style';


// const WAIT_TIME_FOR_SYNC_CHECK: Milisecond = 1000 * 60 * 5;
const MAX_CHECK_SYNC_TIMES: number = 10; //为了避免每次同步都检查，最多检查10次

/**
 * 处理插件加载完成后一系列关于日记、同步、预约等复杂的逻辑
 */
export class RoutineEventHandler {
    plugin: DailyNoteTodayPlugin;
    eventBus: EventBus;

    onSyncEndBindThis = this.onSyncEnd.bind(this);

    flag = {
        hasOpened: false,

        openOnStart: false,
        autoOpenAfterSync: false,

        isSyncChecked: false,
        hasCheckSyncFor: 0,

        hasAutoInsertResv: false //今天是否已经自动插入了预约
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

        this.updateResvIconStyle();
        const SYNC_ENABLED = window.siyuan.config.sync.enabled;
        if (!SYNC_ENABLED) {
            //Case 1: 如果思源没有开启同步, 就直接创建, 并无需绑定同步事件
            await this.tryAutoOpenDN();
        } else if (this.flag.autoOpenAfterSync === false) {
            //Case 2: 如果思源开启了同步, 但是用户没有设置在同步后打开, 就直接创建
            this.bindSyncEvent();
            await this.tryAutoOpenDN();
        } else {
            //Case 3: 如果思源开启了同步, 并且用户设置了在同步后打开, 就绑定同步事件
            this.bindSyncEvent();
        }
    }

    async onSyncEnd({ detail }) {
        console.debug('on-sync-end');

        if (this.flag.hasOpened === false && this.flag.autoOpenAfterSync === true) {
            this.tryAutoOpenDN();
        }

        if (!this.flag.isSyncChecked) {
            this.checkDuplicateDiary_Debounce();
        }
    }


    public resetStatusFlag() {
        this.flag.isSyncChecked = false; //重置同步检查状态
        this.flag.hasCheckSyncFor = 0; //重置同步检查次数

        this.flag.hasOpened = false; //重置是否已经打开

        this.flag.hasAutoInsertResv = false; //重置是否已经插入预约
    }

    /**
     * 如果今天有预约，就在 head 中插入特殊的样式
     */
    public updateResvIconStyle() {
        const HighlightResv = settings.get('HighlightResv');
        if (!HighlightResv) return;

        if (reservation.isTodayReserved()) {
            updateStyleSheet(`
                span[data-type="siyuan-dailynote-todaydock_tab"][data-title="${this.plugin.i18n.DockReserve.arial}"] {
                    background-color: var(--b3-theme-primary-lightest);
                }
            `);
        } else {
            updateStyleSheet('');
        }
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

    /**
     * 尝试自动打开日记
     */
    private async tryAutoOpenDN() {
        if (this.flag.openOnStart === false) return;
        await autoOpenDailyNote();
        this.flag.hasOpened = true;
        //在自动打开日记后一段时间后，进行相关的检查处理
        setTimeout(() => {
            this.tryAutoInsertResv();
            this.checkDuplicateDiary();
        }, 1500);
    }

    /**
     * 尝试自动插入今天的预约
     */
    public async tryAutoInsertResv() {
        //如果已经插入过了，就不再插入
        if (this.flag.hasAutoInsertResv === true) return;

        //如果今天没有预约，就不插入
        if (!reservation.isTodayReserved()) return;

        let succeed = updateTodayReservation(notebooks.default);

        if (succeed) {
            this.flag.hasAutoInsertResv = true;
        }

    }

}
