import React from 'react';
//import StreetView from '../img/street-view.svg';
import StreetView from '../SVGIconComponents/StreetView';
// Beacon icon examples
//import MapMarker from '../img/map-marker.svg';
//import MapPin from '../img/map-pin.svg';
//import Crosshairs from '../img/crosshairs.svg';
//import Bullseye from '../img/bullseye.svg';

class Pin extends React.Component {

    render() {
        let width = this.props.width || 40;
        let height = this.props.height || 40;
        return (
            <svg
                id={this.props.mac}
                viewBox={"0 0 " + (width + 40) + " " + (height + 40)}
                width={width}
                height={height}
                x={this.props.x}
                y={this.props.y}
            >
                <StreetView preserveAspectRatio="xMaxYMax meet" />
                <text x="-10px" y="35px">{this.props.mac.substr(9, 9).toUpperCase()}</text>
            </svg>
        );
    }
}

export default Pin;
