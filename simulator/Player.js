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
var util = require('../lib/util');

function Player(name) {
    this.playerScope = require('./players/' + name);
    this.name = this.playerScope.info.name;
    this.init = this.playerScope.init;
    this.playerAIFunction = this.playerScope.ai;

    var options;
    if (this.init) {
        options = {
            latitude: this.init.position.latitude,
            longitude: this.init.position.longitude
        };
    }
    this.boat = new Boat(options);
}

Player.prototype.runAI = function(dt, env) {

    var state = {
        dt: dt,
        boat: this.boat.getActualValues(),
        environment: util.clone(env),
        waypoints: []     // FIXME: We need to determine waypoint structure
    };

    var command;
    try {
        // Need to make sure player can't access other things
        var aiFunc = this.playerAIFunction.bind(this.playerScope);
        command = aiFunc(state);
    } catch (ex) {
        console.error(`Error running AI for player ${this.name}`);
        return;
    }
    if (command && command.action === 'move') {
        this.boat.setRudder(command.servoRudder);
        this.boat.setSail(command.servoSail);
    }
};

module.exports = Player;
