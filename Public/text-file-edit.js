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
  var currentNode = node;
  while(currentNode){
    if(currentNode.tagName===tag){
      return true;
    }
    currentNode = currentNode.parentNode;
  }
  return false;
}

// Toggle bold on selected text
function toggleBold(){
  toggleTagOnSelection('B');
}

//Toggle underlining on selected text
function toggleUnderline(){
  toggleTagOnSelection('U');
}

//Toggle whether the selected text has a certain tag
function toggleTagOnSelection(tag){
  var selectedText = document.getSelection();
  var selectionStart = clientText.toString().indexOf(selectedText.toString());
  var selectionEnd = selectionStart+selectedText.toString().length;
  console.log("Selection from",selectionStart,"to",selectionEnd);

  if(selectedText.anchorNode &&
      isDescendant(document.getElementById('text-content'), selectedText.anchorNode)){
    var hasTag = isInTag(selectedText.anchorNode, tag);
    var newClientText;
    if(!hasTag){
      newClientText = clientText.substring(0, selectionStart);
      newClientText += "<"+tag+">"+selectedText.toString()+"</"+tag+">";
      newClientText += clientText.substring(selectionEnd);
    }
    else{   //text is in given tag
      if(selectedText.toString().includes('<'+tag+'>') || selectedText.toString().includes('</'+tag+'>')){
        if(selectedText.toString().includes('<'+tag+'>')){  //text has start of tag in it
          newClientText = clientText.substring(0, selectionStart);
          newClientText += '<'+tag+'>';
          newClientText += selectedText.toString().replace('<'+tag+'>', '');
          newClientText += clientText.substring(selectionEnd+1);
        }
        if(selectedText.toString().includes('</'+tag+'>')){ //text has end of tag in it
          newClientText = clientText.substring(0, selectionStart);
          newClientText += selectedText.toString().replace('</'+tag+'>', '');
          newClientText += '</'+tag+'>';
          newClientText += clientText.substring(selectionEnd+1);
        }
      }
      else{ //selection does not contain tag
        if(clientText.substring(selectionStart-(tag.length+2), selectionStart)==='<'+tag+'>'){
          newClientText = clientText.substring(0, selectionStart-(tag.length+2));
          newClientText += selectedText.toString();
        }
        else{   //tag does not start immediatly before the selected text
          newClientText = clientText.substring(0, selectionStart);
          newClientText += "</"+tag+">"+selectedText;
        }

        if(clientText.substring(selectionEnd, selectionEnd+(tag.length+4))==='</'+tag+'>'){
          newClientText += clientText.substring(selectionEnd+(tag.length+3));
        }
        else{   //tag does not end immediatly after the selected text
          newClientText += clientText.substring(selectionEnd)+'<'+tag+'>';
        }
      }
    }
    console.log(newClientText);
    updateClientText(newClientText);
  }
}

//Updates the file content client-side
function updateClientText(newText){
  document.getElementById('text-content').innerHTML = newText;
  clientText = newText;
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
