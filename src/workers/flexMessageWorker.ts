import { FlexMessage, FlexComponent, TextMessage } from "@line/bot-sdk";
import { TimelineCovidData } from "../services/moph";
import moment from "moment";

const arrowsUrl = {
    up: {
        red: 'https://firebasestorage.googleapis.com/v0/b/covid19-bot-th.appspot.com/o/up-arrow-red.png?alt=media&token=9a914e07-a403-463b-aa08-03e72b15562a',
        green: 'https://firebasestorage.googleapis.com/v0/b/covid19-bot-th.appspot.com/o/up-arrow-green.png?alt=media&token=bd0ff680-1a36-4400-93ff-9ab42376a771',
    },
    down: {
        red: 'https://firebasestorage.googleapis.com/v0/b/covid19-bot-th.appspot.com/o/down-arrow-red.png?alt=media&token=c80e1529-a0c7-4dd3-8efc-8d3640d4f4ec',
        green: 'https://firebasestorage.googleapis.com/v0/b/covid19-bot-th.appspot.com/o/down-arrow-green.png?alt=media&token=0e4eea52-8749-4e1a-82ed-49286b51f33a'
    }
}
const verticalSpacer: FlexComponent = { type: 'box', layout: 'vertical', contents: [{ type: 'spacer', size: 'sm' }]};
enum Direction{
    up,
    down,
    none
}

interface CovidSectionData {
    total: number;
    new: number;
}

export function getRequestLocationMessage(): TextMessage {
    return {
        type: 'text',
        text: 'กรุณาระบุพิกัด',
        quickReply: {
            items: [
                {
                    type: 'action',
                    action: {
                        type: 'location',
                        label: 'ส่งพิกัด'
                    }
                }
            ]
        }
    }
}

export function getTodayFlexMessage(prev: TimelineCovidData, now: TimelineCovidData): FlexMessage {
    return {
        type: 'flex',
        altText: 'Covid19 Today Overview',
        contents: {
            type: "bubble",
            body: {
                type: "box",
                layout: "vertical",
                contents: [
                    {
                        type: "text",
                        text: `ข้อมูลผู้ป่วยโควิด`,
                        weight: "bold",
                        size: "xl",
                        align: 'center',
                        wrap: true
                    },
                    {
                        type: "text",
                        text: `ประจำวันที่ ${moment(now.Date, 'MM/DD/YYYY').format('DD/MM/YYYY')}`,
                        weight: "bold",
                        size: "xl",
                        align: 'center',
                        wrap: true
                    },
                    verticalSpacer,
                    verticalSpacer,
                    getSection('ผู้ติดเชื้อ', { new: now.NewConfirmed, total: now.Confirmed }, { new: prev.NewConfirmed, total: prev.Confirmed}, true),
                    verticalSpacer,
                    getSection('รักษาหายกลับบ้านได้', { new: now.NewRecovered, total: now.Recovered}, { new: prev.NewRecovered, total: prev.Recovered }),
                    verticalSpacer,
                    getSection('จำนวนผู้เสียชีวิต', { new: now.NewDeaths, total: now.Deaths }, { new: prev.NewDeaths, total: prev.Deaths }, true),
                    verticalSpacer,
                    getBox(now.Hospitalized, 'กำลังรักษาตัวทั้งหมด')
                ]
            }
        }
    }
}


function getSection(title: string, now: CovidSectionData, prev: CovidSectionData, isOpposite = false): FlexComponent {
    return {
        type: 'box',
        layout: 'vertical',
        contents: [
            verticalSpacer,
            {
                type: 'text',
                text: title,
                size: 'lg',
                align: 'center',
                weight: 'bold'
            },
            {
                type: 'box',
                layout: 'horizontal',
                contents: [
                    getCompareBox(now.new, 'วันนี้', isOpposite, prev.new),
                    getBox(now.total, 'ทั้งหมด')
                ]
            }
        ]
    };
}

function getCompareBox(current: number, title: string, isOpposite = false, prev?: number): FlexComponent {

    const direction = getDirection(current, prev);
    return {
        type: 'box',
        layout: 'vertical',
        contents: [
            {
                type: 'text',
                text: `${title}`,
                size: 'lg',
                align: 'center',
                wrap: true
            },
            getArrow(direction, isOpposite),
            {
                type: 'text',
                text: `${current}`,
                size: 'xxl',
                weight: 'bold',
                align: 'center'
            }
        ]
    }
}

function getBox(amount: number, title: string): FlexComponent {
    return {
        type: 'box',
        layout: 'vertical',
        contents: [
            {
                type: 'text',
                text: title,
                size: 'lg',
                wrap: true,
                align: 'center'
            },
            { type: 'filler' },
            {
                type: 'text',
                text: `${amount}`,
                size: 'xxl',
                weight: 'bold',
                align: 'center'
            }
        ]
    }
}

function getArrow(direction: Direction, isOpposite = false): FlexComponent {
    let iconUrl;
    switch (direction) {
        case Direction.up:
            iconUrl = isOpposite ? arrowsUrl.up.red : arrowsUrl.up.green;
            break;
        case Direction.down:
            iconUrl = isOpposite ? arrowsUrl.down.green : arrowsUrl.down.red;
            break;
        case Direction.none:
            return { type: 'spacer' };
    }
    return {
        type: 'box',
        layout: 'baseline',
        contents: [
            { type: 'filler' },
            {
                type: 'icon',
                url: iconUrl
            },
            { type: 'filler'}
        ]
    };
}

function getDirection(current: number, prev?: number): Direction {
    if (prev) {
        if (current > prev) {
            return Direction.up;
        }
        if (current < prev) {
            return Direction.down;
        }
    }
    return Direction.none;
}