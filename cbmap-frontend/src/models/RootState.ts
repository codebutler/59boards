import Location from './Location';

export interface RootState {
    selectedLocation?: Location;
    selectedDistrictId?: number;
    events?: CalendarEvent[];
}