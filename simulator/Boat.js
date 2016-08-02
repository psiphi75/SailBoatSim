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

var util = require('../lib/util');
var boatUtil = require('../lib/boatUtil');
var boatSimFuncs = require('./physics/boatSimulationFunctions');

const DEFAULT_PROPERTIES = {

    // Attitude
    roll: 0,
    pitch: 0,
    heading: 0,         // From true north

    // Position
    latitude: 0,
    longitude: 0,

    // Velocity
    speed: 0,
    direction: 0,     // Direction of the velocity vector

    // Boat servos
    rudder: 0,
    sail: 0,

    // Jitter experienced due to noisy sensors.  Base Units per second
    jitter: {
        roll: 0.5,
        pitch: 0.5,
        heading: 1,
        latitude: util.toDegrees(0.1 / util.RADIUS_EARTH),
        longitude: util.toDegrees(0.1 / util.RADIUS_EARTH),
        speed: 0.1,
        direction: 1
    }

};

const RUDDER_SPEED = 3;   // units per second
const SAIL_SPEED = 3;   // units per second

function Boat(initialConditions) {

    initialConditions = initialConditions || {};

    this.roll = util.defaultFor(initialConditions.roll, DEFAULT_PROPERTIES.roll);
    this.pitch = util.defaultFor(initialConditions.pitch, DEFAULT_PROPERTIES.pitch);
    this.heading = util.defaultFor(initialConditions.heading, DEFAULT_PROPERTIES.heading);
    this.latitude = util.defaultFor(initialConditions.latitude, DEFAULT_PROPERTIES.latitude);
    this.longitude = util.defaultFor(initialConditions.longitude, DEFAULT_PROPERTIES.longitude);
    this.speed = util.defaultFor(initialConditions.speed, DEFAULT_PROPERTIES.speed);
    this.direction = util.defaultFor(initialConditions.direction, DEFAULT_PROPERTIES.direction);
    this.jitter = DEFAULT_PROPERTIES.jitter;

    this.actualRudder = util.defaultFor(initialConditions.rudder, DEFAULT_PROPERTIES.rudder);
    this.actualSail = util.defaultFor(initialConditions.sail, DEFAULT_PROPERTIES.sail);

    // Wanted rudder and wanted sail are what the Player wants, but it takes time to move to wanted.
    this.wantedRudder = this.actualRudder;
    this.wantedSail = this.actualSail;
}

/**
 * Set the environment variables, like wind.
 * @param {object} env The environment variables
 * @return {object} boatParameters
 */
Boat.prototype.simulate = function(time, env) {

    //
    // Do helper calculations
    //
    this.apparentWind = boatUtil.calcApparentWind(env.wind.speed, env.wind.heading, this.speed, this.direction);
    var boatValues = this.getActualValues();

    //
    // Do physics calculations
    //
    var newRoll = boatSimFuncs.applyRoll(time, env, boatValues);
    var newSpeed = boatSimFuncs.applySpeed(time, env, boatValues);
    var headingChange = boatSimFuncs.applyHeadingChange(time, env, boatValues);
    var newHeading = util.wrapDegrees(this.heading + headingChange);
    var drift = {
        heading: this.apparentWind.heading,
        speed: 0// FIXME: need to implement this: boatSimFuncs.applyDrift(time, env, boatValues, apparentWind)
    };

    //
    // Apply the calculations to the boat attitude and position
    //
    var newPosition = boatUtil.calcNextPosition(boatValues.gps.latitude, boatValues.gps.longitude, newSpeed, newHeading, drift, time);

    this.actualSail = boatSimFuncs.applyLinearChange(time, this.actualSail, this.wantedSail, SAIL_SPEED);
    this.actualRudder = boatSimFuncs.applyLinearChange(time, this.actualRudder, this.wantedRudder, RUDDER_SPEED);

    this.roll = newRoll;
    this.speed = newSpeed;
    this.heading = newHeading;
    this.direction = newHeading;    // FIXME: This is the velocity vector
    this.latitude = newPosition.latitude;
    this.longitude = newPosition.longitude;
};


Boat.prototype.getActualValues = function() {

    return {
        attitude: {
            roll: this.roll,
            pitch: this.pitch,
            heading: this.heading
        },
        gps: {
            latitude: this.latitude,
            longitude: this.longitude,
        },
        velocity: {
            speed: this.speed,
            direction: this.direction,
        },
        apparentWind: {
            speed: this.apparentWind.speed,
            heading: this.apparentWind.heading,
            headingToBoat: this.apparentWind.headingToBoat
        },
        servos: {
            rudder: this.actualRudder,
            sail: this.actualSail
        }
    };
};

Boat.prototype.getValues = function() {
    var self = this;
    var result = {
        attitude: {
            roll: jitterName('roll'),
            pitch: jitterName('pitch'),
            heading: jitterName('heading')
        },
        gps: {
            latitude: jitterName('latitude'),
            longitude: jitterName('longitude'),
        },
        velocity: {
            speed: jitterName('speed'),
            direction: jitterName('direction'),
        },
        apparentWind: {
            speed: util.jitter(this.apparentWind.speed, this.jitter.speed),
            heading: util.jitter(this.apparentWind.heading, this.jitter.heading),
            headingToBoat: util.jitter(this.apparentWind.heading, this.jitter.heading)
        }
    };
    return result;

    function jitterName(name) {
        var val = self[name];
        var jit = self.jitter[name];
        return util.jitter(val, jit);
    }
};

Boat.prototype.setRudder = function(val) {
    if (!util.isNumeric(val)) {
        console.error(`Boat.setRudder(): Value is not a number.  Val=${val}`);
        return;
    }
    if (val < -1 && val > 1) {
        console.error(`Boat.setRudder(): Value must be between -1.0 and 1.0.  Val=${val}`);
        return;
    }
    this.wantedRudder = val;
};

Boat.prototype.setSail = function(val) {
    if (!util.isNumeric(val)) {
        console.error(`Boat.setSail(): Value is not a number.  Val=${val}`);
        return;
    }
    if (val < -1 && val > 1) {
        console.error(`Boat.setSail(): Value must be between -1.0 and 1.0.  Val=${val}`);
        return;
    }
    this.wantedSail = val;
};

module.exports = Boat;
