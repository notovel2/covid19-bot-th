import { Router } from "express";
import { getReplyToken, getMessage } from "../services/line";
import { getCovidStatToday, requestLocation, getCovidArea } from "../controllers/covid-controller";

const router = Router();

router.post('/covid', (req, res) => {
    console.log('/covid');
    const message = getMessage(req.body);
    const replyToken = getReplyToken(req.body);
    let promise: Promise<any> = Promise.resolve();
    const { type } = message;
    if (type === 'text') {
        const { text } = message;
        switch(message.text) {
            case 'today':
                promise = getCovidStatToday(replyToken);
                break;
            case 'area':
                promise = requestLocation(replyToken);
                break;
        }
    }
    else if (type === 'location') {
        const { latitude, longitude } = message;
        getCovidArea(replyToken, { latitude, longitude })
    }
    
    promise.then(() => res.send())
        .catch(err => res.send(err));
});

export default router;