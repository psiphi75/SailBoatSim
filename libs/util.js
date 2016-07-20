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

var util = {
    RADIUS_EARTH: 6371000,
    rand: function(min, max) {
        if (typeof min === 'undefined') min = 0;
        if (typeof max === 'undefined') max = 1;
        return Math.random() * (max - min) + min;
    },
    toRadians: (deg) => (deg * Math.PI / 180),
    toDegrees: (rad) => (rad / Math.PI * 180),
    defaultFor: function (arg, val) {
        return typeof arg !== 'undefined' ? arg : val;
    },
    createVector: function (len, angle) {
        return {
            x: len * Math.sin(angle),
            y: len * Math.cos(angle)
        };
    },
    wrapDegrees: function (deg) {
        while (deg > 180) {
            deg -= 360;
        }
        while (deg < -180) {
            deg += 360;
        }
        return deg;
    },
    isNumeric: function (n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    },
    /**
     * Calculate the speed in m/s and heading.  Thanks to: http://www.movable-type.co.uk/scripts/latlong.html
     * @param  {number} latitude  [description]
     * @param  {number} longitude [description]
     * @param  {number} latitude  [description]
     * @param  {number} longitude [description]
     * @param  {number} dt_ms     The change in time between the two readings (milliseconds)
     * @return {number}           velocity in m/s
     */
    getVelocityFromΔLatLong: function(lat1, long1, lat2, long2, dt_ms) {

        var Δλ = util.toRadians(long2 - long1);
        var φ1 = util.toRadians(lat1);
        var φ2 = util.toRadians(lat2);
        var sinφ1 = Math.sin(φ1);
        var sinφ2 = Math.sin(φ2);
        var cosφ1 = Math.cos(φ1);
        var cosφ2 = Math.cos(φ2);
        var cosΔλ = Math.cos(Δλ);
        var A = cosφ2 * cosΔλ;

        // Distance - an approximation, but works for small distances
        var x = Δλ * Math.cos((φ1 + φ2) / 2);
        var y = (φ2 - φ1);
        var distance = Math.sqrt(x * x + y * y) * util.RADIUS_EARTH;
        var speed = distance / (dt_ms / 1000);

        // Bearing
        var yy = Math.sin(Δλ) * cosφ2;
        var xx = cosφ1 * sinφ2 - sinφ1 * A;
        var heading = util.toDegrees(Math.atan2(yy, xx));

        return {
            speed: speed,
            heading: heading
        };
    },
    /**
     * Calculate the speed in m/s and heading.  Thanks to: http://www.movable-type.co.uk/scripts/latlong.html
     * @param  {number} lat        The old latitude
     * @param  {number} long       The old longitude
     * @param  {number} speed      The speed in m/s
     * @param  {number} heading    The heading in degrees
     * @param  {number} Δt_ms      The change in time between the two readings (milliseconds)
     * @return {object}            {latitude, longitude}
     */
    getNextLatLongFromVelocity: function(lat1, long1, speed, heading, Δt_ms) {
        var φ1 = util.toRadians(lat1);
        var λ1 = util.toRadians(long1);
        var distance = speed * Δt_ms / 1000;
        var headingRad = util.toRadians(heading);
        var dRe = distance / util.RADIUS_EARTH;
        var φ2 = Math.asin(Math.sin(φ1) * Math.cos(dRe) + Math.cos(φ1) * Math.sin(dRe) * Math.cos(headingRad));
        var λ2 = λ1 + Math.atan2(
                            Math.sin(headingRad) * Math.sin(dRe) * Math.cos(φ1),
                            Math.cos(dRe) - Math.sin(φ1) * Math.sin(φ2)
                        );

        return {
            latitude: util.toDegrees(φ2),
            longitude: util.toDegrees(λ2)
        };
    }
};

module.exports = util;
