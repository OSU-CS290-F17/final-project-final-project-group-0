var selecting = false;
var selectedFiles = document.getElementsByClassName('selected');

function confirmDelete(){
  if(selecting){
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
    popupQuestion.textContent = "Are you sure you want to delete the selected file(s)?";
    popupQuestion.style.fontSize = "20px";
    popupQuestion.style.textAlign = "center";
    popupQuestion.style.marginTop = "20px";
    popup.appendChild(popupQuestion);

    var leftButton = document.createElement("div");
    leftButton.textContent = "Yes";
    leftButton.classList += "button";
    leftButton.style.textAlign = "center";
    leftButton.style.fontSize = "15px";
    leftButton.style.width = "90px";
    leftButton.style.display = "inline-block";
    leftButton.style.marginLeft = "6px";
    leftButton.style.marginRight = "2px";
    leftButton.style.marginTop = "20px";
    leftButton.style.backgroundColor = "antiquewhite";
    leftButton.style.border = "1px solid black";
    leftButton.style.borderRadius = "5px";
    popup.appendChild(leftButton);

    var rightButton = document.createElement("div");
    rightButton.textContent = "No";
    rightButton.classList += "button";
    rightButton.style.textAlign = "center";
    rightButton.style.fontSize = "15px";
    rightButton.style.width = "90px";
    rightButton.style.display = "inline-block";
    rightButton.style.marginLeft = "2px";
    rightButton.style.marginRight = "6px";
    rightButton.style.marginTop = "20px";
    rightButton.style.backgroundColor = "antiquewhite";
    rightButton.style.border = "1px solid black";
    rightButton.style.borderRadius = "5px";
    popup.appendChild(rightButton);

    leftButton.addEventListener('click', function (){
      deleteSelectedFiles();
      popup.removeChild(leftButton);
      popup.removeChild(rightButton);
      popup.removeChild(popupQuestion);
      body.removeChild(popup);
      body.removeChild(popupBackground);
    });

    rightButton.addEventListener('click', function (){
      popup.removeChild(leftButton);
      popup.removeChild(rightButton);
      popup.removeChild(popupQuestion);
      body.removeChild(popup);
      body.removeChild(popupBackground);
    });
  }
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
  var fileObject = {
    "type": "newFile",
    "fileName": fileName
  }
  var request = new XMLHttpRequest();
  request.open("POST", window.location.href);
  request.setRequestHeader("Content-Type", "application/json");
  request.onload = function (){
    if(request.status>=200 && request.status<=299){
      var fileListBox = document.getElementById('file-list');
      if(fileListBox.getElementsByClassName('file').length <= 0){
        fileListBox.removeChild(fileListBox.childNodes[2]); //remove 'no files exist' message
      }
      newFileContainer = document.createElement('p');
      newFileContainer.classList.add("file");
      newFileElement = document.createElement('a');
      newFileElement.textContent = fileName;
      newFileElement.href = window.location.href+'/'+fileName;
      console.log("Link:", newFileElement.href);
      newFileContainer.appendChild(newFileElement);
      fileListBox.appendChild(newFileContainer);
    }
    else{
      if(this.statusText==="Conflict"){
        alert("Error: File with that name already exists")
      }
      else{
        alert("Error: "+this.statusText);
      }
    }
  };
  request.send(JSON.stringify(fileObject));
  hideNewFilePopup();
  clearNewFilePopup();
}

function selectFiles(){
  var selectButton = document.getElementById('select-files');
  if(!selecting){
    selecting = true;
    selectButton.style.borderRadius = "3px";
    selectButton.style.padding = "2px";
    selectButton.style.border = "1px solid black";
    selectButton.style.backgroundColor = "orange";
  }
  else{
    selecting = false;
    selectButton.style.backgroundColor = "inherit";
    selectButton.style.padding = "3px";
    selectButton.style.borderWidth = "0px";
    selectButton.style.backgroundColor = "inherit";
    document.getElementById('delete-files').style.color = "#b3b3b3";
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
        document.getElementById('delete-files').style.color = "#b3b3b3";
      }
      else{
        document.getElementById('delete-files').style.color = "inherit";
      }
    }
  }
}

function deleteFile(fileName){
  var request = new XMLHttpRequest();
  request.open("DELETE", window.location.href, true);
  request.onload = function (){
    if(request.status>=200 && request.status<=299){ //delete was successful
      var fileListBox = document.getElementById('file-list');
      fileList = fileListBox.getElementsByClassName('file');
      for(var c=0; c<fileList.length; c++){ //remove file client-side
        if(fileList[c].childNodes[0].textContent===fileName){
          fileListBox.removeChild(fileList[c]);
          break;
        }
      }
      if(fileListBox.getElementsByTagName('p').length <= 0){  //no files remain
        var noFilesNotification = document.createElement('p');
        noFilesNotification.textContent = "No files exist for this user";
        document.getElementById('file-list').appendChild(noFilesNotification);
      }
    }
    else{   //delete request failed
      alert("Something went wrong with the request, please try again.");
    }
  }
  request.send(fileName);
}

function deleteSelectedFiles(){
  document.getElementById('delete-files').style.color = "#b3b3b3";  //grey out 'deleteSelectedFiles' button
  for(var b=0; b < selectedFiles.length; b++){
    deleteFile(selectedFiles[b].textContent);
  }
  selectFiles();
}


clearNewFilePopup();

// Assign event listeners to various buttons
var fileListBox = document.getElementById('file-list');
fileListBox.addEventListener("click", fileClicked);

var addFileButton = document.getElementById('new-file');
addFileButton.addEventListener("click", showNewFilePopup);

var deleteFileButton = document.getElementById('delete-files');
deleteFileButton.addEventListener("click", confirmDelete);

var selectFileButton = document.getElementById('select-files');
selectFileButton.addEventListener("click", selectFiles);

var submitNewFileButton = document.getElementById('popup-buttons').childNodes[1];
submitNewFileButton.addEventListener("click", createNewFile);

var cancelNewFileButton = document.getElementById('popup-buttons').childNodes[3];
cancelNewFileButton.addEventListener("click", hideNewFilePopup);
