var MongoClient = require('mongodb').MongoClient;
var NN = require('./dataProcess');

// 修改这里的用户名和密码
var DB_CONN_STR = 'mongodb://app:f1403018@133.130.116.215:27017/pm';
// var DB_CONN_STR = 'mongodb://username:pwd@127.0.0.1:27017';
var dbClient = {};

MongoClient.connect(DB_CONN_STR, function(err, db) {
    if (err) {
        console.log('Error:' + err);
        return;
    }
    console.log(DB_CONN_STR + "连接成功！");
    dbClient.insert = function(obj) {
        //连接到表  
        var collection = db.collection('data');
        collection.insert(obj, function(err, result) {
            if (err) {
                console.log('Error:' + err);
                return;
            }
            // console.log(result);
            // db.close();
        });
    };
    dbClient.find = function(obj, lowerBound, count, callback) {
        //连接到表  
        var collection = db.collection('data');
        // console.log(lowerBound);
        // console.log(count);
        collection.find(obj).skip(lowerBound).limit(count).toArray(function(err, result) {
            if (err) {
                console.log('Error:' + err);
                // callback(err);
            }
            // console.log(result);
            // db.close();
            callback(null, result);
        });
    };
    dbClient.checkStatus = function(callback){
        //连接到表  
        var collection = db.collection('data');
        collection.stats(function(err, stats){
            if (err) {
                console.log('Error:' + err);
                // callback(err);
            }
            else{
                callback(stats);
            }
        });
    };
    dbClient.getAllCount = function(callback){
        //连接到表  
        var collection = db.collection('NNCounter');
        collection.find({}).toArray(function(err, result) {
            if (err) {
                console.log('Error:' + err);
                // callback(err);
            }
            console.log(result);
            // db.close();
            callback(result);
        });
    };
    dbClient.setAllCount = function(allCount){
        //连接到表  
        var collection = db.collection('NNCounter');
        var obj = {
            'COUNT': allCount
        };
        collection.insert(obj, function(err, result) {
            if (err) {
                console.log('Error:' + err);
                return;
            }
            // console.log(result);
            // db.close();
        });
    };
    setTimeout(NN.init, 1000);
});

module.exports = dbClient;
