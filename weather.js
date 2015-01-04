var tessel = require('tessel');
var climatelib = require('climate-si7005');
var climate = climatelib.use(tessel.port['A']);
var http = require('http');

var PREFS = {
    location: 'home-dining-table',
    timeout: 5*1000,
    host: '192.168.1.147',
    port: 3000,
    path: '/api/weather'
}

var readClimate = function () {
    console.log('readClimate()');
    var o = {};
  
    // get celsius temperature
    climate.readTemperature(function (err, tempC) {
        if (err) {
            console.log('TESSEL TEMP C ERROR');
            console.log(err);
            return;
        }
    
        o.temp = {
            c: tempC
        };

        // get fahrenheit temperature (lazy, yes)
        climate.readTemperature('f', function (err, tempF) {
            if (err) {
                console.log('TESSEL TEMP F ERROR');
                console.log(err);
                return;
            }

            o.temp.f = tempF;

            // get humidity
            climate.readHumidity(function (err, humid) {
                if (err) {
                    console.log('TESSEL HUMID ERROR');
                    console.log(err);
                    return;
                }

                o.humid = humid;

                o.location = PREFS.location;
                o.date = new Date();
                saveToDb(o);
            });
        })
    });
};

var saveToDb = function (o) {
    // stringify data
    var postDataString = JSON.stringify(o);

    var headers = {
        'Content-Type': 'application/json',
        'Content-Length': postDataString.length
    };

    var options = {
        method : 'POST',
        host : PREFS.host,
        port : PREFS.port,
        path : PREFS.path,
        headers: headers
    };

    // define POST request
    var request = http.request(options, function (res) {
        res.setEncoding('utf-8');
        var responseString = ''; 
        
        res.on('data', function (data) {
            responseString += data;
        });

        res.on('end', function () {
            console.log('data written to:', options.path, JSON.parse(responseString));
            reset();
        });
    });

    request.on('error', function (err) {
        console.log(err);
        reset();
    });

    console.log('write');
    // send POST request 
    request.write(postDataString);
    request.end();
};

var reset = function () {
    setTimeout(readClimate, PREFS.timeout);
};

climate.on('ready', readClimate);