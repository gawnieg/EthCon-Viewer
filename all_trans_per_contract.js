Web3 = require("web3");
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://146.169.44.231:8545'));


module.exports={
  getTransactionsByAccount: function(myaccount, startBlockNumber, endBlockNumber){
    return getTransactionsByAccount(myaccount, startBlockNumber, endBlockNumber);
  },
  daycentFunction: function(){
    return daycent_function();
  }
}

var getTransactionsByAccount=function(myaccount, startBlockNumber, endBlockNumber) {
  if (endBlockNumber == null) {
    endBlockNumber = web3.eth.blockNumber;
    console.log("Using endBlockNumber: " + endBlockNumber);
  }
  if (startBlockNumber == null) {
    startBlockNumber = endBlockNumber - 1000;
    console.log("Using startBlockNumber: " + startBlockNumber);
  }
  console.log("Searching for transactions to/from account \"" + myaccount + "\" within blocks "  + startBlockNumber + " and " + endBlockNumber);
  var listOfTrans=[];
  for (var i = startBlockNumber; i <= endBlockNumber; i++) {

      console.log("Searching block " + i);

    var block = web3.eth.getBlock(i, true);
    if (block != null && block.transactions != null) {

      block.transactions.forEach( function(e) {
        if (myaccount == "*" || myaccount == e.from || myaccount == e.to) {
          listOfTrans.push(e.hash);
          console.log("found one in this block!")
        //   console.log("  tx hash          : " + e.hash + "\n"
        //     + "   nonce           : " + e.nonce + "\n"
        //     + "   blockHash       : " + e.blockHash + "\n"
        //     + "   blockNumber     : " + e.blockNumber + "\n"
        //     + "   transactionIndex: " + e.transactionIndex + "\n"
        //     + "   from            : " + e.from + "\n"
        //     + "   to              : " + e.to + "\n"
        //     + "   value           : " + e.value + "\n"
        //     + "   time            : " + block.timestamp + " " + new Date(block.timestamp * 1000).toGMTString() + "\n"
        //     + "   gasPrice        : " + e.gasPrice + "\n"
        //     + "   gas             : " + e.gas + "\n"
        //     + "   input           : " + e.input);
        }
      })
    }
  }
  console.log("listOfTrans length is "+ listOfTrans.length)
  return listOfTrans;
}

// getTransactionsByAccount("0xfbc76d976777c44cd01069664885da3acfad87b2",1378304,1380356)
//console.log(result)

var daycent_function = function(){
  console.log("yurt");
}
