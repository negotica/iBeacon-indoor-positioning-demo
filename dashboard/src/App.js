import React, { Component } from 'react';
import './App.css';
import 'semantic-ui-css/semantic.min.css';
import MessageStack from './MessageStack/MessageStack.js';
import KnownBeaconsList from './Settings/Settings.js';
import { merge } from 'lodash';
import { Sidebar, Container, Menu, Icon } from 'semantic-ui-react';
import Floorplan from './Floorplan/Floorplan.js';


class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            beacons: {},
            sortedBeacons: {},
            knownBeacons: [],
            stations: {},
            actualStations: {
                AC233FC0FA77: { x: 14, y: 270 },
                AC233FC0FA82: { x: 64, y: 613 },
                AC233FC0FA6F: { x: 238, y: 271 },
                AC233FC0FAAB: { x: 254, y: 567 },
                AC233FC0FA74: { x: 315, y: 465 },
                AC233FC0FAA9: { x: 321, y: 290 },
                AC233FC0FA81: { x: 460, y: 205 },
                AC233FC0FA7D: { x: 506, y: 392 },
                AC233FC0FAAA: { x: 388, y: 751 },
                AC233FC0FA76: { x: 288, y: 754 },
            },
            visible: false,
            width: 800,
            height: 600,
            widthMeters: 8.5
        };
    }

    receiver = function (beaconList) {
        this.setState({ beacons: beaconList });
        //this.beaconMacList();
        this.updateStationMacList();
        let beacons = this.beaconMacList();
        this.setState({ sortedBeacons: beacons });
    };

    toggleVisibility = () => this.setState({ visible: !this.state.visible });

    beaconMacList = () => {
        let objectList = {};
        let list = [];
        let b = this.state.beacons;
        if (typeof b === 'undefined' || Object.keys(b).length === 0) {
            return [];
        }

        for (let beacon in b) {
            for (let mac in b[beacon]) {
                if (typeof objectList[mac] !== 'undefined') {
                    if (objectList[mac].rssi < b[beacon][mac].rssi) {
                        objectList = merge(objectList, b[beacon]);
                    }
                } else {
                    objectList = merge(objectList, b[beacon]);
                }
            }
        }

        for (let beacon in objectList) {
            list.push({ mac: beacon, rssi: objectList[beacon].rssi, timestamp: objectList[beacon].timestamp })
        }
        return list.sort(function (a, b) {
            return a.rssi - b.rssi;
        }).reverse();
    };

    updateStationMacList = () => {
        let b = this.state.beacons;
        if (typeof b === 'undefined' || Object.keys(b).length === 0) {
            return [];
        }

        let thisStations = this.state.stations;
        for (let beacon in b) {
            for (let station in b[beacon]) {
                if (typeof thisStations[station] === 'undefined') {
                    thisStations[station] = {
                        x: Math.floor((Math.random() * 500) + 1),
                        y: Math.floor((Math.random() * 300) + 1)
                    };
                    this.setState({ stations: thisStations });
                }
            }
        }
    };

    componentWillMount() {
        this.setState({ height: window.innerHeight, width: window.innerWidth });
    }

    componentDidMount() {
        // Start MQTT subscription
        new MessageStack(this.receiver.bind(this));
        this.updateStationMacList();
    }

    render() {
        const { visible } = this.state;
        return (
            <div className="App">
                <Sidebar.Pushable as={Container} style={{ width: this.state.width + 'px', height: this.state.height + 'px' }} fluid>
                    <Sidebar as={Menu} animation='slide out' visible={visible} icon='labeled' vertical inverted width='wide'>
                        <Menu.Item name='beacons'>
                            <KnownBeaconsList beacons={this.state.sortedBeacons} knownBeacons={this.state.knownBeacons} />
                        </Menu.Item>
                    </Sidebar>
                    <Sidebar.Pusher>
                        <Container style={{ width: this.state.width + 'px', height: this.state.height + 'px' }} fluid>
                            <Floorplan beacons={this.state.beacons} stations={this.state.actualStations} height={this.state.height} width={this.state.width} widthMeters={this.state.widthMeters} />
                            <Icon style={{ position: 'absolute' }} onClick={this.toggleVisibility} className={'menubutton'} name='sidebar' size='large' />
                        </Container>
                    </Sidebar.Pusher>
                </Sidebar.Pushable>
            </div>
        );
    }
}

export default App;
