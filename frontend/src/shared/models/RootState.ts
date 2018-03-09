import Location from './Location';
import { ComponentSizes } from './ComponentSizes';
import { RouterState } from 'react-router-redux';

export interface RootState {
    selectedLocation?: Location;
    componentSizes: ComponentSizes;
    routing?: RouterState;
}
