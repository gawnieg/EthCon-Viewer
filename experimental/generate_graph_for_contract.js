
//experimental modified version of graph_gen


const db2 = require("../database2.js");//second database with promises
// const graph_format = require("./generate_graph_format.js") // given a modified trace, generates graphviz format
const mod_json = require("../modify_json_depth.js")// for different stack depths


Web3 = require("web3");
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://146.169.44.231:8545'));

var transHash = [];
module.exports={

  gen_graph_promise: function(_passed_trans_list){ // NOTE this is expecting an array!!!
    transHash=[];
    for(var lst_i=0; lst_i<parseInt(_passed_trans_list.length); lst_i++){
      transHash.push(_passed_trans_list[lst_i]);
    }
    return gen_graph_prom(_passed_trans_list);
  }

}

var trans_list_counter=0;


var gen_graph_prom = function(passed_trans_list){
  return new Promise(function(resolve,reject){
    trans_list_counter=0; //reset trans_list_counter
    var res_str="";// string for storing dot format- MAY NOT be right to place here
    var res_str_gml=""; //for graphml format
    var res_str_dot_no_lbl=""; //experimental for python graph tools
    console.log("will now graph "+passed_trans_list.length+ " transactions");
    var contracts_trans_list=passed_trans_list;

    for(var int_trans=0;int_trans<passed_trans_list.length;int_trans++){
      web3.currentProvider.sendAsync({
        method: "debug_traceTransaction",
        params: [contracts_trans_list[int_trans],{}], // change this line for an individual contract viz
        jsonrpc: "2.0",
        id:"2"},
        function(err,result){
          // console.log("result is "+JSON.stringify(result))//temp

          console.log("got result from geth for that trans "+passed_trans_list[int_trans]);
          if(result.result!=undefined){
                /* start of new section to deal with multi depth trans*/
            var orig_steps=result.result.structLogs;
              //if we are interested in graphs without single node define SINGLE_NODES_OFF to be true
              var SINGLE_NODES_OFF = 1;


            //this seperates the structLogs into their own files according to depth. Depth ==11 does not mean 11 stack files!
            //will be more than 11 array entries for depth ==11 but not definite
            //third effort 20.07.17
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
            //now depth sorter is finished
            //now find which arrays are populated and get rid of the excess
            var filledlength=0; // variable how long each subarray is
            var array_filled_length=0;
            for(i=0;i<TwoDarrayWithDepths.length;i++){

              if(TwoDarrayWithDepths[i].length >0){
                // console.log(i + " is populated")
                console.log("checking TwoDarrayDepth["+ i +"]" + TwoDarrayWithDepths[i].length)
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
            //printing for debugging
            // for(var print_i=0; print_i<checklist.length;print_i++){
            //   console.log(print_i + ": gives "+ checklist[print_i])
            // }

            console.log("TwoDarraymodified (modify_diff_depth output) length" + TwoDarraymodified.length)
            /* end of getting rid of duplicates section */

            /* new loop for depth>1 */
            for(var graph_depth=1; graph_depth<TwoDarraymodified.length;graph_depth++){
              var graphtools_color = []; // for storing label and color for graph tools. this is saved to db
              var graphtools_label =[];
              res_str = ""; // reset at the start!!
              // res_str = graph_format.generate_graph_format(output);  // get graphviz formatted output
              res_str_gml="";
              var sigmaobj={
                "edges":[],
                "nodes":[]
              }

              res_str_dot_no_lbl=""; // this holds format for graph tools

              var prefix = "\`digraph{";
              var suffix = "}\`\n";
              var newline = '\n';
              //require("./graphviz_config.js"); //pull in settings for graph
              //console.log(prefix); //print prefix - start of graph format

              //graphml formatting
              res_str_gml=res_str_gml.concat("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
              res_str_gml=res_str_gml.concat("<graphml xmlns=\"http://grapml.graphdrawing.org/xmlns\"\n");
              res_str_gml=res_str_gml.concat("xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"\n");
              res_str_gml=res_str_gml.concat("xsi:schemaLocation=\"http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd\">\n");
              res_str_gml=res_str_gml.concat("<graph id=\"G\" edgedefault=\"undirected\">\n");


              res_str=res_str.concat(prefix);
              res_str=res_str.concat(newline);

              res_str_dot_no_lbl=res_str_dot_no_lbl.concat("digraph{");
              res_str_dot_no_lbl=res_str_dot_no_lbl.concat(newline);

              // console.log("edge[color=antiquewhite]");//set array colour
              res_str=res_str.concat("edge[color=antiquewhite] ");
              res_str=res_str.concat(newline);
              // console.log("bgcolor=black") //set background color
              res_str=res_str.concat("bgcolor=black");
              res_str=res_str.concat(newline);

              // var logs = output; //legacy
              var logs= TwoDarraymodified[graph_depth]; // new line, used to be the above
              for(var x=0;x<logs.length;x++){
                // if(logs[x].depth != 1){continue;} //critical for multidepth - comment back in to revert
                //if we are interested in graphs without single node define SINGLE_NODES_OFF to be true
                var opcode = logs[x].op;

                if(SINGLE_NODES_OFF){
                  if(TwoDChecklist[graph_depth][x] >=1){
                    console.log("single (Unconnected) node "+logs[x].step+" which is a "+logs[x].op+"...skipping!")
                    continue;
                  }
                }


                switch(opcode){
                  case "SWAP0":
                  continue;
                  case "SWAP1":
                  continue;
                  case "SWAP2":
                  continue;
                  case "SWAP3":
                  continue;
                  case "SWAP4":
                  continue;
                  case "SWAP5":
                  continue;
                  case "SWAP6":
                  continue;
                  case "SWAP7":
                  continue;
                  case "SWAP8":
                  continue;
                  case "SWAP9":
                  continue;
                  case "SWAP0":
                  continue;
                  case "DUP0":
                  continue;
                  case "DUP1":
                  continue;
                  case "DUP2":
                  continue;
                  case "DUP3":
                  continue;
                  case "DUP4":
                  continue;
                  case "DUP5":
                  continue;
                  case "DUP6":
                  continue;
                  case "DUP7":
                  continue;
                  case "DUP8":
                  continue;
                  case "DUP9":
                  continue;
                  }
                //lookup colour in array
                var colour = logs[x].colour;

                graphtools_label.push(opcode);
                var colour_array = ["aliceblue", "antiquewhite", 	"antiquewhite1","antiquewhite2", 	"antiquewhite3",
                  "antiquewhite4","aquamarine","aquamarine1","aquamarine2","aquamarine3",
                  "aquamarine4", 	"azure", 	"azure1" ,"azure2", 	"azure3",
                  "azure4",
                  "beige",
                  "bisque",
                  "bisque1",
                  "bisque2",
                  "bisque3" ,
                  "bisque4",
                  "black ",
                  "blanchedalmond ",
                  "blue ",
                  "blue1 ",
                  "blue2 ",
                  "blue3 	",
                  "blue4",
                  "blueviolet",
                  "brown",
                  "brown1",
                  "brown2",
                  "brown3",
                  "brown4",
                  "burlywood",
                  "burlywood1",
                  "burlywood2",
                  "burlywood3",
                  "burlywood4",
                  "cadetblue",
                  "cadetblue1",
                  "cadetblue2",
                  "cadetblue3",
                  "cadetblue4",
                  "chartreuse",
                  "chartreuse1",
                  "chartreuse2",
                  "chartreuse3",
                  "chartreuse4",
                  "chocolate",
                  "chocolate1",
                  "chocolate2",
                  "chocolate3",
                  "chocolate4",
                  "coral ",
                  "coral1 ",
                  "coral2 ",
                  "coral3 ",
                  "coral4",
                  "cornflowerblue ",
                  "cornsilk ",
                  "cornsilk1 	",
                  "cornsilk2 ",
                  "cornsilk3",
                  "cornsilk4",
                  "crimson ",
                  "cyan",
                  "cyan1",
                  "cyan2",
                  "cyan3",
                  "cyan4",
                  "darkgoldenrod",
                  "darkgoldenrod1",
                  "darkgoldenrod2",
                  "darkgoldenrod3",
                  "darkgoldenrod4",
                  "darkgreen",
                  "darkkhaki",
                  "darkolivegreen",
                  "darkolivegreen1",
                  "darkolivegreen2",
                  "darkolivegreen3",
                  "darkolivegreen4",
                  "darkorange",
                  "darkorange1",
                  "darkorange2",
                  "darkorange3",
                  "darkorange4",
                  "darkorchid",
                  "darkorchid1",
                  "darkorchid2",
                  "darkorchid3",
                  "darkorchid4",
                  "darksalmon",
                  "darkseagreen",
                  "darkseagreen1",
                  "darkseagreen2",
                  "darkseagreen3",
                  "darkseagreen4",
                  "darkslateblue",
                  "darkslategray",
                  "darkslategray1",
                  "darkslategray2",
                  "darkslategray3",
                  "darkslategray4",
                  "darkslategrey",
                  "darkturquoise",
                  "darkviolet",
                  "deeppink",
                  "deeppink1",
                  "deeppink2",
                  "deeppink3",
                  "deeppink4",
                  "deepskyblue",

                  "deepskyblue1",
                  "deepskyblue2",
                  "deepskyblue3",
                  "deepskyblue4",
                  "dimgray",
                  "dimgrey",
                  "dodgerblue",
                  "dodgerblue1",
                  "dodgerblue2",
                  "dodgerblue3",
                  "dodgerblue4",
                  "firebrick",
                  "firebrick1",
                  "firebrick2",
                  "firebrick3",
                  "firebrick4",
                  "floralwhite",
                  "forestgreen",
                  "gainsboro",
                  "ghostwhite",

                  "gold",
                  "gold1",
                  "gold2",
                  "gold3",
                  "gold4",
                  "goldenrod",
                  "goldenrod1",
                  "goldenrod2",
                  "goldenrod3",
                  "goldenrod4","yellow","hotpink","peru","magenta"];

                var color_string = colour_array[colour];


                var sigma_colour_array=["#f0f8ff",
                  "#faebd7",
                  "#ffefdb",
                  "#eedfcc",
                  "#cdc0b0",
                  "#8b8378",
                  "#7fffd4",
                  "#7fffd4",
                  "#76eec6",
                  "#66cdaa",
                  "#458b74",
                  "#f0ffff",
                  "#f0ffff",
                  "#e0eeee",
                  "#c1cdcd",
                  "#838b8b",
                  "#f5f5dc",
                  "#ffe4c4",
                  "#ffe4c4",
                  "#eed5b7",
                  "#cdb79e",
                  "#8b7d6b",
                  "#000000",
                  "#ffebcd",
                  "#0000ff",
                  "#0000ff",
                  "#0000ee",
                  "#0000cd",
                  "#00008b",
                  "#8a2be2",
                  "#a52a2a",
                  "#ff4040",
                  "#ee3b3b",
                  "#cd3333",
                  "#8b2323",
                  "#deb887",
                  "#ffd39b",
                  "#eec591",
                  "#cdaa7d",
                  "#8b7355",
                  "#5f9ea0",
                  "#98f5ff",
                  "#8ee5ee",
                  "#7ac5cd",
                  "#53868b",
                  "#7fff00",
                  "#7fff00",
                  "#76ee00",
                  "#66cd00",
                  "#458b00",
                  "#d2691e",
                  "#ff7f24",
                  "#ee7621",
                  "#cd661d",
                  "#8b4513",
                  "#ff7f50",
                  "#ff7256",
                  "#ee6a50",
                  "#cd5b45",
                  "#8b3e2f",
                  "#6495ed",
                  "#fff8dc",
                  "#fff8dc",
                  "#eee8cd",
                  "#cdc8b1",
                  "#8b8878",
                  "#dc143c",
                  "#00ffff",
                  "#00ffff",
                  "#00eeee",
                  "#00cdcd",
                  "#008b8b",
                  "#b8860b",
                  "#ffb90f",
                  "#eead0e",
                  "#cd950c",
                  "#8b6508",
                  "#006400",
                  "#bdb76b",
                  "#556b2f",
                  "#caff70",
                  "#bcee68",
                  "#a2cd5a",
                  "#6e8b3d",
                  "#ff8c00",
                  "#ff7f00",
                  "#ee7600",
                  "#cd6600",
                  "#8b4500",
                  "#9932cc",
                  "#bf3eff",
                  "#b23aee",
                  "#9a32cd",
                  "#68228b",
                  "#e9967a",
                  "#8fbc8f",
                  "#c1ffc1",
                  "#b4eeb4",
                  "#9bcd9b",
                  "#698b69",
                  "#483d8b",
                  "#2f4f4f",
                  "#97ffff",
                  "#8deeee",
                  "#79cdcd",
                  "#528b8b",
                  "#2f4f4f",
                  "#00ced1",
                  "#9400d3",
                  "#ff1493",
                  "#ff1493",
                  "#ee1289",
                  "#cd1076",
                  "#8b0a50",
                  "#00bfff",
                  "#00bfff",
                  "#00b2ee",
                  "#009acd",
                  "#00688b",
                  "#696969",
                  "#696969",
                  "#1e90ff",
                  "#1e90ff",
                  "#1c86ee",
                  "#1874cd",
                  "#104e8b",
                  "#b22222",
                  "#ff3030",
                  "#ee2c2c",
                  "#cd2626",
                  "#8b1a1a",
                  "#fffaf0",
                  "#228b22",
                  "#dcdcdc",
                  "#f8f8ff",
                  "#ffd700",
                  "#ffd700",
                  "#eec900",
                  "#cdad00",
                  "#8b7500",
                  "#daa520",
                  "#ffc125",
                  "#eeb422",
                  "#cd9b1d",
                  "#8b6914",
                  "#c0c0c0",
                  "#000000",
                  "#030303",
                  "#1a1a1a",
                  "#ffffff"];
                //if the colour for the particular opcode is not defined then do:
                var color_string_sigma=sigma_colour_array[colour];
                graphtools_color.push(color_string_sigma); //graph tools understands hex


                if(typeof(logs[x].colour)!==undefined){
                  //console.log(logs[x].step +" [label=\""+logs[x].op+"\", style=filled, color=" + color_string+"]"); // kept for legacy, incase of needing to pipe
                  res_str=res_str.concat(logs[x].step);
                  res_str=res_str.concat(" [label=\"");
                  res_str=res_str.concat(logs[x].op);
                  res_str=res_str.concat("\", style=filled, color=");
                  res_str=res_str.concat(color_string);
                  res_str=res_str.concat("]");
                  res_str=res_str.concat("\n");
                  //modifed graph tools format
                  res_str_dot_no_lbl=res_str_dot_no_lbl.concat(logs[x].step);
                  res_str_dot_no_lbl=res_str_dot_no_lbl.concat(newline);
                  //graphml format
                  res_str_gml=res_str_gml.concat("<node id=\"");
                  res_str_gml=res_str_gml.concat(logs[x].step);
                  res_str_gml=res_str_gml.concat("\"/>\n");
                  //sigmaobj format
                  var x_coord = Math.floor((Math.random() * 100) + 1);//randomly generate coordinates for starting position
                  var y_coord =Math.floor((Math.random() * 100) + 1);
                  //section to find what colour the nodes should be - should be according to opcode, that gives an index number for graphviz
                  var labelplusstep=(logs[x].op).concat(" ",logs[x].step)

                  sigmaobj.nodes.push({"id":(logs[x].step).toString(),"x": x_coord, "y":y_coord,"label": labelplusstep, "color":color_string_sigma, "size":10 });
                }
                //if the colour has been defined (in modify json) then do:
                else{
                  //  console.log(logs[x].step +" [label=\""+logs[x].op+"\"]"); // kept for legacy, incase of needing to pipe
                  res_str=res_str.concat(logs[x].step);
                  res_str=res_str.concat(" [label=\"");
                  res_str=res_str.concat(logs[x].op);
                  res_str=res_str.concat("\"]");
                  res_str=res_str.concat("\n");
                  //modifed graph tools format
                  res_str_dot_no_lbl=res_str_dot_no_lbl.concat(logs[x].step);
                  res_str_dot_no_lbl=res_str_dot_no_lbl.concat(newline);
                  //graphml format
                  res_str_gml=res_str_gml.concat("<node id=");
                  res_str_gml=res_str_gml.concat(logs[x].step);
                  res_str_gml=res_str_gml.concat("\"/>\n");
                  //sigmaobj format
                  var x_coord = Math.floor((Math.random() * 100) + 1);
                  var y_coord =Math.floor((Math.random() * 100) + 1);
                  var labelplusstep=(logs[x].op).concat(" ",logs[x].step) //was just logs[x].op
                  sigmaobj.nodes.push({"id":(logs[x].step).toString(),"x": x_coord, "y":y_coord,"label": labelplusstep, "color":"rgb(90,90,90)", "size":10 });
                }
                //now do edges!!!
                var l = logs[x].arg_origins.length;
                for(var y=0;y<l;y++){
                  // console.log(logs[x].arg_origins[y].step + " -> " + logs[x].step + " [label=\""+logs[x].arg_origins[y].value+"\", fontcolor=antiquewhite]");
                  res_str=res_str.concat(logs[x].arg_origins[y].step);
                  res_str=res_str.concat(" -> ");
                  res_str=res_str.concat(logs[x].step);
                  res_str=res_str.concat(" [label=\"");
                  var hexstr="0x";
                  var short_label = logs[x].arg_origins[y].value;
                  short_label=short_label.replace(/^[0]+/g,"");//getting rid of leading zeroes
                  hexstr=hexstr.concat(short_label);
                  // res_str=res_str.concat(logs[x].arg_origins[y].value); //commented out in favour of the short_label
                  res_str=res_str.concat(hexstr);
                  res_str=res_str.concat("\", fontcolor=antiquewhite]");
                  res_str=res_str.concat("\n");
                  //modifed graph tools format
                  res_str_dot_no_lbl=res_str_dot_no_lbl.concat(logs[x].arg_origins[y].step);
                  res_str_dot_no_lbl=res_str_dot_no_lbl.concat(" -> ");
                  res_str_dot_no_lbl=res_str_dot_no_lbl.concat(logs[x].step);
                  res_str_dot_no_lbl=res_str_dot_no_lbl.concat("\n");
                  //graphml format
                  res_str_gml=res_str_gml.concat("<edge source=\"");
                  res_str_gml=res_str_gml.concat(logs[x].arg_origins[y].step);
                  res_str_gml=res_str_gml.concat("\" target=\"");
                  res_str_gml=res_str_gml.concat(logs[x].step);
                  res_str_gml=res_str_gml.concat("\"/>\n");
                  //sigmaobj format
                  var sigma_edge_index = x.toString(); //think about this, need a unique string, coming from and going to combined is unique
                  sigma_edge_index=sigma_edge_index.concat("to");
                  sigma_edge_index=sigma_edge_index.concat((y.toString()))
                  sigmaobj.edges.push({"id":sigma_edge_index, "source":(logs[x].arg_origins[y].step).toString(), "target":(logs[x].step).toString(),"color":"#006666"});
                }
            }
            //console.log(suffix); //finish graphviz format
            res_str=res_str.concat(suffix);
            res_str=res_str.concat("\n");
            //finish graphml format
            res_str_gml=res_str_gml.concat("</graph>\n");
            res_str_gml=res_str_gml.concat("</graphml>\n");
            //simple dot
            res_str_dot_no_lbl=res_str_dot_no_lbl.concat("}\n");
            res_str_dot_no_lbl=res_str_dot_no_lbl.concat(newline);
            //find transaction ID/hash
            console.log("trans_list_counter: "+trans_list_counter)

            // var trans_hash = getTransID(_passed_block_num,trans_list_counter); //why -1??
            var trans_hash = transHash[trans_list_counter]//-1 as int_trans is 1 indexed
            //console.log("int_trans is "+ int_trans)
            console.log("transHash is "+transHash)
            console.log("trans_hash is "+trans_hash)
            //updating trans_list_counter which is a global variable that is sent to find the trans hash
            if(graph_depth==1){
                if(TwoDarraymodified.length >1)
                  trans_list_counter++;
            }
            //save to db
            console.log("trace found and graph made"); //graph depth is the memory depth
            db2.save_trans_to_db(trans_hash,res_str,res_str_gml,sigmaobj,res_str_dot_no_lbl,graphtools_label,graphtools_color,num_return,graph_depth); //passing block number, transaction_no, graph output.
          } //end of for each depth loop
        }//end of if result.result != undefined

         if(result.result==undefined){
            console.log("no trace found but saving placeholder");
            db2.save_trans_to_db(contracts_trans_list[int_trans],"bad block!"); //passing block number, transaction_no, graph output.
         }
    }); // end of web aynch send callback

  } // end of for each internal transaction loop
  resolve(res_str);
}//end of return new promise function

); //end of promise function
} // end of gen_graph_prom

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
