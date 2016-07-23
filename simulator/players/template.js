var util = require('../lib/util.js');

var Template = {
    info: {
        name: 'Template',
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
    }
};

module.exports = Template;
