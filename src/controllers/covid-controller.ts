import { getTimeline } from "../services/moph";
import { replyToday, reply, replyWithQuickAction } from "../services/line";
import { getRequestLocationMessage } from "../workers/flexMessageWorker";
import { QuickReplyItem } from "@line/bot-sdk";

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export function getCovidStatToday(replyToken: string) {
    return getTimeline()
        .then(result => {
            if (!result) reply('ระบบขัดข้องกรุณาลองภายหลัง ขออภัยในความไม่สะดวก', replyToken);
            const { Data } = result;
            const lastIndex = Data.length - 1;
            const prev = Data[lastIndex - 1];
            const current = Data[lastIndex];
            replyToday(prev, current, replyToken);
        });
}

export function requestLocation(replyToken: string) {
    const quickReplyItems: QuickReplyItem[] = [
        {
            type: 'action',
            action: {
                type: 'location',
                label: 'ส่งพิกัด'
            }
        }
    ]
    return replyWithQuickAction('กรุณาระบุพิกัด', replyToken, quickReplyItems);
}

export function getCovidArea(replyToken: string, coordinates: Coordinates) {
    return reply(`${coordinates.latitude}, ${coordinates.longitude}`, replyToken);
}