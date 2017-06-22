var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// session
var session = require('express-session')
var MongoStore = require('connect-mongo')(session);

var http = require('http');
var db = require('./mongoDB')
var NN = require('./dataProcess');

/**
 * Get port from environment and store in Express.
 */
var port = normalizePort(process.env.PORT || '80');

var app = express();
/**
 * Create HTTP server.
 */
var server = http.createServer(app);
/**
 * Create socket.io server.
 */
var io = require('socket.io')(server);

// session
var sessionStorage = new MongoStore({ url: 'mongodb://127.0.0.1:27017/pm' });
var sessionMiddleware = session({
    // secret is like private key
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
    store: sessionStorage
});

var roomCount = {};

app.set('port', port);
//run nn
NN.init();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// test
// app.use(function(req, res, next) {
//     console.log(req.cookies);
//     next();
// });
app.use(function(req, res, next) {
    req.io = {
        room: roomCount
    };
    next();
});

//io-session
io.use(function(socket, next) {
    // console.log(socket.handshake.query.sid);

    // console.log(sessionStorage.getItem(socket.handshake.query.sid));
    sessionStorage.get(socket.handshake.query.sessionID, function(err, session) {
        if (err) {
            console.log("Err:" + err);
            socket.request.session = {};
            next();
        } else {
            console.log("get session");
            if (session) {
                socket.request.session = session;
                next();
            } else {
                console.log("Err:" + "No session");
                socket.request.session = {};
                next();
            }
        }
    });
    // socket.request.session = sessionStorage.getItem(socket.handshake.query.sid);
    // sessionMiddleware(socket.request, socket.request.res, next);
});
// session
app.use(sessionMiddleware);

app.use(express.static(path.join(__dirname, 'public')));

var routes = require('./routes/index')(app);
var users = require('./routes/users');



// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

/**
 * Bind connection event.
 */

io.on('connection', function(socket) {
    console.log('a user connected');
    if (!socket.request.session.username) {
        // socket.emit('nosession');
        //专门为地图设置
        socket.on('requireData', function(index) {
            console.log('requiring data~~~');
            var Data = [];
            var speed = 5;
            db.findData({}, index * speed, speed, function(err, result) {
                // console.log(result);
                // console.log(err);
                if (result == undefined) {
                    console.log('Error');
                } else if (result.length == 0) {
                    console.log('Load finished');
                } else {
                    for (var i = 0; i < result.length; i++) {
                        var e = result[i];
                        if (e.longtitude != undefined && e.latitude != undefined && e.pmdata != undefined && e.timestamp != undefined) {
                            // console.log(e.longtitude);
                            Data.push({
                                "type": "Feature",
                                "geometry": {
                                    "type": "Point",
                                    "coordinates": [e.longtitude + Math.random() * 0.0001, e.latitude + Math.random() * 0.0001]
                                },
                                "properties": {
                                    "size": e.pmdata,
                                    "description": `<strong>环境数据 from ${e.username}</strong><p>经度:` + e.longtitude.toString() + '</p>\
                                        <p>纬度:' + e.latitude.toString() + '</p>\
                                        <p>time:' + Date(e.timestamp).toString() + '</p>\
                                        <p>PM2.5:' + e.pmdata.toString() + '</p>\
                                        <p>湿度:' + e.humiditydata.toString() + '</p>\
                                        <p>温度:' + e.temporarydata.toString() + '</p>\
                                        <p>光照:' + e.lightdata.toString() + '</p>'
                                }
                            })
                        }
                    }
                    // console.log(Data);
                    // socket.emit("test");
                    socket.emit('dataArrive', Data);
                }
            });
        });
    } else {
        console.log(socket.request.session.username + "Get into the Server");
        socket.emit("hassession");
        // test

        socket.emit("alarm", {
            humiditydata: "4091",
            temporarydata: "4092",
            pmdata: "4093",
            lightdata: "4094",
            timestamp: "4095",
            longtitude: "4096",
            latitude: "4097"
        });

        // test
        socket.join(socket.request.session.username);
        if (roomCount[socket.request.session.username]) {
            roomCount[socket.request.session.username] += 1;
        } else {
            roomCount[socket.request.session.username] = 1;
        }
        socket.on('senddata', function(json) {
            console.log('receive data...');
            // console.log(jsonString);
            try {
                console.log(JSON.stringify(json));
                data = json;
                data.username = socket.request.session.username;
                // console.log(data);
                if (data.humiditydata != undefined && data.temporarydata != undefined && data.pmdata != undefined && data.lightdata != undefined && data.timestamp != undefined && data.longtitude != undefined && data.latitude != undefined) {
                    db.insert(data, "data");
                } else {
                    console.log("receive error data!");
                }
            } catch (err) {
                console.log(err);
            }
        });

        socket.on('notify', function(data) {
            console.log("Notify event!");
            if (data.type == 1) {
                socket.to(socket.request.session.username).emit('alarm', data.data);
            } else if (data.type == 2) {
                socket.to(socket.request.session.username).emit('popData', data);
            }
        });

        socket.on('getpm', function() {
            console.log("Getpm event!");
            socket.to(socket.request.session.username).emit('getpm');
        });

        socket.on('setpm', function(data) {
            console.log("Setpm event!" + JSON.stringify(data));
            socket.to(socket.request.session.username).emit('setpm', data);
            // test
            // socket.to(socket.request.session.username).emit('setpm', {
            //     humiditydata: "4091",
            //     temporarydata: "4092",
            //     pmdata: "4093",
            //     lightdata: "4094",
            //     timestamp: "4095",
            //     longtitude: "4096",
            //     latitude: "4097"
            // });
        });

        socket.on("thres", function(data) {
            console.log(data);
            socket.to(socket.request.session.username).emit('thres', {
                threshold: Number(data)
            });
        });

        socket.on("clock", function(data) {
            console.log(data);
            socket.to(socket.request.session.username).emit('clock', data);
        });
    }

    socket.on('disconnect', function() {
        console.log('user disconnected');
    });
});

server.listen(port);


/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}


module.exports = server;