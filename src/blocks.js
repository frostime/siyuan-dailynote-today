/**
 * 感谢 @Achuan-2 / tsundoku 主题代码，本文件部分代码来自他的项目
 * https://github.com/Achuan-2/siyuan-themes-tsundoku
 */
import { serverApi } from 'siyuan';

export
{
    getFocusedBlock,
    getFocusedBlockID
}

/**
 * Copy from https://github.com/Achuan-2/siyuan-themes-tsundoku/blob/main/script/utils/api.js
 * 获得焦点所在的块
 * @return {HTMLElement} 光标所在块
 * @return {null} 光标不在块内
 */
function getFocusedBlock()
{
    let block = window.getSelection()
        && window.getSelection().focusNode
        && window.getSelection().focusNode.parentElement; // 当前光标
    while (block != null && block.dataset.nodeId == null) block = block.parentElement;
    return block;
}

/**
 * Copy from https://github.com/Achuan-2/siyuan-themes-tsundoku/blob/main/script/utils/api.js
 * 获得焦点所在块 ID
 * @return {string} 块 ID
 * @return {null} 光标不在块内
 */
function getFocusedBlockID()
{
    let block = getFocusedBlock();
    if (block)
    {
        return block.dataset.nodeId;
    }
    else return null;
}

async function getBlockType(block_id)
{
    serverApi.get
    try
    {
        let block_type = await serverApi.sql(`select type from blocks where id = '${block_id}'`);
        return block_type;
    } catch (error)
    {
        console.error(error);
        return null;
    }

}
