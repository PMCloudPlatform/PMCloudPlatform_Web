var fs = require('fs');
var cp = require('child_process');
var pred = {};
var dataSetFile = 'testdata.csv';
var predFile = "python predict.py";

pred.lock = false;
pred.predFile = predFile;

pred.runPrediction = function(lot, lat, time, callback) {
    var data = [];
    var pmDate = new Date(time);
    data[0] = pmDate.getHours() / 24;

    // 转换时间
    data[1] = 0;
    for (i = 0; i < pmDate.getMonth(); i++) {
        data[1] += (new Date(pmDate.getFullYear(), i, 0)).getDate();
    }
    data[1] += pmDate.getDate();
    data[1] = data[1] / 365;
    data[2] = lat;
    data[2] = data[2] / 180;
    data[3] = lot;
    data[3] = data[3] / 360;
    data[4] = 0;
    data[5] = 0;
    data[6] = 0;
    // 只是为了完成格式
    data[7] = 0;
    data[8] = 0;
    data[9] = 0;
    data[10] = 0;
    data[11] = 0;
    data[12] = 0;
    data[13] = 0;
    data[14] = 0;
    // pred.lock = true;
    fs.writeFileSync(dataSetFile, data.join(",") + '\n');
    if (pred.lock == true) {
        var begin = setInterval(function() {
            if (pred.lock == false) {
                clearInterval(begin);
                runPredExec();
            }
        }, 1000);
    } else {
        runPredExec();
    }
}

function runPredExec() {
    pred.lock = true;
    console.log("predict begin");
    // run the NN trainer
    child = cp.exec(predFile, function(error, stdout, stderr) {
        pred.lock = false;
        console.log("predict end");
        if (error) {
            console.log(error.stack);
            console.log('Error code: ' + error.code);
            return;
        }
        fs.readFile("testresult.txt", function(err, data) {
            callback(err, Number(data));
        });
    });
    //run the NN predictor when training is over
}

module.exports = pred;