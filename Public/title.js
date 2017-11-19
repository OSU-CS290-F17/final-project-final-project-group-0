// function changeUser(newUser){
// }
//
// function showLoginPopup(){
//   var loginPopup = document.getElementsByClassName("login-popup")[0];
//   loginPopup.style.display = "inherit";
// }
//
// function logoutUser(){
//   changeUser("Not Logged In");
//   document.getElementById("login-logout-button").textContent = "Login";
// }
var currentUser = document.getElementById("current-user").textContent;
currentUser = currentUser.substring(0, currentUser.length-8);

function loginLogoutButtonClicked(){
  alert("User functionality is not currently implemented, sorry");
  // if(currentUser!=="Not Logged In"){
  //   logoutUser();
  // }
  // else{
  //   showLoginPopup();
  // }
}

var showLoginPopupButton = document.getElementById("login-logout-button");
showLoginPopupButton.addEventListener("click", loginLogoutButtonClicked);


function userButtonClicked(){
  var userFilesLink = document.createElement("a");
  userFilesLink.href = "/files/"+currentUser;
  document.lastChild.appendChild(userFilesLink);
  userFilesLink.click();
}

var userButton = document.getElementById("current-user");
userButton.addEventListener("click", userButtonClicked);
