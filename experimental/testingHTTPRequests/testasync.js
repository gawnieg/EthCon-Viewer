const async = require('async');
const request = require('request');

function httpGet(url, callback) {
  const options = {
    url :  url,
    json : true
  };
  request(options,
    function(err, res, body) {
      console.log("calling callback")
      callback(err, body);
    }
  );
}

const urls= [
  "https://etherchain.org/api/block/4000000/tx",
  "https://etherchain.org/api/block/4000001/tx",
  "https://etherchain.org/api/block/4000002/tx"
];

var transHashList=[];

async.map(urls, httpGet, function (err, res){
  if (err) return console.log(err);
  for(var index=0; index<res.length;index++){
    //now exract data of each
    var data_array = res[index].data;
    for(var dataIndex=0; dataIndex<data_array.length;dataIndex++){
      transHashList.push(data_array[dataIndex].hash);
    }
  }
  console.log("got http requests")
  console.log("transHashList is :");
  transHashList.forEach(function(each){
    console.log(each)
  })
  console.log("now continuing doing something else")
});
