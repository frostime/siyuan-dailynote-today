import { getDocsByHpath, queryNotebooks } from './func';
import { Notebook } from './types';
import { info } from './utils';


class Notebooks {
    notebooks: Array<Notebook>;
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
        console.log('find');
        for (const notebook of this.notebooks) {
            console.log(notebook.id, id);
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
        info('Notebooks init');
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
    }

    async update() {
        let result = await queryNotebooks();
        this.notebooks = result ? result : [];
    }

}

const notebooks = new Notebooks();
export default notebooks;
