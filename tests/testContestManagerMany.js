
'use strict';

var async = require('async');

var tests = [
    {
        action: 'request-contest',
        type: 'area-scanning',
        location: 'viana-do-castelo',
        realtime: true,
        latitude: 1,
        longitude: 2,
        windSpeed: 5,
        windHeading: 45
    },
    {
        action: 'request-contest',
        type: 'area-scanning',
        location: 'auckland',
        realtime: false,
    },
    {
        action: 'request-contest',
        type: 'fleet-race',
        location: 'viana-do-castelo',
        realtime: true,
        latitude: 1,
        longitude: 2,
        windSpeed: 5,
        windHeading: 45
    },
    {
        action: 'request-contest',
        type: 'fleet-race',
        location: 'viana-do-castelo',
        realtime: true,
        latitude: 1,
        longitude: 2,
        windSpeed: 5,
        windHeading: 45
    },
    {
        action: 'request-contest',
        type: 'station-keeping',
        location: 'viana-do-castelo',
        realtime: true,
        windSpeed: 5,
        windHeading: 45
    },
    {
        action: 'request-contest',
        type: 'station-keeping',
        location: 'auckland',
        realtime: true,
        latitude: 1,
        longitude: 2,
    },
];

var wrc = require('web-remote-control');
var controller = wrc.createController({
    proxyUrl: 'localhost',
    channel: 'ContestManager',
    udp4: false,
    tcp: true
});

controller.once('register', function() {

    setTimeout(doTests, 100);

    function doTests() {

        async.eachSeries(tests,
            function (test, callback) {
                controller.command(test);
                controller.once('status', function(obj) {
                        console.log('');
                        console.log(equals(test.type, obj.contest.type));
                        console.log(test.location,
                            obj.contest.waypoints[0].latitude.toFixed(5),
                            obj.contest.waypoints[0].longitude.toFixed(5));
                        if (typeof obj.contest.timeLimit !== 'number') {
                            console.log('*** ERROR: timeLimit is not a number: ', obj.contest.timeLimit);
                        }
                        if (typeof obj.contest.timeToStart !== 'number') {
                            console.log('*** ERROR: timeToStart is not a number: ', obj.contest.timeToStart);
                        }
                        
                        callback();
                    });

                },
                function () {
                    controller.close();
                }
            );

            function equals(a, b) {
                return (a === b).toString() + '\t' + a + '\t' + b;
            }
    }

});
