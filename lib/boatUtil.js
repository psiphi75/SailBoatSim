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

var fn = {
    /**
     * Calculate the apparent wind, relative to the boat.  Where the bow of the boat is the front/forward.
     * @param  {number} windSpeed   The speed of the wind (in any units)
     * @param  {number} windHeading The way the wind is going, in degrees, relative to north. // http://www.windspeed.co.uk/ws/index.php?option=faq&task=viewfaq&Itemid=5&artid=17
     * @param  {number} boatSpeed   The speed of the boat (in same units as windSpeed)
     * @param  {number} boatHeading The heading of the boat, in degrees, relative to north
     * @return {object}             {heading, headingToBoat, speed}
     */
    calcApparentWind: function(windSpeed, windHeading, boatSpeed, boatHeading) {

        // var v = boatSpeed;
        // var w = windSpeed;
        // var alpha = util.wrapDegrees((windHeading + 180) - boatHeading);
        // var cosAlpha = Math.cos(util.toRadians(alpha));
        // var awSpeed = Math.sqrt(w * w + v * v + 2 * w * v * cosAlpha);
        // var awHeading = util.toDegrees(Math.acos((w * cosAlpha + v) / awSpeed));

        var trueWindVec = util.createVector(windSpeed, util.toRadians(windHeading));
        var boatVec = util.createVector(boatSpeed, util.toRadians(boatHeading));

        // The ApparentWind vector
        var x = boatVec.x + trueWindVec.x;
        var y = boatVec.y + trueWindVec.y;

        var awHeadingToNorth = util.wrapDegrees(90 - util.toDegrees(Math.atan2(y, x)));
        var awHeadingBoat = util.wrapDegrees(boatHeading - awHeadingToNorth + 180);
        var awSpeed = Math.sqrt(x * x + y * y);

        return {
            headingToNorth: awHeadingToNorth,
            heading: awHeadingBoat,
            speed: awSpeed
        };
    },
    calcNextPosition: function(oldLat, oldLong, newSpeed, newHeading, drift, time) {
        // FIXME: Need to include drift in speed and heading
        return util.getNextLatLongFromVelocity(oldLat, oldLong, newSpeed, newHeading, time.delta);
    }
};

module.exports = fn;
