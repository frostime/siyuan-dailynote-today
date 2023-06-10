import * as serverApi from '@/serverApi';

type RetvPosition = 'top' | 'bottom';
type RetvBlockContent = string;
type RetvBlockId = BlockId;
type ResvBlockIds = BlockId[];

export abstract class Retrieve {

    position: RetvPosition;
    resvBlockIds: ResvBlockIds
    dstDocId: DocumentId;

    constructor(position: RetvPosition, resvBlockIds: ResvBlockIds, docId: DocumentId) {
        this.position = position;
        this.resvBlockIds = resvBlockIds;
        this.dstDocId = docId;
    }

    async checkRetv(): Promise<Block[]> {
        let sql = `select * from blocks where path like "%${this.dstDocId}%" and name = "Reservation"`;
        let retvBlocks: Block[] = await serverApi.sql(sql);
        return retvBlocks;
    }

    abstract insert(): void;
    abstract update(retvBlock: Block): void;
}

async function insertRetrieve(content: RetvBlockContent, docId: DocumentId, position: RetvPosition) {
    let data;
    if (position === 'bottom') {
        data = await serverApi.appendBlock(docId, content, 'markdown');
    } else {
        data = await serverApi.prependBlock(docId, content, 'markdown');
    }
    let blockId = data[0].doOperations[0].id;
    serverApi.setBlockAttrs(blockId, { name: 'Reservation', breadcrumb: "true" });
}

async function updateRetrieve(id: RetvBlockId, content: RetvBlockContent) {
    serverApi.updateBlock(id, content, 'markdown');
    serverApi.setBlockAttrs(id, { name: 'Reservation', breadcrumb: "true" });
}

/**
 * 将预约作为嵌入块插入到日记中
 */
export class RetvAsEmbed extends Retrieve {

    async insert() {
        let resvBlockIds = this.resvBlockIds.map((id) => `"${id}"`);
        let sql = `select * from blocks where id in (${resvBlockIds.join(',')})`;
        let sqlBlock = `{{${sql}}}`;
        insertRetrieve(sqlBlock, this.dstDocId, this.position);
    }

    async update(retvBlock: Block) {
        let resvBlockIds = this.resvBlockIds.map((id) => `"${id}"`);
        let sql = `select * from blocks where id in (${resvBlockIds.join(',')})`;
        let sqlBlock = `{{${sql}}}`;
        updateRetrieve(retvBlock.id, sqlBlock);
    }
}

function clipString(str: string, len: number) {
    if (str.length > len) {
        return str.slice(0, len) + '...';
    } else {
        return str;
    }
}

export class RetvAsLink extends Retrieve {

    async retrieveResvBlocks() {
        let retrieveRes = [];
        for (let id of this.resvBlockIds) {
            let block: Block = await serverApi.getBlockByID(id);
            console.log(id, '-->', block);
            if (block) {
                retrieveRes.push({
                    id: block.id,
                    content: clipString(block.content, 20),
                });
            } else {
                retrieveRes.push({
                    id: id,
                    content: undefined,
                });
            }
        }
        return retrieveRes;
    }

    async insert() {
        // let resvBlockLinks = this.resvBlockIds.map((id) => `siyuan://blocks/${id}`);
        let resvBlocks = await this.retrieveResvBlocks();
        let retrieveBlockList = [];
        for (let block of resvBlocks) {
            if (block.content) {
                retrieveBlockList.push(`* [${block.content}](siyuan://blocks/${block.id})`);
            } else {
                retrieveBlockList.push(`* ${block.id} not found`);
            }
        }
        let retrieveBlockContent = retrieveBlockList.join('\n');
    }
    async update(retvBlock: Block) {

    }
}
