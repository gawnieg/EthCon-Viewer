//file that needs url
Web3 = require("web3");
var web3 = new Web3();


module.exports={
  setURL: function(input){
    gethURL=input;
    establishGethConnection(gethURL)
  }
}

function establishGethConnection(gethURL){
  console.log("connect to geth with "+gethURL);
  web3.setProvider(new web3.providers.HttpProvider(gethURL));
  if(web3.isConnected()){
    console.log("connection successful")
  }

}
