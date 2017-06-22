var express = require('express');
var db = require('../../mongoDB');

var router = express.Router();

router.get('/', data);
router.get('/requireData', reData);

function data(req, res, next) {
    if (req.session.username) {
        res.render('data', { title: 'pm2.5 cloud platform' });
    } else {
        res.redirect('/login');
    }
}

function reData(req, res, next) {
    var Data = [];
    if (req.query.quantity == undefined) {
        res.send([]);
        return;
    }
    if (req.query.time == NaN) {
        res.send([]);
        return;
    }
    db.findData({ timestamp: { $gt: Number(req.query.time) } }, 0, Number(req.query.quantity), function(err, result) {
        console.log(result);
        if (result == undefined) {
            console.log('Error');
        } else if (result.length == 0) {
            console.log('Load finished');
        } else {
            result.forEach(function(e) {
                if (e.longtitude != undefined && e.latitude != undefined && e.pmdata != undefined && e.timestamp != undefined && e.humiditydata != undefined && e.temporarydata != undefined && e.lightdata != undefined) {
                    // console.log(e.longtitude);
                    Data.push({
                        "longtitude": e.longtitude,
                        "latitude": e.latitude,
                        "pmdata": e.pmdata,
                        "timestamp": e.timestamp,
                        "humiditydata": e.humiditydata,
                        "temporarydata": e.temporarydata,
                        "lightdata": e.lightdata
                    })
                }
            });
        }
        res.send(Data);
        return;
    });
}

module.exports = router;