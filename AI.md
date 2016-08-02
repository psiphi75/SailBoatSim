# AI

The `player/` folder contains example AI characters.  Some of the AI characters are wrappers for remote control.  

## The Boat

The boat has a rudder and sail that can be moved.  Currently, for simplicity's sake, the sail is fixed.  The rudder
changes the direction of the boat.  The rudder value of -1 is moving the rudder to the left a value of +1 is fully to
the right (around 45 degrees), and it can be any value in between.  The only control point for the boat is the rudder.

The boat's attitude (orientation) is described by the:
 * Roll - Rotation around the x-axis.  How much the boat leans from side to side.  Positive values are to the right.
 * Pitch - Rotation around the y-axis.  How much the boat rotates forward and back.  Positive values are forward.
 * Heading/Yaw - Rotation around the z-axis. How the boat points relative to true north. Positive values are clockwise.

 **NOTE on yaw / heading:** The mathematical direction to the yaw / heading value is counter clockwise.  This makes sense
 if  you a use the right hand rule for axis and rotation.  However, the yaw is the heading, and heading on a compass is
 clockwise.  All the geospatial libraries use heading as clockwise.  This is a time I will break the mathematical rule
 and all heading/yaw values will be clockwise.  See here too: https://en.wikipedia.org/wiki/Clockwise#Mathematics

![Boat Heading, Pitch, Roll](https://raw.githubusercontent.com/psiphi75/SailBoatSim/master/viewer/images/Boat-PitchRollHeading.png)

*Source: [Modeling, control and state-estimation
for an autonomous sailboat](https://uu.diva-portal.org/smash/get/diva2:850625/FULLTEXT01.pdf)*

## Applying AI

Each time a new course is loaded the init function from the player is run. This allows the player to get the course
information and to do other initialisation.

For each simulation step the AI is provided with boat and environment data.  The AI can then calculate it's move, once it's done
it can change rudder value.  This section describes the JavaScript code, but the same applies when using the Python
wrapper API.

### State Data

For each simulation step the AI is provided with the boat and environment.  The time since the last
simulation step (dt) is also included.

```Text
{
	   dt: [Number: time elapsed since last simulation step (milliseconds)],
	   boat: {
           attitude: {
                roll: [Number: Roll around x-axis in degrees (-180 ... 180), 0 is upright, +ve is to right]
                pitch: [Number: Pitch around y-axis in degrees (-180 ... 180), 0 is upright, +ve is roll forward]
                heading: [Number: Heading around z-axis in degrees (-180 ... 180), 0 is true north, +ve is turn left]
            },
            gps: {
                latitude: [Number: latitude in degrees (-90 ... 90)]
                longitude: [Number: longitude in degrees (-180 ... 180)]
            },
            velocity: {
                speed: [Number: The speed of the boat in m/s]
                direction: [Number: The heading of the boat in degrees from true north]
            },
            apparentWind: {
                speed: [Number: The speed of the apparent wind in m/s]
                heading: [Number: Where the apparent wind is going to, in degrees relative to true North (-180 ... 180)]
                // But when calculated relative to the boat, the headingToBoat is the direction of the wind (not source)
                headingToBoat: [Number: The heading of the apparent wind in degrees relative to the boat (-180 ... 180)]
            },
            servos: {
                rudder: [Number: The last value of the rudder servo (-1.0 ... 1.0)]
                sail:  [Number: The last value of the sail servo (-1.0 ... 1.0)]
            }
      },
      environment: {
           wind: {
               speed: [Number: The speed of the wind in m/s]
               heading: [Number: Where the wind is going to, in degrees from true north]
           }
      },
      isSimulation: [Boolean: true if it's a simulation, false if it's the real deal]
}
```

#### Wind direction vs wind heading

This place explains it concisely, in a nutshell:
 * Wind direction -> Where the wind is coming from.
 * Wind heading -> Where the wind is going to.  **We use wind heading**.


### Moving the rudder

```Text
{
    action: 'move',
    servoRudder: [Number: The value of the rudder (-1.0 to 1.0) - where 1.0 is rudder is pointing 45 degrees to the right (boat will turn right)],
    servoSail: [Number: The value of the sail - CURRENTLY DISABLED]
}
```

### The Contest Manager

The contest manager will load a contest from disk and provide it a controller and all observers.  The AI can request a
contest at any time by sending the ContestManager device a command.  The ContestManager is will be on the
"ContestManager" channel.

#### Request Contest

The request for a contest is like below.

```Text
{
    action: 'request-contest',
    type: [String: one of 'fleet-race', 'station-keeping', 'area-scanning', 'obstacle-avoidance']
    location: [String: one of 'auckland', 'viana-do-castelo']
    realtime: [Boolean: true if it is to be realtime, false to run as fast as possible]
    latitude: [(optional) Number: degrees. Initial value for the GPS]
    longitude: [(optional) Number: degrees.  Initial value for the GPS]
    windSpeed: [(optional) Number: m/s.  If provided, the wind will be fixed at this speed, otherwise a random wind will be set set.]    
    windHeading: [(optional) Number: degrees. NOTE: Where the wind is going to, in degrees from true north]    
}
```

This results in a response like below:
```Text
{
    type: 'new-contest',
    request: [Object: this is just request object that was sent.  This is useful for observers like the simulator],
    contest: [Object: The details of the contest, as described in the Contests section below.]
}
```

Upon successful contest selection, the contest will be set and the simulation started.  The
[state data](#state-data) will begin to be sent.

## Contests

There are 4 types of contests:
 * Fleet race - race against other boats around buoys.
 * Station keeping - stay within a particular point.
 * Area scanning - visit many tiles on grid in any order.
 * Obstacle avoidance - sail between two way-points and avoid a random obstacle.

Further reading on the above races:
 * [Official rules](https://web.fe.up.pt/~jca/wrsc2016.com/docs/WRSC_rules_2016_V1.0.pdf)
 * [Overview of the rules](http://blog.anemoi.nz/viana-do-castelo-hear-we-come/)

### Waypoints

Each course data consist of waypoints.  A waypoint object is as follows:

```Text
{
    latitude: [Number: latitude in degrees (-90 ... 90)],
    longitude: [Number: longitude in degrees (-180 ... 180)],
    achieved: [Bool: true if the waypoint has been reached],
    type: 'circle|square',
    radius: [Number: the radius of the circle, or 1/2 length of the square.  Unit: meters],     
}
```

A waypoint can be square or a circle.  A waypoint is considered achieved if the boat reaches 1m inside the waypoint
(except for the station keeping contest).


### Fleet Race

The fleet race is a classic yacht race, against other yachts around a course.  The course data object will look like the
following:

```Text
{
    type: 'fleet-race',
    waypoints: [Array of waypoints, in order (first is start, last is finish)],
    boundary: [List of points, boat must stay within boundary],
    timeLimit: [Number: seconds]
    timeToStart: [Number: time (milliseconds) until the start of the race, if negative value then time since race begun]
}
```

### Station Keeping

The station keeping contest requires the boat to remain within the radius of a given location.

```Text
{
    type: 'station-keeping',
    waypoints: [waypoint],
    timeLimit: [Number: total time the boat is required to remain in the circle]
    timeToStart: [Number: the time remaining]
}
```

### Area scanning

The boat must scan an area.  I like to think of visiting many square waypoints.

```Text
{
    type: 'area-scanning',
    waypoints: [Array of waypoints, in any order],
    boundary: [List of points, boat must stay within boundary],
    timeLimit: [Number: seconds]
    timeToStart: [Number: the time remaining]
}
```


### Obstacle avoidance

The boat must sail between two waypoints.  The first two times are obstacle free, the third time an obstacle is
entered into the course at a random location.  I think of this as sailing between various waypoints (placed only at
two locations) and avoiding all obstacles.

```Text
{
    type: 'obstacle-avoidance',
    waypoints: [Array of waypoints, in order (first is start, last is finish)],
    boundary: [List of points, boat must stay within boundary - except when avoiding obstacle]
}
```

Note: The each 2nd waypoint will be at the same point.
