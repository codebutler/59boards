import Location from '../models/Location';
import { FetchedEventsAction } from './fetch-events';

export enum ActionType {
    SELECT_DISTRICT = 'SELECT_DISTRICT',
    SELECT_LOCATION = 'SELECT_LOCATION',
    CLEAR_SELECTION = 'CLEAR_SELECTION',
    FETCHED_EVENTS = 'FETCHED_EVENTS',
    SIDEBAR_RESIZED = 'SIDEBAR_RESIZED',
    COMPONENT_RESIZED = 'COMPONENT_RESIZED'
}

interface SelectDistrictAction {
    type: ActionType.SELECT_DISTRICT;
    id: number;
}

interface SelectLocationAction {
    type: ActionType.SELECT_LOCATION;
    location: Location;
}

interface ClearSelectionAction {
    type: ActionType.CLEAR_SELECTION;
}

interface SidebarResizedAction {
    type: ActionType.SIDEBAR_RESIZED;
    width: number;
    height: number;
}

interface ComponentResizedAction {
    type: ActionType.COMPONENT_RESIZED;
    id: string;
    size: Size;
}

export type RootAction =
    | SelectDistrictAction
    | SelectLocationAction
    | ClearSelectionAction
    | FetchedEventsAction
    | SidebarResizedAction
    | ComponentResizedAction;

export const selectDistrict = (districtId: number): SelectDistrictAction => {
    return {
        type: ActionType.SELECT_DISTRICT,
        id: districtId
    };
};

export const selectLocation = (location: Location): SelectLocationAction => {
    return {
        type: ActionType.SELECT_LOCATION,
        location: location
    };
};

export const clearSelection = (): ClearSelectionAction => {
    return {
        type: ActionType.CLEAR_SELECTION
    };
};

export const sidebarResized = (width: number, height: number): SidebarResizedAction => {
    return {
        type: ActionType.SIDEBAR_RESIZED,
        width: width,
        height: height
    };
};

export const componentResized = (id: string, size: Size): ComponentResizedAction => {
    return {
        type: ActionType.COMPONENT_RESIZED,
        id: id,
        size: size
    };
};
