import { Router } from "express";
import { reply, replyToday, getReplyToken } from "../services/line";
import { getCovidStatToday } from "../controllers/covid-controller";

const router = Router();

router.post('/covid', (req, res) => {
    getCovidStatToday()
        .then(result => {
            const replyToken = getReplyToken(req.body);
            if (!result) reply('ระบบขัดข้องกรุณาลองภายหลัง ขออภัยในความไม่สะดวก', replyToken);
            const { Data } = result;
            const lastIndex = Data.length - 1;
            const prev = Data[lastIndex - 1];
            const current = Data[lastIndex];
            replyToday(prev, current, replyToken)
                .then(val => res.send('complete'))
                .catch(err => res.send(`error with ${err.message}`));
        });
});

export default router;