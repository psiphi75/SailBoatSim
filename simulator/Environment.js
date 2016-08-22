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

// NOTE: Wind heading is the direction is the wind is going to: http://www.windspeed.co.uk/ws/index.php?option=faq&task=viewfaq&Itemid=5&artid=17
function Environment(options) {
    this.wind = new Wind(options);
}
Environment.prototype.update = function(time) {
    this.wind.update(time);
    return this.getValues();
};


/**
 * Return the environment variables.
 * NOTE: windDirection -> the direction where the wind is coming from.
 *       windHeading -> the direction where the wind is going to.
 * http://www.windspeed.co.uk/ws/index.php?option=faq&task=viewfaq&Itemid=5&artid=17
 *
 * @return {object} [description]
 */
Environment.prototype.getValues = function() {
    return {
        wind: this.wind.getValues(),
        water: {
            heading: 45,   // FIXME: Make this dynamic
            speed: 0.0
        }
    };
};

function Wind(options) {
    if (options && options.windSpeed && (options.windHeading || options.windHeading === 0)) {
        this.speed = options.windSpeed;
        this.heading = options.windHeading;
        this.type = 'fixed';
    } else {
        this.speed = 1.0;
        this.heading = util.rand(-180, 180);
        this.type = 'variable';
    }
    this.swing = 0;
}

Wind.prototype.update = function(time) {
    this.updateHeading(time);
    this.updateSpeed(time);
    this.updateSwing();
};

Wind.prototype.getValues = function() {
    return {
        speed: this.speed,
        heading: this.heading,
        // direction: util.wrapDegrees(this.heading + 180)
    };
};


/**
 * Updates the swing of the wind.  The swing determines how qucik the wind changes direction.
 */
Wind.prototype.updateSwing = function() {
    if (this.type === 'fixed') return;
    if (Math.random() < 0.2 || !this.swing) {
        this.swing = util.rand(-5, 5);
    }
};

/**
 * Updates the speed of the wind.
 */
Wind.prototype.updateSpeed = function(time) {
    if (this.type === 'fixed') return;
    if (this.speed < 0.5) {
        this.speed += util.rand(0, 0.25) * time.deltaSec;
    } else {
        this.speed += util.rand(-0.25, 0.25) * time.deltaSec;
    }
};

/**
 * Updates the heading of the wind.
 */
Wind.prototype.updateHeading = function(time) {
    if (this.type === 'fixed') return;
    this.heading += this.swing * time.deltaSec;
    this.heading = util.wrapDegrees(this.heading);
};

module.exports = Environment;
