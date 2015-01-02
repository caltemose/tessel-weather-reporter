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

        var handicapF = 9.5; // subtract from reading b/c of heated climate module
    
        o.temp = {
            c: tempC.toFixed(2)
        };

        // get fahrenheit temperature (lazy, yes)
        climate.readTemperature('f', function (err, tempF) {
            if (err) {
                console.log('TESSEL TEMP F ERROR');
                console.log(err);
                return;
            }

            o.temp.f = tempF.toFixed(2);

            // get humidity
            climate.readHumidity(function (err, humid) {
                if (err) {
                    console.log('TESSEL HUMID ERROR');
                    console.log(err);
                    return;
                }

                o.humid = humid.toFixed(2);

                o.date = new Date();
                report(o);
            });
        })
    });
};

var report = function (o) {
    //console.log(o, "\n");
    saveToDb(o);
    setTimeout(readClimate, 15*1000);
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
        host : '192.168.1.149',
        port : '3000',
        path : '/api/weather',
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
            console.log('data written to:', options.path, JSON.parse(responseString));
        });
    });

    // send POST request 
    request.write(postDataString);
    request.end();
};


climate.on('ready', readClimate);



