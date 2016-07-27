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

var wrc = require('web-remote-control');
var fs = require('fs');

/**
 * The ContestManager will load a contest from a request from the controller.
 * It will then send the contest details back to the controller and all other
 * observers (the simulator and the viewer).
 */
function ContestManager() {

    this.cm = wrc.createToy({
        udp4: false,
        tcp: true,
        channel: CHANNEL,
        log: function () {}
    });

    this.cm.on('error', console.error);
    this.cm.on('command', this.handleCommand.bind(this));

}

/**
 * Handle a command from the controller.
 * @param  {object} cmdObj    The command object
 */
ContestManager.prototype.handleCommand = function(cmdObj) {

    if (!this.isValidCommand(cmdObj)) return;
    if (cmdObj.type === 'none') return;

    const jsonFilename = __dirname + '/' + createJSONfilename(cmdObj);

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
        self.cm.status({
            type: 'new-contest',
            request: cmdObj,
            contest: contestDetails
        });
    });
};

/**
 * Check a given command is valid.
 */
ContestManager.prototype.isValidCommand = function(cmdObj) {
    if (typeof cmdObj !== 'object') {
        console.error('ERROR: ContestManager: not a valid command.');
        return false;
    }
    if (VALID_ACTIONS.indexOf(cmdObj.action) < 0) {
        console.error('ERROR: ContestManager: not a valid action: ', cmdObj.action);
        return false;
    }
    if (VALID_CONTEST_TYPES.indexOf(cmdObj.type) < 0) {
        console.error('ERROR: ContestManager: not a valid contest type: ', cmdObj.type);
        return false;
    }
    if (VALID_CONTEST_LOCATIONS.indexOf(cmdObj.location) < 0) {
        console.error('ERROR: ContestManager: not a valid contest location: ', cmdObj.location);
        return false;
    }
    if (typeof cmdObj.realtime !== 'boolean') {
        console.error('ERROR: ContestManager: realtime is not boolean: ', cmdObj.realtime);
        return false;
    }
    return true;
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
