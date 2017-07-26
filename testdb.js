const db = require("./database.js");
//
// var the_cat = "blah ";
// var the_graph = "class viper"
// //db.save_to_db(the_cat,the_graph);
//
// db.save_to_db("large block num","res_str");
//db.find_in_db(the_cat);

//testing out writing to string instead of console
/*
var logs={
  yurt: [1,2,3],
  forlife: "og"
}
var first = (logs.yurt[2]).toString();
console.log(first)
var res ="very nice ";
res= res.concat(first);
//res.concat("unreal");
console.log(res);
*/

// var isMomHappy = true;
//
// // Promise
// var willIGetNewPhone = new Promise(
//     function (resolve, reject) {
//         if (isMomHappy) {
//             var phone = {
//                 brand: 'Samsung',
//                 color: 'black'
//             };
//             resolve(phone);
//         } else {
//             var reason = new Error('mom is not happy');
//             reject(reason);
//         }
//
//     }
// );
//
//
// // call our promise
// var askMom = function () {
//     willIGetNewPhone
//         .then(function (fulfilled) {
//             // yay, you got a new phone
//             console.log(fulfilled);
//         })
//         .catch(function (error) {
//             // ops, mom don't buy it
//             console.log(error.message);
//         });
// }
//
// askMom();



// const otherm = require("./testpromise.js")
//
// console.log("calling promise now")
//
// otherm.daycent_promise("me","lol").then(function(res,err){
//   console.log(res);
//   if(err!=null){
//     console.log("there was an error"+err)
//   }
// })
//
// console.log("other stuff")
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/test";


// search_for_block(find,printit);

var printit = function(data){
  console.log(data)
}



function search_for_block(_block_num,printit){ // not done with promises
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    db.collection("test").findOne({block_num: _block_num}, function(err, result) {
      if (err) throw err;
      if(result){
        var resultstr=result.graph;
        resultstr=resultstr.toString();
      //  console.log(JSON.stringify(resultstr))
    console.log(resultstr)
      //  console.log("found match for block"+_block_num+JSON.stringify(result)+" in DB so will not add to database!");
        db.close();
      }
      else{ // if there is no matching block with that number
        console.log("found nothing in DB so adding block no. "+_block_num +" to db ");
        //add the specified graphs to the database
      //  add_blocks_graph_to_db(_block_num,num_block);
      }

    });
  });
}

var mp = require('mongodb-promise');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/test";
var find = 1193420;
find_in_db(find)

// // Read all documents
function find_in_db(_block_num){
mp.MongoClient.connect("mongodb://127.0.0.1:27017/test")
    .then(function(db){
            return db.collection('test')
                .then(function(col) {
                    return col.find({block_num : _block_num}).toArray()
                        .then(function(items) {
                          if(items.length){
                            console.log(items.length)
                            console.log("found item")
                          //  console.log(items);
                            db.close()
                            .then(function(){
                               console.log("yurt")
                            })
                            .then(function (){
                                console.log("yurt for life")
                            });
                          }
                          else{
                            console.log("none");
                          }

                        })

            })
})
.fail(function(err) {console.log(err)});
}
