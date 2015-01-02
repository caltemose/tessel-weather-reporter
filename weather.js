var tessel = require('tessel');
var climatelib = require('climate-si7005');
var climate = climatelib.use(tessel.port['A']);
var http = require('http');

var readClimate = function () {
  var unit = 'f';
    
  var o = {};
  
  climate.readTemperature(unit, function (err, temp) {
    if (err) {
      console.log('TESSEL TEMP ERROR');
      console.log(err);
      return;
    }

    var handicapF = 9.5; // subtract from reading b/c of heated climate module
    
    o.temp = {
      f: temp.toFixed(2)
    };

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
  });

};

var report = function (o) {
  console.log(o, "\n");
  setTimeout(readClimate, 15*1000);
};

climate.on('ready', readClimate);