var Web3 = require('web3');
var web3 = new Web3();

try{
  web3.setProvider(new web3.providers.HttpProvider('http://146.169.32.151:8545'));
}
catch(err){
console.log("Chucking error" +err);
}
if(web3.isConnected()){
  // console.log("connection sorted to geth")
}


var unrealres ="";
unrealres= getdata();
function getdata(){
  var daycentres = web3.currentProvider.sendAsync({
    method: "debug_traceTransaction",
    params: ["0x0844991a354f761cd5494f81483b38fc5b47af3644c1882a0e31c0776f8ba39d",{}],  //  see docs, was ->params: ['0x272d5cfed972a35437833802595d170cd6288f2f7393d1d57af1a5955ab1dabf',{}]
    jsonrpc: "2.0",
    id:"2"},
      function(err,result){
        if(err){
          console.log(err)
        }
        console.log(JSON.stringify(result.result))
      }
  );

}

//console.log(unrealres);

/*


var unrealres ="";
unrealres= getdata();
function getdata(){
  var daycentres = web3.currentProvider.sendAsync({
    method: "debug_traceTransaction",
    params: ['0xdebd9e7197633c3ebda4d1a4464b5336027c2a68e5f376d26f17434a58c3b7bc',{}],  //  see docs, was ->params: ['0x272d5cfed972a35437833802595d170cd6288f2f7393d1d57af1a5955ab1dabf',{}]
    jsonrpc: "2.0",
    id:"2"},
    function(err,result){
      console.log("have result");
      //console.log(JSON.stringify(result.result));
      return result.result;
  });
  return daycentres;
}
console.log(unrealres);

*/



//what does size indicate?
