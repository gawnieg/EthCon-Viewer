var Web3 = require('web3');
var web3 = new Web3();
const express = require('express')
const app = express()
const rp = require("request-promise")
var mp = require('mongodb-promise');
var MongoClient = require('mongodb').MongoClient;
const graph_gen_for_contract = require("./generate_graph_for_contract.js")
const async = require('async');
const request = require('request');

var connectionURL ="http://localhost:8545"; //default
process.argv.forEach(function (val, index, array) {
  if(index ==2 ){
    connectionURL="http://"+val.toString();
  }
});
console.log("Geth connection is "+connectionURL)
try{
  web3.setProvider(new web3.providers.HttpProvider(connectionURL));
  if(!web3.isConnected()){
    console.log("Cannot connect to Geth at provided URL");
    process.exit()
  }
  else{//now connect other instances required
    graph_gen_for_contract.setGethURL(connectionURL);
  }
}
catch(err){
  console.log("Chucking error for connecting to Geth" +err);
}



app.set('view engine','ejs')
//app.use(express.static('src'))
app.use(express.static(__dirname+'/public'));


var checkTrans = function(_passed_trans,display){ //https://stackoverflow.com/questions/34736705/how-to-promisify-this-function-nodejs
  return new Promise(function(resolve,reject){
    web3.currentProvider.sendAsync({
        method: "debug_traceTransaction",
        params: [_passed_trans,{disableStorage: true, disableMemory:true}],  //  see docs, was ->params: ['0x272d5cfed972a35437833802595d170cd6288f2f7393d1d57af1a5955ab1dabf',{}]
        jsonrpc: "2.0",
        id:"2"},
          function(err,result){
            if(err){
              reject(err)
            }
            else{
              console.log("got result!!")
              var trace= JSON.stringify(result.result);
              console.log(trace)
              resolve(trace)
            }
          }
      );
  })
}



app.get("/getmultiblock",function(req,res){
  var startblock = parseInt(req.query.startblock);
  var endblock = parseInt(req.query.endblock);
  console.log("====================\n getmultiblock has been called for \n========================")
  //Find transaction in all of these blocks
  var block_list =[];
  //make list of blocks for which to get the transactions hashes
  for(var b=startblock;b<=endblock;b++){
    block_list.push(b);
  }

  function httpGet(url, callback) {
    const options = {
      url :  url,
      json : true
    };
    request(options,
      function(err, res, body) {
        console.log("calling callback")
        callback(err, body);
      }
    );
  }

  var urls =[];
  function constructURLs(block_list){
    block_list.forEach(function(bn){
      var eachURL = "https://etherchain.org/api/block/"+bn+"/tx";
      urls.push(eachURL);
    })
  }
  // const urls= [
  //   "https://etherchain.org/api/block/4000000/tx",
  //   "https://etherchain.org/api/block/4000001/tx",
  //   "https://etherchain.org/api/block/4000002/tx"
  // ];

  var transHashList=[];

  async.map(urls, httpGet, function (err, res){
    if (err) return console.log(err);
    for(var index=0; index<res.length;index++){
      //now exract data of each
      var data_array = res[index].data;
      for(var dataIndex=0; dataIndex<data_array.length;dataIndex++){
        transHashList.push(data_array[dataIndex].hash);
      }
    }
    console.log("got http requests")
    console.log("transHashList is :");
    transHashList.forEach(function(each){
      console.log(each)
    })
    console.log("now continuing doing something else")
    find_in_db(transHashList,blockCallback,res);

  });


      /*
      need to trun this into a promise so that all blocks are searched for transactions before continuing
      PSEUDO code
      blockTransList=[]
      forEach block:
        send GET request to ethercampResponse
        parse response for transactions hashes and push to blockTransList
      .then(){
        find_in_db(blockTransList)
      }

      Q.all ?
      does rp have its own multi request version?
    */
})

var blockCallback = function(contractTransList,found_trans,res){
  var found_trans_list=[];
  found_trans.forEach(function(trans){//get transactions number from each object found
    found_trans_list.push(trans.transaction_no);
  })
  console.log("Callback: there were: "+found_trans.length + "items found in the db");
  console.log("Callback: we need a min of "+contractTransList.length+" items..")
  Array.prototype.diff = function(a){
    return this.filter(function(i){
      return a.indexOf(i)<0;
    });
  };
  var needToFindTrans=contractTransList.diff(found_trans_list) //need.diff(haveindb)
  if(needToFindTrans.length){ //if there are ones that need to be generated
    console.log("Callback: need to carry out graph gen for these: ");
    //printing nicely
    needToFindTrans.forEach(function(each){
      console.log(each)
    })
    graph_gen_for_contract.gen_graph_promise(needToFindTrans)
  }
  //if all the pictures are in the db
  else{ //this else runs on refresh
    //get pictures random string names
    var picsToView = [];
    found_trans.forEach(function(index){
      picsToView.push(index.randomHash);
    })
    //now render to screen
    console.log("picsToView: ")
    picsToView.forEach(function(each){
      console.log(each)
    })
    res.render("contractView.ejs",{
      picsToView:picsToView
    });
  }
}



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
                              //now call callback
                              db.close().then(callback(contractTransList,found_trans,res));
                          })
              })
  })
  .fail(function(err) {console.log(err)});
}

app.listen(3005, function () {
  console.log('Example app listening on port 3001!')
})
