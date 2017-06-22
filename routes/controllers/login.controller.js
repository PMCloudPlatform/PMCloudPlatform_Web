var express = require('express');
var crypto = require('crypto');
var db = require('../../mongoDB');
var router = express.Router();

router.get('/', index);

router.post('/login', login);

function index(req, res, next) {
    if (!req.session.username) {
        res.render('login', {
            title: 'pm2.5 cloud platform'
        })
    } else {
        res.redirect('/');
    }
}

function login(req, res, next) {
    var user = {};
    console.log(req.body);
    user.username = req.body.username;
    user.password = sha1(req.body.password);
    db.find(user, 'user', function(err, result) {
        if (err) {
            console.log("Error:" + err);
            res.json({
                status: 0,
                msg: "Error:" + err
            });
            return;
        }
        if (result.length == 1) {
            req.session.username = user.username;
            res.json({
                status: 1,
                msg: "Successful!"
            });
            return;
        } else {
            res.json({
                status: 0,
                msg: "No such User"
            });
            return;
        }
    })
}

function sha1(content) {
    var md5 = crypto.createHash('sha1');
    md5.update(content);
    return md5.digest('hex');
}

module.exports = router;