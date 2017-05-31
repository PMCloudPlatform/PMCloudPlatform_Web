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
        socket.emit('nosession');
        //专门为地图设置
        socket.on('requireData', function(index) {
            console.log('requiring data~~~');
            var Data = [];
            var speed = 50;
            db.findData({}, index * speed, speed, function(err, result) {
                // console.log(result);
                // console.log(index);
                if (result == undefined) {
                    console.log('Error');
                } else if (result.length == 0) {
                    console.log('Load finished');
                } else {
                    result.forEach(function(e) {
                            if (e.LOT != undefined && e.LAT != undefined && e.PM != undefined && e.TIME != undefined) {
                                // console.log(e.LOT);
                                Data.push({
                                    "type": "Feature",
                                    "geometry": {
                                        "type": "Point",
                                        "coordinates": [e.LOT + Math.random() * 0.0001, e.LAT + Math.random() * 0.0001]
                                    },
                                    "properties": {
                                        "size": e.PM,
                                        "description": '<strong>PM2.5</strong><p>LOT:' + e.LOT.toString() + '</p><p>LAT:' + e.LAT.toString() + '</p><p>time:' + Date(e.TIME).toString() + '</p><p>PM2.5:' + e.PM.toString() + '</p>'
                                    }
                                })
                            }
                        })
                        // console.log(Data);
                    socket.emit('dataArrive', JSON.stringify(Data));
                }
            });
        })
    } else {
        console.log(socket.request.session.username + "Get into the Server");
        socket.emit("hassession");
        socket.join(socket.request.session.username);
        socket.on('senddata', function(json) {
            console.log('receive data...');
            // console.log(jsonString);
            try {
                data = json;
                data.username = socket.request.session.username;
                // console.log(data);
                if (data.LOT != undefined && data.LAT != undefined && data.PM != undefined && data.TIME != undefined) {
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
                socket.to(socket.request.session.username).emit('alarm');
            } else if (data.type == 2) {
                socket.to(socket.request.session.username).emit('popData', data);
            }
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