/* global Cesium $ Boat Arrow RenderPoint RenderGrid RenderCourse ContestObserver */
'use strict';

const BING_API_KEY = 'AnaBMah6dkmpEMQuI-p16Ge_Lmkmf3C0OOqqLb5nvFZ_G3sKhL4rmlkGePsmLah7';
const REALTIME_URL = window.location.hostname;
const RECORDING_INFO_URL = 'recordings/recordings.json';
Cesium.BingMapsApi.defaultKey = BING_API_KEY;

var GLOBALS = {
    viewer: null,
    renderer: null
};

$( document ).ready(function() {


    checkAndLoadRecording(loadViewer);

    /**
     * Check if the recoding exists.  If not then we don't load the recording.
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    function checkAndLoadRecording(callback) {
        $.getJSON(RECORDING_INFO_URL, function (data) {
            callback('recordings/' + data.default);
        }).error(function() {
            callback(null);
        });
    }

    /**
     * The Main load function.  Everything starts here.
     * @param  {[type]} recordingInfo [description]
     * @return {[type]}               [description]
     */
    function loadViewer(recordingInfo) {

        // FIXME: This would be all better in the boat loader.
        var source;
        var url;
        if (recordingInfo) {
            url = recordingInfo;
            source = 'file';
        } else {
            url = REALTIME_URL;
            source = 'simulation';
        }
        var windvane = new Arrow('Windvane', 'blue');
        var apparentWind = new Arrow('ApparentWind', 'red');
        var boat = new Boat(source, url, function() {
            startCesium(boat, windvane, apparentWind);
        });

        //
        // Configure the renderer listener
        //
        var wrc = require('web-remote-control');
        GLOBALS.renderer = wrc.createObserver({
            channel: 'Renderer'
        });
        GLOBALS.renderer.on('status', function(status) {
            if (status.render === 'point') {
                RenderPoint(status.details);
            }
        });
        GLOBALS.renderer.on('error', console.error);
    }

});


function startCesium(boat, windvane, apparentWind) {

    var clock;
    if (boat.dataSource.dataType === 'recording') {
        var startTime = Cesium.JulianDate.fromDate(boat.dataSource.getMinTime());
        var endTime = Cesium.JulianDate.fromDate(boat.dataSource.getMaxTime());
        clock = new Cesium.Clock({
            startTime: startTime,
            currentTime: startTime,
            stopTime: endTime,
            clockRange: Cesium.ClockRange.LOOP_STOP,
            multiplier: 5,
            shouldAnimate: true
        });
    } else if (boat.dataSource.dataType === 'simulation') {
        clock = new Cesium.Clock({
            multiplier: 1,
            shouldAnimate: true
        });
    }

    GLOBALS.viewer = new Cesium.Viewer('cesiumContainer', {
        scene3DOnly: true,
        infoBox: false,
        selectionIndicator: false,
        clock: clock,
        shadows: true   // Turn on the sun
    });

    // The size of the terrain tile cache, expressed as a number of tiles.
    GLOBALS.viewer.scene.globe.tileCacheSize = 1000;

    // This adds the cescium Inspector dialog
    GLOBALS.viewer.extend(Cesium.viewerCesiumInspectorMixin);

    // Wait for contest updates
    var contest = new ContestObserver(REALTIME_URL, onContestChange); // eslint-disable-line no-unused-vars

    // Get the HUD
    var hud = document.getElementById('hud');

    // Create a draw loop using requestAnimationFrame. The
    // tick callback function is called for every animation frame.
    var isFirstStatusUpdate = true;
    var grid = new RenderGrid();
    var courseRenderer = new RenderCourse();
    function tick() {
        if (clock) {
            var time = Cesium.JulianDate.toDate(clock.tick());
            if (boat.dataSource.dataType === 'simulation') {
                boat.dataSource.setSimSpeed(clock.multiplier);
            }
        }

        //
        // Render the boat.
        //

        var status = boat.render(time);

        //
        // Render apparent and actual wind
        //

        if (status && status.environment && status.environment.wind) {

            hud.innerHTML = 'Lat, Long: ' + status.boat.gps.latitude.toFixed(6) + ',  ' + status.boat.gps.longitude.toFixed(6) + '<br/>'
                            + 'Heading: ' + status.boat.attitude.heading.toFixed(1) + '°<br/>'
                            + 'Roll:    ' + status.boat.attitude.roll.toFixed(1) + '°<br/>'
                            + 'Speed:   ' + status.boat.velocity.speed.toFixed(2) + ' m/s<br/>'
                            + 'Rudder:  ' + status.boat.servos.rudder.toFixed(3) + '<br/>'
                            + 'Sail:    ' + status.boat.servos.sail.toFixed(3) + '<br/>'
                            + '<br/>Wind<br/>'
                            + 'Speed:    ' + status.environment.wind.speed.toFixed(2) + ' m/s<br/>'
                            + 'Heading:   ' + status.environment.wind.heading.toFixed(1) + '°<br/>';

            if (isFirstStatusUpdate) {
                grid.set({
                    latitude: status.boat.gps.latitude,
                    longitude: status.boat.gps.longitude
                });
                isFirstStatusUpdate = false;
            }

            windvane.render({
                latitude: status.boat.gps.latitude,
                longitude: status.boat.gps.longitude,
                heading: status.environment.wind.heading,
            });

            apparentWind.render({
                latitude: status.boat.gps.latitude,
                longitude: status.boat.gps.longitude,
                heading: status.boat.apparentWind.headingToNorth
            });
        }
        Cesium.requestAnimationFrame(tick);
    }
    tick();

    function onContestChange(newContest) {

        var contestDetails = newContest.contest;
        var firstWaypoint = contestDetails.waypoints[0];

        grid.set({
            latitude: firstWaypoint.latitude,
            longitude: firstWaypoint.longitude
        });
        courseRenderer.set(contestDetails);
    }


    //
    // Detect mouse click events and print out the lat/long coordinate
    //
    var handler = new Cesium.ScreenSpaceEventHandler(GLOBALS.viewer.scene.canvas);
    handler.setInputAction(function (action) {
        var ray = GLOBALS.viewer.camera.getPickRay(action.position);
        var position = GLOBALS.viewer.scene.globe.pick(ray, GLOBALS.viewer.scene);
        if (Cesium.defined(position)) {
            var cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position);
            console.log({
                latitude: Cesium.Math.toDegrees(cartographic.latitude),
                longitude: Cesium.Math.toDegrees(cartographic.longitude)
            });
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

}
