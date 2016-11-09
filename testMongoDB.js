
/*这个方法也是可以的，具体有什么区别不知道*/
var mongodb = require('mongodb');

var mongodbServer = new mongodb.Server('133.130.116.215', 27017, { auto_reconnect: true, poolSize: 10 });
var db = new mongodb.Db('admin', mongodbServer);

/* open db */
db.open(function(err, db) {
    if (err) {
        console.log('Error:' + err);
        return;
    }
    // 修改为正确的用户名和密码
    db.authenticate('username', 'pwd', function() {
        /* Select 'contact' collection */
        db.collection('contact', function(err, collection) {
            // /* Insert a data */
            // collection.insert({
            //     name: 'Fred Chien',
            //     email: 'cfsghost@gmail.com',
            //     tel: [
            //         '0926xxx5xx',
            //         '0912xx11xx'
            //     ]
            // }, function(err, data) {
            //     if (data) {
            //         console.log('Successfully Insert');
            //     } else {
            //         console.log('Failed to Insert');
            //     }
            // });

            /* Querying */
            collection.find({ name: 'Fred Chien' }, function(err, data) {
                /* Found this People */
                if (data) {
                    console.log('Name: ' + data.name + ', email: ' + data.email);
                } else {
                    console.log('Cannot found');
                }
            });
        });
    });
});



/* 这个方法是可以的。
var MongoClient = require('mongodb').MongoClient;
// 修改这里的用户名和密码
var DB_CONN_STR = 'mongodb://username:pwd@133.130.116.215:27017';

var selectData = function(db, callback) {  
  //连接到表  
  var collection = db.collection('tb2');
  //查询数据
  var whereStr = {"name":'wilson001'};
  collection.find(whereStr).toArray(function(err, result) {
    if(err)
    {
      console.log('Error:'+ err);
      return;
    }     
    callback(result);
  });
}

MongoClient.connect(DB_CONN_STR, function(err, db) {
	if(err)
    {
      console.log('Error:'+ err);
      return;
    }
  	console.log("连接成功！");
  	selectData(db, function(result) {
    console.log(result);
    db.close();
 	});
});
*/