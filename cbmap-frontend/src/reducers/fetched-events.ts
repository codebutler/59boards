import { ActionType, RootAction } from '../actions';

export default (state = null, action: RootAction) => {
    switch (action.type) {
        case ActionType.FETCHED_EVENTS:
            return action.events;
        default:
            return state;
    }
};