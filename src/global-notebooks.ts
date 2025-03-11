/*
 * Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 * @Author       : Yp Z
 * @Date         : 2023-06-03 23:36:46
 * @FilePath     : /src/global-notebooks.ts
 * @LastEditTime : 2025-01-24 19:56:41
 * @Description  : 
 */
import { confirm, showMessage } from 'siyuan';
import { queryNotebooks } from './func';
import { settings } from './global-status';
import { getBlockByID } from './serverApi';
import { i18n } from './utils';

class Notebooks {
    notebooks: Array<Notebook>;
    default: Notebook;
    [key: number]: Notebook;

    constructor() {
        this.notebooks = [];
    }

    get(index: number): Notebook {
        return this.notebooks[index];
    }

    set(index: number, notebook: Notebook) {
        this.notebooks[index] = notebook;
    }

    find(id: string): Notebook | null {
        for (const notebook of this.notebooks) {
            if (notebook.id === id) {
                return notebook;
            }
        }
        return null;
    }

    [Symbol.iterator]() {
        return this.notebooks[Symbol.iterator]();
    }

    /**
     * 初始化 notebooks，了防止思源还没有加载完毕，故而需要等待
     * 只在第一次启动的时候调用
     * @calledby: this.onload()
     */
    async init(MAX_RETRY: number = 5, RETRY_INTERVAL: number = 1000) {
        let retry = 0;
        while (retry < MAX_RETRY) {
            let result = await queryNotebooks();
            if (result != null) {
                this.notebooks = result;
                break
            } else {
                await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
            }
            retry++;
        }
        this.updateDefault();
    }

    async update() {
        let result = await queryNotebooks();
        this.notebooks = result ? result : [];
        this.updateDefault();
    }

    checkNotebookId(notebookId: string) {
        let notebook = this.find(notebookId);
        if (notebook) {
            return notebook;
        }
        return null;
    }

    updateDefault() {
        let notebookId: string = settings.get('DefaultNotebook');
        notebookId = notebookId.trim();
        if (notebookId != '') {
            let notebook = this.find(notebookId);
            if (notebook) {
                this.default = notebook;
            } else {
                this.default = undefined;
                // this.correctBlockId2BoxId(notebookId).then(notebook => {
                //     if (notebook) {
                //         this.default = notebook;
                //         settings.set('DefaultNotebook', notebook.id);
                //     } else {
                //         if (warnUser) {
                //             confirm(i18n.Name, `${notebookId} ${i18n.InvalidDefaultNotebook}`);
                //         }
                //     }
                // });
                return false;
            }
        } else {
            this.default = this.get(0);
        }
        if (this.default?.closed === true) {
            showMessage(i18n.Name + ((` | 注意: 默认笔记本目前处于关闭状态!`)))
        }
        return this.default !== undefined;
    }

    private async correctBlockId2BoxId(notebookId: string) {
        const block: Block = await getBlockByID(notebookId);
        if (!block) {
            return null;
        }

        let notebook = this.find(block.box);
        if (notebook) {
            // 提示用户笔记本错误设置为块的 ID
            confirm(`${i18n.Name} Warning`, i18n.global_notebooks_ts.invalid_notebook_id_config.replace('{0}', block.content).replace('{1}', notebookId).replace('{2}', block.box));
            return notebook;
        }
        return null;
    }

}

const notebooks = new Notebooks();
export default notebooks;
