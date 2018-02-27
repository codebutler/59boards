import MapboxClient from 'mapbox';
import Reboot from 'material-ui/Reboot';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import './App.css';
import Map from '../map/Map';
import Sidebar from '../sidebar/Sidebar';
import { MAPBOX_TOKEN } from '../../shared/constants';
import ReactResizeDetector from 'react-resize-detector';
import { connect } from 'react-redux';
import { componentResized, RootAction } from '../../shared/actions';
import { Dispatch } from 'redux';

const mapboxClient = new MapboxClient(MAPBOX_TOKEN);

export interface AppContext {
    mapboxClient: MapboxClient;
}

interface DispatchProps {
    onResize: (width: number, height: number) => void;
}

type Props = DispatchProps;

class App extends Component<Props> {

    static childContextTypes = {
        mapboxClient: PropTypes.instanceOf(MapboxClient).isRequired
    };

    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    getChildContext(): AppContext {
        return { mapboxClient };
    }

    render() {
        return (
            <div className="App">
                <Reboot/>
                <Sidebar/>
                <Map/>
                <ReactResizeDetector
                    handleWidth={true}
                    handleHeight={true}
                    onResize={this.props.onResize}
                />
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch: Dispatch<RootAction>): DispatchProps => {
    return {
        onResize: (width: number, height: number) => {
            dispatch(componentResized('app', { width, height }));
        }
    };
};

export default connect(
    null,
    mapDispatchToProps
)<Props>(App);
