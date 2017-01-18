var express = require('express');
var pred = require('../../predProcess');
var router = express.Router();
var resultflag = 0;
var result;

router.get('/', comm);
router.get('/getPredict', runPredict);
router.get('/getResult', getResult);

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
  else{
      pred.runPrediction(Number(req.query.lot), Number(req.query.lat), Number(req.query.time), setResult(err, data));
  }
}

function setResult(err, data){
    if(data == 1){
      result = "非常好";
    }
    else if(data == 2){
      result = "很好";
    }
    else if(data == 3){
      result = "好";
    }
    else if(data == 4){
      result = "一般";
    }
    else if(data == 5){
      result = "差";
    }
    else if(data == 6){
      result = "很差";
    }
    else{
      result = "爆表了！";
    }
    resultflag = 1;
    res.send("请稍等...");
}

void getResult(req, res, next){
  if(resultflag == 0)
    res.send("请稍等...");
  else{
    res.send(result);
  }
}

module.exports = router;
