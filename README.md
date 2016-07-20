# Sailboat Simulator

On September 5 to 10 we will be competing in the [World Robotic Sailboat Championships](http://wrsc2016.com/) in
Viana do Castelo, Portugal.

*Note:* This project is very preliminary and some aspects of the simulator do not currently work.  A.k.a. it's Alpha.

## Getting started

I run this on a Linux machine.  I have nodejs and npm installed, the versions shouldn't matter.

To install the simulator run the following commands.
```sh
git clone https://github.com/psiphi75/SailBoatSim
npm install
npm index
```

**You will get compile errors** during `npm install`, this is normal.

Now you should see a two links, one link is for your mobile phone, this can be used to remote control the virtual
sailboat.  The other is for the visualisation, you should see a very basic virtual sailboat sailing around in a
3d environment (this uses [CesiumJS](http://cesiumjs.org/)).

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
