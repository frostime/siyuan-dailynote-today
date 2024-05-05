/*
 * Copyright (c) 2023 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2023-12-04 18:48:59
 * @FilePath     : /src/components/set-past-dn-attr.ts
 * @LastEditTime : 2024-05-05 20:36:56
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
    const dialog = new Dialog({
        title: 'Running',
        content: `
<div class="b3-dialog__content" style="display: flex; flex-direction: column; flex: 1; overflow: unset;">
    <div id="body" style="padding: 6px 12px; width: 100%; flex: 1;">
        <table id="notebooks" cellpadding="10" style="width: 100%;">
            <thead>
                <tr style="text-align: left;">
                    <th>Notebook</th>
                    <th>开始日期<span style="font-size: 0.8em;">(点击可手动设置)</span></th>
                    <th>日记数量</th>
                </tr>
            </thead>
            <tbody>

            </tbody>
        </table>
        <div class="hint b3-label__text" style="border-top: 1px solid var(--b3-border-color); padding-top: 5px;">
            📚 插件已经自动探寻到所有笔记本中最早的日记的日期。<br/>
            🚀 你现在可以点击「开始」按钮来为所有在这个时间范围内的日记添加自定义属性。<br/>
            ⚙️ 如果你认为自动探查到的开始日期不正确，你可以点击「开始日期」列中的单元手动进行设置。
        </div>
    </div>
    <div class="b3-dialog__action">
        <button class="b3-button b3-button--cancel">❌ ${window.siyuan.languages.cancel}</button>
        <span class="fn__space"></span>
        <button class="b3-button b3-button--text" data-method="Start">🚀 开始设置!</button>
    </div>
</div>`,
        width: "50em",
        height: "25em",
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
        </tr>`;
        table.appendChild(tr);
        tr.querySelector('.td-start-date').addEventListener('click', async (e) => {
            let button = e.target as HTMLButtonElement;
            let tr = button.parentElement.parentElement;
            let tdDate = tr.querySelector('.td-start-date') as HTMLTableCellElement;
            let date = tdDate.innerText;
            const input = `<input class="b3-text-field" style="width: 100%;" placeholder="格式: 2023-12-31" value="${date}"/>`;
            confirm('手动设置开始日期', input, async (dialog: Dialog) => {
                let newDate = dialog.element.querySelector('input').value;
                let pattern = /^\d{4}-\d{2}-\d{2}$/;
                if (!pattern.test(newDate)) {
                    showMessage('日期格式错误!', 3000, 'error');
                    return;
                }
                try {
                    let date = new Date(newDate);
                    tdDate.innerText = formatDate(date, '-');
                    let obj = ealiestDoc.get(notebook.id);
                    obj.start = date;
                } catch (e) {
                    showMessage('日期格式错误!', 3000, 'error');
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
        hint.innerText = '🕑 设置中...';
        for (let {start, notebook, tr} of ealiestDoc.values()) {
            let ans = await searchAndSetAllDNAttr(notebook, start);
            (tr.querySelector('.td-dn-cnt') as HTMLTableCellElement).innerText = `${ans.length}`;
        }
        hint.innerText = '✅ 全部设置完成!';
        btnStart.innerHTML = '🎉 退出!';
        btnStart.removeAttribute('disabled');
        btnStart.addEventListener('click', () => {
            dialog.destroy();
        });
    });
    dialog.element.querySelector("button.b3-button--cancel").addEventListener("click", () => {
        dialog.destroy();
    });
};

