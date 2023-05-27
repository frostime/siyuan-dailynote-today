import { Dialog, isMobile } from "siyuan";
import { i18n, lute } from "./utils";
import * as serverApi from "./serverApi";


function showTypoDialog(title: string, typo: string, width?: string) {
    new Dialog({
        title: title,
        content: `<div id="dialog" class="b3-typography" style="margin: 2rem">${typo}</div>`,
        width: width,
        height: "50%"
    });
}


export async function showChangeLog(version: string) {
    try {
        const path = `/data/plugins/siyuan-dailynote-today/i18n/${i18n.ChangeLog.file}-${version}.md`;
        // const path = `/data/plugins/siyuan-dailynote-today/i18n/CHANGELOG_zh_CN-1.0.6.md`;
        let file: string = await serverApi.getFile(path);
        let code404 = file.match(/"code":404/g);
        if (code404 !== null) {
            console.log(`找不到更新文件：${path}`);
            return;
        }

        let content = lute.Md2HTML(file);
        showTypoDialog(
            `${i18n.Name} v${version}`,
            content,
            isMobile() ? "92vw" : "60%"
        );
    } catch (err) {
        
    }
    
}
