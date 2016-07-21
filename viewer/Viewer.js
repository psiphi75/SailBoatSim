/* global Cesium $ Boat Arrow */
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

    //
    // Set up the timeline
    //

    // This adds the cescium Inspector dialog
    GLOBALS.viewer.extend(Cesium.viewerCesiumInspectorMixin);

    // Create a draw loop using requestAnimationFrame. The
    // tick callback function is called for every animation frame.
    function tick() {
        if (clock) {
            var time = Cesium.JulianDate.toDate(clock.tick());
        }
        var status = boat.render(time);
        if (status && status.environment && status.environment.wind) {

            windvane.render({
                latitude: status.boat.gps.latitude,
                longitude: status.boat.gps.longitude,
                heading: -status.environment.wind.heading,
            });

            apparentWind.render({
                latitude: status.boat.gps.latitude,
                longitude: status.boat.gps.longitude,
                heading: status.boat.apparentWind.heading
            });
        }
        Cesium.requestAnimationFrame(tick);
    }
    tick();

}
