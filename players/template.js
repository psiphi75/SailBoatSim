var util = require('../libs/util.js');

var Template = {
    info: {
        name: 'Template',
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
     * 	   		heading:   // The true heading of the boat in m/s
     * 	   }
     * }
     * @param  {[type]} boatState [description]
     * @param  {[type]} waypoints [description]
     * @return {[type]}           [description]
     */
    ai: function (boatState, environment, waypoints) {
        return {
            rudder: 0,
            sail: 0
        };
    }
};

module.exports = Template;
