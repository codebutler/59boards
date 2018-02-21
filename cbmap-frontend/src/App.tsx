import MapboxClient from 'mapbox';
import Reboot from 'material-ui/Reboot';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import './App.css';
import Map from './components/Map';
import Sidebar from './components/Sidebar';
import { MAPBOX_TOKEN } from './constants';

const mapboxClient = new MapboxClient(MAPBOX_TOKEN);

export interface AppContext {
    mapboxClient: MapboxClient;
}

interface Props { }

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
            </div>
        );
    }
}

export default App;
