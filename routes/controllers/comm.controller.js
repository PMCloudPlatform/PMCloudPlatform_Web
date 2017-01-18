var express = require('express');
var pred = require('../../predProcess');
var router = express.Router();

router.get('/', comm);
router.get('/getPredict', runPredict);

function comm(req, res, next) {
  res.render('comm', {title:'pm2.5 cloud platform'})
}

function runPredict(req, res, next) {
  if (req.query.lot == undefined) {
        res.send("没有输入经度");
        return;
  }
  if (req.query.lat == undefined) {
        res.send("没有输入纬度");
        return;
  }
  if (req.query.time == undefined) {
        res.send("没有输入时间");
        return;
  }
  pred.runPrediction(Number(req.query.lot), Number(req.query.lat), Number(req.query.time), function(err, data){
    if(data == 1){
      res.send("非常好");
    }
    else if(data == 2){
      res.send("很好");
    }
    else if(data == 3){
      res.send("好");
    }
    else if(data == 4){
      res.send("一般");
    }
    else if(data == 5){
      res.send("差");
    }
    else if(data == 6){
      res.send("很差");
    }
    else{
      res.send("爆表了！");
    }
  });

}

module.exports = router;
