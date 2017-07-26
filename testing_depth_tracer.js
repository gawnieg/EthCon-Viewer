// const jsonfile = require("./test_output_bn1315700.json");
const jsonfile = require("./yurt_temp.json");
const mod_json = require("./modify_json_depth.js")
const normal_mod = require("./modify_json.js");

var orig_steps=jsonfile.structLogs;
// var hopefulresult = normal_mod.modify_input(jsonfile);
//
// console.log(JSON.stringify(hopefulresult))
//need 1024 arrays
var TwoDarrayWithDepths = Create2DArray(1025);
var max_depth_seen=0;
var mem_index=1;
//find max depth
var needs_new_mem=[1,2,3,4,5,6,7];
for(index=0;index<orig_steps.length;index++){

  var currentDepth=orig_steps[index].depth;
  if(currentDepth==1 && orig_steps[index].pc ==0){
    console.log("starting!!")
    needs_new_mem[currentDepth]=mem_index;
    orig_steps[index].grapharray = needs_new_mem[currentDepth];
    mem_index++;
  }
  if(index>0){
    // if(Math.abs(orig_steps[index].depth-orig_steps[index-1].depth) == 1){
    //   console.log("Depth is :"+orig_steps[index].depth+ " && pc is: "+ orig_steps[index].pc)
    // }
    var previousDepth = orig_steps[index-1].depth
    //from left to right
    if(currentDepth-previousDepth ==1){
      //should store at
      needs_new_mem[currentDepth]=mem_index
      orig_steps[index].grapharray = needs_new_mem[currentDepth]; // create a field in the json saying where it should be stored
      console.log("LTR should be stored in "+needs_new_mem[currentDepth])
      console.log("printing needs_new_mem array:"+needs_new_mem)
      mem_index++;
    }
    //from right to left
    else if(previousDepth -currentDepth==1){
      console.log("RTL should store in "+ needs_new_mem[currentDepth])
      orig_steps[index].grapharray = needs_new_mem[currentDepth];
      console.log("printing needs_new_mem array:"+needs_new_mem)
    }
    else{
        orig_steps[index].grapharray = orig_steps[index-1].grapharray
    }
  }
}
for(index=0;index<orig_steps.length;index++){
  //now place into 2D array accordinging to grapharray property
  TwoDarrayWithDepths[orig_steps[index].grapharray].push(orig_steps[index])
}



function Create2DArray(rows) {
  var arr = [];

  for (var i=0;i<rows;i++) {
     arr[i] = [];
  }

  return arr;
}

//now check what arrays where populated
var filledlength=0; // variable how long each subarray is
var array_filled_length=0;
for(i=0;i<TwoDarrayWithDepths.length;i++){//for each array in the TwoDarrayWithDepth
  // console.log("checking" + TwoDarrayWithDepths[i].length)
  if(TwoDarrayWithDepths[i].length >0){ // if the subarray is populated
    // console.log(i + " is populated")
    filledlength = TwoDarrayWithDepths[i].length; //get that length of the subarray
    if(filledlength>0){
      array_filled_length++; // increament the number of subarrays
    }
  }
}
//now delete elemets of array that are not needed - unfilled
TwoDarrayWithDepths = TwoDarrayWithDepths.slice(0,array_filled_length+1);
console.log("there are "+ array_filled_length + " depths to this transaction")

console.log(TwoDarrayWithDepths[4]);


// then for each in this array
for(var depth=1;depth<=array_filled_length;depth++){
  console.log("generating graph for " + depth)
  var modified_output=mod_json.modify_diff_depth(TwoDarrayWithDepths[depth]); //TwoDarrayWithDepths[2] for depth==2
}


// console.log(JSON.stringify(TwoDarrayWithDepths[2]));


//   var modified_output=mod_json.modify_diff_depth(TwoDarrayWithDepths[2]); //TwoDarrayWithDepths[2] for depth==2
// console.log(JSON.stringify(modified_output));
