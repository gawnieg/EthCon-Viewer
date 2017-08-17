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
  /*according to comae.io and porosity opcodes are split into these broad groups
    - Arithmetic Operations.
     - Comparison & Bitwise Logic Operations.-> Arithmetic=blue, comparison = green
     - SHA3. //orange
     - Environmental Information.//light to darkening yellow
     - Block Information.//beige/yellowish
     - Stack, Memory, Storage and Flow Operations. Memory-> purple, storage-> grey, flow -> white, stack -> pink
     - Push/Duplication/Pop/Exchange Operations.duplicate->dark pink. swap-> dark orange
     - Logging Operations.dark red/brown
     - System Operations system ops -> light purple

    and thus we will colour accordingly.
    Colours are defined in ./config/generate_graph_config
*/
  switch(opcode) {
    case "STOP":
    var r= {c: 0, p:0, colour:66,hexcolour:"#800000"} //maroon
    break
    case "ADD": //Arithmetic
    var r= {c: 2, p:1,colour:50,hexcolour:"#ccefff"} // math operators = chocolate
    break
    case "SUB"://Arithmetic
    var r= {c: 2, p:1,colour:51,hexcolour:"#66cfff"}
    break
    case "MUL"://Arithmetic
    var r= {c: 2, p:1,colour:52,hexcolour:"#4dc6ff"}
    break
    case "DIV"://Arithmetic
    var r= {c: 2, p:1,colour:53,hexcolour:"#1ab6ff"}
    break
    case "SDIV"://Arithmetic
    var r= {c: 2, p:1,colour:54,hexcolour:"#009de6"}
    break
    case "MOD"://Arithmetic
    var r= {c: 2, p:1,colour:55,hexcolour:"#008bcc"}
    break
    case "SMOD"://Arithmetic
    var r= {c: 2, p:1,colour:56,hexcolour:"#007ab3"}
    break
    case "ADDMOD"://Arithmetic
    var r= {c: 3, p:1,colour:57,hexcolour:"#006999"}
    break
    case "MULMOD"://Arithmetic
    var r= {c: 3, p:1,colour:58,hexcolour:"#005780"}
    break
    case "EXP"://Arithmetic
    var r= {c: 2, p:1,colour:59,hexcolour:"#e6f7ff"}
    break
    case "SIGNEXTEND"://Arithmetic
    var r= {c: 2, p:1,colour:60,hexcolour:"#004666"}
    break
    case "LT"://Comparison
    var r= {c: 2, p:1,colour:135,hexcolour:"#d9f2d9"}
    break
    case "GT"://Comparison
    var r= {c: 2, p:1,colour:136,hexcolour:"#b4e4b4"}
    break
    case "SLT"://Comparison
    var r= {c: 2, p:1,colour:137,hexcolour:"#8fd68f"}
    break
    case "SGT"://Comparison
    var r= {c: 2, p:1,colour:138,hexcolour:"#6ac86a"}
    break
    case "EQ"://Comparison
    var r= {c: 2, p:1,colour:139,hexcolour:"#45ba45"}
    break
    case "ISZERO"://Comparison
    var r= {c: 1, p:1,colour:140,hexcolour:"#379537"}
    break
    case "AND": //Comparison
    var r= {c: 2, p:1,colour:40,hexcolour:"#308230"}
    break
    case "OR"://Comparison
    var r= {c: 2, p:1,colour:41,hexcolour:"#297029"}
    break
    case "XOR"://Comparison
    var r= {c: 2, p:1,colour:42,hexcolour:"#225d22"}
    break
    case "NOT"://Comparison
    var r= {c: 1, p:1,colour:43,hexcolour:"#1c4a1c"}
    break
    case "BYTE"://Comparison
    var r= {c: 2, p:1,colour:44,hexcolour:"#153715"}
    break
    case "SHA3": //SHA3 - gets it own catagory
    var r= {c: 2, p:1,colour:109,hexcolour:"#ff9933"}//deeppint
    break
    case "ADDRESS": //Environmental
    var r= {c: 0, p:1,colour:77,hexcolour:"#ffffcc"}//dark greeen
    break
    case "BALANCE": //Environmental
    var r= {c: 1, p:1,colour:89,hexcolour:"#ffffb3"}
    break
    case "ORIGIN": //Environmental
    var r= {c: 0, p:1,colour:90,hexcolour:"#ffff99"}
    break
    case "CALLER": //Environmental
    var r= {c: 0, p:1,colour:91,hexcolour:"#ffff80"}
    break
    case "CALLVALUE": //Environmental
    var r= {c: 0, p:1,colour:92,hexcolour:"#ffff66"}
    break
    case "CALLDATALOAD": //Environmental
    var r= {c: 1, p:1,colour:93,hexcolour:"#ffff4d"}
    break
    case "CALLDATASIZE": //Environmental
    var r= {c: 0, p:1,colour:94,hexcolour:"#ffff33"}
    break
    case "CALLDATACOPY": //Environmental
    var r= {c: 3, p:0,colour:95,hexcolour:"#ffff33"}
    break
    case "CODESIZE": //Environmental
    var r= {c: 0, p:1,colour:96,hexcolour:"#e6e600"}
    break
    case "CODECOPY": //Environmental
    var r= {c: 3, p:0,colour:97,hexcolour:"#cccc00"}
    break
    case "GASPRICE": //Environmental
    var r= {c: 0, p:1,colour:97,hexcolour:"#b3b300"}
    break
    case "EXTCODESIZE": //Environmental
    var r= {c: 1, p:1,colour:97,hexcolour:"#999900"}
    break
    case "EXTCODECOPY": //Environmental
    var r= {c: 4, p:0,colour:97,hexcolour:"#808000"}
    break
    case "BLOCKHASH": //Environmental //switch up to greyish as was not enoguth colours in yellow
    var r= {c: 1, p:1,colour:97,hexcolour:"#d6d6c2"}
    break
    case "COINBASE":  //Environmental
    var r= {c: 0, p:1,colour:97,hexcolour:"#c2c2a3"}
    break

    case "TIMESTAMP": //Environmental
    var r= {c: 0, p:1,colour:97,hexcolour:"#adad85"}
    break
    case "NUMBER": //Environmental
    var r= {c: 0, p:1,colour:97,hexcolour:"#a3a375"}
    break
    case "DIFFICULTY": //Environmental
    var r= {c: 0, p:1,colour:97,hexcolour:"#8a8a5c"}
    break
    case "GASLIMIT": //Environmental
    var r= {c: 0, p:1,colour:97,hexcolour:"#6b6b47"}
    break
    case "MLOAD": //memory//pruple hex
    var r= {c: 1, p:1,colour:45,hexcolour:"#f2ccff"}//interplay with memory = chartreuse
    break
    case "MSTORE": //memory
    var r= {c: 2, p:0,colour:45,hexcolour:"#d24dff"}
    break

    case "MSTORE8": //memory
    var r= {c: 2, p:0,colour:45,hexcolour:"#ac00e6"}
    break
    case "SLOAD"://storage grey!
    var r= {c: 1, p:1,colour:45,hexcolour:"#d0d0e1"}
    break
    case "SSTORE"://storage
    var r= {c: 2, p:0,colour:45,hexcolour:"#8383af"}
    break
    case "JUMP"://flow WHITE
    var r= {c: 1, p:0,colour:36,hexcolour:"#ffffff"}
    break
    case "JUMPI"://flow
    var r= {c: 2, p:0,colour:36,hexcolour:"#f2f2f2"}
    break
    case "PC": //flow
    var r= {c: 0, p:1,colour:97,hexcolour:"#ff8080"}
    break
    case "MSIZE": //memory
    var r= {c: 0, p:1,colour:97,hexcolour:"#9900cc"}
    break
    case "GAS"://flow
    var r= {c: 0, p:1,colour:97,hexcolour:"#ff4d4d"}
    break
    case "JUMPDEST"://flow
    var r= {c: 0, p:0,colour:148,hexcolour:"#f2f2f2"}//magenta
    break
    case "POP"://stack PINK
    var r= {c: 1, p:0,colour:147,hexcolour:"#ff99ff"}//comes up a lot so using peru, a brown colour
    break
    case "LOG0": //logging
    var r= {c: 2, p:0,colour:97,hexcolour:"#993333"}
    break
    case "LOG1"://logging
    var r= {c: 3, p:0,colour:97,hexcolour:"#993333"}
    break
    case "LOG2"://logging
    var r= {c: 4, p:0,colour:97,hexcolour:"#993333"}
    break
    case "LOG3"://logging
    var r= {c: 5, p:0,colour:97,hexcolour:"#993333"}
    break
    case "LOG4"://logging
    var r= {c: 6, p:0,colour:97,hexcolour:"#993333"}
    break
    case "CREATE"://system ops
    var r= {c: 3, p:1,colour:145,hexcolour:"#ff0080"} // bright yellow
    break
    case "CALL"://system ops
    var r= {c: 7, p:1,colour:145,hexcolour:"#9999ff"} //hot pink
    break
    case "CALLCODE"://system ops
    var r= {c: 7, p:1,colour:145,hexcolour:"#0000b3"}
    break
    case "RETURN"://system ops
    var r= {c: 2, p:0,colour:97,hexcolour:"#99ff66"}
    break
    case "DELEGATECALL"://system ops
    var r= {c: 6, p:1,colour:97,hexcolour:"#0000b3"}
    break
    case "SUICIDE"://system ops
    var r= {c: 1, p:0,colour:97,hexcolour:"#001a00"}
    break
    case "SELFDESTRUCT": // added as is this same as suicide?//system ops
    var r= {c: 1, p:0,colour:145,hexcolour:"#001a00"}
    break
    case "PUSH1"://stack
    var r= {c: 0, p:1, colour: 1,hexcolour:"#ffcccc"} //all pushes the same colour
    break
    case "PUSH2"://stack
    var r= {c: 0, p:1, colour: 1,hexcolour:"#ffcccc"}
    break
    case "PUSH3"://stack
    var r= {c: 0, p:1, colour: 1,hexcolour:"#ffcccc"}
    break
    case "PUSH4"://stack
    var r= {c: 0, p:1, colour: 1,hexcolour:"#ffcccc"}
    break
    case "PUSH5"://stack
    var r= {c: 0, p:1, colour: 1,hexcolour:"#ffcccc"}
    break
    case "PUSH6"://stack
    var r= {c: 0, p:1, colour: 1,hexcolour:"#ffcccc"}
    break
    case "PUSH7"://stack
    var r= {c: 0, p:1, colour: 1,hexcolour:"#ffcccc"}
    break
    case "PUSH8"://stack
    var r= {c: 0, p:1, colour: 1,hexcolour:"#ffcccc"}
    break
    case "PUSH9"://stack
    var r= {c: 0, p:1, colour: 1,hexcolour:"#ffcccc"}
    break
    case "PUSH10"://stack
    var r= {c: 0, p:1, colour: 1,hexcolour:"#ffcccc"}
    break
    case "PUSH11"://stack
    var r= {c: 0, p:1, colour: 1,hexcolour:"#ffcccc"}
    break
    case "PUSH12"://stack
    var r= {c: 0, p:1, colour: 1,hexcolour:"#ffcccc"}
    break
    case "PUSH13"://stack
    var r= {c: 0, p:1, colour: 1,hexcolour:"#ffcccc"}
    break
    case "PUSH14"://stack
    var r= {c: 0, p:1, colour: 1,hexcolour:"#ffcccc"}
    break
    case "PUSH15"://stack
    var r= {c: 0, p:1, colour: 1,hexcolour:"#ffcccc"}
    break
    case "PUSH16"://stack
    var r= {c: 0, p:1, colour: 1,hexcolour:"#ffcccc"}
    break
    case "PUSH17"://stack
    var r= {c: 0, p:1, colour: 1,hexcolour:"#ffcccc"}
    break
    case "PUSH18"://stack
    var r= {c: 0, p:1, colour: 1,hexcolour:"#ffcccc"}
    break
    case "PUSH19"://stack
    var r= {c: 0, p:1, colour: 1,hexcolour:"#ffcccc"}
    break
    case "PUSH20"://stack
    var r= {c: 0, p:1, colour: 1,hexcolour:"#ffcccc"}
    break
    case "PUSH21"://stack
    var r= {c: 0, p:1, colour: 1,hexcolour:"#ffcccc"}
    break
    case "PUSH22"://stack
    var r= {c: 0, p:1, colour: 1,hexcolour:"#ffcccc"}
    break
    case "PUSH23"://stack
    var r= {c: 0, p:1, colour: 1,hexcolour:"#ffcccc"}
    break
    case "PUSH24"://stack
    var r= {c: 0, p:1, colour: 1,hexcolour:"#ffcccc"}
    break
    case "PUSH25"://stack
    var r= {c: 0, p:1, colour: 1,hexcolour:"#ffcccc"}
    break
    case "PUSH26"://stack
    var r= {c: 0, p:1, colour: 1,hexcolour:"#ffcccc"}
    break
    case "PUSH27"://stack
    var r= {c: 0, p:1, colour: 1,hexcolour:"#ffcccc"}
    break
    case "PUSH28"://stack
    var r= {c: 0, p:1, colour: 1,hexcolour:"#ffcccc"}
    break
    case "PUSH29"://stack
    var r= {c: 0, p:1, colour: 1,hexcolour:"#ffcccc"}
    break
    case "PUSH30"://stack
    var r= {c: 0, p:1, colour: 1,hexcolour:"#ffcccc"}
    break
    case "PUSH31"://stack
    var r= {c: 0, p:1, colour: 1,hexcolour:"#ffcccc"}
    break
    case "PUSH32"://stack
    var r= {c: 0, p:1, colour: 1,hexcolour:"#ffcccc"}
    break
    case "DUP0"://stack
    var r= {c: 0, p:1,colour:119,hexcolour:"#ff0066"} // all dups dark gray
    break
    case "DUP1"://stack
    var r= {c: 1, p:2,colour:119,hexcolour:"#ff0066"}
    break
    case "DUP2"://stack
    var r= {c: 2, p:3,colour:119,hexcolour:"#ff0066"}
    break
    case "DUP3"://stack
    var r= {c: 3, p:4,colour:119,hexcolour:"#ff0066"}
    break
    case "DUP4"://stack
    var r= {c: 4, p:5,colour:119,hexcolour:"#ff0066"}
    break
    case "DUP5"://stack
    var r= {c: 5, p:6,colour:119,hexcolour:"#ff0066"}
    break
    case "DUP6"://stack
    var r= {c: 6, p:7,colour:119,hexcolour:"#ff0066"}
    break
    case "DUP7"://stack
    var r= {c: 7, p:8,colour:119,hexcolour:"#ff0066"}
    break
    case "DUP8"://stack
    var r= {c: 8, p:9,colour:119,hexcolour:"#ff0066"}
    break
    case "DUP9"://stack
    var r= {c: 9, p:10,colour:119,hexcolour:"#ff0066"}
    break
    case "DUP10"://stack
    var r= {c: 10, p:11,colour:119,hexcolour:"#ff0066"}
    break
    case "DUP11"://stack
    var r= {c: 11, p:12,colour:119,hexcolour:"#ff0066"}
    break
    case "DUP12"://stack
    var r= {c: 12, p:13,colour:119,hexcolour:"#ff0066"}
    break
    case "DUP13"://stack
    var r= {c: 13, p:14,colour:119,hexcolour:"#ff0066"}
    break
    case "DUP14"://stack
    var r= {c: 14, p:15,colour:119,hexcolour:"#ff0066"}
    break
    case "DUP15"://stack
    var r= {c: 15, p:16,colour:119,hexcolour:"#ff0066"}
    break
    case "DUP16"://stack
    var r= {c: 16, p:17,colour:119,hexcolour:"#ff0066"}
    break
    case "SWAP0"://stack
    var r= {c: 1, p:1,colour:107,hexcolour:"#ff8533"}//all swaps cornsilk
    break
    case "SWAP1"://stack
    var r= {c: 2, p:2,colour:107,hexcolour:"#ff8533"}
    break
    case "SWAP2":
    var r= {c: 3, p:3,colour:107,hexcolour:"#ff8533"}
    break
    case "SWAP3":
    var r= {c: 4, p:4,colour:107,hexcolour:"#ff8533"}
    break
    case "SWAP4":
    var r= {c: 5, p:5,colour:107,hexcolour:"#ff8533"}
    break
    case "SWAP5":
    var r= {c: 6, p:6,colour:107,hexcolour:"#ff8533"}
    break
    case "SWAP6":
    var r= {c: 7, p:7,colour:107,hexcolour:"#ff8533"}
    break
    case "SWAP7":
    var r= {c: 8, p:8,colour:107,hexcolour:"#ff8533"}
    break
    case "SWAP8":
    var r= {c: 9, p:9,colour:107,hexcolour:"#ff8533"}
    break
    case "SWAP9":
    var r= {c: 10, p:10,colour:107,hexcolour:"#ff8533"}
    break
    case "SWAP10":
    var r= {c: 11, p:11,colour:107,hexcolour:"#ff8533"}
    break
    case "SWAP11":
    var r= {c: 12, p:12,colour:107,hexcolour:"#ff8533"}
    break
    case "SWAP12":
    var r= {c: 13, p:13,colour:107,hexcolour:"#ff8533"}
    break
    case "SWAP13":
    var r= {c: 14, p:14,colour:107,hexcolour:"#ff8533"}
    break
    case "SWAP14":
    var r= {c: 15, p:15,colour:107,hexcolour:"#ff8533"}
    break
    case "SWAP15":
    var r= {c: 16, p:16,colour:107,hexcolour:"#ff8533"}
    break
    case "SWAP16":
    var r= {c: 17, p:17,colour:107,hexcolour:"#ff8533"}
    break
    //new opcodes taken from https://github.com/ethereum/pyethereum/blob/develop/ethereum/opcodes.py
    case "CALLBLACKBOX":
    var r= {c: 7, p:1,colour:107,hexcolour:"#a3c2c2"}
    break
    case "STATICCALL":
    var r= {c: 6, p:1,colour:107,hexcolour:"#a3c2c2"}
    break
    case "REVERT":
    var r= {c: 2, p:0,colour:107,hexcolour:"#a3c2c2"}
    break
    //these three opcodes in hex representation too, since this seems to be what they fault on
    case 0xf5://callblackbox
    var r= {c: 7, p:1,colour:107,hexcolour:"#a3c2c2"}
    break
    case 0xfa:
    var r= {c: 6, p:1,colour:107,hexcolour:"#a3c2c2"}
    break
    case 0xfd:
    var r= {c: 2, p:0,colour:107,hexcolour:"#a3c2c2"}
    break

    default:
        console.log("no matching opcode"+opcode)
}
  return r;
}

function modify_structLogs(sLogs){//slogs is the whole of structLogs
  var output=[];
  var step_number=0;
  var stack_origins=[];
  var length = sLogs.length;
  // new link sub graphs idea
  var linkSubGraphs =[];
  var debugarray=[];
  var stepNumNoJump=0;

  for(var i=0; i<length;i++ ){
    // console.log("--------------NEXT STEP--------------"+i)
    output.push(sLogs[i]); //only place it is pushed to
      sLogs[i].step=step_number; //could use i instead?
      step_number+=1;
      c_r = find_add_remove_nums((sLogs[i].op)); //c_r contains the number of things to be removed from stack (c), and the numer to be added (p)(=1)
      c =c_r.c;
      //setting colours for graphs
      var colour = c_r.colour;
      var hexcolour = c_r.hexcolour;
      sLogs[i].colour = colour;
      sLogs[i].hexcolour= hexcolour;

      /*new subgraph idea
        if the stack is empty, then the next step will be the start of a new island
        record the step that it went empty at and tied it back to the one previous
      */
      if(sLogs[i].stack.length==0 || sLogs[i].op=="JUMP" || sLogs[i].op=="JUMPI"){ //if the stack is empty
        //need edge between the last one and this one
        var subgraphEdge = {
          "from": step_number-1,
          "to": step_number
        }
        linkSubGraphs.push(subgraphEdge); // add it to the edge list
      }




      var length_stack_origin= stack_origins.length;
      //set arg_origins for this step as the items that were consumed from the stack,
      //for c=3, the last three things on the stack_origin, for example if stack_origin was [a,b,c,d,e], then arg_origins = [c,d,e]
      sLogs[i].arg_origins=stack_origins.slice((length_stack_origin-c),length_stack_origin);
      var length_arg_origin= sLogs[i].arg_origins.length;//get the lenght of this, should be equal to c?
      //for each of the arg_origins, set a value from the EVM actual stack corresponding to the position of this in the arg_origins
      // for example if EVM stack = [1,2,3,4,5], we now have arg_origins: [c.value=3, d.value = 4, e.value = 5]
      for(var idx=0; idx< length_arg_origin; idx++){
        v=sLogs[i].stack[(length_stack_origin-c+idx)];
        sLogs[i].arg_origins[idx].value=v;
      }
      //update stack_origins
      stack_origins=update_stack_origins(stack_origins,sLogs[i]);


      //for debugging remove
      // proD=c_r.p;
      //
      // var debugstep={
      //   "opcode":sLogs[i].op,
      //   "step":step_number,
      //   "c":c,
      //   "p":proD,
      //   "stack":sLogs[i].stack,
      //   "stack_origins":stack_origins,
      //   "arg_origins":sLogs[i].arg_origins
      // }
      // if(sLogs[i].opcode!= "JUMPDEST"){
      //
      //         debugarray.push(debugstep);
      // }



  }
  
  // console.log("printing subgraphEdges");
  // linkSubGraphs.forEach(function(each){
  //   console.log(JSON.stringify(each))
  // })
  // console.log("printing debugarray");
  // console.log(JSON.stringify(debugarray))

  return output;
}

function update_stack_origins(orig,sLog){
  var opcode=sLog.op;
  //special case if SWAP or DUP as do not produce or consume
  switch(opcode){ //swap does the following:[a,b,c,d] SWAP2 -> [a,d,c,b]
    //dup duplicates: [a,b,c,d] DUP2 -> [a,b,c,d,a,b], OR [a,b,c,d] DUP3 [a,b,c,d,a,b,c]
    //DUP  orig.concat(orig[(orig.length-number)]);
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
  orig=orig.slice(0,(orig_length-c));//now only consider from start to (end-consumed) [a,b,c,d,e,] and c =3, -> [a,b,c]
  var here = origin(1,sLog.step);//returns obj r ={depth: 1, step: <sLogStep>}
  if(p==1){ //only one thing was created to the stack, put this into an array by itself
    var new_elements= new Array(here); // = [{depth: 1, step: <sLogStep>}]
  }
  if(p==0){//nothing new was created
    var new_elements = [];
  }
  orig = orig.concat(new_elements); //what stack_origin was concated with either: [] or [{depth: 1, step: <sLogStep>}]
  //this will then go on to have its value set in the idx loop in modify_structLogs in the next step or pc.
  return orig;

}
function origin(d,s){
  var r ={depth:d, step:s};
  return r;
}
function update_stack_origins_swap(orig,number){
  /*
    say orig = [a,b,c,d,e] and number =2
    x1 = [a,b,c]
    x2 = [d]
    x3 = [d,e]  //slice((5-3+1),(5-1))=slice(3,4)
    x4=[c]
    x5= [a,b,c,d]
    x6=[d,e,c]
    x7= [a,b,c,d,d,e,c]
  */
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
  return output;
}
function modify_diff_depth(_input){ //special version for multidepth
  var output;
  output =modify_structLogs(_input);
  return output;
}
