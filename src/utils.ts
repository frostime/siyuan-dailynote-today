/**
 * Copyright (c) 2023 frostime. All rights reserved.
 */
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

const _MultiLangText = {
    'zh-CN': {
        Setting: [
            {
                title: "自动打开 Daily Note",
                text: "插件启动后自动打开今日的 Daily Note"
            },
            {
                title: "更新笔记本状态",
                text: "在笔记本配置发生变化的时候更新其状态，也可以使用注册的快捷键 Ctrl+Alt+U"
            },
            {
                title: "下拉框内部排序方案",
                text: "1: 按照「自定义排序」模式下顺序排列；0: 按照其他模式下顺序排列",
                options: {
                    'key-sort': '和自定义排序一致',
                    'tree-show': '和文档树一致'
                }
            }
        ],
        Open: "打开日记",
        Create: "创建日记",
        UpdateAll: "笔记本状态已更新",
        Menu: {
            Move: '移动到',
        }
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
            },
            {
                title: "Sorting Scheme in Drop-down Box",
                text: "1: Sort in the order of \"Custom Sorting\" mode; 0: Sort in the order of other modes",
                options: {
                    'key-sort': 'Same as custom sorting',
                    'tree-show': 'Same as document tree'
                }
            }
        ],
        Open: "Open daily note",
        Create: "Create daily note",
        UpdateAll: "Notebook status updated",
        Menu: {
            Move: 'Move to',
        }
    }
}

const lang: string = window?.['siyuan']?.config?.lang;

let LangText = _MultiLangText['zh-CN'];
if (lang === undefined || !lang.startsWith('zh')) {
    LangText = _MultiLangText['en-US'];
}

export const StaticText = LangText;
