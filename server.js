const express = require('express')
const app = express()
const graph_gen = require("./generate_graph.js")
const db2 = require("./database2.js")
var MongoClient = require('mongodb').MongoClient;
var mp = require('mongodb-promise');
const fs = require("fs")
const transfinder = require("./all_trans_per_contract.js")
const graph_gen_for_contract = require("./generate_graph_for_contract.js")
const rp = require("request-promise")
const bodyParser = require("body-parser")
const async = require('async');
const request = require('request');
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

app.get("/",function(req,res){
  res.render("homepage.ejs")
})



// uses vis.js library
app.get('/api/vis', function(req, res) {
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

// for Viz library - difference in what view it renders
app.get('/api/graphviz', function(req, res) {
  var block_num = req.query.block_num; // read in from URL
  var num_block = req.query.num_block;
  console.log("------------NEW BROWSER REQUEST FOR GRAPHVIZ-------")
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

});//end of express route


app.get('/api/sigma', function(req, res) {
  var block_num = req.query.block_num; // read in from URL
  var num_block = req.query.num_block;
  console.log("-----------NEW BROWSER REQUEST FOR SIGMAJS VIZ-------------")
  console.log("received block_num:" + block_num +" ,num_block:" + num_block);

  /*
  Search for block in database. If it is not there then generate the blocks
  */
  var upper_block_limit = parseInt(block_num) + parseInt(num_block);

  var response_sigma =[]; //making array of objects
  for(var block= parseInt(block_num); block < upper_block_limit; block++){ //move this loop? as cannot set headers after sent
    mp.MongoClient.connect(url)
      .then(function(db){
              return db.collection('test')
                  .then(function(col) {
                      return col.find({block_num : block_num}).toArray()
                          .then(function(items) {
                            if(items.length){
                              console.log("found "+items.length+" items for this block in DB!")
                              for(i=0;i<items.length;i++){
                                if(items[i].sigmaobj!=null){
                                  var r_sigma = items[i].sigmaobj; // no toString needed since this is an object
                                  response_sigma.push(r_sigma);
                                }
                              }
                            db.close()
                            .then(function(){
                              console.log("yurt - this is a promise .then")
                              // console.log(JSON.stringify(response_sigma));
                            })
                            .then(function (){
                                console.log("rendering screen ejs")
                                res.render("sigmaindex.ejs",{
                                  block_num:block_num,
                                  num_block:num_block,
                                  sigmaobj_array:response_sigma
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

//view all trans from that same block
app.get('/api/sigmamult', function(req, res) {
  var block_num = req.query.block_num; // read in from URL
  var num_block = req.query.num_block;
  console.log("-----------NEW BROWSER REQUEST FOR SIGMAJS MULT VIZ-------------")
  console.log("received block_num:" + block_num +" ,num_block:" + num_block);

  var upper_block_limit = parseInt(block_num) + parseInt(num_block);
  var reqBlockArray=[];//array of strings for storing requested block numbers
  for(var b = parseInt(block_num); b < upper_block_limit; b++){
      reqBlockArray.push(b.toString())
  }
  console.log("reqBlockArray lenght is :"+reqBlockArray.length)
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
  // console.log("generateSigmaCombinedObject called!")
  var multiobj={//object to store coagulated results
    nodes:[],
    edges:[]
  };
  //NOTE some ID's are missing since JUMPDEST is missing. must take different approach to lenght
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
  //add one to all of realLenghtOfNodes
  for(var p1=0;p1<realLenghtOfNodes.length;p1++){
    realLenghtOfNodes[p1]=  realLenghtOfNodes[p1]+1;
  }


  for(var i=0;i<items.length;i++){
    //find max value in each r_sigma
    if(items[i].sigmaobj!=null){
      var r_sigma = items[i].sigmaobj; // no toString needed since this is an object
      //for first block just copy over each object
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
        //add length to nodes
        var additional_length_node=0; //this is the offset
        for(var ii=0;ii<i;ii++){ // for the remaining items found in the db
        //  console.log("=items[ii].sigmaobj.nodes.length" +items[ii].sigmaobj.nodes.length)
          // additional_length_node+=items[ii].sigmaobj.nodes.length; // add up all the lenghts of previous and add on. note index i
          // console.log("adding "+realLenghtOfNodes[ii])
          additional_length_node+=realLenghtOfNodes[ii]
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
    console.log("result is "+ res);
  })
}

app.get("/api/graphtools",function(req,res){ // route for graphtools static file generation and display using python graph tools library
  var block_num = req.query.block_num; // read in from URL
  var num_block = req.query.num_block;
  var graph_tools_array=[];//to store results from database
  var graph_tools_str="";
  var num_of_pics_to_render=0; // number of pics that the front end will render
  console.log("-----------NEW BROWSER REQUEST FOR PYTHON GRAPH TOOLS VIZ-------------")
  console.log("received request for block_num:" + block_num +" ,num_block:" + num_block);
  var block_num_int = parseInt(block_num)
  var num_block_int = parseInt(num_block);
  var last_loop_block=block_num_int+num_block_int;
  var last_block_to_search= last_loop_block.toString(); // for use in mongo search
  var first_block_to_search = block_num_int.toString();
  // console.log("first_block_to_search is " + first_block_to_search + " last_block_to_search "+last_block_to_search)

  //generate a list against which to check the db for blocks
  var block_rollcall =[];
  //loop to fill block_rollcall - this is an array of the
  for(var block_present=block_num_int; block_present<=last_block_to_search; block_present++){
    var add_to_rollcall=block_present.toString();
    block_rollcall.push(add_to_rollcall);
  }
  console.log("rollcall is "+block_rollcall)


  mp.MongoClient.connect(url)
    .then(function(db){
            return db.collection('test')
                .then(function(col) {
                    return col.find({block_num : {$gte:first_block_to_search,$lte:last_block_to_search}}).toArray() //search and return blocks within range
                        .then(function(items) {
                          if(items.length){
                            console.log("found "+items.length+" items for this block in DB!")
                            //now check who is absent from the block roll call
                            var need_to_get_blocks=[];
                            var have_these_blocks=[];
                            //firstly form a list of the blocks present in the db search results
                            for(var check_index=0; check_index<items.length; check_index++){
                                // console.log("in the db we have: "+ items[check_index].block_num)
                                have_these_blocks.push(items[check_index].block_num);
                            }
                            // now check which blocks are not in the list
                            Array.prototype.diff = function(a){
                              return this.filter(function(i){
                                return a.indexOf(i)<0;
                              });
                            };
                            need_to_get_blocks = block_rollcall.diff(have_these_blocks);
                            console.log("the need_to_get_blocks array is :"+ need_to_get_blocks);
                            //then go get these blocks
                            for(var need_block=0;need_block<need_to_get_blocks.length;need_block++){
                              var get_this_block = need_to_get_blocks[need_block];
                              console.log("Going off and getting these blocks (server.js) calling add_blocks_graph_to_db for: "+ get_this_block);
                              add_blocks_graph_to_db(get_this_block,1);// 1 is blank does nt matter what
                            }






                            db.close()
                          .then(function(){







                            num_of_pics_to_render = items.length; // this is then passed out to front end
                            var are_all_graph_pics_ready =[]; //array to store graph_gen_perf values, one position in the array for each block
                            //create arrays for storing the color descriptors - these are sent to the python module
                            var graphtools_color=[];
                            var graphtools_label= [];
                            var depth_per_block =[];//array to store the depth per block - to help produce python naming
                            var blocks_with_graphs=[];//array to store blocks that have graphs - also for python naming
                            for(i=0;i<items.length;i++){
                              // console.log("adding "+i +"graph to graph_tools_str");
                              var r = items[i].simpledot;//get simpledot out of it, required for graphtools
                              if(r==null){//if there was no transactions in that graph
                                continue;
                                //should we put num_of_pics_to_render -1 here?
                              }
                              graphtools_color.push(items[i].gtcolor); //fill array with colour
                              graphtools_label.push(items[i].gtlabel);
                              depth_per_block.push(items[i].blockDepth);//fill with block depth
                              blocks_with_graphs.push(items[i].block_num);//if block 100 has ten graphs, it will appear here ten times
                              r=r.toString(); //get to string of simpledot
                              graph_tools_str=  graph_tools_str.concat(r); //instead of array, creating one big file that will be sperated out accordin to dot format in python module!
                              are_all_graph_pics_ready.push(items[i].generated_gt_pic); //see if we need to generate graph with graph tools
                            }
                            var need_to_run_graph_pic_gen =0; // if this is non zero, the graphs will be generated for these blocks
                            //check all values are 1 in the are_all_graph_pics_ready array generated above
                            for(var check_g=0; check_g<are_all_graph_pics_ready.length;check_g++){
                              if(are_all_graph_pics_ready[check_g]!=1){
                                console.log("additional graphs pics need to be generated!");
                                need_to_run_graph_pic_gen=1; // setting variable to true
                              }
                            }

                            console.log("blocks_with_graphs"+blocks_with_graphs)




                            if(need_to_run_graph_pic_gen){ //was !graph_gen_perf
                              console.log("generating file name(s), writing file, sending filename to python graph tools which will generate a pic in /public/pics")
                              /*
                                1. generate name for temp file, this fill has the simpledot's concated
                                2. write file to disk.
                                3. send file name to python, send colours and labels
                                4. wait for python to generate graph_tools graph_tools
                                5. delete temp file

                              */
                              var spawn = require('child_process').spawn,
                                  py    = spawn('python', ['generate_graph_tools_graph.py']);

                              var dotfilepath=block_num.toString(); // for some reason phython is requiring that it be in the same directory
                              // dotfilepath=dotfilepath.concat("_",pic_gen)
                              dotfilepath=dotfilepath.concat(".dot");
                              // var sampledotfile="digraph{\n1\n2\n1 -> 2\n}" //this would be coming from database
                              //write file to disk temporaily.
                              console.log("saving to" + dotfilepath)
                              fs.writeFile(dotfilepath,graph_tools_str, function(err){ //must create a file first
                                if(err){
                                  console.log("there was an error writing to file" + err);
                                }
                                //now send this dot file path to the python module which will make the graph
                                console.log("now writing to python module")
                                console.log("blocks_with_graphs is :"+blocks_with_graphs)
                                py.stdin.write(JSON.stringify(dotfilepath)); //sending data to the python process!
                                py.stdin.write("\n")
                                py.stdin.write(JSON.stringify(graphtools_color)); // sending colours
                                py.stdin.write("\n")
                                py.stdin.write(JSON.stringify(graphtools_label));//sending opcodes
                                py.stdin.write("\n")
                                py.stdin.write(JSON.stringify(depth_per_block)); // to help with naming process
                                py.stdin.write("\n")
                                py.stdin.write(JSON.stringify(blocks_with_graphs)); // to help with naming
                                py.stdin.end();
                              });
                              var dataString=""; //variable to store return from python module
                              py.stdout.on('data', function(data){ // listen for data coming back from python!
                                dataString += data.toString();
                              });

                              py.stdout.on('end', function(){ //pythons stdout has finished - now do stuff
                                console.log(dataString); // print out everything collected from python stdout
                                //now delete temp dot file (with all dot files in it)
                                fs.stat(dotfilepath, function (err, stats) { //check first if there is a dot file
                                  console.log(stats);//here we got all information of file in stats variable
                                  if (err) {
                                      return console.error(err);
                                  }
                                  fs.unlink(dotfilepath,function(err){ //actually deleting comment this functiont to not delete
                                       if(err) return console.log(err);
                                       console.log('file deleted successfully');
                                  });//end unlink
                                });//end file stat
                                //now add the fact that this block has generated a pic to database UPDATE
                                //moving thos to python module to make sure this is done synchrnously
                                mp.MongoClient.connect(url)
                                  .then(function(db){
                                          return db.collection('test')
                                              .then(function(col) {//{block_num :block_num},{$set:{generated_gt_pic:"1"}},{multi:true}
                                                  return col.update({block_num : {$gte:first_block_to_search,$lte:last_block_to_search}},{$set:{generated_gt_pic:"1"}},{multi:true})//{block_num : {$gte:first_block_to_search,$lte:last_block_to_search}}
                                          })
                                })
                                .fail(function(err) {console.log(err)});
                                py.stdout.end();
                              }); // on python 'finish'
                            } //end of if
                          else{ // else if no pics need to be generated
                            console.log("already generated graphs for this block")
                            //would usually render here switched to try loop for blocks
                            console.log("rendering to screen, should show "+num_of_pics_to_render)
                              // console.log("already generated graphs for this block")
                              //insert db query in  here to get transaction hash from block
                            var trans_num =[];
                            mp.MongoClient.connect(url)
                                .then(function(db){
                                        return db.collection('test')
                                            .then(function(col) {
                                                return col.find({block_num : {$gte:first_block_to_search,$lte:last_block_to_search}}).toArray()
                                                    .then(function(items) {
                                                      for(var item_t=0;item_t<items.length;item_t++){
                                                        trans_num.push(items[item_t].transaction_no);
                                                      }
                                                      console.log("found trans_num to be: "+trans_num)
                                                      console.log("block_num:"+block_num)
                                                      res.render("graphtoolsview.ejs",{
                                                        trans_list:trans_num,
                                                        block_num:block_num,
                                                        num_block:num_block,
                                                        num_pics:num_of_pics_to_render
                                                      });
                                                      db.close();
                                                    })
                                        })
                            })
                            .fail(function(err) {console.log(err)});
                          /* render was here */
                          }
                        })//end of .then
                          } //end if results there is from db search
                    //else database search did not find anything
                    else{
                      console.log("found nothing in DB so adding block no. " +" to db ");
                      for(bn=block_num_int;bn<last_block_to_search;bn++){
                          bn=bn.toString()
                          add_blocks_graph_to_db(bn,1);// 1 is blank does nt matter what was block_num as first param
                      }

                      // res.send("The blocks were not in the database, therefore have been fetched from the blockchain, parsed, etc. Please refresh to generate and view the graph tool visualisation");
                      // res.end();
                      res.render("graph_tools_waiting.ejs"); // page that refreshes after 15 seconds
                    }

                })

            })
  })
  .fail(function(err) {console.log(err)});
})//end of express route




app.get("/contract",function(req,res){ //per contract - working and good!

  var viewContract = req.query.contract; // read in from URL
  viewContract=viewContract.toString();
  var _startBlock = parseInt(req.query.start);
  var _endBlock = parseInt(req.query.end);
  console.log("want to trans for view: "+viewContract+" between "+_startBlock + " and "+_endBlock);
  // var contractTransList = transfinder.getTransactionsByAccount(viewContract.toString(),startBlock,endBlock)
  if(testORmain=="test"){
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
    json: true
  }
  rp(options)
    .then(function (response) {
      // Request was successful, use the response object at will
      // console.log(JSON.stringify(response))
      var etherscanResponse = response.result;
      var status = response.status;
      console.log("status"+status)
      if(status){
        var contractTransList =[];
        etherscanResponse.forEach(function(trans){//for each transaction, push hash to array
          contractTransList.push(trans.hash)
        })
        console.log("contractTransList is :")
        contractTransList.forEach(function(each){
          console.log(each)
        })
        find_in_db(contractTransList,callback,res);
      }
      else{
        console.log("SERVER ERROR!!! CANNOT CONNECT TO ETHERSCAN")
      }
    })
    .catch(function (err) {
      // Something bad happened, handle the error
      console.log("SERVER ERROR: "+err)
    })

})




var callback = function(contractTransList,found_trans,res){
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
    var picsToView = [];
    found_trans.forEach(function(index){
      picsToView.push(index.randomHash);
    })
    //now render to screen
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
  mp.MongoClient.connect("mongodb://127.0.0.1:27017/trans")
      .then(function(db){
              return db.collection('test')
                  .then(function(col) {
                      return col.find({transaction_no : {$in: contractTransList}}).toArray()
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



//returns raw geth debug_traceTransaction output, primarly used for debugging
app.get("/checktrans",function(req,res){
  var transaction = req.query.transaction;
  transaction=transaction.toString()
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
app.get("/getmultiblock",function(req,res){ // this only works for mainnet due to http calls only going to etherchain
  var startblock = req.query.startblock;
  var endblock = req.query.endblock;
  console.log("====================\n getmultiblock has been called for \n========================")
  //Find transaction in all of these blocks
  var block_list =[];
  //make list of blocks for which to get the transactions hashes
  for(var b=parseInt(startblock);b<=parseInt(endblock);b++){
    block_list.push(b);
  }
  var urls=constructURLs(block_list);

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
      console.log("pushing "+eachURL)
      urls.push(eachURL);
    })
    return urls;
  }


  var transHashList=[];

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
    console.log("now continuing doing something else")
    find_in_db(transHashList,callback,res);

  });
});//end of route


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
