import * as serverApi from '../serverApi';

/**
 * 
 * @param notebook 笔记本对象
 * @returns 笔记本的 Daily Note 路径模板
 */
export async function getDailynoteSprig(notebookId: string): Promise<string> {
    let conf = await serverApi.getNotebookConf(notebookId);
    let sprig: string = conf.conf.dailyNoteSavePath;
    return sprig;
}

/**
 * 要求思源解析模板
 * @param sprig
 * @returns 
 */
export async function renderDailynotePath(sprig: string) {
    return await serverApi.renderSprig(sprig);
}
