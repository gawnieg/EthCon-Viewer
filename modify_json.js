//this is an exposed api version for calling from other files

module.exports={

find_add_remove_nums: function(_opcode){
  return find_add_remove_nums(_opcode)
},
modify_input: function(_passed){
  return modify_input(_passed);
},
modify_diff_depth:function (_input){
  return modify_diff_depth(_input);
}



}
//with comments out.
function find_add_remove_nums(opcode){
  var r;
  //console.log("Getting values for "+opcode);
  switch(opcode) {
    case "STOP":
    var r= {c: 0, p:0, colour:66} //crimson
    break
    case "ADD":
    var r= {c: 2, p:1,colour:50} // math operators = chocolate
    break
    case "SUB":
    var r= {c: 2, p:1,colour:51}
    break
    case "MUL":
    var r= {c: 2, p:1,colour:52}
    break
    case "DIV":
    var r= {c: 2, p:1,colour:53}
    break
    case "SDIV":
    var r= {c: 2, p:1,colour:54}
    break
    case "MOD":
    var r= {c: 2, p:1,colour:55}
    break
    case "SMOD":
    var r= {c: 2, p:1,colour:56}
    break
    case "ADDMOD":
    var r= {c: 3, p:1,colour:57}
    break
    case "MULMOD":
    var r= {c: 3, p:1,colour:58}
    break
    case "EXP":
    var r= {c: 2, p:1,colour:59}
    break
    case "SIGNEXTEND":
    var r= {c: 2, p:1,colour:60}
    break
    case "LT":
    var r= {c: 2, p:1,colour:135}
    break
    case "GT":
    var r= {c: 2, p:1,colour:136}
    break
    case "SLT":
    var r= {c: 2, p:1,colour:137}
    break
    case "SGT":
    var r= {c: 2, p:1,colour:138}
    break
    case "EQ":
    var r= {c: 2, p:1,colour:139}
    break
    case "ISZERO":
    var r= {c: 1, p:1,colour:140}
    break
    case "AND":
    var r= {c: 2, p:1,colour:40}
    break
    case "OR":
    var r= {c: 2, p:1,colour:41}
    break
    case "XOR":
    var r= {c: 2, p:1,colour:42}
    break
    case "NOT":
    var r= {c: 1, p:1,colour:43}
    break
    case "BYTE":
    var r= {c: 2, p:1,colour:44}
    break
    case "SHA3":
    var r= {c: 2, p:1,colour:109}//deeppint
    break
    case "ADDRESS":
    var r= {c: 0, p:1,colour:77}//dark greeen
    break
    case "BALANCE":
    var r= {c: 1, p:1,colour:89}
    break
    case "ORIGIN":
    var r= {c: 0, p:1,colour:90}
    break
    case "CALLER":
    var r= {c: 0, p:1,colour:91}
    break
    case "CALLVALUE":
    var r= {c: 0, p:1,colour:92}
    break
    case "CALLDATALOAD":
    var r= {c: 1, p:1,colour:93}
    break
    case "CALLDATASIZE":
    var r= {c: 0, p:1,colour:94}
    break
    case "CALLDATACOPY":
    var r= {c: 3, p:0,colour:95}
    break
    case "CODESIZE":
    var r= {c: 0, p:1,colour:96}
    break
    case "CODECOPY":
    var r= {c: 3, p:0,colour:97}
    break
    case "GASPRICE":
    var r= {c: 0, p:1}
    break
    case "EXTCODESIZE":
    var r= {c: 1, p:1}
    break
    case "EXTCODECOPY":
    var r= {c: 4, p:0}
    break
    case "BLOCKHASH":
    var r= {c: 1, p:1}
    break
    case "COINBASE":
    var r= {c: 0, p:1}
    break

    case "TIMESTAMP":
    var r= {c: 0, p:1}
    break
    case "NUMBER":
    var r= {c: 0, p:1}
    break
    case "DIFFICULTY":
    var r= {c: 0, p:1}
    break
    case "GASLIMIT":
    var r= {c: 0, p:1}
    break
    case "MLOAD":
    var r= {c: 1, p:1,colour:45}//interplay with memory = chartreuse
    break
    case "MSTORE":
    var r= {c: 2, p:0,colour:45}
    break

    case "MSTORE8":
    var r= {c: 2, p:0,colour:45}
    break
    case "SLOAD":
    var r= {c: 1, p:1,colour:45}
    break
    case "SSTORE":
    var r= {c: 2, p:0,colour:45}
    break
    case "JUMP":
    var r= {c: 1, p:0,colour:36}
    break
    case "JUMPI":
    var r= {c: 2, p:0,colour:36}
    break
    case "PC":
    var r= {c: 0, p:1}
    break
    case "MSIZE":
    var r= {c: 0, p:1}
    break
    case "GAS":
    var r= {c: 0, p:1}
    break
    case "JUMPDEST":
    var r= {c: 0, p:0,colour:148}//magenta
    break
    case "POP":
    var r= {c: 1, p:0,colour:147}//comes up a lot so using peru, a brown colour
    break
    case "LOG0":
    var r= {c: 2, p:0}
    break
    case "LOG1":
    var r= {c: 3, p:0}
    break
    case "LOG2":
    var r= {c: 4, p:0}
    break
    case "LOG3":
    var r= {c: 5, p:0}
    break
    case "LOG4":
    var r= {c: 6, p:0}
    break
    case "CREATE":
    var r= {c: 3, p:1,colour:145} // bright yellow
    break
    case "CALL":
    var r= {c: 7, p:1} //hot pink
    break
    case "CALLCODE":
    var r= {c: 7, p:1}
    break
    case "RETURN":
    var r= {c: 2, p:0}
    break
    case "DELEGATECALL":
    var r= {c: 6, p:1}
    break
    case "SUICIDE":
    var r= {c: 1, p:0}
    break
    case "SELFDESTRUCT": // added as is this same as suicide?
    var r= {c: 1, p:0,colour:145}
    break
    case "PUSH1":
    var r= {c: 0, p:1, colour: 1} //all pushes the same colour
    break
    case "PUSH2":
    var r= {c: 0, p:1, colour: 1}
    break
    case "PUSH3":
    var r= {c: 0, p:1, colour: 1}
    break
    case "PUSH4":
    var r= {c: 0, p:1, colour: 1}
    break
    case "PUSH5":
    var r= {c: 0, p:1, colour: 1}
    break
    case "PUSH6":
    var r= {c: 0, p:1, colour: 1}
    break
    case "PUSH7":
    var r= {c: 0, p:1, colour: 1}
    break
    case "PUSH8":
    var r= {c: 0, p:1, colour: 1}
    break
    case "PUSH9":
    var r= {c: 0, p:1, colour: 1}
    break
    case "PUSH10":
    var r= {c: 0, p:1, colour: 1}
    break
    case "PUSH11":
    var r= {c: 0, p:1, colour: 1}
    break
    case "PUSH12":
    var r= {c: 0, p:1, colour: 1}
    break
    case "PUSH13":
    var r= {c: 0, p:1, colour: 1}
    break
    case "PUSH14":
    var r= {c: 0, p:1, colour: 1}
    case "PUSH15":
    var r= {c: 0, p:1, colour: 1}
    break
    case "PUSH16":
    var r= {c: 0, p:1, colour: 1}
    break
    case "PUSH17":
    var r= {c: 0, p:1, colour: 1}
    break
    case "PUSH18":
    var r= {c: 0, p:1, colour: 1}
    break
    case "PUSH19":
    var r= {c: 0, p:1, colour: 1}
    break
    case "PUSH20":
    var r= {c: 0, p:1, colour: 1}
    break
    case "PUSH21":
    var r= {c: 0, p:1, colour: 1}
    break
    case "PUSH22":
    var r= {c: 0, p:1, colour: 1}
    break
    case "PUSH23":
    var r= {c: 0, p:1, colour: 1}
    break
    case "PUSH24":
    var r= {c: 0, p:1, colour: 1}
    break
    case "PUSH25":
    var r= {c: 0, p:1, colour: 1}
    break
    case "PUSH26":
    var r= {c: 0, p:1, colour: 1}
    break
    case "PUSH27":
    var r= {c: 0, p:1, colour: 1}
    break
    case "PUSH28":
    var r= {c: 0, p:1, colour: 1}
    break
    case "PUSH29":
    var r= {c: 0, p:1, colour: 1}
    break
    case "PUSH30":
    var r= {c: 0, p:1, colour: 1}
    break
    case "PUSH31":
    var r= {c: 0, p:1, colour: 1}
    break
    case "PUSH32":
    var r= {c: 0, p:1, colour: 1}
    break
    case "DUP0":
    var r= {c: 0, p:1,colour:119} // all dups dark gray
    break
    case "DUP1":
    var r= {c: 1, p:2,colour:119}
    break
    case "DUP2":
    var r= {c: 2, p:3,colour:119}
    break
    case "DUP3":
    var r= {c: 3, p:4,colour:119}
    break
    case "DUP4":
    var r= {c: 4, p:5,colour:119}
    break
    case "DUP5":
    var r= {c: 5, p:6,colour:119}
    break
    case "DUP6":
    var r= {c: 6, p:7,colour:119}
    break
    case "DUP7":
    var r= {c: 7, p:8,colour:119}
    break
    case "DUP8":
    var r= {c: 8, p:9,colour:119}
    break
    case "DUP9":
    var r= {c: 9, p:10,colour:119}
    break
    case "DUP10":
    var r= {c: 10, p:11,colour:119}
    break
    case "DUP11":
    var r= {c: 11, p:12,colour:119}
    break
    case "DUP12":
    var r= {c: 12, p:13,colour:119}
    break
    case "DUP13":
    var r= {c: 13, p:14,colour:119}
    break
    case "DUP14":
    var r= {c: 14, p:15,colour:119}
    break
    case "DUP15":
    var r= {c: 15, p:16,colour:119}
    break
    case "DUP16":
    var r= {c: 16, p:17,colour:119}
    break
    case "SWAP0":
    var r= {c: 1, p:1,colour:107}//all swaps cornsilk
    break
    case "SWAP1":
    var r= {c: 2, p:2,colour:107}
    break
    case "SWAP2":
    var r= {c: 3, p:3,colour:107}
    break
    case "SWAP3":
    var r= {c: 4, p:4,colour:107}
    break
    case "SWAP4":
    var r= {c: 5, p:5,colour:107}
    break
    case "SWAP5":
    var r= {c: 6, p:6,colour:107}
    break
    case "SWAP6":
    var r= {c: 7, p:7,colour:107}
    break
    case "SWAP7":
    var r= {c: 8, p:8,colour:107}
    break
    case "SWAP8":
    var r= {c: 9, p:9,colour:107}
    break
    case "SWAP9":
    var r= {c: 10, p:10,colour:107}
    break
    case "SWAP10":
    var r= {c: 11, p:11,colour:107}
    break
    case "SWAP11":
    var r= {c: 12, p:12,colour:107}
    break
    case "SWAP12":
    var r= {c: 13, p:13,colour:107}
    break
    case "SWAP13":
    var r= {c: 14, p:14,colour:107}
    break
    case "SWAP14":
    var r= {c: 15, p:15,colour:107}
    break
    case "SWAP15":
    var r= {c: 16, p:16,colour:107}
    break
    case "SWAP16":
    var r= {c: 17, p:17,colour:107}
    break


    default:
        console.log("no matching opcode"+opcode)
}
  return r;
}

function modify_structLogs(sLogs){
  var output=[];
  var step_number=0;
  var stack_origins=[];
  var length = sLogs.length;

  //console.log("modify_structLogs has been called");
  //console.log("lenght of slogs.lenght is " + length);
  for(var i=0; i<length;i++ ){
    // console.log("--------------NEXT STEP--------------")
    output.push(sLogs[i]);
    if(sLogs[i].depth==1){
      sLogs[i].step=step_number;
      step_number+=1;
      c_r = find_add_remove_nums((sLogs[i].op));
      //console.log("for "+ i+ " found c to be" + JSON.stringify(c_r));
      c =c_r.c;

      var colour = c_r.colour;
      sLogs[i].colour = colour;

      var length_stack_origin= stack_origins.length;
      sLogs[i].arg_origins=stack_origins.slice((length_stack_origin-c),length_stack_origin);
      var length_arg_origin= sLogs[i].arg_origins.length;

      // console.log("length_arg_origin is " + length_arg_origin);
      // //now print stack_origin -DEBUGGING
      // console.log("now printing stack_origins")
      // for(var i0=0; i0<stack_origins.length;i0++){
      //   console.log(stack_origins[i0]);
      // }

      for(var idx=0; idx< length_arg_origin; idx++){
        // console.log("idx is "+idx);
        // console.log("length_stack_origin"+ length_stack_origin);
        // console.log("c is "+c);
        // console.log("index is "+(length_stack_origin-c+idx));
        v=sLogs[i].stack[(length_stack_origin-c+idx)]; //changed, was using slice for some reason
        // console.log("in idx loop, setting "+v);
        sLogs[i].arg_origins[idx].value=v;
      }
      stack_origins=update_stack_origins(stack_origins,sLogs[i]);
    }
  }

  return output;
}

function update_stack_origins(orig,sLog){
  var opcode=sLog.op;

  switch(opcode){
    case "SWAP0":
    return update_stack_origins_swap(orig,0);
    case "SWAP1":
    return update_stack_origins_swap(orig,1);
    case "SWAP2":
    return update_stack_origins_swap(orig,2);
    case "SWAP3":
    return update_stack_origins_swap(orig,3);
    case "SWAP4":
    return update_stack_origins_swap(orig,4);
    case "SWAP5":
    return update_stack_origins_swap(orig,5);
    case "SWAP6":
    return update_stack_origins_swap(orig,6);
    case "SWAP7":
    return update_stack_origins_swap(orig,7);
    case "SWAP8":
    return update_stack_origins_swap(orig,8);
    case "SWAP9":
    return update_stack_origins_swap(orig,9);
    case "SWAP10":
    return update_stack_origins_swap(orig,10);
    case "SWAP11":
    return update_stack_origins_swap(orig,11);
    case "SWAP12":
    return update_stack_origins_swap(orig,12);
    case "SWAP13":
    return update_stack_origins_swap(orig,13);
    case "SWAP14":
    return update_stack_origins_swap(orig,14);
    case "SWAP15":
    return update_stack_origins_swap(orig,15);
    case "SWAP16":
    return update_stack_origins_swap(orig,16);
    case "DUP0":
    return update_stack_origins_dup(orig,0);
    case "DUP1":
    var test= update_stack_origins_dup(orig,1);
    //  console.log("PRINTINT TEST"+test);
    return test;
    case "DUP2":
    var test= update_stack_origins_dup(orig,2);
    //console.log("PRINTINT TEST"+JSON.stringify(test));
    return test;
    case "DUP3":
    return update_stack_origins_dup(orig,3);
    case "DUP4":
    return update_stack_origins_dup(orig,4);
    case "DUP5":
    return update_stack_origins_dup(orig,5);
    case "DUP6":
    return update_stack_origins_dup(orig,6);
    case "DUP7":
    return update_stack_origins_dup(orig,7);
    case "DUP8":
    return update_stack_origins_dup(orig,8);
    case "DUP9":
    return update_stack_origins_dup(orig,9);
    case "DUP10":
    return update_stack_origins_dup(orig,10);
    case "DUP11":
    return update_stack_origins_dup(orig,11);
    case "DUP12":
    return update_stack_origins_dup(orig,12);
    case "DUP13":
    return update_stack_origins_dup(orig,13);
    case "DUP14":
    return update_stack_origins_dup(orig,14);
    case "DUP15":
    return update_stack_origins_dup(orig,15);
    case "DUP16":
    return update_stack_origins_dup(orig,16);

  }

  c = (find_add_remove_nums(opcode)).c;
  p = (find_add_remove_nums(opcode)).p;
  orig_length= orig.length;
  orig=orig.slice(0,(orig_length-c));
  var here = origin(1,sLog.step);
  // console.log("update_stack_origins p is "+p);
  // console.log("here is "+JSON.stringify(here))
  //var new_elements= new Array(p,here);//wrong
  if(p==1){
    // console.log("p is equal to 1!!!")
    var new_elements= new Array(here);
      // console.log("new elements is" + JSON.stringify(new_elements));
  }
  if(p==0){
      // console.log("p is equal to 0!!!")
    var new_elements = [];
    // console.log("new elements is" + JSON.stringify(new_elements));
  }

  orig = orig.concat(new_elements);
  // console.log("orig is " + JSON.stringify(orig))
  return orig;

}
function origin(d,s){
  var r ={depth:d, step:s};
  return r;
}
function update_stack_origins_swap(orig,number){
  number=number+1;
  var x1=orig.slice(0,(orig.length-number));
  // console.log("update_stack_origins_swap x1 is "+JSON.stringify(x1))
  var x2=orig[(orig.length-1)];//could be wrong
  // console.log("update_stack_origins_swap x2 is "+JSON.stringify(orig[(orig.length-1)]))
  var x3 = orig.slice((orig.length-number+1), (orig.length-1))
  // console.log("update_stack_origins_swap x3 is "+JSON.stringify(x3))
  var x4= orig[(orig.length-number)];
  // console.log("update_stack_origins_swap x4 is "+JSON.stringify(x4))
  var x5 = x1.concat(x2);
  var x6=x3.concat(x4);
  var x7=x5.concat(x6);
  // console.log("update_stack_origins_swap!!!!!!!!!!!!!!!!!"+ JSON.stringify(x5.concat(x7)));
  return x7;

}
function update_stack_origins_dup(orig,number){
  return orig.concat(orig[(orig.length-number)]);
}
function modify_input(input){
  var output;
  output = modify_structLogs(input.structLogs);
  // console.log("printing output: ")
  // console.log(JSON.stringify(output));
  return output;
}
function modify_diff_depth(_input){ //special version for multidepth
  var output;
  output =modify_structLogs(_input);
  return output;
}



//main
//var input_json = require("./shortened_json.json");
// var input_json = require("./short_json_with_SWAP.json");
