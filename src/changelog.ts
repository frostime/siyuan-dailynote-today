import { Dialog, isMobile } from "siyuan";
import { i18n } from "./utils";
import * as serverApi from "./serverApi";

// const logs = {
//     "更新日志": {
//         '1.0.6': `<blockquote><p>本次更新，主要增加了自定义菜单的触发方法, <b>思源 2.8.9 版本可用</b></p></blockquote><ul><li>思源在 2.8.9 版本更新后，开放了点击块菜单的 API，因此今日笔记在这个版本将之前通过 Alt + 右键唤出「移动块」的功能复制了一份到正规的菜单当中。你可以左键点击块的 icon 然后在下方看到「今日笔记」的菜单栏目</li><li>为了兼容没有升级思源的用户，之前的 alt + 右键的方法依然保留</li><li>旧有的 Alt + 右键功能仍然保留一段时间，但是这是一个历史遗留功能且存在一些棘手的小问题，所以仍然预计会未来正式从插件中移除（预计在思源发布 2.9 版本后）</li><li>如果在你的工作中用不到移动块的功能，可以在设置中将其关闭</li></ul>`
//     },
//     "ChangeLog": {
//         '1.0.6': `<blockquote><p>This update adds a new menu trigger method, <b>available in SiYuan version 2.8.9</b></p></blockquote><ul><li>With the 2.8.9 update, Siyuan has opened up the API for clicking on block icon to start a menu, so with this release we has copied the previous ability to call up a &#39;move block&#39; by Alt + Right click into the regular menu. You can left click on the block icon and see the Notes of the Day menu section below</li><li>For compatibility with users who have not upgraded to SiYuan, the previous alt + right click method remains</li><li>The old Alt + Right click functionality will remain for a while, but it is a legacy feature and has some niggling issues, so it is still expected to be officially removed from the plugin in the future (expected after the release of SiYuan 2.9)</li><li>If you don&#39;t use the ability to move blocks in your work, you can turn it off in the settings</li></ul>`
//     }
// }


function showTypoDialog(title: string, typo: string, width?: string) {
    new Dialog({
        title: title,
        content: `<div id="dialog" class="b3-typography" style="margin: 2rem">${typo}</div>`,
        width: width
    });
}


export async function showChangeLog(version: string) {
    try {
        let file = await serverApi.getFile(
            `/data/plugins/siyuan-dailynote-today/i18n/${i18n.ChangeLog.file}-${version}`
        );
        let lute = window.Lute!.New();
        let content = lute.Md2HTML(file);
        if (content !== undefined) {
            showTypoDialog(
                `${i18n.Name} v${version}`,
                content,
                isMobile() ? "92vw" : "520px"
            );
        }
    } catch (err) {
        
    }
    
}
