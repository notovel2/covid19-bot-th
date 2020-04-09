import { Client, FlexMessage, FlexComponent, QuickReplyItem } from '@line/bot-sdk';
import { TimelineCovidData } from './moph';
import { createReadStream } from 'fs';
import { getTodayFlexMessage } from '../workers/flexMessageWorker';

const CHANNEL_ACCESS_TOKEN = "OXQZWe3AGyYfmvmyolHrz4MK6m/ulspwJjwgrg8eMUMsGLB1bFzbudXRIdjDs1qQ+ca2cV1xGNpmLM0RnPCyC+4rlOerNfZ+LJnK04xO9PpL6JzpTpvH0tlQQWFHQHWCIcFwd6g2c0n2e8IHavE4nQdB04t89/1O/w1cDnyilFU=";
const config = {
    channelAccessToken: CHANNEL_ACCESS_TOKEN
}
const client = new Client(config);

export function reply(message: string, replyToken: string) {
        return client.replyMessage(replyToken, {
            type: 'text',
            text: message
        });
}

export function replyWithQuickAction(message: string, replyToken: string, quickReplyItems: QuickReplyItem[] = []) {
    return client.replyMessage(replyToken, {
        type: 'text',
        text: message,
        quickReply: {
            items: quickReplyItems
        }
    });
}

export function replyToday(prev: TimelineCovidData, now: TimelineCovidData, replyToken: string) {
    console.log('replying flex message');
    const message = getTodayFlexMessage(prev, now);
    return client.replyMessage(replyToken, message);
}

export function getReplyToken(body: any, index = 0): string {
    if (!body) return null;
    const { events } = body;
    if (!events || !Array.isArray(events) || events.length <= 0) return null;
    return events[index].replyToken;
}

export function getMessage(body: any, index = 0) {
    if (!body) return null;
    const { events } = body;
    if (!events || !Array.isArray(events) || events.length <= 0) return null;
    const { type, message } = events[index];
    return (type === 'message') ? message : null; 
}