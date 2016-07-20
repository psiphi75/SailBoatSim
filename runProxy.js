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

/**
 * This will run a static webserver for the controller, and start the web-remote-control proxy.
 */

const CONTROLLER_WWW_PORT = 8888;

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

const options = {
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
    }
};

var staticServer = require('node-static');
var wwwControllerFiles = new staticServer.Server('./node_modules/studious-octo-guide/controller-www/public/', options);

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        wwwControllerFiles.serve(request, response);
    }).resume();
}).listen(CONTROLLER_WWW_PORT);

// TODO:  This prints out "Point your mobile phone to http://[IP THIS COMPUTER]:8888" - we should lookup the IP address, but there may be a few.
console.log(`\nPoint your mobile phone to http://[IP THIS COMPUTER]:${CONTROLLER_WWW_PORT}`);
