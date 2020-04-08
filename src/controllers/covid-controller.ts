import { getTimeline } from "../services/moph";

export function getCovidStatToday() {
    return getTimeline();
}