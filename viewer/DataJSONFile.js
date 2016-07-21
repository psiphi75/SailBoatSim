/* global $ Table */
var ArrMin = function(arr) {
    var min = Infinity;
    arr.forEach((val) => {
        min = Math.min(min, val);
    });
    return min;
};

var ArrMax = function(arr) {
    var max = -Infinity;
    arr.forEach((val) => {
        max = Math.max(max, val);
    });
    return max;
};


function DataJSONFile(jsonPath, callback) { // eslint-disable-line no-unused-vars
    'use strict';

    var data;
    var lastTimelineTime = 0;

    // Start the data - but wait, we may connect to realtime connection
    $.get(jsonPath, function(jsonData) {
        data = new Table(jsonData);
        callback();
    });

    return {
        isRealTime: false,
        getMinTime: function() {
            var times = data.getColumn('timestamp');
            return new Date(ArrMin(times));
        },
        getMaxTime: function() {
            var times = data.getColumn('timestamp');
            return new Date(ArrMax(times));
        },
        getStatus: function (time) {
            var timelineTime = time.getTime();
            var paused = (lastTimelineTime === timelineTime);
            lastTimelineTime = timelineTime;
            if (paused) {
                return null;
            }
            return data.findNext('timestamp', (pathTime) => (pathTime <= timelineTime && timelineTime <= pathTime + 1000));
        }
    };
}
