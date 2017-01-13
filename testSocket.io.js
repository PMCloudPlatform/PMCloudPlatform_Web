var io = require('socket.io-client');

var socket = io.connect('http://133.130.116.215:3000/');

socket.on('complete', function(){
	console.log('over');
})

for (var i = 0; i < 1; i++) {
	data = {
		user:"test",
		PM:Math.random()*3600,
		TIME:(new Date().getTime()),
		LOT:121.4339081+Math.random()-0.5,
		LAT:31.0276681+Math.random()-0.5
	}
	socket.emit('senddata', JSON.stringify(data));
}

