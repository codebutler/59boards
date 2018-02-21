import { combineReducers } from 'redux';
import { Action, ActionType } from '../actions';

const selectedDistrictId = (state = null, action: Action) => {
  switch (action.type) {
    case ActionType.SELECT_DISTRICT:
      return action.id;
    case ActionType.CLEAR_SELECTION:
      return null;
    default:
      return state;
  }
};

const selectedLocation = (state = null, action: Action) => {
  switch (action.type) {
    case ActionType.SELECT_LOCATION:
      return action.location;
    case ActionType.CLEAR_SELECTION:
      return null;
    default:
      return state;
  }
};

const allReducers = combineReducers({
  selectedDistrictId,
  selectedLocation,
});

export default allReducers;