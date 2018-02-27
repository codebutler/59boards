import Location from '../models/Location';
import { FetchedEventsAction } from './fetch-events';
import { push } from 'react-router-redux';
import { Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { Feature, FeatureCollection, GeoJsonProperties, Polygon } from 'geojson';
import DISTRICTS_GEOJSON from '../../shared/data/districts-geo.json';

export enum ActionType {
    SELECT_LOCATION = 'SELECT_LOCATION',
    FETCHED_EVENTS = 'FETCHED_EVENTS',
    COMPONENT_RESIZED = 'COMPONENT_RESIZED',
}

interface SelectLocationAction {
    type: ActionType.SELECT_LOCATION;
    location: Location | null;
}

interface ComponentResizedAction {
    type: ActionType.COMPONENT_RESIZED;
    id: string;
    size: Size;
}

export type RootAction =
    | SelectLocationAction
    | FetchedEventsAction
    | ComponentResizedAction;

export const selectDistrict = (districtId: number) => {
    return push('/districts/' + districtId);
};

export const selectLocation = (location: Location | null): ThunkAction<void, SelectLocationAction, null> => {
    return (dispatch: Dispatch<SelectLocationAction>) => {
        dispatch({
            type: ActionType.SELECT_LOCATION,
            location: location
        });
        if (location !== null) {
            const featureCollection = DISTRICTS_GEOJSON as FeatureCollection<Polygon, GeoJsonProperties>;
            const districtFeature = featureCollection.features
                .find((feature: Feature<Polygon, GeoJsonProperties>) => {
                    return booleanPointInPolygon(location.center, feature.geometry!);
                });
            const districtId = (districtFeature && districtFeature.properties)
                ? districtFeature.properties.BoroCD : null;
            dispatch(selectDistrict(districtId));
        }
    };
};

export const clearSelection = () => {
    return (dispatch: Dispatch<RootAction>) => {
        dispatch(push('/'));
        dispatch(selectLocation(null));
    };
};

export const componentResized = (id: string, size: Size): ComponentResizedAction => {
    return {
        type: ActionType.COMPONENT_RESIZED,
        id: id,
        size: size
    };
};
