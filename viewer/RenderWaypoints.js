
/* global Cesium GLOBALS */

'use strict';

function RenderWaypoints() {
    this.wpEntities = [];
}

/**
 * Remove all waypoint entities.
 */
RenderWaypoints.prototype.removeAll = function () {
    this.wpEntities.forEach(function(wpEntity) {
        GLOBALS.viewer.entities.remove(wpEntity);
    });
    this.wpEntities = [];
};

/**
 * Replace Waypoints
 */
RenderWaypoints.prototype.set = function (waypoints) {
    this.removeAll();
    this.wpEntities = waypoints.map((p) => renderCircle(p));

    function renderCircle(p) {
        return GLOBALS.viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(p.longitude, p.latitude),
            ellipse: {
                semiMinorAxis: p.radius,
                semiMajorAxis: p.radius,
                height: 0.1,
                outline: true,
                outlineColor: new Cesium.Color(0.97, 1, 0.05, 0.6),
                outlineWidth: 4,
                material: new Cesium.Color(0.97, 1, 0.05, 0.3)
            }
        });
    }
};
