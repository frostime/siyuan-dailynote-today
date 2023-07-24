/*
 * Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 * @Author       : Yp Z
 * @Date         : 2023-07-21 19:53:04
 * @FilePath     : /src/components/libs/dialogs.ts
 * @LastEditTime : 2023-07-21 20:01:25
 * @Description  : 
 */
import { Dialog } from "siyuan";


const isMobile = () => {
    return document.getElementById("sidebar") ? true : false;
};


export const confirmDialog = (title: string, text: string, confirm?: () => void, cancel?: () => void) => {
    const dialog = new Dialog({
        title,
        content: `<div class="b3-dialog__content">
    <div class="ft__breakword">${text}</div>
</div>
<div class="b3-dialog__action">
    <button class="b3-button b3-button--cancel">${window.siyuan.languages.cancel}</button><div class="fn__space"></div>
    <button class="b3-button b3-button--text" id="confirmDialogConfirmBtn">${window.siyuan.languages.confirm}</button>
</div>`,
        width: isMobile() ? "92vw" : "520px",
    });
    const btnsElement = dialog.element.querySelectorAll(".b3-button");
    btnsElement[0].addEventListener("click", () => {
        if (cancel) {
            cancel();
        }
        dialog.destroy();
    });
    btnsElement[1].addEventListener("click", () => {
        if (confirm) {
            confirm();
        }
        dialog.destroy();
    });
    let div: HTMLDivElement = dialog.element.querySelector(".b3-dialog__container");
    div.style.maxHeight = "50%";
};