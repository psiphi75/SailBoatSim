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

const DEFAULT_PLAYER = 'RadioControl';

var Player = require('./Player');
var LatLon = require('mt-latlon');
var ContestObserver = require('../viewer/ContestObserver');
var observer = new ContestObserver('localhost', handleNewContest); // eslint-disable-line no-unused-vars

var sim;
function handleNewContest(newContest) {
    if (!sim) {
        //
        // Start the simulation
        //
        var Simulation = require('./Simulation');
        console.log('\n\nRunning simulation for first time:');
        writeHeaders();
        sim = new Simulation(100, true);

        // Add players, then start the simulator
        var playerName = process.env.PLAYER || DEFAULT_PLAYER; // Get the player's name
        sim.addPlayer(new Player(playerName, newContest.contest, newContest.request));
        sim.run(write);

    } else {
        //
        // RE-Start the simulation
        //
        console.log('\n\nRestarting simulation\n\n');
        writeHeaders();
        sim.reset(newContest.contest, newContest.request);
    }
}

//
// Display the output
//
function writeHeaders() {
    console.log('\n\nPlayer 1\t\t\t\t\t\t\t\t\tEnvironment');
    console.log('rudder\troll\tspeed\theading\tposition\t\t\t\tspeed\theading');
}

function write(players, env) {
    var boat1 = players[0].boat;
    var b = boat1.getActualValues();
    var position = new LatLon(b.gps.latitude, b.gps.longitude);
    process.stdout.write(b.servos.rudder.toFixed(2) + ' \t'
                         + b.attitude.roll.toFixed(1) + ' \t'
                         + b.velocity.speed.toFixed(1) + ' \t'
                         + b.attitude.heading.toFixed(1) + ' \t'
                         + position.lat('dms', 2) + '\t'
                         + position.lon('dms', 2) + '\t'
                         + '\t'
                         + env.wind.speed.toFixed(2) + ' \t'
                         + env.wind.heading.toFixed(2) + '  \r');
}
