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

var test = require('tape');
var boatProperties = require('../simulator/physics/BoatProperties');

test('Boat Properties', function(t) {

    t.plan(5);

    var speed = 1;
    var twAngle = 0;
    var sail = 1;

    t.equal(boatProperties.getSpeed(speed, twAngle, sail), 0, 'Upwind is zero');

    twAngle = 70;
    t.equal(boatProperties.getSpeed(speed, twAngle, sail), 0.23185499999999995, 'Speed gets reduced');

    twAngle = 105;
    t.equal(boatProperties.getSpeed(speed, twAngle, sail), 0.5 * 0.894, 'Speed is half when sail is out (1)');
    t.equal(boatProperties.getSpeed(speed, twAngle, -sail), 0.5 * 0.894, 'Speed is half when sail is out (-1)');

    sail = 0;
    t.equal(boatProperties.getSpeed(speed, twAngle, sail), 0.894, 'Speed is full');

    t.end();

});
