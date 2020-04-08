import request, { RequestPromiseOptions } from 'request-promise';
import moment from 'moment';

export interface CovidData  {
    Confirmed: number;
    Recovered: number;
    Hospitalized: number;
    Deaths: number;
    NewConfirmed: number;
    NewRecovered: number;
    NewHospitalized: number;
    NewDeaths: number;
}

export interface TodayCovid extends CovidData {
    UpdateDate: Date;
    Source: string;
    DevBy: string;
    SeverBy: string;
}

export interface TimelineCovid {
    UpdateDate: Date;
    Source: string;
    DevBy: string;
    SeverBy: string;
    Data: TimelineCovidData[];
}

export interface TimelineCovidData extends CovidData {
    Date: Date;
}

const endpoint = 'https://covid19.th-stat.com/api/open';
const baseOptions: RequestPromiseOptions = {
    method: 'POST',
    json: true
};

interface Cache {
    valideDate: Date;
    data: TimelineCovid;
}

const cache: { [id: string]: Cache } = {};

export function getToday(): Promise<TodayCovid> {
    return request(`${endpoint}/today`, baseOptions).then();
}

export function getTimeline(): Promise<TimelineCovid> {
    const now = moment(moment.now());
    const { timeline } = cache;
    console.log('timeline', timeline);
    
    if (timeline && timeline.valideDate && moment(timeline.valideDate).isAfter(now)) {
        return Promise.resolve(timeline.data);
    }
    console.log(`requesting to ${endpoint}/timeline`);
    return request(`${endpoint}/timeline`, baseOptions)
        .then((response: TimelineCovid) => {
            const { Data } = response;
            if (Data && Array.isArray(Data) && Data.length > 0) {
                const valideDate = moment(Data[Data.length - 1].Date).add(1, 'days');
                cache.timeline = {
                    data: response,
                    valideDate: valideDate.toDate()
                }
            }
            return response;
        });
    
}