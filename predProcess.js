var fs = require('fs');
var cp = require('child_process');
var pred = {};
var dataSetFile = 'testdata.txt';
var predFile = "predict.exe";

pred.lock = false;
pred.predFile = predFile;

pred.runPrediction = function(lot, lat, time, callback){
    while(pred.lock == true){
        sleep(1);
    }
    data = [];
    pmDate = Date(time);
    data[0] = pmDate.getHours()/24;

    data[1] = 0;
    for(i = 0; i < pmDate.getMonth();i++){
        data[1] += (new Date(pmDate.getFullYear(), i, 0)).getDate();
    }
    data[1] += pmDate.getDate();
    data[1] = data[1]/365;
    data[2] = lat;
    data[2] = data[2]/180
    data[3] = lot;
    data[3] = data[3]/360
    pred.lock = true;

    fs.writeFileSync(dataSetFile, data.join(" ")+'\n');
    child = cp.exec(predFile, function(error, stdout, stderr){
        pred.lock = false;
        if (error) {
            console.log(error.stack);
            console.log('Error code: ' + error.code);
            return;
        }
        fs.readFile("testresult.txt", function(err, data){
            callback(err, Number(data));
        });
    });
}

var sleep = function (length){
    var index = 0;
    var begin= setInterval(function(){
        index ++;
        if(length<index){
        clearInterval(begin);
        }
    },1000);
}      
module.exports = pred;