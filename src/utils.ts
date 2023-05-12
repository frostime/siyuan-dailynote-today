/**
 * Copyright (c) 2023 frostime. All rights reserved.
 */

export function info(...msg: any[]): void {
    console.log(`[DailyNoteToday][INFO] ${msg}`);
}

export function error(...msg: any[]): void {
    console.log(`[DailyNoteToday][ERROR] ${msg}`);
}

export function warn(...msg: any[]): void {
    console.log(`[DailyNoteToday][WARN] ${msg}`);
}

export let i18n: any;
export function setI18n(i18n_: any) {
    i18n = i18n_;
}

const _MultiLangText = {
    'zh-CN': {
        ToolbarAriaLabel: "今日笔记",
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
                title: "笔记本排序方案",
                text: "1. 和当前文档树的显示保持一致 2. 和在自定义排序中的设置保持一致",
                options: {
                    'doc-tree': '和文档树一致',
                    'custom-sort': '和自定义排序一致'
                }
            },
            {
                title: "工具栏展示方案",
                text: "插件在工具栏上的显示方案，下拉框 or 图标，重启后生效",
                options: {
                    "select": "下拉选项框",
                    "menu": "菜单图标"
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
        ToolbarAriaLabel: "Daily Note Today",
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
                title: "Notebook Sorting Scheme",
                text: "1. Same what document tree shows 2. Same the order defined in custom sorting mode",
                options: {
                    'doc-tree': 'Same as document tree',
                    'custom-sort': 'Same as custom sorting'
                }
            },
            {
                title: "Toolbar Display Scheme",
                text: "The display scheme of the plugin on the toolbar, drop-down selector or icon, effective after restart",
                options: {
                    "select": "Drop-down selector",
                    "menu": "Menu icon"
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
