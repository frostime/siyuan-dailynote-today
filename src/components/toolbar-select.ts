import { Menu, MenuItem, clientApi } from "siyuan";
import { openDiary } from "../func";
import notebooks from "../global-notebooks";
import { settings } from "../global-setting";

import  Select  from "./select.svelte";
import { info } from "../utils";

const TOOLBAR_ITEMS = 'toolbar__item b3-tooltips b3-tooltips__sw';

export class ToolbarSelectItem {
    div_select: HTMLElement;
    component_select: Select;

    constructor () {
        this.div_select = document.createElement('div');
        this.div_select.setAttribute('aria-label', 'Open Today\'s Diary');
        this.div_select.classList.add(...TOOLBAR_ITEMS.split(/\s/));
        this.div_select.style.margin = '0 0.1rem';
        this.div_select.style.padding = '0rem 0rem';

        this.component_select = new Select({
            target: this.div_select,
            props: {
                notebooks: notebooks.notebooks
            }
        });
        clientApi.addToolbarRight(this.div_select);
    }

    release() {
        this.component_select.$destroy();
        this.div_select.remove();
        info('ToolbarSelectItem released')
    }

    bindEvent(event: 'openSelector' | 'openDiary', callback: any) {
        this.component_select.$on(event, callback);
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

    updateNotebooks() {
        this.component_select.$set({ notebooks: notebooks.notebooks });
        this.component_select.$set({ selected: notebooks.get(0).id });
    }

    updateDailyNoteStatus(diaryStatus: Map<string, boolean>) {
        this.component_select.$set({ diaryStatus: diaryStatus });
    }
}
