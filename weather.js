var prefs = {
    decimalPlaces: 2,
    timeout: 5 * 1000,
    host: '192.168.1.149',
    port: 3000,
    path: '/api/weather'
}


var tessel = require('tessel');
var climatelib = require('climate-si7005');
var climate = climatelib.use(tessel.port['A']);
var http = require('http');

var readClimate = function () {
    
    var o = {};
  
    // get celsius temperature
    climate.readTemperature(function (err, tempC) {
        if (err) {
            console.log('TESSEL TEMP C ERROR');
            console.log(err);
            return;
        }
    
        o.temp = {};
        o.temp.c = tempC;
        
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

                o.date = new Date();
                report(o);
            });
        })
    });
};

var report = function (o) {
    saveToDb(o);
    setTimeout(readClimate, prefs.timeout);
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
        host : prefs.host,
        port : prefs.port,
        path : prefs.path,
        headers: headers
    };

    // define POST request
    var request = http.request(options, function(res) {
        res.setEncoding('utf-8');
        var responseString = ''; 
        
        res.on('data', function(data) {
            responseString += data;
        });

        res.on('end', function() {
            console.log('data saved at:', o.date);
        });
    });

    // send POST request 
    request.write(postDataString);
    request.end();
};


climate.on('ready', readClimate);



