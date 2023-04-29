import { Menu, MenuItem } from "siyuan";
import { openDiary } from "../func";
import { settings } from "../setting";
import { Notebook } from "../types";

import  Select  from "./select.svelte";

const TOOLBAR_ITEMS = 'toolbar__item b3-tooltips b3-tooltips__sw';

export class ToolbarSelectItem {
    div_select: HTMLElement;
    component_select: Select;
    notebooks: Notebook[];

    constructor (notebooks: Notebook[]) {
        this.div_select = document.createElement('div');
        this.div_select.setAttribute('aria-label', 'Open Today\'s Diary');
        this.div_select.classList.add(...TOOLBAR_ITEMS.split(/\s/));
        this.div_select.style.margin = '0 0.1rem';
        this.div_select.style.padding = '0rem 0rem';

        this.notebooks = notebooks;

        this.component_select = new Select({
            target: this.div_select,
            props: {
                notebooks: notebooks
            }
        });
    }

    release() {
        this.component_select.$destroy();
        this.div_select.remove();
    }

    bindEvent(event: 'openSelector' | 'openDiary', callback: any) {
        this.component_select.$on(event, callback);
    }

    /**
     * 初始化的时候，加载所有的笔记本
     */
    autoOpenDailyNote() {
        if (this.notebooks.length > 0) {
            this.component_select.$set({ selected: this.notebooks[0].id });

            if (settings.settings.OpenOnStart === true) {
                openDiary(this.notebooks[0]);
            }
        }
    }

    updateNotebooks(notebooks: Notebook[]) {
        this.notebooks = notebooks;
        this.component_select.$set({ notebooks: notebooks });
    }

    updateDailyNoteStatus(diaryStatus: Map<string, boolean>) {
        this.component_select.$set({ diaryStatus: diaryStatus });
    }
}
