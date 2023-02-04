window.onload = (event) => {
    init();
};

var simpleDatatable;

function init() {
    let datatablesSimple = document.getElementById('datatablesSimple');
    simpleDatatable = new simpleDatatables.DataTable(datatablesSimple);

    refreshLog();
}

function refreshLog() {
    let skipStr = document.getElementById("skipField").value;
    let limitStr = document.getElementById("limitField").value;

    let xhr = new XMLHttpRequest();
    xhr.open("get", "/admin/get-log?skip=" + skipStr + "&limit=" + limitStr, true);
    xhr.onload = () => {
        if (xhr.status == 200) {
            simpleDatatable.destroy();

            let datatablesSimple = document.getElementById('datatablesSimple');

            let panelLog = datatablesSimple.getElementsByTagName("tbody")[0];
            panelLog.innerHTML = "";

            let returnData = JSON.parse(xhr.responseText);

            for (let i = 0; i < returnData.length; i++) {
                let tr = document.createElement("tr");

                let th = document.createElement("td");
                th.innerText = (i + 1).toString();

                let td = document.createElement("td");
                td.innerText = returnData[i];

                tr.appendChild(th);
                tr.appendChild(td);

                panelLog.appendChild(tr);
            }

            simpleDatatable.init();
            simpleDatatable.page(1);
        }
    };

    xhr.send();
}
