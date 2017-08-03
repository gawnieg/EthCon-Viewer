// print process.argv
var connection ="http://localhost:8545";
process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
  if(index ==2 ){
    connection="http://"+val.toString()+":8545";
  }
});
console.log("connection is "+connection)
const setURL = require("./needsurl.js");

setURL.setURL(connection);
