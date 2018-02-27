import { ActionType, RootAction } from '../actions';

export default (state = null, action: RootAction) => {
    switch (action.type) {
        case ActionType.SIDEBAR_RESIZED:
            return { width: action.width, height: action.height };
        default:
            return state;
    }
};
