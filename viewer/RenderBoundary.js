/* global Cesium GLOBALS */

'use strict';

function RenderBoundary(points) {

    var pointsArray = points.reduce(function (prev, p) {
                              return prev.concat([p.longitude, p.latitude]);
                          }, []);
    // console.log(pointList);
    // var pointsArray = flatten(pointList);
    var polygon = new Cesium.PolygonOutlineGeometry({
        polygonHierarchy: new Cesium.PolygonHierarchy(
            Cesium.Cartesian3.fromDegreesArray(pointsArray)
        ),
        attributes: {
            color: new Cesium.ColorGeometryInstanceAttribute(1.0, 0.0, 0.0, 0.0),
            // lineThickness: new Cesium.Cartesian2(0.5, 0.5)
        }
    });
    var geometry = Cesium.PolygonOutlineGeometry.createGeometry(polygon);

    this.boundary = GLOBALS.viewer.scene.primitives.add(new Cesium.Primitive({
        geometryInstances: geometry,
        appearance: new Cesium.PerInstanceColorAppearance()
    }));
}

// var primitive = new Cesium.Primitive({
//   geometryInstances : new Cesium.GeometryInstance({
//     geometry : new Cesium.PolylineGeometry({
//       positions : Cesium.Cartesian3.fromDegreesArray([
//         0.0, 0.0,
//         5.0, 0.0
//       ]),
//       width : 10.0,
//       vertexFormat : Cesium.PolylineMaterialAppearance.VERTEX_FORMAT
//     })
//   }),
//   appearance : new Cesium.PolylineMaterialAppearance({
//     material : Cesium.Material.fromType('Color')
//   })
// });
