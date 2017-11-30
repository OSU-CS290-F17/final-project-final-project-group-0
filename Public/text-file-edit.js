var clientText = document.getElementById('text-content').innerHTML;

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
function getTrueIndex(){
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
      if(clientText[a]===">"){  //begin measuring from end of tag
        foundIndex = true;
        for(var b=0; b<selection.toString().length; b++){
          if(clientText[a+1+selection.anchorOffset+b]==='<'){ //hit tag in clientText
            offset = clientText.substring(a+1+selection.anchorOffset+b).indexOf('>')+1;
            break;
          }
          else if(clientText[a+1+selection.anchorOffset+b]!==selection.toString()[b]){
            foundIndex = false;
            break;
          }
        }
        if(foundIndex){
          offset += selection.toString().length;
          return [a+1+selection.anchorOffset, a+1+selection.anchorOffset+offset];
        }
      }
      else if(clientText[a]===selection.toString()[0]){ //begin measuring from beginning of selection
        foundIndex = true;
        for(var c=0; c<selection.toString().length; c++){
          if(clientText[a+c]==="<"){  //hit tag in clientText
            offset = clientText.substring(a+c).indexOf('>')+1;
            break;
          }
          else if(clientText[a+c]!==selection.toString()[c]){
            foundIndex = false;
            break;
          }
        }
        if(foundIndex){
          offset += selection.toString().length;
          return [selection.anchorOffset, selection.anchorOffset+offset];
        }
      }
    }
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

  var hasTag = isInTag(selection.anchorNode, tag) || isInTag(selection.focusNode, tag);
  console.log(hasTag);

  console.log("Selection from",indexStart,"to",indexEnd);
  var newClientText = clientText.substring(0,indexStart)+'|'+clientText.substring(indexStart,indexEnd);
  newClientText += '|'+clientText.substring(indexEnd);

  if(false){
    //
  }
  updateClientText(newClientText);
  // if(selectedText.anchorNode &&
  //     isDescendant(document.getElementById('text-content'), selectedText.anchorNode)){
  //   var hasTag = isInTag(selectedText.anchorNode, tag);
  //   var newClientText;
  //   if(!hasTag){
  //     newClientText = clientText.substring(0, selectionStart);
  //     newClientText += "<"+tag+">"+selectedText.toString()+"</"+tag+">";
  //     newClientText += clientText.substring(selectionEnd);
  //   }
  //   else{   //text is in given tag
  //     if(selectedText.toString().includes('<'+tag+'>') || selectedText.toString().includes('</'+tag+'>')){
  //       if(selectedText.toString().includes('<'+tag+'>')){  //text has start of tag in it
  //         newClientText = clientText.substring(0, selectionStart);
  //         newClientText += '<'+tag+'>';
  //         newClientText += selectedText.toString().replace('<'+tag+'>', '');
  //         newClientText += clientText.substring(selectionEnd+1);
  //       }
  //       if(selectedText.toString().includes('</'+tag+'>')){ //text has end of tag in it
  //         newClientText = clientText.substring(0, selectionStart);
  //         newClientText += selectedText.toString().replace('</'+tag+'>', '');
  //         newClientText += '</'+tag+'>';
  //         newClientText += clientText.substring(selectionEnd+1);
  //       }
  //     }
  //     else{ //selection does not contain tag
  //       if(clientText.substring(selectionStart-(tag.length+2), selectionStart)==='<'+tag+'>'){
  //         newClientText = clientText.substring(0, selectionStart-(tag.length+2));
  //         newClientText += selectedText.toString();
  //       }
  //       else{   //tag does not start immediatly before the selected text
  //         newClientText = clientText.substring(0, selectionStart);
  //         newClientText += "</"+tag+">"+selectedText;
  //       }
  //
  //       if(clientText.substring(selectionEnd, selectionEnd+(tag.length+4))==='</'+tag+'>'){
  //         newClientText += clientText.substring(selectionEnd+(tag.length+3));
  //       }
  //       else{   //tag does not end immediatly after the selected text
  //         newClientText += clientText.substring(selectionEnd)+'<'+tag+'>';
  //       }
  //     }
  //   }
  //   console.log(newClientText);
  //   // updateClientText(newClientText);
  // }
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
