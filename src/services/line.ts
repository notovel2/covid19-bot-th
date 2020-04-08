import { Client, FlexMessage, FlexComponent } from '@line/bot-sdk';
import { TimelineCovidData } from './moph';
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
const CHANNEL_ACCESS_TOKEN = "v0noUgB4AgUiU5BTyFYwBOdL65zslntzDSUDgADFp5/Ymj+ZGyRUSqZ83AZ2QXIJ8UDdQ+k3vJYqg2X5g6FftxndsG3c02pBm/+JxvJvUlFe+jCIMUl68CAcF5z9aj3Goxv5CxFpT1e3LPzydvkHFwdB04t89/1O/w1cDnyilFU=";
const config = {
    channelAccessToken: CHANNEL_ACCESS_TOKEN
}
const client = new Client(config);
const spacer: FlexComponent = { type: 'box', layout: 'horizontal', contents: [{ type: 'spacer' }]}

enum Direction{
    up,
    down,
    none
}

export function reply(message: string, replyToken: string) {
        return client.replyMessage(replyToken, {
            type: 'text',
            text: message
        });
}

export function replyToday(prev: TimelineCovidData, now: TimelineCovidData, replyToken: string) {
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
                    spacer,
                    {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                            getCompareBox(prev.NewConfirmed, now.NewConfirmed, 'ผู้ติดเชื้อรายใหม่', true),
                            getCompareBox(prev.NewRecovered, now.NewRecovered, 'จำนวนคนที่รักษาหายในวันนี้'),
                            getCompareBox(prev.NewDeaths, now.NewDeaths, 'จำนวนผู้เสียชีวิตในวันนี้', true),
                        ]
                    },
                    spacer,
                    {
                        type: 'box',
                        layout: 'horizontal',
                        contents: [
                            getBox(now.Confirmed, 'ผู้ติดเชื้อทั้งหมด'),
                            getBox(now.Recovered, 'จำนวนคนที่รักษาหายแล้วทั้งหมด'),
                            getBox(now.Deaths, 'จำนวนผู้เสียชีวิตทั้งหมด')
                        ]
                    },
                    spacer,
                    getBox(now.Hospitalized, 'กำลังรักษาตัวทั้งหมด')
                ]
            }
        }
    };
    console.log('replying flex message');
    
    return client.replyMessage(replyToken, message);
}

export function getReplyToken(body: any, index = 0): string {
    if (!body) return null;
    const { events } = body;
    if (!events || !Array.isArray(events) || events.length <= 0) return null;
    return events[index].replyToken;
}

function getCompareBox(prev: number, current: number, title: string, isOpposite = false): FlexComponent {
    const direction = (current > prev) ? Direction.up : ((current < prev) ? Direction.down : Direction.none);
    return {
        type: 'box',
        layout: 'vertical',
        contents: [
            getArrow(direction, isOpposite),
            {
                type: 'box',
                layout: 'baseline',
                contents: [
                    { type: 'filler' },
                    
                    { type: 'filler'}
                ]
            },
            {
                type: 'text',
                text: `${current}`,
                size: 'lg',
                weight: 'bold',
                align: 'center'
            },
            {
                type: 'text',
                text: `${title}`,
                size: 'xxs',
                align: 'center',
                wrap: true
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
                text: `${amount}`,
                size: 'md',
                weight: 'bold',
                align: 'center'
            },
            {
                type: 'text',
                text: title,
                size: 'xxs',
                wrap: true,
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