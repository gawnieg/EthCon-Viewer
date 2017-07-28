Web3 = require("web3");
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://146.169.44.231:8545'));
//this is the mainnet
var block = web3.eth.getBlock(4000000);
console.log(block)
