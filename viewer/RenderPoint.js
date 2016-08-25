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
            outlineColor: color,
            pixelSize: 5
        }
    });
}
