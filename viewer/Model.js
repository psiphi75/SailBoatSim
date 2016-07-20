/* global Cesium GLOBALS */

function Model(name, filename, initialAttitudePosition, tracked, options) {

    var defaults = {
        uri: filename,
        minimumPixelSize: 100,
        maximumScale: 1000,
    };

    for (let o in options) {
        defaults[o] = options[o];
    }

    var model = new Cesium.ModelGraphics(defaults);

    this.entity = new Cesium.Entity({
        name: name,
        position: initialAttitudePosition.position,
        orientation: initialAttitudePosition.orientation,
        model: model
    });

    GLOBALS.viewer.entities.add(this.entity);
    if (tracked) {
        GLOBALS.viewer.trackedEntity = this.entity;
    }
}

Model.prototype.setPositionOrientation = function (obj) {
    this.entity.position = obj.position;
    this.entity.orientation = obj.orientation;
};
