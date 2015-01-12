var tessel = require('tessel');
var led = require('tessel-led');
var wifi = require('wifi-cc3000');

var reset = function () {
    led.green.show();
    wifi.reset(function onWifiReset(res) {
        console.log(res);
        led.green.hide();
    });
}

console.log('resetting wifi...');
reset();
