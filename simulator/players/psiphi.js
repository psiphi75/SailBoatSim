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

var util = require('../../lib/util.js');
var Position = require('../../lib/Position.js');
var WaypointManager = require('../../lib/WaypointManager.js');

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

// Can be 'nominal' or 'tack';
var mode = 'tack';

// Tacking mode -1 or 1
var q = 1;

// const pi = Math.PI;
//
// // gamma > 0 is a tuning parameter, i.e. a larger value for gamma gives a
// // trajectory of the boat that converges faster to the desired line. [MELIN]
// const gamma = 180 / 4;
//
// // Tacking angle - TODO: Needs to be optimised
// const thetaT = 45;
//
// // The no-go zone.  See: https://en.wikipedia.org/wiki/Point_of_sail TODO: Needs to be optimised
// const thetaNoGo = 30;


var optimalNominalAngle = 45;

// d, determines how close the sailboat will keep to the desired trajectory during tacking
// TODO: This is a strategical value, this can be optimised based on water drift, etc.
var d = 1;

// var reachedLayline = false;

var JM = {
    info: {
        name: 'psiphi',
    },
    /**
     * This will be run once before the simulational initalises.
     * See this link for the contest details: https://github.com/psiphi75/SailBoatSim/blob/master/AI.md#contests
     */
    init: function(contest) {
        this.contest = contest;
        this.waypoints = new WaypointManager(contest.waypoints);
    },
    /**
     * This function is called every step.  See the AI.md file for documentation.
     * @param  {object} state
     * @return {object} The result is the new value of the rudder.
     */
    ai: function (state) {

        state.isSimulation = true;
        toy.status(state);

        // TODO: This needs all some testing

        var myPosition = new Position(state.boat.gps);
        var trueWind = state.environment.wind;
        // var trueWindHeading = trueWind.heading;
        var wpStatus = this.waypoints.getStatus(myPosition);
        // var apparentWindHeadingToBoat = ;

        // 1. Check if we have reached the waypoint, if yes, then load the next waypoint and do some calcs.
        if (wpStatus.achieved) {
            wpStatus = this.waypoints.next(myPosition);
            // reachedLayline = false;
            // q = -q;
        }
        var wpCurrent = this.waypoints.getCurrent();
        var wpPrev = this.waypoints.getPrevious();
        mode = getMode(wpStatus.heading, trueWind.heading);

        // 2. Calculate the rudder
        // 3. Calculate sail angle - Not currently implemented
        var rudder = 0;
        var sail = 0;
        var optimalHeadingDiff;
        switch (mode) {
            case 'nominal':
                d = 1.5;
                optimalNominalAngle = 135;
                q = calcNominalMode(myPosition, wpStatus, wpCurrent, wpPrev, q);
                optimalHeadingDiff = calcOptimalNominalHeadingDiff(state.boat.apparentWind.headingToBoat);
                sail = 0;
                break;
            case 'tack':
                d = 1.5;
                optimalNominalAngle = 45;
                q = calcNominalMode(myPosition, wpStatus, wpCurrent, wpPrev, q);
                optimalHeadingDiff = calcOptimalNominalHeadingDiff(state.boat.apparentWind.headingToBoat);
                sail = 0;
                break;
            default:
                console.log('oops, shouldn\'t get here');
        }
        console.log(mode, q, optimalHeadingDiff.toFixed(2), rudder.toFixed(3))
        rudder = calcRudder(optimalHeadingDiff);


        return {
            action: 'move',
            servoRudder: rudder,
            servoSail: sail
        };
    },
    close: function() {
    }
};

// function hasReachedLayline(myPosition, wpPrev, wpCurrent, trueWind) {
//
// }

const tackAngleThreshold = 90;
function getMode(headingToWaypoint, trueWindHeading) {
    var diffAngle = Math.abs(util.wrapDegrees(headingToWaypoint - trueWindHeading));
    if (diffAngle < tackAngleThreshold) {
        return 'tack';
    } else {
        return 'nominal';
    }
}
function calcNominalMode(myPosition, wpStatus, wpCurrent, wpPrev, lastQ) {
    var sideOfLine = myPosition.calcSideOfLine(wpCurrent, wpPrev);

    // TODO: This is a strategical value.
    // var d = wpStatus.radius * 0.5;
    var distantToWaypointLine = myPosition.distanceToLine(wpCurrent, wpPrev);

   // if (reachedLayline === false && hasReachedLayline(myPosition, wpCurrent, trueWind)) {
   //      reachedLayline = true;
   //      return -lastQ;
   //  }

    if (lastQ !== sideOfLine && distantToWaypointLine >= d) {
        return sideOfLine;
    } else {
        return lastQ;
    }
}

function calcOptimalNominalHeadingDiff(apparentWindHeading) {
    // var optimalNominalAngle = 135;
    var optimalHeadingDiff = util.wrapDegrees(q * optimalNominalAngle - apparentWindHeading);
    return optimalHeadingDiff;
}

function calcRudder(optimalHeadingDiff) {

    var turnRateScalar = 2;
    var turnRateValue = turnRateScalar * optimalHeadingDiff;
    if (turnRateValue > 90) turnRateValue = 90;
    if (turnRateValue < -90) turnRateValue = -90;

    var sigmaRMax = 1;
    var rudder = Math.sin(util.toRadians(turnRateValue)) * sigmaRMax;
    return rudder;
}

// function calcOptimalTackHeadingDiff(apparentWindHeading) {
//     var optimalHeadingDiff = util.wrapDegrees(q * optimalTackAngle - apparentWindHeading);
//     return optimalHeadingDiff;
// }
//
// function calcTackMode(myPosition, wpStatus, wpCurrent, wpPrev, lastQ) {
//     var sideOfLine = myPosition.calcSideOfLine(wpCurrent, wpPrev);
//
//     var distantToWaypointLine = myPosition.distanceToLine(wpCurrent, wpPrev);
//
//     if (lastQ !== sideOfLine && distantToWaypointLine >= d) {
//         return sideOfLine;
//     } else {
//         return lastQ;
//     }
// }

module.exports = JM;
