var express = require('express');
var router = express.Router();

router.get('/', index);
router.post('/register', test);

function index(req, res, next) {
    res.render('register', {
            title: 'pm2.5 cloud platform',
        }

    )
}

function test(req, res, next) {
    console.log(req.body.uname);
    res.send("get" + req.body.uname + " " + req.body.upwd);
}

module.exports = router;