app.get("/api/graphtools",function(req,res){ // route for graphtools static file generation and display using python graph tools library
  var block_num = req.query.block_num; // read in from URL
  var num_block = req.query.num_block;
  var graph_tools_array=[];//to store results from database
  var graph_tools_str="";
  var num_of_pics_to_render=0; // number of pics that the front end will render
  console.log("-----------NEW BROWSER REQUEST FOR PYTHON GRAPH TOOLS VIZ-------------")
  console.log("received request for block_num:" + block_num +" ,num_block:" + num_block);
  var block_num_int = parseInt(block_num)
  var num_block_int = parseInt(num_block);
  var last_loop_block=block_num_int+num_block_int;
  var last_block_to_search= last_loop_block.toString(); // for use in mongo search
  var first_block_to_search = block_num_int.toString();
  // console.log("first_block_to_search is " + first_block_to_search + " last_block_to_search "+last_block_to_search)

  //generate a list against which to check the db for blocks
  var block_rollcall =[];
  //loop to fill block_rollcall - this is an array of the
  for(var block_present=block_num_int; block_present<=last_block_to_search; block_present++){
    var add_to_rollcall=block_present.toString();
    block_rollcall.push(add_to_rollcall);
  }
  console.log("rollcall is "+block_rollcall)


  mp.MongoClient.connect(url)
    .then(function(db){
            return db.collection('test')
                .then(function(col) {
                    return col.find({block_num : {$gte:first_block_to_search,$lte:last_block_to_search}}).toArray() //search and return blocks within range
                        .then(function(items) {
                          if(items.length){
                            console.log("found "+items.length+" items for this block in DB!")
                            //now check who is absent from the block roll call
                            var need_to_get_blocks=[];
                            var have_these_blocks=[];
                            //firstly form a list of the blocks present in the db search results
                            for(var check_index=0; check_index<items.length; check_index++){
                                // console.log("in the db we have: "+ items[check_index].block_num)
                                have_these_blocks.push(items[check_index].block_num);
                            }
                            // now check which blocks are not in the list
                            Array.prototype.diff = function(a){
                              return this.filter(function(i){
                                return a.indexOf(i)<0;
                              });
                            };
                            need_to_get_blocks = block_rollcall.diff(have_these_blocks);
                            console.log("the need_to_get_blocks array is :"+ need_to_get_blocks);
                            //then go get these blocks
                            for(var need_block=0;need_block<need_to_get_blocks.length;need_block++){
                              var get_this_block = need_to_get_blocks[need_block];
                              console.log("Going off and getting these blocks (server.js) calling add_blocks_graph_to_db for: "+ get_this_block);
                              add_blocks_graph_to_db(get_this_block,1);// 1 is blank does nt matter what
                            }






                            db.close()
                          .then(function(){







                            num_of_pics_to_render = items.length; // this is then passed out to front end
                            var are_all_graph_pics_ready =[]; //array to store graph_gen_perf values, one position in the array for each block
                            //create arrays for storing the color descriptors - these are sent to the python module
                            var graphtools_color=[];
                            var graphtools_label= [];
                            var depth_per_block =[];//array to store the depth per block - to help produce python naming
                            var blocks_with_graphs=[];//array to store blocks that have graphs - also for python naming
                            for(i=0;i<items.length;i++){
                              // console.log("adding "+i +"graph to graph_tools_str");
                              var r = items[i].simpledot;//get simpledot out of it, required for graphtools
                              if(r==null){//if there was no transactions in that graph
                                continue;
                                //should we put num_of_pics_to_render -1 here?
                              }
                              graphtools_color.push(items[i].gtcolor); //fill array with colour
                              graphtools_label.push(items[i].gtlabel);
                              depth_per_block.push(items[i].blockDepth);//fill with block depth
                              blocks_with_graphs.push(items[i].block_num);//if block 100 has ten graphs, it will appear here ten times
                              r=r.toString(); //get to string of simpledot
                              graph_tools_str=  graph_tools_str.concat(r); //instead of array, creating one big file that will be sperated out accordin to dot format in python module!
                              are_all_graph_pics_ready.push(items[i].generated_gt_pic); //see if we need to generate graph with graph tools
                            }
                            var need_to_run_graph_pic_gen =0; // if this is non zero, the graphs will be generated for these blocks
                            //check all values are 1 in the are_all_graph_pics_ready array generated above
                            for(var check_g=0; check_g<are_all_graph_pics_ready.length;check_g++){
                              if(are_all_graph_pics_ready[check_g]!=1){
                                console.log("additional graphs pics need to be generated!");
                                need_to_run_graph_pic_gen=1; // setting variable to true
                              }
                            }

                            console.log("blocks_with_graphs"+blocks_with_graphs)




                            if(need_to_run_graph_pic_gen){ //was !graph_gen_perf
                              console.log("generating file name(s), writing file, sending filename to python graph tools which will generate a pic in /public/pics")
                              /*
                                1. generate name for temp file, this fill has the simpledot's concated
                                2. write file to disk.
                                3. send file name to python, send colours and labels
                                4. wait for python to generate graph_tools graph_tools
                                5. delete temp file

                              */
                              var spawn = require('child_process').spawn,
                                  py    = spawn('python', ['generate_graph_tools_graph.py']);

                              var dotfilepath=block_num.toString(); // for some reason phython is requiring that it be in the same directory
                              // dotfilepath=dotfilepath.concat("_",pic_gen)
                              dotfilepath=dotfilepath.concat(".dot");
                              // var sampledotfile="digraph{\n1\n2\n1 -> 2\n}" //this would be coming from database
                              //write file to disk temporaily.
                              console.log("saving to" + dotfilepath)
                              fs.writeFile(dotfilepath,graph_tools_str, function(err){ //must create a file first
                                if(err){
                                  console.log("there was an error writing to file" + err);
                                }
                                //now send this dot file path to the python module which will make the graph
                                console.log("now writing to python module")
                                console.log("blocks_with_graphs is :"+blocks_with_graphs)
                                py.stdin.write(JSON.stringify(dotfilepath)); //sending data to the python process!
                                py.stdin.write("\n")
                                py.stdin.write(JSON.stringify(graphtools_color)); // sending colours
                                py.stdin.write("\n")
                                py.stdin.write(JSON.stringify(graphtools_label));//sending opcodes
                                py.stdin.write("\n")
                                py.stdin.write(JSON.stringify(depth_per_block)); // to help with naming process
                                py.stdin.write("\n")
                                py.stdin.write(JSON.stringify(blocks_with_graphs)); // to help with naming
                                py.stdin.end();
                              });
                              var dataString=""; //variable to store return from python module
                              py.stdout.on('data', function(data){ // listen for data coming back from python!
                                dataString += data.toString();
                              });

                              py.stdout.on('end', function(){ //pythons stdout has finished - now do stuff
                                console.log(dataString); // print out everything collected from python stdout
                                //now delete temp dot file (with all dot files in it)
                                fs.stat(dotfilepath, function (err, stats) { //check first if there is a dot file
                                  console.log(stats);//here we got all information of file in stats variable
                                  if (err) {
                                      return console.error(err);
                                  }
                                  fs.unlink(dotfilepath,function(err){ //actually deleting comment this functiont to not delete
                                       if(err) return console.log(err);
                                       console.log('file deleted successfully');
                                  });//end unlink
                                });//end file stat
                                //now add the fact that this block has generated a pic to database UPDATE
                                //moving thos to python module to make sure this is done synchrnously
                                mp.MongoClient.connect(url)
                                  .then(function(db){
                                          return db.collection('test')
                                              .then(function(col) {//{block_num :block_num},{$set:{generated_gt_pic:"1"}},{multi:true}
                                                  return col.update({block_num : {$gte:first_block_to_search,$lte:last_block_to_search}},{$set:{generated_gt_pic:"1"}},{multi:true})//{block_num : {$gte:first_block_to_search,$lte:last_block_to_search}}
                                          })
                                })
                                .fail(function(err) {console.log(err)});
                                py.stdout.end();
                              }); // on python 'finish'
                            } //end of if
                          else{ // else if no pics need to be generated
                            console.log("already generated graphs for this block")
                            //would usually render here switched to try loop for blocks
                            console.log("rendering to screen, should show "+num_of_pics_to_render)
                              // console.log("already generated graphs for this block")
                              //insert db query in  here to get transaction hash from block
                            var trans_num =[];
                            mp.MongoClient.connect(url)
                                .then(function(db){
                                        return db.collection('test')
                                            .then(function(col) {
                                                return col.find({block_num : {$gte:first_block_to_search,$lte:last_block_to_search}}).toArray()
                                                    .then(function(items) {
                                                      for(var item_t=0;item_t<items.length;item_t++){
                                                        trans_num.push(items[item_t].transaction_no);
                                                      }
                                                      console.log("found trans_num to be: "+trans_num)
                                                      console.log("block_num:"+block_num)
                                                      res.render("graphtoolsview.ejs",{
                                                        trans_list:trans_num,
                                                        block_num:block_num,
                                                        num_block:num_block,
                                                        num_pics:num_of_pics_to_render
                                                      });
                                                      db.close();
                                                    })
                                        })
                            })
                            .fail(function(err) {console.log(err)});
                          /* render was here */
                          }
                        })//end of .then
                          } //end if results there is from db search
                    //else database search did not find anything
                    else{
                      console.log("found nothing in DB so adding block no. " +" to db ");
                      for(bn=block_num_int;bn<last_block_to_search;bn++){
                          bn=bn.toString()
                          add_blocks_graph_to_db(bn,1);// 1 is blank does nt matter what was block_num as first param
                      }

                      // res.send("The blocks were not in the database, therefore have been fetched from the blockchain, parsed, etc. Please refresh to generate and view the graph tool visualisation");
                      // res.end();
                      res.render("graph_tools_waiting.ejs"); // page that refreshes after 15 seconds
                    }

                })

            })
  })
  .fail(function(err) {console.log(err)});
})//end of express route
