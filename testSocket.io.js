var io = require('socket.io-client');

var socket = io.connect('http://133.130.116.215:3000/');

socket.on('complete', function(){
	console.log('over');
})

data = {
	user:"",
	PM:123.4,
	time:1234123,
	GPS:{x:1,y:2,z:3}
}

socket.emit('senddata', JSON.stringify(data));


