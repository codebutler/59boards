import { GCalApi } from '../google/GCalApi';
import moment from 'moment';

export interface CalendarData {
    ical?: string;
    web?: string;
    scraperId?: string;
    googleCalendarId?: string;
}

export class Calendar {

    private readonly data: CalendarData;

    constructor(data: CalendarData) {
        this.data = data;
    }

    get events(): Promise<CalendarEvent[]> {
        if (this.data.googleCalendarId) {
            return GCalApi.fetchFeed(this.data.googleCalendarId);
        }
        if (this.data.scraperId) {
            const url = `/scraper-data/${this.data.scraperId}.json`;
            return fetch(url)
                .then((resp) => {
                    if (!resp.ok) {
                        throw Error(`${resp.status} ${resp.statusText}`);
                    }
                    return resp.json() as Promise<CalendarEvent[]>;
                })
                .then((events) =>
                    events.filter((event) => {
                        const timeMin = moment().subtract(1, 'day');
                        const timeMax = moment().add(1, 'month');
                        const eventDate = moment(event.date);
                        return eventDate.isAfter(timeMin) && eventDate.isBefore(timeMax);
                    }));
        }
        return Promise.reject('Feed not available');
    }

    get icalUrl(): string | undefined {
        if (this.data.ical) {
            return new URL(this.data.ical, window.location.href).toString();
        } else if (this.data.scraperId) {
            return new URL(`/scraper-data/${this.data.scraperId}.ics`, window.location.href).toString();
        } else if (this.data.googleCalendarId) {
            const cidComponent = encodeURIComponent(this.data.googleCalendarId);
            return `https://calendar.google.com/calendar/ical/${cidComponent}/public/basic.ics`;
        }
        return undefined;
    }
}
