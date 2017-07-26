const test = require("./generate_graph.js");
// Web3 = require("web3");
// var web3 = new Web3();
// web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

//
//
// function getTransID(block,pos_in_array){
//   var trans_list = web3.eth.getBlock(block);
//   trans_list=trans_list.transactions;
//   return trans_list[pos_in_array];
// }
// console.log(getTransID(1198850,0))
console.log(test.getTransHash(1198850,1))
