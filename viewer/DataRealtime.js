
function Realtime(url, channel, connectionCallback) {  // eslint-disable-line no-unused-vars
    'use strict';
url = '192.168.43.18'
channel = 'Perfectly Yummy Antitau'
    //
    // Connection stuff
    //
    var wrc = require('web-remote-control');
    var observer = wrc.createObserver({
        proxyUrl: url,
        channel: channel,
    });
    var boatStatus = {};

    //
    // For AHRS code
    //
    var AHRS = require('ahrs');
    var madgwick = new AHRS({
        sampleInterval: 5,
        algorithm: 'Madgwick',
        beta: 0.2
    });
    var lasttime;

    startObserver();

    function startObserver() {
        observer.on('register', function () {
            console.log('Registered on channel: ' + observer.channel + ' with UID: ' + observer.uid);
            callCallback(true);
            observer.on('status', handleBoatStatusUpdate);
        });
        observer.on('error', handleError);
    }

    return {
        isRealTime: true,
        getStatus: function () {
            return boatStatus;
        },
        restart: function() {
            observer.close();
            startObserver();
        }
    };

    function handleError(err) {
        console.log('There was an error: ', err);
        callCallback(false);
    }

    function callCallback(success) {
        if (typeof connectionCallback === 'function') {
            connectionCallback(success);
            connectionCallback = null;
        }
    }

    function handleBoatStatusUpdate(status) {
        if (!status.boat.gps) {
            status.boat.gps = {
                latitude: -36.85570036201125, longitude: 174.72794221011702,
                altitude: 0
            };
        }
        boatStatus = status;
    }

}
