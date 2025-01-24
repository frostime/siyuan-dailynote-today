import { i18n, lute } from "@/utils";
import { showMessage, confirm } from "siyuan";
import * as serverApi from "@/serverApi";
// import { confirmDialog } from "@/components/libs/dialogs";
import { settings } from "@/global-status";
import { parse, ParsedResult } from 'chrono-node';
import { reservationAttrVal } from ".";

import { confirmDialog, html2ele, isMobile } from "@frostime/siyuan-plugin-kits";

const Zh1to9 = '一二三四五六七八九';
const Zh1to10 = '一二三四五六七八九十';
const ZhDigitMap = {
    '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10
}

export const DatePatternRules = [
    {
        pattern: /(?<![\d\.\-/])(?:(?<year>2\d{3})\s?[\-年\./]\s?)?(?:(?<month>0?[1-9]|1[0-2])\s?[\-月\./]\s?)(?<day>[1-2][0-9]|3[0-1]|0?[1-9])(?:\s?[日号]|[^\d\.\-/])/,
        parse(match: RegExpMatchArray): [string, string, string] {
            // console.log(match);
            let year = match.groups.year;
            let month = match.groups.month;
            let day = match.groups.day;
            if (!year) {
                let today = new Date();
                year = today.getFullYear().toString();
            }
            return [year, month, day];
        }
    },
    {
        pattern: /(?<prefix>明|大?后)天/,
        parse(match: RegExpMatchArray): [string, string, string] {
            // console.log(match);
            let today = new Date();
            if (match.groups.prefix === '明') {
                today.setDate(today.getDate() + 1);
            } else if (match.groups.prefix === '后') {
                today.setDate(today.getDate() + 2);
            } else if (match.groups.prefix === '大后') {
                today.setDate(today.getDate() + 3);
            }
            let year = today.getFullYear().toString();
            let month = (today.getMonth() + 1).toString();
            let day = today.getDate().toString();
            return [year, month, day];
        }
    },
    {
        pattern: /今[天日]/,
        parse(match: RegExpMatchArray): [string, string, string] {
            // console.log(match);
            let today = new Date();
            let year = today.getFullYear().toString();
            let month = (today.getMonth() + 1).toString();
            let day = today.getDate().toString();
            return [year, month, day];
        }
    },
    {
        pattern: /(?<diff>\d+)\s*(?:天[之以]?后|days? later)/,
        parse(match: RegExpMatchArray): [string, string, string] {
            let today = new Date();
            let diff = parseInt(match.groups.diff);
            today.setDate(today.getDate() + diff);
            let year = today.getFullYear().toString();
            let month = (today.getMonth() + 1).toString();
            let day = today.getDate().toString();
            return [year, month, day];
        }
    },
    {
        pattern: /(?<next>下个?)?(?:周|星期|礼拜)(?<day>[一二三四五六日天])/,
        dayMap: {
            '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '日': 7, '天': 7
        },
        parse(match: RegExpMatchArray): [string, string, string] {
            let today = new Date();
            let nextWeek: boolean = match.groups.next !== undefined;
            let dayOfWeekDst: number = this.dayMap[match.groups.day];
            let dayOfWeekNow = today.getDay();
            dayOfWeekNow = dayOfWeekNow === 0 ? 7 : dayOfWeekNow; //周日是0，转换成7

            let dateDelta = (nextWeek === true ? 7 : 0) + dayOfWeekDst - dayOfWeekNow;
            if (dateDelta < 0) {
                dateDelta += 7;
            }
            today.setDate(today.getDate() + dateDelta);
            let year = today.getFullYear().toString();
            let month = (today.getMonth() + 1).toString();
            let day = today.getDate().toString();
            return [year, month, day];
        }
    },
    {
        pattern: new RegExp(
            `(?<!\\d)(?:(?<year>(?:20)?\\d{2})\\s?年?\\s?)?` +
            `(?<month>[${Zh1to9}]|十[一二]?)\\s*月\\s*` +
            `(?<day>三十一?|二?十[${Zh1to9}]?|[${Zh1to10}])\\s*[日号]?`
        ),
        zn2num(zh: string): number {
            if (zh.length === 1) {
                return ZhDigitMap[zh];
            } else if (zh.length === 2) {
                if (zh[0] === '十') {
                    return 10 + ZhDigitMap[zh[1]];
                } else {
                    return 10 * ZhDigitMap[zh[0]];
                }
            } else if (zh.length === 3) {
                return 10 * ZhDigitMap[zh[0]] + ZhDigitMap[zh[2]];
            }
        },
        parse(match: RegExpMatchArray): [string, string, string] {
            let year = match.groups.year;
            let month = match.groups.month;
            let day = match.groups.day;
            if (!year) {
                let today = new Date();
                year = today.getFullYear().toString();
            }

            month = this.zn2num(month).toString();
            day = this.zn2num(day).toString();

            return [year, month, day];
        }
    }
    // /(?<next>下个?)?(?:周|星期)(?<day>[一二三四五六七日])/
    // /(?<month>[一二三四五六七八九]|十[一二])\s*月\s*(?<day>[一二三四五六七八九十]|二?十[一二三四五六七八九]|三十一?)\s*[日号]/
]


function createConfirmDialog(initialDate: Date | null, kramdown: string, matchText: MatchedText | null, datePicked: (date: Date) => void): HTMLElement {
    function hightLightStr(text: string, beg: number, len: number) {
        let before = text.substring(0, beg);
        let middle = text.substring(beg, beg + len);
        let after = text.substring(beg + len);
        return `${before}<span data-type="mark">${middle}</span>${after}`;
    }

    if (matchText) {
        kramdown = hightLightStr(kramdown, matchText.index, matchText.text.length);
    }
    let html = lute.Md2HTML(kramdown);
    html = `
    <div>
        <div class="fn__flex" style="justify-content: space-between; align-items: center;">
            <p>${((`将块预约到`))}</p>
            <input type="date" id="datepicker" class="b3-text-field fn__size200" />
        </div>
        <div class="b3-typography typofont-1rem"
            style="margin: 0.5rem 0px; box-shadow: 0px 0px 5px var(--b3-theme-on-background);"
        >
            ${html}
        </div>
    </div>
    `;
    const ele = html2ele(html);

    let datePicker = ele.querySelector('#datepicker') as HTMLInputElement;
    // Format date in local timezone
    if (initialDate) {
        const year = initialDate.getFullYear();
        const month = String(initialDate.getMonth() + 1).padStart(2, '0');
        const day = String(initialDate.getDate()).padStart(2, '0');
        datePicker.value = `${year}-${month}-${day}`;
    }
    datePicker.addEventListener('change', () => {
        // Create date in local timezone
        let [year, month, day] = datePicker.value.split('-').map(Number);
        let date = new Date(year, month - 1, day);
        datePicked(date);
    });

    return ele;
}


export async function reserveBlock(blockId) {
    let block = await serverApi.getBlockByID(blockId);
    let kram = await serverApi.getBlockKramdown(block.id);
    let kramdown: string = kram.kramdown;
    // console.log(kramdown);
    kramdown = kramdown.replace(/{: (?:\w+=".+")+}/g, '');
    // console.log(content);

    // let year: string, month: string, day: string = null;
    let resMatch: RegExpMatchArray = null;
    let matchedText: MatchedText = undefined;
    let resDate: Date = null;
    let resIndex: number = Infinity;
    //匹配日期正则表达式
    for (let rule of DatePatternRules) {
        //find
        let match = kramdown.match(rule.pattern);
        // console.log(rule.pattern, match);
        if (match && match.index < resIndex) {
            let [year, month, day] = rule.parse(match);
            //防止出现匹配到的日期是无效的情况
            let date = new Date(`${year}-${month}-${day}`);
            if (date.toString() !== 'Invalid Date') {
                resIndex = match.index;
                resDate = date;
                resMatch = match;
            }
        }
    }

    if (!resDate) {
        // resDate = parseDate(kramdown);
        let result = parse(kramdown, null, { forwardDate: true });
        if (result.length > 0) {
            let parseResult: ParsedResult = result[0];
            resDate = parseResult.start.date();
            resDate.setHours(0, 0, 0, 0);
            matchedText = {
                text: parseResult.text,
                index: parseResult.index
            }
        }
    } else {
        matchedText = {
            text: resMatch[0],
            index: resMatch.index
        }
    }

    //检查是不是过去
    let today = new Date();
    today.setHours(0, 0, 0, 0); //为了方便测试，今天也是可以预约的

    if (!resDate) {
        let fragment = createConfirmDialog(null, kramdown, null, (date: Date) => {
            resDate = date;
        });
        confirmDialog({
            title: ((`没有匹配到日期, 可以手动选择`)),
            content: fragment,
            confirm: () => {
                if (!resDate) {
                    return;
                }
                if (resDate < today) {
                    confirm('Error', `${resDate.toLocaleDateString()}: ${i18n.ReserveMenu.DatePast}`);
                    return;
                }
                doReserveBlock(blockId, resDate)
            },
            width: isMobile() ? "92vw" : "520px",
        })
        return;
    }
    let [year, month, day] = [resDate.getFullYear(), resDate.getMonth() + 1, resDate.getDate()]
    if (resDate < today) {
        confirm('Error', `${year}-${month}-${day}: ${i18n.ReserveMenu.DatePast}`);
        return;
    }

    if (settings.get('PopupReserveDialog')) {
        let fragment = createConfirmDialog(resDate, kramdown, matchedText, (date: Date) => {
            resDate = date;
        });
        confirmDialog({
            title: `${i18n.ReserveMenu.Title}: ${resDate.toLocaleDateString()}?`,
            content: fragment,
            confirm: () => {
                if (resDate < today) {
                    confirm('Error', `${resDate.toLocaleDateString()}: ${i18n.ReserveMenu.DatePast}`);
                    return;
                }
                doReserveBlock(blockId, resDate)
            },
            width: isMobile() ? "92vw" : "520px",
        })
    } else {
        doReserveBlock(blockId, resDate);
    }
}

/**
 * 取消预约
 * @param blockId 块ID
 */
export async function dereserveBlock(blockId: BlockId) {
    serverApi.setBlockAttrs(blockId, {
        'custom-reservation': null, 'memo': null
    });
    showMessage(i18n.DeReserveMenu.Success, 3000, 'info');
}

function doReserveBlock(blockId: BlockId, date: Date) {
    console.debug('Do reservation', blockId, date);
    let dateStr = reservationAttrVal(date);
    serverApi.setBlockAttrs(blockId, {
        'custom-reservation': dateStr, 'memo': `${i18n.ReserveMenu.name} ${dateStr}`
    });
    showMessage(`${i18n.ReserveMenu.Success} ${date.toLocaleDateString()}`, 3000, 'info');
}

interface MatchedText {
    index: number;
    text: string;
}
