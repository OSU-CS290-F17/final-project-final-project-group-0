var http = require("http");
var fs = require("fs");
var path = require("path");

var stylesheet = fs.readFileSync("./public/style.css").toString();
var titleScript = fs.readFileSync("./public/title.js").toString();

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
  var page;   //page to be returned
  var fileList = fs.readdirSync("."+path);
  if(fileList.length > 0){
    var fileListString = "";
    var c;
    for(c=0; c < fileList.length; c++){
      fileListString += '<p><a href="'+path+'/'+fileList[c].toString()+'">';
      fileListString += fileList[c].toString()+'</p>';
    }

    page = fs.readFileSync("./public/file-list.html");
    page = strReplace(page.toString(), "_user_", path.substring(7));
    page = strReplace(page.toString(), "_file-list_", fileListString);
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


function assembleHeader(request){
  var header;
  header = fs.readFileSync("./public/header.html").toString();
  header = strReplace(header, "page_title", "Main Page");
  return header;
}


function assembleTitleBar(request){
  var titleBar;
  var path = request.url;

  titleBar = fs.readFileSync("./public/title.html").toString();
  titleBar = strReplace(titleBar, "username", currentUser);
  if(currentUser!=="Not Logged In"){   //user is logged in
    titleBar = strReplace(titleBar, ">Login<", ">Logout<");
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


function serverGetMethod(req, res){
  res.statusCode = getStatusCode(req.url);
  if(req.url==="/public/style.css"){
    res.setHeader("Content-Type", "text/css");
    res.write(stylesheet);
  }
  else if(/js$/.test(req.url)){
    res.setHeader("Content-Type", "text/js");
    if(/title.js/.test(req.url)){
      res.write(titleScript);
    }
  }
  else{
    res.setHeader("Content-Type", "text/html");
    res.write("<html>\n");
    res.write(assembleHeader(req));
    res.write("\n<body>");
    res.write(assembleTitleBar(req));
    res.write(assembleContent(req));
    res.write("\n</body>\n</html>");
  }
}


function serverCall(req, res){
  if(req.method==="GET"){
    serverGetMethod(req, res);
  }
  res.end();
}


var server = http.createServer(serverCall);
server.listen(2000, function (){
  console.log("==Server started.");
});

// console.log(/html/.test("public.html"));
