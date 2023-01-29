window.onload = (event) => {
    init();
};

function init() {
    refreshLog();
}

function refreshLog() {
    let skipStr = document.getElementById("skipField").value;
    let limitStr = document.getElementById("limitField").value;

    let xhr = new XMLHttpRequest();
    xhr.open("Get", "/admin/get-log?skip=" + skipStr + "&limit=" + limitStr, true);
    xhr.onload = () => {
        if (xhr.status == 200) {
            let panelLog = document.getElementById("panelLog");
            panelLog.innerHTML = "";

            let returnData = JSON.parse(xhr.responseText);

            for (let i = 0; i < returnData.length; i++) {
                let tr = document.createElement("tr");

                let th = document.createElement("th");
                th.scope = "row";
                th.innerText = (i + 1).toString();

                let td = document.createElement("td");
                td.innerText = returnData[i];

                tr.appendChild(th);
                tr.appendChild(td);

                panelLog.appendChild(tr);
            }
        }
    };

    xhr.send();
}
