import notebooks from "@/global-notebooks";
import { eventBus } from "@/event-bus";
import { info, error, i18n } from "@/utils";
import * as serverApi from '@/serverApi';
import { getDocsByHpath, createDiary } from "@/func";
import { showMessage } from "siyuan";

export async function moveBlocksToDailyNote(srcBlockId: BlockId, notebook: Notebook) {
    let block = await serverApi.getBlockByID(srcBlockId);

    if (block == null) {
        error(`Block ${srcBlockId} not found`);
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

    info(`Call 移动块: ${block.id} --> ${doc_id}`)

    //列表项需要额外特殊处理
    let moveLi = block.type === 'i';

    //移动块
    if (moveLi) {
        //如果是列表项，需要先新建一个列表块，然后把列表项插入到列表块中
        let ans = await serverApi.prependBlock(doc_id, '* ', 'markdown');
        let newListId = ans[0].doOperations[0].id;
        await serverApi.moveBlock(block.id, null, newListId);
        info(`移动列表项 ${block.id} --> ${newListId}`);
        //获取新的列表的子项
        let allChild = await serverApi.getChildBlocks(newListId);
        let blankItem = allChild[1]; // 上述行为会导致出现一个额外的多余列表项
        await serverApi.deleteBlock(blankItem.id);
    } else {
        await serverApi.moveBlock(block.id, null, doc_id);
    }
    showMessage(`${block.id} ${i18n.MoveMenu.Move} ${notebook.name}`, 2500, 'info');
}

export async function moveDocUnderDailyNote(srcDocId: DocumentId, notebook: Notebook) {
    let srcBlock: Block = await serverApi.getBlockByID(srcDocId);

    if (srcBlock === null) {
        error(`Document ${srcDocId} not found`);
        return;
    }

    //获取目标文档的路径
    let srcDocPath = srcBlock.path;
    let srcDocHpath = srcBlock.hpath;
    let dstDiaryPath: string = notebook.dailynoteHpath;

    for (let notebook of notebooks) {
        if (notebook.dailynoteHpath === srcDocHpath) {
            error(`不可以移动日记!`);
            showMessage(i18n.MoveMenu.NotMoveDiary, 2500, 'error');
            return;
        }
    }

    let dstDocs = await getDocsByHpath(dstDiaryPath!, notebook);
    console.log("日记路径:", dstDocs);
    let dstDocId: DocumentId;
    if (dstDocs != null && dstDocs.length > 0) {
        dstDocId = dstDocs[0].id;
    } else {
        dstDocId = await createDiary(notebook, dstDiaryPath!);
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
    try {
        let emoji = String.fromCodePoint(parseInt(code, 16));
        return `<span class="b3-menu__icon">${emoji}</span>`;
    } catch (error) {
        return `<span class="b3-menu__icon"> </span>`;
    }
}

export function createMenuItems(data_id: string, srcBlock: 'block' | 'doc' = 'block') {
    let menuItems: any[] = [];
    for (let notebook of notebooks) {
        let item = {
            label: notebook.name,
            iconHTML: parseEmoji(notebook.icon),
            click: async () => {
                if (srcBlock === 'block') {
                    info(`Move block ${data_id} to ${notebook.id} [${notebook.name}]`);
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

