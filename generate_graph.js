/*
Takes in a block number, gets the transaction list, for each transaction:
- gets a traceDebug object from GETH
- sorts the depths into their appropriate array position, by modifying their json
- runs the json modifier on each depth, producing a modified json for each with source and destination for each node/vertice if applicable
- runs each of these modified jsons through a graph format stage, where a format for .dot, graphml, and graph-tools is generated.
Additional formats could also be generated at this point.
- saves the graph format to a database using a promise

THen returns control to the server.js where it was called

//OLD DOCS
Is working dynamiccally, pulling in dynamiccally from GETH but needs working
to get to all trans from block of trans.
pipe the output of this to a .dot for grahviz generation

can use "dot -Tpjg -Gsize=30,4\! -Gdpi=1000 inputfilename.dot -o testnamepic.jpg"
this will generate a very wide png
Note, these settings can be changed in the graphviz_config

can use "dot -Tjpg inputfilename.dot -o testnamepic.jpg"

*/
//will have to change the above file for pulling in data dynamiccally from getTransactionTrace, asynch call from web3

const db2 = require("./database2.js");//second database with promises
const mod_json = require("./modify_json_depth.js")// for different stack depths


Web3 = require("web3");
var web3 = new Web3();

module.exports={
  generate_graph_for_blocks: function(_passed_num_blocks, _passed_block_num){
    return generate_graphs(_passed_num_blocks,_passed_block_num);
  },
  gen_graph_promise: function(_passed_num_blocks, _passed_block_num){
    return gen_graph_prom(_passed_num_blocks, _passed_block_num);
  },
  getTransHash: function(_block, _pos){
    return getTransID(_block, _pos);
  },
  setGethURL: function(input){
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

var trans_list_counter=0;
function getIndex(i){return function(){return i}} //provided for closure, to bind variable to loop

var gen_graph_prom = function(_passed_block_num,_passed_num_blocks){
  return new Promise(function(resolve,reject){
    trans_list_counter=0; //reset trans_list_counter
    var res_str="";// string for storing dot format- MAY NOT be right to place here
    var res_str_gml=""; //for graphml format
    var res_str_dot_no_lbl=""; //experimental for python graph tools

    // now get transactions from web3
    var contracts_trans_list=[];
    var upper_block_limit = parseInt(_passed_block_num) + parseInt(_passed_num_blocks);
    var block =parseInt(_passed_block_num);
    var whole_block = web3.eth.getBlock(block);
    console.log("block transactions list for block "+ block);
    console.log(whole_block.transactions);
    var temp_trans_list=whole_block.transactions;
    // if trans list empty then return
    if(temp_trans_list.length==0){
      console.log("transaction list empty")//
      //put empty graph format in database
      db2.save_to_db(_passed_block_num,contracts_trans_list[0],"no internal transactions in this block");
      return;
    }
    //now check if transaction was an internal transaction
    //if so then add to list
    for(var trans = 0; trans < temp_trans_list.length; trans++){
        var trans_info= web3.eth.getTransaction(temp_trans_list[trans])//get address of transaction
        var dest_address = trans_info.to;//now get destination address of transaction
        console.log("destination address for trans: "+ temp_trans_list[trans]+ " is " +dest_address);
        if(dest_address != null){ // dest address is null when
          if(web3.eth.getCode(dest_address)!=0){ // this will tell if there is code at the desitatoin address
            console.log("INTERNAL TRANS!!!");
            contracts_trans_list.push(temp_trans_list[trans]);
          }
        }
        if(dest_address==null){
          console.log("this is a contract that I have personally deployed!")// unsure if this is true - non contract transaction will return a null value in sendAsync anyway
          contracts_trans_list.push(temp_trans_list[trans]);
        }
    }// end of for loop!

    /*now that we have the list we must now get the traces
    then modify the jsons, then produce the graph outputs and then
    generate the graphs.
    */

    for(var int_trans=0;int_trans<contracts_trans_list.length;int_trans++){
      web3.currentProvider.sendAsync({
        method: "debug_traceTransaction",
        params: [contracts_trans_list[int_trans],{}], // change this line for an individual contract viz
        jsonrpc: "2.0",
        id:"2"},
        function(err,result){
          console.log("got result from geth for that trans");
          if(result.result!=undefined){
            var orig_steps=result.result.structLogs;
            var SINGLE_NODES_OFF = 1;//if we are interested in graphs without single node define SINGLE_NODES_OFF to be true

            //this section seperates the structLogs into their own files according to depth. Depth ==11 does not mean 11 stack files!
            //will be more than 11 array entries for depth ==11 but not definite
            var TwoDarrayWithDepths = Create2DArray(2000);
            //making the array with a loop [1,2,3,4,5 ....2000]
            // array to store what memory array the depth level needs to be stored at
            var needs_new_mem=[];
            for(var newarray_i=0;newarray_i<2000;newarray_i++){
              needs_new_mem.push(newarray_i+1);
            }
            var mem_index=1; //variable to hold global array index for depth tracker
            for(index=0;index<orig_steps.length;index++){
              var currentDepth=orig_steps[index].depth;
              if(currentDepth==1 && orig_steps[index].pc ==0){ // for the very first step, need this as the rest work off the basis of difference between depths
                needs_new_mem[currentDepth]=mem_index;
                orig_steps[index].grapharray = needs_new_mem[currentDepth]; //set field in json to what array it should be put into before modification
                mem_index++; //increament this global array number
              }
              if(index>0){ //for not the first step. First step would cause index-1 to be looked up and this would return undefined
                var previousDepth = orig_steps[index-1].depth
                //from left to right - increasing stack depth
                if(currentDepth-previousDepth ==1){ //if increasing the stack depth then the global incrementer should increase
                  needs_new_mem[currentDepth]=mem_index
                  orig_steps[index].grapharray = needs_new_mem[currentDepth]; // create a field in the json saying where it should be stored
                  mem_index++;
                }
                //from right to left
                else if(previousDepth -currentDepth==1){
                  orig_steps[index].grapharray = needs_new_mem[currentDepth];
                }
                else{
                  orig_steps[index].grapharray = orig_steps[index-1].grapharray
                }
              }
            } // end of json modifying loop
            //now go through the json and extract out into the twodarray
            for(index=0;index<orig_steps.length;index++){
              //now place into 2D array accordinging to grapharray property
              TwoDarrayWithDepths[orig_steps[index].grapharray].push(orig_steps[index])
            }
            //now depth sorter is finished
            //now find which arrays are populated and get rid of the excess
            var filledlength=0; // variable how long each subarray is
            var array_filled_length=0;
            for(i=0;i<TwoDarrayWithDepths.length;i++){
              if(TwoDarrayWithDepths[i].length >0){
                filledlength = TwoDarrayWithDepths[i].length;
                if(filledlength>0){
                  array_filled_length++;
                }
              }
            }
            //now delete elemets of array that are not needed - unfilled
            TwoDarrayWithDepths = TwoDarrayWithDepths.slice(0,array_filled_length+1);
            console.log("there are "+ array_filled_length + " depths to this transaction")
            //then for each in this array
            var num_return=TwoDarrayWithDepths.length-1; // this will be stored into a db to facilitate more accurate naming in the python graph generation module

            //create a 2d array for storing the results from the json modifier
            var TwoDarraymodified = Create2DArray(array_filled_length+1);
            //create another 2d array to hold checklist for single nodes
            var TwoDChecklist = Create2DArray(array_filled_length+1);

            //put results into this array - it is 1 indexed
            for(var depth=1;depth<=array_filled_length;depth++){
              console.log("generating graph format for: " + depth)
              TwoDarraymodified[depth]=mod_json.modify_diff_depth(TwoDarrayWithDepths[depth]); //Modifying JSON!!!

              /*SECTION TO ISOLATE SINGLE NODES!!!
              1/ large array is generated for each step number with 2's in it
              2. each time this step is mentioned, the corresponding position in the array is decremented
              3. if it reaches 0 (more than 2 mentions) it is not a single node and should be included
               */
              //generate large array of 2's
              var checklist= fillArray(2,(TwoDarraymodified[depth].length+1)) //function declared below
              console.log("generating checklist for getting rid of single nodes...")
              //new section to prevent singular nodes from displaying
              for(var step_index=0; step_index<TwoDarraymodified[depth].length;step_index++){ // for each step number in each TwoDarraymodified array
                //for each step if it appears in either
                var this_step = TwoDarraymodified[depth][step_index].step;
                // console.log("regristering "+ this_step)
                //take 1 from checklist
                checklist[this_step]=checklist[this_step]-1; //decrementing one!
                // now if something is leading to/from this node then itll not be a single node
                for(var arg_org_i=0;arg_org_i<TwoDarraymodified[depth][step_index].arg_origins.length; arg_org_i++){
                  var mark_present = TwoDarraymodified[depth][step_index].arg_origins[arg_org_i].step;
                  var mark_present_2 =  TwoDarraymodified[depth][step_index].step;
                  if(mark_present!=undefined){
                    // console.log(mark_present+ " is not a single node!")
                    checklist[mark_present]=checklist[mark_present]-1;
                    checklist[mark_present_2]=checklist[mark_present_2]-1;
                  }
                  else{
                    console.log("something is undefined")
                  }
                }
              }
              TwoDChecklist[depth]=checklist; //assign over value of checklist to a 2d array to hold then so they can be used later on!
            }
            /* end of getting rid of duplicates section */
            //now section to generate various formats for graphs from the modifed json
            const graphFormat = require("./gen_graph_format.js")
            //now loop through various depths
            for(var graph_depth=1; graph_depth<TwoDarraymodified.length;graph_depth++){
              var format =  graphFormat.generateFormat(TwoDarraymodified,graph_depth,1,TwoDChecklist);
              var res_str = format.res_str;
              var res_str_gml=format.res_str_gml;
              var res_str_dot_no_lbl=format.res_str_dot_no_lbl;
              var sigmaobj = format.sigmaobj;
              var graphtools_label=format.graphtools_label;
              var graphtools_color=format.graphtools_color;
              //find transaction ID/hash
              console.log("trans_list_counter: "+trans_list_counter)
              var trans_hash = getTransID(_passed_block_num,trans_list_counter); //why -1??
              //updating trans_list_counter which is a global variable that is sent to find the trans hash
              if(graph_depth==1){
                  if(TwoDarraymodified.length >1)
                    trans_list_counter++;
              }
              //save to db
              console.log("trace found and graph made - attempting to save to db "+int_trans+"block num: "+_passed_block_num); //graph depth is the memory depth
              db2.save_to_db(_passed_block_num,trans_hash,res_str,res_str_gml,sigmaobj,res_str_dot_no_lbl,graphtools_label,graphtools_color,num_return,graph_depth); //passing block number, transaction_no, graph output.
            } //end of for each depth loop
        }//end of if result.result != undefined

         if(result.result==undefined){
            console.log("no trace found but saving placeholder"+contracts_trans_list[int_trans]+"block num: "+_passed_block_num);
            db2.save_to_db(_passed_block_num,contracts_trans_list[int_trans],"bad block!"); //passing block number, transaction_no, graph output.
         }
    }); // end of web aynch send callback

  } // end of for each internal transaction loop
  resolve(res_str);
}//end of return new promise function

); //end of promise function
} // end of gen_graph_prom


//Helper functions
//creates a 2d array!
function Create2DArray(rows) {
  var arr = [];
  for (var i=0;i<rows;i++) {
    arr[i] = [];
  }
  return arr;
}
//constructs an array of all the specified value
function fillArray(value, len) {
  var arr = [];
  for (var i = 0; i < len; i++) {
    arr.push(value);
  }
  return arr;
}
//this function takes in a position within a block and returns the long transaction id
function getTransID(block,pos_in_array){
  var trans_list = web3.eth.getBlock(block);
  trans_list=trans_list.transactions;
  return trans_list[pos_in_array];
}
