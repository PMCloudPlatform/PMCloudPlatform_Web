var io = require('socket.io-client');
var socket = io('http://45.63.50.188/?sessionID=kfr8IGHVTcjmep0Oo3lfRTORzt1_xAe4');
// var socket = io('http://127.0.0.1/');

// console.log(socket);

socket.on('complete', function() {
    console.log('over');
})

socket.on('nosession', function() {
    socket.close();
})

socket.on('hassession', function() {
    console.log('Connected!');
    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', () => {
        var chunk = process.stdin.read();
        if (chunk !== null) {
            process.stdout.write(chunk);
            socket.emit('notify', {
                type: 1,
                data: {
                    test: "test409123"
                }
            });
        }
    });

    process.stdin.on('end', () => {
        process.stdout.write('end');
    });
});



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