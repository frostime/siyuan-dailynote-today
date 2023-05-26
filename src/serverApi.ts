import { fetchSyncPost, IWebSocketData } from "siyuan";
import { info, i18n } from "./utils";


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

export async function createDocWithMd(notebookId: string, path: string, markdown: string) {
    let data = {
        notebook: notebookId,
        path: path,
        markdown: markdown,
    };
    let url = '/api/filetree/createDocWithMd';
    return request(url, data);
}

export async function createDailyNote(notebookId: string, app: string) {
    let url = '/api/filetree/createDailyNote';
    return request(url, { notebook: notebookId, app: app });
}

export async function getNotebookConf(notebookId: string) {
    let data = { notebook: notebookId };
    let url = '/api/notebook/getNotebookConf';
    return request(url, data);
}

export async function getBlockByID(blockId: string) {
    let sqlScript = `select * from blocks where id ='${blockId}'`;
    let data = await sql(sqlScript);
    return data[0];
}

export async function getChildBlocks(blockId: string) {
    let data = { id: blockId };
    let url = '/api/block/getChildBlocks';
    return request(url, data);
}

export async function moveBlock(id: string, previousID: string | null = null, parentID: string | null = null) {
    let url = '/api/block/moveBlock';
    return request(url, { id: id, previousID: previousID, parentID: parentID });
}

export async function insertBlock(nextID: string, content: string, dataType: 'markdown' | 'dom') {
    let url = '/api/block/insertBlock';
    let data = {
        data: content,
        nextID: nextID,
        dataType: dataType,
    }
    return request(url, data);
}

export async function prependBlock(parentId: string, content: string, dataType: 'markdown' | 'dom') {
    let url = '/api/block/prependBlock';
    let data = {
        data: content,
        parentID: parentId,
        dataType: dataType,
    }
    return request(url, data);
}

// /api/block/deleteBlock
export async function deleteBlock(blockId: string) {
    let url = '/api/block/deleteBlock';
    return request(url, { id: blockId });
}

export async function renderSprig(sprig: string) {
    let url = '/api/template/renderSprig';
    return request(url, { template: sprig });
}


// /api/block/getBlockKramdown
export async function getBlockKramdown(blockId: string) {
    let url = '/api/block/getBlockKramdown';
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
