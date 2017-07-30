Web3 = require("web3");
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://146.169.44.231:8545'));
//this is the mainnet
var block = web3.eth.getBlock(4000000);
// console.log("getBlock returns: "+ JSON.stringify(block))
getdata()
function getdata(){
  var daycentres = web3.currentProvider.sendAsync({
    method: "debug_traceTransaction",
    params: ["0x03a7a5e067ec2a201fa6851173b67eda87d9a53fe2325bbc49b606bf98001698",{}],  //  see docs, was ->params: ['0x272d5cfed972a35437833802595d170cd6288f2f7393d1d57af1a5955ab1dabf',{}]
    jsonrpc: "2.0",
    id:"2"},
      function(err,result){
        console.log(JSON.stringify(result.result))
      }
  );

}
