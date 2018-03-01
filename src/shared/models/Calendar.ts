import { GoogleCalendar } from '../google/GoogleCalendar';

export interface CalendarData {
    ical?: string;
    googleCalendarId?: string;
    web?: string;
}

export class Calendar {

    private readonly data: CalendarData;

    constructor(data: CalendarData) {
        this.data = data;
    }

    get icalUrl(): string | null {
        if (this.data.ical) {
            return this.data.ical;
        } else if (this.data.googleCalendarId) {
            const cidComponent = encodeURIComponent(this.data.googleCalendarId);
            return `https://calendar.google.com/calendar/ical/${cidComponent}/public/basic.ics`;
        } else {
            return null;
        }
    }

    get events(): Promise<CalendarEvent[]> {
        if (this.data.googleCalendarId) {
            return GoogleCalendar.fetchFeed(this.data.googleCalendarId);
        } else {
            return Promise.reject('Feed not available');
        }
    }

    get subscribeUrl(): string | null {
        if (this.data.googleCalendarId) {
            return `https://calendar.google.com/calendar/r?cid=${this.data.googleCalendarId}`;
        } else {
            return null;
        }
    }
}
