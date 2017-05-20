var express = require('express');
var crypto = require('crypto');
var db = require('../../mongoDB');
var router = express.Router();

router.get('/', main);
router.post('/register', register);

function main(req, res, next) {
    var session = req.session;
    if (!session.username) {
        res.render('register', {
            title: 'pm2.5 cloud platform',
        });
    } else {
        res.redirect('/');
    }

}

function register(req, res, next) {
    console.log(req.body.uname);
    var info = {};
    info.username = req.body.uname;
    info.password = sha1(req.body.upwd);
    db.find({ username: info["username"] }, 'user', function(err, result) {
            if (err) {
                console.log("Error:" + err);
                res.json({
                    status: 0,
                    msg: "Error:" + err
                });
                return;
            }
            if (result.length == 0) {
                db.insert(info, 'user');
                res.json({
                    status: 1,
                    msg: "Successful!"
                });
            } else {
                console.log("the existed user are: " + JSON.stringify(result));
                res.json({
                    status: 0,
                    msg: "User already exists!"
                });
                return;
            }
        })
        // res.send("get" + req.body.uname + " " + req.body.upwd);
}

function sha1(content) {
    var md5 = crypto.createHash('sha1');
    md5.update(content);
    return md5.digest('hex');
}

module.exports = router;