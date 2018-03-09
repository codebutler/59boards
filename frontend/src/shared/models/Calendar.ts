import { GCalApi } from '../google/GCalApi';
import moment from 'moment';

export interface CalendarData {
    ical?: string;
    json?: string;
    web?: string;
    scraped: boolean;
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
        } else if (this.data.json) {
            return fetch(this.data.json)
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
        } else if (this.data.googleCalendarId) {
            const cidComponent = encodeURIComponent(this.data.googleCalendarId);
            return `https://calendar.google.com/calendar/ical/${cidComponent}/public/basic.ics`;
        }
        return undefined;
    }

    get gcalSubscribeUrl(): string | undefined {
        if (this.data.googleCalendarId) {
            return `https://calendar.google.com/calendar/r?cid=${this.data.googleCalendarId}`;
        } else if (this.data.ical) {
            return `https://calendar.google.com/calendar/r?cid=${this.icalUrl}`;
        }
        return undefined;
    }
}
