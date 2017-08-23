const express = require('express')
const app = express()
const graph_gen = require("./generate_graph.js")
const db2 = require("./database2.js")
var MongoClient = require('mongodb').MongoClient;
var mp = require('mongodb-promise');
const fs = require("fs")
var formidable = require('formidable'); //for file uploads
const graph_gen_for_contract = require("./generate_graph_for_contract.js")
const rp = require("request-promise")
const bodyParser = require("body-parser")
const async = require('async');
const request = require('request');
const graph_gen_per_transaction=require("./generate_graph_per_transaction.js")
const generate_graph_from_static = require("./generate_graph_from_upload.js")
var Web3 = require('web3');
var web3 = new Web3();


//var url = "mongodb://localhost:27017/test?socketTimeoutMS=90000";
var url = "mongodb://localhost:27017/test";
var testORmain = ""; //to indicate if it is testnet or main net
app.set('view engine','ejs')
//app.use(express.static('src'))
app.use(express.static(__dirname+'/public'));
app.use(bodyParser.json())
//reading in from commandline

var connectionURL ="http://localhost:8545"; //default
process.argv.forEach(function (val, index, array) {
  if(index ==2 ){
    connectionURL="http://"+val.toString();
  }
  if(index==3){
    testORmain=val.toString();
  }
});
console.log("Geth connection is "+connectionURL)
try{
  web3.setProvider(new web3.providers.HttpProvider(connectionURL));
  if(!web3.isConnected()){
    console.log("Cannot connect to Geth at provided URL");
    process.exit()
  }
  else{//now connect other instances required
    graph_gen.setGethURL(connectionURL);
    graph_gen_for_contract.setGethURL(connectionURL);
  }
}
catch(err){
  console.log("Chucking error for connecting to Geth" +err);
}


// homepage!!!
app.get("/",function(req,res){
  res.render("homepage.ejs")
})



// uses vis.js library
app.get('/vis', function(req, res) {
  var block_num = req.query.block_num; // read in from URL
  var num_block = req.query.num_block;
  console.log("------------NEW BROWSER REQUEST FOR VIS-------")
  console.log("received block_num:" + block_num +" ,num_block:" + num_block);

  /*
  Search for block in database. If it is not there then generate the blocks
  */
  var upper_block_limit = parseInt(block_num) + parseInt(num_block);
  var response_graphviz=[];
  var response_sigma =[]; //making array of objects
  for(var block= parseInt(block_num); block < upper_block_limit; block++){ //move this loop? as cannot set headers after sent
    mp.MongoClient.connect(url)
      .then(function(db){
              return db.collection('test')
                  .then(function(col) {
                      return col.find({block_num : block_num}).toArray()
                          .then(function(items) {
                            if(items.length){
                              console.log("found "+items.length+" graphviz items for this block in DB!")
                              for(i=0;i<items.length;i++){
                                var r = items[i].graph;
                                r=r.toString();
                                response_graphviz.push(r)
                                console.log("typeof r is "+typeof(r))
                              }
                            db.close()
                            .then(function(){
                              console.log("yurt - this is a promise .then")
                            })
                            .then(function (){
                                console.log("rendering screen ejs")
                                res.render("index.ejs",{
                                  block_num:block_num,
                                  num_block:num_block,
                                  graph_formats: response_graphviz
                                });
                            });
                            }
                            else{
                              console.log("found nothing in DB so adding block no. "+block_num +" to db ");
                              //add the specified graphs to the database
                              add_blocks_graph_to_db(block_num,1);// 1 is blank does nt matter what
                            }

                          })

              })
  })
  .fail(function(err) {console.log(err)});
  }

});//end of express route




/////////////////////////////////////////////////////////////////////////////////
                            //new route for graphviz
/////////////////////////////////////////////////////////////////////////////////
app.get("/graphviztransaction",function(req,res){
  var transaction = (req.query.transaction).toString()
  console.log("#######################    GraphViz called for "+ transaction);
  var transArr=[];
  transArr.push(transaction);
  find_in_db(transArr,graphvizCallback,res)
})

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
    found_trans.forEach(function(index){
      var dotFormat = index.graph;
      console.log(dotFormat)
      dotFormat=dotFormat.toString()
      response_graphviz.push(dotFormat);
    })
    //now render to screen
    console.log("rendering screen ejs")
    res.render("viz.ejs",{
      block_num:"1000",
      num_block:"10",
      graph_formats: response_graphviz
    });
  }
}
////////////////////////////////////////////////////////////////////////////////
                                  // end of graphviz route
////////////////////////////////////////////////////////////////////////////////



// for Viz library - difference in what view it renders
app.get('/graphviz', function(req, res) {
  var block_num = req.query.block_num; // read in from URL
  var num_block = req.query.num_block;
  console.log("------------NEW BROWSER REQUEST FOR GRAPHVIZ-------")
  console.log("received block_num:" + block_num +" ,num_block:" + num_block);

  /*
  Search for block in database. If it is not there then generate the blocks
  */
  var upper_block_limit = parseInt(block_num) + parseInt(num_block);
  var response_graphviz=[];
  for(var block= parseInt(block_num); block < upper_block_limit; block++){ //move this loop? as cannot set headers after sent
    mp.MongoClient.connect(url)
      .then(function(db){
              return db.collection('test')
                  .then(function(col) {
                      return col.find({block_num : block_num}).toArray()
                          .then(function(items) {
                            if(items.length){
                              console.log("found "+items.length+" graphviz items for this block in DB!")
                              for(i=0;i<items.length;i++){
                                var r = items[i].graph;
                                r=r.toString();
                                response_graphviz.push(r)
                              }
                            db.close()
                            .then(function(){
                              console.log("yurt - this is a promise .then")
                            })
                            .then(function (){
                                console.log("rendering screen ejs")
                                res.render("viz.ejs",{
                                  block_num:block_num,
                                  num_block:num_block,
                                  graph_formats: response_graphviz
                                });
                            });
                            }
                            else{
                              console.log("found nothing in DB so adding block no. "+block_num +" to db ");
                              //add the specified graphs to the database
                              add_blocks_graph_to_db(block_num,1);// 1 is blank does nt matter what
                            }

                          })

              })
  })
  .fail(function(err) {console.log(err)});
}//end of for loop

});//end of express graphviz route



app.get("/sigmatransaction",function(req,res){
  var transaction = req.query.transaction; // should be one singular transaction
  console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%  sigmatransaction request %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
  console.log("received sigmatransaction request for "+transaction)
  transaction=transaction.toString();
  var transArr =[];
  transArr.push(transaction);
  find_in_db(transArr,single_sigma_callback,res)


})//end of app get sigmatransaction

var single_sigma_callback = function(transArr,found_trans,res){
  //find in db will either find an empty db or the transaction
  var response_sigma=[];
  if(found_trans.length==0){//there was nothing found
    res.send("refresh shortly")
    graph_gen_for_contract.gen_graph_promise(transArr)//this function takes an array
  }
  else{
    //now combine, remember there many be more than one since a transaction has several depth levels
    var multiobj = generateSigmaCombinedObject(found_trans) //think problem here! with a jump edge or something
    res.render("sigmamulti.ejs",{
      num_block:"10000", //dummy values so we can use sigmamulti template
      block_num:"100",
      sigmaobj_multi:multiobj
    })
  }
}


//view all trans from that same block
app.get('/sigmamult', function(req, res) {
  var block_num = req.query.block_num; // read in from URL
  var num_block = req.query.num_block;
  console.log("-----------NEW BROWSER REQUEST FOR SIGMAJS MULT VIZ-------------")
  console.log("received block_num:" + block_num +" ,num_block:" + num_block);

  var upper_block_limit = parseInt(block_num) + parseInt(num_block);
  var reqBlockArray=[];//array of strings for storing requested block numbers
  for(var b = parseInt(block_num); b < upper_block_limit; b++){
      reqBlockArray.push(b.toString())
  }
    mp.MongoClient.connect(url)
      .then(function(db){
              return db.collection('test')
                  .then(function(col) {
                      return col.find({block_num : {$in: reqBlockArray}}).toArray()
                          .then(function(items) {
                            console.log("found "+items.length+" items for this block in DB!")
                            //if we need to get blocks then this if will be true
                            if(items.length<reqBlockArray.length){
                              console.log("but need "+reqBlockArray.length + "blocks")
                              var foundBlocksInDB = [];//to store what is found in db
                              items.forEach(function(block){
                                  foundBlocksInDB.push(block);
                              })
                              db.close().then(sigmaMultiCallback(foundBlocksInDB,reqBlockArray)) // callback that see's which blocks are needed and runs add_blocks_graph_to_db
                              .then(function (){
                                  res.send("refresh page shortly")
                                });
                            }
                            //else if we found enough items in the db
                            else if (items.length>= reqBlockArray.length) {
                              console.log("found sufficient items, gonna coagulate now..")
                              var multiobj = generateSigmaCombinedObject(items)
                              res.render("sigmamulti.ejs",{
                                num_block:num_block,
                                block_num:block_num,
                                sigmaobj_multi:multiobj
                              })
                            }
                            //else items ==null then go away and find each block
                            else{
                              console.log("found nothing in DB so adding block no. "+block_num +" to db ");
                              reqBlockArray.forEach(function(blockn){
                                add_blocks_graph_to_db(blockn,1);// 1 is blank does nt matter what
                              })
                            }
                          })
              })
  })
  .fail(function(err) {console.log(err)});


});//end of express route

var sigmaMultiCallback = function(foundDB, reqBlockArray){
  var found_block_list=[];
  foundDB.forEach(function(block){//get transactions number from each object found
    found_block_list.push(block.block_num);
  })
  Array.prototype.diff = function(a){
    return this.filter(function(i){
      return a.indexOf(i)<0;
    });
  };
  var needToFindTrans=reqBlockArray.diff(found_block_list) //need.diff(haveindb)
  console.log("need to find:" + needToFindTrans)
  needToFindTrans.forEach(function(block){
    add_blocks_graph_to_db(block,1);
  })
}


function generateSigmaCombinedObject(items){
  /*
    this function takes all the items returned from the database and coalates them into one multiobj
    which can be passed to the sigma library on the front end
  */
  var multiobj={//object to store coagulated results
    nodes:[],
    edges:[]
  };
  //NOTE since some ID's are missing since JUMPDEST is missing. must take different approach to lenght
  // to avoid conflict on naming id's
  var realLenghtOfNodes=[];
  for(var rl=0;rl<items.length;rl++){
    realLenghtOfNodes.push(0);//fill with zeroes!
  }
  for(var indexl=0;indexl<items.length;indexl++){ //for each graph passed
    var r_sigma = items[indexl].sigmaobj;
    if(r_sigma!=null){ // if the graph exists
      // console.log("finding real length "+indexl)
      for(var findl=0;findl<r_sigma.nodes.length;findl++){
        var tempnodeobj=parseInt(r_sigma.nodes[findl].id);
        if(tempnodeobj>realLenghtOfNodes[indexl]){
          realLenghtOfNodes[indexl]=tempnodeobj; //set the highest seen to that index in the array
        }
      }
    }
  }
  // console.log("legnth of first array is "+items[0].sigmaobj.nodes.length)
  console.log("realLenghtOfNodes is :"+realLenghtOfNodes)
  //add one to all of realLenghtOfNodes so that none are the same
  for(var p1=0;p1<realLenghtOfNodes.length;p1++){
    realLenghtOfNodes[p1]=  realLenghtOfNodes[p1]+1;
  }
  //now for each item passed, put into multiobj with appropraite index
  for(var i=0;i<items.length;i++){
    //find max value in each r_sigma
    if(items[i].sigmaobj!=null){
      var r_sigma = items[i].sigmaobj; // no toString needed since this is an object
      //for first block just copy over each object to multiobj
      if(i==0){
        for(var i_nodes=0;i_nodes<r_sigma.nodes.length;i_nodes++){
          var tempnodeobj = r_sigma.nodes[i_nodes];
          multiobj.nodes.push(tempnodeobj); // push to combined results object
        }
        for(var i_edges=0;i_edges<r_sigma.edges.length;i_edges++){
          var tempnodeobj=r_sigma.edges[i_edges];
          multiobj.edges.push(tempnodeobj);
        }
      }
      //if second, third fourth,... need to add offset index to each
      if(i>0){
        //add offset length to nodes
        var additional_length_node=0; //this is the offset
        for(var ii=0;ii<i;ii++){ // for the remaining items found in the db
          additional_length_node+=realLenghtOfNodes[ii] // for each of the ones done so far, add onto
        }
        // console.log("additional_length_node on i: "+i+" is "+additional_length_node);
        for(var iii=0; iii<r_sigma.nodes.length;iii++){
          var newnodeid= parseInt(r_sigma.nodes[iii].id) +additional_length_node;
          //r_sigma.nodes[iii].id = newnodeid.toString();
          // console.log("newnodeid is "+ newnodeid)
          //now push to first object
          var oldx = r_sigma.nodes[iii].x;
          var oldy = r_sigma.nodes[iii].y;
          var oldlabel = r_sigma.nodes[iii].label;
          //set colour of each contract differently
          var oldcolor=r_sigma.nodes[iii].color;
          var oldsize = r_sigma.nodes[iii].size;
          multiobj.nodes.push({id: (newnodeid.toString()), x:oldx, y:oldy,label:oldlabel,color:oldcolor,size:oldsize});
        }
        //setting random colours
        var randomColours=[]
        for(var colourIndex=0; colourIndex<=i;colourIndex++){
          var newColour = generateRandomColours()
          randomColours.push(newColour);//get random colour and add to array!
        }
        //now add to each edge additional_length_node and then push to first object
        for(var iiii=0;iiii<r_sigma.edges.length;iiii++){
          var newsource = parseInt(r_sigma.edges[iiii].source)+additional_length_node;
          var newtarget = parseInt(r_sigma.edges[iiii].target)+ additional_length_node;
          var newid = (r_sigma.edges[iiii].id).concat("_",i.toString())
          if(i==1){
            var edgecolour = "rgb(191,65,65)";//red?
          }
          else if(i==2){
            var edgecolour = "rgb(191,182,65)";//gold colour
          }
          else{
            var edgecolour=randomColours[i];//get from array built earlier
            // var edgecolour = "rgb(50,50,30)";//default colour
          }
          multiobj.edges.push({id: newid.toString(),source:newsource.toString(),target:newtarget.toString(),color:edgecolour});
        }
      }
    }
  }
  return multiobj;
}

function generateRandomColours(){
  var rgb1= Math.floor(Math.random()*(255));
  var rgb2= Math.floor(Math.random()*(255));
  var rgb3= Math.floor(Math.random()*(255));
  var edgecolour ="rgb(";
  edgecolour=edgecolour.concat(rgb1.toString(),",",rgb2.toString(),",",rgb1.toString(),")");
  return edgecolour //returns in the form "rgb(x,y,z)"
}

function add_blocks_graph_to_db(block_num,num_block){
  graph_gen.gen_graph_promise(block_num,num_block).then(function(res){
    console.log("promise finished");
  })
}

/////////////////////////////////////////////////////////////////////////////////////////////

//                Sigma js contract view

////////////////////////////////////////////////////////////////////////////////////////////
app.get("/sigmacontract",function(req,res){
  var viewContract = req.query.contract; // read in from URL
  viewContract=viewContract.toString();
  var _startBlock = parseInt(req.query.start);
  var _endBlock = parseInt(req.query.end);
  console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%  Sigma contract view request %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
  console.log("want to trans for view: "+viewContract+" between "+_startBlock + " and "+_endBlock);
  lookupEtherscan(viewContract,_startBlock,_endBlock).then(function(contractTransList,err){
    if(err){
      console.log("there was an error with etherscan api lookup")
      res.send("etherscan error!!")
    }
    find_in_db(contractTransList,sigmacontractCallback,res);
  })
})

var sigmacontractCallback = function(contractTransList,found_trans,res){ // called from find_in_db
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
    needToFindTrans.forEach(function(each){    //printing nicely
      console.log(each)
    })
    graph_gen_per_transaction.gen_graph_promise(needToFindTrans)
  }
  //if all the pictures are in the db
  else{
      console.log("found sufficient items, gonna coagulate now..")
      var multiobj = generateSigmaCombinedObject(found_trans)
      res.render("sigmamulti.ejs",{ //send dummy values
        num_block:100,
        block_num:100,
        sigmaobj_multi:multiobj
      })
    }
}





var lookupEtherscan = function(viewContract,_startBlock,_endBlock){
  /*
    takes in the contract address, the start block and the end block and
    returns an array of the transactions that the contract was involved within
    those blocks
    function used by /sigmacontract, /gtcontract
  */
  return new Promise(function(resolve,reject){
    if(testORmain=="test"){ // if the test parameter was passed into the program then use a different URL
      var etherscanAPIURL = "http://ropsten.etherscan.io/api"
    }
    else{
      var etherscanAPIURL = 'http://api.etherscan.io/api';
    }
    console.log("etherscanAPIURL is "+etherscanAPIURL);
    const options = {
      method: 'GET',
      uri: etherscanAPIURL,
      qs:{
        module:"account",
        action:"txlist",
        address:viewContract,
        startblock:_startBlock,
        endblock:_endBlock,
        sort:"asc",
        apikey:"Y6CSG72GI246Q4TJXIC2QW9E6ID9G7XBA5" //same apikey for main and testnet
      },
      json: true //essential to getting a usebale result!
    }
    rp(options)
      .then(function (response) {
        // Request was successful, use the response object at will
        var etherscanResponse = response.result;
        var status = response.status;
        console.log("Etherscan status: "+status)
        if(status!=0){// if the status is equal to one
          var contractTransList =[]; // this is the list of transactions that need to be found,
          // given the contract, the starting block and the end block
          etherscanResponse.forEach(function(trans){//for each transaction, push hash to array
            contractTransList.push(trans.hash)
          })
          console.log("contractTransList is :")
          contractTransList.forEach(function(each){
            console.log(each)
          })
          resolve(contractTransList);
        }
        else{// the status was zero!
          reject([]) //returns an empty array!
        }
      })
      .catch(function (err) {
        // Something bad happened, handle the error
        console.log("SERVER ERROR: "+err)
      })
  })
}




/////////////////////////////////////////////////////////////////////////////////////////////

//               graph tool contract view

////////////////////////////////////////////////////////////////////////////////////////////
app.get("/gtcontract",function(req,res){
  //graph -tools per contract over a particular num blocks - start to end- working and good!
  // testnet: http://localhost:3005/gtcontract?contract=0x45fcd0d6abfa60031e1cf4148780c227ecb0b531&start=1281186&end=1285969
  // mainnet: http://localhost:3005/gtcontract?contract=0x851b7F3Ab81bd8dF354F0D7640EFcD7288553419&start=3934565&end=3966824
  var viewContract = req.query.contract; // read in from URL
  viewContract=viewContract.toString();
  var _startBlock = parseInt(req.query.start);
  var _endBlock = parseInt(req.query.end);
  console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%  gtcontract request %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
  console.log("want to trans for view: "+viewContract+" between "+_startBlock + " and "+_endBlock);

  lookupEtherscan(viewContract,_startBlock,_endBlock).then(function(contractTransList,err){
    if(err){
      console.log("there was an error with etherscan api lookup")
      res.send("etherscan error!!")
    }
    find_in_db(contractTransList,callback,res);
  })
})




var callback = function(contractTransList,found_trans,res){
  /*
    This function is used by many routes. It is typically called after find_in_db(),
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
      picsToView:picsToView
    });
  }
}

function find_in_db(contractTransList,callback,res){
  /*
    find_in_db checks the mongodb for the tranactions in contractTransList. Of the ones that are present,
    it places them in a list. Then callback is then called!
  */
  // console.log("find in db called with "+contractTransList)
  mp.MongoClient.connect("mongodb://127.0.0.1:27017/trans")
      .then(function(db){
              return db.collection('test')
                  .then(function(col) {
                      return col.find({transaction_no : {$in: contractTransList}}).sort({transaction_no:1,depthLevel:1}).toArray()
                          .then(function(items) {
                              console.log("db replied with "+items.length + "items")
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

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/gttransaction",function(req,res){ //gets the graph-tools representation for one transaction

  var transaction = req.query.transaction;
  transaction=transaction.toString()
  var transArr = [];
  transArr.push(transaction);
  find_in_db(transArr,callback,res);
})




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//returns raw geth debug_traceTransaction output, primarly used for debugging
app.get("/checktrans",function(req,res){
  var transaction = req.query.transaction;
  transaction=transaction.toString()
  console.log("#################\nThe sanity checker has been called for the transaction: \n ########################\n"+transaction)
  checkTrans(transaction).then(function (result) {
    console.log("rendering"+result)
    if(result===undefined){
      result = "result was found to be undefined"
    }
    res.render("checktrans.ejs",{
      traceTrans: result
    })
  }).catch(function (err) {
      console.log("there was an error in the sendAsync function: "+err)
  });
})

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





//_-----------------------------------------------------------------------------------------------------------------------------------
//adding new route to pull graphml format from it, might be overkill
app.get("/getgraphml",function(req,res){
  var transaction = req.query.transaction;
  transaction=transaction.toString()
  console.log("getting graphml for "+transaction)
  var checkForgml = [];
  checkForgml.push(transaction);
  find_in_db(checkForgml,graphmlcallback,res)
})//end of route
//callback function for /getgraphml
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
//----------------------------------------------------------------------------------------------------------------------------------------


//###################################################################
//NEW ROUTE!!
//###################################################################

//this function will be run for when we are running from the testnet to find the transactions in a block
var getTransactionsFromBlock = function(block){
  var block_result=  web3.eth.getBlock(block);
  // console.log("block_result"+JSON.stringify(block_result))
  return block_result.transactions;
}


app.get("/gtgetmultiblock",function(req,renderres){ // this only works for mainnet due to http calls only going to etherchain
  var startblock = req.query.startblock;
  var endblock = req.query.endblock;
  console.log("====================\n getmultiblock has been called for \n========================")
  //Find transaction in all of these blocks
  var block_list =[];
  var transHashList=[];// array to store transaction hashes from each of the blocks!
  //make list of blocks for which to get the transactions hashes
  for(var b=parseInt(startblock);b<=parseInt(endblock);b++){
    block_list.push(b);
  }
  if(testORmain=="test"){ // if it is the testnet that is running, then we have to get transactions from web3
    block_list.forEach(function(each){
      var transperblock=getTransactionsFromBlock(each);//function call to web3.eth.getBlock
      transperblock.forEach(function(trans){
        transHashList.push(trans)
      })
    })
  }
  else{ //otherwise its the mainnet
    var urls=constructURLs(block_list); //construct urls for blocks - this goes to etherchain and gets the transactions from there
  }
  //for request
  function httpGet(url, callback) {
    const options = {
      url :  url,
      json : true
    };
    request(options,
      function(err, res, body) {
        console.log("calling callback")
        callback(err, body);
      }
    );
  }
  function constructURLs(block_list){ // function that builds the etherscan lookup urls from the blocknumbers passed
    var urls =[];
    block_list.forEach(function(bn){
      var eachURL = "https://etherchain.org/api/block/"+bn+"/tx";
      urls.push(eachURL);
    })
    return urls;
  }

  async.map(urls, httpGet, function (err, res){ // this function is the callback to httpGet
    if (err) return console.log(err);
    for(var index=0; index<res.length;index++){
      //now exract data of each
      var data_array = res[index].data;
      for(var dataIndex=0; dataIndex<data_array.length;dataIndex++){
        transHashList.push(data_array[dataIndex].hash.toString());
      }
    }
    console.log("finished http requests")
    console.log("transHashList is :");
    transHashList.forEach(function(each){
      console.log(each)
    })
    find_in_db(transHashList,callback,renderres);
  });
});//end of route

app.get("/gtdisplayall",function(req,res){ // route that finds all the file names in public pics. could be useful for presentation
  console.log("request to view all static images")
  var lookuppath = "./public/pics"
  fs.readdir(lookuppath, function(err, items) {
      var picArr = items;
      console.log("found "+picArr.length + " images");
      res.render("gtdisplayall.ejs",{
        picArr:picArr
      })
  });
})
////////////////////////////////////////////////////////////////////////////////////

//                          FILE UPLOAD FACILITY

///////////////////////////////////////////////////////////////////////////////////
app.get("/uploadfile",function(req,res){ // serve out page to upload file
  console.log("serving upload page")
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write("upload JSON returned from Geth debug.traceTransaction(hash)")
  res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
  res.write('<input type="file" name="filetoupload"><br>');
  res.write('<input type="submit">');
  res.write('</form>');
  return res.end();
})

app.post("/fileupload",function(req,res){
  console.log("file upload route called")
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    var oldpath = files.filetoupload.path;
    console.log("oldpath is "+oldpath)
    var newpath ="./fileuploads/"+files.filetoupload.name;
    var transactionHash = files.filetoupload.name;
    transactionHash=transactionHash.slice(0,transactionHash.length-5) // file must be named transactionHash.json, removing .json
    console.log("transactionHash is "+transactionHash)
    console.log("newpath is "+newpath)
    fs.rename(oldpath, newpath, function (err) {
      if (err) throw err;
      console.log("now processing file");
      try{
        var static_json = require(newpath); //requiring it
        console.log("loaded static json for "+transactionHash); // can now use static_json as normally geth gained file
        generate_graph_from_static.gen_graph_promise(transactionHash,static_json).then(function(picArr,err){
          console.log("yurt callback")
          console.log("err is "+ err)
          console.log("callback res is "+picArr) // this should be an array
          res.render("fileuploaddisplay.ejs",{
            picArr:picArr
          })
        }) // does this return a promise?
      }
      catch(err){
        console.log("error requiring json "+err)
        res.write("json format not correct, check and try again!")
        res.end()
      }
    });
  });
}) // end of fileupload route








app.listen(3005, function () {
  console.log('Example app listening on port 3001!')
})

function Create2DArray(rows) {
  var arr = [];
  for (var i=0;i<rows;i++) {
    arr[i] = [];
  }
  return arr;
}
