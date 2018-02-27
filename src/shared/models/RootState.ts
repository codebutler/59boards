import Location from './Location';
import { ComponentSizes } from './ComponentSizes';
import { RouterState } from 'react-router-redux';

export interface RootState {
    selectedLocation?: Location;
    events?: CalendarEvent[];
    componentSizes: ComponentSizes;
    routing?: RouterState;
}
