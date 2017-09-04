const express = require('express')
const app = express()
const graph_gen = require("./generate_graph.js")
const db2 = require("./database2.js")
var MongoClient = require('mongodb').MongoClient;
var mp = require('mongodb-promise');
const fs = require("fs")
var formidable = require('formidable'); //for file uploads
const graph_gen_for_contract = require("./generate_graph_for_contract.js")
const rp = require("request-promise")
const bodyParser = require("body-parser")
const async = require('async');
const request = require('request');
const graph_gen_per_transaction=require("./generate_graph_per_transaction.js")
const generate_graph_from_static = require("./generate_graph_from_upload.js")
var Web3 = require('web3');
var web3 = new Web3();
const graph_tool_routes = require("./graph_tool_routes.js")
const misc_routes = require("./misc_routes.js")

//var url = "mongodb://localhost:27017/test?socketTimeoutMS=90000";
var url = "mongodb://localhost:27017/test";
var testORmain = ""; //to indicate if it is testnet or main net
app.set('view engine','ejs')
//app.use(express.static('src'))
app.use(express.static(__dirname+'/public'));
app.use(bodyParser.json())
//reading in from commandline

var connectionURL ="http://localhost:8545"; //default
process.argv.forEach(function (val, index, array) {
  if(index ==2 ){
    connectionURL="http://"+val.toString();
  }
  if(index==3){
    testORmain=val.toString();
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
    graph_gen.setGethURL(connectionURL);
    graph_gen_for_contract.setGethURL(connectionURL);
    graph_gen_per_transaction.setGethURL(connectionURL);
    misc_routes.setGethURL(connectionURL)
  }
}
catch(err){
  console.log("Chucking error for connecting to Geth" +err);
}
// set testORmain in modules




// homepage!!!
app.get("/",function(req,res){
  res.render("homepage.ejs")
})



// uses vis.js library
app.get('/vis', function(req, res) {
  var block_num = req.query.block_num; // read in from URL
  var num_block = req.query.num_block;
  console.log("------------NEW BROWSER REQUEST FOR VIS-------")
  console.log("received block_num:" + block_num +" ,num_block:" + num_block);

  /*
  Search for block in database. If it is not there then generate the blocks
  */
  var upper_block_limit = parseInt(block_num) + parseInt(num_block);
  var response_graphviz=[];
  var response_sigma =[]; //making array of objects
  for(var block= parseInt(block_num); block < upper_block_limit; block++){ //move this loop? as cannot set headers after sent
    mp.MongoClient.connect(url)
      .then(function(db){
              return db.collection('test')
                  .then(function(col) {
                      return col.find({block_num : block_num}).toArray()
                          .then(function(items) {
                            if(items.length){
                              console.log("found "+items.length+" graphviz items for this block in DB!")
                              for(i=0;i<items.length;i++){
                                var r = items[i].graph;
                                r=r.toString();
                                response_graphviz.push(r)
                                console.log("typeof r is "+typeof(r))
                              }
                            db.close()
                            .then(function(){
                              console.log("yurt - this is a promise .then")
                            })
                            .then(function (){
                                console.log("rendering screen ejs")
                                res.render("index.ejs",{
                                  block_num:block_num,
                                  num_block:num_block,
                                  graph_formats: response_graphviz
                                });
                            });
                            }
                            else{
                              console.log("found nothing in DB so adding block no. "+block_num +" to db ");
                              //add the specified graphs to the database
                              add_blocks_graph_to_db(block_num,1);// 1 is blank does nt matter what
                            }

                          })

              })
  })
  .fail(function(err) {console.log(err)});
  }

});//end of express route




/////////////////////////////////////////////////////////////////////////////////
                            //graphviz routes
/////////////////////////////////////////////////////////////////////////////////
const graphviz_routes = require("./graphviz_routes.js")
const helper_functions = require("./helper_functions.js")
app.get("/graphviztransaction",function(req,res){
  var transaction = (req.query.transaction).toString()
  console.log("#######################    GraphViz called for "+ transaction);
  var transArr=[];
  transArr.push(transaction);
  var graphvizCallback = graphviz_routes.graphvizCallback;
  var find_in_db_var = helper_functions.find_in_db;
  find_in_db_var(transArr,graphvizCallback,res)
})


app.get("/graphvizInvocation",function(req,res){ // graphviz for single EVM invocation
  var transaction = (req.query.transaction).toString()
  var transArr=[];
  transArr.push(transaction);
  console.log("#######################    GraphViz Invocation called for "+ transaction);
  var graphvizCallbackEVMInvocation = graphviz_routes.graphvizCallbackEVMInvocation;
  var find_depth_in_db_var = helper_functions.find_depth_in_db;
  find_depth_in_db_var(transArr,graphvizCallbackEVMInvocation,res)
})




////////////////////////////////////////////////////////////////////////////////
                                  // end of graphviz route
////////////////////////////////////////////////////////////////////////////////
const sigmajs_routes = require("./sigmajs_routes.js")
app.get("/sigmatransaction",function(req,res){
  var transaction = req.query.transaction; // should be one singular transaction
  var isLabel = parseInt(req.query.isLabel); // is 1 if labels are desired
  console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%  sigmatransaction request %%%%%%%%%%%%%%%%%%%%%% with labels?: "+isLabel)
  console.log("received sigmatransaction request for "+transaction)
  transaction=transaction.toString();
  var transArr =[];
  transArr.push(transaction);
  var find_in_db_var2 = helper_functions.find_in_db;
  var single_sigma_callback = sigmajs_routes.single_sigma_callback;
  find_in_db_var2(transArr,single_sigma_callback,res,null,null,null,isLabel)
})//end of app get sigmatransaction

app.get("/sigmatransactiondynamic",function(req,res){
  var transaction = req.query.transaction; // should be one singular transaction
  var isLabel = parseInt(req.query.isLabel); // is 1 if labels are desired
  console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%  sigmatransaction request %%%%%%%%%%%%%%%%%%%%%% with labels?: "+isLabel)
  console.log("received sigmatransaction request for "+transaction)
  transaction=transaction.toString();
  var transArr =[];
  transArr.push(transaction);
  var find_in_db_var2 = helper_functions.find_in_db;
  var single_sigma_callback_each_edge = sigmajs_routes.single_sigma_callback_each_edge;
  find_in_db_var2(transArr,single_sigma_callback_each_edge,res,null,null,null,isLabel)
})//end of app get sigmatransaction

app.get("/sigmamulti",function(req,renderres){
  var startblock = req.query.startblock;
  var endblock = req.query.endblock;
  console.log("====================\n sigmaJS getmultiblock has been called for \n==========="+startblock +" to "+endblock)
  var block_list =[];
  var transHashList=[];// array to store transaction hashes from each of the blocks!
  //make list of blocks for which to get the transactions hashes
  for(var b=parseInt(startblock);b<=parseInt(endblock);b++){
    block_list.push(b);
  }
  console.log("block_list is "+block_list)
  if(testORmain=="test"){ // if it is the testnet that is running, then we have to get transactions from web3
    block_list.forEach(function(each){
      var transperblock=getTransactionsFromBlock(each);//function call to web3.eth.getBlock
      transperblock.forEach(function(trans){
        transHashList.push(trans)
      })
    })
  }
  else{ //otherwise its the mainnet
    // const constructURLs = helper_functions.constructURLs
    var urls=constructURLs(block_list); //construct urls for blocks - this goes to etherchain and gets the transactions from there
    console.log("urls are "+urls)
  }
  var httpGet = helper_functions.httpGet;
  async.map(urls, httpGet, function (err, res){ // this function is the callback to httpGet
    if (err) return console.log(err);
    for(var index=0; index<res.length;index++){
      //now exract data of each
      var data_array = res[index].data;
      for(var dataIndex=0; dataIndex<data_array.length;dataIndex++){
        transHashList.push(data_array[dataIndex].hash.toString());
      }
    }
    console.log("finished http requests and transHashList is :");
    transHashList.forEach(function(each){//print nicely
      console.log(each)
    })
    var find_in_db_3 = helper_functions.find_in_db;
    var single_sigma_callback = sigmajs_routes.single_sigma_callback;
    find_in_db_3(transHashList,single_sigma_callback,renderres);
  });
})
function constructURLs(block_list){ // function that builds the etherscan lookup urls from the blocknumbers passed
  var urls =[];
  block_list.forEach(function(bn){
    var eachURL = "https://etherchain.org/api/block/"+bn+"/tx";
    console.log("adding url "+eachURL)
    urls.push(eachURL);
  })
  return urls;
}

/////////////////////////////////////////////////////////////////////////////////////////////

//                Sigma js contract view

////////////////////////////////////////////////////////////////////////////////////////////
app.get("/sigmacontract",function(req,res){
  var viewContract = req.query.contract; // read in from URL
  viewContract=viewContract.toString();
  var _startBlock = parseInt(req.query.start);
  var _endBlock = parseInt(req.query.end);
  var isLabel = parseInt(req.query.isLabel); // is 1 if labels are desired
  console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%  Sigma contract view request %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
  console.log("want to trans for view: "+viewContract+" between "+_startBlock + " and "+_endBlock);
  // var lookupEtherscan = helper_functions.lookupEtherscan;
  lookupEtherscan(viewContract,_startBlock,_endBlock,testORmain).then(function(contractTransList,err){
    if(err){
      console.log("there was an error with etherscan api lookup")
      res.send("etherscan error!!")
    }
    if(contractTransList.length==0){
      res.send("Etherscan did not find any results for that search, please check your parameters and try again!")
    }
    var find_in_db = helper_functions.find_in_db;
    var sigmacontractCallback = sigmajs_routes.sigmacontractCallback;
    find_in_db(contractTransList,sigmacontractCallback,res,viewContract,_startBlock,_endBlock);
  })
})


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                          graph tool transaction
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/gttransaction",function(req,res){ //gets the graph-tools representation for one transaction

  var transaction = req.query.transaction;
  transaction=transaction.toString()
  var transArr = [];
  transArr.push(transaction);
  const find_in_db = helper_functions.find_in_db;
  const callback = graph_tool_routes.callback;
  find_in_db(transArr,callback,res); //uses contractView to render
})

//###################################################################
//                        graph tool get multi block
//###################################################################
app.get("/gtgetmultiblock",function(req,renderres){
  var startblock = req.query.startblock;
  var endblock = req.query.endblock;
  console.log("====================\n getmultiblock has been called for \n========================"+startblock +" to "+endblock)
  //Find transaction in all of these blocks
  var block_list =[];
  var transHashList=[];// array to store transaction hashes from each of the blocks!
  //make list of blocks for which to get the transactions hashes
  for(var b=parseInt(startblock);b<=parseInt(endblock);b++){
    block_list.push(b);
  }
  if(testORmain=="test"){ // if it is the testnet that is running, then we have to get transactions from web3
    block_list.forEach(function(each){
      var transperblock=getTransactionsFromBlock(each);//function call to web3.eth.getBlock
      transperblock.forEach(function(trans){
        transHashList.push(trans)
      })
    })
  }
  else{ //otherwise its the mainnet
    // const constructURLs = helper_functions.constructURLs;
    var urls=constructURLs(block_list); //construct urls for blocks - this goes to etherchain and gets the transactions from there
  }
  const httpGet = helper_functions.httpGet;
  async.map(urls, httpGet, function (err, res){ // this function is the callback to httpGet
    if (err) return console.log(err);
    for(var index=0; index<res.length;index++){
      //now exract data of each
      var data_array = res[index].data;
      for(var dataIndex=0; dataIndex<data_array.length;dataIndex++){
        transHashList.push(data_array[dataIndex].hash.toString());
      }
    }
    console.log("finished http requests and transHashList is :");
    transHashList.forEach(function(each){
      console.log(each)
    })
    const find_in_db = helper_functions.find_in_db;
    const callback = graph_tool_routes.callback;
    find_in_db(transHashList,callback,renderres);
  });
});//end of route


/////////////////////////////////////////////////////////////////////////////////////////////

//               graph tool contract view

////////////////////////////////////////////////////////////////////////////////////////////
app.get("/gtcontract",function(req,res){
  //graph -tools per contract over a particular num blocks - start to end- working and good!
  // testnet: http://localhost:3005/gtcontract?contract=0x45fcd0d6abfa60031e1cf4148780c227ecb0b531&start=1281186&end=1285969
  // mainnet: http://localhost:3005/gtcontract?contract=0x851b7F3Ab81bd8dF354F0D7640EFcD7288553419&start=3934565&end=3966824
  var viewContract = req.query.contract; // read in from URL
  viewContract=viewContract.toString();
  var _startBlock = parseInt(req.query.start);
  var _endBlock = parseInt(req.query.end);
  console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%  gtcontract request %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
  console.log("want to trans for view: "+viewContract+" between "+_startBlock + " and "+_endBlock);
  lookupEtherscan(viewContract,_startBlock,_endBlock).then(function(contractTransList,err){
    if(err){
      console.log("there was an error with etherscan api lookup")
      res.send("etherscan error!!")
    }
    const find_in_db = helper_functions.find_in_db;
    const callback = graph_tool_routes.callback;
    find_in_db(contractTransList,callback,res,viewContract,_startBlock.toString(),_endBlock.toString());
  })
})









////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//returns raw geth debug_traceTransaction output, primarly used for debugging
// const misc_routes = require("misc_routes.js")
app.get("/checktrans",function(req,res){
  var transaction = req.query.transaction;
  transaction=transaction.toString()
  console.log("#################\nThe sanity checker has been called for the transaction: \n ########################\n"+transaction)
  // var checkTrans = misc_routes.checkTrans;
  checkTrans(transaction).then(function (result) {
    // console.log("rendering"+result)
    if(result===undefined){
      result = "result was found to be undefined"
    }
    res.render("checktrans.ejs",{
      // traceTrans: result.toString()
      traceTrans: JSON.stringify(result)
    })
  }).catch(function (err) {
      console.log("there was an error in the sendAsync function: "+err)
  });
})

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





//_-----------------------------------------------------------------------------------------------------------------------------------
//adding new route to pull graphml format from it, might be overkill
app.get("/getgraphml",function(req,res){
  var transaction = req.query.transaction;
  transaction=transaction.toString()
  console.log("getting graphml for "+transaction)
  var checkForgml = [];
  checkForgml.push(transaction);
  const graphmlcallback = misc_routes.graphmlcallback;
  const find_in_db = helper_functions.find_in_db;
  find_in_db(checkForgml,graphmlcallback,res)
})//end of route
//----------------------------------------------------------------------------------------------------------------------------------------




app.get("/gtdisplayall",function(req,res){ // route that finds all the file names in public pics. could be useful for presentation
  console.log("request to view all static images")
  var lookuppath = "./public/pics"
  fs.readdir(lookuppath, function(err, items) {
      var picArr = items;
      console.log("found "+picArr.length + " images");
      res.render("gtdisplayall.ejs",{
        testORmain,testORmain,
        picArr:picArr
      })
  });
})
////////////////////////////////////////////////////////////////////////////////////

//                          FILE UPLOAD FACILITY


///////////////////////////////////////////////////////////////////////////////////
app.get("/uploadfile",function(req,res){ // serve out page to upload file
  console.log("serving upload page")
  res.render("uploadfile.ejs")
})

app.post("/fileupload",function(req,res){
  console.log("file upload route called")
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    var oldpath = files.filetoupload.path;
    console.log("oldpath is "+oldpath)
    var newpath ="./fileuploads/"+files.filetoupload.name;
    var transactionHash = files.filetoupload.name;
    transactionHash=transactionHash.slice(0,transactionHash.length-5) // file must be named transactionHash.json, removing .json
    console.log("transactionHash is "+transactionHash)
    console.log("newpath is "+newpath)
    fs.rename(oldpath, newpath, function (err) {
      if (err) throw err;
      console.log("now processing file");
      try{
        var static_json = require(newpath); //requiring it
        console.log("loaded static json for "+transactionHash); // can now use static_json as normally geth gained file
        generate_graph_from_static.gen_graph_promise(transactionHash,static_json).then(function(picArr,err){
          console.log("err is "+ err)
          console.log("callback res is "+picArr) // this should be an array
          res.render("fileuploaddisplay.ejs",{
            picArr:picArr
          })
        }) // does this return a promise?
      }
      catch(err){
        console.log("error requiring json "+err)
        res.write("json format not correct, check and try again!")
        res.end()
      }
    });
  });
}) // end of fileupload route


/////////////////////////////////////////////////////////////////////////////////////

//                              per random hash , per a specified depth 0x123...._4
// for further investigation of that crazy transsaction!

//////////////////////////////////////////////////////////////////////////////////

app.get("/depthoftransaction",function(req,res){
  var transaction = req.query.transaction;
  transaction=transaction.toString()
  console.log("depth of transsaction called for "+transaction)
  var depthTransArr =[];
  depthTransArr.push(transaction)
  const find_depth_in_db = helper_functions.find_depth_in_db;
  const single_sigma_callback = sigmajs_routes.single_sigma_callback;
  find_depth_in_db(depthTransArr,single_sigma_callback,res)

})

///new route to delete tranactions from db
app.get("/deleteContractFromDB",function(req,res){
  var deleteTransFromDB = require("./delete_from_db.js")
  //get URL parameters
  var viewContract = req.query.contract; // read in from URL
  viewContract=viewContract.toString();
  var _startBlock = parseInt(req.query.start);
  var _endBlock = parseInt(req.query.end);
  console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%  Delete Request %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
  console.log("want to delete for : "+viewContract+" between "+_startBlock + " and "+_endBlock);
  lookupEtherscan(viewContract,_startBlock,_endBlock).then(function(contractTransList,err){
    if(err){
      console.log("there was an error with etherscan api lookup")
      res.send("etherscan error!!")
    }
    deleteTransFromDB.delete_array_of_trans(contractTransList);
    // find_in_db(contractTransList,callback,res,viewContract,_startBlock.toString(),_endBlock.toString());
    res.send("Delete Request Sent for "+contractTransList)
  })
})
///new route to delete tranactions from db
app.get("/deleteTransactionFromDB",function(req,res){
  var deleteTransFromDB = require("./delete_from_db.js")
  //get URL parameters
  var transaction = req.body.transaction;
  transaction=transaction.toString();
  var contractTransList =[];
  contractTransList.push(transaction);

  console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%  Delete Request %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
  console.log("want to delete tranaction "+ transaction);
  deleteTransFromDB.delete_array_of_trans(contractTransList);
    // find_in_db(contractTransList,callback,res,viewContract,_startBlock.toString(),_endBlock.toString());
  res.send("Delete Request Sent for "+contractTransList)
})




app.listen(3005, function () {
  console.log('Example app listening on port 3001!')
})

function Create2DArray(rows) {
  var arr = [];
  for (var i=0;i<rows;i++) {
    arr[i] = [];
  }
  return arr;
}

var lookupEtherscan = function(viewContract,_startBlock,_endBlock){

    //takes in the contract address, the start block and the end block and
    //returns an array of the transactions that the contract was involved within
    //those blocks
    //function used by /sigmacontract, /gtcontract

  return new Promise(function(resolve,reject){
    if(testORmain=="test"){ // if the test parameter was passed into the program then use a different URL
      var etherscanAPIURL = "http://ropsten.etherscan.io/api"
    }
    else{
      var etherscanAPIURL = 'http://api.etherscan.io/api';
    }
    console.log("etherscanAPIURL is "+etherscanAPIURL);
    const options = {
      method: 'GET',
      uri: etherscanAPIURL,
      qs:{
        module:"account",
        action:"txlist",
        address:viewContract,
        startblock:_startBlock,
        endblock:_endBlock,
        sort:"asc",
        apikey:"Y6CSG72GI246Q4TJXIC2QW9E6ID9G7XBA5" //same apikey for main and testnet
      },
      json: true //essential to getting a usebale result!
    }
    rp(options)
      .then(function (response) {
        // Request was successful, use the response object at will
        var etherscanResponse = response.result;
        var status = response.status;
        console.log("Etherscan status: "+status)
        if(status!=0){// if the status is equal to one
          var contractTransList =[]; // this is the list of transactions that need to be found,
          // given the contract, the starting block and the end block
          etherscanResponse.forEach(function(trans){//for each transaction, push hash to array
            contractTransList.push(trans.hash)
          })
          console.log("contractTransList is :")
          contractTransList.forEach(function(each){
            console.log(each)
          })
          resolve(contractTransList);
        }
        else{// the status was zero!
          console.log("rejecting as no results found")
          reject([]) //returns an empty array!
        }
      })
      .catch(function (err) {
        // Something bad happened, handle the error
        console.log("SERVER ERROR: "+err)
      })
  })
}

//this function will be run for when we are running from the testnet to find the transactions in a block
var getTransactionsFromBlock = function(block){
  var block_result=  web3.eth.getBlock(block);
  // console.log("block_result"+JSON.stringify(block_result))
  return block_result.transactions;
}
function add_blocks_graph_to_db(block_num,num_block){
  graph_gen.gen_graph_promise(block_num,num_block).then(function(res){
    console.log("promise finished");
  })
}
