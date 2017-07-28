//start.js

var spawn = require('child_process').spawn,
    py    = spawn('python', ['compute_input.py'],{stdio: 'pipe'}),
    data = [1,2,3,4,5,6,7,8,9],
    dataString = '';
    var samplefp = "./sample.dot"
    var otherfp = "yurt4life"

// py.stdin.pipe(py.stdin)

var hugearray = Create2DArray(10);
for(i=0;i<hugearray.length;i++){
  for(x=0;x<5;x++){
      hugearray[i].push(x);
  }


}
// for(i=0;i < 5; i++){
  py.stdout.on('data', function(data){
    dataString += data.toString();
  });
  py.stdout.on('end', function(){
    console.log('Sum of numbers=',dataString);

  });
  py.stdin.write(JSON.stringify(hugearray));
  py.stdin.write("\n");
  // // py.stdin.end();
  py.stdin.write(JSON.stringify(samplefp));
  py.stdin.end();



  function Create2DArray(rows) {
    var arr = [];
    for (var i=0;i<rows;i++) {
      arr[i] = [];
    }
    return arr;
  }
