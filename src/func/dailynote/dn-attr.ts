/*
 * Copyright (c) 2023 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2023-12-03 11:38:29
 * @FilePath     : /src/func/dailynote/dn-attr.ts
 * @LastEditTime : 2023-12-04 18:03:28
 * @Description  : To distinguish the daily note from other plain notes, we set a custom attribute for it.
 *                 The attribute is like: custom-dailynote-yyyyMMdd: yyyyMMdd
 */
import * as serverApi from '@/serverApi';
import { formatDate } from './basic';

/**
 * 对 DailyNote 的自定义属性进行设置, custom-dailynote-yyyyMMdd: yyyyMMdd
 * https://github.com/siyuan-note/siyuan/issues/9807
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
