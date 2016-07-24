/* global RenderBoundary RenderWaypoints */

'use strict';

function RenderCourse(contestObj) {   // eslint-disable-line no-unused-vars

    if (typeof contestObj !== 'object') {
        console.error('Error rendering course, contestObj is not an object: ', contestObj);
    }

    switch (contestObj.type) {
        case 'fleet-race':
            // this.boundary = new RenderBoundary(contestObj.boundary);
            this.waypoints = new RenderWaypoints(contestObj.waypoints);
            break;

        case 'station-keeping':
            this.waypoints = new RenderWaypoints([contestObj.waypoint]);
            break;

        case 'area-scanning':
        case 'obstacle-avoidance':
        default:
            console.error('Error rendering course, contestObj does not have a valid contest type: ', contestObj.type);
    }


}
