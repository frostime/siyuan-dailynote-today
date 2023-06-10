import * as serverApi from '@/serverApi';

type ResvPosition = 'top' | 'bottom';
type ResvBlockIds = BlockId[];

export abstract class Resv {

    position: ResvPosition;
    resvBlockIds: ResvBlockIds
    dstDocId: DocumentId;

    constructor(position: ResvPosition, resvBlockIds: ResvBlockIds, docId: DocumentId) {
        this.position = position;
        this.resvBlockIds = resvBlockIds;
        this.dstDocId = docId;
    }

    async checkResv(): Promise<Block[]> {
        let sql = `select * from blocks where path like "%${this.dstDocId}%" and name = "Reservation"`;
        let embedBlocks: Block[] = await serverApi.sql(sql);
        return embedBlocks;
    }

    abstract insert(): void;
    abstract update(embedBlock: Block): void;
}

/**
 * 将预约作为嵌入块插入到日记中
 */
export class ResvAsEmbed extends Resv {

    async insert() {
        let resvBlockIds = this.resvBlockIds.map((id) => `"${id}"`);
        let sql = `select * from blocks where id in (${resvBlockIds.join(',')})`;
        let sqlBlock = `{{${sql}}}`;
        let data;
        if (this.position === 'bottom') {
            data = await serverApi.appendBlock(this.dstDocId, sqlBlock, 'markdown');
        } else {
            data = await serverApi.prependBlock(this.dstDocId, sqlBlock, 'markdown');
        }
        let blockId = data[0].doOperations[0].id;
        serverApi.setBlockAttrs(blockId, { name: 'Reservation', breadcrumb: "true" });
    }

    async update(embedBlock: Block) {
        let resvBlockIds = this.resvBlockIds.map((id) => `"${id}"`);
        let sql = `select * from blocks where id in (${resvBlockIds.join(',')})`;
        let sqlBlock = `{{${sql}}}`;
        serverApi.updateBlock(embedBlock.id, sqlBlock, 'markdown');
        serverApi.setBlockAttrs(embedBlock.id, { name: 'Reservation', breadcrumb: "true" });
    }
}
