var express = require('express');
var router = express.Router();

router.get('/', index);
router.get('/register', test);

function index(req, res, next) {
    res.render('register', {
            title: 'pm2.5 cloud platform',
        }

    )
}

function test(req, res, next) {
    res.send("456");
}

module.exports = router;