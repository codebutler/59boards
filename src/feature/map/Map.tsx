import bbox from '@turf/bbox';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import autobind from 'autobind-decorator';
import { Feature, GeoJsonProperties, Polygon } from 'geojson';
import mapboxgl from 'mapbox-gl';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { clearSelection, RootAction, selectDistrict } from '../../shared/actions';
import { DUMMY_BORO_IDS, MAPBOX_TOKEN, NYC_BOUNDING_BOX } from '../../shared/constants';
import Location from '../../shared/models/Location';
import { RootState } from '../../shared/models/RootState';
import withWidth, { WithWidthProps } from 'material-ui/utils/withWidth';
import { Breakpoint } from 'material-ui/styles/createBreakpoints';
import { bind, debounce } from 'lodash-decorators';
import EventData = mapboxgl.EventData;
import LngLatLike = mapboxgl.LngLatLike;
import MapMouseEvent = mapboxgl.MapMouseEvent;
import Marker = mapboxgl.Marker;
import Point = mapboxgl.Point;
import LngLatBoundsLike = mapboxgl.LngLatBoundsLike;

mapboxgl.accessToken = MAPBOX_TOKEN;

interface StateProps {
    selectedLocation: Location;
    selectedDistrictId: number;
    appSize: Size;
    sidebarSize?: Size;
}

interface DispatchProps {
    onDistrictSelected: (district: number) => void;
    onClearSelection: () => void;
}

type Props = StateProps & DispatchProps;
type PropsWithStyles = Props & WithWidthProps;

interface State {
    hoveredFeature?: Feature<Polygon, GeoJsonProperties>;
    hoveredPoint?: Point;
    hoveredLngLat?: LngLatLike;
}

class Map extends Component<PropsWithStyles, State> {

    state: State = {};
    map: mapboxgl.Map;
    mapLoaded = false;
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
        return {
            top: topPadding,
            right: defaultPadding,
            bottom: defaultPadding,
            left: defaultPadding
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

        map.on('load', this.onMapLoad);

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

        map.on('mouseleave', 'district-fills', () => {
            this.setState({
                hoveredFeature: undefined,
                hoveredPoint: undefined,
                hoveredLngLat: undefined,
            });
        });

        map.on('click', 'district-fills', (e: MapMouseEvent) => {
            this.setState({
                hoveredFeature: undefined,
                hoveredPoint: undefined,
                hoveredLngLat: undefined,
            });

            const districtId = e.features[0].properties!.BoroCD;
            this.props.onDistrictSelected(districtId);
        });

        this.locationMarker = new mapboxgl.Marker(null!!, {});
    }

    componentDidUpdate() {
        if (!this.mapLoaded) {
            return;
        }
        const { hoveredFeature, hoveredLngLat } = this.state;
        if (hoveredFeature) {
            const boroCd = hoveredFeature.properties!.BoroCD;
            this.map.setFilter('district-fills-hover', ['==', 'BoroCD', boroCd]);
        } else {
            this.map.setFilter('district-fills-hover', ['==', 'BoroCD', '']);
        }

        const {selectedLocation, selectedDistrictId} = this.props;
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
    }

    componentWillReceiveProps(newProps: PropsWithStyles) {
        const oldSelectedLocation = this.props.selectedLocation;
        const selectedLocation = newProps.selectedLocation;

        if (selectedLocation && selectedLocation !== oldSelectedLocation) {
            const districtFeature = this.map.querySourceFeatures('districts')
                .find((feature: Feature<Polygon, GeoJsonProperties>) => {
                    return booleanPointInPolygon(selectedLocation.center, feature.geometry!);
                });
            const districtId = (districtFeature && districtFeature.properties)
                ? districtFeature.properties.BoroCD : null;
            this.props.onDistrictSelected(districtId);

            return; // Will get called again with selectedDistrictId set.
        }

        const oldSidebarSize = this.props.sidebarSize;
        const sidebarSize = newProps.sidebarSize;

        const oldWidth = this.props.width;
        const width = newProps.width;

        const oldSelectedDistrictId = this.props.selectedDistrictId;
        const selectedDistrictId = newProps.selectedDistrictId;

        const oldAppHeight = this.props.appSize.height;
        const appHeight = newProps.appSize.height;

        if (selectedDistrictId !== oldSelectedDistrictId ||
            sidebarSize !== oldSidebarSize ||
            width !== oldWidth ||
            oldAppHeight !== appHeight) {

            if (selectedDistrictId) {
                const districtFeatures = this.map.querySourceFeatures('districts')
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
                this.fitMapBounds(bounds, newProps);
            } else {
                this.fitMapBounds(NYC_BOUNDING_BOX, newProps);
            }
        }
    }

    render() {
        return (
            <div ref={el => this.mapContainer = el} className="absolute top right left bottom" />
        );
    }

    @bind()
    @debounce(500)
    private fitMapBounds(bounds: LngLatBoundsLike, props: PropsWithStyles) {
        console.log('fit bounds!!', props.width, props.sidebarSize, Map.getMapPadding(props.width, props.sidebarSize));
        this.map.fitBounds(bounds, {
            padding: Map.getMapPadding(props.width, props.sidebarSize),
            duration: 500
        });
    }

    @autobind
    private onMapLoad(event: EventData) {
        const map = event.target;

        map.addSource('districts', {
            type: 'geojson',
            data: '/data/districts.json'
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

        this.fitMapBounds(NYC_BOUNDING_BOX, this.props);
        this.mapLoaded = true;
    }
}

const mapStateToProps = (state: RootState): StateProps => {
    return {
        selectedLocation: state.selectedLocation!,
        selectedDistrictId: state.selectedDistrictId!,
        appSize: state.componentSizes.app,
        sidebarSize: state.componentSizes.sidebar
    };
};

const mapDispatchToProps = (dispatch: Dispatch<RootAction>): DispatchProps => {
    return {
        onDistrictSelected: (districtId: number) => {
            dispatch(selectDistrict(districtId));
        },
        onClearSelection: () => {
            dispatch(clearSelection());
        }
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withWidth()<Props>(Map));
