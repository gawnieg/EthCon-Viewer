const express = require('express')
const app = express()
const transfinder = require("./all_trans_per_contract.js")
const graph_gen_for_contract = require("./generate_graph_for_contract.js")
var MongoClient = require('mongodb').MongoClient;
var mp = require('mongodb-promise');
//visit http://localhost:7000/contract?contract=0xfbc76d976777c44cd01069664885da3acfad87b2

app.get("/contract",function(req,res){

  var viewContract = req.query.contract; // read in from URL
  var startBlock = parseInt(req.query.start);
  var endBlock = parseInt(req.query.end);
  console.log("checking "+(endBlock-startBlock))
  console.log("want to trans for view: "+viewContract);
  var contractTransList = transfinder.getTransactionsByAccount(viewContract.toString(),startBlock,endBlock)
  console.log("finished getting transactions for that account")
  console.log(contractTransList)
  //now check if we need to generate graphs or what?
  // console.log("going to try find "+contractTransList[0])
  for(var index=0; index<contractTransList.length;index++){
    console.log("quering db")
    find_in_db(contractTransList[index],callback,contractTransList,index)
  }

  // console.log(foundInDB);

  // graph_gen_for_contract.gen_graph_promise(contractTransList)
  res.send("yurt4life")

})

var callback = function(items,contractTransList,transListIndex){
  console.log("YURT SON");
  console.log("there were: "+items.length + "items found in the db");
  if(!items.length){
    console.log("need to carry out graph gen for these");
    var temp_array = [];
    temp_array.push(contractTransList[transListIndex]);
    graph_gen_for_contract.gen_graph_promise(temp_array)
  }


}


app.listen(7000,function(){
  console.log("now listening on port 7000")
})

// // Read all documents
function find_in_db(_trans_no,callback,contractTransList,transListIndex){
mp.MongoClient.connect("mongodb://127.0.0.1:27017/trans")
    .then(function(db){
            return db.collection('test')
                .then(function(col) {
                    return col.find({transaction_no : _trans_no}).toArray()
                        .then(function(items) {
                            console.log("db replied")
                            // console.log(items);
                            db.close().then(callback(items,contractTransList,transListIndex));
                        })
            })
})
.fail(function(err) {console.log(err)});
}
