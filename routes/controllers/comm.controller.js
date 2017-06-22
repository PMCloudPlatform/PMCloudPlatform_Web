var express = require('express');
var pred = require('../../predProcess');
var router = express.Router();
var resultflag = 0;
var result;

router.get('/', comm);
router.get('/getPredict', runPredict);
router.get('/getResult', getResult);

function comm(req, res, next) {
    if (req.session.username) {
        res.render('comm', { title: 'pm2.5 cloud platform' });
    } else {
        res.redirect('/login');
    }
};

function runPredict(req, res, next) {
    pred.runPrediction(Number(req.query.lot), Number(req.query.lat), Number(req.query.time), setResult);
    res.send("请稍等...");
};

function setResult(err, data) {
    if (data == 1) {
        result = "非常好";
    } else if (data == 2) {
        result = "很好";
    } else if (data == 3) {
        result = "好";
    } else if (data == 4) {
        result = "一般";
    } else if (data == 5) {
        result = "差";
    } else if (data == 6) {
        result = "很差";
    } else {
        result = "爆表了！";
    }
    resultflag = 1;
};

function getResult(req, res, next) {
    if (resultflag == 0)
        res.send("1");
    else {
        res.send(result);
        resultflag = 0;
    }
};

module.exports = router;