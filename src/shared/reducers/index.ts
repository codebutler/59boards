import { combineReducers } from 'redux';
import events from './fetched-events';
import selectedDistrictId from './selected-district';
import selectedLocation from './selected-location';

const allReducers = combineReducers({
  events,
  selectedDistrictId,
  selectedLocation,
});

export default allReducers;