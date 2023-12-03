/*
 * Copyright (c) 2023 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2023-12-03 11:38:29
 * @FilePath     : /src/func/dailynote/dn-attr.ts
 * @LastEditTime : 2023-12-03 11:42:44
 * @Description  : To distinguish the daily note from other plain notes, we set a custom attribute for it.
 *                 The attribute is like: custom-dailynote-yyyyMMdd: yyyyMMdd
 */
import * as serverApi from '@/serverApi';


function formatDate(date?: Date): string {
    date = date === undefined ? new Date() : date;
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    return `${year}${month < 10 ? '0' + month : month}${day < 10 ? '0' + day : day}`;
}


/**
 * 对 DailyNote 的自定义属性进行设置, custom-dailynote-yyyyMMdd: yyyyMMdd
 * @param doc_id 日记的 id
 */
export function setCustomDNAttr(doc_id: string, date?: Date) {
    let td = formatDate(date);
    let attr = `custom-dailynote-${td}`;
    // 构建 attr: td
    let attrs: { [key: string]: string } = {};
    attrs[attr] = td;
    serverApi.setBlockAttrs(doc_id, attrs);
}
