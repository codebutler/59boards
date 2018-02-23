import { ActionType, RootAction } from '../actions';

export default (state = null, action: RootAction) => {
    switch (action.type) {
        case ActionType.SELECT_DISTRICT:
            return action.id;
        case ActionType.CLEAR_SELECTION:
            return null;
        default:
            return state;
    }
};