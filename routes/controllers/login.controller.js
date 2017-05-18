var express = require('express');
var router = express.Router();

router.get('/', login);

router.get('/login', test);

function login(req, res, next) {
    if (req.session.loginUser) {
        res.render('login', {
            title: 'pm2.5 cloud platform',
            message: 'test'
        })
    } else {
        res.send("Wrong!");
    }
}

function test(req, res, next) {
    res.send("123");
}

module.exports = router;