var Web3 = require('web3');
var web3 = new Web3();

module.exports={
  checkTrans: function(_passed_trans,display){
    checkTrans(_passed_trans,display)
  },
  graphmlcallback: function(contractTransList,found_trans,res){
    graphmlcallback(contractTransList,found_trans,res)
  },
  setGethURL: function(input){
    // console.log(input)
    gethURL=input;
    establishGethConnection(gethURL)
  }
}
function establishGethConnection(gethURL){
  console.log("connecting to geth with "+gethURL);
  web3.setProvider(new web3.providers.HttpProvider(gethURL));
  if(web3.isConnected()){
    console.log("connection successful")
  }
}

var checkTrans = function(_passed_trans,display){ //https://stackoverflow.com/questions/34736705/how-to-promisify-this-function-nodejs
  console.log("checkTrans called")
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
              // console.log(trace)
              resolve(trace)
            }
          }
      );
  })
}

var graphmlcallback= function(contractTransList,found_trans,res){//contractTransList will not be used, just there to reuse find_in_db
  //extract graphml from db response found_trans
  var graphmlres=found_trans[0].graphml
  // graphmlres=JSON.stringify(graphmlres)
  console.log("graphml is"+ graphmlres)
  console.log("rendering response");
  res.render("graphmlformat.ejs",{
    graphml: graphmlres
  })
}
