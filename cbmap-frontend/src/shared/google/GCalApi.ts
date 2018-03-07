import moment from 'moment';

export module GCalApi {
    // https://developers.google.com/google-apps/calendar/v3/reference/events/list
    export interface EventsList {
        items: EventsItem[];
    }

    // https://developers.google.com/google-apps/calendar/v3/reference/events#resource
    export interface EventsItem {
        id: string;
        summary: string;
        description: string;
        location: string;
        start: DateOrDateTime;
        end: DateOrDateTime;
    }

    interface DateOrDateTime {
        date?: string;
        dateTime?: string;
    }

    export function fetchFeed(calendarId: string): Promise<CalendarEvent[]> {
        return fetch(feedUrl(calendarId))
            .then((resp) => {
                if (!resp.ok) {
                    throw Error(`${resp.status} ${resp.statusText}`);
                }
                return resp.json();
            })
            .then((json) => json as GCalApi.EventsList)
            .then((list) => list.items
                .map((item) => ({
                    id: item.id,
                    date: item.start.dateTime || item.start.date!,
                    summary: item.summary,
                    location: item.location,
                    description: item.description
                }))
                .sort((a, b) => moment(a.date).valueOf() - moment(b.date).valueOf())
            );
    }

    function feedUrl(calendarId: string) {
        const calendarIdEncoded = encodeURIComponent(calendarId);
        const timeMin = encodeURIComponent(moment().subtract(1, 'day').format());
        const timeMax = encodeURIComponent(moment().add(1, 'month').format());
        return 'https://clients6.google.com/calendar/v3/calendars/'
            + calendarId
            + '/events'
            + `?calendarId=${calendarIdEncoded}`
            + '&singleEvents=true'
            + '&timeZone=America%2FNew_York'
            + '&maxAttendees=1'
            + '&maxResults=250'
            + '&sanitizeHtml=true'
            + `&timeMin=${timeMin}`
            + `&timeMax=${timeMax}`
            + '&key=AIzaSyBNlYH01_9Hc5S1J9vuFmu2nUqBZJNAXxs';
    }
}
