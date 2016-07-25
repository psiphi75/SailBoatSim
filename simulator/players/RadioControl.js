var util = require('../../lib/util.js');
var lastRudderValue = 0;

//
// Set up the toy (a.k.a boat) be controlled by the controller (can be a mobile phone or some remote AI).
//
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
    //
    // Save the rudder state for the next step in the simulation
    //
    if (command.action === 'move') {
        lastRudderValue = command.servoRudder;
    }
});
toy.on('error', console.error);

var RC = {
    info: {
        name: 'RadioControl'
    },

    /**
     * This will be run once before the simulational initalises.
     * See this link for the contest details: https://github.com/psiphi75/SailBoatSim/blob/master/AI.md#contests
     */
    init: function(contest) {
        this.contest = contest;
    },

    /**
     * This function is called every step.  See the AI.md file for documentation.
     * @param  {object} state
     * @return {object} The result is the new value of the rudder.
     */
    ai: function (state) {
        state.isSimulation = true;
        toy.status(state);

        return {
            action: 'move',
            servoRudder: lastRudderValue,
            servoSail: 0
        };
    },

    close: function() {
        toy.removeAllListeners();
    }
};

module.exports = RC;
