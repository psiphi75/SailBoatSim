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
            height: 0.01,
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
