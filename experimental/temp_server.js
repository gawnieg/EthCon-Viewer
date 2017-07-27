const express = require('express')
const app = express()
const transfinder = require("./all_trans_per_contract.js")
const graph_gen_for_contract = require("./generate_graph_for_contract.js")

//visit http://localhost:7000/contract?contract=0xfbc76d976777c44cd01069664885da3acfad87b2

app.get("/contract",function(req,res){

  var viewContract = req.query.contract; // read in from URL
  var startBlock = parseInt(req.query.start);
  var endBlock = parseInt(req.query.end);
  console.log("checking "+(endBlock-startBlock))
  console.log("want to trans for view: "+viewContract);
  var contractTransList = transfinder.getTransactionsByAccount(viewContract.toString(),startBlock,endBlock)
  console.log("finished getting transactions for that account")
  console.log(contractTransList)
  graph_gen_for_contract.gen_graph_promise(contractTransList)
  res.send("yurt4life")

})

app.listen(7000,function(){
  console.log("now listening on port 7000")
})
