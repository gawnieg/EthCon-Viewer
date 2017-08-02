var Web3 = require('web3');
var web3 = new Web3();
const express = require('express')
const app = express()

try{
  web3.setProvider(new web3.providers.HttpProvider('http://146.169.44.231:8545'));
}
catch(err){
console.log("Chucking error" +err);
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



app.get("/checktrans",function(req,res){
  var transaction = req.query.transaction;
  console.log("#################\nThe sanity checker has been called for the transaction: \n ########################\n"+transaction)
  checkTrans(transaction).then(function (result) {
    console.log("rendering"+result)
    res.render("checktrans.ejs",{
      traceTrans: result
    })
  }).catch(function (err) {
      console.log("there was an error in the sendAsync function: "+err)
  });
})


app.listen(3005, function () {
  console.log('Example app listening on port 3001!')
})
