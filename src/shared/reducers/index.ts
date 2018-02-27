import { combineReducers } from 'redux';
import events from './fetched-events';
import selectedDistrictId from './selected-district';
import selectedLocation from './selected-location';
import sidebarSize from './sidebar-size';

const allReducers = combineReducers({
    events,
    selectedDistrictId,
    selectedLocation,
    sidebarSize
});

export default allReducers;
