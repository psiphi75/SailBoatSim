/* global Cesium GLOBALS */
'use strict';

function RenderGrid() {
}

RenderGrid.prototype.remove = function() {
    if (this.gridEntity) GLOBALS.viewer.entities.remove(this.gridEntity);
};

RenderGrid.prototype.set = function(position) {
    this.remove();

    this.gridEntity = GLOBALS.viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(
                    trunc(position.longitude, 6),
                    trunc(position.latitude, 6)),
        ellipse: {
            semiMinorAxis: 1000.0,
            semiMajorAxis: 1000.0,
            height: 0.1,
            material: new Cesium.GridMaterialProperty({
                color: new Cesium.Color(1, 1, 1, 0.5),
                cellAlpha: 0.0,
                lineCount: new Cesium.Cartesian2(200, 200),
                lineThickness: new Cesium.Cartesian2(0.5, 0.5)
            })
        }
    });

    function trunc(val, dp) {
        var exp = Math.exp(10, dp);
        return Math.floor(val * exp) / exp;
    }
};
