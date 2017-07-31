Web3 = require("web3");
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://146.169.44.231:8545'));
//this is the mainnet
var block = web3.eth.getBlock(4000000);
// console.log("getBlock returns: "+ JSON.stringify(block))
var trans_array=["0xc3b1163ccfc09903309c2474eaedc259554ff3553a4373bce254403080209984",
"0x03a7a5e067ec2a201fa6851173b67eda87d9a53fe2325bbc49b606bf98001698",
"0xa8fa1e81e00fd5c4621589da1191950e74afea5faa56d7ebb8dd0115fe384bc1"]

function getIndex(i){return function(){return i}}



  for(var int_trans=0; int_trans<trans_array.length;int_trans++ ){
    web3call(getIndex(int_trans)())
  }


function web3call (int_trans){
  console.log("web3call")
  web3.currentProvider.sendAsync({
    method: "debug_traceTransaction",
    params: [trans_array[int_trans],{}],  //  see docs, was ->params: ['0x272d5cfed972a35437833802595d170cd6288f2f7393d1d57af1a5955ab1dabf',{}]
    jsonrpc: "2.0",
    id:"2"},
      function(err,result){
        // if(result.r)
        console.log("gas: "+JSON.stringify(result.result.gas)+
        " for int_trans "+int_trans + " transHash "+trans_array[int_trans])

      }
  );
}
