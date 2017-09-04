const helperfunctions = require("./helper_functions.js");
const graph_gen_for_contract = require("./generate_graph_for_contract.js")
const graph_gen_per_transaction=require("./generate_graph_per_transaction.js")

module.exports={
  single_sigma_callback: function(transArr,found_trans,res,_a,_b,_c,isLabel){
    single_sigma_callback(transArr,found_trans,res,_a,_b,_c,isLabel)
  },
  sigmacontractCallback: function(contractTransList,found_trans,res,viewContract,_startBlock,_endBlock){
    sigmacontractCallback(contractTransList,found_trans,res,viewContract,_startBlock,_endBlock)
  },
  single_sigma_callback_each_edge: function(transArr,found_trans,res,_a,_b,_c,isLabel){
    single_sigma_callback_each_edge(transArr,found_trans,res,_a,_b,_c,isLabel)
  }
}

var single_sigma_callback_each_edge = function(transArr,found_trans,res,_a,_b,_c,isLabel){ //_a,_b,_c are dummy variables
  //find in db will either find an empty db or the transaction
  var response_sigma=[];
  if(found_trans.length<transArr.length){//there was nothing found -- was found_trans.length ==0
    res.send("refresh shortly")
    graph_gen_for_contract.gen_graph_promise(transArr)//this function takes an array
  }
  else{
    //now combine, remember there many be more than one since a transaction has several depth levels
    var multiobj = generateSigmaCombinedObject(found_trans) //think problem here! with a jump edge or something
    var transArr=[];
    found_trans.forEach(function(each){
      transArr.push(each.randomHash)
    })
    console.log("transArr "+transArr)
    var titleTrans="";
    for(var index=0; index < transArr.length;index++){
      if(transArr[index]!=null){
        titleTrans=transArr[index].slice(0,transArr.length-3)
        break;
      }
    }
    console.log("titleTrans is "+titleTrans)
    console.log("islabel is "+isLabel)
    if(isLabel == undefined){
      isLabel =0
    }
    console.log("rendering...")
    res.render("sigma_dynamically_add.ejs",{
      isLabel:isLabel,
      titleTrans:titleTrans,
      transArr:transArr,
      num_block:"10000", //dummy values so we can use sigmamulti template
      block_num:"100",
      sigmaobj_multi:multiobj
    })
  }
}


var single_sigma_callback = function(transArr,found_trans,res,_a,_b,_c,isLabel){ //_a,_b,_c are dummy variables
  //find in db will either find an empty db or the transaction
  var response_sigma=[];
  if(found_trans.length<transArr.length){//there was nothing found -- was found_trans.length ==0
    res.send("refresh shortly")
    graph_gen_for_contract.gen_graph_promise(transArr)//this function takes an array
  }
  else{
    //now combine, remember there many be more than one since a transaction has several depth levels
    var multiobj = generateSigmaCombinedObject(found_trans) //think problem here! with a jump edge or something
    var transArr=[];
    found_trans.forEach(function(each){
      transArr.push(each.randomHash)
    })
    console.log("transArr "+transArr)
    var titleTrans="";
    for(var index=0; index < transArr.length;index++){
      if(transArr[index]!=null){
        titleTrans=transArr[index].slice(0,transArr.length-3)
        break;
      }
    }
    console.log("titleTrans is "+titleTrans)
    console.log("islabel is "+isLabel)
    if(isLabel == undefined){
      isLabel =0
    }
    res.render("sigmasingletransaction.ejs",{
      isLabel:isLabel,
      titleTrans:titleTrans,
      transArr:transArr,
      num_block:"10000", //dummy values so we can use sigmamulti template
      block_num:"100",
      sigmaobj_multi:multiobj
    })
  }
}


function generateSigmaCombinedObject(items){
  /*
    this function takes all the items returned from the database and coalates them into one multiobj
    which can be passed to the sigma library on the front end
  */
  var multiobj={//object to store coagulated results
    nodes:[],
    edges:[]
  };
  //NOTE since some ID's are missing since JUMPDEST is missing. must take different approach to lenght
  // to avoid conflict on naming id's
  var realLenghtOfNodes=[];
  for(var rl=0;rl<items.length;rl++){
    realLenghtOfNodes.push(0);//fill with zeroes!
  }
  for(var indexl=0;indexl<items.length;indexl++){ //for each graph passed
    var r_sigma = items[indexl].sigmaobj;
    if(r_sigma!=null){ // if the graph exists
      // console.log("finding real length "+indexl)
      for(var findl=0;findl<r_sigma.nodes.length;findl++){
        var tempnodeobj=parseInt(r_sigma.nodes[findl].id);
        if(tempnodeobj>realLenghtOfNodes[indexl]){
          realLenghtOfNodes[indexl]=tempnodeobj; //set the highest seen to that index in the array
        }
      }
    }
  }
  // console.log("legnth of first array is "+items[0].sigmaobj.nodes.length)
  console.log("realLenghtOfNodes is :"+realLenghtOfNodes)
  //add one to all of realLenghtOfNodes so that none are the same
  for(var p1=0;p1<realLenghtOfNodes.length;p1++){
    realLenghtOfNodes[p1]=  realLenghtOfNodes[p1]+1;
  }
  //now for each item passed, put into multiobj with appropraite index
  for(var i=0;i<items.length;i++){
    //find max value in each r_sigma
    if(items[i].sigmaobj!=null){
      var r_sigma = items[i].sigmaobj; // no toString needed since this is an object
      //for first block just copy over each object to multiobj
      if(i==0){
        for(var i_nodes=0;i_nodes<r_sigma.nodes.length;i_nodes++){
          var tempnodeobj = r_sigma.nodes[i_nodes];
          multiobj.nodes.push(tempnodeobj); // push to combined results object
        }
        for(var i_edges=0;i_edges<r_sigma.edges.length;i_edges++){
          var tempnodeobj=r_sigma.edges[i_edges];
          multiobj.edges.push(tempnodeobj);
        }
      }
      //if second, third fourth,... need to add offset index to each
      if(i>0){
        //add offset length to nodes
        var additional_length_node=0; //this is the offset
        for(var ii=0;ii<i;ii++){ // for the remaining items found in the db
          additional_length_node+=realLenghtOfNodes[ii] // for each of the ones done so far, add onto
        }
        // console.log("additional_length_node on i: "+i+" is "+additional_length_node);
        for(var iii=0; iii<r_sigma.nodes.length;iii++){
          var newnodeid= parseInt(r_sigma.nodes[iii].id) +additional_length_node;
          //r_sigma.nodes[iii].id = newnodeid.toString();
          // console.log("newnodeid is "+ newnodeid)
          //now push to first object
          var oldx = r_sigma.nodes[iii].x;
          var oldy = r_sigma.nodes[iii].y;
          var oldlabel = r_sigma.nodes[iii].label;
          //set colour of each contract differently
          var oldcolor=r_sigma.nodes[iii].color;
          var oldsize = r_sigma.nodes[iii].size;
          multiobj.nodes.push({id: (newnodeid.toString()), x:oldx, y:oldy,label:oldlabel,color:oldcolor,size:oldsize});
        }
        //setting random colours
        var randomColours=[]
        for(var colourIndex=0; colourIndex<=i;colourIndex++){
          var newColour = generateRandomColours()
          randomColours.push(newColour);//get random colour and add to array!
        }
        //now add to each edge additional_length_node and then push to first object
        for(var iiii=0;iiii<r_sigma.edges.length;iiii++){
          var newsource = parseInt(r_sigma.edges[iiii].source)+additional_length_node;
          var newtarget = parseInt(r_sigma.edges[iiii].target)+ additional_length_node;
          var newid = (r_sigma.edges[iiii].id).concat("_",i.toString())
          if(i==1){
            var edgecolour = "rgb(191,65,65)";//red?
          }
          else if(i==2){
            var edgecolour = "rgb(191,182,65)";//gold colour
          }
          else{
            var edgecolour=randomColours[i];//get from array built earlier
            // var edgecolour = "rgb(50,50,30)";//default colour
          }
          multiobj.edges.push({id: newid.toString(),source:newsource.toString(),target:newtarget.toString(),color:edgecolour});
        }
      }
    }
  }
  return multiobj;
}


function generateRandomColours(){
  var rgb1= Math.floor(Math.random()*(255));
  var rgb2= Math.floor(Math.random()*(255));
  var rgb3= Math.floor(Math.random()*(255));
  var edgecolour ="rgb(";
  edgecolour=edgecolour.concat(rgb1.toString(),",",rgb2.toString(),",",rgb1.toString(),")");
  return edgecolour //returns in the form "rgb(x,y,z)"
}

var sigmacontractCallback = function(contractTransList,found_trans,res,viewContract,_startBlock,_endBlock){ // called from find_in_db
  var found_trans_list=[];
  found_trans.forEach(function(trans){//get transactions number from each object found
    found_trans_list.push(trans.transaction_no);
  })
  console.log("Callback: there were: "+found_trans.length + "items found in the db");
  console.log("Callback: we need a min of "+contractTransList.length+" items..")
  Array.prototype.diff = function(a){
    return this.filter(function(i){
      return a.indexOf(i)<0;
    });
  };
  var needToFindTrans=contractTransList.diff(found_trans_list) //need.diff(haveindb)
  if(needToFindTrans.length){ //if there are ones that need to be generated
    console.log("Callback: need to carry out graph gen for these: ");
    needToFindTrans.forEach(function(each){    //printing nicely
      console.log(each)
    })
    graph_gen_per_transaction.gen_graph_promise(needToFindTrans)
  }
  //if all the pictures are in the db
  else{
      console.log("found sufficient items, gonna coagulate now..")
      var multiobj = generateSigmaCombinedObject(found_trans)
      res.render("sigmacontract.ejs",{
        contract:viewContract,
        startBlock:_startBlock,
        endBlock:_endBlock,
        sigmaobj_multi:multiobj
      })
    }
}
