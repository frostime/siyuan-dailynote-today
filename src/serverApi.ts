import { fetchSyncPost, IWebSocketData } from "siyuan";


async function request(url: string, data: any) {
    // info(`Request: ${url}; data = ${JSON.stringify(data)}`);
    let response: IWebSocketData = await fetchSyncPost(url, data);
    // console.log(response);
    let res = response.code === 0 ? response.data : null;
    return res;
}


export async function sql(sql: string) {
    let sqldata = {
        stmt: sql,
    };
    let url = '/api/query/sql';
    return request(url, sqldata);
}

export async function lsNotebooks() {
    let url = '/api/notebook/lsNotebooks';
    return request(url, '');
}

export async function createDocWithMd(notebookId: NotebookId, path: string, markdown: string) {
    let data = {
        notebook: notebookId,
        path: path,
        markdown: markdown,
    };
    let url = '/api/filetree/createDocWithMd';
    return request(url, data);
}

export async function createDailyNote(notebookId: NotebookId, app: string) {
    let url = '/api/filetree/createDailyNote';
    return request(url, { notebook: notebookId, app: app });
}

export async function getNotebookConf(notebookId: NotebookId) {
    let data = { notebook: notebookId };
    let url = '/api/notebook/getNotebookConf';
    return request(url, data);
}

export async function moveDocs(fromPaths: string[], toNotebook: NotebookId, toPath: string) {
    let data = {
        fromPaths: fromPaths,
        toNotebook: toNotebook,
        toPath: toPath
    };
    let url = '/api/filetree/moveDocs';
    return request(url, data);
}

//api/filetree/doc2Heading
export async function doc2Heading(srcID: BlockId, targetID: BlockId, after: boolean) {
    let data = {
        srcID: srcID,
        targetID: targetID,
        after: after
    };
    let url = '/api/filetree/doc2Heading';
    return request(url, data);
}

export async function getBlockByID(blockId: BlockId) {
    let sqlScript = `select * from blocks where id ='${blockId}'`;
    let data = await sql(sqlScript);
    return data[0];
}

export async function getChildBlocks(blockId: BlockId): Promise<Block[]> {
    let data = { id: blockId };
    let url = '/api/block/getChildBlocks';
    return request(url, data);
}

export async function moveBlock(id: BlockId, previousID: PreviousID = null, parentID: ParentID = null) {
    let url = '/api/block/moveBlock';
    return request(url, { id: id, previousID: previousID, parentID: parentID });
}

export async function insertBlock(nextID: BlockId, content: string, dataType: 'markdown' | 'dom') {
    let url = '/api/block/insertBlock';
    let data = {
        data: content,
        nextID: nextID,
        dataType: dataType,
    }
    return request(url, data);
}

export async function prependBlock(parentId: ParentID, content: string, dataType: 'markdown' | 'dom') {
    let url = '/api/block/prependBlock';
    let data = {
        data: content,
        parentID: parentId,
        dataType: dataType,
    }
    return request(url, data);
}

export async function appendBlock(parentId: ParentID, content: string, dataType: 'markdown' | 'dom') {
    let url = '/api/block/appendBlock';
    let data = {
        data: content,
        parentID: parentId,
        dataType: dataType,
    }
    return request(url, data);
}

// /api/block/deleteBlock
export async function deleteBlock(blockId: BlockId) {
    let url = '/api/block/deleteBlock';
    return request(url, { id: blockId });
}

// /api/block/updateBlock
export async function updateBlock(blockId: BlockId, content: string, dataType: 'markdown' | 'dom') {
    let url = '/api/block/updateBlock';
    return request(url, { id: blockId, data: content, dataType: dataType });
}

export async function renderSprig(sprig: string) {
    let url = '/api/template/renderSprig';
    return request(url, { template: sprig });
}


// /api/block/getBlockKramdown
export async function getBlockKramdown(blockId: BlockId) {
    let url = '/api/block/getBlockKramdown';
    return request(url, { id: blockId });
}

// /api/attr/setBlockAttrs
export async function setBlockAttrs(blockId: BlockId, attrs: any) {
    let url = '/api/attr/setBlockAttrs';
    return request(url, { id: blockId, attrs: attrs });
}

// /api/attr/getBlockAttrs
export async function getBlockAttrs(blockId: BlockId) {
    let url = '/api/attr/getBlockAttrs';
    return request(url, { id: blockId });
}


export async function version(): Promise<string> {
    return request('/api/system/version', {});
}

async function myFetchSyncPost(url, data) {
    const init: RequestInit = {
        method: "POST",
    };
    if (data) {
        init.body = JSON.stringify(data);
    }
    const res = await fetch(url, init);
    const txt = await res.text();
    return txt;
}

/**
 * 使用了自定义的 fetchSyncPost
 * @param path
 * @returns 返回原始的文本 txt
 */
export async function getFile(path: string): Promise<any> {
    let data = {
        path: path
    }
    let url = '/api/file/getFile';
    try {
        let file = await myFetchSyncPost(url, data);
        return file;
    } catch (error_msg) {
        return null;
    }
}

export async function fold(blockID: BlockId) {
    let payload = { 
        session: "", "app": "",
        transactions: [
            {
                doOperations: [{ action: "foldHeading", id: blockID }],
                undoOperations: [{ action: "unfoldHeading", id: blockID }]
            }
        ]
    }
    let url = '/api/transactions'
    return request(url, payload);
}

export async function unfold(blockID: BlockId) {
    let payload = { 
        session: "", "app": "",
        transactions: [
            {
                doOperations: [{ action: "unfoldHeading", id: blockID }],
                undoOperations: [{ action: "foldHeading", id: blockID }]
            }
        ]
    }
    let url = '/api/transactions'
    return request(url, payload);
}
