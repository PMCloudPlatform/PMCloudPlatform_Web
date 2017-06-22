var db = require('./mongoDB');
var fs = require('fs');
var cp = require('child_process');
var pred = require('./predProcess');
var allCount = 0;
var dataInterval = 100;
var dataSetFile = 'data.csv';
var trainFile = "python train.py";
var loopTaskNum = 0;

var NNpredictor = {};

NNpredictor.init = function() {
    var begin = setInterval(function() {
        if (db.getAllCount != undefined) {
            clearInterval(begin);
            db.getAllCount(function(result) {
                if (result.length != 0) allCount = result[result.length - 1].COUNT;
                NNpredictor.loopTask();
            });
        }
    }, 1000);
};


// fs.exists("weight.txt",function(exists){
//   if(exists){
//      //run the NN predictor
//   }
// });

NNpredictor.loopTask = function() {
    loopTaskNum = setInterval(function() {
        console.log(1);
        db.checkStatus(function(stats) {
            if (stats.count >= allCount + dataInterval) {
                clearInterval(loopTaskNum);
                createDataSet();
                allCount += dataInterval;
                db.setAllCount(allCount);
            } else {
                console.log("the number of element is:" + stats.count);
            }
        });
    }, 60 * 1000);
};


function createDataSet() {
    db.findData({}, allCount, dataInterval, function(err, result) {
        // console.log(result);
        // console.log(index);
        if (result == undefined) {
            console.log('Error while read data from db');
        } else {
            writerStream = fs.createWriteStream(dataSetFile);
            writerStream.on('finish', function() {
                console.log("写入完成");
            });
            writerStream.on('error', function(err) {
                console.log(err.stack);
            });
            result.forEach(function(e) {
                if (e.humiditydata != undefined && e.temporarydata != undefined && e.pmdata != undefined && e.lightdata != undefined && e.timestamp != undefined && e.longtitude != undefined && e.latitude != undefined) {
                    data = [];
                    // console.log(e.timestamp);
                    pmDate = new Date(e.timestamp);
                    // console.log(pmDate);
                    data[0] = pmDate.getHours() / 24;
                    data[1] = 0;
                    for (i = 0; i < pmDate.getMonth(); i++) {
                        data[1] += (new Date(pmDate.getFullYear(), i, 0)).getDate();
                    }
                    data[1] += pmDate.getDate();
                    data[1] = data[1] / 365;
                    data[2] = e.longtitude;
                    data[2] = data[2] / 180
                    data[3] = e.latitude;
                    data[3] = data[3] / 360;
                    data[4] = e.humiditydata;
                    data[4] = data[4] / 100;
                    data[5] = e.temporarydata;
                    data[5] = data[5] / 100;
                    data[6] = e.lightdata;
                    data[6] = data[6] / 1000;
                    if (e.pmdata >= 0 && e.pmdata < 35) {
                        data[7] = 1;
                        data[8] = 0;
                        data[9] = 0;
                        data[10] = 0;
                        data[11] = 0;
                        data[12] = 0;
                        data[13] = 0;
                        data[14] = 0;
                    } else if (e.pmdata >= 35 && e.pmdata < 75) {
                        data[7] = 0;
                        data[8] = 1;
                        data[9] = 0;
                        data[10] = 0;
                        data[11] = 0;
                        data[12] = 0;
                        data[13] = 0;
                        data[14] = 0;
                    } else if (e.pmdata >= 75 && e.pmdata < 115) {
                        data[7] = 0;
                        data[8] = 0;
                        data[9] = 1;
                        data[10] = 0;
                        data[11] = 0;
                        data[12] = 0;
                        data[13] = 0;
                        data[14] = 0;
                    } else if (e.pmdata >= 115 && e.pmdata < 150) {
                        data[7] = 0;
                        data[8] = 0;
                        data[9] = 0;
                        data[10] = 1;
                        data[11] = 0;
                        data[12] = 0;
                        data[13] = 0;
                        data[14] = 0;
                    } else if (e.pmdata >= 150 && e.pmdata < 250) {
                        data[7] = 0;
                        data[8] = 0;
                        data[9] = 0;
                        data[10] = 0;
                        data[11] = 1;
                        data[12] = 0;
                        data[13] = 0;
                        data[14] = 0;
                    } else if (e.pmdata >= 250 && e.pmdata < 350) {
                        data[7] = 0;
                        data[8] = 0;
                        data[9] = 0;
                        data[10] = 0;
                        data[11] = 0;
                        data[12] = 1;
                        data[13] = 0;
                        data[14] = 0;
                    } else if (e.pmdata >= 350 && e.pmdata < 500) {
                        data[7] = 0;
                        data[8] = 0;
                        data[9] = 0;
                        data[10] = 0;
                        data[11] = 0;
                        data[12] = 0;
                        data[13] = 1;
                        data[14] = 0;
                    } else {
                        data[7] = 0;
                        data[8] = 0;
                        data[9] = 0;
                        data[10] = 0;
                        data[11] = 0;
                        data[12] = 0;
                        data[13] = 0;
                        data[14] = 1;
                    }
                    writerStream.write(data.join(",") + '\n', "UTF-8");
                }
            });
            writerStream.end();
            console.log("execute end...");
            if (pred.lock == true) {
                var begin = setInterval(function() {
                    if (pred.lock == false) {
                        clearInterval(begin);
                        runTrainExec()
                    }
                }, 1000);
            } else {
                runTrainExec()
            }
        }
    });
}

function runTrainExec() {
    pred.lock = true;
    console.log("train begin");
    // run the NN trainer
    child = cp.exec(trainFile, function(err, stdout, stderr) {
        pred.lock = false;
        console.log("train end");
        NNpredictor.loopTask();
    });
    //run the NN predictor when training is over
}

module.exports = NNpredictor;