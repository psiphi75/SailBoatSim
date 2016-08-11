'use strict';

// Hack to make this browser compatible
var require = require ? require : function() {};
var module = module ? module : function() {};

var fs = require('fs');

// TODO: Columns must be well defined to begin with
function Table(headers) {
    var info = {};
    var notes = {};
    var rows = [];
    if (!(headers instanceof Array) && typeof headers === 'object') {
        return createTableFromObject(headers);
    }

    const PATH_SEP = '.';
    var findRowPos = 0;

    var fn = {
        // __diffs: function(colname) {
        //     var h = headers.indexOf(colname);
        //     if (h === -1) return;
        //     var lastVal = rows[0][h];
        //     rows.map((row) => {
        //         var val = row[h];
        //         var diff = Math.abs(val - lastVal);
        //         if (diff > 5) console.log(diff, val, lastVal);
        //         lastVal = val;
        //     });
        // },
        addRow: function (obj) {
            if (obj instanceof Array) {
                rows.push(new Float64Array(obj));
            } else {
                rows.push(createRowFromObject(obj));
            }
        },
        /**
         * Add a note.  By default add it as the last row, otherwise use rowId.
         * @param {String|Object} note   The note to be saved.
         * @param {number} rowId  (optional) The rowId
         */
        addNote: function (note, rowId) {
            // FIXME: Falls out of place when this we sort()
            if (isNaN(rowId) || rowId === null) {
                rowId = rows.length - 1;
            }
            notes[rowId.toString()] = note;
        },
        updateRow: function (i, obj) {
            rows[i] = createRowFromObject(obj);
        },
        sort: function(columnName, orderFunc) {
            var h = headers.indexOf(columnName);
            if (h === -1) return;

            if (typeof orderFunc !== 'function') {
                orderFunc = function(a, b) {
                    return a[h] - b[h];
                };
            }
            rows.sort(orderFunc);
        },
        addColumn: function (name, initVal) {
            if (typeof name !== 'string') {
                console.error('addColumn(): expecting string, got ' + typeof name);
            }
            initVal = initVal === undefined ? NaN : initVal;
            headers.push(name);

            // Now need to initialise all previous rows
            rows = rows.map((row) => {
                var arr = Array.prototype.slice.call(row);
                arr.push(initVal);
                return new Float64Array(arr);
            });
        },
        removeColumn: function(name) {
            var h = headers.indexOf(name);
            if (h === -1) return;
            headers.splice(h, 1);
            rows.forEach((row, rowId) => {
                rows[rowId] = row.filter((val, i) => i !== h);
            });
        },
        modifyColumn: function (name, callback) {
            var h = headers.indexOf(name);
            if (h === -1) return;
            rows.forEach((row, i) => { row[h] = callback(row[h], i); });
        },
        renameColumn: function (name, newName) {
            var h = headers.indexOf(name);
            if (h === -1) return;
            headers[h] = newName;
        },
        getColumn: function (name) {
            var h = headers.indexOf(name);
            if (h === -1) return null;
            var colData = [];
            rows.forEach((row) => {
                colData.push(row[h]);
            });
            return colData;
        },
        copyColumn: function (name, newName) {
            var h = headers.indexOf(name);
            if (h === -1) return;

            fn.addColumn(newName);
            fn.setColumn(newName, fn.getColumn(name));
        },
        setColumn: function (name, colData) {
            var h = headers.indexOf(name);
            if (h === -1) return;
            rows.forEach((row, i) => {
                row[h] = colData[i];
            });
        },
        spreadValues: function(name) {
            var h = headers.indexOf(name);
            if (h === -1) return;
            var lastValue = rows[0][h];
            rows.forEach((row) => {
                var val = row[h];
                if (isNaN(val) || val === 0.0) {
                    row[h] = lastValue;
                } else {
                    lastValue = val;
                }
            });
        },
        removeRow: function(rowId) {
            fn.removeRows(rowId, rowId);
        },
        removeRows: function(startRow, endRow) {
            if (typeof endRow === 'undefined') {
                endRow = rows.length - 1;
            }
            rows.splice(startRow, endRow - startRow + 1);
            repositionNotes(startRow, endRow);
        },
        removeRowsFilter: function(name, filterFunc) {
            var h = headers.indexOf(name);
            var removals = [];
            rows.forEach((row, rowId) => {
                if (filterFunc(row[h])) {
                    removals.push(rowId);
                }
            });
            removals.reverse().forEach((rowId) => fn.removeRow(rowId));
        },
        getRow: function(rowId) {
            // TODO: Should actually make copy of this object
            return createObjectFromRow(rows[rowId], rowId);
        },
        forEachRow: function (callback) {
            rows.forEach((row, i) => {
                var rowObj = createObjectFromRow(row, i);
                callback(rowObj, i);
                fn.updateRow(i, rowObj);
            });
        },
        find: function(columnName, callback) {
            findRowPos = 0;
            return fn.findNext(columnName, callback);
        },
        findNext: function(columnName, callback) {
            var h = headers.indexOf(columnName);

            while (findRowPos < rows.length) {
                var row = rows[findRowPos];
                var found = callback(row[h], findRowPos);
                if (found === true) {
                    return createObjectFromRow(row, findRowPos);
                }
                findRowPos += 1;
            }
            if (findRowPos >= rows.length) {
                findRowPos = 0;
            }
            return null;
        },
        findNote: function(note) {
            for (var rowId in notes) {
                if (note === notes[rowId]) {
                    return parseInt(rowId);
                }
            }
            return null;
        },
        normalize: function(columnName, normMin, normMax) {
            var h = headers.indexOf(columnName);
            var min = fn.min(columnName);
            var max = fn.max(columnName);
            if (typeof normMin === 'undefined') normMin = 0;
            if (typeof normMax === 'undefined') normMax = 1;
            var m = (normMin - normMax) / (min - max);
            var c = normMin - m * min;
            var normCol = rows.map((row) => (row[h] * m + c));
            fn.setColumn(columnName, normCol);
        },
        min: function(columnName) {
            var h = headers.indexOf(columnName);
            var min = Infinity;
            rows.map((row) => {
                var val = row[h];
                if (val < min) {
                    min = val;
                }
            });
            return min;
        },
        max: function(columnName) {
            var h = headers.indexOf(columnName);
            var max = -Infinity;
            rows.map((row) => {
                var val = row[h];
                if (val > max) {
                    max = val;
                }
            });
            return max;
        },
        offset: function(columnName, num) {
            var h = headers.indexOf(columnName);
            if (h === -1) return;
            var rowId = rows.length - 1;
            while (rowId >= num) {
                rows[rowId][h] = rows[rowId - num][h];
                rowId -= 1;
            }
            while (rowId >= 0) {
                rows[rowId][h] = NaN;
                rowId -= 1;
            }
        },
        reduceRowsByAverage: function(factor, ignoreColumns) {
            var ignoreHeaders = ignoreColumns.map((headerName) => headers.indexOf(headerName));
            var rollingAverages = new Float64Array(headers.length);
            var recipFactor = 1 / factor;
            var newRowOffset = 0;
            rows.forEach((row, rowId) => {

                if (rowId % factor === factor - 1) {
                    // Store the average
                    rows[newRowOffset] = rollingAverages;
                    newRowOffset += 1;
                    rollingAverages = new Float64Array(row);
                }

                // otherwise continue calculating the mean
                row.forEach((val, i) => {
                    if (ignoreHeaders.indexOf(i) >= 0) {
                        rollingAverages[i] = val;
                    } else {
                        rollingAverages[i] += val * recipFactor;
                    }
                });

            });

            // Clean up by deleting all unused rows
            fn.removeRows(newRowOffset);
        },
        // function join(that) {
        //
        // },
        set info(infoObj) {
            info = infoObj;
        },
        get info() {
            return info;
        },
        get length() {
            return rows.length;
        },
        get headers() {
            return headers;
        },
        get notes() {
            return notes;
        },
        set notes(_notes) {
            notes = _notes;
        },
        merge: function(tblOther, joinFieldname, newFieldname) {
            var joinField = tblOther.getColumn(joinFieldname);
            var thatField = tblOther.getColumn(newFieldname);
            fn.addColumn(newFieldname);
            var hJoin = headers.indexOf(joinFieldname);
            var hNew = headers.indexOf(newFieldname);
            // var thatLen = joinField.length;
            // console.log(joinField[0], joinField[joinField.length-1])
            // console.log(rows[0][0], rows[rows.length-1][0])

            //
            // Find the first common value
            //
            var thisRowId = 0;
            var thatRowId = 0;
            var thisJoinValue = rows[thisRowId][hJoin];
            var thatJoinValue = joinField[thatRowId][hJoin];

            thisJoinValue = rows[thisRowId][hJoin];
            findNextThatJoinValue();
            // console.log(rows[thisRowId], hJoin, thisJoinValue, thatJoinValue)

            //
            // For each common value fill in the gaps
            //
            // var x= 0;
            while (thisRowId < rows.length) {

                // if (x < 20) console.log('1: ', thisRowId, thisJoinValue, thatField[thatRowId])
                rows[thisRowId][hNew] = thatField[thatRowId];
                thisJoinValue = rows[thisRowId][hJoin];
                // console.log(thisRowId, rows[thisRowId][hJoin], rows[thisRowId][hNew], thatJoinValue, thatField[thatRowId], thatRowId)
                thisRowId += 1;

                if (thisJoinValue >= thatJoinValue) {
                    findNextThatJoinValue();
                }

            }

            function findNextThatJoinValue() {
                do {
                    thatJoinValue = joinField[thatRowId];
                    thatRowId += 1;
                    // console.log(thatJoinValue, thatRowId)

                    // if (x++ < 20) console.log('2:                            ', thisRowId, thatJoinValue, )

                } while (thatJoinValue < thisJoinValue && thatRowId + 1 < joinField.length);
            }

        },
        toString: function () {
            return JSON.stringify(this.toObject());
        },
        toObject: function() {
            var obj = {
                headers: headers,
                info: info,
                rows: rows,
                notes: notes
            };
            return obj;
        },
        exportCSV: function(filename) {
            fs.writeFileSync(filename, headers.join(','));
            rows.forEach((row) => {
                fs.appendFileSync(filename, '\n' + row.join(','));
            });
        },
        exportGPX: function saveGPX(filename) {

            var GPX_HEAD = '';
            GPX_HEAD += '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>\n';
            GPX_HEAD += '<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:gpxx="http://www.garmin.com/xmlschemas/GpxExtensions/v3" xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1" creator="Oregon 400t" version="1.1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd http://www.garmin.com/xmlschemas/GpxExtensions/v3 http://www.garmin.com/xmlschemas/GpxExtensionsv3.xsd http://www.garmin.com/xmlschemas/TrackPointExtension/v1 http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd">\n';
            GPX_HEAD += '  <metadata>\n';
            GPX_HEAD += '    <time>' + new Date().toString() + '</time>\n';
            GPX_HEAD += '  </metadata>\n';
            GPX_HEAD += '  <trk>\n';
            GPX_HEAD += '    <name>' + filename + '</name>\n';
            GPX_HEAD += '    <trkseg>\n';

            var GPX_END = '    </trkseg>\n  </trk>\n</gpx>\n';

            // Create new / overwrite existing file
            fs.writeFileSync(filename, GPX_HEAD);
            var latCol = fn.getColumn('gps.latitude');
            var lonCol = fn.getColumn('gps.longitude');
            var altCol = fn.getColumn('gps.altitude');
            var hdopCol = fn.getColumn('gps.hdop');
            var tCol = fn.getColumn('timestamp');
            for (var i = 0; i < latCol.length; i++) {
                var lat = latCol[i];
                var lon = lonCol[i];
                var alt = altCol[i];
                var hdop = hdopCol[i];
                var t = tCol[i];
                if (lat !== 0 && lon !== 0) {
                    var data = '';
                    data += '    <trkpt lat="' + lat + '"  lon="' + lon + '">\n';
                    data += '      <ele>' + alt + '</ele>\n';
                    data += '      <time>' + new Date(t).toISOString() + '</time>\n';
                    data += '      <hdop>' + hdop + '</hdop>\n';
                    data += '    </trkpt>\n';
                    fs.appendFileSync(filename, data);
                }
            }
            fs.appendFileSync(filename, GPX_END);
        },
        exportJSON: function(filename) {
            var tblObj = fn.toObject();
            fs.writeFileSync(filename, JSON.stringify(tblObj));
        },
        exportARFF: function(filename) {

            //
            // Print comments and header
            //
            fs.writeFileSync(filename, '% ' + JSON.stringify(info));
            fs.appendFileSync(filename, '\n\n');
            fs.appendFileSync(filename, '@relation sailboat');
            var tsHeader = -1;
            headers.forEach((header, i) => {
                var output = '\n@attribute ' + header + ' numeric';
                if (header === 'timestamp') {
                    output = '\n@attribute ' + header + ' date \'yyyy-MM-dd HH:mm:ss.SSS\'';
                    tsHeader = i;
                }
                fs.appendFileSync(filename, output);
            });

            //
            // Print rows
            //
            fs.appendFileSync(filename, '\n\n@data');
            rows.forEach((row) => {
                var outputValues = [];
                row.forEach((value, i) => {
                    if (i === tsHeader) {
                        outputValues.push('"' + arffDate(value) + '"');
                    } else {
                        outputValues.push(value.toString());
                    }
                });
                fs.appendFileSync(filename, '\n' + outputValues.join(','));
            });

        },
        importTable: function(filename) {
            var json = fs.readFileSync(filename, 'utf8');
            return createTableFromObject(JSON.parse(json));
        }
    };

    /**
     * Return the date as a string that is arff friendly, i.e. yyyy-MM-dd HH:mm:ss.SSS
     * @param  {number} ms Valid date/time in milliseconds
     * @return {string}    The date string.
     */
    function arffDate(ms) {
        var d = new Date(ms);
        var dStr = '';
        dStr += d.getFullYear();
        dStr += '-' + padZero(d.getMonth() + 1, 2);
        dStr += '-' + padZero(d.getDate(), 2);
        dStr += ' ' + padZero(d.getHours(), 2);
        dStr += ':' + padZero(d.getMinutes(), 2);
        dStr += ':' + padZero(d.getSeconds(), 2);
        dStr += '.' + padZero(d.getMilliseconds(), 3);
        return dStr;

        function padZero(n, width) {
            var z = '0';
            n = n + '';
            return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
        }
    }

    function createTableFromObject(obj) {
        var table = new Table(obj.headers);
        table.info = obj.info;
        table.notes = obj.notes;
        obj.rows.forEach((row) => {
            table.addRow(row);
        });
        return table;
    }

    function createObjectFromRow(row, rowId) {
        var obj = {};
        headers.forEach((name, i) => {
            var levels = name.split(PATH_SEP);
            var nestedObj = obj;
            levels.forEach((levelName, l) => {
                if (levels.length - 1 === l) {
                    nestedObj[levelName] = row[i];
                } else {
                    if (typeof nestedObj[levelName] === 'undefined') nestedObj[levelName] = {};
                    nestedObj = nestedObj[levelName];
                }
            });
        });

        // Add any notes we have
        if (notes.hasOwnProperty(rowId)) {
            obj.note = notes[rowId];
        }

        return obj;
    }


    function repositionNotes(startRow, endRow) {
        for (var rowId in notes) {
            if (rowId >= startRow) {
                if (rowId <= endRow) {

                    // The row is deleted - delete the note too
                    delete notes[rowId];

                } else {

                    // The row is moved - move the note too
                    var diff = endRow - startRow + 1;
                    var newRowId = rowId - diff;
                    notes[newRowId] = notes[rowId];     // create new
                    delete notes[rowId];                // ... and delete the old

                }
            }
        }
    }

    function createRowFromObject(obj) {
        var row = new Float64Array(headers.length);

        // Check if we already get the object in array format {'0':1.01, '1':-1.2}.  This happens
        // when the object is loaded from JSON file.
        if (typeof obj['0'] === 'undefined') {
            obj = flattenObject(obj);

            for (var o in obj) {
                var h = headers.indexOf(o);
                if (h >= 0 && !isNaN(obj[o])) {
                    row[h] = obj[o];
                }

            }
        } else {
            for (var i in obj) {
                var ii = parseInt(i);
                if (ii >= 0 && !isNaN(obj[i])) {
                    row[ii] = obj[i];
                }
            }
        }

        return row;
    }

    var flattenObject = function(obj) {
        var result = {};

        for (var i in obj) {

            if (obj.hasOwnProperty(i)) {
                if (typeof obj[i] === 'object') {
                    var flatObject = flattenObject(obj[i]);
                    for (var x in flatObject) {
                        if (flatObject.hasOwnProperty(x)) {
                            result[i + PATH_SEP + x] = flatObject[x];
                        }
                    }
                } else {
                    result[i] = obj[i];
                }
            }
        }
        return result;
    };

    return fn;
}

module.exports = Table;
