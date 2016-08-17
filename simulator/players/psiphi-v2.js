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

/**
 * This example AI algorithm is the same as the one provided by in the paper by Jon Melin:
 *     https://uu.diva-portal.org/smash/get/diva2:850625/FULLTEXT01.pdf
 */

'use strict';

var util = require('../../lib/util');
var Position = require('../../lib/Position');
var WaypointManager = require('../../lib/WaypointManager');
var boatProperties = require('../physics/BoatProperties');

var PLAYER_NAME = 'Simulation';

//
// Set up the toy (a.k.a boat) be controlled by the controller (can be a mobile phone or some remote AI).
//
var wrc = require('web-remote-control');
var toy = wrc.createToy({
    proxyUrl: 'localhost',
    udp4: false,
    tcp: true,
    socketio: false,
    channel: PLAYER_NAME,
    log: function() {}
});
toy.on('error', console.error);


var mode;       // Can be 'aft-wind', 'side-wind', 'fore-wind';
const SIDE_WIND_THRESH = 60;
const AFT_WIND_THRESH = 120;

var aftWindTacker;
var foreWindTacker;

var psiphi = {
    info: {
        name: 'psiphi-v2',
    },
    /**
     * This will be run once before the simulational initalises.
     * See this link for the contest details: https://github.com/psiphi75/SailBoatSim/blob/master/AI.md#contests
     */
    init: function(contest) {
        this.contest = contest;
        this.waypoints = new WaypointManager(contest.waypoints);

        var optimalApparentAftWindAngle = boatProperties.findOptimalApparentAftWindAngle();
        var optimalApparentForeWindAngle = boatProperties.findOptimalApparentForeWindAngle();

        aftWindTacker = TackKeeper(optimalApparentAftWindAngle, 4);
        foreWindTacker = TackKeeper(optimalApparentForeWindAngle, 2);

    },
    /**
     * This function is called every step.  See the AI.md file for documentation.
     * @param  {object} state
     * @return {object} The result is the new value of the rudder.
     */
    ai: function (state) {

        state.isSimulation = true;
        toy.status(state);

        var myPosition = new Position(state.boat.gps);
        var wpStatus = this.waypoints.getStatus(myPosition);

        // 1. Check if we have reached the waypoint, if yes, then load the next waypoint and do some calcs.
        if (wpStatus.achieved) {
            wpStatus = this.waypoints.next(myPosition);

            aftWindTacker.reset();
            foreWindTacker.reset();
        }

        mode = getNextMode(this.waypoints, myPosition, state.environment.wind);

        // 2. Calculate the rudder
        var optimalRelativeHeading;
        switch (mode) {
            case 'aft-wind':
                optimalRelativeHeading = aftWindTacker.calcOptimalSailingAngle(myPosition, wpStatus, this.waypoints, state.boat);
                break;
            case 'side-wind':
                optimalRelativeHeading = calcSideWind(myPosition, wpStatus, this.waypoints, state.boat);
                break;
            case 'fore-wind':
                optimalRelativeHeading = foreWindTacker.calcOptimalSailingAngle(myPosition, wpStatus, this.waypoints, state.boat);
                break;
            default:
                console.log('oops, shouldn\'t get here');
        }
        var rudder = calcRudder(optimalRelativeHeading);
        var sail = calcSail(state.boat.trueWind.heading);

        return {
            action: 'move',
            servoRudder: rudder,
            servoSail: sail
        };
    },
    close: function() {
    }
};

/**
 * Calculate the next mode we are to be in.
 * @param  {WaypointManager} waypoints  The waypoints.
 * @param  {Position} myPosition
 * @param  {object} wind                Details of the actual wind.
 * @return {string}                     The mode to be in.
 */
function getNextMode(waypoints, myPosition, wind) {
    var headingToNextWP = myPosition.distanceHeadingTo(waypoints.getCurrent()).heading;
    var windDirection = util.wrapDegrees(wind.heading - 180);
    var diffAngle = Math.abs(util.wrapDegrees(windDirection - headingToNextWP));
    if (isNaN(diffAngle)) {
        console.error('getNextMode(): we have a NaN');
    }
    switch (true) {
        case diffAngle >= AFT_WIND_THRESH:
            return 'aft-wind';
        case diffAngle >= SIDE_WIND_THRESH:
            return 'side-wind';
        default:
            return 'fore-wind';
    }
}


/**
 * Calculate the new rudder value based on a side wind.
 * @param  {Position} myPosition        The boat's position.
 * @param  {WaypointManager} waypoints  The waypoints.
 * @param  {object} boat                Get the boat details.
 * @return {string}                     The mode to be in.
 */
function calcSideWind(myPosition, wpStatus, waypoints, boat) {
    var optimalRelativeHeading = util.wrapDegrees(wpStatus.heading - boat.attitude.heading);
    return optimalRelativeHeading;
}


function calcRudder(optimalRelativeHeading) {

    optimalRelativeHeading = util.wrapDegrees(optimalRelativeHeading);

    var turnRateScalar = 2;
    var turnRateValue = turnRateScalar * optimalRelativeHeading;
    if (turnRateValue > 90) turnRateValue = 90;
    if (turnRateValue < -90) turnRateValue = -90;

    var rudder = Math.sin(util.toRadians(turnRateValue));
    return rudder;
}

/**
 * The sail angle is a function of the actual current heading.
 * @param  {number} trueWindHeading     The angle in degrees of the apparent wind (in degrees)
 * @return {[type]}                [description]
 */
function calcSail(trueWindHeading) {
    var data = boatProperties.getPolarData(trueWindHeading);
    return data.sail;
}

function TackKeeper(optimalWindAngle, maxDistanceFromWaypointLine) {

    var q;  // Determines the tack mode -1 is left, +1 is right

    return {

        /**
         * Calculate the new rudder value based on a fore/aft wind.
         * @param  {Position} myPosition        The boat's position.
         * @param  {WaypointManager} waypoints  The waypoints.
         * @param  {object} boat                Get the boat details.
         * @return {number}                     The optimal angle to head to (relative to boat).
         */
        calcOptimalSailingAngle: function(myPosition, wpStatus, waypoints, boat) {

            var wpCurrent = waypoints.getCurrent();
            var wpPrev = waypoints.getPrevious();
            var sideOfLine = myPosition.calcSideOfLine(wpCurrent, wpPrev);
            var distantToWaypointLine = myPosition.distanceToLine(wpCurrent, wpPrev);

            // Check if we need to change direction
            if (!q) q = -sideOfLine;
            if (q === sideOfLine && distantToWaypointLine >= maxDistanceFromWaypointLine) {
                q = -sideOfLine;
            }

            // if (reachedLayline === false && hasReachedLayline(myPosition, wpCurrent, trueWind)) {
            //      reachedLayline = true;
            //      return -lastQ;
            //  }

            var optimalRelativeHeading = calcOptimalRelativeHeading(boat);
            return optimalRelativeHeading;
        },

        reset: function() {
            q = undefined;
        }

    };

    function calcOptimalRelativeHeading(boat) {
        var optimalRelativeHeading = -util.wrapDegrees(q * optimalWindAngle - boat.trueWind.heading);
        return optimalRelativeHeading;
    }
}

module.exports = psiphi;
