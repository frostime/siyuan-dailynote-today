/*
 * Copyright (c) 2023 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2023-12-04 18:48:59
 * @FilePath     : /src/components/set-past-dn-attr.ts
 * @LastEditTime : 2024-04-26 21:42:04
 * @Description  : 
 */
import { Dialog, showMessage } from "siyuan";
import { searchAndSetAllDNAttr, findoutEarliestDN, formatDate } from '@/func';
import notebooks from "@/global-notebooks";
import { i18n, render } from "@/utils";

/**
 * 帮用户设置过去的日记的属性
 */
export const setDNAttrDialog = async () => {
    const dialog = new Dialog({
        title: 'Running',
        content: `
<div class="b3-dialog__content">
    <div id="body" style="padding: 6px 12px; width: 100%;">
        <table id="notebooks" cellpadding="10" style="width: 100%;">
            <thead>
                <tr style="text-align: left;">
                    <th>Notebook</th>
                    <th>Start Date</th>
                    <th>Daily Notes</th>
                </tr>
            </thead>
            <tbody>

            </tbody>
        </table>
    </div>
</div>`,
        width: "50em",
        height: "25em",
    });
    let div: HTMLDivElement = dialog.element.querySelector(".b3-dialog__container");
    div.style.maxHeight = "50%";
    let table: HTMLTableElement = dialog.element.querySelector("#body > table#notebooks");
    for (let notebook of notebooks) {
        if (notebook.dailynoteSprig === undefined || notebook.dailynoteSprig === '') {
            continue;
        }
        let start: Date = await findoutEarliestDN(notebook);
        if (start === null) {
            let msg = render(i18n.Setting.SetPastDailyNoteAttr.empty, { notebook: notebook.name });
            showMessage(msg, 5000, 'error');
            continue;
        }
        let tr: HTMLTableRowElement = document.createElement('tr');
        tr.innerHTML = `<tr style="text-align: left;">
            <td>${notebook.name}</td>
            <td>${formatDate(start, '-')}</td>
            <td>...</td>
        </tr>`;
        table.appendChild(tr);
        let ans = await searchAndSetAllDNAttr(notebook, start);
        (tr.querySelector('td:nth-child(3)') as HTMLTableCellElement).innerText = `${ans.length}`;
    }
    let body = dialog.element.querySelector("#body");
    let hint = document.createElement('div');
    hint.innerText = 'All Done!';
    hint.style.color = 'var(--b3-theme-primary)';
    hint.style.fontWeight = 'bold';
    body.appendChild(hint);
};

