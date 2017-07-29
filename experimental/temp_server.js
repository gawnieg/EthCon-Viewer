const express = require('express')
const app = express()
const transfinder = require("./all_trans_per_contract.js")
const graph_gen_for_contract = require("./generate_graph_for_contract.js")
var MongoClient = require('mongodb').MongoClient;
var mp = require('mongodb-promise');
//visit http://localhost:7000/contract?contract=0xfbc76d976777c44cd01069664885da3acfad87b2

app.set('view engine','ejs')
//app.use(express.static('src'))
app.use(express.static(__dirname+'/public'));


app.get("/contract",function(req,res){

  var viewContract = req.query.contract; // read in from URL
  var startBlock = parseInt(req.query.start);
  var endBlock = parseInt(req.query.end);
  console.log("checking "+(endBlock-startBlock))
  console.log("want to trans for view: "+viewContract);
  var contractTransList = transfinder.getTransactionsByAccount(viewContract.toString(),startBlock,endBlock)
  console.log("finished getting transactions for that account")
  console.log(contractTransList)
  //now check if we need to generate graphs or what?
  // console.log("going to try find "+contractTransList[0])
  // for(var index=0; index<contractTransList.length;index++){
    console.log("quering db")
    find_in_db(contractTransList,callback,res)
  // }

  // res.send("yurt4life")

})





var callback = function(contractTransList,found_trans,res){
  var found_trans_list=[];
  found_trans.forEach(function(trans){//get transactions number from each object found
    found_trans_list.push(trans.transaction_no);
  })
  console.log("Callback: there were: "+found_trans.length + "items found in the db");
  console.log("Callback: we needed "+contractTransList.length+" items..")
  Array.prototype.diff = function(a){
    return this.filter(function(i){
      return a.indexOf(i)<0;
    });
  };
  var needToFindTrans=contractTransList.diff(found_trans_list) //need.diff(haveindb)
  if(needToFindTrans.length){
    console.log("Callback: need to carry out graph gen for these: " +needToFindTrans);
    graph_gen_for_contract.gen_graph_promise(needToFindTrans)
  }
  //if all the pictures are in the db
  else{
    //get pictures random string names
    var picsToView = [];
    found_trans.forEach(function(index){
      picsToView.push(index.randomHash);
    })
    //now render to screen
    console.log("picsToView: "+picsToView)
    res.render("contractView.ejs",{
      picsToView:picsToView
    });
  }


}


app.listen(7000,function(){
  console.log("now listening on port 7000")
})

// // Read all documents
function find_in_db(contractTransList,callback,res){
mp.MongoClient.connect("mongodb://127.0.0.1:27017/trans")
    .then(function(db){
            return db.collection('test')
                .then(function(col) {
                    return col.find({transaction_no : {$in: contractTransList}}).toArray()
                        .then(function(items) {
                            console.log("db replied")
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
