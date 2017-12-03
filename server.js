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
app.use("/files", express.static(path.join(__dirname,"Public")));


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

app.get("/files/:user", function (req, res, next){
  if(req.user===currentUser){
    var dataObject = {
      title_bar_id: "secondary-title-bar",
      page_title: currentUser+"'s Files",
      user: currentUser,
      login: "Logout",
      path: req.path,
      files: ["File1", "File2"]
    }
    res.status(200).render('file-list', dataObject);
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


// // Creates and returns the html content for the file list page
// function assembleFileListPage(requestPath){
//   var page = fs.readFileSync("./public/file-list.html");  //page to be returned
//   page = page.toString().replace("_user_", currentUser);
//
//   var numFiles = 0;
//   var fileListString = "";
//
//   var fileList;
//   db.collection(currentUser).find({}).toArray(function (err, data){
//     fileList = data;
//     // console.log(data);
//   });
//   var currentFileName = "";
//   return "WIP";
//   // for(var c=0; c < fileList.length; c++){
//   //   if(fileList[c].toString().includes(".json")){
//   //     numFiles++;
//   //     currentFileName = fileList[c].toString().substring(0, fileList[c].toString().length-5);
//   //     fileListString += '<p class="file"><a href="'+requestPath+'/'+currentFileName+'">';
//   //     fileListString += currentFileName+'</a></p>';
//   //   }
//   // }
//   //
//   // if(numFiles>=1){
//   //   page = page.toString().replace("_file-list_", fileListString);
//   // }
//   // else{
//   //   page = page.toString().replace("_file-list_", "<p>No files exist for this user</p>");
//   // }
//   // return page;
// }
//
//
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
//
// // Called on GET requests, sends response body
// function serverGetMethod(req, res){
//   res.statusCode = getStatusCode(req.url);
//   if(req.url==="/public/style.css"){  //handle css requests
//     res.setHeader("Content-Type", "text/css");
//     res.write(stylesheet);
//   }
//   else if(/js$/.test(req.url)){   //handle JS requests
//     res.setHeader("Content-Type", "text/js");
//     if(/title.js/.test(req.url)){
//       res.write(titleScript);
//     }
//     else if(/file-list.js/.test(req.url)){
//       res.write(fileListScript);
//     }
//     else if(/text-file-edit.js/.test(req.url)){
//       res.write(textFileEditScript);
//     }
//   }
//   else{   //handle HTML requests
//     res.setHeader("Content-Type", "text/html");
//     res.write("<html>\n");
//     res.write(assembleHeader(req.url));
//     res.write("\n<body>");
//     res.write(assembleTitleBar(req));
//     res.write(assembleContent(req));
//     res.write("\n</body>\n</html>");
//   }
//   res.end();
// }
//
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
