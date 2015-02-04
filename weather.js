// config
var PREFS = {
    location: 'home-top-porch',
    timeout: 60*1000,
    host: '192.168.2.1',// '10.11.40.45',// 71 '192.168.1.115',
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
var id; // setInterval reference


var readClimate = function () {
    console.log('reading climate...');
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
            console.log('request results done.')
            led.green.flash(1, 500);
            reset();
        });
    });

    request.on('error', function (err) {
        led.red.show();
        console.log('request error', err);
        resetWifi();
    });

    console.log('sending request...');
    // send POST request + flash blue LED
    led.blue.flash(1, 250);
    request.write(postDataString);

    request.end();
};

var resetWifi = function () {
    console.log('resetWifi()...');
    led.green.show();
    wifi.reset(function onWifiReset() {
        led.green.hide();
        console.log('wifi reset.');
        reset();
    });
};

var reset = function () {
    console.log('reset() climate lookup');
    resetTimeout();
    id = setTimeout(readClimate, PREFS.timeout);
};

var resetTimeout = function () {
    if (id) {
        console.log('clearing timeout');
        clearTimeout(id);
        id = null;
    }
};

var resetLEDs = function () {
    led.blue.hide();
    led.green.hide();
    led.red.hide();
};

wifi.on('connect', function (data) {
    console.log('wifi connected');
    readClimate();
});
