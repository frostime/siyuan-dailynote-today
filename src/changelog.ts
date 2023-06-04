import { Dialog } from "siyuan";
import { i18n, lute } from "./utils";
import * as serverApi from "./serverApi";


export function showTypoDialog(title: string, typo: string, width?: string) {
    new Dialog({
        title: title,
        content: `<div id="dialog" class="b3-typography" style="margin: 2rem">${typo}</div>`,
        width: width,
        height: "50%"
    });
}


export async function showChangeLog(version: string) {
    try {
        //从 version 版本号中提取主要版本号 mainVersion，比如 1.1.1-beta 或 1.1.1.patch 等，都提取出 1.1.1
        let mainVersion = version.match(/\d+\.\d+\.\d+/g)[0];
        const path = `/data/plugins/siyuan-dailynote-today/i18n/${i18n.ChangeLog.file}-${mainVersion}.md`;

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
            "60%"
        );
    } catch (err) {
        console.log('showChangeLog error:', err);
    }
    
}
