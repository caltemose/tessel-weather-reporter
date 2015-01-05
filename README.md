# Tessel Weather Reporter

Tessel Weather Reporter is a Tessel Node.js app for reporting module data to the Tessel Data Server. Currently supports climate module only.

Climate data (temp f, temp c, humidity) is sent via POST as JSON to an endpoint which saves the data to MongoDB. The endpoint and interval timing can be set in the beginning of the file weather.js.

The app init function is triggered by the Tessel wifi 'connect' event to keep it from firing too early on Tessel startup.

The app uses the tessel-led npm to simplify displaying status via the Tessel's LEDs.


