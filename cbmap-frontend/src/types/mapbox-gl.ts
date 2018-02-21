import 'mapbox-gl';
import { Feature, GeoJsonProperties, Polygon } from 'geojson';

declare module 'mapbox-gl' {
    interface MapMouseEvent {
        features: Feature<Polygon, GeoJsonProperties>[];
    }
}
