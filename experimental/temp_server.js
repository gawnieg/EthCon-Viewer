const express = require('express')
const app = express()
const transfinder = require("./all_trans_per_contract.js")
const graph_gen_for_contract = require("./generate_graph_for_contract.js")
var MongoClient = require('mongodb').MongoClient;
var mp = require('mongodb-promise');
const rp = require("request-promise")
//visit http://localhost:7000/contract?contract=0xfbc76d976777c44cd01069664885da3acfad87b2
/*
depth level = 2 http://localhost:7000/contract?contract=0x88aA042c4AaE423E0F1bb48542b473d1dD20a807&start=4048908&end=4048912
depth level = 1 http://localhost:7000/contract?contract=0xb62ef4c58f3997424b0cceab28811633201706bc&start=3000000&end=4048938

*/
const bodyParser = require("body-parser")
app.use(bodyParser.json())

app.set('view engine','ejs')
app.use(express.static(__dirname+'/public'));


app.get("/contract",function(req,res){

  var viewContract = req.query.contract; // read in from URL
  viewContract=viewContract.toString();
  var _startBlock = parseInt(req.query.start);
  var _endBlock = parseInt(req.query.end);
  console.log("want to trans for view: "+viewContract+" between "+_startBlock + " and "+_endBlock);
  // var contractTransList = transfinder.getTransactionsByAccount(viewContract.toString(),startBlock,endBlock)
  const options = {
    method: 'GET',
    uri: 'http://api.etherscan.io/api',
    qs:{
      module:"account",
      action:"txlist",
      address:viewContract,
      startblock:_startBlock,
      endblock:_endBlock,
      sort:"asc",
      apikey:"W3ME1J7QWZZS6E82TM8YAZCGN48V2V893"
    },
    json: true
  }
  rp(options)
    .then(function (response) {
      // Request was successful, use the response object at will
      // console.log(JSON.stringify(response))
      var etherscanResponse = response.result;
      var status = response.status;
      console.log("status"+status)
      var contractTransList =[];
      etherscanResponse.forEach(function(trans){//for each transaction, push hash to array
        contractTransList.push(trans.hash)
      })
      console.log("contractTransList is "+contractTransList)
      find_in_db(contractTransList,callback,res);
    })
    .catch(function (err) {
      // Something bad happened, handle the error
    })

})





var callback = function(contractTransList,found_trans,res){
  var found_trans_list=[];
  found_trans.forEach(function(trans){//get transactions number from each object found
    found_trans_list.push(trans.transaction_no);
  })
  console.log("Callback: there were: "+found_trans.length + "items found in the db");
  console.log("Callback: we needed "+contractTransList.length+" items..")
  Array.prototype.diff = function(a){
    return this.filter(function(i){
      return a.indexOf(i)<0;
    });
  };
  var needToFindTrans=contractTransList.diff(found_trans_list) //need.diff(haveindb)
  if(needToFindTrans.length){ //if there are ones that need to be generated
    console.log("Callback: need to carry out graph gen for these: " +needToFindTrans);
    graph_gen_for_contract.gen_graph_promise(needToFindTrans)
  }
  //if all the pictures are in the db
  else{
    //get pictures random string names
    var picsToView = [];
    found_trans.forEach(function(index){
      picsToView.push(index.randomHash);
    })
    //now render to screen
    console.log("picsToView: "+picsToView)
    res.render("contractView.ejs",{
      picsToView:picsToView
    });
  }


}


app.listen(7000,function(){
  console.log("now listening on port 7000")
})

// // Read all documents
function find_in_db(contractTransList,callback,res){
mp.MongoClient.connect("mongodb://127.0.0.1:27017/trans")
    .then(function(db){
            return db.collection('test')
                .then(function(col) {
                    return col.find({transaction_no : {$in: contractTransList}}).toArray()
                        .then(function(items) {
                            console.log("db replied")
                            var found_trans =[]
                            items.forEach(function(item){
                              found_trans.push(item);//the whole object
                            })

                            db.close().then(callback(contractTransList,found_trans,res));
                        })
            })
})
.fail(function(err) {console.log(err)});
}
