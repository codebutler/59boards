import bbox from '@turf/bbox';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import autobind from 'autobind-decorator';
import { Feature, GeoJsonProperties, Polygon } from 'geojson';
import mapboxgl from 'mapbox-gl';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { clearSelection, RootAction, selectDistrict } from '../../shared/actions/index';
import { DUMMY_BORO_IDS, MAPBOX_TOKEN, NYC_BOUNDING_BOX } from '../../shared/constants';
import Location from '../../shared/models/Location';
import { RootState } from '../../shared/models/RootState';
import EventData = mapboxgl.EventData;
import LngLatLike = mapboxgl.LngLatLike;
import MapMouseEvent = mapboxgl.MapMouseEvent;
import Marker = mapboxgl.Marker;
import Point = mapboxgl.Point;

mapboxgl.accessToken = MAPBOX_TOKEN;

interface StateProps {
    selectedLocation: Location;
    selectedDistrictId: number;
}

interface DispatchProps {
    onDistrictSelected: (district: number) => void;
    onClearSelection: () => void;
}

type Props = StateProps & DispatchProps;

interface State {
    hoveredFeature?: Feature<Polygon, GeoJsonProperties>;
    hoveredPoint?: Point;
    hoveredLngLat?: LngLatLike;
}

class Map extends Component<Props, State> {

    state: State = {};
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

    componentWillReceiveProps(newProps: Props) {
        const {selectedDistrictId, selectedLocation} = newProps;

        const oldSelectedLocation = this.props.selectedLocation;
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

        const oldSelectedDistrictId = this.props.selectedDistrictId;
        if (selectedDistrictId && selectedDistrictId !== oldSelectedDistrictId) {
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
            this.map.fitBounds(bounds, {
                padding: 20,
                duration: 500
            });
        } else {
            this.zoomToCity();
        }
    }

    render() {
        return (
            <div ref={el => this.mapContainer = el} className="absolute top right left bottom" />
        );
    }

    @autobind
    private zoomToCity(animate: boolean = true) {
        this.map.fitBounds(NYC_BOUNDING_BOX, {
            padding: 20,
            duration: animate ? 500 : 0
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

        this.zoomToCity();
    }
}

const mapStateToProps = (state: RootState): StateProps => {
    return {
        selectedLocation: state.selectedLocation!,
        selectedDistrictId: state.selectedDistrictId!
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
)(Map);
