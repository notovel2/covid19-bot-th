import request, { RequestPromiseOptions, RequestPromise } from 'request-promise';

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

export function getToday(): RequestPromise<TodayCovid> {
    return request(`${endpoint}/today`, baseOptions);
}

export function getTimeline(): RequestPromise<TimelineCovid> {
    return request(`${endpoint}/timeline`, baseOptions);
}