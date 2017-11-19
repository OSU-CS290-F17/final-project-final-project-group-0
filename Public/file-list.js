var selecting = false;
var selectedFiles = document.getElementsByClassName('selected');

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

function createNewFile(){   //completely broken
  var fileName = document.getElementById('file-name-input').childNodes[3].value;
  var xhr = new XMLHttpRequest();
  xhr.open("POST", window.location.href, true);
  xhr.onreadystatechange = function () {
    if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
      console.log(xhr.responseText);
    }
  };
  xhr.send(fileName);
  // var request = new XMLHttpRequest();
  // request.open("POST", window.location.host, true);
  // request.send(fileName);
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
    request.open("DELETE", selectedFiles[a].textContent, true);
    request.send(NULL);
  }
  if(selectFiles.length>0){
    window.location.reload(true);
  }
}


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
