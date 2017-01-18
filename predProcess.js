var fs = require('fs');
var cp = require('child_process');
var pred = {};
var predFile = "predict.exe";

pred.lock = false;
pred.predFile = predFile;

pred.runPrediction = function(lot, lat, time, callback){
    while(pred.lock == true){
        sleep(1);
    }
    pred.lock = true;
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