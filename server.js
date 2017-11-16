var http = require("http");
var fs = require("fs");

var stylesheet = fs.readFileSync("./public/style.css").toString();
var titleScript = fs.readFileSync("./public/title.js").toString();


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


function getStatusCode(path){
  return 200;
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
  var currentUser = "Not Logged In";
  if(path==="/" || path==="/home"){
    // currentUser = fs.readFileSync("./files/username.txt").toString();
    titleBar = fs.readFileSync("./public/title.html").toString();
    titleBar = strReplace(titleBar, "username", currentUser);
    if(false){   //user is logged in
      titleBar = strReplace(titleBar, "Login", "Logout");
    }
  }
  else{
    titleBar = "Error";
  }
  return titleBar;
}


function assembleContent(request){
  var content;
  if(request.url==="/" || request.url==="/home"){
    content = fs.readFileSync("./public/main-page.html");
  }
  else{
    content = fs.readFileSync("./public/404.html");
  }
  return content;
}


function serverGetMethod(req, res){
  if(req.url==="/public/style.css"){
    res.statusCode = getStatusCode(req.url);
    res.setHeader("Content-Type", "text/css");
    res.write(stylesheet);
  }
  else if(/js/.test(req.url)){
    res.statusCode = getStatusCode(req.url);
    res.setHeader("Content-Type", "text/js");
    if(req.url==="/title.js"){
      res.write(titleScript);
    }
  }
  else{
    res.statusCode = getStatusCode(req.url);
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
