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
    util.assertNumber(obj.width);
    util.assertNumber(obj.numGridPoints);
    util.assertNumber(obj.windHeading);
    util.assertNumber(obj.latitude, -90, 90);
    util.assertNumber(obj.longitude, -180, 180);

    var courseWidth = obj.width;
    var numGridPoints = obj.numGridPoints;
    var windHeading = obj.windHeading;

    var perpendicularWindHeading = util.wrapDegrees(windHeading - 90);
    var sepDist = courseWidth / numGridPoints;
    var waypointRadius = sepDist * 0.667 / 2;

    // p1 is top left corner of grid
    var p1 = new Position(obj);

    // p1c is the center of the top left square
    var p1c = p1.gotoHeading(perpendicularWindHeading + 45, 1 / Math.sqrt(2) * sepDist);

    // wp0 is the outside the boundary, we must pass this area to cross the start line
    var wp0 = createWaypoint(p1c.gotoHeading(perpendicularWindHeading + 180, sepDist), 'start');

    //
    // Large courses with 10 grid peices have a different path that those with 8 grid peices.  We need to take
    // this into account.
    //
    var isEvenCourse = ((numGridPoints / 2) % 2) === 0;

    //
    // Generate the squares as waypoints
    //
    var waypoints = [wp0];
    var row = 1; // Parallel to the wind
    var col = 0; // Perpendicular to the wind
    var colDir = 1;
    var wp = new Position(wp0);
    var wpDir = perpendicularWindHeading;
    var halfWayBound = numGridPoints / 2;
    var totalNumCourseWps = numGridPoints * numGridPoints * 0.75;
    if (isEvenCourse) {
         halfWayBound = numGridPoints / 2 + 1;
         totalNumCourseWps += numGridPoints / 2 - 1;
    }

    // console.log('row, col, numGridPoints, colDir, wpDir, rowFloor')
    for (var i = 1; i <= totalNumCourseWps; i += 1) {

        var rowFloor = (row < halfWayBound) ? 1 : numGridPoints / 2 + 1;

        if (col === numGridPoints && colDir === 1) {
            row += 1;
            colDir = -1;
            wpDir = windHeading;
        } else if (col === rowFloor && colDir === -1) {
            row += 1;
            colDir = 1;
            wpDir = windHeading;
        } else {
            col += colDir;
            if (colDir === 1) {
                wpDir = perpendicularWindHeading;
            } else {
                wpDir = perpendicularWindHeading + 180;
            }
        }
        // shorten the course just slightly
        if (isEvenCourse && col === 1 && row === halfWayBound) {
            col += 1;
            row -= 1;
            wp = wp.gotoHeading(perpendicularWindHeading + 45, Math.sqrt(2) * sepDist);
        } else {
            wp = wp.gotoHeading(wpDir, sepDist);
        }

        // console.log(i, row, col, numGridPoints, colDir, wpDir, rowFloor)
        waypoints.push(createWaypoint(wp));
    }

    //
    // Create the finish line points
    //
    waypointRadius *= 0.66;
    wp = wp.gotoHeading(windHeading + 180, sepDist / 2);
    wp = wp.gotoHeading(perpendicularWindHeading + 180, sepDist * numGridPoints / 2 + waypointRadius);
    waypoints.push(createWaypoint(wp));
    wp = wp.gotoHeading(perpendicularWindHeading + 180, sepDist * 1.5);
    waypoints.push(createWaypoint(wp));

    //
    // Generate the boundary
    //
    var len5;
    if (isEvenCourse) {
        len5 = courseWidth / 3;
    } else {
        len5 = courseWidth / 2;
    }
    var b1 = p1;
    var b2 = b1.gotoHeading(perpendicularWindHeading, courseWidth);
    var b3 = b2.gotoHeading(windHeading, courseWidth);
    var b4 = b3.gotoHeading(perpendicularWindHeading + 180, courseWidth / 2);
    var b5 = b4.gotoHeading(windHeading + 180, len5);
    var b6 = b5.gotoHeading(perpendicularWindHeading + 180, courseWidth / 2);
    var boundary = [b1, b2, b3, b4, b5, b6].map(function (b) { return createBoundaryPoint(b); });

    return {
        'type': 'area-scanning',
        'waypoints': waypoints,
        'boundary': boundary,
        'timeLimitSec': obj.timeLimitSec,
        'timeToStart': obj.timeToStart,
    };

    function createWaypoint(pos) {
        return {
            latitude: pos.latitude,
            longitude: pos.longitude,
            achieved: false,
            type: 'circle',
            radius: waypointRadius,
        };
    }

    function createBoundaryPoint(pos) {
        return {
            latitude: pos.latitude,
            longitude: pos.longitude
        };
    }

};
