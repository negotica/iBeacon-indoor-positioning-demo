import MQTT from "mqtt";
import conf from './config';

class MessageContainer {

    constructor(callbackFunc) {
        this.callbackFunc = callbackFunc;
        this.errors = [];
        this.beacons = {};
        this.stations = [];

        // This function keep only one record of each beacon
        this.processMessage = function (topic, message) {
            // message is Buffer
            let payload = message.toString();
            let msg;
            try {
                msg = JSON.parse(payload);
            } catch (error){
                msg = null;
                console.log(error.message);
            }

            if(msg !== null && msg[0] != null) {
                const station = msg[0].mac;

                for(let i=1; i<msg.length;i++) {
                    let mac = msg[i].mac.toLowerCase();
                    if(this.stations.includes(station)) {

                    } else {
                        this.stations.push(station);
                    }
                    if(this.stations.includes(mac)) {
                        // Dont measure stations rssi
                        // with other stations.
                    } else {
                        if (typeof this.beacons[mac] !== 'object') {
                            // Initialize
                            this.beacons[mac] = {};
                        } else if (typeof this.beacons[mac][station] === 'object') {
                            // Remove old record
                            delete this.beacons[mac][station];
                        }
                        // Insert new record
                        this.beacons[mac][station] = {
                            rssi: parseInt(msg[i].rssi, 10),
                            timestamp: Math.floor(Date.now() / 1000)
                        }
                    }
                    this.callbackFunc(this.beacons);
                }
            }
        };

        /* OPEN WEBSOCKET CONNECTION TO MQTT BROKER */
        let client = MQTT.connect({
            port: conf.port,
            host: conf.host,
            username: conf.username,
            password: conf.password,
            clientId: 'bledemo_' + Math.random().toString(16).substr(2, 8),
            clean: true
        });
        client.on('connect', function () {
            console.log('Connected');
            client.subscribe(conf.channel);
            // client.publish(conf.channel, 'Dashboard is now listening.');
        });
        client.on('message', this.processMessage.bind(this));
        client.on('error', function () {
            this.errors.push("Error occurred");
        });
    }

}
export default MessageContainer;
