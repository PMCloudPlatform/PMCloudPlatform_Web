var express = require('express');
var router = express.Router();

router.get('/', map);

function map(req, res, next) {
    if (req.session.username) {
        res.render('map', {
            title: 'pm2.5 cloud platform',
        });
    } else {
        res.redirect('/login');
    }
}

module.exports = router;