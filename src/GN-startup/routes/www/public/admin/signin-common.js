window.onload = (event) => {
    init();
};

function init() {
    let rmCheck = document.getElementById("inputRememberPassword");
    let usernameField = document.getElementById("usernameField");
    let passwordField = document.getElementById("passwordField");
    let debugHashField = document.getElementById("debugHashField");

    if (localStorage.checkbox == "true") {
        rmCheck.setAttribute("checked", "checked");
        usernameField.value = localStorage.username;
        passwordField.value = localStorage.password;
        debugHashField.value = localStorage.debugHash;
    } else {
        rmCheck.removeAttribute("checked");
        usernameField.value = "";
        passwordField.value = "";
        debugHashField.value = "";
    }
}

function rememberLoginInfomation() {
    let rmCheck = document.getElementById("inputRememberPassword");
    let usernameField = document.getElementById("usernameField");
    let passwordField = document.getElementById("passwordField");
    let debugHashField = document.getElementById("debugHashField");

    if (rmCheck.checked && usernameField.value !== "" && passwordField.value !== "") {
        localStorage.username = usernameField.value;
        localStorage.password = passwordField.value;
        localStorage.debugHash = debugHashField.value;
        localStorage.checkbox = true;
    } else {
        localStorage.username = "";
        localStorage.password = "";
        localStorage.debugHash = "";
        localStorage.checkbox = false;
    }
}
