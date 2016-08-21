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

var util = require('sailboat-utils/util');
var Position = require('sailboat-utils/Position');
var wrc = require('web-remote-control');

function Renderer() {
    this.renderer = wrc.createToy({
        proxyUrl: 'localhost',
        udp4: false,
        tcp: true,
        socketio: false,
        channel: 'Renderer',
        log: function () {}
    });
    this.trailId = 0;
}

Renderer.prototype.drawLayline = function (waypoint, wind, optimalWindAngle) {
    var self = this;
    var colour = {
        red: 1.0,
        green: 0.5,
        blue: 0.333
    };

    drawOneLL(1);
    drawOneLL(-1);

    function drawOneLL(sign) {
        var llHeading = wind.heading + sign * optimalWindAngle;
        llHeading = util.wrapDegrees(llHeading);

        var point = new Position(waypoint);

        var inc = 0.5;
        for (var i = inc; i < 10; i += inc) {
            point = point.gotoHeading(llHeading, inc);
            var id = sign.toString() + '_' + i.toString();
            self.drawPoint(point, id, colour);
        }
    }

};

Renderer.prototype.drawPoint = function (point, id, colour) {
    switch (colour) {
        case 'WHITE':
            colour = {
                red: 1,
                green: 1,
                blue: 1
            };
            break;
        case 'RED':
            colour = {
                red: 1,
                green: 0,
                blue: 0
            };
            break;
        case 'GREEN':
            colour = {
                red: 0,
                green: 1,
                blue: 0
            };
            break;
        case 'BLUE':
            colour = {
                red: 0,
                green: 0,
                blue: 1
            };
            break;
        case undefined:
            colour = {
                red: 1,
                green: 1,
                blue: 1
            };
            break;
        default:
    }
    var obj = {
        render: 'point',
        details: {
            id: id,
            label: '',
            color: colour,
            latitude: point.latitude,
            longitude: point.longitude
        }
    };
    this.renderer.status(obj);
};

Renderer.prototype.drawTrail = function (point, colour, overwriteLast) {

    if (!overwriteLast) {
        if (this.trailId > 1000) {
            this.trailId = 0;
        } else {
            this.trailId += 1;
        }
    }
    this.drawPoint(point, 'Tail_' + this.trailId.toString(), colour);

};

module.exports = Renderer;
