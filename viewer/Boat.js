/* global Cesium DataJSONFile Realtime Model */
'use strict';


function Boat(source, url, readyCallback) {

    this.BOAT_MODEL = 'models/ship.gltf';
    this.BOAT_DATA_JSON = './lastLog.json';
    this.SIMULATION_URL = 'localhost';

    var self = this;

    //
    // Try to load the realtime connection, if that fails load the JSON file
    //

    var channel = 'Honestly Round Down Quark';
    switch (source) {
        case 1:   // Actual: Load from disk
            self.dataSource = new DataJSONFile(this.BOAT_DATA_JSON, channel, readyCallback);
            break;
        case 2:
            channel = 'Simulation';
            self.dataSource = new Realtime(url, channel, readyCallback);
            break;
        default:
            console.error('Invalid source');
    }

}

Boat.prototype.render = function (time) {

    var status = this.dataSource.getStatus(time);
    if (!status || !status.boat || !status.boat.gps || status.boat.gps.latitude === 0) return null;

    status.boat.gps.altitude = -0.1;   // Put it on the ground / sea level

    var posOrient = this.getPositionAndOrientation(status);
    if (!this.model) {
        // Called only once.
        this.model = new Model('Boat', this.BOAT_MODEL, posOrient, true, {
            minimumPixelSize: 100,
            maximumScale: 1000,
            scale: 0.33,
            castShadows: true,
            receiveShadows: true,
            runAnimations: false
        });
    } else {
        this.model.setPositionOrientation(posOrient);
    }

    return status;

};


/**
 * Given the AHRS values (boatStatus.attitude) and position we can calcuate the local heading, pitch and roll for the
 * body.
 * @param  {object} boatStatus The information about the boat.
 * @return {object}            position and attitude.
 */
Boat.prototype.getPositionAndOrientation = function(status) {
    var position = Cesium.Cartesian3.fromDegrees(status.boat.gps.longitude, status.boat.gps.latitude, status.boat.gps.altitude);

    // Cesium has different heading
    var heading = status.boat.attitude.heading * Math.PI / 180 - Math.PI / 2;

    // Pitch goes opposite direction in Cesium
    var pitch = -status.boat.attitude.pitch * Math.PI / 180;
    var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, heading, pitch, status.boat.attitude.roll * Math.PI / 180);

    return {
        position: position,
        orientation: orientation
    };
};
