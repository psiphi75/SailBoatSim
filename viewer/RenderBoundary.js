/* global Cesium GLOBALS */

'use strict';

function RenderBoundary() {
}

RenderBoundary.prototype.set = function (points, colour) {

    colour = colour || new Cesium.Color(0.97, 0.1, 0.1, 0.6);
    var ALTITUDE = 0.2;

    this.remove();

    var pointsArray = points.map(function (p) {
        return Cesium.Cartesian3.fromDegrees(p.longitude, p.latitude, ALTITUDE);
    });

    // Close the boundary box
    pointsArray.push(pointsArray[0]);

    this.boundary = GLOBALS.viewer.entities.add({
        position: pointsArray[0],
        polyline: {
            positions: pointsArray,
            width: new Cesium.ConstantProperty(4),
            material: colour,
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
