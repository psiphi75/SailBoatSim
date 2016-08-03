/* global Cesium $ Boat Arrow RenderGrid RenderCourse ContestObserver */
'use strict';

const BING_API_KEY = 'AnaBMah6dkmpEMQuI-p16Ge_Lmkmf3C0OOqqLb5nvFZ_G3sKhL4rmlkGePsmLah7';
const REALTIME_URL = window.location.hostname;
Cesium.BingMapsApi.defaultKey = BING_API_KEY;

var GLOBALS = {
    viewer: null,
};

$( document ).ready(function() {

    //
    // Ask user what they want to do. FIXME: Bad hack
    //
    var source = 2;
    // do {
    //     var question = 'What source data do you want to use:\n';
    //     question += '  1) Actual: Load from disk\n';
    //     question += '  2) Actual/Simulation: Live via URL\n';
    //     var defaultOption = '2';
    //     source = parseInt(window.prompt(question, defaultOption));   // eslint-disable-line no-alert
    // } while (!(source >= 1 && source <= 2));

    var windvane = new Arrow('Windvane', 'blue');
    var apparentWind = new Arrow('ApparentWind', 'red');
    var boat = new Boat(source, REALTIME_URL, function() {
        startCesium(boat, windvane, apparentWind);
    });


});


function startCesium(boat, windvane, apparentWind) {

    if (!boat.dataSource.isRealTime) {
        var startTime = Cesium.JulianDate.fromDate(boat.dataSource.getMinTime());
        var endTime = Cesium.JulianDate.fromDate(boat.dataSource.getMaxTime());
        var clock = new Cesium.Clock({
            startTime: startTime,
            currentTime: startTime,
            stopTime: endTime,
            clockRange: Cesium.ClockRange.LOOP_STOP,
            multiplier: 5,
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
    var contest = new ContestObserver(REALTIME_URL, onContestChange);

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
                            + 'Rudder:  ' + status.boat.servos.rudder.toFixed(3);

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
