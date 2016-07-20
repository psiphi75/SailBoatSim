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

var Boat = require('./Boat');
var Environment = require('./Environment');
var player1 = require('./players/RadioControl');
var LatLon = require('mt-latlon');

var env = new Environment();
var boat1 = new Boat(player1);

var SPEED = 100;                // Simulation speed (ms)
var time = {
    delta: SPEED,                 // The change in time (ms)
    deltaSec: SPEED / 1000,         // The change in time (seconds)
    now: new Date().getTime()   // The current time
};

console.log('Boat\t\t\t\t\t\t\t\t\tEnvironment');
console.log('rudder\troll\tspeed\theading\tposition\t\t\t\tspeed\theading');
function doCalcs() {
    var envValues = env.update(time);
    boat1.simulate(time, envValues);
    boat1.runAI(envValues);
    write();
    time.now += time.delta;
}

setInterval(doCalcs, time.delta);


function write() {
    var b = boat1.getActualValues();
    var position = new LatLon(b.latitude, b.longitude);
    process.stdout.write(b.rudder.toFixed(1) + '\t'
                         + b.roll.toFixed(1) + '\t'
                         + b.speed.toFixed(1) + '\t'
                         + b.heading.toFixed(1) + '\t'
                         + position.lat('dms', 2) + '\t'
                         + position.lon('dms', 2) + '\t'
                         + '\t'
                         + env.wind.speed.toFixed(2) + '\t'
                         + env.wind.heading.toFixed(2) + '  \r');
}
