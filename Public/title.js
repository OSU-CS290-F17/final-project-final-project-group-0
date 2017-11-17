// function changeUser(newUser){
//   var displayedUser = document.getElementById("current-user");
//   displayedUser.textContent = newUser;
// }
//
// function showLoginModal(){
//   var loginModal = document.getElementsByClassName("login-modal")[0];
//   loginModal.style.display = "inherit";
// }
//
// function logoutUser(){
//   changeUser("Not Logged In");
//   document.getElementById("login-logout-button").textContent = "Login";
// }
var currentUser = document.getElementById("current-user").textContent;

function loginLogoutButtonClicked(){
  alert("User functionality is not currently implemented, sorry");
  // if(currentUser!=="Not Logged In"){
  //   logoutUser();
  // }
  // else{
  //   showLoginModal();
  // }
}

var showLoginModalButton = document.getElementById("login-logout-button");
showLoginModalButton.addEventListener("click", loginLogoutButtonClicked);


function userButtonClicked(){
  var userFilesLink = document.createElement("a");
  userFilesLink.href = "/files/"+currentUser;
  document.lastChild.appendChild(userFilesLink);
  userFilesLink.click();
}

var userButton = document.getElementById("current-user");
userButton.addEventListener("click", userButtonClicked);
