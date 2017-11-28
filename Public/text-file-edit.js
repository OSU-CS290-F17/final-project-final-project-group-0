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
  if(selectedText.anchorNode &&
      isDescendant(document.getElementById('text-content'), selectedText.anchorNode)){
    var hasTag = isInTag(selectedText.anchorNode, tag);
    var newClientText;
    if(!hasTag){
      newClientText = clientText.substring(0, selectedText.anchorOffset);
      newClientText += "<"+tag+">"+selectedText.toString()+"</"+tag+">";
      newClientText += clientText.substring(selectedText.focusOffset);
    }
    else{
      //partial
      if(false){}
      else{   //full
        if(clientText.substring(selectedText.anchorOffset-(tag.length+3), selectedText.anchorOffset)==='<'+tag+'>'){
          newClientText = clientText.substring(0, selectedText.anchorOffset-(tag.length+2));
          newClientText += selectedText.toString();
        }
        else{   //tag does not start immediatly before the selected text
          newClientText = clientText.substring(0, selectedText.anchorOffset);
          newClientText += "</"+tag+">"+selectedText;
        }

        if(clientText.substring(selectedText.focusOffset, selectedText.focusOffset+(tag.length+3))==='</'+tag+'>'){
          newClientText += clientText.substring(selectedText.focusOffset+(tag.length+3));
        }
        else{   //tag does not end immediatly after the selected text
          newClientText += clientText.substring(selectedText.focusOffset)+'<'+tag+'>';
        }
      }
    }
    console.log(newClientText);
  }
}

//Updates the file content client-side
function updateClientText(newText){
  document.getElementById('text-content').innerHTML = newText;
  clientText = newText;
}

//Saves the document and uses setTimout to trigger the next autosave
function autoSave(){
  //send request to server
  //setTimout for next autosave
}


var toggleBoldButton = document.getElementById('bold-button');
toggleBoldButton.addEventListener('mousedown', toggleBold);

var toggleUnderlineButton = document.getElementById('underline-button');
toggleUnderlineButton.addEventListener('mousedown', toggleUnderline);
