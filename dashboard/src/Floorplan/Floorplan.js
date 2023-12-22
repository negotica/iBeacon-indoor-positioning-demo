import React from 'react';
import floor_image_file from '../img/Floorplan.png';
import './Floorplan.css';
import Pin from './BeaconPin';
import Station from '../Satellite/Satellite';
import { locate } from '../Positioner/PositionCalculator.js';


class Floorimage extends React.Component {
    constructor(props) {
        super(props);
        this.coords = {};
        this.lastMeasurements = [];
        this.avgMeasurements = [];
        this.measurements = {};
        this.measureTime = 10;
        this.calculating = false;
        this.mode = 'init';
        this.testDevice = 'AC233FAD1B7D';

        const sta = localStorage.getItem('stations');
        if (typeof sta === 'undefined') {
            // init first
        } else {
            this.state = {
                stations: JSON.parse(sta)
            };
        }
        this.updateBeaconPositions();
    };

    stationPosition = function (p) {
        console.log(p);
        let sta = this.props.stations;
        sta[p.mac] = {
            x: p.x,
            y: p.y
        };
        this.setState({ stations: sta });
        localStorage.setItem('stations', JSON.stringify(sta));
    };

    updateBeaconPositions = function () {
        // Beacons
        this.beaconCoords = {};
        if (this.props.beacons) {
            let b = this.props.beacons;
            for (var key in b) {
                if (Object.keys(b[key]).length >= 3 && Object.keys(this.props.stations).length >= 3) {
                    // CALCULATE POSITION COORDINATES
                    console.log(b[key], this.props.stations, (this.props.width / this.props.widthMeters));
                    let coords = locate(b[key], this.props.stations, (this.props.width / this.props.widthMeters));
                    // console.log(coords);
                    if (coords !== null) {
                        this.beaconCoords[key] = coords;
                    } else {
                        console.log("Failed to locate:");
                        console.debug(b[key]);
                    }
                } else {

                }
            }
        }
    };

    returnAverage = function (sum) {
        let totalX = 0;
        let totalY = 0;

        for (let i = 0; i < sum.length; i++) {
            const obj = sum[i][this.testDevice];

            totalX += obj.x;
            totalY += obj.y;
        }

        return {
            AC233FAD1B7D: {
                x: (totalX / sum.length), y: (totalY / sum.length)
            }
        };
    }

    render() {
        let stationIcons;
        let beaconIcons;
        // Stations
        let sta = this.props.stations;
        // console.log("Floorplan.js, num stations: " + Object.keys(this.props.stations).length);
        if (Object.keys(this.props.stations).length >= 3) {
            stationIcons = Object.keys(sta).map(key =>
                <Station key={key} mac={key} x={sta[key].x} y={sta[key].y} setPosiotionCallback={this.stationPosition.bind(this)}></Station>
            )
        }

        switch (this.mode) {
            case 'start':
                this.lastMeasurements.push(this.beaconCoords);
                break;

            case 'init':
                if (Object.keys(this.beaconCoords).length > 0) {
                    setTimeout(() => {
                        //Get avg of last measurement
                        const avg = this.returnAverage(this.lastMeasurements);
                        this.lastMeasurements = [];
                        this.avgMeasurements.push(avg);
                        this.mode = 'init';
                        console.log('Average pos found! \n', avg[this.testDevice]);
                        this.measurements = this.avgMeasurements;

                    }, this.measureTime * 1000);
                    this.mode = 'start';
                    console.log('Getting MQTT messages from recievers...')
                }
                break;
            default:
                break;
        }

        this.updateBeaconPositions();
        if (Object.keys(this.measurements).length > 0) {
            beaconIcons = Object.keys(this.measurements).map(key =>
                <Pin key={key} mac={key} x={this.measurements[key][this.testDevice].x} y={this.measurements[key][this.testDevice].y}></Pin>
            );
        }
        return (
            <svg className="floorplan" viewBox={"0 0 " + this.props.width + " " + this.props.height}
                width={this.props.width} height={this.props.height}
                style={{ backgroundImage: "url(" + floor_image_file + ")" }}>
                {beaconIcons}
                {stationIcons}
            </svg>
        );
    }
}

export default Floorimage;
