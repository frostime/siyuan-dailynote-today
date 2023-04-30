import { Menu, MenuItem, clientApi } from "siyuan";
import { openDiary, currentDiaryStatus } from "../func";
import notebooks from "../global-notebooks";
import { settings } from "../global-setting";

import  Select  from "./select.svelte";
import { info } from "../utils";
import { ToolbarItem } from "./interface";

const TOOLBAR_ITEMS = 'toolbar__item b3-tooltips b3-tooltips__sw';

export class ToolbarSelectItem implements ToolbarItem {
    ele: HTMLElement;
    component_select: Select;

    constructor () {
        this.ele = document.createElement('div');
        this.ele.setAttribute('aria-label', 'Open Today\'s Diary');
        this.ele.classList.add(...TOOLBAR_ITEMS.split(/\s/));
        this.ele.style.margin = '0 0.1rem';
        this.ele.style.padding = '0rem 0rem';

        this.component_select = new Select({
            target: this.ele,
            props: {
                notebooks: notebooks.notebooks
            }
        });
        this.component_select.$on('openSelector', this.updateDailyNoteStatus.bind(this));
        this.component_select.$on('openDiary', async (event) => { 
            await openDiary(event.detail.notebook); this.updateDailyNoteStatus();
        });
        clientApi.addToolbarRight(this.ele);
    }

    release() {
        this.component_select.$destroy();
        this.ele.remove();
        info('ToolbarSelectItem released')
    }

    /**
     * 初始化的时候，加载所有的笔记本
     */
    autoOpenDailyNote() {
        if (notebooks.notebooks.length > 0) {
            this.component_select.$set({ selected: notebooks.get(0).id });

            if (settings.settings.OpenOnStart === true) {
                openDiary(notebooks.get(0));
            }
        }
    }

    updateNotebookStatus() {
        this.component_select.$set({ notebooks: notebooks.notebooks });
        this.component_select.$set({ selected: notebooks.get(0).id });
    }

    async updateDailyNoteStatus() {
        let diaryStatus: Map<string, boolean> = await currentDiaryStatus();
        this.component_select.$set({ diaryStatus: diaryStatus });
    }
}
