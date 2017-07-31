//purpose of this is to test the fact that the DOC VM is not generating any graph tools file

  var sampledotfile="digraph{\n1\n2\n1 -> 2\n}" //this would be coming from database
  var graphtools_color= ["#a3c2c2","#a3c2c2"];
  var graphtools_label=["yurt","yurt"];
  var transHashArray= ["fAKEPIC"]
  const fs = require("fs")


var dotfilepath = "SampleTestPython.dot"
pythonGraphTools(dotfilepath,sampledotfile,graphtools_color,graphtools_label,transHashArray)

function pythonGraphTools(dotfilepath,allGraphsPerTrans,graphtools_color,graphtools_label,transHashArray){
  var spawn = require('child_process').spawn,
      py    = spawn('python', ['python_module.py']);

  //write file to disk temporaily.
  fs.writeFile(dotfilepath,allGraphsPerTrans, function(err){ //must create a file first //2nd param was res_str_dot_no_lbl
    if(err){
      console.log("there was an error writing to file" + err);
    }
    //now send this dot file path to the python module which will make the graph
    console.log("now writing to python module!"+py.pid)
    py.stdin.write(JSON.stringify(dotfilepath)); //sending data to the python process!
    py.stdin.write("\n")
    py.stdin.write(JSON.stringify(graphtools_color)); // sending colours
    py.stdin.write("\n")
    py.stdin.write(JSON.stringify(graphtools_label));//sending opcodes
    py.stdin.write("\n");
    py.stdin.write(JSON.stringify(transHashArray));//sending opcodes
    py.stdin.write("\n");
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
    py.stdout.end();
  }); // on python 'finish'
}
