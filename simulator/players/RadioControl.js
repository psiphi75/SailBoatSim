var util = require('../../lib/util.js');
var lastRudderValue = 0;

var wrc = require('web-remote-control');
var toy = wrc.createToy({
    proxyUrl: 'localhost',
    udp4: true,
    tcp: false,
    socketio: false,
    channel: 'Simulation',
    log: function() {}
});
toy.on('command', function handleCommand(command) {
    if (command.action === 'move') {
        lastRudderValue = command.servoRudder;
    }
});
toy.on('error', console.error);

var RC = {
    info: {
        name: 'RadioControl'
    },
    init: {
        position: {
            latitude: -36.8095,
            longitude: 174.7505
        }
    },
    /**
     * This function is called every step.  boatState object:
     * {
     * 	   dt: change in time (milliseconds)
     * 	   attitude: {
     * 	   		roll:      // Roll in degrees (-180 ... 180)
     * 	   		pitch:     // Pitch in degrees (-180 ... 180)
     * 	   		heading:   // True heading in degrees from north (-180 ... 180)
     * 	   },
     * 	   apparentWind: {
     * 	   		speed:     // The speed of the apparent wind in m/s.
     * 	   		heading:   // The heading of the apparent wind in degrees
     * 	   },
     * 	   position: {
     * 	   		latitude:
     * 	   		longitude:
     * 	   },
     * 	   velocity: {
     * 	   		speed:     // The speed of the boat in m/s
     * 	   		direction:   // The true heading of the boat in m/s
     * 	   }
     * }
     * @param  {[type]} boatState [description]
     * @param  {[type]} waypoints [description]
     * @return {[type]}           [description]
     */
    ai: function (boatState, environment, waypoints) {
        boatState.isSimulation = true;
        boatState.windvane = {
            headingTrue: environment.wind.heading
        };
        toy.status(boatState);

        return {
            rudder: lastRudderValue,
            sail: 0
        };
    }
};

module.exports = RC;
