# Sailboat Simulator

On September 5 to 10 we will be competing in the [World Robotic Sailboat Championships](http://wrsc2016.com/) in
Viana do Castelo, Portugal.

*Note:* This project is very preliminary and some aspects of the simulator do not currently work.  A.k.a. it's Alpha.

## Getting started

I run this on a Linux machine.  I have nodejs and npm installed, the versions shouldn't matter.

### 1) Install SailBoatSim
To install the simulator run the following commands.

```sh
git clone https://github.com/psiphi75/SailBoatSim
cd SailBoatSim
npm install
```
**You will get compile errors** during `npm install`, this is normal.

### 2) Run the simulator
```sh
node index
```

**Note:** This has been tested and works on Linux, should work on MacOS, but your millage may vary with Windows.

**Starting with a course**
If you want to load a course when the simulator starts, you can run the following command:
```sh
COURSE_ON_REGISTER=true node index.js
```


### Visualising it all

Now you should see a two links, one link is for your mobile phone, this can be used to remote control the virtual
sailboat.  The other is for the visualisation, you should see a very basic virtual sailboat sailing around in a
3d environment (this uses [CesiumJS](http://cesiumjs.org/)).

You should see something similar to the image below:
![Visualisation](https://raw.githubusercontent.com/psiphi75/SailBoatSim/master/viewer/images/Example.png)

You will see:
* A simple model of the boat, it will lean and rotate appropriately.
* A blue arrow - this is the direction of the actual wind.
* A red arrow - this is the direction of the [apparent wind](https://en.wikipedia.org/wiki/Apparent_wind) (wind relative to the boat).
* Cesium Inspect - to inspect the object.
* Cesium icons - change map and search for landmarks.

### Using the Controller

On the mobile phone you must enter the "Simulation" as the channel, tap "Go".  The Rudder of the boat is controlled using
the up and down tilt of the phone. The sail is the slider.  **Pro Tip:** Lock your phone's screen orientation, rotate
the phone 90 degrees and you have a controller that changes the rudder left to right when you tilt the phone left
to right.

## Writing your own AI

The `simulator/players/` folder has the `template.js` and `RadioControl.js` JavaScript files.  You can inspect these to see how the AI should behave.

You need to write your code in the `ai()` function.  The `ai()` should return
an object like:

```Text
{
    action: 'move',
    servoSail: [Number: -1.0 to 1.0],
    servoRudder: [Number: -1.0 to 1.0] -- not currently enabled
}
```

## Reading Material

* The [World Robotic Sailboat Championships](http://wrsc2016.com/) rules.
* A [paper on Autonomous yachts](https://uu.diva-portal.org/smash/get/diva2:850625/FULLTEXT01.pdf).

## Todo & bugs

* I will create more documentation on how to get started.
* The simulator is not actually working, this will take a day or two fix.  It
should be fixed by 22 July 2016.
* Create an issue to report more bugs/todos/questions/etc.

## License

Copyright 2016 Simon M. Werner

Licensed to the Apache Software Foundation (ASF) under one or more contributor license agreements.  See the NOTICE file distributed with this work for additional information regarding copyright ownership.  The ASF licenses this file to you under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  You may obtain a copy of the License at

  [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the License for the specific language governing permissions and limitations under the License.
