var http = require("http");
var fs = require("fs");
var path = require("path");
var express = require("express");
var handlebars = require("express-handlebars");
var mongoClient = require("mongodb").MongoClient;

var stylesheet = fs.readFileSync("./public/style.css").toString();
var titleScript = fs.readFileSync("./public/title.js").toString();
var fileListScript = fs.readFileSync("./public/file-list.js").toString();
var textFileEditScript = fs.readFileSync("./public/text-file-edit.js").toString();

var currentUser = "Alice";
var db;
var app = express();

app.engine('handlebars', handlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname,"Public")));


//Home page
app.get(["/", "/home"], function(req, res, next){
  var dataObject = {
    title_bar_id: "main-title-bar",
    page_title: "Contritum Files",
    user: currentUser,
    login: "Logout"
  }
  res.status(200).render('home', dataObject);
});

//File list page
app.get("/files/:user", function (req, res, next){
  if(req.params.user===currentUser){
    var dataObject = {
      title_bar_id: "secondary-title-bar",
      page_title: currentUser+"'s Files",
      user: currentUser,
      login: "Logout",
    }
    db.collection(currentUser, function (err, col){
      if(err){
        res.status(500).send("Server error when accessing database");
      }
      else{
        col.find({}, function (err, fileCursor){
          if(err){
            res.status(500).send("Server error when accessing database");
          }
          else{
            fileCursor.toArray(function (err, files){
              if(err){
                res.status(500).send("Server error when accessing database");
              }
              else{
                var fileNames = [];
                for(var a=0; a<files.length; a++){
                  fileNames[a] = files[a].name;
                }
                dataObject.files = fileNames;
                res.status(200).render('file-list', dataObject);
              }
            });
          }
        });
      }
    });
  }
  else{
    var dataObject = {
      page_title: "Access Denied",
      title_bar_id: "secondary-title-bar",
      user: currentUser,
      login: "Logout",
      error_title: "Access Denied",
      error_message: "You do not have permission to access the requested page"
    }
    res.status(403).render('error', dataObject);
  }
});

app.get("/files/:user/:file", function (req, res, next){
  if(req.params.user===currentUser){
    db.collection(currentUser, function(err, col){
      if(err){
        res.status(500).send("Server error when accessing database");
      }
      else{
        col.find({name:req.params.file}, function (err, cursor){
          if(err){
            res.status(500).send("Server error when accessing database");
          }
          else{
            cursor.toArray(function (err, fileArray){
              if(err){
                res.status(500).send("Server error when accessing database");
              }
              else if(fileArray.length===0){
                next(); //404 error
              }
              else{
                var userFile = fileArray[0];
                dataObject = {
                  content: userFile.content,
                  font: userFile.font,
                  title_bar_id: "secondary-title-bar",
                  page_title: req.params.file,
                  user: currentUser,
                  login: "Logout"
                };
                res.status(200).render('edit-file', dataObject);
              }
            });
          }
        });
      }
    });
  }
  else{
    var dataObject = {
      page_title: "Access Denied",
      title_bar_id: "secondary-title-bar",
      user: currentUser,
      login: "Logout",
      error_title: "Access Denied",
      error_message: "You do not have permission to access the requested page"
    }
    res.status(403).render('error', dataObject);
  }
});

// 404 page
app.get("*", function (req, res, next){
  var dataObject = {
    page_title: "404 Error",
    title_bar_id: "secondary-title-bar",
    user: currentUser,
    login: "Logout",
    error_title: "404 Error",
    error_message: "Something went wrong, please try again later."
  }
  res.status(404).render('error', dataObject);
})

// POST requests
app.post(["/files/:user", "/files/:user/*"], function (req, res, next){
  if(req.params.user===currentUser){
    var fileObject = [];
    req.on('data', function (chunk){
      fileObject.push(chunk);
    }).on('end', function (){
      fileObject = JSON.parse(Buffer.concat(fileObject).toString());
      if(fileObject.type==="newFile"){
        var fileName = fileObject.fileName;
        db.collection(req.params.user, function (err, col){
          if(err){
            res.status(500).send("Server error when accessing database");
          }
          else{
            col.find({name:fileName}, function(err, fileObject){
              if(err){
                res.status(500).send("Server error when accessing database");
              }
              else{
                fileObject.toArray(function (err, files){
                  if(files.length===0){
                    filePath = req.originalUrl+'/'+fileName;
                    dbFileObject = {
                      name: fileName,
                      dateCreated: new Date().toString(),
                      content: "<p></p>",
                      font: "sans-serif-font"
                    };
                    col.insertOne(dbFileObject, function (err, result){
                      if(err){
                        res.status(500).send("Server error when accessing database");
                      }
                      else{
                        res.status(201).set("Location",filePath).send("");
                      }
                    });
                  }
                  else{
                    res.sendStatus(409);
                  }
                });
              }
            });
          }
        });
      }
      else if(fileObject.type==="fileContent"){
        var currentFile = req.path.split("/");
        currentFile = currentFile[currentFile.length-1];
        db.collection(currentUser, function (err, col){
          if(err){
            res.status(500).send("Server error when accessing database");
          }
          else{
            var updateObject = {
              content: fileObject.textContent,
              font: fileObject.font
            };
            col.updateOne({name:currentFile}, {$set:updateObject}, function (err, cursors){
              if(err){
                res.status(500).send("Server error when accessing database");
              }
              else{
                res.sendStatus(204);  //Success, but does not return a body
              }
            });
          }
        });
      }
    });
  }
  else{
    var dataObject = {
      page_title: "Access Denied",
      title_bar_id: "secondary-title-bar",
      user: currentUser,
      login: "Logout",
      error_title: "Access Denied",
      error_message: "You do not have permission to access the requested page"
    }
    res.status(403).render('error', dataObject);
  }
});

// DELETE requests
app.delete("/files/:user", function (req, res, next){
  if(req.params.user===currentUser){
    db.collection(currentUser, function (err, col){
      if(err){
        res.status(500).send("Server error when accessing database");
      }
      else{
        var reqBody = [];
        req.on('data', function (chunk){
          reqBody.push(chunk);
        }).on('end', function (){
          reqBody = Buffer.concat(reqBody).toString();
          col.deleteOne({name:reqBody}, function (err, result){
            if(err){
              res.status(500).send("Server error when accessing database");
            }
            else{
              res.status(204).end();
            }
          });
        });
      }
    })
  }
  else{
    res.status(403).send("File with that name already exists");
  }
});


var mongoUser = process.env.MONGO_USER;
var mongoPassword = process.env.MONGO_PSWRD;
var mongoHost = process.env.MONGO_HOST;
var mongoDatabase = process.env.MONGO_DB_NAME;
var mongoPort = process.env.MONGO_PORT || 27017;
var mongoURL = 'mongodb://'+mongoUser+':'+mongoPassword+'@'+mongoHost+':'+mongoPort+'/'+mongoDatabase;

var port = process.env.PORT || 2000;


mongoClient.connect(mongoURL, function (err, connection){
  if(err){
    throw(err);
  }
  db = connection;
  console.log("==Database connection established.");
  app.listen(port, function (){
    console.log("==Server started on port "+port+".");
  });
});
