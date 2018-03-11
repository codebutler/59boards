import bbox from '@turf/bbox';
import { Feature, FeatureCollection, GeoJsonProperties, Polygon } from 'geojson';
import mapboxgl from 'mapbox-gl';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { RootAction, selectDistrict } from '../../shared/actions';
import { DUMMY_BORO_IDS, MAPBOX_TOKEN, NYC_BOUNDING_BOX } from '../../shared/constants';
import Location from '../../shared/models/Location';
import { RootState } from '../../shared/models/RootState';
import withWidth, { WithWidthProps } from 'material-ui/utils/withWidth';
import { Breakpoint } from 'material-ui/styles/createBreakpoints';
import { bind, debounce } from 'lodash-decorators';
import districtIdFromRoute from '../../shared/selectors/district-id-from-route';
import DISTRICTS_GEOJSON from '../../shared/data/districts-geo.json';
import EventData = mapboxgl.EventData;
import LngLatLike = mapboxgl.LngLatLike;
import MapMouseEvent = mapboxgl.MapMouseEvent;
import Marker = mapboxgl.Marker;
import Point = mapboxgl.Point;
import LngLatBoundsLike = mapboxgl.LngLatBoundsLike;
import { isMobileSafari } from '../../shared/utils/device';

mapboxgl.accessToken = MAPBOX_TOKEN;

interface StateProps {
    selectedLocation: Location;
    selectedDistrictId: number;
    appSize: Size;
    sidebarSize?: Size;
}

interface DispatchProps {
    onDistrictSelected: (district: number) => void;
}

type Props = StateProps & DispatchProps;
type PropsWithStyles = Props & WithWidthProps;

interface State {
    hoveredFeature?: Feature<Polygon, GeoJsonProperties>;
    hoveredPoint?: Point;
    hoveredLngLat?: LngLatLike;
    mapLoaded: boolean;
}

class Map extends Component<PropsWithStyles, State> {

    map: mapboxgl.Map;
    popup: mapboxgl.Popup;
    mapContainer: HTMLDivElement | null;
    locationMarker: Marker;

    private static boroDisplayText(boroCD: number) {
        const districtNum = parseInt(boroCD.toString().substr(1), 10);
        const boroIndex = boroCD.toString()[0];
        const boroNames = { 1: 'Manhattan', 2: 'Bronx', 3: 'Brooklyn', 4: 'Queens', 5: 'Staten Island'};
        return `${boroNames[boroIndex]} CB${districtNum}`;
    }

    private static getMapPadding(width: Breakpoint, sidebarSize?: Size): mapboxgl.PaddingOptions {
        const defaultPadding = 20;
        const topPadding = (width === 'xs' && sidebarSize)
            ? defaultPadding + sidebarSize.height
            : defaultPadding;
        const leftPadding = (width !== 'xs' && sidebarSize)
            ? defaultPadding + sidebarSize.width
            : defaultPadding;
        return {
            top: topPadding,
            right: defaultPadding,
            bottom: defaultPadding,
            left: leftPadding
        };
    }

    constructor(props: PropsWithStyles) {
        super(props);

        this.state = {
            mapLoaded: false
        };
    }

    componentDidMount() {
        const map = this.map = new mapboxgl.Map({
            container: this.mapContainer!,
            style: 'mapbox://styles/mapbox/light-v9',
            center: [-74.0060, 40.7128],
            zoom: 11
        });

        this.popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false
        });

        this.locationMarker = new mapboxgl.Marker(null!!, {});

        map.on('load', this.onMapLoad);

        map.on('click', 'district-fills', (e: MapMouseEvent) => {
            this.setState({
                hoveredFeature: undefined,
                hoveredPoint: undefined,
                hoveredLngLat: undefined,
            });

            const districtId = e.features[0].properties!.BoroCD;
            this.props.onDistrictSelected(districtId);
        });

        // https://stackoverflow.com/a/46051711
        if (!isMobileSafari()) {
            map.on('mouseenter', 'district-fills', () => {
                map.getCanvas().style.cursor = 'pointer';
            });

            map.on('mouseleave', 'district-fills', () => {
                map.getCanvas().style.cursor = '';
            });

            map.on('mousemove', 'district-fills', (e: MapMouseEvent) => {
                this.setState({
                    hoveredFeature: e.features[0],
                    hoveredPoint: e.point,
                    hoveredLngLat: e.lngLat
                });
            });

            map.on('mouseleave', 'district-fills', (e: MapMouseEvent) => {
                this.setState({
                    hoveredFeature: undefined,
                    hoveredPoint: undefined,
                    hoveredLngLat: undefined,
                });
            });
        }
    }

    componentWillUpdate(nextProps: PropsWithStyles, nextState: State) {
        const curProps = this.props;
        const curState = this.state;

        if (!nextState.mapLoaded) {
            return;
        }

        const { hoveredFeature, hoveredLngLat } = nextState;
        if (hoveredFeature) {
            const boroCd = hoveredFeature.properties!.BoroCD;
            this.map.setFilter('district-fills-hover', ['==', 'BoroCD', boroCd]);
        } else {
            this.map.setFilter('district-fills-hover', ['==', 'BoroCD', '']);
        }

        const {selectedLocation, selectedDistrictId} = nextProps;
        if (selectedLocation) {
            this.locationMarker.setLngLat(selectedLocation.center);
            this.locationMarker.addTo(this.map);
        } else {
            this.locationMarker.remove();
        }

        const filter = ['==', 'BoroCD', selectedDistrictId ? selectedDistrictId : ''];
        this.map.setFilter('district-borders-selected', filter);
        this.map.setFilter('district-fills-selected', filter);

        if (hoveredFeature && hoveredLngLat) {
            this.popup
                .setLngLat(hoveredLngLat)
                .setHTML(Map.boroDisplayText(hoveredFeature.properties!.BoroCD))
                .addTo(this.map);
        } else {
            this.popup.remove();
        }

        const oldSidebarSize = curProps.sidebarSize;
        const sidebarSize = nextProps.sidebarSize;

        const oldWidth = curProps.width;
        const width = nextProps.width;

        const oldSelectedDistrictId = curProps.selectedDistrictId;

        const oldAppHeight = curProps.appSize.height;
        const appHeight = nextProps.appSize.height;

        if (selectedDistrictId !== oldSelectedDistrictId ||
            sidebarSize !== oldSidebarSize ||
            width !== oldWidth ||
            oldAppHeight !== appHeight ||
            nextState.mapLoaded !== curState.mapLoaded) {

            if (selectedDistrictId) {
                const featureCollection = DISTRICTS_GEOJSON as FeatureCollection<Polygon, GeoJsonProperties>;
                const districtFeatures = featureCollection.features
                    .filter((feature: Feature<Polygon, GeoJsonProperties>) => {
                        return feature.properties!.BoroCD === selectedDistrictId;
                    });
                if (districtFeatures.length <= 0) {
                    return;
                }
                const bounds = new mapboxgl.LngLatBounds();
                districtFeatures.forEach((feature: Feature<Polygon, GeoJsonProperties>) => {
                    const [minX, minY, maxX, maxY] = bbox(feature);
                    bounds.extend(new mapboxgl.LngLatBounds([minX, minY], [maxX, maxY]));
                });
                this.fitMapBounds(bounds, nextProps);
            } else {
                this.fitMapBounds(NYC_BOUNDING_BOX, nextProps);
            }
        }
    }

    render() {
        return (
            <div ref={el => this.mapContainer = el} />
        );
    }

    @bind()
    @debounce(100)
    private fitMapBounds(bounds: LngLatBoundsLike, props: PropsWithStyles) {
        this.map.fitBounds(bounds, {
            padding: Map.getMapPadding(props.width, props.sidebarSize),
            duration: 500
        });
    }

    @bind()
    private onMapLoad(event: EventData) {
        const map = event.target;

        map.addSource('districts', {
            type: 'geojson',
            data: DISTRICTS_GEOJSON
        });

        map.addLayer({
            'id': 'district-fills',
            'type': 'fill',
            'source': 'districts',
            'layout': {},
            'paint': {
                'fill-color': '#6d74b6',
                'fill-opacity': 0.12
            },
            'filter': ['!in', 'BoroCD', ...DUMMY_BORO_IDS]
        });

        map.addLayer({
            'id': 'district-fills-hover',
            'type': 'fill',
            'source': 'districts',
            'layout': {},
            'paint': {
                'fill-color': '#6d74b6',
                'fill-opacity': 0.4
            },
            'filter': ['==', 'BoroCD', '']
        });

        map.addLayer({
            'id': 'district-fills-selected',
            'type': 'fill',
            'source': 'districts',
            'layout': {},
            'paint': {
                'fill-color': '#b66d6d',
                'fill-opacity': 0.4
            },
            'filter': ['==', 'BoroCD', '']
        });

        map.addLayer({
            'id': 'district-borders',
            'type': 'line',
            'source': 'districts',
            'layout': {},
            'paint': {
                'line-color': '#1f336b',
                'line-width': 1
            },
            'filter': ['!in', 'BoroCD', ...DUMMY_BORO_IDS]
        });

        map.addLayer({
            'id': 'district-borders-selected',
            'type': 'line',
            'source': 'districts',
            'layout': {},
            'paint': {
                'line-color': '#6b1f1f',
                'line-width': 2
            },
            'filter': ['==', 'BoroCD', '']
        });

        this.setState({ mapLoaded: true });
    }
}

const mapStateToProps = (state: RootState): StateProps => {
    const selectedDistrictId = districtIdFromRoute(state)!;
    return {
        selectedLocation: state.selectedLocation!,
        selectedDistrictId: selectedDistrictId,
        appSize: state.componentSizes.app,
        sidebarSize: state.componentSizes.sidebar
    };
};

const mapDispatchToProps = (dispatch: Dispatch<RootAction>): DispatchProps => {
    return {
        onDistrictSelected: (districtId: number) => {
            dispatch(selectDistrict(districtId));
        }
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)<Props>(withWidth()(Map));
