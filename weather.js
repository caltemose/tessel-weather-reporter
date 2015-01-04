var PREFS = {
    location: 'home-dining-table',
    timeout: 5*1000,
    host: '192.168.1.147',
    port: 3000,
    path: '/api/weather'
};

// dependencies
var tessel = require('tessel');
var climatelib = require('climate-si7005');
var climate = climatelib.use(tessel.port['A']);
var http = require('http');
var led = require('tessel-led');
var wifi = require('wifi-cc3000');


var readClimate = function () {
    resetLEDs();
    
    var o = {};
  
    // get celsius temperature
    climate.readTemperature(function (err, tempC) {
        led.green.hide();

        if (err) {
            console.log('TESSEL TEMP C ERROR');
            console.log(err);
            led.red.show();
            return;
        }
    
        o.temp = {
            c: tempC
        };

        // get fahrenheit temperature (lazy, yes)
        climate.readTemperature('f', function (err, tempF) {
            led.green.hide();

            if (err) {
                console.log('TESSEL TEMP F ERROR');
                console.log(err);
                led.red.show();
                return;
            }

            o.temp.f = tempF;

            // get humidity
            climate.readHumidity(function (err, humid) {
                led.green.hide();

                if (err) {
                    console.log('TESSEL HUMID ERROR');
                    console.log(err);
                    led.red.show();
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
            led.green.flash(1, 500);
            reset();
        });
    });

    request.on('error', function (err) {
        led.red.show();
        console.log('request error', err);
        reset();
    });

    // send POST request + flash blue LED
    led.blue.flash(1, 250);
    request.write(postDataString);

    request.end();
};

var reset = function () {
    setTimeout(readClimate, PREFS.timeout);
};

var resetLEDs = function () {
    led.amber.hide();
    led.blue.hide();
    led.green.hide();
    led.red.hide();
};

// climate.on('ready', readClimate);

wifi.on('connect', function (data) {
    readClimate();
});
