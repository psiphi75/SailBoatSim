/* global Model Cesium */

function Arrow(name, colour) {
    'use strict';
    this.model = `models/arrow-${colour}.gltf`;
    this.name = name;
}

/**
 * Render the Arrow at a given latitude/longitude.
 * @param  {object} status Object with latitude, longitude, heading (degrees)
 * @return {object}        The status
 */
Arrow.prototype.render = function (status) {

    if (!status || status.latitude === undefined) return null;

    var posOrient = this.getPositionAndOrientation(status);
    if (posOrient === null) return null;

    if (!this.model) {
        // Called only once.
        this.model = new Model(this.name, this.model, posOrient, false, {
            minimumPixelSize: 100,
            maximumScale: 1000,
            scale: 0.33
        });
    } else {
        this.model.setPositionOrientation(posOrient);
    }

    return status;

};

Arrow.prototype.getPositionAndOrientation = function(status) {
    status.altitude = 1;
    var position = Cesium.Cartesian3.fromDegrees(status.longitude, status.latitude, status.altitude);

    // Cesium has different heading
    var heading = status.heading;  // It already points to true north
    heading *= Math.PI / 180;               // to radians
    while (heading > Math.PI) heading -= 2 * Math.PI;
    while (heading < -Math.PI) heading += 2 * Math.PI;
    heading += Math.PI / 2;                 // to Cesium coordinates
    // console.log(`${status.timestamp}: Boat Direction: ${status.attitude.heading.toFixed(1)}\tSpeed:${status.velocity.speed.toFixed(1)}\tWind Direction: ${status.windvane.headingTrue.toFixed(1)},\tSpeed: ${(status.windvane.speed).toFixed(1)}`);

    // Pitch goes opposite direction in Cesium
    var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, heading, 0, 0);

    return {
        position: position,
        orientation: orientation
    };
};
