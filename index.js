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

/*
 * Load the Webserver for the controller and serve static pages
 */
console.log();
require('studious-octo-guide/controller-www/WebServer');
var wrc = require('web-remote-control');
wrc.createProxy({
    udp4: true,
    tcp: true,
    socketio: true,
    onlyOneControllerPerChannel: true,
    onlyOneToyPerChannel: true,
    allowObservers: true,
    log: function() {}
});

/*
 * Load the viewer (which loads CesiumJS)
 */
require('./runViewer');

/*
 * Finally run the simulation
 */
console.log('\n\nRunning simulation:');
require('./runSimulation');
