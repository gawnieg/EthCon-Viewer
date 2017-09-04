module.exports = {
  find_in_db: function(contractTransList,callback,res,_contractName,_numBlocks,_blockNum,_isLabel){
    find_in_db(contractTransList,callback,res,_contractName,_numBlocks,_blockNum,_isLabel);
  },
  find_depth_in_db: function(contractTransList,callback,res){
    find_depth_in_db(contractTransList,callback,res)
  },
  lookupEtherscan :function(viewContract,_startBlock,_endBlock,testORmain){
    lookupEtherscan(viewContract,_startBlock,_endBlock,testORmain)
  },
  httpGet: function(url,callback){
    httpGet(url,callback)
  },
  constructURLs: function(block_list){
    constructURLs(block_list)
  }
}

var mp = require('mongodb-promise');
var MongoClient = require('mongodb').MongoClient;
const async = require('async');
const request = require('request');



var find_in_db = function(contractTransList,callback,res,_contractName,_numBlocks,_blockNum,_isLabel){
  /*
    find_in_db checks the mongodb for the tranactions in contractTransList. Of the ones that are present,
    it places them in a list. Then callback is then called!
  */
  // console.log("find in db called with islabel "+_isLabel)
  mp.MongoClient.connect("mongodb://127.0.0.1:27017/trans")
      .then(function(db){
              return db.collection('test')
                  .then(function(col) {
                      return col.find({transaction_no : {$in: contractTransList}}).sort({transaction_no:1,depthLevel:1}).toArray()
                          .then(function(items) {
                              console.log("db replied with "+items.length + "items")
                              var found_trans =[]
                              items.forEach(function(item){
                                found_trans.push(item);//the whole object
                              })

                              db.close().then(callback(contractTransList,found_trans,res,_contractName,_numBlocks,_blockNum,_isLabel));
                          })
              })
  })
  .fail(function(err) {console.log(err)});
}


function find_depth_in_db(contractTransList,callback,res){
  /*
    find_in_db checks the mongodb for the tranactions in contractTransList. Of the ones that are present,
    it places them in a list. Then callback is then called!
  */
  // console.log("find in db called with "+contractTransList)
  mp.MongoClient.connect("mongodb://127.0.0.1:27017/trans")
      .then(function(db){
              return db.collection('test')
                  .then(function(col) {
                      return col.find({randomHash : {$in: contractTransList}}).sort({transaction_no:1,depthLevel:1}).toArray()
                          .then(function(items) {
                              console.log("db replied with "+items.length + "items")
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

var lookupEtherscan = function(viewContract,_startBlock,_endBlock,testORmain){
  /*
    takes in the contract address, the start block and the end block and
    returns an array of the transactions that the contract was involved within
    those blocks
    function used by /sigmacontract, /gtcontract
  */
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
function constructURLs(block_list){ // function that builds the etherscan lookup urls from the blocknumbers passed
  var urls =[];
  block_list.forEach(function(bn){
    var eachURL = "https://etherchain.org/api/block/"+bn+"/tx";
    console.log("adding url "+eachURL)
    urls.push(eachURL);
  })
  return urls;
}
