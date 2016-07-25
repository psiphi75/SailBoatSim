
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
        realtime: true
    });
});
controller.once('status', console.log);
