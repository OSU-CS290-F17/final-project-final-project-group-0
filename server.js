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
function homePage(req, res, next){
  var dataObject = {
    title_bar_id: "main-title-bar",
    page_title: "Generic Company",
    user: currentUser,
    login: "Logout"
  }
  res.status(200).render('home', dataObject);
}
app.get("/", homePage);
app.get("/home", homePage);

//File list page
app.get("/files/:user", function (req, res, next){
  if(req.params.user===currentUser){
    var dataObject = {
      title_bar_id: "secondary-title-bar",
      page_title: currentUser+"'s Files",
      user: currentUser,
      login: "Logout",
      path: req.path
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
              // console.log(files);
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

app.get("files/:user/:file", function (req, res, next){
  console.log("Got file call");
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
                console.log(userFile.content);
                dataObject = {
                  content: userFile.content,
                  font: userFile.font,
                  title_bar_id: "secondary-title-bar",
                  page_title: "File",
                  user: currentUser,
                  login: "Logout"
                };
                next();
                // res.status(200).render('edit-file', dataObject);
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
  console.log(req.originalUrl);
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


app.post("/files/:user", function (req, res, next){
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
                      content: "<p>",
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
        var currentFile = req.path.split("/")[-1];
        console.log(currentFile);
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
// // Creates and returns the html content for a text editing page
// function assembleTextFileContent(requestPath){
//   var user = requestPath.substring(7);
//   user = user.substring(0, user.indexOf("/"));
//   var fileName = requestPath.substring(requestPath.substring(7).indexOf("/")+8);
//   var fileObject = JSON.parse(fs.readFileSync(path.join("Files", user, fileName+".json")));
//   var content = "<div class='content'>";
//   content += fs.readFileSync(path.join(__dirname,"Public","text-file-option-bar.html"));
//   content += "<div id='text-content'>";
//   content += fileObject.content;
//   content += "</div></div>";
//   return content;
// }
//
//
// // Assembles and returns html content for all pages
// function assembleContent(request){
//   var content;
//   var pathArray = request.url.split('/');
//   if(pathArray[1]==="" || pathArray[1]==="home"){   //Main page
//     content = fs.readFileSync("./public/main-page.html");
//   }
//   else if(pathArray[1]==="files"){ //List user's files
//     if(currentUser===pathArray[2] && pathArray.length<=3){
//       content = assembleFileListPage(request.url);
//     }
//     else if(currentUser===pathArray[2]){
//       var fileList = fs.readdirSync(path.join(__dirname,pathArray[1],pathArray[2]));
//       if(fileList.includes(pathArray[3]+'.json')){  //Test if requested file exists
//         content = assembleTextFileContent(request.url);
//       }
//       else{ //File does not exist
//         content = fs.readFileSync("./public/error.html").toString();
//         content = content.replace("_error-title_", "404 Error");
//         content = content.replace("_error-message_","The requested file does not exist.");
//       }
//     }
//     else{ //Not allowed access to given file or file list
//       content = fs.readFileSync("./public/error.html").toString();
//       content = content.replace("_error-title_", "Access Denied");
//       content = content.replace("_error-message_","You do not have permission to access the requested page");
//     }
//   }
//   else{   //404 page
//     content = fs.readFileSync("./public/error.html").toString();
//     content = content.replace("_error-title_", "404 Error");
//     content = content.replace("_error-message_","Something went wrong, please try again later.");
//   }
//   return content;
// }
//
// // Called on POST requests, sends response back
// function serverPostMethod(req, res){
//   var fileObject = [];
//   req.on('data', (chunk) => {   //collect the data sent
//     fileObject.push(chunk);
//   }).on('end', () => {  //run when data is finished
//     fileObject = JSON.parse(Buffer.concat(fileObject).toString());
//     if(fileObject.type==="newFile"){
//       var fileList = fs.readdirSync(path.join(__dirname,"Files",currentUser));
//       var filePath = path.join("Files", currentUser, fileObject.fileName+".json");
//       if(fileList.includes(fileObject.fileName+".json")){ //File already exists
//         res.statusCode = 409;
//         res.statusMessage = "File cannot be created; file with that name exists";
//         res.setHeader("Location", filePath);
//         res.setHeader("Content-Type", "text/plain");
//         res.write("File cannot be created; file with that name exists");
//         res.end()
//       }
//       else{
//         var currentDate = new Date();
//         var year = currentDate.getFullYear();
//         var month = currentDate.getMonth()+1;
//         var day = currentDate.getDate();
//         if(month<10){
//           month = "0"+month;
//         }
//         if(day<10){
//           day = "0"+day;
//         }
//
//         var fileContent = {
//           "date-created": year+"-"+month+"-"+day,
//           "content": "<p>"
//         }
//
//         fs.open(filePath, "w", function (err, fd){
//           if(err){
//             res.statusCode = 500
//             res.statusMessage = "Could not create new file";
//           }
//           else{
//             fs.write(fd, JSON.stringify(fileContent, null, "\n"), function (){});
//             res.statusCode = 201;
//             res.statusMessage = "Successfully created file";
//             res.setHeader("Location", filePath);
//           }
//           res.end();
//           fs.closeSync(fd);
//         });
//       }
//     }
//     else if(fileObject.type==="fileContent"){ //updating file
//       var fileName = req.url.split("/");
//       fileName = fileName[fileName.length-1]; //get last element
//       console.log("Updating",fileName);
//       res.statusCode = 204;
//       res.end();
//     }
//   })
// }
//
//
// // Called on DELETE requests, sends response back without a body
// function serverDeleteMethod(req, res){
//   var toDelete = [];
//   req.on('data', (chunk) => {   //collect the data sent
//     toDelete.push(chunk);
//   }).on('end', () => {  //run when data is finished
//     toDelete = Buffer.concat(toDelete).toString();
//     toDelete = path.join("Files", currentUser, toDelete+".json");
//     fs.unlinkSync(toDelete);
//     res.statusCode = 204;   //code for success, but not sending content
//     res.end();
//   })
// }
//
//
// // Takes request and calls appropriate function
// function serverCall(req, res){
//   if(req.method==="GET"){
//     serverGetMethod(req, res);
//   }
//   else if(req.method==="POST"){
//     serverPostMethod(req, res);
//   }
//   else if(req.method==="DELETE"){
//     serverDeleteMethod(req, res);
//   }
// }
//

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
  console.log("==MongoDB connection established.");
  app.listen(port, function (){
    console.log("==Server started on port "+port+".");
  });
});
