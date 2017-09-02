const graph_gen_for_contract = require("./generate_graph_for_contract.js")
testORmain = "";
module.exports={
  callback: function(contractTransList,found_trans,res){
    callback(contractTransList,found_trans,res)
  },
  settestORmain: function(testORmain){
    testORmain=testORmain
  }
}



var callback = function(contractTransList,found_trans,res){
  /*
    This function is used by many graph-tool routes. It is typically called after find_in_db(),
    found_trans is an array of the items returned from mongodb
    contractTransList is the list of transactions that are requested from the brower
    res is the express response
  */
  var found_trans_list=[];
  found_trans.forEach(function(trans){//get transactions number from each object found
    found_trans_list.push(trans.transaction_no);
  })
  console.log("Callback: there were: "+found_trans.length + "items found in the db");
  console.log("Callback: we need a min of "+contractTransList.length+" items..")
  Array.prototype.diff = function(a){
    return this.filter(function(i){
      return a.indexOf(i)<0;
    });
  };
  var needToFindTrans=contractTransList.diff(found_trans_list) //need.diff(haveindb)
  if(needToFindTrans.length){ //if there are ones that need to be generated
    console.log("Callback: need to carry out graph gen for these: ");
    //printing nicely
    needToFindTrans.forEach(function(each){
      console.log(each)
    })
    graph_gen_for_contract.gen_graph_promise(needToFindTrans)
  }
  //if all the pictures are in the db
  else{
    //get pictures random string names
    //randomHash is actually the name of the pciture in public/pics
    var picsToView = [];
    found_trans.forEach(function(index){
      picsToView.push(index.randomHash);
    })
    function uniq(a) {
       return Array.from(new Set(a));
    }

    //now render to screen
    picsToView = uniq(picsToView) //get rid of duplicates happening
    console.log("picsToView: ")
    picsToView.forEach(function(each){
      console.log(each)
    })
    res.render("contractView.ejs",{
      picsToView:picsToView,
      testORmain:testORmain
    });
  }
}
