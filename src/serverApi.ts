import { fetchSyncPost, IWebSocketData } from "siyuan";
import { info, i18n } from "./utils";


async function request(url: string, data: any) {
    // info(`Request: ${url}; data = ${JSON.stringify(data)}`);
    let response: IWebSocketData = await fetchSyncPost(url, data);
    // console.log(response);
    let res = response.code === 0 ? response.data : null;
    return res;
}

function parseBody(body: any) {
    return body;
}

async function test() {
    let notebooks = await lsNotebooks();
    console.log(notebooks);
    let notebookId = notebooks?.notebooks[0].id;
    try {
        let notebookConf = await getNotebookConf('20220305173526-4yjl33h');
        console.log(notebookConf);
    } catch (err) {
        console.log(err);
    }
    try {
        let block = await getBlockByID('20220316145830-u0u6srg');
        console.log(block);
    } catch (err) {
        console.log(err);
    }
    try {
        let block = await renderSprig('/daily note/{{now | date "2006/01"}}/{{now | date "2006-01-02"}}');
        console.log(block);
    } catch (err) {
        console.log(err);
    }
    // try {
    //     await moveBlock('20230512192002-q5ekmhh', '20230512192017-eyc4dyb', null);
    // } catch (err) {
    //     console.log(err);
    // }

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


export async function renderSprig(sprig: string) {
    let url = '/api/template/renderSprig';
    return request(url, { template: sprig });
}
