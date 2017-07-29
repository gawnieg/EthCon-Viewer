var MongoClient = require('mongodb').MongoClient;
var mp = require('mongodb-promise');


function find_in_db(array){
mp.MongoClient.connect("mongodb://127.0.0.1:27017/db_name")
    .then(function(db){
            return db.collection('collection_name')
                .then(function(col) {
                    return col.find({pid:{ $in: array}}).toArray() //( { qty: { $in: [ 5, 15 ] } } )
                        .then(function(items) {
                            console.log("db replied")
                            console.log(items);
                            db.close();
                        })
            })
})
.fail(function(err) {console.log(err)});
}


find_in_db([45,55])
