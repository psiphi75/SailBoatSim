
function Realtime(url, channel, connectionCallback) {  // eslint-disable-line no-unused-vars
    'use strict';

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
    var hasGPS = false;
    var AHRS = require('ahrs');
    var madgwick = new AHRS({
        sampleInterval: 5,
        algorithm: 'Madgwick',
        beta: 0.2
    });
    var lasttime;

    //
    // Timeout after X seconds
    //
    setTimeout(function() {
        callCallback(false);
    }, 5000);

    observer.on('register', function () {
        console.log('Registered on channel: ' + observer.channel + ' with UID: ' + observer.uid);
        callCallback(true);
        observer.on('status', handleBoatStatusUpdate);
    });
    observer.on('error', handleError);

    return {
        isRealTime: true,
        getBoatStatus: function () {
            return boatStatus;
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

        if (typeof status === 'object' && typeof status.compassRaw === 'object') {
            boatStatus = getBoatStatusFromActualBoat(status);
        } else if (status.isSimulation) {
            boatStatus = status;
        }

    }

    function getBoatStatusFromActualBoat(status) {
        if (status.gps && status.gps.position) {
            hasGPS = true;
        }
        if (!hasGPS) {
            status.gps = {
                // latitude: 0.001,
                // longitude: 0.001,
                latitude: -36.8095,
                longitude: 174.7505,
                altitude: 0
            };
        }

        //
        // Calculate attitude
        //

        var dt = status.time - lasttime;
        lasttime = status.time;
        madgwick.update(status.gyro.x * Math.PI / 180, status.gyro.y * Math.PI / 180, status.gyro.z * Math.PI / 180,
            status.accel.x, status.accel.y, status.accel.z,
            status.compassRaw.x, status.compassRaw.y, status.compassRaw.z, dt / 1000);

        //
        // Get the result of the updates
        //

        status.attitude = madgwick.getQuaternion();

        var hpr = madgwick.getEulerAngles();
        status.attitude.heading = hpr.heading * 180 / Math.PI;
        status.attitude.pitch = hpr.pitch * 180 / Math.PI;
        status.attitude.roll = hpr.roll * 180 / Math.PI;

        return status;
    }

}
