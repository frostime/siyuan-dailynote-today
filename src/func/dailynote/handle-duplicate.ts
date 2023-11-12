import * as serverApi from "@/serverApi";

import { showMessage, Dialog } from 'siyuan';
import notebooks from '@/global-notebooks';
import { error, i18n, lute, isMobile, formatBlockTime } from "@/utils";

import { getDocsByHpath } from '@/func/misc';

async function mergeDocs(docs: DocBlock[], callback?: () => void) {
    showMessage("Merge", 1000, "info");
    docs = docs.sort((a, b) => {
        return a.created >= b.created ? -1 : 1;
    });
    //选择最早的日记
    let latestDoc = docs.pop();
    // let childs: Block[] = await serverApi.getChildBlocks(latestDoc.id);
    // let lastChildBlockID = childs[childs.length - 1].id;
    let result = await serverApi.appendBlock(latestDoc.id, i18n.ConflictDiary.HeadingMarkdown, "markdown");
    let lastChildBlockID = result?.[0]?.doOperations[0].id;
    if (lastChildBlockID === undefined) {
        error(`无法获取最新日记的最后一个 block id`);
        showMessage(i18n.ConflictDiary.fail, 2000, "error");
        // dialog.destroy();
        callback();
        return latestDoc;
    }

    //将其他的日记合并到最新的日记中
    for (let doc of docs) {
        let id = doc.id;
        let created: string = doc.created;

        let time = formatBlockTime(created);
        await serverApi.renameDoc(doc.box, doc.path, `${doc.content} [${time}]`);
        await serverApi.doc2Heading(id, lastChildBlockID, true);
        console.log(`Merge doc ${id}`);
    }
    showMessage(i18n.ConflictDiary.success, 2000, "info");
    // dialog.destroy();
    callback();
    return latestDoc;
}

function buildShowDuplicateDocDom(docs: Block[], notebook: Notebook): string {

    let confilctTable = [];
    for (let doc of docs) {
        let id = doc.id;
        let created = doc.created;
        created = `${created.slice(0, 4)}-${created.slice(4, 6)}-${created.slice(6, 8)} ${created.slice(8, 10)}:${created.slice(10, 12)}:${created.slice(12, 14)}`
        let updated = doc.updated;
        updated = `${updated.slice(0, 4)}-${updated.slice(4, 6)}-${updated.slice(6, 8)} ${updated.slice(8, 10)}:${updated.slice(10, 12)}:${updated.slice(12, 14)}`
        let row = `| ${id} | ${doc.content} | ${created} | ${updated} | ${notebook.name} |\n`;
        confilctTable.push(row);
    }

    let content: string = i18n.ConflictDiary.part1.join("\n") + "\n";
    for (let row of confilctTable) {
        content += row;
    }
    content += "\n" + i18n.ConflictDiary.part2.join("\n");
    content = lute.Md2HTML(content);
    let html = `
        <div class="b3-typography typofont-1rem"
            style="margin: 0.5rem;"
        >
            ${content}
        </div>
        <div class="fn__flex b3-label" style="border-top: 1px solid var(--b3-theme-surface-lighter);">
            <div class="fn__flex-1"></div>
            <span class="fn__space"></span>
            <button class="b3-button b3-button--outline fn__flex-center fn__size200" id="merge">
                ${i18n.ConflictDiary.AutoMerge}
            </button>
        </div>
        `;
    return html;
}

/**
 * 由于同步的问题，默认的笔记本中可能出现重复的日记，这里检查下是否有重复的日记
 * @param notebook 
 * @param todayDiaryHpath 
 */
export async function checkDuplicateDiary(): Promise<boolean> {
    let notebook: Notebook = notebooks.default;
    let hpath = notebook.dailynoteHpath!;
    let docs = (await getDocsByHpath(hpath, notebook)) as DocBlock[];

    if (docs.length <= 1) {
        return false;
    }
    //莫名其妙出现了重复的 id, 所以还是去重一下
    let idSet: Set<string> = new Set();
    let uniqueDocs: Array<DocBlock> = [];
    docs.forEach((doc) => {
        if (!idSet.has(doc.id)) {
            uniqueDocs.push(doc);
            idSet.add(doc.id);
        }
    });
    docs = uniqueDocs;

    if (docs.length <= 1) {
        return false;
    }

    console.warn(`Conflict daily note: ${notebook.name} ${hpath}`);
    const html = buildShowDuplicateDocDom(docs, notebook);
    let dialog = new Dialog({
        title: i18n.Name,
        content: html,
        width: isMobile ? "80%" : "50%",
    });
    let uniqueDNDoc = null;
    dialog.element.querySelector("#merge")?.addEventListener("click", async () => {
        uniqueDNDoc = mergeDocs(docs, () => { dialog.destroy() });
    });
    return true;
}