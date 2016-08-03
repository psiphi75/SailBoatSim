'use strict';

var Position = require('./Position');

function WaypointManager(wpArray) {
    this.waypoints = wpArray.map(function(wp, i) {
        var thisWp = new Waypoint(wp);
        thisWp.number = (i + 1).toString();
        return thisWp;
    });
    this.current = 0;
}
/**
 * Move to the next waypoint, in sequential order.  Mark the current waypoint as achieved.
 * @return {Position} pos The new current waypoint.
 */
WaypointManager.prototype.next = function (pos) {
    this.waypoints[this.current].achieved = true;
    this.current += 1;
    return this.getStatus(pos);
};
/**
 * Move to the next closed waypoint.  Mark the current waypoint as achieved.
 * @return {Position} pos The new current waypoint.
 */
WaypointManager.prototype.nextClosest = function (pos) {
    this.waypoints[this.current].achieved = true;
    var minDist = this.waypoints.reduce(function (min, wp, i) {
        var d = wp.distanceHeadingTo(pos);
        if (d < min.distance) {
            return {
                distance: d,
                i: i
            };
        } else {
            return min;
        }
    }, {distance: Infinity, i: -1});
    this.current = minDist.i;
    return this.getStatus(pos);
};
/**
 * Get the distance and heading to the current waypoint.
 * @param {Position} pos the Position to calculate from.
 * @return {object} {distance, heading}
 */
WaypointManager.prototype.getStatus = function (pos) {
    var currentWP = this.getCurrent();
    var result = pos.distanceHeadingTo(currentWP);
    result.achieved = (result.distance < currentWP.radius);
    result.radius = currentWP.radius;
    return result;
};
WaypointManager.prototype.getCurrent = function () {
    if (this.current >= this.waypoints.length) this.current = 0;
    return this.waypoints[this.current];
};
WaypointManager.prototype.getPrevious = function () {
    var prev = this.current - 1;
    if (prev < 0) {
        prev = this.waypoints.length - 1;
    }
    return this.waypoints[prev];
};

module.exports = WaypointManager;


function Waypoint(coord) {
    Position.call(this, coord);
    this.achieved = coord.achieved;
    this.type = coord.type;
    this.radius = coord.radius;
}
// subclass extends superclass
Waypoint.prototype = Object.create(Position.prototype);
Waypoint.prototype.constructor = Waypoint;
