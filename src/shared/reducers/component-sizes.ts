import { ActionType, RootAction } from '../actions';
import { ComponentSizes } from '../models/ComponentSizes';

const DEFAULT_STATE: ComponentSizes = {
    app: { width: 0, height: 0}
};

export default (state: ComponentSizes = DEFAULT_STATE, action: RootAction) => {
    switch (action.type) {
        case ActionType.COMPONENT_RESIZED:
            const newState = { ...state };
            newState[action.id] = action.size;
            return newState;
        default:
            return state;
    }
};
