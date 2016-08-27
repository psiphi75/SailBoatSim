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

/* global RenderBoundary RenderWaypoints */

'use strict';

function RenderCourse() {   // eslint-disable-line no-unused-vars
    this.wpRenderer = new RenderWaypoints();
    this.boundsRenderer = new RenderBoundary();
}

RenderCourse.prototype.set = function(contestObj) {
    if (typeof contestObj !== 'object') {
        console.error('Error rendering course, contestObj is not an object: ', contestObj);
    }
    this.boundsRenderer.remove();
    this.wpRenderer.removeAll();

    var renderWaypointLine = false;
    var renderWaypointLabels = false;
    switch (contestObj.type) {
        case 'fleet-race':
            renderWaypointLine = true;
        case 'area-scanning':               // eslint-disable-line no-fallthrough
            renderWaypointLabels = true;
            this.boundsRenderer.set(contestObj.boundary);
            this.wpRenderer.set(contestObj.waypoints, renderWaypointLine, renderWaypointLabels);
            break;

        case 'station-keeping':
            this.wpRenderer.set(contestObj.waypoints);
            break;

        case 'obstacle-avoidance':
        default:
            console.error('Error rendering course, contestObj does not have a valid contest type: ', contestObj.type);
    }
};
