/**
 * Copyright (c) 2023 frostime. All rights reserved.
 */
import { openTab, Plugin, getFrontend, showMessage } from 'siyuan';
import Setting from './components/setting.svelte'
import ShowReserve  from './components/show-reserve.svelte';
import { ToolbarMenuItem } from './components/toolbar-menu';
import { GutterMenu } from './components/gutter-menu';
import { checkDuplicateDiary, updateTodayReservation } from './func';
import { error, info, setI18n, setIsMobile } from './utils';
import { settings, reservation } from './global-status';
import notebooks from './global-notebooks';
// import { ContextMenu } from './components/legacy-menu';
import { eventBus } from './event-bus';
import * as serverApi from './serverApi';
import { showChangeLog } from './changelog';
import "./index.scss";


let OnWsMainEvent: EventListener;
// const WAIT_TIME_FOR_SYNC_CHECK: Milisecond = 1000 * 60 * 5;
const MAX_CHECK_SYNC_TIMES: number = 10; //为了避免每次同步都检查，最多检查10次


export default class DailyNoteTodayPlugin extends Plugin {

    version: string;
    upToDate: any = null;
    enableBlockIconClickEvent: boolean = false;
    isMobile: boolean = false;

    isSyncChecked = false;
    hasCheckSyncFor: number = 0;

    toolbarItem: ToolbarMenuItem;

    component_setting: Setting;
    tab_setting: any;

    // menu: ContextMenu;
    gutterMenu: GutterMenu;

    async onload() {
        info('Plugin load');
        let start = performance.now();

        const frontEnd = getFrontend();
        this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";

        setIsMobile(this.isMobile);

        setI18n(this.i18n); //设置全局 i18n

        settings.setPlugin(this);
        reservation.setPlugin(this);

        //初始化 UI
        this.initPluginUI();

        //初始化数据
        reservation.load();
        await settings.load();
        await notebooks.init();  //依赖 settings.load();

        this.checkPluginVersion(); //依赖 settings.load();
        this.initBlockIconClickEvent();  //依赖 settings.load();

        this.initUpToDate();  //依赖 settings.load();

        eventBus.subscribe(eventBus.EventUpdateAll, () => { this.updateAll() });

        // 如果有笔记本，且设置中允许启动时打开，则打开第一个笔记本
        await this.toolbarItem.autoOpenDailyNote();

        this.checkDuplicateDiary();
        OnWsMainEvent = this.onWsMain.bind(this);
        this.eventBus.on("ws-main", OnWsMainEvent);

        let end = performance.now();
        info(`启动耗时: ${end - start} ms`);
    }

    private initPluginUI() {
        this.toolbarItem = new ToolbarMenuItem(this);

        this.tab_setting = this.addTab({
            type: "custom_tab",
            init() {
                let div: HTMLDivElement = document.createElement('div');
                this.setting = new Setting({
                    target: div
                });
                this.element.appendChild(div);
            },
            destroy() {
                this.setting.$destroy();
            }
        });

        this.addDock({
            config: {
                position: "RightBottom",
                size: {width: 200, height: 0},
                icon: "iconSaving",
                title: "Custom Dock",
            },
            data: {
                text: "This is my custom dock"
            },
            type: 'dock_tab',
            init() {
                this.element.innerHTML = '<div id="ShowResv"/>';
                new ShowReserve({
                    target: this.element.querySelector('#ShowResv')
                });
            },
            destroy() {
                console.log("destroy dock:");
            }
        });


        eventBus.subscribe('OpenSetting', this.openSetting.bind(this));
    }

    private initUpToDate() {
        this.upToDate = null;
        this.startUpdateOnNextDay();
    }

    private initBlockIconClickEvent() {
        if (settings.get("EnableMove") === true || settings.get("EnableReserve") === true) {
            // console.log(settings.get("EnableMove"));
            info('添加块菜单项目');
            this.enableBlockIconClickEvent = true;
            this.gutterMenu = new GutterMenu(this.eventBus);
        }
    }


    private async updateAll() {
        info('updateAll');
        await notebooks.update(); // 更新笔记本状态
        this.toolbarItem.updateDailyNoteStatus(); // 更新下拉框中的日记存在状态
        updateTodayReservation(notebooks.default, true);
        showMessage(this.i18n.UpdateAll, 2500, 'info');
    }

    private async checkPluginVersion() {
        try {
            let plugin_file = await serverApi.getFile('/data/plugins/siyuan-dailynote-today/plugin.json');
            if (plugin_file === null) {
                return;
            }
            plugin_file = JSON.parse(plugin_file);
            this.version = plugin_file.version;
            info(`插件版本: ${this.version}`);

            //发现更新到了不同的版本
            if (this.version !== settings.get('PluginVersion')) {
                settings.set('PluginVersion', this.version);
                showMessage(`${this.i18n.Name}${this.i18n.NewVer}: v${this.version}`, 1500, 'info');
                settings.save();
                showChangeLog(this.version);
            }
        } catch (error_msg) {
            error(`Setting load error: ${error_msg}`);
        }
    }

    private async checkDuplicateDiary() {
        let hasDuplicate = await checkDuplicateDiary();
        if (hasDuplicate) {
            this.isSyncChecked = true;
        }
        this.hasCheckSyncFor++;
        //多次检查后，如果还是没有同步，则认为没有必要再检查了
        if (this.hasCheckSyncFor >= MAX_CHECK_SYNC_TIMES) {
            this.isSyncChecked = true;
            info('关闭自动检查同步文件');
        }
    }

    private async onWsMain({ detail }) {
        let cmd = detail.cmd;
        if (cmd === 'syncing' && !this.isSyncChecked) {
            info('检查同步文件');
            this.checkDuplicateDiary();
        }
    }

    openSetting(): void {
        openTab({
            app: this.app,
            custom: {
                icon: "iconSettings",
                title: "今日笔记 Setting",
                data: {
                    text: "This is my custom tab",
                },
                fn: this.tab_setting
            }
        });
    }

    /**
     * 只要在运行，就每天 0 点更新一次
     */
    startUpdateOnNextDay() {

        //当前时间，到明天 0 点的时间间隔
        let now = new Date();
        let tomorrow = new Date();
        tomorrow.setDate(now.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        //For test
        // tomorrow.setDate(now.getDate());
        // tomorrow.setMinutes(now.getMinutes() + 1, 0, 0);

        let millisTill24 = tomorrow.getTime() - now.getTime();

        //等 0 点的时候，就更新状态
        this.upToDate = setTimeout(this.updateOnNewDay.bind(this), millisTill24);
        info(`当前时间: ${now}, 下次更新时间: ${tomorrow}, ${millisTill24} ms 后更新`);
    }

    private async updateOnNewDay() {
        await notebooks.update();
        this.toolbarItem.updateDailyNoteStatus();
        this.startUpdateOnNextDay();
        let today = new Date();
        today.toDateString();
        let msg = `${this.i18n.NewDay[0]} ${today.toLocaleDateString()} ${this.i18n.NewDay[1]}`

        this.isSyncChecked = false; //重置同步检查状态
        this.hasCheckSyncFor = 0; //重置同步检查次数

        showMessage(msg, 5000, 'info');
    }

    onunload() {
        info('Plugin unload')
        this.toolbarItem.release();
        settings.save();
        reservation.save();
        if (this.upToDate) {
            info(`清理定时器 ${this.upToDate}`);
            clearTimeout(this.upToDate);
            this.upToDate = null;
        }
        if (this.enableBlockIconClickEvent) {
            this.gutterMenu.release();
        }
    }
}


