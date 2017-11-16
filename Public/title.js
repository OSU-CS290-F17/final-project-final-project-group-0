function showLoginModal(){
  var loginModal = document.getElementsByClassName("login-modal")[0];
  loginModal.style.display = "inherit";
}

var showLoginModalButton = document.getElementById("login-logout-button");
showLoginModalButton.addEventListener("click", showLoginModal);

function submitLoginInfo(){
  //
}
