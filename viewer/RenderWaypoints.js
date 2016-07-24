
/* global Cesium GLOBALS */

'use strict';

function RenderWaypoints(waypoints) {  // eslint-disable-line no-unused-vars

    waypoints.forEach((p) => {
        renderCircle(p);
    });

    function renderCircle(p) {
        GLOBALS.viewer.entities.add({
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

}
