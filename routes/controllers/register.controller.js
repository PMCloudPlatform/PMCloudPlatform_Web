var express = require('express');
var crypto = require('crypto');
var db = require('../../mongoDB');
var router = express.Router();

router.get('/', main);
router.post('/register', register);

function main(req, res, next) {
    res.render('register', {
            title: 'pm2.5 cloud platform',
        }

    )
}

function register(req, res, next) {
    console.log(req.body.uname);
    var info = {};
    info["username"] = req.body.uname;
    info["password"] = sha1(req.body.upwd);

    db.find({ username: info["username"] }, 'user', function(err, result) {
            if (err) {
                console.log("Error:" + err);
                res.send("Wrong!");
                return;
            }
            if (result.length == 0) {
                db.insert(info, 'user');


                req.session.regenerate(function(err) {
                    if (err) {
                        console.log("Error:" + err);
                        res.send("Wrong!");
                        return;
                    }
                    req.session.loginUser = req.body.uname;
                    res.send("Success!");
                });

            } else {
                console.log("the existed user are: " + JSON.stringify(result));
                res.send("Already exists!");
                return;
            }

        })
        // db.insert(info, "user");
    return;
    // res.send("get" + req.body.uname + " " + req.body.upwd);
}

function sha1(content) {
    var md5 = crypto.createHash('sha1');
    md5.update(content);
    return md5.digest('hex');
}

module.exports = router;