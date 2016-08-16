
function Realtime(url, channel, connectionCallback) {  // eslint-disable-line no-unused-vars
    'use strict';
// url = '192.168.43.18'
// channel = 'Perfectly Yummy Antitau'
    //
    // Connection stuff
    //
    var wrc = require('web-remote-control');
    var observer = wrc.createObserver({
        proxyUrl: url,
        channel: channel,
    });
    var boatStatus = {};

    startObserver();

    function startObserver() {
        observer.on('register', function () {
            console.log('Registered on channel: ' + observer.channel + ' with UID: ' + observer.uid);
            callCallback(true);
            observer.on('status', handleBoatStatusUpdate);
        });
        observer.on('error', handleError);
    }

    //
    // Set up a controller so we can controll the simulation speed
    //
    var dataType;
    var simSpeedController;
    if (channel === 'Simulation') {
        dataType = 'simulation';
        simSpeedController = wrc.createController({
            proxyUrl: url,
            channel: 'simulation-speed'
        });
        simSpeedController.on('error', handleError);
    } else {
        dataType = 'realtime';
    }

    var lastSimSpeed = -999;
    return {
        dataType: dataType,
        setSimSpeed: function(simSpeed) {
            if (simSpeed === lastSimSpeed) return;
            lastSimSpeed = simSpeed;

            simSpeedController.command({setSpeed: simSpeed});
        },
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
