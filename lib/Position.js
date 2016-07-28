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

var GeographicLib = require('geographiclib');
var geod = GeographicLib.Geodesic.WGS84;

function Position(latitude, longitude, altitude) {
    if (!isNumeric(latitude) || latitude < -90 || latitude > 90) {
        console.error('ERROR: Position(): Invalid latitude: ', latitude);
        return;
    }
    if (!isNumeric(longitude) || longitude < -180 || longitude > 180) {
        console.error('ERROR: Position(): Invalid longitude: ', longitude);
        return;
    }
    if (!isNumeric(altitude)) altitude = 0;

    this.latitude = latitude;
    this.longitude = longitude;
    this.altitude = altitude;
}
Position.prototype.distanceTo = function(pos2) {
    if (!(pos2 instanceof Position)) return console.error('ERROR: Position.distHeadingTo(): Invalid Position');

    var r = geod.Inverse(this.latitude, this.longitude, pos2.latitude, pos2.longitude);
    return {
        distance: r.s12,
        heading: r.azi2
    };
};
Position.prototype.gotoHeading = function(heading, dist) {

    if (!isNumeric(heading)) return console.error('ERROR: Position.getPosition(): heading: ', heading);
    if (!isNumeric(dist)) return console.error('ERROR: Position.getPosition(): dist: ', dist);

    var r = geod.Direct(this.latitude, this.longitude, heading, dist);
    return new Position(r.lat2, r.lon2);
};
Position.prototype.getVelocity = function(pos2, deltaTimeSec) {
    if (!(pos2 instanceof Position)) return console.error('ERROR: Position.distHeadingTo(): Invalid Position');
    if (!isNumeric(deltaTimeSec)) return console.error('ERROR: Position.getVelocity(): deltaTimeSec: ', deltaTimeSec);

    var r = this.distHeadingTo(pos2);

    return {
        speed: r.distance / deltaTimeSec,
        heading: r.heading
    };
};

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

module.exports = Position;
