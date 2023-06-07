import notebooks from "@/global-notebooks";
import { eventBus } from "@/event-bus";
import { info, error, i18n } from "@/utils";
import * as serverApi from '@/serverApi';
import { getDocsByHpath, createDiary, notify } from "@/func";

export async function moveBlocksToDailyNote(srcBlockId: BlockId, notebook: Notebook) {
    let block = await serverApi.getBlockByID(srcBlockId);

    if (block == null) {
        error(`Block ${srcBlockId} not found`);
        return;
    }

    //获取目标文档的 id
    let todayDiaryPath = notebook.dailynotePath;
    let docs = await getDocsByHpath(todayDiaryPath!, notebook);
    let doc_id;
    if (docs != null && docs.length > 0) {
        doc_id = docs[0].id;
    } else {
        doc_id = await createDiary(notebook, todayDiaryPath!);
        notify(`${i18n.Create}: ${notebook.name}`, 'info', 2500);
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
    notify(`${block.id} ${i18n.MoveMenu.Move} ${notebook.name}`, 'info', 2500);
}

export async function moveDocUnderDailyNote(srcDocId: DocumentId, notebook: Notebook) {
    let srcBlock: Block = await serverApi.getBlockByID(srcDocId);

    if (srcBlock === null) {
        error(`Document ${srcDocId} not found`);
        return;
    }

    //获取目标文档的路径
    let scrDocPath = srcBlock.path;
    let dstDiaryPath = notebook.dailynotePath;

    let dstDocs = await getDocsByHpath(dstDiaryPath!, notebook);
    console.log("日记路径:", dstDocs);
    let dstDocId: DocumentId;
    if (dstDocs != null && dstDocs.length > 0) {
        dstDocId = dstDocs[0].id;
    } else {
        // dstDocId = await createDiary(notebook, dstDiaryPath!);
        // notify(`${i18n.Create}: ${notebook.name}`, 'info', 2500);
    }
}

export function createMenuItems(data_id: string, srcBlock: 'block' | 'doc' = 'block') {
    let menuItems: any[] = [];
    for (let notebook of notebooks) {
        let item = {
            label: notebook.name,
            icon: `icon-${notebook.icon}`,
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

