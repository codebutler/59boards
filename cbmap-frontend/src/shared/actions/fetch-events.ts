import { Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { ActionType } from './index';

export interface FetchedEventsAction {
    type: ActionType.FETCHED_EVENTS;
    events: CalendarEvent[];
    error?: Error;
}

export const fetchEvents = (districtId: number): ThunkAction<void, FetchedEventsAction, null> =>
    (dispatch: Dispatch<FetchedEventsAction>, getState) => {
        // FIXME fetch(`/data/events/${districtId}.json`)
        fetch('/data/events/sample.json')
            .then((resp) => {
                if (resp.ok) {
                    return resp.json();
                }
                throw new Error(`${resp.status}: ${resp.statusText}`);
            })
            .then((events: CalendarEvent[]) => {
                dispatch({ type: ActionType.FETCHED_EVENTS, events: events });
            })
            .catch((err) => {
                dispatch({ type: ActionType.FETCHED_EVENTS, events: [], error: err });
            });
    };
