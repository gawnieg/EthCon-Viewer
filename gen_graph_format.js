// feed it a modified json object, returns an object with all the formats in it!
module.exports={

generateFormat: function(TwoDarraymodified,graph_depth,SINGLE_NODES_OFF,TwoDChecklist){
  //object to store results
  var returnObj={
     res_str:"",
     res_str_gml:"",
     res_str_dot_no_lbl:"", // this holds format for graph tools
     graphtools_color:[], // for storing label and color for graph tools. this is saved to db
     graphtools_label:[],
     sigmaobj:{
      "edges":[],
      "nodes":[]
    }
  }
  var prefix = "\`digraph{";
  var suffix = "}\`\n";
  var newline = '\n';
  //graphml formatting
  returnObj.res_str_gml=returnObj.res_str_gml.concat("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n","<graphml xmlns=\"http://grapml.graphdrawing.org/xmlns\"\n",
    "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"\n", "xsi:schemaLocation=\"http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd\">\n",
    "<graph id=\"G\" edgedefault=\"undirected\">\n" );

  returnObj.res_str=returnObj.res_str.concat(prefix,newline);
  returnObj.res_str_dot_no_lbl=returnObj.res_str_dot_no_lbl.concat("digraph{",newline);

  returnObj.res_str=returnObj.res_str.concat("edge[color=antiquewhite] ",newline);
  returnObj.res_str=returnObj.res_str.concat("bgcolor=black",newline);

  var logs= TwoDarraymodified[graph_depth]; // new line, used to be the above
  for(var x=0;x<logs.length;x++){
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

    returnObj.graphtools_label.push(opcode);
    const import_colour_arrays = require("./config/generate_graph_config.js");
    var colour_array=import_colour_arrays.colour_array;
    var sigma_colour_array = import_colour_arrays.sigma_colour_array;
    var color_string = colour_array[colour];
    var color_string_sigma=sigma_colour_array[colour];
    returnObj.graphtools_color.push(color_string_sigma); //graph tools understands hex

    //if the colour for the particular opcode is not defined then do:
    if(typeof(logs[x].colour)!==undefined){
      returnObj.res_str=returnObj.res_str.concat(logs[x].step," [label=\"",logs[x].op,"\", style=filled, color=",color_string,"]",newline);
      //modifed graph tools format
      returnObj.res_str_dot_no_lbl=returnObj.res_str_dot_no_lbl.concat(logs[x].step,newline);
      //graphml format
      returnObj.res_str_gml=returnObj.res_str_gml.concat("<node id=\"",logs[x].step,"\"/>\n");
      //returnObj.sigmaobj format
      var x_coord = Math.floor((Math.random() * 100) + 1);//randomly generate coordinates for starting position
      var y_coord =Math.floor((Math.random() * 100) + 1);
      //section to find what colour the nodes should be - should be according to opcode, that gives an index number for graphviz
      var labelplusstep=(logs[x].op).concat(" ",logs[x].step)
      returnObj.sigmaobj.nodes.push({"id":(logs[x].step).toString(),"x": x_coord, "y":y_coord,"label": labelplusstep, "color":color_string_sigma, "size":10 });
    }
    //if the colour has been defined (in modify json) then do:
    else{
      returnObj.res_str=returnObj.res_str.concat(logs[x].step," [label=\"",logs[x].op,"\"]",newline);
      returnObj.res_str_dot_no_lbl=returnObj.res_str_dot_no_lbl.concat(logs[x].step,newline);
      //graphml format
      returnObj.res_str_gml=returnObj.res_str_gml.concat("<node id=",logs[x].step,"\"/>\n");
      //returnObj.sigmaobj format
      var x_coord = Math.floor((Math.random() * 100) + 1);
      var y_coord =Math.floor((Math.random() * 100) + 1);
      var labelplusstep=(logs[x].op).concat(" ",logs[x].step) //was just logs[x].op
      returnObj.sigmaobj.nodes.push({"id":(logs[x].step).toString(),"x": x_coord, "y":y_coord,"label": labelplusstep, "color":"rgb(90,90,90)", "size":10 });
    }
    //now do edges!!!
    var l = logs[x].arg_origins.length;
    for(var y=0;y<l;y++){
      returnObj.res_str=returnObj.res_str.concat(logs[x].arg_origins[y].step," -> ",logs[x].step," [label=\"");
      var hexstr="0x";
      var short_label = logs[x].arg_origins[y].value;
      short_label=short_label.replace(/^[0]+/g,"");//getting rid of leading zeroes
      hexstr=hexstr.concat(short_label);
      returnObj.res_str=returnObj.res_str.concat(hexstr,"\", fontcolor=antiquewhite]",newline);
      //modifed graph tools format
      returnObj.res_str_dot_no_lbl=returnObj.res_str_dot_no_lbl.concat(logs[x].arg_origins[y].step," -> ",logs[x].step,newline);
      //graphml format
      returnObj.res_str_gml=returnObj.res_str_gml.concat("<edge source=\"",logs[x].arg_origins[y].step,"\" target=\"",logs[x].step,"\"/>\n");
      //returnObj.sigmaobj format
      var sigma_edge_index = x.toString(); //think about this, need a unique string, coming from and going to combined is unique
      sigma_edge_index=sigma_edge_index.concat("to");
      sigma_edge_index=sigma_edge_index.concat((y.toString()))
      returnObj.sigmaobj.edges.push({"id":sigma_edge_index, "source":(logs[x].arg_origins[y].step).toString(), "target":(logs[x].step).toString(),"color":"#006666"});
    }
  }
  returnObj.res_str=returnObj.res_str.concat(suffix,newline);
  //finish graphml format
  returnObj.res_str_gml=returnObj.res_str_gml.concat("</graph>\n","</graphml>\n");
  //simple dot
  returnObj.res_str_dot_no_lbl=returnObj.res_str_dot_no_lbl.concat("}\n",newline);

  return returnObj;
  }
}//end of module exports
