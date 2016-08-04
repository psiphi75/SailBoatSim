
'use strict';

var wrc = require('web-remote-control');
var renderer = wrc.createToy({
    proxyUrl: 'localhost',
    udp4: false,
    tcp: true,
    socketio: false,
    channel: 'Renderer',
    log: function () {}
});

renderer.on('register', function() {

    renderer.status({
        render: 'point',
        details: {
            id: '##1',
            label: 'Hello World',
            latitude: -36.809119122287484,
            longitude: 174.75057466678572,
            color: {
                red: 1.0,
                green: 0.5,
                blue: 0.333
            }
        }
    });

    setTimeout(function() {
        renderer.close();
    }, 1000);
});
