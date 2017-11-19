var http = require("http");
var fs = require("fs");
var path = require("path");

var stylesheet = fs.readFileSync("./public/style.css").toString();
var titleScript = fs.readFileSync("./public/title.js").toString();
var fileListScript = fs.readFileSync("./public/file-list.js").toString();

var currentUser = "Alice";


function strReplace(mainString, toReplace, newString){
  var substringBefore, substringAfter;
  var isIn = false;
  var a, b;
  for(var a=0; a < mainString.length; a++){
    if(mainString[a]===toReplace[0]){
      isIn = true;
      for(var b=0; b<toReplace.length; b++){
        if(mainString[a+b]!==toReplace[b]){
          isIn = false;
        }
      }
      if(isIn){
        substringBefore = mainString.substring(0, a);
        substringAfter = mainString.substring(a+toReplace.length, mainString.length);
        mainString = substringBefore+newString+substringAfter;
        mainString = strReplace(mainString, toReplace, newString);
      }
    }
  }
  return mainString;
}


function assembleFileListPage(path){
  var page = fs.readFileSync("./public/file-list.html");  //page to be returned
  page = strReplace(page.toString(), "_user_", path.substring(7));

  var fileList = fs.readdirSync("."+path);
  if(fileList.length > 0){
    var fileListString = "";
    var c;
    for(c=0; c < fileList.length; c++){
      fileListString += '<p class="file"><a href="'+path+'/'+fileList[c].toString()+'">';
      fileListString += fileList[c].toString()+'</p>';
    }
    page = strReplace(page.toString(), "_file-list_", fileListString);
  }
  else{
    page = strReplace(page.toString(), "_file-list_", "<p>No files exist for this user</p>");
  }
  return page;
}


function assembleTextFileContent(path){
  //
}


function assembleSpreadsheetContent(path){
  //
}


function getStatusCode(path){
  var validPathsRegex = new RegExp("/$|/home$|^/files/|^/public/");
  if(validPathsRegex.test(path)){
    return 200;
  }
  else{
    return 404;
  }
}


function assembleHeader(path){
  var header;
  header = fs.readFileSync("./public/header.html").toString();
  if(path==="/" || path==="/home"){
    header = strReplace(header, "page_title", "Generic Company");
  }
  else if(true){
    header = strReplace(header, "page_title", "User Files");
  }
  return header;
}


function assembleTitleBar(request){
  var titleBar;
  var path = request.url;

  titleBar = fs.readFileSync("./public/title.html").toString();
  if(currentUser!=="Not Logged In"){   //user is logged in
    titleBar = strReplace(titleBar, ">Login<", ">Logout<");
    titleBar = strReplace(titleBar, "username", currentUser+"'s Files");
  }
  else{
    titleBar = strReplace(titleBar, "username", currentUser);
  }

  if(path==="/" || path==="/home"){
    titleBar = strReplace(titleBar, "_title-bar-id_", "main-title-bar");
  }
  else{
    titleBar = strReplace(titleBar, "_title-bar-id_", "secondary-title-bar");
  }

  return titleBar;
}


function assembleContent(request){
  var content;
  var fileRegEx = new RegExp("^/files/");
  if(request.url==="/" || request.url==="/home"){   //Main page
    content = fs.readFileSync("./public/main-page.html");
  }
  else if(fileRegEx.test(request.url)){ //List user's files
    if(currentUser===request.url.substring(7)){
      // content = fs.readdirSync(request.url);
      content = assembleFileListPage(request.url);
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


function serverGetMethod(req, res){   //called for GET requests
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
}


function serverPostMethod(req, res){
  console.log("Posted");
  res.write("Posted");
}


function serverDeleteMethod(req, res){
  //
}


function serverCall(req, res){
  if(req.method==="GET"){
    serverGetMethod(req, res);
  }
  else if(res.method==="POST"){
    serverPostMethod(req, res);
  }
  else if(req.method==="DELETE"){
    serverDeleteMethod(req, res);
  }
  res.end();
}   //main function which responds to server calls


var server = http.createServer(serverCall);
server.listen(2000, function (){
  console.log("==Server started.");
});

// console.log(/html/.test("public.html"));
