var db = require('./mongoDB');
var fs = require('fs');
var allCount = 0;
var dataInterval = 6000;
var dataSetFile = 'data.txt';

db.getAllCount(function (result) {
    if (result.length != 0) allCount = result[result.length - 1];
})

var loopTaskNum = 0;


function loopTask() {
    loopTaskNum = setInterval(function () {
        db.checkStatus(function (stats) {
            if (stats.count >= allCount + dataInterval) {
                clearInterval(loopTaskNum);
                createDataSet();
            }
        });
    }, 5 * 60 * 1000);
};


function createDataSet() {
    db.find({}, allCount, dataInterval, function (err, result) {
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
            result.forEach(function (e) {
                if (e.LOT != undefined && e.LAT != undefined && e.PM != undefined && e.time != undefined) {
                    data = [];
                    pmDate = Date(e.time);
                    data[0] = pmDate.getHours()/24;

                    data[1] = 0;
                    for(i = 0; i < pmDate.getMonth();i++){
                        data[1] += (new Date(pmDate.getFullYear(), i, 0)).getDate();
                    }
                    data[1] += pmDate.getDate();
                    data[1] = data[1]/365;
                    data[2] = e.LAT;
                    // data[2] = data[2]/180
                    data[3] = e.LOT;
                    // data[3] = data[3]/360
                    
                    if(e.PM >= 0 && e.PM < 75){
                        data[4] = 1;
                        data[5] = 0;
                        data[6] = 0;
                        data[7] = 0;
                        data[8] = 0;
                        data[9] = 0;
                    } else if(e.PM >= 75 && e.PM < 150){
                        data[4] = 0;
                        data[5] = 1;
                        data[6] = 0;
                        data[7] = 0;
                        data[8] = 0;
                        data[9] = 0;
                    }else if(e.PM >= 150 && e.PM < 300){
                        data[4] = 0;
                        data[5] = 0;
                        data[6] = 1;
                        data[7] = 0;
                        data[8] = 0;
                        data[9] = 0;
                    }else if(e.PM >= 300 && e.PM < 1050){
                        data[4] = 0;
                        data[5] = 0;
                        data[6] = 0;
                        data[7] = 1;
                        data[8] = 0;
                        data[9] = 0;
                    }else if(e.PM >= 1050 && e.PM < 3000){
                        data[4] = 0;
                        data[5] = 0;
                        data[6] = 0;
                        data[7] = 0;
                        data[8] = 1;
                        data[9] = 0;
                    }else{
                        data[4] = 0;
                        data[5] = 0;
                        data[6] = 0;
                        data[7] = 0;
                        data[8] = 0;
                        data[9] = 1;
                    }
                    writerStream.write(data.join(" ")+'\n',"UTF-8");
                }
            })
            writerStream.end();
            console.log("execute end...");
        }
    });
}




module.exports = server;