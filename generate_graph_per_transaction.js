'use strict'
//experimental modified version of graph_gen
//http://localhost:7000/contract?contract=0x88aA042c4AaE423E0F1bb48542b473d1dD20a807&start=4048910&end=4048910



const randomstring =require("randomstring")
const db2 = require("./database2.js");//second database with promises
// const graph_format = require("./generate_graph_format.js") // given a modified trace, generates graphviz format
const mod_json = require("./modify_json_depth.js")// for different stack depths
const fs = require("fs")

var Web3 = require("web3");
var web3 = new Web3();

module.exports={
 gen_graph_promise: function(_passed_trans_list,displayGraphs){ // NOTE this is expecting an array!!!
   return gen_graph_prom(_passed_trans_list,displayGraphs);
 },
 setGethURL: function(input){
   console.log(input)
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



var gen_graph_prom = function(passed_trans_list,displayGraphs){
 return new Promise(function(resolve,reject){
   console.log("will now graph "+passed_trans_list.length+ " transactions");
   var contracts_trans_list=passed_trans_list;
   for(var int_trans=0;int_trans<passed_trans_list.length;int_trans++){
     web3call(getIndex(int_trans)(),passed_trans_list)
   }
   resolve(res_str);
 });
}

function web3call(int_trans, contracts_trans_list){ //int_trans will be bound to this interation thanks to closure
 console.log("web3call for "+contracts_trans_list[int_trans])
  if(!web3.isConnected()){console.log("error! web3 not connected")};
 web3.currentProvider.sendAsync({
     method: "debug_traceTransaction",
     params: [contracts_trans_list[int_trans],{disableStorage: true, disableMemory:true}], // change this line for an individual contract viz
     jsonrpc: "2.0",
     id:"2"},
     function(err,result){
       if(result.result!=undefined && result.result.structLogs.length>0){
         console.log("Was able to get debug.traceTransaction!")
         console.log(JSON.stringify(result.result))
         /*
         1. sort into an array with the appropraite depths
         2. trace and modify json to create json that includes instructions for graph format generator
         3. get rid of single nodes
         4. generate various graph formats
         5. send to python module to generate actual graph tool pics
         6. save to mongodb
         */
         var orig_steps=result.result.structLogs;
         var SINGLE_NODES_OFF = 1;//if we are interested in graphs without single node define SINGLE_NODES_OFF to be true
         //this seperates the structLogs into their own files according to depth. Depth ==11 does not mean 11 stack files!
         //will be more than 11 array entries for depth ==11 but not definite
         var TwoDarrayWithDepths = null;
         try{
           TwoDarrayWithDepths= sortDepth(orig_steps); //refactored so that this sorting into depths is done in a seperate function
         }
         catch(err){
           console.log("error in sorting depth: "+err)
           TwoDarrayWithDepths = null;
         }

         //now depth sorter is finished
         //now find which arrays are populated and get rid of the excess
         var filledlength=0; // variable how long each subarray is
         var array_filled_length=0;
         for(var i=0;i<TwoDarrayWithDepths.length;i++){
           if(TwoDarrayWithDepths[i].length >0){
             filledlength = TwoDarrayWithDepths[i].length;
             if(filledlength>0){
               array_filled_length++;
             }
           }
         }

         //now delete elemets of array that are not needed - unfilled
         TwoDarrayWithDepths = TwoDarrayWithDepths.slice(0,array_filled_length+1);
         console.log("there are "+ array_filled_length + " depths to this transaction"+contracts_trans_list[int_trans])
         //then for each in this array
         var num_return=TwoDarrayWithDepths.length-1; // this will be stored into a db to facilitate more accurate naming in the python graph generation module

         //create a 2d array for storing the results from the json modifier
         var TwoDarraymodified = Create2DArray(array_filled_length+1);
         //create another 2d array to hold checklist for single nodes
         var TwoDChecklist = Create2DArray(array_filled_length+1);

         //put results into this array - it is 1 indexed
         for(var depth=1;depth<=array_filled_length;depth++){
           console.log("generating graph format for depth = : " + depth)
           try{ // new try catch seems to be working! produces blank digraphs!
             TwoDarraymodified[depth]=mod_json.modify_diff_depth(TwoDarrayWithDepths[depth]); //Modifying JSON!!!
           }
           catch(err){
             console.log("error modifying json: "+err)
           }
           //create checklist that will elimminate singular nodes
            TwoDChecklist = isolateSingleNodes(TwoDarraymodified,TwoDChecklist,depth);
         }

         // console.log("TwoDarraymodified (modify_diff_depth output) length" + TwoDarraymodified.length)
         const graphFormat = require("./gen_graph_format.js")
         // for each depth level generate its own graph
         var allGraphsPerTrans =""; // group all simple dot formats for each depth per each transactions and then send this to the python module
         var transHashArray=[]; //to store transHashArray for sending to
         var allColoursPerTrans=[];//to store colourarrays
         var allLabelsPerTrans=[];
         for(var graph_depth=1; graph_depth<TwoDarraymodified.length;graph_depth++){

           var format;
           try{
             format =  graphFormat.generateFormat(TwoDarraymodified,graph_depth,1,TwoDChecklist); //seperate function to loop throuhg and generate formats
           }
           catch(err){
             console.log("error generating graph format!")
             db2.save_trans_to_db(contracts_trans_list[int_trans],
               null,null,null,null,null,null,null,null,null); //passing block number, transaction_no, graph output
             continue;
           }

           //FOR DEBUGGIN!!!
           var lengthOfNodes = format.sigmaobj.nodes.length;//for debugging
           var lengthOfColours = format.graphtools_color.length;
           var lengthOfLabels = format.graphtools_label.length;
           // console.log("lengthOfNodes "+lengthOfNodes);
           // console.log("lengthOfColours "+lengthOfColours);
           // console.log("lengthOfLabels "+lengthOfLabels)

           var res_str = format.res_str;
           var res_str_gml=format.res_str_gml;
           var res_str_dot_no_lbl=format.res_str_dot_no_lbl;

           allGraphsPerTrans=allGraphsPerTrans.concat(res_str_dot_no_lbl);
           var tempname= contracts_trans_list[int_trans].toString();
           tempname=tempname.concat("_");
           tempname=tempname.concat(graph_depth);
           transHashArray.push(tempname)

           var sigmaobj = format.sigmaobj;
           var graphtools_label=format.graphtools_label;
           allLabelsPerTrans.push(graphtools_label)
           var graphtools_color=format.graphtools_color;
           allColoursPerTrans.push(graphtools_color);
           console.log("trace found and graph made ...now going to make graph tools pic")

           //save to db
           db2.save_trans_to_db(contracts_trans_list[int_trans],
             res_str,res_str_gml,
             sigmaobj,
             res_str_dot_no_lbl,
             graphtools_label,
             graphtools_color,
             num_return,
             graph_depth,
             tempname); //passing block number, transaction_no, graph output

             console.log(res_str_dot_no_lbl); // added for debgging graph tool colours
             // console.log(graphtools_color)
             // console.log(graphtools_label)

         } //end of for each depth loop
     }//end of if result.result != undefined

    if(result.result==undefined||result.result.structLogs.length==0){
       console.log("no trace found but saving placeholder");
       db2.save_trans_to_db(contracts_trans_list[int_trans],"bad block!"); //passing block number, transaction_no, graph output.
    }
 }); // end of web aynch send callback
}


function sortDepth(orig_steps){
 /*
   needs_new_mem=[1,2,3,4,5,6,....]
   mem_index=1
   forEach step in structLogs
     currentDepth = structLogs[step].depth
     previousDepth = structLogs[step-1].depth
     if(currentDepth-previousDepth==1)
       needs_new_mem[currentDepth]=mem_index
       structLogs[index]graphArray=mem_index
       mem_index++
     elseif(previousDepth-currentDepth==1)
       structLogs[index].graphArray=mem_index
     else:
       structLogs[index].graphArray=structLogs[index-1].graphArray
 */
 var TwoDarrayWithDepths = Create2DArray(2000);
 //making the array with a loop [1,2,3,4,5 ....2000]
 // array to store what memory array the depth level needs to be stored at
 var needs_new_mem=[];
 for(var newarray_i=0;newarray_i<2000;newarray_i++){
   needs_new_mem.push(newarray_i+1);
 }
 var mem_index=1; //variable to hold global array index for depth tracker

 for(var index=0;index<orig_steps.length;index++){
   var currentDepth=orig_steps[index].depth;
   if(currentDepth==1 && orig_steps[index].pc ==0){ // for the very first step, need this as the rest work off the basis of difference between depths
     // console.log("starting!!")
     needs_new_mem[currentDepth]=mem_index;
     orig_steps[index].grapharray = needs_new_mem[currentDepth]; //set field in json to what array it should be put into before modification
     mem_index++; //increament this global array number
   }
   if(index>0){ //for not the first step. First step would cause index-1 to be looked up and this would return undefined
     // if(Math.abs(orig_steps[index].depth-orig_steps[index-1].depth) == 1){
     //   console.log("Depth is :"+orig_steps[index].depth+ " && pc is: "+ orig_steps[index].pc)
     // }
     var previousDepth = orig_steps[index-1].depth
     //from left to right - increasing stack depth
     if(currentDepth-previousDepth ==1){ //if increasing the stack depth then the global incrementer should increase
       //should store at
       needs_new_mem[currentDepth]=mem_index
       orig_steps[index].grapharray = needs_new_mem[currentDepth]; // create a field in the json saying where it should be stored
       // console.log("LTR should be stored in "+needs_new_mem[currentDepth])
       // console.log("printing needs_new_mem array:"+needs_new_mem)
       mem_index++;
     }
     //from right to left
     else if(previousDepth -currentDepth==1){
       // console.log("RTL should store in "+ needs_new_mem[currentDepth])
       orig_steps[index].grapharray = needs_new_mem[currentDepth];
       // console.log("printing needs_new_mem array:"+needs_new_mem)
     }
     else{
         orig_steps[index].grapharray = orig_steps[index-1].grapharray
     }
   }
 }
 //now go through the json and extract out into teh twodarray
 for(index=0;index<orig_steps.length;index++){
   //now place into 2D array accordinging to grapharray property
   TwoDarrayWithDepths[orig_steps[index].grapharray].push(orig_steps[index])
 }
 return TwoDarrayWithDepths;
}



function isolateSingleNodes(TwoDarraymodified,TwoDChecklist,depth){
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
 return TwoDChecklist;
}

function getIndex(i){return function(){return i}} //provided for closure, to bind variable to loop
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
