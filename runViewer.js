/*********************************************************************
 *                                                                   *
 *   Copyright 2016 Simon M. Werner                                  *
 *                                                                   *
 *   Licensed to the Apache Software Foundation (ASF) under one      *
 *   or more contributor license agreements.  See the NOTICE file    *
 *   distributed with this work for additional information           *
 *   regarding copyright ownership.  The ASF licenses this file      *
 *   to you under the Apache License, Version 2.0 (the               *
 *   "License"); you may not use this file except in compliance      *
 *   with the License.  You may obtain a copy of the License at      *
 *                                                                   *
 *      http://www.apache.org/licenses/LICENSE-2.0                   *
 *                                                                   *
 *   Unless required by applicable law or agreed to in writing,      *
 *   software distributed under the License is distributed on an     *
 *   "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY          *
 *   KIND, either express or implied.  See the License for the       *
 *   specific language governing permissions and limitations         *
 *   under the License.                                              *
 *                                                                   *
 *********************************************************************/

'use strict';

/**
 * This will run a static webserver and host the CesiumJS files as well
 * as the files in the ./viewer directory.
 */

const PORT = 7899;

var staticServer = require('node-static');

//
// Create a node-static server instance to serve the './public' folder
//
const options = {
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
    }
};
var viewerFiles = new staticServer.Server('./viewer', options);
var cesiumFiles = new staticServer.Server('./node_modules/cesium/Build/', options);

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        var isCesium = (request.url.indexOf('/Cesium') === 0);
        if (isCesium) {
            cesiumFiles.serve(request, response);
        } else {
            viewerFiles.serve(request, response);
        }
    }).resume();
}).listen(PORT);

console.log(`Point your desktop web browser to http://localhost:${PORT}`);


//
// Make the recordings availble in the /recordings folder, and make a default one.
//

var fs = require('fs');
var RECORDING_LIST_FILE = 'recordings.json';
var RECORDING_PATH = './viewer/recordings/';
var recordingToLoad = process.env.LOAD_RECORDING;
if (recordingToLoad) {

    // Load a recording on boot

    fs.readdir('./viewer/recordings', function(err, fsList) {
        if (err) {
            console.error('Error loading recordings: ', err);
            return;
        }

        // Match the default recording
        var defaultRecording = null;
        fsList.forEach((recordingName) => {
            if (recordingName === recordingToLoad) {
                defaultRecording = recordingToLoad;
            }
        });
        if (defaultRecording === null) {
            defaultRecording = fsList[0];
        }

        // Ignore the recordings file
        var i = fsList.indexOf(RECORDING_LIST_FILE);
        if (i !== -1) {
            fsList.splice(i, 1);
        }

        var recordings = {
            default: defaultRecording,
            list: fsList
        };
        fs.writeFile(RECORDING_PATH + RECORDING_LIST_FILE, JSON.stringify(recordings), function (err2) {
            if (err2) {
                console.error('Error creating recording list file: ', err2);
                return;
            }
        });
    });

} else {
    // Don't load the recoring (remove the recording list file)
    fs.unlink(RECORDING_PATH + RECORDING_LIST_FILE, function(err) {
        if (err && err.errno !== -2) {
            console.error('err');
        }
    });
}
