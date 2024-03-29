/*
 * Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 * @Author       : Yp Z
 * @Date         : 2023-06-03 23:36:46
 * @FilePath     : /src/global-notebooks.ts
 * @LastEditTime : 2023-08-06 18:07:20
 * @Description  : 
 */
import { queryNotebooks } from './func';
import { settings } from './global-status';


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

    updateDefault() {
        let notebookId: string = settings.get('DefaultNotebook');
        notebookId = notebookId.trim();
        if (notebookId != '') {
            let notebook = this.find(notebookId);
            if (notebook) {
                this.default = notebook;
            } else {
                // confirm(i18n.Name, `${notebookId} ${i18n.InvalidDefaultNotebook}`);
                this.default = undefined;
            }
        } else {
            this.default = this.get(0);
        }
    }

}

const notebooks = new Notebooks();
export default notebooks;
