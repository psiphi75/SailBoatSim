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

var util = require('./util');

var GeographicLib = require('geographiclib');
var geod = GeographicLib.Geodesic.WGS84;

/**
 * Create a Position
 * @param {object} posObj   The latitude, or an object like {latitude, longitude, (altitude)}
 */
function Position(posObj) {
    if (typeof posObj !== 'object') {
        console.error('ERROR: Position(): invalid initalisation value:', posObj);
        return;
    }
    if (!util.isNumeric(posObj.latitude) || posObj.latitude < -90 || posObj.latitude > 90) {
        console.error('ERROR: Position(): Invalid latitude: ', posObj.latitude);
        return;
    }
    if (!util.isNumeric(posObj.longitude) || posObj.longitude < -180 || posObj.longitude > 180) {
        console.error('ERROR: Position(): Invalid longitude: ', posObj.longitude);
        return;
    }
    if (!util.isNumeric(posObj.altitude)) posObj.altitude = 0;

    this.latitude = posObj.latitude;
    this.longitude = posObj.longitude;
    this.altitude = posObj.altitude;

}

//
// Constants
//

Position.prototype.RE = 6371000;

//
// Functions
//


Position.prototype.distanceHeadingTo = function(pos2) {
    if (!(pos2 instanceof Position)) return console.error('ERROR: Position.distHeadingTo(): Invalid Position');

    var r = geod.Inverse(this.latitude, this.longitude, pos2.latitude, pos2.longitude);
    return {
        distance: r.s12,
        heading: r.azi2
    };
};
Position.prototype.gotoHeading = function(heading, dist) {

    if (!util.isNumeric(heading)) return console.error('ERROR: Position.getPosition(): heading: ', heading);
    if (!util.isNumeric(dist)) return console.error('ERROR: Position.getPosition(): dist: ', dist);

    var r = geod.Direct(this.latitude, this.longitude, heading, dist);
    return new Position({
        latitude: r.lat2,
        longitude: r.lon2
    });
};
Position.prototype.getVelocity = function(pos2, deltaTimeSec) {
    if (!(pos2 instanceof Position)) return console.error('ERROR: Position.distHeadingTo(): Invalid Position');
    if (!util.isNumeric(deltaTimeSec)) return console.error('ERROR: Position.getVelocity(): deltaTimeSec: ', deltaTimeSec);

    var r = this.distHeadingTo(pos2);

    return {
        speed: r.distance / deltaTimeSec,
        heading: r.heading
    };
};
Position.prototype.toCartesian = function () {
    // This function is very approximate, it uses a sphere, but it should be 99.5% accurate
    var lat = util.toRadians(this.latitude);
    var lon = util.toRadians(this.longitude);
    return {
        x: this.RE * Math.cos(lat) * Math.cos(lon),
        y: this.RE * Math.cos(lat) * Math.sin(lon),
        z: this.RE * Math.sin(lat)
    };
};
Position.prototype.distanceToLine = function (pos1, pos2) {
    // use this calc: http://mathworld.wolfram.com/Point-LineDistance3-Dimensional.html
    var p0 = this.toCartesian();
    var p1 = pos1.toCartesian();
    var p2 = pos2.toCartesian();
    var a = sub(p2, p1);
    var b = sub(p1, p0);
    var dividend = norm(cross(a, b));
    var divisor = norm(a);
    var distance = dividend / divisor;
    return distance;
};
Position.prototype.calcSideOfLine = function (pos1, pos2) {
    // source: http://math.stackexchange.com/questions/274712/calculate-on-which-side-of-straign-line-is-dot-located
    var d = (this.latitude - pos1.latitude) * (pos2.longitude - pos1.longitude) - (this.longitude - pos1.longitude) * (pos2.latitude - pos1.latitude);
    if (d === 0) {
        return 0;
    } else if (d < 0) {
        return -1;
    } else {
        return 1;
    }
};
Position.prototype.calcSideOfLineByAngle = function (pos1, heading) {
    var pos2 = this.gotoHeading(heading, 10);
    return this.calcSideOfLine(pos1, pos2);
};

function norm(a) {
    return Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
}

function cross(a, b) {
    return {
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x
    };
}
function sub(a, b) {
    return {
        x: a.x - b.x,
        y: a.y - b.y,
        z: a.z - b.z
    };
}

module.exports = Position;
