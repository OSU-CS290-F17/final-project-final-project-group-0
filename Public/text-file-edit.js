var clientText = document.getElementById('text-content').innerHTML;

//Inserts substring into string at index
function strInsert(string, index, substring){
  return string.substring(0,index) + substring + string.substring(index);
}

//Checks if a node is a descendant of another node
//Function based on code by stackoverflow user 'Asaph'
function isDescendant(parent, child){
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
}

//Toggle underlining on selected text
function toggleUnderline(){
  toggleTagOnSelection('u');
}

//Returns the indecies of the selection's start and end in clientText
function getTrueIndex(){  //broken
  var selection = document.getSelection();
  var fileContent = document.getElementById('text-content');
  if(isDescendant(fileContent, selection.anchorNode)
    && isDescendant(fileContent, selection.focusNode)){
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
      else if(clientText[a]===selection.toString()[0]){ //begin checking from beginning of selection
        foundIndex = true;
        for(var c=0; c<selection.toString().length; c++){
          if(clientText[a+c+offset]==="<"){  //hit tag in clientText
            offset += clientText.substring(a+c).indexOf('>')+1;
          }
          else if(clientText[a+c+offset]!==selection.toString()[c-offset]){
            break;
          }
        }
        if(foundIndex){
          offset += selection.toString().length;
          return [selection.anchorOffset, selection.anchorOffset+offset];
        }
      }
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

//Updates the file content client-side
function updateClientText(newText){
  // document.getElementById('text-content').textContent = newText;
  // clientText = newText;
  console.log(newText);
}

//Types the file content
function keyPressed(event){
  console.log(event);
}

//Posts the file to the server
function saveContent(){
  //
}

//Saves the document and uses setTimout to trigger the next autosave
function autoSave(){
  saveContent();
  //setTimout for next autosave
}


var toggleBoldButton = document.getElementById('bold-button');
toggleBoldButton.addEventListener('mousedown', toggleBold);

var toggleUnderlineButton = document.getElementById('underline-button');
toggleUnderlineButton.addEventListener('mousedown', toggleUnderline);

var contentWindow = document.getElementById("text-content");
contentWindow.addEventListener("keydown", keyPressed);
