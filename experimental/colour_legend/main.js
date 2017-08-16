
var opcodes =["STOP","ADD","SUB","MUL","DIV","SDIV","MOD","SMOD",
"ADDMOD","MULMOD","EXP","SIGNEXTEND","LT","GT","SLT","SGT",
"EQ","ISZERO","AND","OR","XOR","NOT","BYTE","SHA3",
"ADDRESS","BALANCE","ORIGIN","CALLVALUE","CALLDATALOAD","CALLDATASIZE",
"CALLDATACOPY","CODESIZE","CODECOPY","GASPRICE","EXTCODESIZE","EXTCODECOPY",
"BLOCKHASH","COINBASE","TIMESTAMP","NUMBER","DIFFICULTY","GASLIMIT",
"MLOAD","MSTORE","MSTORE8","SLOAD","SSTORE","JUMP","JUMPI","PC",
"MSIZE","GAS", "JUMPDEST","POP","LOG0","CREATE","CALL","CALLCODE",
"DELEGATECALL","SUICIDE","SELFDESTRUCT","PUSH1","DUP1","SWAP1","CALLBLACKBOX",
"STATICCALL","REVERT"]
console.log("digraph{");
opcodes.forEach(function(each,index){
  var res = getColour(each);
  console.log(index+" [label=\""+each+"\", style=filled, color=\""+res.hexcolour+"\"]")
})
console.log("}")
//now generate a dot file format for this

// console.log
// " "[label=\"",logs[x].op,"\", style=filled, color=",color_string,"]"




function getColour(opcode){
switch(opcode) {
  case "STOP":
  var r= {c: 0, p:0, colour:66,hexcolour:"#800000"} //crimson
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
}
return r;
}
