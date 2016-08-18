

/* global Cesium GLOBALS */

'use strict';

/**
 * Render a point on the screen.  Options as:
 * @param {object} options latitude, longitude, color {r, g, b}, label, id
 */
function RenderPoint(options) {

    if (typeof options !== 'object') return;

    if (options.latitude === undefined || options.longitude === undefined) return;
    var position = Cesium.Cartesian3.fromDegrees(options.longitude, options.latitude, 0.2);

    var color;
    if (options.color) {
        color = new Cesium.Color(options.color.red, options.color.green, options.color.blue);
    } else {
        color = Cesium.Color.WHITE;
    }

    if (options.label) {
        var labels = GLOBALS.viewer.scene.primitives.add(new Cesium.LabelCollection());
        labels.add({
            position: position,
            text: options.label,
            altitude: 2,
            fillColor: color
        });
    }

    if (GLOBALS.viewer.entities.getById(options.id)) {
        GLOBALS.viewer.entities.removeById(options.id);
    }
    GLOBALS.viewer.entities.add({
        id: options.id,
        position: position,
        point: {
            color: color,
            pixelSize: 5
        }
    });
}
