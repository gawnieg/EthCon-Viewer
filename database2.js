var mp = require('mongodb-promise');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/test";

module.exports={
   save_to_db: function(_block_num,_trans_no,_graph,_graphml,_sigmaobj,_res_str_dot_no_lbl,graphtools_label,graphtools_color,num_return,_graph_depth){
     console.log("module exports: save_to_db called")
    save_to_db(_block_num,_trans_no,_graph,_graphml,_sigmaobj,_res_str_dot_no_lbl,graphtools_label,graphtools_color,num_return,_graph_depth);
  },
  find_in_db: function(_block_num){
    console.log("module exports: find_in_db called")
   find_in_db(_block_num,_trans_no,_graph);
 },
 save_trans_to_db: function(_trans_no,_graph,_graphml,_sigmaobj,_res_str_dot_no_lbl,graphtools_label,graphtools_color,num_return,_graph_depth,_random_hash){
   console.log("module exports: save_trans_to_db called")
  save_trans_to_db(_trans_no,_graph,_graphml,_sigmaobj,_res_str_dot_no_lbl,graphtools_label,graphtools_color,num_return,_graph_depth,_random_hash);
  }
}

// Insert documents
function save_to_db(_block_num,_trans_no,_graph,_graphml,_sigmaobj,_res_str_dot_no_lbl,graphtools_label,graphtools_color,num_return,_graph_depth){ //num return is the totatl depth level for that block, _graph_depth is the exact level for that particular graph
mp.MongoClient.connect("mongodb://127.0.0.1:27017/test")
    .then(function(db){
        return db.collection('test')
            .then(function(col) {
                return col.insert({block_num : _block_num, transaction_no: _trans_no,graph : _graph,graphml:_graphml, sigmaobj:_sigmaobj, simpledot:_res_str_dot_no_lbl,gtlabel: graphtools_label,gtcolor: graphtools_color, blockDepth: num_return,depthLevel:_graph_depth}) //simple dot saved for graph-tools comptability
                    .then(function(result) {
                        //console.log(result);
                         db.close().then(console.log('save_to_db is a success'));
                    })
            })
})
.fail(function(err) {console.log(err);});
}

// for view all trans in contract NOTE DIFFERENT URL
function save_trans_to_db(_trans_no,_graph,_graphml,_sigmaobj,_res_str_dot_no_lbl,graphtools_label,graphtools_color,num_return,_graph_depth,_random_hash){ //num return is the totatl depth level for that block, _graph_depth is the exact level for that particular graph
mp.MongoClient.connect("mongodb://127.0.0.1:27017/trans")
    .then(function(db){
        return db.collection('test')
            .then(function(col) {
                return col.insert({transaction_no: _trans_no,graph : _graph,graphml:_graphml, sigmaobj:_sigmaobj, simpledot:_res_str_dot_no_lbl,gtlabel: graphtools_label,gtcolor: graphtools_color, blockDepth: num_return,depthLevel:_graph_depth,randomHash:_random_hash}) //simple dot saved for graph-tools comptability
                    .then(function(result) {
                        //console.log(result);
                         db.close().then(console.log('save_trans_to_db is a success'));
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
