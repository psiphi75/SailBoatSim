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

var boatProperties = require('sailboat-utils/boatProperties');

module.exports = {

    /**
     * Estimate the roll.
     * @param  {number} dt              The change in speed
     * @param  {number} environment
     * @param  {object} boat            The old boat state (we don't change this)
     * @return {number}                 The estimated roll (degrees)
     */
    estimate: function(dt, environment, boat) {
        // var B = 0.5;
        // // TODO: The speed will change based on a function of the heading of the wind, a wind from back may make the boat go quicker.
        // var estSpeed = Math.abs(Math.sin(apparentWindHeadingToBoat * Math.PI / 180) * (B * apparentWindSpeed) * Math.cos(roll * Math.PI / 180)) * (0.25 * (1 - Math.abs(rudder)) + 0.75);
        // return estSpeed;

        // Calc the base speed
        var twSpeed = boat.trueWind.speed;
        var twHeading = boat.trueWind.heading;
        var sail = boat.servos.sail;
        var baseSpeed = boatProperties.getSpeed(twSpeed, twHeading, sail);

        // Use the rudder position to slow it down
        const RUDDER_SLOWING_FACTOR = 0.2;
        var rudderImpact = RUDDER_SLOWING_FACTOR * Math.abs(boat.servos.rudder) * baseSpeed;

        var finalSpeed = baseSpeed - rudderImpact;
        return finalSpeed;

    }
};
