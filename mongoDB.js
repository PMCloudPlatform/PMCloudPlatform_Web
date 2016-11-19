var MongoClient = require('mongodb').MongoClient;
// 修改这里的用户名和密码
var DB_CONN_STR = 'mongodb://app:f1403018@133.130.116.215:27017/pm';
// var DB_CONN_STR = 'mongodb://username:pwd@127.0.0.1:27017';
var db;

MongoClient.connect(DB_CONN_STR, function(err, database) {
    if (err) {
        console.log('Error:' + err);
        return;
    }
    console.log(DB_CONN_STR + "连接成功！");
    db = database;
});

dbClient = {
    insert: function(obj) {
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
    },
    find: function(obj, lowerBound, count, callback) {
        //连接到表  
        var collection = db.collection('data');
        // console.log(lowerBound);
        // console.log(count);
        collection.find({}).skip(lowerBound).limit(count).toArray(function(err, result) {
            if (err) {
                console.log('Error:' + err);
                callback();
            }
            // console.log(result);
            // db.close();
            callback(result);
        });
    }
}

module.exports = dbClient;
