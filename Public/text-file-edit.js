var clientText = document.getElementById('text-content').innerHTML;
var caret = 3;
var isSaved = true;
var autoSaveTimer;

var invalidCharacters = ["<",">"];
var overriddenCharacters = [" "];  //characters to override default behavior on

//Inserts substring into string at index
function strInsert(string, index, substring){
  if(index<=0){
    return substring+string;
  }
  return string.substring(0,index) + substring + string.substring(index);
}

//Checks if a node is a descendant of another node
//Function based on code by stackoverflow user 'Asaph'
function isDescendant(parent, child){
  if(!parent || !child){
    return false;
  }
  var currentNode = child.parentNode;
  while(currentNode != null){
    if(currentNode == parent){
      return true;
    }
    currentNode = currentNode.parentNode;
  }
  return false;
}

//Checks if a node is in a given tag
function isInTag(node, tag){
  tag = tag.toLowerCase();
  var currentNode = node;
  while(currentNode){
    if(currentNode.tagName && currentNode.tagName.toLowerCase()===tag){
      return true;
    }
    currentNode = currentNode.parentNode;
  }
  return false;
}

// Toggle bold on selected text
function toggleBold(){
  toggleTagOnSelection('b');
  isSaved = false;
}

//Toggle underlining on selected text
function toggleUnderline(){
  toggleTagOnSelection('u');
  isSaved = false;
}

//Returns the indecies of the selection's start and end in clientText
function getTrueIndex(){  //broken
  var selection = document.getSelection();
  var fileContent = document.getElementById('text-content');
  if(isDescendant(fileContent, selection.anchorNode)
    && isDescendant(fileContent, selection.focusNode)){ //is in text-content div
    if(clientText.substring(selection.anchorOffset, selection.anchorOffset+selection.toString().length)===selection.toString()){
      return [selection.anchorOffset, selection.anchorOffset+selection.toString().length];
    }

    var trueStart;
    var trueEnd;
    var foundIndex = false;
    var offset = 0;
    for(var a=0; a<clientText.length; a++){
      if(clientText[a]===">"){  //begin checking from end of tag
        foundIndex = true;
        for(var b=0; b<selection.toString().length; b++){
          if(clientText[a+1+selection.anchorOffset+b+offset]==='<'){ //hit tag in clientText
            offset += clientText.substring(a+1+selection.anchorOffset+b+offset).indexOf('>')+1;
          }
          else if(clientText[a+1+selection.anchorOffset+b+offset]!==selection.toString()[b]){
            foundIndex = false;
            break;
          }
        }
        if(foundIndex){
          offset += selection.toString().length;
          return [a+1+selection.anchorOffset, a+1+selection.anchorOffset+offset];
        }
      }
      // else if(clientText[a]===selection.toString()[0]){ //begin checking from beginning of selection
      //   foundIndex = true;
      //   for(var c=0; c<selection.toString().length; c++){
      //     if(clientText[a+c+offset]==="<"){  //hit tag in clientText
      //       offset += clientText.substring(a+c).indexOf('>')+1;
      //     }
      //     else if(clientText[a+c+offset]!==selection.toString()[c-offset]){
      //       break;
      //     }
      //   }
      //   if(foundIndex){
      //     offset += selection.toString().length;
      //     return [selection.anchorOffset, selection.anchorOffset+offset];
      //   }
      // }
    }
    return null;
  }
  else{
    return null;
  }
}

//Toggle whether the selected text has a certain tag
function toggleTagOnSelection(tag){
  tag = tag.toLowerCase();

  var index = getTrueIndex();
  if(!index){   //end function if selection is not in the field
    return;
  }
  var selection = document.getSelection();
  var indexStart = index[0];
  var indexEnd = index[1];

  console.log("Selection from",indexStart,"to",indexEnd);

  var newClientText = clientText;
  var newSubstring = newClientText.substring(indexStart, indexEnd);
  var hasTag = isInTag(selection.anchorNode, tag) || isInTag(selection.focusNode, tag) || newSubstring.includes("<"+tag+">");
  if(!hasTag){
    newClientText = strInsert(newClientText, indexEnd, "</"+tag+">");
    newClientText = strInsert(newClientText, indexStart, "<"+tag+">");
  }
  else{
    if(newClientText.substring(indexStart-(2+tag.length),indexStart)==="<"+tag+">"){  //tag starts at selection
      console.log("Tag starts at selection");
      if(newClientText.substring(indexEnd, indexEnd+3+tag.length)==="</"+tag+">"){
        newClientText = newClientText.substring(0,indexStart-(2+tag.length))+newClientText.substring(indexStart);
        indexStart -= 2+tag.length;
        newClientText = newClientText.substring(0,indexStart)+newSubstring+newClientText.substring(indexEnd+1);
      }
      else if(newSubstring.includes("</"+tag+">")){
        newSubstring = newSubstring.replace("</"+tag+">","");
        newSubstring += "</"+tag+">";
        newClientText = newClientText.substring(0,indexStart)+newSubstring+newClientText.substring(indexEnd);
      }
      else{
        newClientText = newClientText.substring(0,indexStart-(2+tag.length))+newClientText.substring(indexStart);
        indexStart -= 2+tag.length;
        indexEnd -= 2+tag.length;
        newClientText = newClientText.substring(0,indexStart)+newSubstring+"<"+tag+">"+newClientText.substring(indexEnd);
      }
    }
    else if(newSubstring.includes("<"+tag+">")){  //tag starts in selection
      console.log("Tag starts in selection");
      newSubstring = newSubstring.replace("<"+tag+">","");
      if(newSubstring.includes("</"+tag+">")){
        newSubstring = newSubstring.replace("</"+tag+">","");
        newClientText = newClientText.substring(0,indexStart)+"<"+tag+">"+newSubstring+"</"+tag+">"+newClientText.substring(indexEnd);
      }
      else if(newClientText.substring(indexEnd, indexEnd+3+tag.length)==="</"+tag+">"){
        newClientText = newClientText.substring(0,indexStart)+"<"+tag+">"+newSubstring+newClientText.substring(indexEnd-(3+tag.length));//broken
      }
      else{
        newClientText = newClientText.substring(0,indexStart)+"<"+tag+">"+newSubstring+newClientText.substring(indexEnd);
      }
    }
    else{ //tag starts before selection
      console.log("Tag starts before selection");
      if(newClientText.substring(indexEnd, indexEnd+3+tag.length)==="</"+tag+">"){
        newClientText = newClientText.substring(0,indexStart)+"</"+tag+">"+newSubstring+newClientText.substring(indexEnd-(3+tag.length));//broken
      }
      else if(newSubstring.includes("</"+tag+">")){
        newSubstring = newSubstring.replace("</"+tag+">","");
        newClientText = newClientText.substring(0,indexStart)+newSubstring+"</"+tag+">"+newClientText.substring(indexEnd);
      }
      else{
        newClientText = newClientText.substring(0,indexStart)+"</"+tag+">"+newSubstring+"<"+tag+">"+newClientText.substring(indexEnd);
      }
    }
  }
  updateClientText(newClientText);
}

//Gets the value of 'font-select' and updates the content's class
function updateFontStyle(){
  var content = document.getElementById('text-content');
  var selectedFont = document.getElementById('font-selection').value;
  if(!content.classList.contains(selectedFont)){
    for(var currentClass=0; currentClass<content.classList.length; currentClass++){
      if(content.classList[currentClass].toString().includes('-font')){
        content.classList.remove(content.classList[currentClass]);  //remove existing font
        break;
      }
    }
    content.classList.add(selectedFont);
    isSaved = false;
  }
}

//Sets the selected value of the font menu to the font sent by the server
function setupFontSelection(){
  var divClassList = document.getElementById('text-content').classList;
  var fontSelection = document.getElementById('font-selection');
  if(divClassList.contains("cursive-font")){
    fontSelection.childNodes[1].selected = "selected";
  }
  else if(divClassList.contains("fantasy-font")){
    fontSelection.childNodes[3].selected = "selected";
  }
  else if(divClassList.contains("monospace-font")){
    fontSelection.childNodes[5].selected = "selected";
  }
  else if(divClassList.contains("sans-serif-font")){
    fontSelection.childNodes[7].selected = "selected";
  }
  else if(divClassList.contains("serif-font")){
    fontSelection.childNodes[9].selected = "selected";
  }
  else{   //default: sans-serif
    fontSelection.childNodes[7].selected = "selected";
  }
}

//Updates the file content client-side
function updateClientText(newText){
  if(newText.includes("<script")){
    document.getElementById('text-content').innerHTML = clientText;
  }
  else{
    document.getElementById('text-content').innerHTML = newText;
    clientText = newText;
  }
}

//Types the file content
function keyPressed(event){
  if(!event.ctrlKey){
    var newText;
    if(!invalidCharacters.includes(event.key) && event.key.length===1){ //Key is allowed
      if(overriddenCharacters.includes(event.key)){
        event.preventDefault();
      }
      newText = strInsert(clientText, caret, event.key.toString());
      caret++;
      updateClientText(newText);
      isSaved = false;
    }
    else if(event.key==="Backspace"){ //delete characters
      event.preventDefault();
      if(caret>3){  //avoid deleting first <p>
        if(clientText.charAt(caret-1)===">"){
          var currentChar = '>';
          var currentIndex = caret-1;
          while(currentChar!='<'){  //work backwards until start of tag
            currentIndex--;
            currentChar = clientText.charAt(currentIndex);
          }
          if(clientText.substring(currentIndex, caret)==="<p>"){
            newText = clientText.substring(0, caret-7)+clientText.substring(caret);
          }
          else{
            newText = clientText.substring(0, currentIndex)+clientText.substring();
          }
        }
        else{
          newText = clientText.substring(0,caret-1)+clientText.substring(caret);
          caret--;
          updateClientText(newText);
        }
      }
    }
    else if(event.key==="Enter"){
      newText = strInsert(clientText,caret,"</p><p>");
      caret += 7;
      updateClientText(newText);
    }
    else if(event.key==="ArrowLeft"){
      event.preventDefault();
      if(clientText.charAt(caret-1)===">"){ //hit tag
        var tempCaret = caret;
        while(clientText.charAt(tempCaret)!="<"){ //find beginning of tag
          tempCaret--;
        }
        if(clientText.substring(tempCaret, caret)==="<p>"){
          tempCaret-=4; //skip over '</p>'
        }
        if(tempCaret>3){
          caret=tempCaret;
        }
      }
      else{
        caret--;
      }
    }
    else if(event.key==="ArrowRight"){
      event.preventDefault();
      if(clientText.charAt(caret)==="<"){ //hit tag
        var tempCaret = caret;
        while(clientText.charAt(tempCaret)!=">"){ //find end of tag
          tempCaret++;
        }
        tempCaret++;
        if(clientText.substring(caret, tempCaret)==="</p>"){ // </p>
          tempCaret+=3; //skip over '<p>'
        }
        if(tempCaret<clientText.length){ //not at end of document
          caret = tempCaret;
        }
      }
      else{
        caret++;
      }
    }
  }
  else if(event.key==="s"){ //ctrl+s to save
    event.preventDefault();
    toggleSaveOptions();
    saveContent();
  }
}

// Displays or hides the save options popup
function toggleSaveOptions(){
  var saveOptionsPopup = document.getElementById('save-options-popup');
  if(saveOptionsPopup.style.display==="inherit"){
    saveOptionsPopup.style.display = "none";
  }
  else{
    saveOptionsPopup.style.display = "inherit";
  }
}

//Posts the file to the server
function saveContent(){
  var contentObject = {
    "type": "fileContent",
    "textContent": clientText,
    "font": document.getElementById('font-selection').value
  }
  var request = new XMLHttpRequest();
  request.open("POST", window.location.href);
  request.setRequestHeader("Content-Type", "application/json");
  request.onload = function (){
    if(request.status>=200 && request.status<300){
      isSaved = true;
      showFileSavedPopup();
    }
    else{
      alert("Failed to save, please try again")
    }
  }
  request.send(JSON.stringify(contentObject));
}

//Funciton to be run when save file button is pressed
function saveButtonPressed(){
  saveContent();
  toggleSaveOptions();
}

//Saves the document and uses setTimout to trigger the next autosave
function autoSave(){
  saveContent();
  var timer = parseInt(document.getElementById('autosave-selection').value);
  if(timer>=5){
    autoSaveTimer = setTimeout(autoSave, 60000*timer);
  }
}

//Gets value of autosave selection and starts autosave loop
function updateAutosave(){
  if(autoSaveTimer){
    clearTimeout(autoSaveTimer);
  }
  var timer = parseInt(document.getElementById('autosave-selection').value);
  if(timer>=5){
    autoSaveTimer = setTimeout(autoSave, 60000*timer);
  }
}

//Fade out the fileSaved popup
function fadeFileSavedPopup(){
  var fileSavedPopup = document.getElementById('file-saved-popup');
  // console.log("Opacity:",window.getComputedStyle(fileSavedPopup).getPropertyValue("opacity"));
  if(window.getComputedStyle(fileSavedPopup).getPropertyValue("opacity")<=0){
    fileSavedPopup.style.display = "none";
    fileSavedPopup.style.opacity = 1;
  }
  else{
    fileSavedPopup.style.opacity = window.getComputedStyle(fileSavedPopup).getPropertyValue("opacity") - 0.05;
    setTimeout(fadeFileSavedPopup, 50);
  }
}

//Notifies the user the file has been saved
function showFileSavedPopup(){
  var fileSavedPopup = document.getElementById('file-saved-popup');
  fileSavedPopup.style.display = "inherit";
  setTimeout(fadeFileSavedPopup, 3000);
}


setupFontSelection();

var toggleBoldButton = document.getElementById('bold-button');
toggleBoldButton.addEventListener('mousedown', toggleBold);

var toggleUnderlineButton = document.getElementById('underline-button');
toggleUnderlineButton.addEventListener('mousedown', toggleUnderline);

var fontSelectionMenu = document.getElementById('font-selection');
fontSelectionMenu.addEventListener("change", updateFontStyle);

var saveOptionsButton = document.getElementById('save-options-button');
saveOptionsButton.addEventListener("click", toggleSaveOptions);

var saveFileButton = document.getElementById('save-button');
saveFileButton.addEventListener("click", saveButtonPressed);

var autosaveSelectionMenu = document.getElementById('autosave-selection');
autosaveSelectionMenu.addEventListener("change", updateAutosave);

document.addEventListener("keypress", keyPressed);

document.getElementById('text-content').focus();

window.onbeforeunload = function(){
  if(!isSaved){
    return "Make sure you have saved your work"
  }
};
