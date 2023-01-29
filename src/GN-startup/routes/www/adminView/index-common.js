window.onload = (event) => {
    var gnVersion = "";
    window.gnVersion = gnVersion;

    initIndexSupport();
    init();
};

function init() {
    refreshVersion();
}

function refreshVersion() {
    let gnVersionSpan = document.getElementById("gnVersionSpan");
    gnVersionSpan.innerText = window.gnVersion;
}
