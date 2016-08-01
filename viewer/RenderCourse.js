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
            renderWaypointLabels = true;
        case 'area-scanning':               // eslint-disable-line no-fallthrough
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
