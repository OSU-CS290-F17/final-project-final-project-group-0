var clientText = document.getElementById('text-content').innerHTML;
var caret = 3;
var isSaved = true;
var autoSaveTimer;

var invalidCharacters = ["<",">"];
var overriddenCharacters = [" ","/"];  //characters to override default behavior on

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
  toggleTagOnSelection('b');
}

//Toggle underlining on selected text
function toggleUnderline(){
  toggleTagOnSelection('u');
}

//returns array representing which child 'node' is in 'parent'
function nodePositionInParent(parent, node){
  var isDirectDescendant = false;
  var index;
  var indirectParent;
  var hasHitCaret = 0;
  for(var a=0; a<parent.children.length; a++){
    if(parent.children[a]===node){
      index = a - hasHitCaret;
      isDirectDescendant = true;
      break;
    }
    else if(isDescendant(parent.children[a],node)){
      indirectParent = parent.children[a];
      index = a - hasHitCaret;
      break;
    }
    else if(parent.children[a].id==="caret"){
      hasHitCaret = 1;
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

  var currentTagDepth = 0;
  var currentPositionArray = [];
  var inTagName = false;
  for(var a=0; a<clientText.length; a++){ //loop through clientText
    if(!inTagName && clientText.charAt(a)==="<"){ //hit start or end of tag
      if(clientText.charAt(a+1)==="/"){ //hit end of tag
        currentTagDepth--;
        if(currentPositionArray.length>(currentTagDepth+1)){
          currentPositionArray.pop();
        }
      }
      else{ //entered new tag
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

//Returns index before node before selection offset
function getIndexBefore(node, offset){
  if(node.children && node.children.length===0){ //node contains no elements
    return 0;
  }
  else{   //node has at least one element
    var parent = node.parentElement;
    var text = parent.innerHTML;
    var isNodeNum;
    var hitCaret = false;
    for(var a=0; a<parent.childNodes.length; a++){  //determine index of node
      if(parent.childNodes.item(a)===node){
        isNodeNum = a;
        break;
      }
      else if(parent.childNodes.item(a).id==="caret"){
        hitCaret = true;
      }
    }

    var currentNodeNum = 0;
    var inTag = 0;
    var inTagName = false;
    for(var b=0; b<text.length; b++){
      if(text.charAt(b)===">"){ //end a tag name
        inTagName=false;
        if(inTag===0){  //end node
          currentNodeNum++;
        }
      }
      else if(text.charAt(b)==="<" && text.charAt(b+1)==="/"){
        inTag--;
        inTagName = true;
      }
      else if(text.charAt(b)==="<"){
        inTag++;
        inTagName = true;
        if(inTag===1 && b>=1){  //start of tag
          currentNodeNum++;
        }
      }
      if(currentNodeNum===isNodeNum){
        if(hitCaret){ //index is after caret
          return b-23;
        }
        else{
          return b;
        }
      }
    }
    console.error("Could not determine index before node");
    return 0;
  }
}

//Returns the indecies of the selection's start and end in clientText
function getTrueIndex(){
  var selection = document.getSelection();
  var trueStart = indexOfNode(selection.anchorNode.parentElement);
  trueStart += selection.anchorNode.parentElement.tagName.length + 2;  //account for '<tag>'
  trueStart += selection.anchorOffset;
  trueStart += getIndexBefore(selection.anchorNode, selection.anchorOffset);

  var trueEnd = indexOfNode(selection.focusNode.parentElement);
  trueEnd += selection.focusNode.parentElement.tagName.length+2; //account for '<tag>'
  trueEnd += selection.focusOffset;
  trueEnd += getIndexBefore(selection.focusNode, selection.focusOffset);

  if(trueStart>trueEnd){  //swap start and end if backwards
    var temp = trueStart;
    trueStart = trueEnd;
    trueEnd = temp;
  }
  return [trueStart, trueEnd];
}

//removes the tag at given index
function removeTag(index, tag){
  var tempIndex = index;
  var tempIndex2 = index;
  while(clientText.substring(tempIndex,tempIndex2+1)!=="</"+tag+">"){ //remove tag end
    tempIndex2++;
    if(clientText.charAt(tempIndex2)==="<"){
      tempIndex = tempIndex2;
    }
    else if(tempIndex2>clientText.length){
      console.error("Could not find tag end");
      return;
    }
  }
  var newText = clientText.substring(0,tempIndex)+clientText.substring(tempIndex2+1);

  while(clientText.substring(tempIndex,tempIndex2+1)!=="<"+tag+">"){
    tempIndex--;
    if(clientText.charAt(tempIndex)===">"){
      tempIndex2 = tempIndex;
    }
    else if(tempIndex<0){
      console.error("Could not find tag start");
      return;
    }
  }
  newText = newText.substring(0,tempIndex)+newText.substring(tempIndex2+1);
  updateClientText(newText);
}

//Toggle whether the selected text has a certain tag
function toggleTagOnSelection(tag){
  tag = tag.toLowerCase();
  var index = getTrueIndex();
  if(!index){
    return;
  }

  var selection = document.getSelection();
  if(selection.isCollapsed){
    return;
  }

  var indexStart = index[0];
  var indexEnd = index[1];
  var newClientText = clientText;
  var newSubstring = clientText.substring(indexStart, indexEnd);
  if(selection.anchorNode===selection.focusNode
      && selection.anchorNode.textContent===selection.toString()
      && selection.anchorNode.parentElement.tagName.toLowerCase()===tag){ //tag only contains selection
    removeTag(indexStart, tag);
    return;
  }

  var selectionIsInTag = isInTag(selection.anchorNode, tag)
      || isInTag(selection.focusNode, tag)
      || newSubstring.includes("<"+tag+">");
  if(selectionIsInTag){ //selection is partially in tag
    var tagStart = indexStart;
    if(isInTag(selection.anchorNode, tag)){ //selection starts in tag
      while(clientText.substring(tagStart-(tag.length+2),tagStart)!=="<"+tag+">"){
        tagStart--;
      }
    }
    else{
      while(clientText.substring(tagStart-(tag.length+2),tagStart)!=="<"+tag+">"){
        tagStart++;
      }
    }
    var tagEnd = indexEnd;
    if(isInTag(selection.focusNode, tag)){  //selection ends in tag
      while(clientText.substring(tagEnd,tagEnd+(tag.length+3))!=="</"+tag+">"){
        tagEnd++;
      }
    }
    else{
      while(clientText.substring(tagEnd,tagEnd+(tag.length+3))!=="</"+tag+">"){
        tagEnd--;
      }
    }

    if(selection.anchorNode.textContent===selection.toString()){  //node only contains selection
      removeTag(indexStart, tag);
      return;
    }
    else if(selection.focusNode.textContent===selection.toString()){  //node only contains selection
      removeTag(indexEnd, tag);
      return;
    }
    else{
      if((tagEnd===indexEnd || tagEnd==(indexEnd+(tag.length+3)))
      && (tagStart===indexStart || tagStart==(indexStart+(tag.length+2)))){ //tag only contains selection
        removeTag(indexStart, tag);
        return;
      }
      else if(tagEnd===indexEnd || tagEnd===(indexEnd-(tag.length+3))){ //tag ends at selection
        if(tagStart===indexStart || tagStart===(indexStart+(tag.length+2))){//tag starts at selection
          removeTag(tagStart+tag.length+3,tag);
          return;
        }
        else if(tagStart<indexStart){  //tag starts before selection
          newClientText = newClientText.substring(0,indexStart)+"</"+tag+">"
              +newClientText.substring(indexStart, tagEnd)
              +newClientText.substring(tagEnd+(tag.length+3));
        }
        else{ //tag starts in selection
          newClientText = newClientText.substring(0,tagStart)
              +newClientText.substring(tagStart+(tag.length+2));//remove existing start
          newClientText = newClientText.substring(0,indexStart)+"<"+tag+">"
              +newClientText.substring(indexStart);//add new start
          newClientText = properlyNestTags(newClientText);
        }
      }
      else if(tagEnd<indexEnd){ //tag ends in selection
        newClientText = newClientText.substring(0,tagEnd)
            +newClientText.substring(tagEnd+(tag.length+3)); //move end to after selection
        indexEnd -= tag.length+3;
        newClientText = newClientText.substring(0,indexEnd)+"</"+tag+">"
            +newClientText.substring(indexEnd);
        if(tagStart===indexStart || tagStart===(indexStart+(tag.length+2))){//tag starts at selection
          //No further action is neccessary
        }
        else if(tagStart<indexStart){  //tag starts before selection
          //No further action is neccessary
        }
        else{
          newClientText = newClientText.substring(0,tagStart)
              +newClientText.substring(tagStart+(tag.length+2)); //remove existing tag start
          newClientText = newClientText.substring(0,indexStart)+"<"+tag+">"
              +newClientText.substring(indexStart); //add tag start to start of selection
          newClientText = properlyNestTags(newClientText);
        }
      }
      else{ //tag ends after selection
        if(tagStart===indexStart || tagStart===(indexStart+(tag.length+2))){//tag starts at selection
          newClientText = newClientText.substring(0,tagStart)
              +newClientText.substring(tagStart+(tag.length+2)); //remove existing tag start
          newClientText = newClientText.substring(0,indexEnd)+"<"+tag+">"
              +newClientText.substring(indexEnd); //add tag start to end of selection
          newClientText = properlyNestTags(newClientText);
        }
        else if(tagStart<indexStart){ //tag starts before selection
          newClientText = newClientText.substring(0,indexEnd)+"<"+tag+">"
              +newClientText.substring(indexEnd); //add tag start to end of selection
          newClientText = newClientText.substring(0,indexStart)+"</"+tag+">"
              +newClientText.substring(indexStart); //add tag end to start of selection
          newClientText = properlyNestTags(newClientText);
        }
        else{ //tag starts in selection
          newClientText = newClientText.substring(0,tagStart)
              +newClientText.substring(tagStart+(tag.length+2)); //remove existing tag start
          newClientText = newClientText.substring(0,indexStart)+"<"+tag+">"
              +newClientText.substring(indexStart); //add tag start to start of selection
          newClientText = properlyNestTags(newClientText);
        }
      }
    }
  }
  else{ //selection does not have tag
    var innerStart = indexStart;
    var innerEnd = indexEnd;
    if(clientText.charAt(innerStart)==="<"){
      while(clientText.charAt(innerStart-1)!==">"){
        innerStart++;
      }
    }
    if(clientText.charAt(innerEnd-1)===">"){
      while(clientText.charAt(innerEnd)!=="<"){
        innerEnd--;
      }
    }
    var newClientText = clientText.substring(0, innerStart);
    newClientText += "<"+tag+">"+clientText.substring(innerStart,innerEnd)+"</"+tag+">";
    newClientText += clientText.substring(innerEnd);
  }
  updateClientText(newClientText);
}

//Updates the file content client-side
function updateClientText(newText){
  if(newText.includes("<script")){
    document.getElementById('text-content').innerHTML = clientText.replace("<script","");
  }
  else{
    newText = properlyNestTags(newText);
    document.getElementById('text-content').innerHTML = strInsert(newText, caret, "<span id='caret'></span>");
    clientText = newText;
    isSaved = false;
  }
  showCaret();
}

//Rearrange tags in text so they are nested properly
function properlyNestTags(text){
  console.log("properlyNestTags got:",text);
  var inTags = [];
  var tagName;
  for(var a=0; a<text.length; a++){
    if(text.charAt(a)==="<"){
      var temp = a+1;
      tagName = "";
      while(text.charAt(temp)!==">"){
        tagName += text.charAt(temp);
        temp++;
      }
      if(text.charAt(a+1)==="/"){ //hit end of tag
        tagName = tagName.substring(1); //remove '/' at beginning
        var tempTag = inTags.pop(); //get the name of the tag 'a' should be in
        if(tempTag!==tagName){  //wrong tag has ended
          var tempStart = temp;
          while(text.substring(tempStart,tempStart+(tagName.length+2))!=="<"+tagName+">"){
            tempStart--;
          }
          if(text.charAt(tempStart+(tagName.length+2))==="<"){ //tags need to be swapped
            var tempEnd = tempStart;
            while(text.charAt(tempEnd-1)!==">"){  //find end of second tag
              tempEnd++;
            }
            var tempString = text.substring(tempStart,tempEnd);
            var newText = text.substring(0,tempStart-(tempTag.length+2))+"<"+tempTag+">"+tempString;  //swap tags
            newText += text.substring(tempEnd+(tempTag.length+2));
            return properlyNestTags(newText);
          }
          else{ //tag needs to be split
            tempStart++;  //skip over '<'
            while(text.charAt(tempStart)!=="<"){
              tempStart++;
            }
            var tempEnd = tempStart+1;
            while(text.charAt(tempEnd-1)!==">"){
              tempEnd++;
            }
            var newText = strInsert(text, tempEnd, "<"+tagName+">");
            newText = strInsert(newText, tempStart, "</"+tagName+">");
            return properlyNestTags(newText);
          }
        }
      }
      else{ //hit beginning of tag
        inTags.push(tagName);
      }
      a = temp;
    }
  }
  return text;
}

// =============================================================================
//Update caret variable on click
function updateCaretPosition(event){
  var selection = document.getSelection();
  if(selection.isCollapsed && event.target.id!=="caret"){
    var position = indexOfNode(selection.anchorNode.parentElement);
    position += selection.anchorNode.parentElement.tagName.length + 2;
    position += selection.focusOffset;
    position += getIndexBefore(selection.anchorNode, selection.anchorOffset);
    caret = position;
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
          else if(clientText.charAt(currentIndex-1)===">"){
            currentIndex--;
            while(clientText.charAt(currentIndex)!='<'){
              currentIndex--;
            }
            currentIndex--;
            newText = clientText.substring(0,currentIndex)+clientText.substring(caret);
            caret = currentIndex;
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
    else if(event.key==="Tab"){
      event.preventDefault();
      newText = strInsert(clientText, caret, "\t");
      caret++;
      updateClientText(newText);
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
    "textContent": clientText.replace("<script>", "").replace("<script", ""),
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
document.getElementById('text-content').addEventListener("click", updateCaretPosition);

//Warn user if they try to leave without saving
window.onbeforeunload = function(){
  if(!isSaved){
    return "Make sure you have saved your work"
  }
};
