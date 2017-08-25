var Web3 = require('web3');
var web3 = new Web3();
var MongoClient = require('mongodb').MongoClient;
var mp = require('mongodb-promise');
var mongoURL = "mongodb://127.0.0.1:27017/largeTransactions"
var mongoCollection = "main" //default to main
var startingBlock;
var endingBlock;

var connectionURL ="http://localhost:8545"; //default
process.argv.forEach(function (val, index, array) {
  if(index ==2 ){
    connectionURL="http://"+val.toString();
  }
  if(index==3){
    mongoCollection=val.toString(); // if test net then test should be passed here
  }
  if(index==4){
    startingBlock = val.toString()
  }
  if(index=5){
    endingBlock=val.toString();
  }
});

web3.setProvider(new web3.providers.HttpProvider(connectionURL));
if(web3.isConnected()){
  console.error("web3 ok")
}

console.log("mongoCollection is "+mongoCollection)
console.log("Finding contract transactions between blocks"
+ startingBlock + " and "+ endingBlock)
for(var blockIndex = parseInt(startingBlock); blockIndex <= parseInt(endingBlock); blockIndex++){
  console.error("Checking block "+blockIndex)
  checkTransactionArray(getBlock(blockIndex))
}



function getBlock(block_num){ // takes block returns transactions array
  var block= web3.eth.getBlock(block_num)
  return block.transactions;
}
function checkTransactionArray(transArr){
  for(var i=0;i<transArr.length; i++){
    var trans = web3.eth.getTransaction(transArr[i])
    var gas = trans.gas;
    var to = trans.to;
    var from = trans.from;
    var block_num = trans.blockNumber;
    var block_hash=trans.blockHash;
    var gasPrice = trans.gasPrice;
    var value = trans.value;
    // console.log("this tranaction has "+ gas + " gas")
    if(gas > 21000){
      console.log(transArr[i] + "\t" + gas + "\t" + block_num)
      console.error(transArr[i])
      // save_trans_to_db(trans,gas,to,from,block_num,block_hash,gasPrice,value)
    }
  }
}



function save_trans_to_db(trans,gas,to,from,block_num,block_hash,gasPrice,value){ //num return is the totatl depth level for that block, _graph_depth is the exact level for that particular graph
mp.MongoClient.connect(mongoURL)
    .then(function(db){
        return db.collection(mongoCollection)
            .then(function(col) {
                return col.insert({transaction_no: trans,
                gas:gas, to:to, from:from, block_num:block_num,gasPrice:gasPrice,
              value:value}) //simple dot saved for graph-tools comptability
                    .then(function(result) {
                        //console.log(result);
                         db.close().then(console.log('save_trans_to_db is a success'));
                    })
            })
})
.fail(function(err) {console.log(err);});
}
