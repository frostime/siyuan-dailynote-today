/*
 * Copyright (c) 2023 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2023-12-04 18:48:59
 * @FilePath     : /src/components/set-past-dn-attr.ts
 * @LastEditTime : 2024-05-05 20:56:33
 * @Description  : 
 */
import { Dialog, confirm, showMessage } from "siyuan";
import { searchAndSetAllDNAttr, findoutEarliestDN, formatDate } from '@/func';
import notebooks from "@/global-notebooks";
import { i18n, render } from "@/utils";

/**
 * 帮用户设置过去的日记的属性
 */
export const setDNAttrDialog = async () => {
    let I18nHere = i18n.SetPastDN;
    const dialog = new Dialog({
        title: I18nHere.title,
        content: `
<div class="b3-dialog__content" style="display: flex; flex-direction: column; flex: 1; overflow: unset;">
    <div id="body" style="padding: 6px 12px; width: 100%; flex: 1;">
        <table id="notebooks" cellpadding="10" style="width: 100%;">
            <thead>
                <tr style="text-align: left;">
                    <th>${I18nHere.thead[0]}</th>
                    <th>${I18nHere.thead[1]}</th>
                    <th>${I18nHere.thead[2]}</th>
                    <th>${I18nHere.thead[3]}</th>
                </tr>
            </thead>
            <tbody>

            </tbody>
        </table>
        <div class="hint b3-label__text" style="border-top: 1px solid var(--b3-border-color); padding-top: 5px;">
            ${I18nHere.hint.initial}
        </div>
    </div>
    <div class="b3-dialog__action">
        <button class="b3-button b3-button--cancel">❌ ${window.siyuan.languages.cancel}</button>
        <span class="fn__space"></span>
        <button class="b3-button b3-button--text" data-method="Start">${I18nHere.button.start}</button>
    </div>
</div>`,
        width: "50em",
        height: "27em",
    });
    let div: HTMLDivElement = dialog.element.querySelector(".b3-dialog__container");
    div.style.maxHeight = "50%";
    let table: HTMLTableElement = dialog.element.querySelector("#body > table#notebooks");

    let ealiestDoc = new Map<NotebookId, {start: Date, notebook: Notebook, tr: HTMLTableRowElement}>();
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
            <td class="td-start-date" style="color: var(--b3-theme-primary);">${formatDate(start, '-')}</td>
            <td class="td-dn-cnt">...</td>
            <td class="td-enable"><input class="b3-switch fn__flex-center" type="checkbox" checked/></td>
        </tr>`;
        table.appendChild(tr);
        tr.querySelector('.td-start-date').addEventListener('click', async (e) => {
            let button = e.target as HTMLButtonElement;
            let tr = button.parentElement.parentElement;
            let tdDate = tr.querySelector('.td-start-date') as HTMLTableCellElement;
            let date = tdDate.innerText;
            const input = `<input class="b3-text-field" style="width: 100%;" placeholder="格式: 2023-12-31" value="${date}"/>`;
            confirm(I18nHere.setdate.title, input, async (dialog: Dialog) => {
                let newDate = dialog.element.querySelector('input').value;
                let pattern = /^\d{4}-\d{2}-\d{2}$/;
                if (!pattern.test(newDate)) {
                    showMessage(I18nHere.setdate.error, 3000, 'error');
                    return;
                }
                try {
                    let date = new Date(newDate);
                    tdDate.innerText = formatDate(date, '-');
                    let obj = ealiestDoc.get(notebook.id);
                    obj.start = date;
                } catch (e) {
                    showMessage(I18nHere.setdate.error, 3000, 'error');
                }
            });
        });
        ealiestDoc.set(notebook.id, {start, notebook, tr});
    }
    let btnStart = dialog.element.querySelector("button[data-method='Start']");
    btnStart.addEventListener('click', async () => {
        btnStart.setAttribute('disabled', 'true');
        let hint = dialog.element.querySelector('.hint') as HTMLDivElement;
        hint.style.color = 'var(--b3-theme-primary)';
        hint.style.fontWeight = 'bold';
        hint.innerText = I18nHere.hint.going;
        for (let {start, notebook, tr} of ealiestDoc.values()) {
            if ((tr.querySelector('.td-enable input') as HTMLInputElement).checked === false) {
                continue;
            }
            let ans = await searchAndSetAllDNAttr(notebook, start);
            (tr.querySelector('.td-dn-cnt') as HTMLTableCellElement).innerText = `${ans.length}`;
        }
        hint.innerText = I18nHere.hint.end;
        btnStart.innerHTML = I18nHere.button.end;
        btnStart.removeAttribute('disabled');
        btnStart.addEventListener('click', () => {
            dialog.destroy();
        });
    });
    dialog.element.querySelector("button.b3-button--cancel").addEventListener("click", () => {
        dialog.destroy();
    });
};

