var mp = require('mongodb-promise');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/test";
//
// // Obtaining a connection
// mp.MongoClient.connect("mongodb://127.0.0.1:27017/test").then(function(db){
//     db.close().then(console.log('success'));
// }, function(err) {
//     console.log(err);
// });

module.exports={
   save_to_db: function(_block_num,_trans_no,_graph,_graphml,_sigmaobj,_res_str_dot_no_lbl,graphtools_label,graphtools_color,num_return){
     console.log("module exports: save_to_db called")
    save_to_db(_block_num,_trans_no,_graph,_graphml,_sigmaobj,_res_str_dot_no_lbl,graphtools_label,graphtools_color,num_return);
  },
  find_in_db: function(_block_num){
    console.log("module exports: find_in_db called")
   find_in_db(_block_num,_trans_no,_graph);
 }
}

// // Read Db stats
// mp.MongoClient.connect("mongodb://127.0.0.1:27017/test")
// .then(function(db){
//     return db.stats().then(function(stats) {
//         console.log(stats);
//         db.close().then(console.log('success'));
//     })
// })
// .fail(function(err) {console.log(err)});

// Insert documents
function save_to_db(_block_num,_trans_no,_graph,_graphml,_sigmaobj,_res_str_dot_no_lbl,graphtools_label,graphtools_color,num_return){
mp.MongoClient.connect("mongodb://127.0.0.1:27017/test")
    .then(function(db){
        return db.collection('test')
            .then(function(col) {
                return col.insert({block_num : _block_num, transaction_no: _trans_no,graph : _graph,graphml:_graphml, sigmaobj:_sigmaobj, simpledot:_res_str_dot_no_lbl,gtlabel: graphtools_label,gtcolor: graphtools_color, blockDepth: num_return}) //simple dot saved for graph-tools comptability
                    .then(function(result) {
                        //console.log(result);
                         db.close().then(console.log('save_to_db is a success'));
                    })
            })
})
.fail(function(err) {console.log(err);});
}

//
// // Read all documents
function find_in_db(_block_num){
mp.MongoClient.connect("mongodb://127.0.0.1:27017/test")
    .then(function(db){
            return db.collection('test')
                .then(function(col) {
                    return col.find({block_num : _block_num}).toArray()
                        .then(function(items) {
                            console.log(items);
                            db.close().then(items);
                        })
            })
})
.fail(function(err) {console.log(err)});
}
//
// // Read each document
// mp.MongoClient.connect("mongodb://127.0.0.1:27017/test")
//     .then(function(db){
//         return db.collection('test')
//             .then(function(col) {
//                 return col.find({a : 1}).each(function(doc) {
//                     console.log(doc);
//                 })
//                 .then(function() {
//                     db.close().then(console.log('success'));
//                 })
//         })
// })
// .fail(function(err) {console.log(err);});
