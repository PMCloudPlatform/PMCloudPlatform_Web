var express = require('express');
var router = express.Router();

router.get('/', login);

router.get('/login', test);

function login(req, res, next) {
    res.render('login', {
            title: 'pm2.5 cloud platform',
            message: 'test'
        }

    )
}

function test(req, res, next) {
    res.send("123");
}

module.exports = router;