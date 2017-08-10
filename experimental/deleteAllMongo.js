var mp = require('mongodb-promise');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/test";

mp.MongoClient.connect("mongodb://127.0.0.1:27017/trans")
    .then(function(db){
        return db.collection('test')
            .then(function(col) {
                return col.deleteMany({})
                    .then(function() {
                        //console.log(result);
                         db.close().then(console.log('stuff deleted is a success'));
                    })
            })
})
.fail(function(err) {console.log(err);});
