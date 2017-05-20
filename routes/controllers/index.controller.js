var express = require('express');
var router = express.Router();

router.get('/', index);

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

module.exports = router;