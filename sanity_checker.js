var Web3 = require('web3');
var web3 = new Web3();

try{
  web3.setProvider(new web3.providers.HttpProvider('http://146.169.44.231:8545'));
}
catch(err){
console.log("Chucking error" +err);
}
module.exports={
  checkTrans: function(_passed_trans){ // NOTE this is expecting an array!!!
    checkTrans(_passed_trans).then(function (result) {
        console.log("returning to display");
        return result;
    }).catch(function (err) {
        console.log("there was an error in the sendAsync function: "+err)
    });


  }
}



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
