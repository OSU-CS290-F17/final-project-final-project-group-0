var http = require("http");
var fs = require("fs");
var path = require("path");

var stylesheet = fs.readFileSync("./public/style.css").toString();
var titleScript = fs.readFileSync("./public/title.js").toString();
var fileListScript = fs.readFileSync("./public/file-list.js").toString();
var textFileEditScript = fs.readFileSync("./public/text-file-edit.js").toString();

var currentUser = "Alice";


// Returns a number representing the status code to be sent to the client
function getStatusCode(requestPath){
  var pathArray = requestPath.split('/');
  if(pathArray.length===1 || pathArray[1]==="home" || pathArray.includes("public")){
    return 200;
  }
  else if(pathArray[1]==="files" && pathArray[2]===currentUser){  //Files
    if(pathArray.length<=3){  //File list
      return 200;
    }
    else{ //Specific file
      var fileList = fs.readdirSync(path.join(__dirname, pathArray[1], pathArray[2]));
      if(fileList.includes(pathArray[3])){
        return 200;
      }
      else{
        return 404;
      }
    }
  }
  else if(pathArray[1]==="files"){  //Files for wrong user
    return 403;
  }
  else{
    return 404;
  }
}


// Assembles and returns the <head> tag for the page
function assembleHeader(requestPath){
  var header;
  header = fs.readFileSync("./public/header.html").toString();
  if(requestPath==="/" || requestPath==="/home"){
    header = header.replace("page_title", "Generic Company");
  }
  else if(true){
    header = header.replace("page_title", "User Files");
  }
  return header;
}


// Assembles and returns the title bar at the top of the page
function assembleTitleBar(request){
  var titleBar;
  var path = request.url;

  titleBar = fs.readFileSync("./public/title.html").toString();
  if(currentUser!=="Not Logged In"){   //user is logged in
    titleBar = titleBar.replace(">Login<", ">Logout<");
    titleBar = titleBar.replace("_username_", currentUser+"'s Files");
  }
  else{
    titleBar = titleBar.replace("_username_", currentUser);
  }

  if(path==="/" || path==="/home"){
    titleBar = titleBar.replace("_title-bar-id_", "main-title-bar");
  }
  else{
    titleBar = titleBar.replace("_title-bar-id_", "secondary-title-bar");
  }

  return titleBar;
}


// Creates and returns the html content for the file list page
function assembleFileListPage(requestPath){
  var page = fs.readFileSync("./public/file-list.html");  //page to be returned
  page = page.toString().replace("_user_", requestPath.substring(7));

  var numFiles = 0;
  var fileListString = "";

  var fileList = fs.readdirSync("."+requestPath);
  var currentFileName = "";
  for(var c=0; c < fileList.length; c++){
    if(fileList[c].toString().includes(".json")){
      numFiles++;
      currentFileName = fileList[c].toString().substring(0, fileList[c].toString().length-5);
      fileListString += '<p class="file"><a href="'+requestPath+'/'+currentFileName+'">';
      fileListString += currentFileName+'</a></p>';
    }
  }

  if(numFiles>=1){
    page = page.toString().replace("_file-list_", fileListString);
  }
  else{
    page = page.toString().replace("_file-list_", "<p>No files exist for this user</p>");
  }
  return page;
}


// Creates and returns the html content for a text editing page
function assembleTextFileContent(requestPath){
  var user = requestPath.substring(7);
  user = user.substring(0, user.indexOf("/"));
  var fileName = requestPath.substring(requestPath.substring(7).indexOf("/")+8);
  var fileObject = JSON.parse(fs.readFileSync(path.join("Files", user, fileName+".json")));
  var content = "<div class='content'>";
  content += fs.readFileSync(path.join(__dirname,"Public","text-file-option-bar.html"));
  content += "<div id='text-content'>";
  content += fileObject.content;
  content += "</div></div>";
  return content;
}


function assembleSpreadsheetContent(requestPath){
  //
}


// Assembles and returns html content for all pages
function assembleContent(request){
  var content;
  var fileRegEx = new RegExp("^/files/");
  if(request.url==="/" || request.url==="/home"){   //Main page
    content = fs.readFileSync("./public/main-page.html");
  }
  else if(fileRegEx.test(request.url)){ //List user's files
    if(currentUser===request.url.substring(7)){
      content = assembleFileListPage(request.url);
    }
    else if(currentUser===request.url.substring(7,request.url.substring(7).indexOf("/")+7)){
      content = assembleTextFileContent(request.url);
    }
    else{
      content = "Access denied";
    }
  }
  else{   //404 page
    content = fs.readFileSync("./public/404.html");
  }
  return content;
}


// Called on GET requests, sends response body
function serverGetMethod(req, res){
  res.statusCode = getStatusCode(req.url);
  if(req.url==="/public/style.css"){  //handle css requests
    res.setHeader("Content-Type", "text/css");
    res.write(stylesheet);
  }
  else if(/js$/.test(req.url)){   //handle JS requests
    res.setHeader("Content-Type", "text/js");
    if(/title.js/.test(req.url)){
      res.write(titleScript);
    }
    else if(/file-list.js/.test(req.url)){
      res.write(fileListScript);
    }
    else if(/text-file-edit.js/.test(req.url)){
      res.write(textFileEditScript);
    }
  }
  else{   //handle HTML requests
    res.setHeader("Content-Type", "text/html");
    res.write("<html>\n");
    res.write(assembleHeader(req.url));
    res.write("\n<body>");
    res.write(assembleTitleBar(req));
    res.write(assembleContent(req));
    res.write("\n</body>\n</html>");
  }
  res.end();
}


// Called on POST requests, sends response back
function serverPostMethod(req, res){
  var fileName = [];
  req.on('data', (chunk) => {   //collect the data sent
    fileName.push(chunk);
  }).on('end', () => {  //run when data is finished
    fileName = Buffer.concat(fileName).toString();
    var filePath = path.join("Files", currentUser, fileName);
    filePath += ".json";

    var currentDate = new Date();
    var year = currentDate.getFullYear();
    var month = currentDate.getMonth()+1;
    var day = currentDate.getDate();
    if(month<10){
      month = "0"+month;
    }
    if(day<10){
      day = "0"+day;
    }

    var fileContent = {
      "date-created": year+"-"+month+"-"+day,
      "content": ""
    }

    fs.open(filePath, "w", function (err, fd){
      if(err){
        res.statusCode = 500
        res.statusMessage = "Could not create new file";
      }
      else{
        fs.write(fd, JSON.stringify(fileContent, null, "\n"), function (){});
        res.statusCode = 201;
        res.statusMessage = "Successfully posted";
        res.setHeader("Location", filePath);
      }
      res.end();
      fs.closeSync(fd);
    });
  })
}


// Called on DELETE requests, sends response back without a body
function serverDeleteMethod(req, res){
  var toDelete = [];
  req.on('data', (chunk) => {   //collect the data sent
    toDelete.push(chunk);
  }).on('end', () => {  //run when data is finished
    toDelete = Buffer.concat(toDelete).toString();
    toDelete = path.join("Files", currentUser, toDelete+".json");
    fs.unlinkSync(toDelete);
    res.statusCode = 204;   //code for success, but not sending content
    res.end();
  })
}


// Takes request and calls appropriate function
function serverCall(req, res){
  if(req.method==="GET"){
    serverGetMethod(req, res);
  }
  else if(req.method==="POST"){
    serverPostMethod(req, res);
  }
  else if(req.method==="DELETE"){
    serverDeleteMethod(req, res);
  }
}   //main function which responds to server calls


var server = http.createServer(serverCall);
server.listen(2000, function (){
  console.log("==Server started.");
});
