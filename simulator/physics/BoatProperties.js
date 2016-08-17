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

//
// This polar chart describes the optimal 'speed' for a given true wind angle.  It also describes the position of the sail.
// TODO: This is fabricated, we should make a real one.
//
var POLAR_CHART = {
    '0': { 'speedFactor': 0, 'sail': -1 },
    '5': { 'speedFactor': 0.007, 'sail': -1 },
    '10': { 'speedFactor': 0.038, 'sail': -1 },
    '15': { 'speedFactor': 0.107, 'sail': -1 },
    '20': { 'speedFactor': 0.222, 'sail': -1 },
    '25': { 'speedFactor': 0.389, 'sail': -1 },
    '30': { 'speedFactor': 0.615, 'sail': -1 },
    '35': { 'speedFactor': 0.663, 'sail': -0.933 },
    '40': { 'speedFactor': 0.706, 'sail': -0.867 },
    '45': { 'speedFactor': 0.744, 'sail': -0.8 },
    '50': { 'speedFactor': 0.777, 'sail': -0.733 },
    '55': { 'speedFactor': 0.806, 'sail': -0.667 },
    '60': { 'speedFactor': 0.832, 'sail': -0.6 },
    '65': { 'speedFactor': 0.853, 'sail': -0.533 },
    '70': { 'speedFactor': 0.870, 'sail': -0.467 },
    '75': { 'speedFactor': 0.883, 'sail': -0.4 },
    '80': { 'speedFactor': 0.892, 'sail': -0.333 },
    '85': { 'speedFactor': 0.898, 'sail': -0.267 },
    '90': { 'speedFactor': 0.900, 'sail': -0.2 },
    '95': { 'speedFactor': 0.898, 'sail': -0.133 },
    '100': { 'speedFactor': 0.896, 'sail': -0.067 },
    '105': { 'speedFactor': 0.894, 'sail': 0 },
    '110': { 'speedFactor': 0.893, 'sail': 0.067 },
    '115': { 'speedFactor': 0.886, 'sail': 0.133 },
    '120': { 'speedFactor': 0.879, 'sail': 0.2 },
    '125': { 'speedFactor': 0.868, 'sail': 0.267 },
    '130': { 'speedFactor': 0.857, 'sail': 0.333 },
    '135': { 'speedFactor': 0.836, 'sail': 0.4 },
    '140': { 'speedFactor': 0.814, 'sail': 0.467 },
    '145': { 'speedFactor': 0.793, 'sail': 0.533 },
    '150': { 'speedFactor': 0.771, 'sail': 0.6 },
    '155': { 'speedFactor': 0.750, 'sail': 0.667 },
    '160': { 'speedFactor': 0.729, 'sail': 0.733 },
    '165': { 'speedFactor': 0.711, 'sail': 0.8 },
    '170': { 'speedFactor': 0.693, 'sail': 0.867 },
    '175': { 'speedFactor': 0.682, 'sail': 0.933 },
    '180': { 'speedFactor': 0.671, 'sail': 1 }
};

/**
 * Supplement the polar chart with VMG (velocity made good) data.
 */
(function() {  // eslint-disable-line wrap-iife
    for (var twAngle in POLAR_CHART) {
        var data = POLAR_CHART[twAngle];
        var radians = util.toRadians(parseFloat(twAngle));
        var vmg = data.speedFactor * Math.cos(radians);
        data.vmgSpeed = util.round(vmg, 3);
    }
})();

var fn = {

    getPolarData: function(twAngle) {
        twAngle = util.wrapDegrees(twAngle);
        twAngle = Math.abs(twAngle);
        twAngle = Math.round(twAngle / 5) * 5;
        var data = POLAR_CHART[twAngle];
        return data;
    },

    findOptimalApparentForeWindAngle: function() {
        var maxSpeedAngle = 0;
        for (var twAngle in POLAR_CHART) {
            var data = POLAR_CHART[twAngle];
            if (POLAR_CHART[maxSpeedAngle].vmgSpeed < data.vmgSpeed) {
                maxSpeedAngle = twAngle;
            }
        }
        return parseFloat(maxSpeedAngle);
    },

    findOptimalApparentAftWindAngle: function() {
        var minSpeedAngle = 0;
        for (var twAngle in POLAR_CHART) {
            var data = POLAR_CHART[twAngle];
            if (POLAR_CHART[minSpeedAngle].vmgSpeed > data.vmgSpeed) {
                minSpeedAngle = twAngle;
            }
        }
        return parseFloat(minSpeedAngle);
    },

    getSpeed: function(twSpeed, twAngle, sail) {
        var data = fn.getPolarData(twAngle);

        if (!util.isNumeric(sail)) {
            // Simply get the speed - assume sail is in ideal position
            return twSpeed * data.speedFactor;
        } else {
            // Reduce the ideal speed based on the deviation from ideal because the sail is not ideal
            var sailPerformance = 1 - Math.abs(sail - data.sail) / 2;
            var adjustedSpeed = twSpeed * sailPerformance * data.speedFactor;
            return adjustedSpeed;
        }

    }

};

module.exports = fn;
