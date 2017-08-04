const rp = require("request-promise")
console.log("yurt")
const options = {
  method: 'GET',
  uri: 'http://ropsten.etherscan.io/api',
  qs:{
    module:"account",
    action:"txlist",
    address:"0x88aA042c4AaE423E0F1bb48542b473d1dD20a807",
    startblock:4048908,
    endblock:4048912,
    sort:"asc",
    apikey:"W3ME1J7QWZZS6E82TM8YAZCGN48V2V893"
  }

}

rp(options)
  .then(function (response) {
    // Request was successful, use the response object at will
    console.log(JSON.parse(response))
  })
  .catch(function (err) {
    // Something bad happened, handle the error
  })

console.log("yurt")
