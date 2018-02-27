import { combineReducers } from 'redux';
import events from './fetched-events';
import selectedDistrictId from './selected-district';
import selectedLocation from './selected-location';
import componentSizes from './component-sizes';

const allReducers = combineReducers({
    events,
    selectedDistrictId,
    selectedLocation,
    componentSizes
});

export default allReducers;
