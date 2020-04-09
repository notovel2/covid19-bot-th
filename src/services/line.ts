import { Client, FlexMessage, FlexComponent } from '@line/bot-sdk';
import { TimelineCovidData } from './moph';
import { createReadStream } from 'fs';
import moment from 'moment';

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
const CHANNEL_ACCESS_TOKEN = "OXQZWe3AGyYfmvmyolHrz4MK6m/ulspwJjwgrg8eMUMsGLB1bFzbudXRIdjDs1qQ+ca2cV1xGNpmLM0RnPCyC+4rlOerNfZ+LJnK04xO9PpL6JzpTpvH0tlQQWFHQHWCIcFwd6g2c0n2e8IHavE4nQdB04t89/1O/w1cDnyilFU=";
const config = {
    channelAccessToken: CHANNEL_ACCESS_TOKEN
}
const client = new Client(config);
const horizontalSpacer: FlexComponent = { type: 'box', layout: 'horizontal', contents: [{ type: 'spacer', size: 'sm' }]};
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

export function createRichMenu(imageName: string) {
    // const path = __dirname + '/' + imageName;
    const path = './' + imageName;
    client.createRichMenu({
        size: {
            width: 2500,
            height: 1686
        },
        selected: true,
        name: 'Today Covid',
        chatBarText: 'Today Covid',
        areas: [
            {
                bounds: {
                    x: 0,
                    y: 0,
                    width: 2500,
                    height: 1686
                },
                action: {
                    type: 'message',
                    text: 'Today'
                }
            }
        ]
    })
    .then(id => {
        console.log('setting rich menu image', id, path);
        client.setRichMenuImage(id, createReadStream(path))
        .then(res => {
            console.log('setting default rich menu', id);
            client.setDefaultRichMenu(id);
        })
        .catch(err => {
            console.log('err', err);
        });
    })
    .catch(reason => {
        console.log(reason);
    });
}

export function reply(message: string, replyToken: string) {
        return client.replyMessage(replyToken, {
            type: 'text',
            text: message
        });
}

export function replyToday(prev: TimelineCovidData, now: TimelineCovidData, replyToken: string) {
    console.log('replying flex message');
    const message: FlexMessage = {
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
    };
    return client.replyMessage(replyToken, message);
}

export function getReplyToken(body: any, index = 0): string {
    if (!body) return null;
    const { events } = body;
    if (!events || !Array.isArray(events) || events.length <= 0) return null;
    return events[index].replyToken;
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