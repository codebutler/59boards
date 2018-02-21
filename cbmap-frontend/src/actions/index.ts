import Location from '../models/Location';

export enum ActionType {
    SELECT_DISTRICT = 'SELECT_DISTRICT',
    SELECT_LOCATION = 'SELECT_LOCATION',
    CLEAR_SELECTION = 'CLEAR_SELECTION'
}

export type Action =
    ({ type: ActionType.SELECT_DISTRICT, id: number }) |
    ({ type: ActionType.SELECT_LOCATION, location: Location }) |
    ({ type: ActionType.CLEAR_SELECTION });

export const selectDistrict = (districtId: number): Action => {
    return {
        type: ActionType.SELECT_DISTRICT,
        id: districtId
    };
};

export const selectLocation = (location: Location): Action => {
    return {
        type: ActionType.SELECT_LOCATION,
        location: location
    };
};

export const clearSelection = (): Action => {
    return {
        type: ActionType.CLEAR_SELECTION
    };
};