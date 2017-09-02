const helperfunctions = require("./helper_functions.js");
const graph_gen_for_contract = require("./generate_graph_for_contract.js")
const graph_gen_per_transaction=require("./generate_graph_per_transaction.js")
const generate_graph_from_static = require("./generate_graph_from_upload.js")

module.exports ={
  graphvizCallback : function(contractTransList,found_trans,res){
    graphvizCallback(contractTransList,found_trans,res)
  },
  graphvizCallbackEVMInvocation : function(contractTransList,found_trans,res){
    graphvizCallbackEVMInvocation(contractTransList,found_trans,res)
  }
}

var graphvizCallbackEVMInvocation = function(contractTransList,found_trans,res){
  console.log("graphvizCallbackEVMInvocation called")
  var response_graphviz = []; // to store results
  var transArr = [];
  found_trans.forEach(function(index){
    var dotFormat = index.graph;
    console.log(dotFormat)
    transArr.push(index.randomHash)
    dotFormat=dotFormat.toString()
    response_graphviz.push(dotFormat);
  })
  //now render to screen
  console.log("rendering screen ejs")
  console.log("transArr is "+transArr)
  res.render("viz.ejs",{
    transArr:transArr,
    block_num:"1000",
    num_block:"10",
    graph_formats: response_graphviz
  });
}

var graphvizCallback = function(contractTransList,found_trans,res){
  console.log("graphvizCallback called")
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
  else{ // found items in db, now display them
    var response_graphviz = []; // to store results
    var transArr = [];
    found_trans.forEach(function(index){
      var dotFormat = index.graph;
      console.log(dotFormat)
      transArr.push(index.randomHash)
      dotFormat=dotFormat.toString()
      response_graphviz.push(dotFormat);
    })
    //now render to screen
    console.log("rendering screen ejs")
    console.log("transArr is "+transArr)
    res.render("viz.ejs",{
      transArr:transArr,
      block_num:"1000",
      num_block:"10",
      graph_formats: response_graphviz
    });
  }
}
