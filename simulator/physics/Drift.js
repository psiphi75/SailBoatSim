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

var util = require('../../lib/util');

module.exports = {

    /**
     * Estimate the drift due to wind.
     * @param  {number} dt              Change in time in ms
     * @param  {object} environment     Environmental details
     * @param  {object} boat            Boat details
     * @return {object}                 The drift {headingToNorth, speed}
     */
    estimateWind: function(dt, environment, boat) {
        var WIND_DRIFT_COEFFICIENT = 0.05;
        var windHeadingToNorth = util.wrapDegrees(boat.attitude.heading + boat.trueWind.heading + 180);
        return {
            headingToNorth: windHeadingToNorth,
            speed: WIND_DRIFT_COEFFICIENT * boat.trueWind.speed     // Apparent wind may be better
        };
    },

    /**
     * Estimate the drift due to water current.
     * @param  {number} dt              Change in time in ms
     * @param  {object} environment     Environmental details
     * @return {object}                 The drift {headingToNorth, speed}
     */
    estimateWater: function(dt, environment) {
        var WATER_DRIFT_COEFFICIENT = 0.5;
        return {
            headingToNorth: environment.water.heading,
            speed: WATER_DRIFT_COEFFICIENT * environment.water.speed
        };
    }
};
