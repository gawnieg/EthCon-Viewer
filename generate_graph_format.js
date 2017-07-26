/*

Given a modified json from debug_traceTransaction, generate the
graphviz format
This will help make more modular.
*/

module.exports={
  generate_graph_format: function(_input){
    return generate_graph_format(_input);
  }
}

function generate_graph_format(logs){
res_str = ""; // reset at the start!!

var prefix = "digraph{";
var suffix = "}\n\n\n\n\n";
//require("./graphviz_config.js"); //pull in settings for graph
//console.log(prefix); //print prefix - start of graph format
res_str=res_str.concat(prefix);
res_str=res_str.concat("\n");
//var logs = output;
for(var x=0;x<logs.length;x++){
  if(logs[x].depth != 1){continue;} //critical for multidepth
  var opcode = logs[x].opcode;
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

  if(typeof(logs[x].colour)!==undefined){
   //console.log(logs[x].step +" [label=\""+logs[x].op+"\", style=filled, color=" + color_string+"]");
    res_str=res_str.concat(logs[x].step);
    res_str=res_str.concat(" [label=\"");
    res_str=res_str.concat(logs[x].op);
    res_str=res_str.concat("\", style=filled, color=");
    res_str=res_str.concat(color_string);
    res_str=res_str.concat("]");
      res_str=res_str.concat("\n");
  }
  else{
  //  console.log(logs[x].step +" [label=\""+logs[x].op+"\"]");
    res_str=res_str.concat(logs[x].step);
    res_str=res_str.concat(" [label=\"");
    res_str=res_str.concat(logs[x].op);
    res_str=res_str.concat("\"]");
      res_str=res_str.concat("\n");
  }
  var l = logs[x].arg_origins.length;
  for(var y=0;y<l;y++){
  //console.log(logs[x].arg_origins[y].step + " -> " + logs[x].step + " [label=\""+logs[x].arg_origins[y].value+"\", fontcolor=antiquewhite]");
    res_str=res_str.concat(logs[x].arg_origins[y].step);
    res_str=res_str.concat(" -> ");
    res_str=res_str.concat(logs[x].step);
    res_str=res_str.concat(" [label=\"");
    res_str=res_str.concat(logs[x].arg_origins[y].value);
    res_str=res_str.concat("\", fontcolor=antiquewhite]");
    res_str=res_str.concat("\n");
  }
}
//console.log(suffix); //finish graphviz format
res_str=res_str.concat(suffix);
res_str=res_str.concat("\n");
}
