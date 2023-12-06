import { Dialog } from "siyuan";
import { searchAndSetAllDNAttr } from '@/func';
import notebooks from "@/global-notebooks";

/**
 * 帮用户设置过去的日记的属性
 */
export const setDNAttrDialog = async () => {
    const dialog = new Dialog({
        title: 'Running',
        content: `
<div class="b3-dialog__content">
    <div id="body" style="padding: 6px 12px;">
        <ul id="notebooks">
        </ul>
    </div>
</div>`,
        width: "20em",
        height: "20em",
    });
    let div: HTMLDivElement = dialog.element.querySelector(".b3-dialog__container");
    div.style.maxHeight = "50%";
    let ul: HTMLUListElement = dialog.element.querySelector("#body > ul#notebooks");
    for (let notebook of notebooks) {
        if (notebook.dailynoteSprig === undefined || notebook.dailynoteSprig === '') {
            continue;
        }
        let li = document.createElement('li');
        li.innerHTML = `<b>${notebook.name}...</b>`;
        ul.appendChild(li);
        let ans = await searchAndSetAllDNAttr(notebook);
        li.innerHTML = `<b>${notebook.name}</b>: <b>${ans?.length ?? 0}</b> daily notes.`;
    }
    let body = dialog.element.querySelector("#body");
    let hint = document.createElement('div');
    hint.innerText = 'All Done!';
    hint.style.color = 'var(--b3-theme-primary)';
    hint.style.fontWeight = 'bold';
    body.appendChild(hint);
};

