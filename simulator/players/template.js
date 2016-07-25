var util = require('../lib/util.js');

var Template = {
    info: {
        name: 'Template',
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
        return {
            action: 'move',
            servoRudder: 0,
            servoSail: 0
        };
    },
    close: function() {
    }
};

module.exports = Template;
