var EXPORTED_SYMBOLS = {"askWithPopup"};

function askWithPopup(question){
  var popupBackground = document.createElement("div");
  popupBackground.style.width = "100vw";
  popupBackground.style.height = "100vh";
  popupBackground.style.position = "fixed";
  popupBackground.style.top = "0px";
  popupBackground.style.left = "0px";
  popupBackground.style.backgroundColor = "rgba(0,0,0,0.25)";
  popupBackground.id = "questionBackground";
  document.appendChild(popupBackground);

  var popup = document.createElement("div");
  popup.style.width = "200px";
  popup.style.height = "140px";
  popup.style.position = "fixed";
  popup.style.top = "calc(50vh - 70px)";
  popup.style.left = "calc(50vw - 100px)";
  popup.style.backgroundColor = "#000000";
  popup.id = "questionPopup";
  document.appendChild(popup);
}
