
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


function getColour(opcode){
  const getColours = require("../../modify_json_depth") // importing so that only change colours in one place
  return getColours.find_add_remove_nums(opcode)
}
