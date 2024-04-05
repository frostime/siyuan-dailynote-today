import * as serverApi from "@/serverApi";

import { showMessage, Dialog } from 'siyuan';
import notebooks from '@/global-notebooks';
import { error, i18n, lute, isMobile, formatBlockTime } from "@/utils";

import { getDocsByHpath } from '@/func/misc';
import { settings } from "@/global-status";

type TDuplicateHandler = (main: DocBlock, others: DocBlock[]) => void | boolean | Promise<any>;

/**
 * 将所有其他的日记合并到主日记中
 * @param mergeTo 
 * @param otherDocs 
 * @returns 
 */
async function mergeDocs(mergeTo: DocBlock, otherDocs: DocBlock[]): Promise<boolean> {
    showMessage("Merging", 1000, "info");

    // let childs: Block[] = await serverApi.getChildBlocks(latestDoc.id);
    // let lastChildBlockID = childs[childs.length - 1].id;
    let result = await serverApi.appendBlock(mergeTo.id, i18n.ConflictDiary.HeadingMarkdown, "markdown");
    let lastChildBlockID = result?.[0]?.doOperations[0].id;
    if (lastChildBlockID === undefined) {
        error(`无法获取最新日记的最后一个 block id`);
        showMessage(i18n.ConflictDiary.fail, 2000, "error");
        // dialog.destroy();
        return false;
    }

    //将其他的日记合并到最新的日记中
    for (let doc of otherDocs) {
        let id = doc.id;
        let created: string = doc.created;

        let time = formatBlockTime(created);
        await serverApi.renameDoc(doc.box, doc.path, `${doc.content} [${time}]`);
        await serverApi.doc2Heading(id, lastChildBlockID, true);
        console.log(`Merge doc ${id}`);
    }
    // dialog.destroy();
    return true;
}

/**
 * 除了主日记外，其他的重复的日记都删除
 * @param main 
 * @param others 
 * @returns 
 */
async function deleteDocs(main: DocBlock, others: DocBlock[]): Promise<boolean> {
    showMessage("Deleting", 1000, "info");
    let allPromise = [];
    for (let doc of others) {
        allPromise.push(serverApi.removeDoc(doc.box, doc.path));
    }
    await Promise.all(allPromise);
    // dialog.destroy();
    return true;
}

/**
 * 智能合并
 */
async function smartMergeDocs(main: DocBlock, others: DocBlock[]) {
    showMessage("Smart Merging", 1000, "info");

    let result = await serverApi.appendBlock(main.id, i18n.ConflictDiary.HeadingMarkdown, "markdown");
    let lastChildBlockID = result?.[0]?.doOperations[0].id;
    if (lastChildBlockID === undefined) {
        error(`无法获取最新日记的最后一个 block id`);
        showMessage(i18n.ConflictDiary.fail, 2000, "error");
        // dialog.destroy();
        return false;
    }

    for (let doc of others) {
        let id = doc.id;
        let created: string = doc.created;
        let updated: string = doc.updated;
        let stat = await serverApi.getTreeStat(id);
        //if all value is 0
        let empty = true;
        Object.keys(stat).forEach(key => {
            if (stat[key] != 0) {
                empty = false;
            }
        });

        //空白日记, 直接删除
        if (empty) {
            await serverApi.removeDoc(doc.box, doc.path);
            console.log(`Remove empty doc ${id}`);
            continue;
        }

        const noRefLink = stat.refCount == 0 && stat.linkCount == 0;

        //如果无链接, 且创建时间和更新时间相差超过 3 秒, 大概率是模板日记, 可以直接删除
        if (noRefLink && parseInt(created) + 3 >= parseInt(updated)) {
            await serverApi.removeDoc(doc.box, doc.path);
            console.log(`Remove not modified doc ${id} ${created} ${updated}`);
        } else {
            let time = formatBlockTime(created);
            await serverApi.renameDoc(doc.box, doc.path, `${doc.content} [${time}]`);
            await serverApi.doc2Heading(id, lastChildBlockID, true);
            console.log(`Merge doc ${id}`);
        }
    }
    // dialog.destroy();
    return true;
}


const removeAttr = async (block: Block, attr: RegExp) => {
    let attrs = await serverApi.getBlockAttrs(block.id);
    let attr_to_modify = {};
    for (let key in attrs) {
        if (attr.test(key)) {
            attr_to_modify[key] = '';
        }
    }
    serverApi.setBlockAttrs(block.id, attr_to_modify);
}

const checkTrashBinDoc = async (dn: DocBlock) => {
    const sql = `
    select B.* from blocks as B join attributes as A
    on A.block_id = B.id
    where B.box = '${dn.box}' and B.type = 'd' and A.name = 'custom-dn-trash-bin'
    `;
    let result: Block[] = await serverApi.sql(sql);
    let trashBinDoc: BlockId;
    if (result.length === 0) {
        let trashBinHpath;
        let dnPathPart = dn.hpath.split("/").filter((item) => item !== "");
        console.log(dnPathPart);
        if (dnPathPart.length === 0) {
            error(`无法获取回收站日记本的路径`);
            return;
        } else if (dnPathPart.length === 1) {
            trashBinHpath = `/trash-bin`;
        } else {
            trashBinHpath = `/${dnPathPart[0]}/trash-bin`;
        }
        trashBinDoc = await serverApi.createDocWithMd(
            dn.box, trashBinHpath, i18n.TrashBinDocContent
        )
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await serverApi.setBlockAttrs(trashBinDoc, {'custom-dn-trash-bin': 'true'});
    } else {
        trashBinDoc = result[0].id;
    }
    let doc: DocBlock = await serverApi.getBlockByID(trashBinDoc);
    return doc;
}

/**
 * 将其他的日记移动到回收站
 */
async function moveToTrashBin(main: DocBlock, others: DocBlock[]) {
    let trashbin: Block = await checkTrashBinDoc(main);

    if (!trashbin) {
        showMessage(i18n.ConflictDiary.fail, 2000, "error");
        return false;
    }

    let fromPaths = [];
    others.forEach((doc) => {
        fromPaths.push(doc.path);
        removeAttr(doc, /custom-dailynote-\d+/); //移除自定义属性
    });
    serverApi.moveDocs(fromPaths, trashbin.box, trashbin.path);
    return true;
}


const HandleMethods: { [key: string]: TDuplicateHandler } = {
    'AllMerge': mergeDocs,
    'DeleteDup': deleteDocs,
    'SmartMerge': smartMergeDocs,
    'TrashDup': moveToTrashBin,
};

function buildShowDuplicateDocDom(docs: Block[], notebook: Notebook, ansestorDup?: boolean): string {

    let confilctTable = [];
    docs.forEach((doc, index) => {
        let id = doc.id;
        let created = doc.created;
        created = `${created.slice(0, 4)}-${created.slice(4, 6)}-${created.slice(6, 8)} ${created.slice(8, 10)}:${created.slice(10, 12)}:${created.slice(12, 14)}`;
        let updated = doc.updated;
        updated = `${updated.slice(0, 4)}-${updated.slice(4, 6)}-${updated.slice(6, 8)} ${updated.slice(8, 10)}:${updated.slice(10, 12)}:${updated.slice(12, 14)}`;
        let list = [id, doc.content, created, updated, notebook.name];
        if (index === docs.length - 1) {
            list = list.map((item) => `**${item}**`);
        }

        let row = list.join(" | ") + " |\n";
        confilctTable.push(row);
    });

    let content: string = i18n.ConflictDiary.part1.join("\n") + "\n";
    for (let row of confilctTable) {
        content += row;
    }
    content += "\n" + i18n.ConflictDiary.part2.join("\n");
    content = lute.Md2HTML(content);
    const MethodOptions = i18n.Setting.AutoHandleDuplicateMethod.options;
    let html = `
        <div class="b3-typography typofont-1rem"
            style="margin: 0.5rem; flex: 1;"
        >
            ${content}
            ${ansestorDup ? i18n.ConflictDiary.part3.join("\n") : ""}
        </div>
        <div class="b3-dialog__action">
            <button class="b3-button b3-button--cancel">${window.siyuan.languages.cancel}</button>
            <span class="fn__space"></span>
            <button class="b3-button b3-button--text" data-method="AllMerge">${MethodOptions.AllMerge}</button>
            <span class="fn__space"></span>
            <button class="b3-button b3-button--text" data-method="SmartMerge">${MethodOptions.SmartMerge}</button>
            <span class="fn__space"></span>
            <button class="b3-button b3-button--text" data-method="DeleteDup">${MethodOptions.DeleteDup}</button>
            <span class="fn__space"></span>
            <button class="b3-button b3-button--text" data-method="TrashDup">${MethodOptions.TrashDup}</button>
        </div>
        `;
    return html;
}

/**
 * 检查这些文档是否祖先文档树不同
 */
function ifAncestorDiff(docs: DocBlock[]): boolean {
    let paths: string[] = docs.map(doc => doc.path);
    //trim base doc
    paths = paths.map(path => path.slice(0, path.lastIndexOf("/")));
    //check if identical
    let identical = true;
    for (let i = 1; i < paths.length; i++) {
        if (paths[i] !== paths[0]) {
            identical = false;
            break;
        }
    }
    return !identical;
}

const handleDuplicateDiary = async (docs: DocBlock[], method?: TDuplicateHandleMethod) => {
    docs = docs.sort((a, b) => {
        return a.created >= b.created ? -1 : 1;
    });
    //选择最早的日记, 认为是主日记
    let earliestDoc = docs.pop();
    method = method || settings.get('AutoHandleDuplicateMethod');
    console.log(`Handle duplicate method: ${method}`);
    const handler = HandleMethods?.[method] || ((...args: any[]) => console.error(`No such method: ${method}`));
    await handler(earliestDoc, docs);
    // showMessage(i18n.ConflictDiary.success, 2000, "info");
    showMessage(i18n.ConflictDiary.success, 2000, "info");
}

/**
 * 由于同步的问题，默认的笔记本中可能出现重复的日记，这里检查下是否有重复的日记
 * @param notebook 
 * @param todayDiaryHpath 
 */
export async function checkDuplicateDiary(): Promise<boolean> {
    // ==================== 检查是否有重复 ====================
    let notebook: Notebook = notebooks.default;
    let hpath = notebook.dailynoteHpath!;
    let docs = (await getDocsByHpath(hpath, notebook)) as DocBlock[];

    if (docs.length <= 1) {
        return false;
    }

    // ==================== 由于未知原因可能出现重复的 id, 需要去重 ====================
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

    //排序为从新到旧
    docs = docs.sort((a, b) => {
        return a.created >= b.created ? -1 : 1;
    });

    // ==================== 检查顶部文档树是否也有重复 ====================
    const ascendantDiff = ifAncestorDiff(docs); //如果为 true，说明祖先的文档树也不同

    // ==================== 合并今天的日记 ====================
    console.warn(`Conflict daily note: ${notebook.name} ${hpath}`);
    const html = buildShowDuplicateDocDom(docs, notebook, ascendantDiff);
    let dialog = new Dialog({
        title: i18n.Name,
        content: html,
        width: isMobile ? "90%" : "47rem",
    });
    dialog.element.querySelector(".b3-dialog__action")?.addEventListener("click", async (event: MouseEvent) => {
        let target = event.target as HTMLElement;
        if (!target || !target.classList.contains("b3-button")) {
            return;
        }

        if (target.classList.contains("b3-button--cancel")) {
            dialog.destroy();
            return;
        }

        let method = target.dataset.method;
        await handleDuplicateDiary(docs, method as TDuplicateHandleMethod);
        dialog.destroy();
    });
    return true;
}

//TODO: 测试用，记得删除
globalThis.checkDuplicateDiary = async () => {
    let flag = await checkDuplicateDiary();
    if (flag) {
        showMessage('有重复日记');
    } else {
        showMessage('没有重复日记');
    }
};
