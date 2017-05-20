var db = require('./mongoDB');
var fs = require('fs');
var cp = require('child_process');
var pred = require('./predProcess');
var allCount = 0;
var dataInterval = 100;
var dataSetFile = 'data.txt';
var trainFile = "train.exe";
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
    db.find({}, allCount, dataInterval, function(err, result) {
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
                if (e.LOT != undefined && e.LAT != undefined && e.PM != undefined && e.TIME != undefined) {
                    data = [];
                    console.log(e.TIME);
                    pmDate = new Date(e.TIME);
                    console.log(pmDate);
                    data[0] = pmDate.getHours() / 24;
                    data[1] = 0;
                    for (i = 0; i < pmDate.getMonth(); i++) {
                        data[1] += (new Date(pmDate.getFullYear(), i, 0)).getDate();
                    }
                    data[1] += pmDate.getDate();
                    data[1] = data[1] / 365;
                    data[2] = e.LAT;
                    data[2] = data[2] / 180
                    data[3] = e.LOT;
                    data[3] = data[3] / 360

                    if (e.PM >= 0 && e.PM < 75) {
                        data[4] = 1;

                    } else if (e.PM >= 75 && e.PM < 150) {
                        data[4] = 2;

                    } else if (e.PM >= 150 && e.PM < 300) {
                        data[4] = 3;

                    } else if (e.PM >= 300 && e.PM < 1050) {
                        data[4] = 4;

                    } else if (e.PM >= 1050 && e.PM < 3000) {
                        data[4] = 5;

                    } else {
                        data[4] = 6;
                    }
                    writerStream.write(data.join(" ") + '\n', "UTF-8");
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