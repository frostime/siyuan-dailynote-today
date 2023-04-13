import { clientApi } from 'siyuan';

export const logger = clientApi.createLogger('OpenDiaryToday');

export function info(...msg: any[]): void {
    logger.info(...msg);
}

export function error(...msg: any[]): void {
    logger.error(...msg);
}

export function warn(...msg: any[]): void {
    logger.warn(...msg);
}

export const TextContent = {
    'zh-CN': {
        Setting: [
            {
                title: "自动打开 Daily Note",
                text: "插件启动后自动打开今日的 Daily Note"
            },
            {
                title: "更新笔记本状态",
                text: "在笔记本配置发生变化的时候更新其状态，也可以使用注册的快捷键 Ctrl+Alt+U"
            }
        ]
    },
    "en-US": {
        Setting: [
            {
                title: "Open Today's Diary Automatically",
                text: "Open Today's Diary automatically when the plugin is loaded"
            },
            {
                title: "Update Notebook Status",
                text: "Update the status of the notebook when the notebook configuration changes, or use the registered shortcut Ctrl+Alt+U"
            }
        ]
    }
}
