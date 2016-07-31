/*********************************************************************
 *                                                                   *
 *   Copyright 2016 Simon M. Werner                                  *
 *                                                                   *
 *   Licensed to the Apache Software Foundation (ASF) under one      *
 *   or more contributor license agreements.  See the NOTICE file    *
 *   distributed with this work for additional information           *
 *   regarding copyright ownership.  The ASF licenses this file      *
 *   to you under the Apache License, Version 2.0 (the               *
 *   "License"); you may not use this file except in compliance      *
 *   with the License.  You may obtain a copy of the License at      *
 *                                                                   *
 *      http://www.apache.org/licenses/LICENSE-2.0                   *
 *                                                                   *
 *   Unless required by applicable law or agreed to in writing,      *
 *   software distributed under the License is distributed on an     *
 *   "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY          *
 *   KIND, either express or implied.  See the License for the       *
 *   specific language governing permissions and limitations         *
 *   under the License.                                              *
 *                                                                   *
 *********************************************************************/


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
