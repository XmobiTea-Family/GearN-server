window.onload = (event) => {
    var gnServerSettings = new GN.GNServerSettings();
    window.gnServerSettings = gnServerSettings;

    var gnRequests = [];
    window.gnRequests = gnRequests;

    var gnOperationNameDict = {};
    window.gnOperationNameDict = gnOperationNameDict;

    var gnParametersDict = {};
    window.gnParametersDict = gnParametersDict;

    var gnEventNameDict = {};
    window.gnEventNameDict = gnEventNameDict;

    var gnReturnCodeDict = {};
    window.gnReturnCodeDict = gnReturnCodeDict;

    var gnInvalidMemberTypeDict = {};
    window.gnInvalidMemberTypeDict = gnInvalidMemberTypeDict;

    initDebugSupport();
    init();
};


function gnConnectSocket() {
    GN.GNNetwork.connectSocket(() => {
        console.log("connect success");
    });
}

function gnDisconnectSocket() {
    GN.GNNetwork.disconnectSocket(() => {
        console.log("disconnect success");
    });
}

function onOperationCodeDropdownValueChange() {
    let operationCode = document.getElementById("operationCodeDropdown").value;

    let panelParameters = document.getElementById("panelParameters");
    panelParameters.innerHTML = "";

    let gnParameters = gnParametersDict[operationCode];
    for (let i = 0; i < gnParameters.length; i++) {
        let gnParameter = gnParameters[i];

        let div0 = document.createElement("div");
        div0.classList.add("mb-3");
        div0.id = "row" + i;

        let div1 = document.createElement("div");
        div1.classList.add("row");

        let div1a = document.createElement("div");
        div1a.classList.add("col-12");
        div1a.classList.add("col-md-3");

        let divSelect1a = document.createElement("select");
        divSelect1a.classList.add("select-container");
        divSelect1a.classList.add("form-select");
        divSelect1a.id = "parameterCodeRow" + i + "Dropdown";
        divSelect1a.disabled = true;

        let divOption1a = document.createElement("option");
        divOption1a.value = gnParameter.parameterCode;
        divOption1a.selected = true;
        divOption1a.innerText = gnParameter.parameterName;
        divSelect1a.appendChild(divOption1a);

        div1a.appendChild(divSelect1a);

        let div1b = document.createElement("div");
        div1b.classList.add("col-12");
        div1b.classList.add("col-md-2");

        let divSelect1b = document.createElement("select");
        divSelect1b.classList.add("select-container");
        divSelect1b.classList.add("form-select");
        divSelect1b.id = "typeRow" + i + "Dropdown";

        let option0 = document.createElement("option");
        option0.value = "0";
        option0.innerText = "String";
        divSelect1b.appendChild(option0);

        let option1 = document.createElement("option");
        option1.value = "1";
        option1.innerText = "Number";
        divSelect1b.appendChild(option1);

        let option2 = document.createElement("option");
        option2.value = "2";
        option2.innerText = "Boolean";
        divSelect1b.appendChild(option2);

        let option3 = document.createElement("option");
        option3.value = "3";
        option3.innerText = "GNHashtable";
        divSelect1b.appendChild(option3);

        let option4 = document.createElement("option");
        option4.value = "4";
        option4.innerText = "GNArray";
        divSelect1b.appendChild(option4);

        if (gnParameter.parameterType != 0) {
            divSelect1b.disabled = true;
        }
        else {
            divSelect1b.setAttribute("onchange", "onTypeDropdownChange('" + i + "')");
        }

        div1b.appendChild(divSelect1b);

        let div1c = document.createElement("div");
        div1c.classList.add("col-12");

        if (gnParameter.parameterIsOptional) {
            div1c.classList.add("col-md-6");
        }
        else {
            div1c.classList.add("col-md-7");
        }

        let divOptional = document.createElement("div");
        divOptional.classList.add("col-12");
        divOptional.classList.add("col-md-1");

        let panelRowA = document.createElement("div");
        panelRowA.id = "panelRow" + i + "a";
        div1c.appendChild(panelRowA);

        let panelRowB = document.createElement("div");
        panelRowB.id = "panelRow" + i + "b";

        if (gnParameter.parameterType == 0 || gnParameter.parameterType == 2) {
            option0.selected = true;
            divSelect1b.value = "0";
        }
        else if (gnParameter.parameterType == 1) {
            option1.selected = true;
            divSelect1b.value = "1";
        }
        else if (gnParameter.parameterType == 3) {
            option2.selected = true;
            divSelect1b.value = "2";
        }
        else if (gnParameter.parameterType == 4) {
            option3.selected = true;
            divSelect1b.value = "3";
        }
        else if (gnParameter.parameterType == 5) {
            option4.selected = true;
            divSelect1b.value = "4";
        }

        div1.appendChild(div1a);
        div1.appendChild(div1b);
        div1.appendChild(div1c);

        if (gnParameter.parameterIsOptional) {
            let removeElementButton = document.createElement("button");
            removeElementButton.style = "margin-top: 3px; width: 50px;";
            removeElementButton.classList.add("btn");
            removeElementButton.classList.add("btn-outline-secondary");
            removeElementButton.classList.add("btn-sm");
            removeElementButton.setAttribute("onclick", "removeGNDataElement('" + i + "')");
            removeElementButton.innerText = "-";
            removeElementButton.id = "removeRow" + i + "Button";
            divOptional.appendChild(removeElementButton);

            div1.appendChild(divOptional);
        }

        div1.appendChild(panelRowB);

        div0.appendChild(div1);

        panelParameters.appendChild(div0);

        onTypeDropdownChange(i);
    }
}

function onTypeDropdownChange(rowId) {
    let value = document.getElementById("typeRow" + rowId + "Dropdown").value;

    if (value == "0") {
        let panelRow = document.getElementById("panelRow" + rowId + "a");
        panelRow.innerHTML = "";

        let inputField = document.createElement("input");
        inputField.classList.add("input-height");
        inputField.classList.add("form-control");
        inputField.type = "text";
        inputField.placeholder = "Value as string";
        inputField.id = "valueRow" + rowId + "Field";

        panelRow.appendChild(inputField);
    }
    else if (value == "1") {
        let panelRow = document.getElementById("panelRow" + rowId + "a");
        panelRow.innerHTML = "";

        let inputField = document.createElement("input");
        inputField.classList.add("input-height");
        inputField.classList.add("form-control");
        inputField.type = "number";
        inputField.placeholder = "Value as number";
        inputField.id = "valueRow" + rowId + "Field";

        panelRow.appendChild(inputField);
    }
    else if (value == "2") {
        let panelRow = document.getElementById("panelRow" + rowId + "a");
        panelRow.innerHTML = "";

        let checkBoxField = document.createElement("input");
        checkBoxField.type = "checkbox";
        checkBoxField.placeholder = "Value as boolean";
        checkBoxField.style = "margin-top: 6px; height: 26px; width: 26px;";
        checkBoxField.id = "valueRow" + rowId + "Toggle";

        panelRow.appendChild(checkBoxField);
    }
    else if (value == "3") {
        let panelRow = document.getElementById("panelRow" + rowId + "a");
        panelRow.innerHTML = "";

        let divRow = document.createElement("div");
        divRow.classList.add("row");

        let divElement0 = document.createElement("div");
        divElement0.classList.add("col-12");
        divElement0.classList.add("col-md-4");
        let button = document.createElement("button");
        button.classList.add("btn");
        button.classList.add("btn-outline-success");
        button.classList.add("mt-1");
        button.classList.add("btn-sm");
        button.innerHTML = "+ Key Pair Value";
        button.style = "width: 128px !important;";
        button.setAttribute("onClick", "addKeyPairValue('" + rowId + "')");
        divElement0.appendChild(button);

        let divElement1 = document.createElement("div");
        divElement1.classList.add("col-12");
        divElement1.classList.add("col-md-2");
        let inputField = document.createElement("input");
        inputField.classList.add("input-height");
        inputField.classList.add("form-control");
        inputField.style = "text-align:center; width: 78px !important;";
        inputField.type = "number";
        inputField.placeholder = "Value as number";
        inputField.id = "valueRow" + rowId + "Field";
        inputField.value = 0;
        inputField.disabled = true;
        divElement1.appendChild(inputField);

        divRow.appendChild(divElement0);
        divRow.appendChild(divElement1);
        panelRow.appendChild(divRow);

        panelRow = document.getElementById("panelRow" + rowId + "b");
        panelRow.innerHTML = "";

        let div1b = document.createElement("div");
        div1b.classList.add("mb-1");
        div1b.style = "display: flex;";

        let div1c = document.createElement("div");
        div1c.style = "padding-left: 40px; flex: 1;";
        div1c.id = "valueRow" + rowId + "GNData";
        div1b.appendChild(div1c);

        panelRow.appendChild(div1b);
    }
    else if (value == "4") {
        let panelRow = document.getElementById("panelRow" + rowId + "a");
        panelRow.innerHTML = "";

        let divRow = document.createElement("div");
        divRow.classList.add("row");

        let divElement0 = document.createElement("div");
        divElement0.classList.add("col-12");
        divElement0.classList.add("col-md-4");
        let button = document.createElement("button");
        button.classList.add("btn");
        button.classList.add("btn-outline-success");
        button.classList.add("mt-1");
        button.classList.add("btn-sm");
        button.innerHTML = "+ Value";
        button.style = "width: 128px !important;";
        button.setAttribute("onClick", "addValue('" + rowId + "')");
        divElement0.appendChild(button);

        let divElement1 = document.createElement("div");
        divElement1.classList.add("col-12");
        divElement1.classList.add("col-md-2");
        let inputField = document.createElement("input");
        inputField.classList.add("input-height");
        inputField.classList.add("form-control");
        inputField.style = "text-align:center; width: 78px !important;";
        inputField.type = "number";
        inputField.placeholder = "Value as number";
        inputField.id = "valueRow" + rowId + "Field";
        inputField.value = 0;
        inputField.disabled = true;
        divElement1.appendChild(inputField);

        divRow.appendChild(divElement0);
        divRow.appendChild(divElement1);
        panelRow.appendChild(divRow);

        panelRow = document.getElementById("panelRow" + rowId + "b");
        panelRow.innerHTML = "";

        let div1b = document.createElement("div");
        div1b.classList.add("mb-1");
        div1b.style = "display: flex;";

        let div1c = document.createElement("div");
        div1c.style = "padding-left: 40px; flex: 1;";
        div1c.id = "valueRow" + rowId + "GNData";
        div1b.appendChild(div1c);

        panelRow.appendChild(div1b);
    }
}

function addKeyPairValue(rowId) {
    let inputField = document.getElementById("valueRow" + rowId + "Field");
    let endRowId = rowId + "." + Number.parseInt(inputField.value);

    let valueRow = document.getElementById("valueRow" + rowId + "GNData");

    let elementDivRow = document.createElement("div");
    elementDivRow.classList.add("mt-1");
    elementDivRow.id = "row" + endRowId;

    let divRow = document.createElement("div");
    divRow.classList.add("row");

    let divElement0 = document.createElement("div");
    divElement0.classList.add("col-12");
    divElement0.classList.add("col-md-3");
    let parameterCodeField0 = document.createElement("input");
    parameterCodeField0.classList.add("input-height");
    parameterCodeField0.classList.add("form-control");
    parameterCodeField0.style = "height: 40px;";
    parameterCodeField0.type = "text";
    parameterCodeField0.placeholder = "ParameterCode";
    parameterCodeField0.id = "parameterCodeRow" + endRowId + "Field";
    divElement0.appendChild(parameterCodeField0);

    let divElement1 = document.createElement("div");
    divElement1.classList.add("col-12");
    divElement1.classList.add("col-md-2");
    let divSelect1 = document.createElement("select");
    divSelect1.classList.add("select-container");
    divSelect1.classList.add("form-select");
    divSelect1.id = "typeRow" + endRowId + "Dropdown";
    divSelect1.setAttribute("onchange", "onTypeDropdownChange('" + endRowId + "')");

    let option0 = document.createElement("option");
    option0.value = "0";
    option0.selected = true;
    option0.innerText = "String";
    divSelect1.appendChild(option0);

    let option1 = document.createElement("option");
    option1.value = "1";
    option1.innerText = "Number";
    divSelect1.appendChild(option1);

    let option2 = document.createElement("option");
    option2.value = "2";
    option2.innerText = "Boolean";
    divSelect1.appendChild(option2);

    let option3 = document.createElement("option");
    option3.value = "3";
    option3.innerText = "GNHashtable";
    divSelect1.appendChild(option3);

    let option4 = document.createElement("option");
    option4.value = "4";
    option4.innerText = "GNArray";
    divSelect1.appendChild(option4);

    divElement1.appendChild(divSelect1);

    let divElement2 = document.createElement("div");
    divElement2.classList.add("col-12");
    divElement2.classList.add("col-md-6");
    let divPanelRowA = document.createElement("div");
    divPanelRowA.id = "panelRow" + endRowId + "a";

    let inputFieldA = document.createElement("input");
    inputFieldA.classList.add("input-height");
    inputFieldA.classList.add("form-control");
    inputFieldA.type = "text";
    inputFieldA.placeholder = "Value as string";
    inputFieldA.id = "valueRow" + endRowId + "Field";
    divPanelRowA.appendChild(inputFieldA);
    divElement2.appendChild(divPanelRowA);

    let divElement3 = document.createElement("div");
    divElement3.classList.add("col-12");
    divElement3.classList.add("col-md-1");
    let removeElementButton = document.createElement("button");
    removeElementButton.style = "margin-top: 3px; width: 50px;";
    removeElementButton.classList.add("btn");
    removeElementButton.classList.add("btn-outline-secondary");
    removeElementButton.classList.add("btn-sm");
    removeElementButton.setAttribute("onclick", "removeGNDataElement('" + endRowId + "')");
    removeElementButton.innerText = "-";
    removeElementButton.id = "removeRow" + endRowId + "Button";
    divElement3.appendChild(removeElementButton);

    let divElement4 = document.createElement("div");
    divElement4.id = "panelRow" + endRowId + "b";

    divRow.appendChild(divElement0);
    divRow.appendChild(divElement1);
    divRow.appendChild(divElement2);
    divRow.appendChild(divElement3);
    divRow.appendChild(divElement4);

    elementDivRow.appendChild(divRow);
    valueRow.appendChild(elementDivRow);

    inputField.value = Number.parseInt(inputField.value) + 1;
}

function addValue(rowId) {
    let inputField = document.getElementById("valueRow" + rowId + "Field");
    let elementId = Number.parseInt(inputField.value);
    let endRowId = rowId + "." + elementId;

    let valueRow = document.getElementById("valueRow" + rowId + "GNData");
    let elementDivRow = document.createElement("div");
    elementDivRow.classList.add("mt-1");
    elementDivRow.id = "row" + endRowId;

    let divRow = document.createElement("div");
    divRow.classList.add("row");

    let divElement0 = document.createElement("div");
    divElement0.classList.add("col-12");
    divElement0.classList.add("col-md-3");

    let elementIndexSpan0 = document.createElement("span");
    elementIndexSpan0.style = "line-height: 40px;";
    elementIndexSpan0.innerText = Number.parseInt(inputField.value) + ".";
    elementIndexSpan0.id = "elementIdRow" + endRowId;
    divElement0.appendChild(elementIndexSpan0);

    let divElement1 = document.createElement("div");
    divElement1.classList.add("col-12");
    divElement1.classList.add("col-md-2");
    let divSelect1 = document.createElement("select");
    divSelect1.classList.add("select-container");
    divSelect1.classList.add("form-select");
    divSelect1.id = "typeRow" + endRowId + "Dropdown";
    divSelect1.setAttribute("onchange", "onTypeDropdownChange('" + endRowId + "')");

    let option0 = document.createElement("option");
    option0.value = "0";
    option0.selected = true;
    option0.innerText = "String";
    divSelect1.appendChild(option0);

    let option1 = document.createElement("option");
    option1.value = "1";
    option1.innerText = "Number";
    divSelect1.appendChild(option1);

    let option2 = document.createElement("option");
    option2.value = "2";
    option2.innerText = "Boolean";
    divSelect1.appendChild(option2);

    let option3 = document.createElement("option");
    option3.value = "3";
    option3.innerText = "GNHashtable";
    divSelect1.appendChild(option3);

    let option4 = document.createElement("option");
    option4.value = "4";
    option4.innerText = "GNArray";
    divSelect1.appendChild(option4);

    divElement1.appendChild(divSelect1);

    let divElement2 = document.createElement("div");
    divElement2.classList.add("col-12");
    divElement2.classList.add("col-md-6");
    let divPanelRowA = document.createElement("div");
    divPanelRowA.id = "panelRow" + endRowId + "a";

    let inputFieldA = document.createElement("input");
    inputFieldA.classList.add("input-height");
    inputFieldA.classList.add("form-control");
    inputFieldA.type = "text";
    inputFieldA.placeholder = "Value as string";
    inputFieldA.id = "valueRow" + endRowId + "Field";
    divPanelRowA.appendChild(inputFieldA);
    divElement2.appendChild(divPanelRowA);

    let divElement3 = document.createElement("div");
    divElement3.classList.add("col-12");
    divElement3.classList.add("col-md-1");
    let removeElementButton = document.createElement("button");
    removeElementButton.style = "margin-top: 3px; width: 50px;";
    removeElementButton.classList.add("btn");
    removeElementButton.classList.add("btn-outline-secondary");
    removeElementButton.classList.add("btn-sm");
    removeElementButton.setAttribute("onclick", "removeGNDataElement('" + endRowId + "')");
    removeElementButton.innerText = "-";
    removeElementButton.id = "removeRow" + endRowId + "Button";
    divElement3.appendChild(removeElementButton);

    let divElement4 = document.createElement("div");
    divElement4.id = "panelRow" + endRowId + "b";

    divRow.appendChild(divElement0);
    divRow.appendChild(divElement1);
    divRow.appendChild(divElement2);
    divRow.appendChild(divElement3);
    divRow.appendChild(divElement4);

    elementDivRow.appendChild(divRow);
    valueRow.appendChild(elementDivRow);

    inputField.value = Number.parseInt(inputField.value) + 1;
}

function removeGNDataElement(rowId) {
    let parentRowId = "";
    let rowIdSpl = rowId.split(".");
    let lastRowId = 0;
    for (let i = 0; i < rowIdSpl.length; i++) {
        if (i < rowIdSpl.length - 2) {
            parentRowId += rowIdSpl[i] + ".";
        }
        else if (i < rowIdSpl.length - 1) {
            parentRowId += rowIdSpl[i];
        }
        else if (i = rowIdSpl.length - 1) {
            lastRowId = Number.parseInt(rowIdSpl[i]);
        }
    }

    if (parentRowId) {
        let inputField = document.getElementById("valueRow" + parentRowId + "Field");
        inputField.value = Number.parseInt(inputField.value) - 1;
    }

    let elementDivRow = document.getElementById("row" + rowId);
    elementDivRow.remove();

    while (true) {
        let endRowId = parentRowId + "." + (lastRowId + 1);

        elementDivRow = document.getElementById("row" + endRowId);
        if (elementDivRow == null) break;

        let finalEndRowId = parentRowId + "." + lastRowId;

        replaceRowId(lastRowId, endRowId, finalEndRowId);

        lastRowId += 1;
    }
}

function replaceRowId(lastRowId, endRowId, finalEndRowId) {
    let elementDivRow = document.getElementById("row" + endRowId);
    elementDivRow.id = "row" + finalEndRowId;

    let parameterCodeField0 = document.getElementById("parameterCodeRow" + endRowId + "Field");
    if (parameterCodeField0 != null) {
        parameterCodeField0.id = "parameterCodeRow" + finalEndRowId + "Field";
    }

    let elementIndexSpan0 = document.getElementById("elementIdRow" + endRowId);
    if (elementIndexSpan0 != null) {
        elementIndexSpan0.innerText = lastRowId + ".";
        elementIndexSpan0.id = "elementIdRow" + finalEndRowId;
    }

    let divSelect1 = document.getElementById("typeRow" + endRowId + "Dropdown");
    divSelect1.id = "typeRow" + finalEndRowId + "Dropdown";
    divSelect1.setAttribute("onchange", "onTypeDropdownChange('" + finalEndRowId + "')");

    let removeElementButton = document.getElementById("removeRow" + endRowId + "Button");
    removeElementButton.id = "removeRow" + finalEndRowId + "Button";
    removeElementButton.setAttribute("onclick", "removeGNDataElement('" + finalEndRowId + "')");

    let inputFieldA = document.getElementById("valueRow" + endRowId + "Field");
    if (inputFieldA != null) {
        inputFieldA.id = "valueRow" + finalEndRowId + "Field";
    }

    let divPanelRowA = document.getElementById("panelRow" + endRowId + "a");
    divPanelRowA.id = "panelRow" + finalEndRowId + "a";

    let divPanelRowB = document.getElementById("panelRow" + endRowId + "b");
    divPanelRowB.id = "panelRow" + finalEndRowId + "b";

    if (divSelect1.value == "3" || divSelect1.value == "4") {
        let finalLastRowId = 0;

        while (true) {
            let endRowId2 = endRowId + "." + finalLastRowId;
            elementDivRow = document.getElementById("row" + endRowId2);
            if (elementDivRow == null) break;

            let finalEndRowId2 = finalEndRowId + "." + finalLastRowId;
            replaceRowId(finalLastRowId, endRowId2, finalEndRowId2);

            finalLastRowId += 1;
        }
    }
}

function init() {
    initGNServer();
    loadLastAuthToken();
    checkSocketEnable();
    checkHttpEnable();

    initOperationCodeDropdown();
    onOperationCodeDropdownValueChange();
}

function initGNServer() {
    GN.GNNetwork.init(gnServerSettings);

    GN.GNNetwork.setOnEventHandler(operationEvent => {
        onOperationEvent(operationEvent);
    });
}

function checkSocketEnable() {
    let panelSocket = document.getElementById("panelSocket");

    if (GN.GNNetwork.gnServerSettings.useSocket) {
        panelSocket.style = "";

        subscriberSocketConnect();
    }
    else {
        panelSocket.style = "display: none;";
    }
}

function checkHttpEnable() {
    let panelHttpButton = document.getElementById("panelHttpButton");

    if (GN.GNNetwork.gnServerSettings.useHttp) {
        panelHttpButton.style = "";
    }
    else {
        panelHttpButton.style = "display: none;";
    }
}

function subscriberSocketConnect() {
    let panelSocket = document.getElementById("panelSocket");
    let panelSocketButton = document.getElementById("panelSocketButton");

    if (GN.GNNetwork.gnServerSettings.useSocket) {
        GN.GNNetwork.subscriberOnConnectHandler(() => {
            checkGNSocketStatus();
        });

        GN.GNNetwork.subscriberOnDisconnectHandler(() => {
            checkGNSocketStatus();
        });

        checkGNSocketStatus();

        panelSocket.style = "";
        panelSocketButton.style = "";
    }
    else {

        panelSocket.style = "display: none;";
        panelSocketButton.style = "display: none;";
    }
}

function loadLastAuthToken() {
    let authTokenField = document.getElementById("authTokenField");
    authTokenField.value = GN.GNNetwork.getAuthToken();
}

function checkGNSocketStatus() {
    let panelSocketDisconnected = document.getElementById("panelSocketDisconnected");
    let panelSocketConnected = document.getElementById("panelSocketConnected");
    let sendViaSocketBtn = document.getElementById("sendViaSocketBtn");

    if (GN.GNNetwork.isSocketConnected()) {
        panelSocketDisconnected.style = "display: none;";
        panelSocketConnected.style = "";

        let socketIdField = document.getElementById("socketIdField");
        socketIdField.value = "SocketId: " + GN.GNNetwork.getSocketSId();

        sendViaSocketBtn.style = "";
    }
    else {
        panelSocketDisconnected.style = "";
        panelSocketConnected.style = "display: none;";

        sendViaSocketBtn.style = "display: none;";
    }
}

function initOperationCodeDropdown() {
    let operationCodeDropdown = document.getElementById("operationCodeDropdown");
    operationCodeDropdown.innerHTML = "";

    for (let i = 0; i < gnRequests.length; i++) {
        let gnRequest = gnRequests[i];

        let option = document.createElement("option");
        option.value = gnRequest.operationCode;
        option.innerText = gnRequest.operationName + " " + gnRequest.operationCode;

        operationCodeDropdown.appendChild(option);

        gnParametersDict[gnRequest.operationCode.toString()] = gnRequest.gnParameters;
        gnOperationNameDict[gnRequest.operationCode.toString()] = gnRequest.operationName;
    }
}

function getOperationRequest() {
    let operationCodeDropdown = document.getElementById("operationCodeDropdown");
    let isEncryptedToggle = document.getElementById("isEncryptedToggle");
    let authTokenField = document.getElementById("authTokenField");

    if (GN.GNNetwork.getAuthToken() != authTokenField.value)
        GN.GNNetwork.setAuthToken(authTokenField.value);

    let operationCode = Number.parseInt(operationCodeDropdown.value);

    let request = new GN.OperationRequest(operationCode, isEncryptedToggle.checked);
    let parameters = new GN.GNHashtable();

    let gnParameters = gnParametersDict[operationCode];
    for (let i = 0; i < gnParameters.length; i++) {
        let gnParameter = gnParameters[i];
        let rowId = i;
        let typeDropdown = document.getElementById("typeRow" + rowId + "Dropdown");
        if (typeDropdown == null) continue;

        let type = typeDropdown.value;
        parameters.add(gnParameter.parameterCode, getValueOfRow(type, i));

        // code
        // "parameterCode": field.code,
        // "parameterName": field.name,
        // "parameterType": <number>field.gnFieldType,
        // "parameterIsOptional": field.isOptional
    }

    request.setParameters(parameters);

    return request;
}

function getValueOfRow(value, rowId) {
    if (value == "0") {
        let inputField = document.getElementById("valueRow" + rowId + "Field");

        return inputField.value;
    }
    else if (value == "1") {
        let inputField = document.getElementById("valueRow" + rowId + "Field");

        if (inputField.value) return Number.parseInt(inputField.value);
        return null;
    }
    else if (value == "2") {
        let checkBoxField = document.getElementById("valueRow" + rowId + "Toggle");

        return checkBoxField.checked;
    }
    else if (value == "3") {
        let gnHashtable = new GN.GNHashtable();

        let parentRowId = rowId;
        let lastRowId = 0;
        while (true) {
            let endRowId = parentRowId + "." + lastRowId;

            let typeDropdown = document.getElementById("typeRow" + endRowId + "Dropdown");
            if (typeDropdown == null) break;

            let parameterCodeField = document.getElementById("parameterCodeRow" + endRowId + "Field");
            let value = parameterCodeField.value;

            if (!value) {
                alert("A parameters at row does not has value " + endRowId);
                return;
            }

            let endType = typeDropdown.value;
            gnHashtable.add(value, getValueOfRow(endType, endRowId));

            lastRowId++;
        }

        return gnHashtable;
    }
    else if (value == "4") {
        let gnArray = new GN.GNArray();

        let parentRowId = rowId;
        let lastRowId = 0;
        while (true) {
            let endRowId = parentRowId + "." + lastRowId;

            let typeDropdown = document.getElementById("typeRow" + endRowId + "Dropdown");
            if (typeDropdown == null) break;

            let endType = typeDropdown.value;
            gnArray.add(getValueOfRow(endType, endRowId));

            lastRowId++;
        }

        return gnArray;
    }
}

function sendViaHttp() {
    let request = getOperationRequest();

    GN.GNNetwork.sendViaHttp(request, response => {
        onOperationResponse(response);

        loadLastAuthToken();
    });
}

function sendViaSocket() {
    let request = getOperationRequest();

    GN.GNNetwork.sendViaSocket(request, response => {
        onOperationResponse(response);

        loadLastAuthToken();
    });
}

function onOperationResponse(operationResponse) {
    let parameters = operationResponse.getParameters();

    let panelOperationResponse = document.getElementById("panelOperationResponse");
    panelOperationResponse.innerHTML = "";

    let divRow = document.createElement("div");
    divRow.classList.add("row");

    let div0 = document.createElement("div");
    div0.classList.add("col-12");
    div0.classList.add("col-md-4");
    let div0a = document.createElement("label");
    div0a.classList.add("form-control");

    let operationCode = operationResponse.getOperationCode();
    div0a.innerText = gnOperationNameDict[operationCode];
    div0.appendChild(div0a);

    let div1 = document.createElement("div");
    div1.classList.add("col-12");
    div1.classList.add("col-md-4");
    let div1a = document.createElement("label");
    div1a.classList.add("form-control");
    let returnCode = operationResponse.getReturnCode();
    div1a.innerText = "ReturnCode: " + gnReturnCodeDict[returnCode.toString()];
    div1.appendChild(div1a);

    let div2 = document.createElement("div");
    div2.classList.add("col-12");
    div2.classList.add("col-md-4");

    let div3 = document.createElement("div");

    if (returnCode == GN.ReturnCode.Ok) {
        let div2a = document.createElement("label");
        div2a.classList.add("form-control");
        div2a.innerText = "ErrorCode: " + parameters.getNumber("E");
        div2.appendChild(div2a);

        let keys = Object.keys(parameters.dict);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];

            if (key == "E") continue;
            let value = parameters.getObject(key);

            div3.appendChild(createResponseElementFromGNHashtable(key, value));
        }
    }
    else if (returnCode == GN.ReturnCode.InvalidRequestParameters) {
        let invalidMembers = operationResponse.getInvalidMembers();

        if (invalidMembers.length != 0) {
            let invalidMember = invalidMembers[0];

            let div2a = document.createElement("label");
            div2a.classList.add("form-control");
            let gnParameters = gnParametersDict[operationCode];
            let gnParameter = gnParameters.find(x => x.parameterCode == invalidMember.code);
            let parameterName = gnParameter != null ? gnParameter.parameterName : invalidMember.code;

            div2a.innerText = "InvalidMember: " + parameterName + " " + gnInvalidMemberTypeDict[invalidMember.invalidMemberType.toString()];
            div2.appendChild(div2a);
        }
    }
    else {

    }

    divRow.appendChild(div0);
    divRow.appendChild(div1);
    divRow.appendChild(div2);
    divRow.appendChild(div3);

    panelOperationResponse.appendChild(divRow);
}

function onOperationEvent(operationEvent) {
    let parameters = operationEvent.getParameters();

    let panelOperationEvent = document.getElementById("panelOperationEvent");
    panelOperationEvent.innerHTML = "";

    let divRow = document.createElement("div");
    divRow.classList.add("row");

    let div0 = document.createElement("div");
    div0.classList.add("col-12");
    div0.classList.add("col-md-4");
    let div0a = document.createElement("label");
    div0a.classList.add("form-control");

    div0a.innerText = gnEventNameDict[operationEvent.getEventCode()];
    div0.appendChild(div0a);

    let div3 = document.createElement("div");

    if (parameters != null) {
        let keys = Object.keys(parameters.dict);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];

            if (key == "E") continue;
            let value = parameters.getObject(key);

            div3.appendChild(createResponseElementFromGNHashtable(key, value));
        }
    }

    divRow.appendChild(div0);
    divRow.appendChild(div3);

    panelOperationEvent.appendChild(divRow);
}

function createResponseElementFromGNHashtable(key, value) {
    let div = document.createElement("div");
    div.classList.add("mt-1");

    let divRow = document.createElement("div");
    divRow.classList.add("row");

    let divRow0 = document.createElement("div");
    divRow0.classList.add("col-12");
    divRow0.classList.add("col-md-2");
    let label = document.createElement("label");
    label.classList.add("form-control");
    label.innerText = key;
    divRow0.appendChild(label);

    let divRow1 = document.createElement("div");
    divRow1.classList.add("col-12");
    divRow1.classList.add("col-md-2");
    let typeSpan = document.createElement("span");
    typeSpan.style = "line-height: 40px;";
    divRow1.appendChild(typeSpan);

    let divRow2 = document.createElement("div");
    divRow2.classList.add("col-12");

    if (value == null) {
        let span = document.createElement("span");
        span.style = "line-height: 40px;";
        span.innerText = "null";

        divRow2.appendChild(span);
        divRow2.classList.add("col-md-8");

        typeSpan.innerText = "Unknown";
    }
    else {
        let typeOfValue = typeof value;

        if (typeOfValue == "string") {
            let inputField = document.createElement("input");
            inputField.classList.add("input-height");
            inputField.classList.add("form-control");
            inputField.type = "text";
            inputField.value = value;
            inputField.disabled = true;

            divRow2.appendChild(inputField);
            divRow2.classList.add("col-md-8");

            typeSpan.innerText = "String";
        }
        else if (typeOfValue == "number") {
            let span = document.createElement("span");
            span.style = "line-height: 40px;";
            span.innerText = value;

            divRow2.appendChild(span);
            divRow2.classList.add("col-md-8");

            typeSpan.innerText = "Number";
        }
        else if (typeOfValue == "boolean") {
            let checkBoxField = document.createElement("input");
            checkBoxField.type = "checkbox";
            checkBoxField.style = "margin-top: 6px; height: 26px; width: 26px;";
            checkBoxField.value = value;
            checkBoxField.disabled = true;

            if (value)
                checkBoxField.checked = true;

            divRow2.appendChild(checkBoxField);
            divRow2.classList.add("col-md-8");

            typeSpan.innerText = "Boolean";
        }
        else if (value instanceof GN.GNHashtable) {
            let divHashtable0 = document.createElement("div");
            divHashtable0.style = "padding-left: 40px; flex: 1;";

            let keys = Object.keys(value.dict);
            for (let i = 0; i < keys.length; i++) {
                let childKey = keys[i];
                let childValue = value.getObject(childKey);

                divHashtable0.appendChild(createResponseElementFromGNHashtable(childKey, childValue));
            }

            divRow2.appendChild(divHashtable0);
            divRow2.classList.add("mb-1");
            divRow2.style = "display: flex;";

            typeSpan.innerText = "GNHashtable";
        }
        else if (value instanceof GN.GNArray) {
            let divArray0 = document.createElement("div");
            divArray0.style = "padding-left: 40px; flex: 1;";

            for (let i = 0; i < value.array.length; i++) {
                let childValue = value.getObject(i);

                divArray0.appendChild(createResponseElementFromGNArray(i, childValue));
            }

            divRow2.appendChild(divArray0);
            divRow2.classList.add("mb-1");
            divRow2.style = "display: flex;";

            typeSpan.innerText = "GNArray";
        }
    }

    divRow.appendChild(divRow0);
    divRow.appendChild(divRow1);
    divRow.appendChild(divRow2);

    div.appendChild(divRow);

    return div;
}

function createResponseElementFromGNArray(id, value) {
    let div = document.createElement("div");
    div.classList.add("mt-1");

    let divRow = document.createElement("div");
    divRow.classList.add("row");

    let divRow0 = document.createElement("div");
    divRow0.classList.add("col-12");
    divRow0.classList.add("col-md-2");
    let span = document.createElement("span");
    span.style = "line-height: 40px;";
    span.innerText = id + ".";
    divRow0.appendChild(span);

    let divRow1 = document.createElement("div");
    divRow1.classList.add("col-12");
    divRow1.classList.add("col-md-2");
    let typeSpan = document.createElement("span");
    typeSpan.style = "line-height: 40px;";
    divRow1.appendChild(typeSpan);

    let divRow2 = document.createElement("div");
    divRow2.classList.add("col-12");

    if (value == null) {
        let span = document.createElement("span");
        span.style = "line-height: 40px;";
        span.innerText = "null";

        divRow2.appendChild(span);
        divRow2.classList.add("col-md-8");

        typeSpan.innerText = "Unknown";
    }
    else {
        let typeOfValue = typeof value;

        if (typeOfValue == "string") {
            let inputField = document.createElement("input");
            inputField.classList.add("input-height");
            inputField.classList.add("form-control");
            inputField.type = "text";
            inputField.value = value;
            inputField.disabled = true;

            divRow2.appendChild(inputField);
            divRow2.classList.add("col-md-8");

            typeSpan.innerText = "String";
        }
        else if (typeOfValue == "number") {
            let span = document.createElement("span");
            span.style = "line-height: 40px;";
            span.innerText = value;

            divRow2.appendChild(span);
            divRow2.classList.add("col-md-8");

            typeSpan.innerText = "Number";
        }
        else if (typeOfValue == "boolean") {
            let checkBoxField = document.createElement("input");
            checkBoxField.type = "checkbox";
            checkBoxField.style = "margin-top: 6px; height: 26px; width: 26px;";
            checkBoxField.value = value;
            checkBoxField.disabled = true;

            if (value)
                checkBoxField.checked = true;

            divRow2.appendChild(checkBoxField);
            divRow2.classList.add("col-md-8");

            typeSpan.innerText = "Boolean";
        }
        else if (value instanceof GN.GNHashtable) {
            let divHashtable0 = document.createElement("div");
            divHashtable0.style = "padding-left: 40px; flex: 1;";

            let keys = Object.keys(value.dict);
            for (let i = 0; i < keys.length; i++) {
                let childKey = keys[i];
                let childValue = value.getObject(childKey);

                divHashtable0.appendChild(createResponseElementFromGNHashtable(childKey, childValue));
            }

            divRow2.appendChild(divHashtable0);
            divRow2.classList.add("mb-1");
            divRow2.style = "display: flex;";

            typeSpan.innerText = "GNHashtable";
        }
        else if (value instanceof GN.GNArray) {
            let divArray0 = document.createElement("div");
            divArray0.style = "padding-left: 40px; flex: 1;";

            for (let i = 0; i < value.array.length; i++) {
                let childValue = value.getObject(i);

                divArray0.appendChild(createResponseElementFromGNArray(i, childValue));
            }

            divRow2.appendChild(divArray0);
            divRow2.classList.add("mb-1");
            divRow2.style = "display: flex;";

            typeSpan.innerText = "GNArray";
        }
    }

    divRow.appendChild(divRow0);
    divRow.appendChild(divRow1);
    divRow.appendChild(divRow2);

    div.appendChild(divRow);

    return div;
}

function clearParameters() {
    onOperationCodeDropdownValueChange();
}

function clearOperationResponse() {
    let panelOperationResponse = document.getElementById("panelOperationResponse");
    panelOperationResponse.innerHTML = "";
}

function clearOperationEvent() {
    let panelOperationEvent = document.getElementById("panelOperationEvent");
    panelOperationEvent.innerHTML = "";
}
