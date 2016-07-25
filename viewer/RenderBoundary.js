/* global Cesium GLOBALS */

'use strict';

function RenderBoundary() {
}

RenderBoundary.prototype.set = function (points) {

    this.remove();

    var ALTITUDE = 0.1;

    var pointsArray = points.map(function (p) {
        return Cesium.Cartesian3.fromDegrees(p.longitude, p.latitude, ALTITUDE);
    });

    // Close the boundary box
    pointsArray.push(pointsArray[0]);

    this.boundary = GLOBALS.viewer.entities.add({
        position: pointsArray[0],
        polyline: {
            positions: pointsArray,
            width: new Cesium.ConstantProperty(5),
            material: new Cesium.Color(0.97, 0.1, 0.1, 0.6),
            followSurface: new Cesium.ConstantProperty(true)
        }
    });
};


RenderBoundary.prototype.remove = function () {
    if (this.boundary) {
        GLOBALS.viewer.entities.remove(this.boundary);
    }
    this.boundary = null;
};
