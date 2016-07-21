var util = require('../lib/util.js');

var Template = {
    info: {
        name: 'Template',
    },
    /**
     * This function is called every step.
     * @param  {object} state       See below:
     * {
     * 	   dt: [Number: time elapsed since last simulation step (milliseconds)],
     * 	   boat: {
     *            attitude: {
     *                 roll: [Number: Roll around x-axis in degrees (-180 ... 180), 0 is upright, +ve is to right]
     *                 pitch: [Number: Pitch around y-axis in degrees (-180 ... 180), 0 is upright, +ve is roll forward]
     *                 heading: [Number: Heading around z-axis in degrees (-180 ... 180), 0 is true north, +ve is turn right]
     *             },
     *             gps: {
     *                 latitude: [Number: latitude in degrees (-90 ... 90)]
     *                 longitude: [Number: longitude in degrees (-180 ... 180)]
     *             },
     *             velocity: {
     *                 speed: [Number: The speed of the boat in m/s]
     *                 direction: [Number: The heading of the boat in degrees from true north]
     *             },
     *             apparentWind: {
     *                 speed: [Number: The speed of the apparent wind in m/s]
     *                 heading: [Number: The heading of the apparent wind in degrees relative to true North (-180 ... 180)]
     *                 headingToBoat: [Number: The heading of the apparent wind in degrees relative to the boat (-180 ... 180)]
     *                 // NOTE: Wind direction is reported by the direction from which it originates. https://en.wikipedia.org/wiki/Wind_direction
     *             },
     *             servos: {
     *                 rudder: [Number: The last value of the rudder servo (-1.0 ... 1.0)]
     *                 sail:  [Number: The last value of the sail servo (-1.0 ... 1.0)]
     *             }
     *       },
     *       environment: {
     *            wind: {
     *                speed: [Number: The speed of the wind in m/s]
     *                heading:  [Number: The heading of the source of the wind in degrees from true north]
     *            }
     *       },
     *       waypoints: [ list of waypoints, structure to be determined ]
     * }
     *
     *
     * @return {object}     The result is the new value of the rudder.  Example:
     * {
     *     action: 'move',
     *     servoRudder: [Number: The value of the rudder (-1.0 to 1.0) - where 1.0 is rudder is pointing 45 degrees to the right (boat will turn right)],
     *     servoSail: [Number: The value of the sail - CURRENT DISABLED]
     * }
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
