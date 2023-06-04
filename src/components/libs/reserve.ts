import { i18n, lute } from "../../utils";
import { showMessage, confirm } from "siyuan";
import * as serverApi from "../../serverApi";
import { reservation } from "../../global-status";


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
            console.log(match);
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


export async function reserveBlock(blockId) {
    let block = await serverApi.getBlockByID(blockId);
    let kram = await serverApi.getBlockKramdown(block.id);
    let kramdown: string = kram.kramdown;
    // console.log(kramdown);
    kramdown = kramdown.replace(/{: (?:\w+=".+")+}/g, '');
    // console.log(content);

    // let year: string, month: string, day: string = null;
    let resMatch: RegExpMatchArray = null;
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
        showMessage(i18n.ReserveMenu.Date404, 3000, 'error');
        return;
    }
    let [year, month, day] = [resDate.getFullYear(), resDate.getMonth() + 1, resDate.getDate()]
    //检查是不是过去
    let today = new Date();
    today.setHours(0, 0, 0, 0); //为了方便测试，今天也是可以预约的
    if (resDate < today) {
        confirm('Error', `${year}-${month}-${day}: ${i18n.ReserveMenu.DatePast}`);
        return;
    }

    let html = createConfirmDialog(kramdown, resMatch);
    confirm(`${i18n.ReserveMenu.Title}: ${resDate.toLocaleDateString()}?`, html
        , () => doReserveBlock(blockId, resDate)
    );
}

export async function dereserveBlock(blockId: BlockId) {

}

function doReserveBlock(blockId, date: Date) {
    console.log(blockId, date);
    reservation.doReserve(date, blockId);
    reservation.save();
    let dateStr = reservation.dateTemplate(date);
    serverApi.setBlockAttrs(blockId, { 
        'custom-reservation': dateStr, 'memo': `${i18n.ReserveMenu.name} ${dateStr}` 
    });
    showMessage(`${i18n.ReserveMenu.Success} ${date.toLocaleDateString()}`, 3000, 'info');
}

function createConfirmDialog(srcKramdown: string, match: RegExpMatchArray): string {

    function hightLightStr(text: string, beg: number, len: number) {
        let before = text.substring(0, beg);
        let middle = text.substring(beg, beg + len);
        let after = text.substring(beg + len);
        return `${before}<span data-type="mark">${middle}</span>${after}`;
    }
    srcKramdown = hightLightStr(srcKramdown, match.index, match[0].length);
    let html = lute.Md2HTML(srcKramdown);
    // console.log(html);
    html = `
    <p>${i18n.ReserveMenu.Match}: ${match[0]}</p>
    <div class="b3-typography typofont-1rem"
        style="margin: 0.5rem; box-shadow: 0px 0px 5px var(--b3-theme-on-background);"
    >
        ${html}
    </div>`;
    return html;
}
