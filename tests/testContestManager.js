
'use strict';

var wrc = require('web-remote-control');
var controller = wrc.createController({
    proxyUrl: 'localhost',
    channel: 'ContestManager',
});
controller.once('register', function() {
    controller.command({
        action: 'request-contest',
        type: 'fleet-race',
        location: 'viana-do-castelo',
        realtime: true,
//        latitude: 1,
//        longitude: 2,
        windSpeed: 5,
        windHeading: 45
    });
});
controller.once('status', function(obj) {
    console.log(JSON.stringify(obj));
    controller.close();
});
