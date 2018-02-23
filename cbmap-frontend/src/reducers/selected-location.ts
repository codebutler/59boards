import { ActionType, RootAction } from '../actions';

export default (state = null, action: RootAction) => {
    switch (action.type) {
        case ActionType.SELECT_LOCATION:
            return action.location;
        case ActionType.CLEAR_SELECTION:
            return null;
        default:
            return state;
    }
};