function showLoginModal(){
  console.log("showLoginModal called");
}

var loginButton = document.getElementById("login-logout-button");
loginButton.addEventListener("click", showLoginModal);
console.log("Script loaded");
