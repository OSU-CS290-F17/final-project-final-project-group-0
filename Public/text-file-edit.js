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

// =============================================================================
// Toggle bold on selected text
function toggleBold(){
  // toggleTagOnSelection('b');
  getTrueIndex();
}

//Toggle underlining on selected text
function toggleUnderline(){
  toggleTagOnSelection('u');
}

//returns array representing which child node is in parent
function nodePositionInParent(parent, node){
  var isDirectDescendant = false;
  var index;
  var indirectParent;
  for(var a=0; a<parent.childNodes.length; a++){
    if(parent.childNodes[a]===node){
      index = a;
      isDirectDescendant = true;
      break;
    }
    else if(isDescendant(parent.childNodes[a],node)){
      indirectParent = parent.childNodes[a];
      index = a;
      break;
    }
  }
  if(isDirectDescendant){ //node is one layer deep
    return [index];
  }
  else{
    var array = nodePositionInParent(indirectParent, node);
    array.unshift(index);
    return array;
  }
}

//Returns index in clientText where node starts
function indexOfNode(node){
  var fileTextNode = document.getElementById('text-content');
  var childArray = nodePositionInParent(fileTextNode, node);
  console.log("Child array:", childArray);

  var currentTagDepth = 0;
  var currentPositionArray = [];
  var inTagName = false;
  for(var a=0; a<clientText.length; a++){ //loop through clientText
    if(!inTagName && clientText.charAt(a)==="<"){ //hit start or end of tag
      if(clientText.charAt(a+1)==="/"){ //hit end of tag
        console.log("Tag ends at",a);
        currentTagDepth--;
        currentPositionArray.pop();
      }
      else{
        currentTagDepth++;  //move down tag depth
        if(currentPositionArray.length<currentTagDepth){
          currentPositionArray.push(0);
        }
        else{
          currentPositionArray[currentTagDepth-1] += 1; //increment array at currentTagDepth
        }
        if(currentPositionArray.toString()===childArray.toString()){  //if loop has reached correct point
          return a;
        }
      }
      inTagName = true;
    }
    else if(inTagName && clientText.charAt(a)===">"){
      inTagName = false;
    }
  }
  console.error("Could not find node index");
  return 0;
}

//Returns index in 'node.innerHTML' where index should be
function trueIndexInNode(node, index){
  var inTag = 0;
  var inTagName = false;
  var indexOutOfTags = 0;
  var text = node.innerHTML;
  text = text.replace('<span id="caret"></span>', "");
  for(var a=0; a<text.length; a++){
    if(inTag!==0 && text.charAt(a)==="<" && text.charAt(a+1)==="/"){
      inTag--;
      inTagName = true;
    }
    else if(!inTagName && text.charAt(a)==="<"){
      inTag++;
      inTagName = true;
    }
    else if(inTagName && text.charAt(a)===">"){
      inTagName = false;
    }
    else if(!inTagName && inTag===0){
      indexOutOfTags++;
      if(indexOutOfTags === index+1){
        return a;
      }
    }
  }
  return a;
}

//Returns the indecies of the selection's start and end in clientText
function getTrueIndex(){
  var selection = document.getSelection();
  var trueStart = indexOfNode(selection.anchorNode.parentElement);
  trueStart += selection.anchorNode.parentElement.tagName.length + 2;  //account for '<tag>'
  trueStart += trueIndexInNode(selection.anchorNode.parentElement, selection.anchorOffset);
  var trueEnd = indexOfNode(selection.focusNode.parentElement);
  trueEnd += selection.focusNode.parentElement.tagName.length+2; //account for '<tag>'
  trueEnd += trueIndexInNode(selection.focusNode.parentElement, selection.focusOffset);
  console.log("Selection from",trueStart,"to",trueEnd);
  return [trueStart, trueEnd];
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

//Updates the file content client-side
function updateClientText(newText){
  if(newText.includes("<script")){
    document.getElementById('text-content').innerHTML = clientText;
  }
  else{
    document.getElementById('text-content').innerHTML = strInsert(newText, caret, "<span id='caret'></span>");
    clientText = newText;
    isSaved = false;
  }
  showCaret();
}

//Update caret variable on click
function updateCaretPosition(){
  var selection = document.getSelection();
  if(selection.isCollapsed){
    caret = getTrueIndex()[0];
    showCaret();
  }
}

//Insert caret at corret location
function showCaret(){
  var tempString = document.getElementById('text-content').innerHTML;
  tempString = tempString.replace('<span id="caret"></span>', "");
  tempString = strInsert(tempString, caret, '<span id="caret"></span>');
  document.getElementById('text-content').innerHTML = tempString;
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
          var currentIndex = caret-1;
          while(clientText.charAt(currentIndex)!='<'){  //work backwards until start of tag
            currentIndex--;
          }
          if(clientText.substring(currentIndex, caret)==="<p>"){  //delete newline
            newText = clientText.substring(0, caret-7)+clientText.substring(caret);
            caret -= 7;
          }
          else{
            newText = clientText.substring(0, currentIndex-1)+clientText.substring(currentIndex);
            caret = currentIndex-1;
          }
          showCaret();
          updateClientText(newText);
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
        var tempCaret = caret-1;
        while(clientText.charAt(tempCaret)!="<"){ //find beginning of tag
          tempCaret--;
        }
        if(clientText.substring(tempCaret, caret)==="<p>"){
          tempCaret-=3; //skip over '</p>'
        }
        if(tempCaret>=4){
          caret=tempCaret-1;
        }
      }
      else{
        caret--;
      }
      showCaret();
    }
    else if(event.key==="ArrowRight"){
      event.preventDefault();
      if(clientText.charAt(caret)==="<" || clientText.charAt(caret+1)==="<"){ //hit tag
        var tempCaret = caret+1;
        while(clientText.charAt(tempCaret)!=">"){ //find end of tag
          tempCaret++;
        }
        tempCaret++;
        if(clientText.substring(caret, tempCaret)==="</p>"){ //newline
          tempCaret+=3; //skip over '<p>'
        }
        else if(clientText.substring(caret+1, tempCaret)==="</p>"){
          tempCaret-=4;
        }
        if(tempCaret<clientText.length-3){ //prevent running off end of document
          caret = tempCaret;
        }
        else{
          caret = clientText.length-4;
        }
      }
      else{
        caret++;
      }
      showCaret();
    }
  }
  else if(event.key==="s"){ //ctrl+s to save
    event.preventDefault();
    saveContent();
  }
}

// =============================================================================
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

// =============================================================================
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


showCaret();
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

// document.getElementById('text-content').focus();
// document.getElementById('text-content').addEventListener("click", updateCaretPosition);

//Warn user if they try to leave without saving
window.onbeforeunload = function(){
  if(!isSaved){
    return "Make sure you have saved your work"
  }
};
