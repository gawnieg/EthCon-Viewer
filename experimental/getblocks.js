var Web3 = require('web3');
var web3 = new Web3();

try{
  web3.setProvider(new web3.providers.HttpProvider('http://146.169.44.231:8545'));
}
catch(err){
console.log("Chucking error" +err);
}


var newcall = function(err,result){
  if(result.result==undefined){
    console.log("bad egg")
  }
//  console.log(result.result)
}

var unrealres ="";
unrealres= getdata();
function getdata(){
  var daycentres = web3.currentProvider.sendAsync({
    method: "debug_traceTransaction",
    params: ["0x6afbe0f0ea3613edd6b84b71260836c03bddce81604f05c81a070cd671d3d765",{}],  //  see docs, was ->params: ['0x272d5cfed972a35437833802595d170cd6288f2f7393d1d57af1a5955ab1dabf',{}]
    jsonrpc: "2.0",
    id:"2"},
      function(err,result){
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
