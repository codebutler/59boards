import { combineReducers } from 'redux';
import selectedLocation from './selected-location';
import componentSizes from './component-sizes';
import { routerReducer } from 'react-router-redux';

const allReducers = combineReducers({
    selectedLocation,
    componentSizes,
    routing: routerReducer
});

export default allReducers;
