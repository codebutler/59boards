declare namespace mapbox {
    interface LatLng {
        latitude: number;
        longitude: number;
    }

    interface GeocodeForwardOptions {
        autocomplete: boolean;
        bbox: number[];
        proximity: LatLng;
    }

    // https://github.com/mapbox/carmen/blob/master/carmen-geojson.md
    interface CarmenLocation {
        place_name: string;
        place_type: string[];
    }
}

declare module 'mapbox' {
    import { ResponsePromise } from "rest";
    import GeocodeForwardOptions = mapbox.GeocodeForwardOptions;

    class MapboxClient {
        constructor(token: String);
        geocodeForward(query: String, options: GeocodeForwardOptions): ResponsePromise;
    }

    export = MapboxClient;
}
