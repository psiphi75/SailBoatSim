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

var roll = require('./Roll');
var speed = require('./Speed');
var deltaHeading = require('./DeltaHeading');
// var util = require('../../lib/util');

// These factors slow the rate of change. Smaller factors have faster rates of change.
var ROLL_INERTIA = 0.1;
var SPEED_INERTIA = 0.3;
var MOMENTUM = 0.7;

// var RUDDER_TRAVEL_TIME = 0.250; // seconds
//
// var delayRudder = new Delay(RUDDER_TRAVEL_TIME);

var boatSimFuncs = {
    applyRoll: function(time, env, boat) {
        // console.log(env, boat.velocity, boat.apparentWind)
        var inertialessRoll = roll.estimate(time.deltaSec, boat.apparentWind.speed, boat.apparentWind.heading, boat.attitude.roll);
        var newRoll = inertialessRoll * (1 - ROLL_INERTIA * time.deltaSec) + boat.attitude.roll * ROLL_INERTIA * time.deltaSec;
        return newRoll;
    },
    applySpeed: function(time, env, boat) {
        var inertialessSpeed = speed.estimate(time.deltaSec, boat.apparentWind.speed, boat.apparentWind.heading, boat.attitude.roll, boat.servos.rudder);

        var scaleFactor;
        if (inertialessSpeed > boat.velocity.speed) {
            // We are speeding up, use inertia
            scaleFactor = SPEED_INERTIA;
        } else {
            // We are slowing down, momentum lets us glide here
            scaleFactor = MOMENTUM;
        }
        var newSpeed = inertialessSpeed * (1 - scaleFactor) + boat.velocity.speed * scaleFactor;
        return newSpeed;
    },
    applyHeadingChange: function(time, env, boat) {
        // var oldRudderValue = delayRudder.update(time.deltaSec, boat.servos.rudder);
        var headingChange = deltaHeading.estimate(time.deltaSec, boat.velocity.speed, boat.servos.rudder);
        return headingChange;
    },
    /**
     * Some items like the sail and rudder servos a slow... kind of.
     * @param  {object} time         The time object
     * @param  {number} currentValue The current value
     * @param  {number} wantedValue  The value we are trying to move to.
     * @param  {number} changeSpeed  How fast the value changes (units per second).
     * @return {number}              The new actual value, it will not be greater than wanted value.
     */
    applyLinearChange: function(time, currentValue, wantedValue, changeSpeed) {
        if (wantedValue === currentValue) {
            return currentValue;
        }

        var dT = time.deltaSec;
        var dValue = dT * changeSpeed;

        //
        // Make sure we don't overshoot the wantedValue
        //
        var absDiff = Math.abs(currentValue - wantedValue);
        if (absDiff < dValue) {
            dValue = absDiff;
        }

        //
        // Calcualte the new value
        //
        if (wantedValue < currentValue) {
            return currentValue - dValue;
        } else {
            return currentValue + dValue;
        }
    }

};

// function Delay(delay, defaultValue) {
//     this.delayedValues = [];
//     this.delay = delay;
//     this.defaultValue = util.isNumeric(defaultValue) ? defaultValue : null;
// }
// Delay.prototype.update = function(time, value) {
//     this.delayedValues.push({
//         time: time,
//         value: value
//     });
//     return this.getAndPop(time);
// };
// Delay.prototype.getAndPop = function(now) {
//     var foundIt = this.defaultValue;
//     var self = this;
//     this.delayedValues = this.delayedValues.filter(function (obj) {
//         if (obj.time + self.delay >= now) {
//             return true;
//         } else {
//             foundIt = obj;
//             return false;
//         }
//     });
//     return foundIt;
// };


module.exports = boatSimFuncs;
