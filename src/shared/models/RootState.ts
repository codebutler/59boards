import Location from './Location';
import { ComponentSizes } from './ComponentSizes';

export interface RootState {
    selectedLocation?: Location;
    selectedDistrictId?: number;
    events?: CalendarEvent[];
    componentSizes: ComponentSizes;
}
