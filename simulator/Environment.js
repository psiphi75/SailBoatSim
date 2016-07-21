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
var util = require('../lib/util');

// NOTE: Wind direction is reported by the direction from which it originates. https://en.wikipedia.org/wiki/Wind_direction
function Environment() {
    this.wind = {
        speed: 1.0,
        heading: util.rand(-180, 180)
    };
    this.updateWindSwing();
}

Environment.prototype.update = function(time) {
    this.wind.heading = 90
    this.updateWindHeading(time);
    this.updateWindSpeed(time);
    this.updateWindSwing();

    return this.getValues();
};

/**
 * Updates the swing of the wind.  The swing determines how qucik the wind changes direction.
 */
Environment.prototype.updateWindSwing = function() {
    if (Math.random() < 0.2 || !this.wind.swing) {
        this.wind.swing = util.rand(-5, 5);
    }
};

/**
 * Updates the speed of the wind.
 */
Environment.prototype.updateWindSpeed = function(time) {
    if (this.wind.speed < 0.5) {
        this.wind.speed += util.rand(0, 0.25) * time.deltaSec;
    } else {
        this.wind.speed += util.rand(-0.25, 0.25) * time.deltaSec;
    }
};

/**
 * Updates the heading of the wind.
 */
Environment.prototype.updateWindHeading = function(time) {
    this.wind.heading += this.wind.swing * time.deltaSec;
    this.wind.heading = util.wrapDegrees(this.wind.heading);
};

/**
 * Return the environment variables.
 * NOTE: Wind direction is reported by the direction from which it originates. https://en.wikipedia.org/wiki/Wind_direction
 * @return {object} [description]
 */
Environment.prototype.getValues = function() {
    return {
        wind: {
            speed: this.wind.speed,
            heading: this.wind.heading
        }
    };
};

module.exports = Environment;
