import notebooks from "@/global-notebooks";
import { eventBus } from "@/event-bus";
import { i18n } from "@/utils";
import * as serverApi from '@/serverApi';
import { getDocsByHpath, createDiary } from "@/func";
import { showMessage } from "siyuan";
import { settings } from "@/global-status";

export async function moveBlocksToDailyNote(srcBlockId: BlockId, notebook: Notebook) {
    let block: Block = await serverApi.getBlockByID(srcBlockId);

    if (block == null) {
        console.error(`Block ${srcBlockId} not found`);
        return;
    }

    //获取目标文档的 id
    let todayDiaryPath = notebook.dailynoteHpath;
    let docs = await getDocsByHpath(todayDiaryPath!, notebook);
    let doc_id;
    if (docs != null && docs.length > 0) {
        doc_id = docs[0].id;
    } else {
        doc_id = await createDiary(notebook, todayDiaryPath!);
        showMessage(`${i18n.Create}: ${notebook.name}`, 2500, 'info');
    }

    console.debug(`Call 移动块: ${block.id} --> ${doc_id}`)

    //列表项需要额外特殊处理

    //移动块
    if (block.type === 'i') {
        //如果是列表项，需要先新建一个列表块，然后把列表项插入到列表块中
        let ans = await serverApi.prependBlock(doc_id, '* ', 'markdown');
        let newListId = ans[0].doOperations[0].id;
        await serverApi.moveBlock(block.id, null, newListId);
        console.debug(`移动列表项 ${block.id} --> ${newListId}`);
        //获取新的列表的子项
        let allChild = await serverApi.getChildBlocks(newListId);
        let blankItem = allChild[1]; // 上述行为会导致出现一个额外的多余列表项
        await serverApi.deleteBlock(blankItem.id);
    } else if (block.type === 'h') {
        let div: HTMLDivElement = document.querySelector(`#layouts div.protyle-content div[data-node-id="${block.id}"]`);
        let fold = div.getAttribute('fold');
        if (fold != "1") {
            await serverApi.fold(block.id);
        }
        await serverApi.moveBlock(block.id, null, doc_id);
        if (fold != "1") {
            //如果原来是展开的，那么移动后也展开, 等待 500ms
            setTimeout(() => {
                serverApi.unfold(block.id);
            }, 500);
        }
    } else {
        await serverApi.moveBlock(block.id, null, doc_id);
    }
    showMessage(`${block.id} ${i18n.MoveMenu.Move} ${notebook.name}`, 2500, 'info');
}

export async function moveDocUnderDailyNote(srcDocId: DocumentId, notebook: Notebook) {
    let srcBlock: Block = await serverApi.getBlockByID(srcDocId);

    if (srcBlock === null) {
        console.error(`Document ${srcDocId} not found`);
        return;
    }

    //获取目标文档的路径
    let srcDocPath = srcBlock.path;
    let srcDocHpath = srcBlock.hpath;
    let dstDiaryPath: string = notebook.dailynoteHpath;

    for (let notebook of notebooks) {
        if (notebook.dailynoteHpath === srcDocHpath) {
            console.error(`不可以移动日记!`);
            showMessage(i18n.MoveMenu.NotMoveDiary, 2500, 'error');
            return;
        }
    }

    let dstDocs = await getDocsByHpath(dstDiaryPath!, notebook);
    console.debug("日记路径:", dstDocs);
    // let dstDocId: DocumentId;
    if (dstDocs != null && dstDocs.length > 0) {
        // dstDocId = dstDocs[0].id;
    } else {
        // dstDocId = await createDiary(notebook, dstDiaryPath!);
        await createDiary(notebook, dstDiaryPath!);
        dstDocs = await getDocsByHpath(dstDiaryPath!, notebook);
        showMessage(`${i18n.Create}: ${notebook.name}`, 2500, 'info');
    }

    let dstDocPath = dstDocs[0].path;
    serverApi.moveDocs([srcDocPath], notebook.id, dstDocPath);
}

/**
 * 大无语，V姐在新的 2.9 版本把 emoji 的解析大改
 */
function parseEmoji(code: string) {
    let codePoint = parseInt(code, 16);
    if (!Number.isNaN(codePoint)) {
        let emoji = String.fromCodePoint(codePoint);
        return `<span class="b3-menu__icon">${emoji}</span>`;
    }

    return `<span class="b3-menu__icon"> <img class="" src="/emojis/${code}"> </span>`;
}

export function createMenuItems(data_id: string, srcBlock: 'block' | 'doc' = 'block') {
    let menuItems: any[] = [];
    let blacklist = settings.get('NotebookBlacklist');
    for (let notebook of notebooks) {
        let forbidden = blacklist?.[notebook.id];
        forbidden = forbidden === undefined ? false : forbidden;
        if (forbidden === true) {
            continue;
        }

        let item = {
            label: notebook.name,
            iconHTML: parseEmoji(notebook.icon),
            click: async () => {
                if (srcBlock === 'block') {
                    console.log(`Move block ${data_id} to ${notebook.id} [${notebook.name}]`);
                    await moveBlocksToDailyNote(data_id, notebook);
                    eventBus.publish('moveBlocks', '');
                } else {
                    await moveDocUnderDailyNote(data_id, notebook);
                    eventBus.publish('moveBlocks', '');
                }
            }
        }
        menuItems.push(item);
    }
    return menuItems;
}

