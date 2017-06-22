var express = require('express');
var router = express.Router();

router.get('/', index);

router.get('/home', homepage);

function index(req, res, next) {
    var session = req.session;
    if (!session.username) {
        res.redirect('/login');
        return;
    } else {
        res.render('index', {
            title: 'pm2.5 cloud platform',
        })
    }
}

function homepage(req, res, next) {
    var session = req.session;
    if (!session.username) {
        res.redirect('/login');
        return;
    } else {
        if (req.io.room) {
            online = req.io.room[session.username];
        } else {
            online = 0;
        }
        res.render('home', {
            title: 'pm2.5 cloud platform',
            username: session.username,
            onlineDevice: online
        })
    }
}

module.exports = router;