import { combineReducers } from 'redux';
import events from './fetched-events';
import selectedLocation from './selected-location';
import componentSizes from './component-sizes';
import { routerReducer } from 'react-router-redux';

const allReducers = combineReducers({
    events,
    selectedLocation,
    componentSizes,
    routing: routerReducer
});

export default allReducers;
