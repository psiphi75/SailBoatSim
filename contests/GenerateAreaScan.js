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

'use strict';

// {
//     "type": "area-scanning",
//     "latitude": 41.685819332268764,
//     "longitude": -8.841232995992668,
//     "width": 100
// }

var Position = require('sailboat-utils/Position');
var util = require('sailboat-utils/util');

exports.generate = function generateAreaScan(obj) {
    var perpendicularWindHeading = util.wrapDegrees(obj.windHeading - 90);
    var squareRadius = obj.width / 10 / 2;

    // p1 is top left corner of grid
    var p1 = new Position(obj);

    // p1c is the center of the top left square
    var p1c = p1.gotoHeading(perpendicularWindHeading + 45, Math.sqrt(2) * squareRadius);
    var pOffset = p1c;

    //
    // Generate the squares as waypoints
    //
    var waypoints = [];
    for (var x = 0; x < 10; x += 1) {
        var wp = pOffset;
        for (var y = 0; y < 10; y += 1) {
            if (x < 5 && y >= 5) {
                // do nothing
            } else {
                waypoints.push(createWaypoint(wp));
            }
            wp = wp.gotoHeading(obj.windHeading, squareRadius * 2);
        }
        pOffset = pOffset.gotoHeading(perpendicularWindHeading, squareRadius * 2);
    }

    //
    // Generate the boundary
    //
    var b1 = p1;
    var b2 = b1.gotoHeading(perpendicularWindHeading, obj.width);
    var b3 = b2.gotoHeading(obj.windHeading, obj.width);
    var b4 = b3.gotoHeading(perpendicularWindHeading + 180, obj.width / 2);
    var b5 = b4.gotoHeading(obj.windHeading + 180, obj.width / 2);
    var b6 = b5.gotoHeading(perpendicularWindHeading + 180, obj.width / 2);
    var boundary = [b1, b2, b3, b4, b5, b6].map(function (b) { return createBoundaryPoint(b); });

    return {
        'type': 'area-scanning',
        'waypoints': waypoints,
        'boundary': boundary,
        'timeLimit': obj.timeLimit,
        'timeToStart': obj.timeToStart,
    };

    function createWaypoint(pos) {
        return {
            latitude: pos.latitude,
            longitude: pos.longitude,
            achieved: false,
            type: 'circle',
            radius: squareRadius
        };
    }

    function createBoundaryPoint(pos) {
        return {
            latitude: pos.latitude,
            longitude: pos.longitude
        };
    }

};
