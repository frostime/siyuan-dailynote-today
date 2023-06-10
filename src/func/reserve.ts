import * as serverApi from '@/serverApi';

type RetvPosition = 'top' | 'bottom';
type markdown = string;
type RetvBlockContent = markdown;
type RetvBlock = Block;
type ResvBlockIds = BlockId[];

function clipString(str: string, len: number) {
    if (str.length > len) {
        return str.slice(0, len) + '...';
    } else {
        return str;
    }
}

/**
 * Retrieve 代指插入到日记中的预约的记录
 * 可以是嵌入块，链接或者双链等
 */
export abstract class Retrieve {

    resvBlockIds: ResvBlockIds //Source 的预约块 ID
    dstDocId: DocumentId; //目标日记的 ID
    position: RetvPosition; //插入位置

    retvBlock: RetvBlock; // 和本操作相关的 Retrieve 块 ID

    constructor(position: RetvPosition, resvBlockIds: ResvBlockIds, docId: DocumentId) {
        this.position = position;
        this.resvBlockIds = resvBlockIds;
        this.dstDocId = docId;
    }

    async checkRetv(): Promise<Block[]> {
        let sql = `select * from blocks where path like "%${this.dstDocId}%" and name = "Reservation"`;
        let retvBlocks: Block[] = await serverApi.sql(sql);
        // return retvBlocks;
        this.retvBlock = retvBlocks.length > 0 ? retvBlocks[0] : undefined;
        return retvBlocks;
    }

    /**
     * 执行实际的插入操作
     * @param content 插入块的 markdown 内容
     */
    async insertRetrieve(content: RetvBlockContent) {
        let data;
        if (this.position === 'bottom') {
            data = await serverApi.appendBlock(this.dstDocId, content, 'markdown');
        } else {
            data = await serverApi.prependBlock(this.dstDocId, content, 'markdown');
        }
        let blockId = data[0].doOperations[0].id;
        serverApi.setBlockAttrs(blockId, { name: 'Reservation', breadcrumb: "true" });
    }

    /**
     * 更新 Retrieve 块的内容
     * @param content 新的内容
     */
    async updateRetrieve(content: RetvBlockContent) {
        serverApi.updateBlock(this.retvBlock.id, content, 'markdown');
        serverApi.setBlockAttrs(this.retvBlock.id, { name: 'Reservation', breadcrumb: "true" });
    }

    /**
     * 查询预约块的内容
     * @returns interfact {id: BlockId, content: string|undefined}
     */
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
        let content = await this.createContent();
        this.insertRetrieve(content);
    }

    async update() {
        let content = await this.createContent();
        this.updateRetrieve(content);
    }

    /**
     * 子类实现，创建插入块的内容
     */
    abstract createContent(): RetvBlockContent|Promise<RetvBlockContent>;
}


/**
 * 将预约作为嵌入块插入到日记中
 */
export class RetvAsEmbed extends Retrieve {
    createContent() {
        let resvBlockIds = this.resvBlockIds.map((id) => `"${id}"`);
        let sql = `select * from blocks where id in (${resvBlockIds.join(',')})`;
        let sqlBlock = `{{${sql}}}`;
        return sqlBlock;
    }
}

export class RetvAsLink extends Retrieve {

    async createContent() {
        let resvBlocks = await this.retrieveResvBlocks();
        let retrieveBlockList = [];
        for (let block of resvBlocks) {
            if (block.content) {
                retrieveBlockList.push(`* [${block.content}](siyuan://blocks/${block.id})`);
            } else {
                retrieveBlockList.push(`* ${block.id} not found`);
            }
        }
        let retvBlockContent = retrieveBlockList.join('\n');
        return retvBlockContent;
    }
}

export class RetvAsRef extends Retrieve {

    async createContent() {
        let resvBlocks = await this.retrieveResvBlocks();
        let retrieveBlockList = [];
        for (let block of resvBlocks) {
            if (block.content) {
                retrieveBlockList.push(`* ((${block.id} "${block.content}"))`);
            } else {
                retrieveBlockList.push(`* ${block.id} not found`);
            }
        }
        let retvBlockContent = retrieveBlockList.join('\n');
        return retvBlockContent;
    }
}

export type RetvType = 'embed' | 'link' | 'ref';

export function RetvFactory(type: RetvType, position: RetvPosition, resvBlockIds: ResvBlockIds, docId: DocumentId) {
    let retv: Retrieve;
    switch (type) {
        case 'embed':
            retv = new RetvAsEmbed(position, resvBlockIds, docId);
            break;
        case 'link':
            retv = new RetvAsLink(position, resvBlockIds, docId);
            break;
        case 'ref':
            retv = new RetvAsRef(position, resvBlockIds, docId);
            break;
        default:
            throw new Error('unknown type');
    }
    return retv;
}
