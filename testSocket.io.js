var io = require('socket.io-client');
var socket = io('http://127.0.0.1/?sessionID=3RyZ4y3XjcsgHKxKCzymgCYMizMReSrO');
// var socket = io('http://127.0.0.1/');

// console.log(socket);

socket.on('complete', function() {
    console.log('over');
})

socket.on('nosession', function() {
    socket.close();
})




// for (var i = 0; i < 100; i++) {
//     data = {
//         user: "test",
//         PM: Math.random() * 3600,
//         TIME: (new Date().getTime()),
//         LOT: 121.4339081 + Math.random() - 0.5,
//         LAT: 31.0276681 + Math.random() - 0.5
//     }
//     socket.emit('senddata', JSON.stringify(data));
// }