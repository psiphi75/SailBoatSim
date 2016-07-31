
/* global Cesium GLOBALS RenderBoundary */

'use strict';

function RenderWaypoints() {
    this.wpEntities = [];
    this.wpLines = new RenderBoundary();
}

/**
 * Remove all waypoint entities.
 */
RenderWaypoints.prototype.removeAll = function () {
    this.wpEntities.forEach(function(wpEntity) {
        GLOBALS.viewer.entities.remove(wpEntity);
    });
    this.wpEntities = [];
    this.wpLines.remove();
};

/**
 * Replace Waypoints
 */
RenderWaypoints.prototype.set = function (waypoints, renderWaypointLine) {
    var wapointLineColour = new Cesium.Color(0.97, 1, 0.05, 0.6);
    this.removeAll();
    this.wpEntities = waypoints.map((p) => renderCircle(p));

    if (renderWaypointLine) {
        this.wpLines.set(waypoints.map((p) => ({ latitude: p.latitude, longitude: p.longitude })), wapointLineColour);
    }

    function renderCircle(p) {
        return GLOBALS.viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(p.longitude, p.latitude),
            ellipse: {
                semiMinorAxis: p.radius,
                semiMajorAxis: p.radius,
                height: 0.1,
                outline: true,
                outlineColor: wapointLineColour,
                outlineWidth: 2,
                material: new Cesium.Color(0.97, 1, 0.05, 0.3)
            }
        });
    }
};
