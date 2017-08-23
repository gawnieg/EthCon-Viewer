var http = require('http');
var formidable = require('formidable');
var fs = require('fs');
const express = require('express')
const app = express()


/*
http.createServer(function (req, res) {
  if (req.url == '/fileupload') {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      var oldpath = files.filetoupload.path;
      console.log("oldpath is "+oldpath)
      var newpath ="./fileuploads/"+files.filetoupload.name;
      console.log("newpath is "+newpath)
      fs.rename(oldpath, newpath, function (err) {
        if (err) throw err;
        res.write('File uploaded and moved!');
        res.end();
      });
 });
  } else {
    console.log("serving upload page")
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
    res.write('<input type="file" name="filetoupload"><br>');
    res.write('<input type="submit">');
    res.write('</form>');
    return res.end();
  }
}).*/
app.get("/uploadfile",function(req,res){
  console.log("serving upload page")
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
  res.write('<input type="file" name="filetoupload"><br>');
  res.write('<input type="submit">');
  res.write('</form>');
  return res.end();
})

app.post("/fileupload",function(req,res){
  console.log("file upload route called")
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    var oldpath = files.filetoupload.path;
    console.log("oldpath is "+oldpath)
    var newpath ="./fileuploads/"+files.filetoupload.name;
    console.log("newpath is "+newpath)
    fs.rename(oldpath, newpath, function (err) {
      if (err) throw err;
      res.write('File uploaded and moved!');
      res.end();
      console.log("now processing file");
      try{
        var static_json = require(newpath); //requiring it
        console.log("loaded static json"); // can now use static_json as normally geth gained file

      }
      catch(err){
        console.log("error requiring json "+err)
        res.write("json format not correct, check and try again!")
        res.end()
      }
    });
  });
}) // end of fileupload route

app.listen(8080, function(){
  console.log("app up on 8080")
})
