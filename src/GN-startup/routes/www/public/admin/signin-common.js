window.onload = (event) => {
    init();
};

function init() {
    let rmCheck = document.getElementById("inputRememberPassword");
    let usernameField = document.getElementById("usernameField");
    let passwordField = document.getElementById("passwordField");
    
    if (localStorage.checkbox == "true") {
        rmCheck.setAttribute("checked", "checked");
        usernameField.value = localStorage.username;
        passwordField.value = localStorage.password;
    } else {
        rmCheck.removeAttribute("checked");
        usernameField.value = "";
        passwordField.value = "";
    }
}

function lsRememberMe() {
    let rmCheck = document.getElementById("inputRememberPassword");
    let usernameField = document.getElementById("usernameField");
    let passwordField = document.getElementById("passwordField");

    if (rmCheck.checked && usernameField.value !== "" && passwordField.value !== "") {
        localStorage.username = usernameField.value;
        localStorage.password = passwordField.value;
        localStorage.checkbox = true;
    } else {
        localStorage.username = "";
        localStorage.password = "";
        localStorage.checkbox = false;
    }
}
