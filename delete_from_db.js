// this shall be called from a route to delete all transacitons to do with a contract.

var mp = require('mongodb-promise');
var MongoClient = require('mongodb').MongoClient;
module.exports = {
  delete_array_of_trans : function(trans_list){
    delete_trans_from_db(trans_list)
  }
}


function delete_trans_from_db(trans_list){
  MongoClient.connect("mongodb://127.0.0.1:27017/trans", function(err, db) {
    if (err) throw err;
    var myquery = { transaction_no : {$in: trans_list}};
    db.collection("test").deleteMany(myquery, function(err, obj) {
      if (err) throw err;
      console.log(obj.result.n + " document(s) deleted");
      db.close();
    });
  });
}
