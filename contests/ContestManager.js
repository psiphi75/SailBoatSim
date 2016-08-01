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

const CHANNEL = 'ContestManager';

const VALID_ACTIONS = ['request-contest'];
const VALID_CONTEST_TYPES = ['none', 'fleet-race', 'station-keeping', 'area-scanning', 'obstacle-avoidance'];
const VALID_CONTEST_LOCATIONS = ['auckland', 'viana-do-castelo'];

const DEFAULT_CONTEST_REQUEST = {
    action: 'request-contest',
    type: 'fleet-race',
    location: 'auckland',
    realtime: true
};

var wrc = require('web-remote-control');
var fs = require('fs');
var areaScan = require('./GenerateAreaScan');
var util = require('../lib/util');

/**
 * The ContestManager will load a contest from a request from the controller.
 * It will then send the contest details back to the controller and all other
 * observers (the simulator and the viewer).
 */
function ContestManager() {

    var self = this;
    this.cm = wrc.createToy({
        udp4: false,
        tcp: true,
        channel: CHANNEL,
        log: function () {}
    });

    this.cm.on('error', console.error);
    this.cm.on('command', function (cmdObj) {
        switch (cmdObj.action) {
            case 'request-contest':
                self.sendContest.bind(self);
                break;
            case 'get-current-contest':
                self.sendCurrentContest.bind(self);
                break;
            default:
                console.error('ContestManager(): unknown action: ', cmdObj.action);
        }
    });

    // Load the default contest
    this.cm.on('register', function() {
        self.sendContest(DEFAULT_CONTEST_REQUEST);
    });

}

/**
 * Handle a command from the controller.
 * @param  {object} contestRequest    The contest request
 */
ContestManager.prototype.sendContest = function(contestRequest) {

    if (!this.isValidContestRequest(contestRequest)) return;
    if (contestRequest.type === 'none') return;

    const jsonFilename = __dirname + '/' + createJSONfilename(contestRequest);

    var self = this;
    fs.readFile(jsonFilename, 'utf8', function (err, data) {
        if (err) {
            console.error('ERROR: ContestManager: problem reading file: ', err);
            return;
        }
        var contestDetails;
        try {
            contestDetails = JSON.parse(data);
        } catch (ex) {
            console.error('ERROR: ContestManager: invalid JSON: ', ex);
            return;
        }

        if (contestRequest.type === 'area-scanning') {
            contestDetails = areaScan.generate(contestDetails);
        }

        self.currentContest = {
            type: 'new-contest',
            request: contestRequest,
            contest: contestDetails
        };

        // Send the contest details and make the proxy hold it.
        self.cm.stickyStatus(self.currentContest);
    });
};

/**
 * Check a given command is valid.
 */
ContestManager.prototype.isValidContestRequest = function(contestRequest) {
    if (typeof contestRequest !== 'object') {
        console.error('ERROR: ContestManager: not a valid command.');
        return false;
    }
    if (VALID_ACTIONS.indexOf(contestRequest.action) < 0) {
        console.error('ERROR: ContestManager: not a valid action: ', contestRequest.action);
        return false;
    }
    if (VALID_CONTEST_TYPES.indexOf(contestRequest.type) < 0) {
        console.error('ERROR: ContestManager: not a valid contest type: ', contestRequest.type);
        return false;
    }
    if (VALID_CONTEST_LOCATIONS.indexOf(contestRequest.location) < 0) {
        console.error('ERROR: ContestManager: not a valid contest location: ', contestRequest.location);
        return false;
    }
    if (typeof contestRequest.realtime !== 'boolean') {
        console.error('ERROR: ContestManager: realtime is not boolean: ', contestRequest.realtime);
        return false;
    }
    if (!isUndefinedOrNumber('latitude')) return false;
    if (!isUndefinedOrNumber('longitude')) return false;
    if (!isUndefinedOrNumber('windSpeed')) return false;
    if (!isUndefinedOrNumber('windHeading')) return false;

    return true;

    function isUndefinedOrNumber(name) {
        var val = contestRequest[name];
        if (val === undefined) return true;
        if (util.isNumeric(val)) return true;
        console.error('ERROR: ContestManager: ' + name + ' is not valid: ', val);
        return false;
    }
};


/**
 * Convert a string from 'Viana do Castelo' to 'viana-do-castelo'
 * @param  {string} str The name
 * @return {string}     The output
 */
function lowercaseSep(str) {
    return str.toLowerCase().replace(' ', '-');
}

/**
 * The JSON filename are formatted as "[contest type].[contest.location].json"
 * @param  {obejct} details    The contest details
 * @return {string}            The formatted JSON filename
 */
function createJSONfilename(details) {
    return lowercaseSep(details.type) + '.' + lowercaseSep(details.location) + '.json';
}

module.exports = ContestManager;
