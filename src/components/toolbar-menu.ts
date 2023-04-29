import { Menu, MenuItem } from "siyuan";
import { moveBlocksToDailyNote } from "../func";
import { settings } from "../setting";
import { Notebook } from "../types"

export class SelectMenu {
    ele: HTMLElement;
    constructor () {
        this.ele = document.createElement('button');
        this.ele.className = 'toolbar__item b3-tooltips b3-tooltips__sw';
        this.ele.setAttribute('aria-label', 'Open Today\'s Diary');
    }
}
