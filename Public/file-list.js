var selecting = false;
var selectedFiles = document.getElementsByClassName('selected');

function askWithPopup(question, leftOption, rightOption){
  var body = document.getElementsByTagName('body')[0];
  var popupBackground = document.createElement("div");
  popupBackground.style.width = "100vw";
  popupBackground.style.height = "100vh";
  popupBackground.style.position = "fixed";
  popupBackground.style.top = "0px";
  popupBackground.style.left = "0px";
  popupBackground.style.backgroundColor = "rgba(0,0,0,0.25)";
  popupBackground.id = "questionBackground";
  body.appendChild(popupBackground);

  var popup = document.createElement("div");
  popup.style.width = "200px";
  popup.style.height = "140px";
  popup.style.position = "fixed";
  popup.style.top = "calc(50vh - 70px)";
  popup.style.left = "calc(50vw - 100px)";
  popup.style.borderRadius = "10px";
  popup.style.backgroundColor = "#ffffff";
  popup.id = "questionPopup";
  body.appendChild(popup);

  var popupQuestion = document.createElement("div");
  popupQuestion.textContent = question;
  popupQuestion.style.fontSize = "25px";
  popupQuestion.style.textAlign = "center";
  popupQuestion.style.marginTop = "20px";
  popup.appendChild(popupQuestion);

  var leftButton = document.createElement("div");
  leftButton.textContent = leftOption;
  leftButton.style.textAlign = "center";
  leftButton.style.fontSize = "15px";
  leftButton.style.width = "90px";
  leftButton.style.display = "inline-block";
  leftButton.style.marginLeft = "6px";
  leftButton.style.marginRight = "2px";
  leftButton.style.marginTop = "50px";
  leftButton.style.border = "1px solid black";
  leftButton.style.borderRadius = "5px";
  popup.appendChild(leftButton);

  var rightButton = document.createElement("div");
  rightButton.textContent = rightOption;
  rightButton.style.textAlign = "center";
  rightButton.style.fontSize = "15px";
  rightButton.style.width = "90px";
  rightButton.style.display = "inline-block";
  rightButton.style.marginLeft = "2px";
  rightButton.style.marginRight = "6px";
  rightButton.style.marginTop = "50px";
  rightButton.style.border = "1px solid black";
  rightButton.style.borderRadius = "5px";
  popup.appendChild(rightButton);

  var userHasResponded = false;
  var userResponse;
  leftButton.addEventListener('click', function (){
    userHasResponded = true;
    userResponse = "left";
  });
  rightButton.addEventListener('click', function (){
    userHasResponded = true;
    userResponse = "right";
  });

  // while(!userHasResponded);   //wait for user response
  popup.removeChild(leftButton);
  popup.removeChild(rightButton);
  popup.removeChild(popupQuestion);
  body.removeChild(popup);
  body.removeChild(popupBackground);
  return userResponse;
}

function showNewFilePopup(){
  var newFilePopup = document.getElementById("popup-background");
  newFilePopup.style.display = "inherit";
  newFilePopup.childNodes[1].style.display = "inherit";
}

function hideNewFilePopup(){
  var newFilePopup = document.getElementById("popup-background");
  newFilePopup.style.display = "none";
  newFilePopup.childNodes[1].style.display = "none";
}

function clearNewFilePopup(){
  var newFileInput = document.getElementById('file-name-input');
  newFileInput.childNodes[3].value = "";
}

function createNewFile(){
  var fileName = document.getElementById('file-name-input').childNodes[3].value;
  var request = new XMLHttpRequest();
  request.open("POST", window.location.href, true);
  request.onload = function (){
    window.location.reload(true);
  };
  request.send(fileName);
  hideNewFilePopup();
  clearNewFilePopup();
}

function selectFiles(){
  var selectButton = document.getElementById('select-files');
  if(!selecting){
    selecting = true;
    selectButton.style.borderRadius = "5px";
    selectButton.style.border = "1px solid black";
  }
  else{
    selecting = false;
    selectButton.style.backgroundColor = "inherit";
    selectButton.style.borderWidth = "0px";
    document.getElementById('delete-files').style.color = "grey";
    while(selectedFiles.length>0){
      selectedFiles[0].classList.remove('selected');
    }
  }
}

function fileClicked(event){
  if(selecting){
    event.preventDefault();
    if(event.target.tagName==="A"){
      event.target.classList.toggle('selected');
      selectedFiles = document.getElementsByClassName('selected');  //update array
      if(selectedFiles.length <= 0){  //check if selectFiles is empty
        document.getElementById('delete-files').style.color = "grey";
      }
      else{
        document.getElementById('delete-files').style.color = "inherit";
      }
    }
  }
}

function deleteSelectedFiles(){
  for(var b=0; b < selectedFiles.length; b++){
    var request = new XMLHttpRequest();
    request.open("DELETE", window.location.href, true);
    request.onload = function (){
      window.location.reload(true);
    };
    request.send(selectedFiles[b].textContent);
  }
}


console.log(askWithPopup("Hello?", "Hello", "Goodbye"));
clearNewFilePopup();

var fileListBox = document.getElementById('file-list');
fileListBox.addEventListener("click", fileClicked);

var addFileButton = document.getElementById('new-file');
addFileButton.addEventListener("click", showNewFilePopup);

var deleteFileButton = document.getElementById('delete-files');
deleteFileButton.addEventListener("click", deleteSelectedFiles);

var selectFileButton = document.getElementById('select-files');
selectFileButton.addEventListener("click", selectFiles);

var submitNewFileButton = document.getElementById('popup-buttons').childNodes[1];
submitNewFileButton.addEventListener("click", createNewFile);

var cancelNewFileButton = document.getElementById('popup-buttons').childNodes[3];
cancelNewFileButton.addEventListener("click", hideNewFilePopup);
