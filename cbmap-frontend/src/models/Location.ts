import LngLatLike = mapboxgl.LngLatLike;
import { Coord } from '@turf/helpers';

export default interface Location {
    place_name?: string;
    center: LngLatLike & Coord;
}