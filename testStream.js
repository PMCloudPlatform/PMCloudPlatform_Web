var fs = require('fs');
var ws = fs.createWriteStream('PointGeoJSON.js');

ws.write('beep ');

setTimeout(function () {
    ws.end('boop\n');
}, 1000);