#!/bin/bash
VERSION=1.0.8

COMMAND=$1
DIR="$(pwd)"

shopt -s extglob                 # enable +(...) glob syntax
PROJECT_NAME=${DIR%%+(/)}        # trim however many trailing slashes exist
PROJECT_NAME=${PROJECT_NAME##*/} # remove everything before the last / that still remains
PROJECT_NAME=${PROJECT_NAME:-/}  # correct for dirname=/ case

PATH_NAME_SPLIT=$(echo "$PROJECT_NAME" | tr " " "\n")
PROJECT_NAME=""
for path in $PATH_NAME_SPLIT; do
    if [ -z $PROJECT_NAME ]; then
        PROJECT_NAME=$path
    else
        PROJECT_NAME=$PROJECT_NAME"_"$path
    fi
done

main() {
    if [ $COMMAND = 'init' ] || [ $COMMAND = '-i' ]; then
        init
    elif [ $COMMAND = 'createRequestHandler' ] || [ $COMMAND = '-c' ]; then
        createRequestHandler $2
    elif [ $COMMAND = 'version' ] || [ $COMMAND = '-v' ]; then
        version
    fi

    return
}

init() {
    if [ -f $DIR/package.json ]; then
        echo 'GN Server is already init on '$DIR
        echo 'Init failure'
        read -p 'Press enter to exit...'
        exit 1
    fi

    echo 'GN Server initing... on path '$DIR' with project name is '$PROJECT_NAME

    init_create_gitignore
    init_create_projectIndexJs
    init_create_GNConfigDebugJson
    init_create_testDataIndexTs
    init_create_debugDataIndexTs
    init_create_logDataIndexTs
    init_create_indexTs
    init_create_postIndexTs
    init_create_srcAppApiHandlerDir
    init_create_srcCommonConstantDir
    init_create_releaseSh
    init_create_packageJson
    init_create_tsconfigJson
    init_run_npmUpdate

    echo 'create '$PROJECT_NAME' project successs.'
    read -p 'Press enter to exit...'

    return
}

init_create_gitignore() {
    echo 'node_modules/
.idea/
.vscode/
.DS_Store
package-lock.json
*.js
*.bak
.env
*.log
scratch/
GNconfig.release.json' >.gitignore

    echo 'create .gitignore file success'

    return
}

init_create_projectIndexJs() {
    echo 'process.env.ENVIROMENT = "debug";
require("./index");' >$PROJECT_NAME'.index.js'
    echo 'create '$PROJECT_NAME'.index.js file success'

    return
}

init_create_GNConfigDebugJson() {
    echo '{
    "name": "debug",
    "options": {
        "port": 2202,
        "useSsl": false,
        "keyFilePath": "",
        "certFilePath": "",
		"licenseKeyFilePath": "",
		"expiredTokenInMs": 172800000,

        "httpAppEnable": true,
        "httpAppAllowOrigin": "*",
        "httpAppCredentials": true,
        "httpAppAllowMethods": ["GET", "POST"],
        "httpAppAllowHeaders": ["a", "content-type"],
		"httpAppEnableSendAndReceiveDebug": true,
		"httpAppEnablePostViaMsgPack": true,
        "httpAppEnablePostViaJson": true,
		
		"socketAppEnable": true,
		"socketAppAllowOrigin": "*",
		"socketAppCredentials": true,
		"socketAppAllowMethods": ["GET"],
		"socketAppAllowHeaders": [],
		"socketAppEnableSendAndReceiveDebug": true,
		"socketAppEnablePostViaMsgPack": true,
		"socketAppEnablePostViaJson": true,
		"socketAppPingInterval": 50000,
		"socketAppPingTimeout": 5000,
		
		"uploadFileEnable": true,
        "uploadPath": "./file-upload",
        "maxSizeUpload": 52428800,
        "mimeTypeAccepts": ["image/png"],
		
        "adapterEventCollectionName": "AdapterEventCollection",
        "authInfoCollectionName": "AuthInfoCollection",
        "configCollectionName": "Config",
        "packageName": "com.xmobitea.GNServer",
        "appleClientId": "com.xmobitea.GNServer",
		"googleClientId": "gn-server",
				
        "databaseConnectionString": "mongodb://localhost:27017/?replicaSet=rs0",
        "databaseName": "XmobiTea",
        "databaseGameName": "GN.",
        "databaseOptions": {
            "minPoolSize": 5,
            "maxPoolSize": 100
        },

        "mailEnable": false,
        "mailSendFrom": "changx@xmobitea.com",
        "mailSendGridApiKey": "SG.",

		"debugToolEnable": true,
		"testToolEnable": true,
        "logToolEnable": true,
		"toolHashs": ["hashToolHere"],

		"logToConsoleEnable": true,
		"logToFileEnable": true,
		"logPath": "./log/debug/Server.log",
		
		"socketMaxRequestPerSecondPerIp": 50,
		"socketMaxRequestPerSecondPerPeer": 20,
		"socketMaxPendingRequest": 1000,
		"socketMaxRequestSize": 1024,
		"httpMaxRequestPerSecondPerIp": 50,
		"httpMaxRequestPerSecondPerPeer": 20,
		"httpMaxPendingRequest": 1000,
		"httpMaxRequestSize": 1024,
		"maxUploadPendingRequest": 200,
		"maxDownloadPendingRequest": 200,
		"reportDdosCollectionName": "ReportDdosCollection",
		"banDdosCollectionName": "BanDdosCollection"
    }
}' >GNconfig.debug.json
    echo 'create GNconfig.debug.json file success'

    return
}

init_create_testDataIndexTs() {
    echo 'import express from "express";

import { OperationCodeExtensions } from "./src/common/constant/OperationCode.ext";
import { OperationCode } from "@xmobitea/gn-server";

const router = express.Router();

router.get("/", (req, res) => {
    let html =
        "<!DOCTYPE html>" +
        "<html lang=\"en\">" +
        "<head>" +
        "   <style>" +
        "       #lastContentTxt { white-space: pre; font-family: monospace; }" +
        "   </style>" +
        "   <link href=\"https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css\" rel=\"stylesheet\" integrity=\"sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3\" crossorigin=\"anonymous\">" +
        "</head>" +
        "<body>" +
        "   <div class=\"bd-intro ps-lg-4\">" +
        "        <h1>[GN SERVER] TEST SEND DATA TOOL</h1><br><br>" +
        "        <div class=\"operationCodeDropdown\">" +
        "            <select class=\"form-select form-select-lg mb-3\" name=\"operationCodeDropdown\" id=\"operationCodeDropdown\">";

        let keys0 = Object.keys(OperationCode) as Array<string>;
        let values0 = Object.values(OperationCode) as Array<number>;
        
        let keys1 = Object.keys(OperationCodeExtensions) as Array<string>;
        let values1 = Object.values(OperationCodeExtensions) as Array<number>;

        for (let i = 0; i < keys0.length; i++) {
            html +=
            "                <option value=\"" + values0[i] + "\">" + keys0[i] + " " + values0[i] + "</option>";
        }

        for (let i = 0; i < keys1.length; i++) {
            html +=
            "                <option value=\"" + values1[i] + "\">" + keys1[i] + " " + values1[i] + "</option>";
        }

        html +=
        "            </select>" +
        "        </div>" +
        "        <div class=\"form-floating mb-3\">" +
		"	         <input type=\"text\" class=\"form-control\" id=\"authTokenField\">" +
		"	         <label for=\"authTokenField\">Parse AuthToken here</label>" +
		"        </div>" +
		"        <div class=\"form-floating mb-3\">" +
		"	         <input type=\"text\" class=\"form-control\" id=\"parametersDataField\" value=\"{}\">" +
		"	         <label for=\"parametersDataField\">Parse parameters data here</label>" +
		"        </div>" +
		"        <button type=\"button\" class=\"btn btn-success\" onclick=\"sendRequest()\">SEND REQUEST</button>" +
		"   <div>" +
        "       <b><p id=\"lastContentTxt\"></p></b>" +
		"   </div>";

        html +=
        "   <script>" +
        "        const authTokenField = document.getElementById(\"authTokenField\");" +
        "        const parametersDataField = document.getElementById(\"parametersDataField\");" +
        "        const operationCodeDropdown = document.getElementById(\"operationCodeDropdown\");" +
        "        const lastContentTxt = document.getElementById(\"lastContentTxt\");" +
                
        "        function sendRequest() {" +
        "            let parametersData = parametersDataField.value;" +
                    
        "            let xhr = new XMLHttpRequest();" +
        "            xhr.open(\"POST\", \"/api/0/\" + operationCodeDropdown.options[operationCodeDropdown.selectedIndex].value, true);" +
        "            xhr.setRequestHeader(\"Content-Type\", \"application/json\");" +
        "            if (authTokenField.value != null) xhr.setRequestHeader(\"a\", authTokenField.value);" +

        "            xhr.onload = () => {" +
        "                if (xhr.status == 200) {" +
        "                    lastContentTxt.textContent = xhr.responseText;" +
        "                } else {" +
        "                    lastContentTxt.textContent = \"error: \" + xhr.statusText;" +
        "                }" +
        "            };" +

        "            xhr.onerror = (e) => {" +
        "                lastContentTxt.textContent = e.toString();" +
        "            };" +

        "            xhr.send(parametersData);" +
        "       };" +
        "   </script>" +
        "</body>" +
        "</html>";


    res.send(html);
});

module.exports = router;' >testData.index.ts
    echo 'create testData.index.ts file success'

    return
}

init_create_debugDataIndexTs() {
    echo 'import express from "express";

import { ParameterCode, DebugParameterCode, GetAppConfigParameterCode, LoginParameterCode, EnterDisplayNameParameterCode, FetchAllDataParameterCode, RegisterSocketParameterCode } from "@xmobitea/gn-server";
import { DebugErrorCode, GetAppConfigErrorCode, LoginErrorCode, EnterDisplayNameErrorCode, FetchAllDataErrorCode, RegisterSocketErrorCode } from "@xmobitea/gn-server";

import { TestErrorCode } from "./src/common/constant/errorCode/TestErrorCode";
import { TestParameterCode } from "./src/common/constant/parameterCode/TestParameterCode";

let allParameterCodes: any[] = [];
allParameterCodes.push(ParameterCode);
allParameterCodes.push(DebugParameterCode);
allParameterCodes.push(GetAppConfigParameterCode);
allParameterCodes.push(LoginParameterCode);
allParameterCodes.push(EnterDisplayNameParameterCode);
allParameterCodes.push(FetchAllDataParameterCode);
allParameterCodes.push(RegisterSocketParameterCode);
allParameterCodes.push(TestParameterCode);

let allErrorCodes: any[] = [];
allErrorCodes.push(DebugErrorCode);
allErrorCodes.push(GetAppConfigErrorCode);
allErrorCodes.push(LoginErrorCode);
allErrorCodes.push(EnterDisplayNameErrorCode);
allErrorCodes.push(FetchAllDataErrorCode);
allErrorCodes.push(RegisterSocketErrorCode);
allErrorCodes.push(TestErrorCode);

let allParameterCodeDic = {} as any;
for (let i = 0; i < allParameterCodes.length; i++) {
    let parameterCodes = {} as any;
    
    let parameterCode = allParameterCodes[i];
    
    let keys = Object.keys(parameterCode) as Array<string>;
    let values = Object.values(parameterCode) as Array<string>;

    for (let j = 0; j < keys.length; j++) {
        let value = values[j];
        let key = keys[j];
        parameterCodes[value] = key;
    }

    allParameterCodeDic[parameterCode.name] = parameterCodes;
}

let allErrorCodeDic = {} as any;
for (let i = 0; i < allErrorCodes.length; i++) {
    let errorCodes = {} as any;
    
    let errorCode = allErrorCodes[i];
    
    let keys = Object.keys(errorCode) as Array<string>;
    let values = Object.values(errorCode) as Array<number>;

    for (let j = 0; j < keys.length; j++) {
        let value = values[j];
        let key = keys[j];
        errorCodes[value.toString()] = key;
    }

    allErrorCodeDic[errorCode.name] = errorCodes;
}

const router = express.Router();

router.get("/", (req, res) => {
    let html =
        "<!DOCTYPE html>" +
        "<html lang=\"en\">" +
        "<head>" +
        "   <style>" +
        "       #lastContentTxt { white-space: pre; font-family: monospace; }" +
        "   </style>" +
		"	<link href=\"https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css\" rel=\"stylesheet\" integrity=\"sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3\" crossorigin=\"anonymous\">" +
        "</head>" +
        "<body>" +
		"	<div class=\"bd-intro ps-lg-4\">" +
        "   <h1>[GN SERVER] DEBUG DATA TOOL</h1><br><br>" +

        "   <div class=\"form-floating mb-3\">" +
        "       <input type=\"text\" class=\"form-control\" id=\"debugDataField\">" +
		"		<label for=\"debugDataField\">Parse return data here</label>" +
        "   </div>" +
        "   <br>" +
        "   <div class=\"parameterCodeDropdown\">" +
        "       <select name=\"parameterCodeDropdown\" class=\"form-select form-select-lg mb-3\" id=\"parameterCodeDropdown\" onchange=\"onChangeParameterCode()\">";

        for (let i = 0; i < allParameterCodes.length; i++) {
            let parameterCode = allParameterCodes[i];
            html += "           <option value=\"" + parameterCode.name + "\">" + parameterCode.name + "</option>";
        }

        html +=
        "       </select>" +
        "   </div>" +

        "   <div class=\"errorCodeDropdown\">" +
        "       <select name=\"errorCodeDropdown\" class=\"form-select form-select-lg mb-3\" id=\"errorCodeDropdown\" onchange=\"onChangeErrorCode()\">";

        for (let i = 0; i < allErrorCodes.length; i++) {
            let errorCode = allErrorCodes[i];
            html += "           <option value=\"" + errorCode.name + "\">" + errorCode.name + "</option>";
        }

        html +=
        "       </select>" +
        "   </div>" +
        "   <br>" +
        "   <div>" +
        "       <b><p id=\"lastContentTxt\"></p></b>" +
        "   </div>" +
		"	</div>" +
        "   <script>" +
        "        const allParameterCodeDic = {};" +
        "        const allErrorCodeDic = {};";

        let allParameterCodeKeys = Object.keys(allParameterCodeDic);
        for (let i = 0; i < allParameterCodeKeys.length; i++) {
            let parameterCode = allParameterCodeKeys[i];
            let parameterCodes = allParameterCodeDic[parameterCode];
            
            html += "        allParameterCodeDic[\"" + parameterCode + "\"] = {};";

            let parameterCodeKeys = Object.keys(parameterCodes);
            for (let j = 0; j < parameterCodeKeys.length; j++) {
                let parameterCodeKey = parameterCodeKeys[j];
                html += "        allParameterCodeDic[\"" + parameterCode + "\"][\"" + parameterCodeKey + "\"] = \"" + parameterCodes[parameterCodeKey] + "\";";
            }
        }

        let allErrorCodeKeys = Object.keys(allErrorCodeDic);
        for (let i = 0; i < allErrorCodeKeys.length; i++) {
            let errorCode = allErrorCodeKeys[i];
            let errorCodes = allErrorCodeDic[errorCode];
            
            html += "        allErrorCodeDic[\"" + errorCode + "\"] = {};";

            let errorCodeKeys = Object.keys(errorCodes);
            for (let j = 0; j < errorCodeKeys.length; j++) {
                let errorCodeKey = errorCodeKeys[j];
                html += "        allErrorCodeDic[\"" + errorCode + "\"][\"" + errorCodeKey + "\"] = \"" + errorCodes[errorCodeKey] + "\";";
            }
        }

        html +=
        "        const debugDataField = document.getElementById(\"debugDataField\");" +
        "        const parameterCodeDropdown = document.getElementById(\"parameterCodeDropdown\");" +
        "        const errorCodeDropdown = document.getElementById(\"errorCodeDropdown\");" +
        "        const lastContentTxt = document.getElementById(\"lastContentTxt\");" +

        "        function onChangeParameterCode() {" +
        "            handler();" +
        "        };" +

        "        function onChangeErrorCode() {" +
        "            handler();" +
        "        };" +

        "        debugDataField.onkeyup = function() {" +
        "            handler();" +
        "        };" +
            
        "        function handler() {" +
        "            let value = debugDataField.value;" +
        "            if (!value) {" +
        "                lastContentTxt.textContent =\"\";" +
        "                return;" +
        "            }" +
                    
        "            try {" +
        "                let parameterCode = parameterCodeDropdown.options[parameterCodeDropdown.selectedIndex].value;" +                
        "                let errorCode = errorCodeDropdown.options[errorCodeDropdown.selectedIndex].value;" +

        "                let returnObj = getReturnObj(parameterCode, errorCode, value);" +
        "                lastContentTxt.textContent = JSON.stringify(returnObj, null, 4);" +
        "            }" +
        "            catch (err) {" + 
        "                lastContentTxt.textContent = err.toString();" +
        "            }" +
        "        };" +

        "function getReturnObj(parameterCode, errorCode, str) {" +
        "    let jsonObj = JSON.parse(str);" +
        "    let returnObj = (Array.isArray(jsonObj)) ? getArrayObj(parameterCode, errorCode, jsonObj) : getJsonObj(parameterCode, errorCode, jsonObj);" +
            
        "    return returnObj;" +
        "};" +

        "function getJsonObj(parameterCode, errorCode, jsonObj0) {" +
        "    let returnObj = {};" +
        
        "    let jsonObj0Keys = Object.keys(jsonObj0);" +
        
        "   for (let j = 0; j < jsonObj0Keys.length; j++) {" +
        "        let key = jsonObj0Keys[j];" +
        "        let value = jsonObj0[key];" +
        
        "        if (key == \"0\") {" +
        "            let value0 = allErrorCodeDic[errorCode][value];" +
        "            if (value0 == null) value0 = value;" +
        "            else value0 = errorCode + \"_\" + value0;" +

        "            returnObj[\"ErrorCode\"] = value0;" +
        "        }" +
        "        else {" +
        "            let key0 = allParameterCodeDic[parameterCode][key];" +
        "            if (key0 == null) key0 = key;" +
        "            else key0 = parameterCode + \"_\" + key0;" +
        "            if (value == null) {" +
        "                returnObj[key0] = null;" +
        
        "                continue;" +
        "            }" +
        
        "            let typeOfValue = typeof value;" +
        
        "            if (typeOfValue == \"string\" || typeOfValue == \"number\" || typeOfValue == \"boolean\" || typeOfValue == \"bigint\") {" +
        "                returnObj[key0] = value;" +
        "            }" +
        "            else if (typeOfValue == \"object\") {" +
        "                if (Array.isArray(value)) returnObj[key0] = getArrayObj(parameterCode, errorCode, value);" +
        "                else returnObj[key0] = getJsonObj(parameterCode, errorCode, value);" +
        "            }" +
        "            else returnObj[key0] = value;" +
        "        }" +
        "    }" +
        
        "    return returnObj;" +
        "};" +

        "function getArrayObj(parameterCode, errorCode, arrayObj0) {" +
        "    let returnObj = [];" +
        
        "    for (let j = 0; j < arrayObj0.length; j++) {" +
        "        let value = arrayObj0[j];" +
        
        "        if (value == null) {" +
        "            returnObj.push(null);" +
        
        "            continue;" +
        "        }" +
        
        "        let typeOfValue = typeof value;" +
        
        "        if (typeOfValue == \"string\" || typeOfValue == \"number\" || typeOfValue == \"boolean\" || typeOfValue == \"bigint\") {" +
        "            returnObj.push(value);" +
        "        }" +
        "        else if (typeOfValue == \"object\") {" +
        "            if (Array.isArray(value)) returnObj.push(getArrayObj(parameterCode, errorCode, value));" +
        "            else returnObj.push(getJsonObj(parameterCode, errorCode, value));" +
        "        }" +
        "        else returnObj.push(value);" +
        "    }" + 
        
        "    return returnObj;" +
        "};" +

        "   </script>" +
        
        "</body>" +
        "</html>";


    res.send(html);
});

module.exports = router;' >debugData.index.ts
    echo 'create debugData.index.ts file success'

    return
}

init_create_logDataIndexTs() {
    echo 'import fs from "fs";
let ENVIROMENT = process.env.ENVIROMENT || "debug";
const optionsPath = __dirname + "/./GNconfig." + ENVIROMENT + ".json";

import express from "express";

const router = express.Router();

router.get("/:hash", async (req, res): Promise<any> => {
	let optionStr = fs.readFileSync(optionsPath).toString();
	let fullOptions = JSON.parse(optionStr);
	let options = fullOptions.options;
	let toolHashs = options.toolHashs;

	let fullLogPath = __dirname + "/" + options.logPath;

    let hash = req.params.hash;
    if (!hash) return res.sendStatus(403);
    if (toolHashs.indexOf(hash) == -1) return res.sendStatus(403);
	
    let query = req.query;

    let skip = query["skip"] as any;
    if (skip == null) skip = 0;

    let limit = query["limit"] as any;
    if (limit == null) limit = 100;

    fs.readFile(fullLogPath, "utf-8" , (err, data) => {
        if (err) {
            return res.sendStatus(500);
        }

        let arr = data.replace(/\r\n/g,"\n").split("\n");

        let returnData = [];

        let startI = arr.length - 1 - skip;
        if (startI > arr.length - 1) startI = arr.length - 1;
        let endI = startI - limit;
        if (endI < 0) endI = 0;
        else if (endI > startI) endI = startI;

        for (let i = startI - 1; i >= endI; i--) returnData.push(arr[i]);

        let html =
        "<!DOCTYPE html>" +
        "<html lang=\"en\">" +
        "<head>" +
        "   <style>" +
        "       #lastContentTxt { white-space: pre; font-family: monospace; }" +
        "   </style>" +
        "   <link href=\"https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css\" rel=\"stylesheet\" integrity=\"sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3\" crossorigin=\"anonymous\">" +
        "</head>" +
        "<body>" +
		"   <h1>[GN SERVER] LOG { skip : " + skip + " , limit :" + limit + " }</h1><br><br>" +
        "   <table class=\"table\">" +
        "       <thead>" +
        "           <tr>" +
        "               <th scope=\"col\">#</th>" +
        "               <th scope=\"col\">LOG</th>" +
        "           </tr>" +
        "       </thead>" +
        "       <tbody>";
        for (let i = 0; i < returnData.length; i++) {
            html += 
                "<tr>" +
                "<th scope=\"row\">" + i + "</th>" +
                "<td>" + returnData[i] + "</td>" +
                "</tr>";
        }
        html += "</tbody></table>" +
        "</body>" +
        "</html>";

        return res.send(html);
    });
});

module.exports = router;' >logData.index.ts
    echo 'create logData.index.ts file success'

    return
}

init_create_indexTs() {
    echo 'import fs from "fs";

import { ServerApplicationStartup, Debug } from "@xmobitea/gn-server";
import { TestRequestHandler } from "./src/app-api/handler/TestRequestHandler";
import { PostIndex } from "./PostIndex";

let ENVIROMENT = process.env.ENVIROMENT || "debug";
const optionsPath = __dirname + "/./GNconfig." + ENVIROMENT + ".json";
console.log("[GN Server] ENVIROMENT [" + ENVIROMENT + "], load the config at " + optionsPath);
let optionStr = fs.readFileSync(optionsPath).toString();
let fullOptions = JSON.parse(optionStr);
let options = fullOptions.options;

let postIndex = new PostIndex();

let applicationStartup = new ServerApplicationStartup();
applicationStartup.config(options);
applicationStartup.run(() => {
    Debug.log("Server running...");
});

let gnServer = applicationStartup.getGNServer();
if (options.debugToolEnable) {
    const debugRouter = require("./debugData.index");
    gnServer.getHttpApp().getApp().use("/debug", debugRouter);
}

if (options.testToolEnable) {
	const testRouter = require("./testData.index");
    gnServer.getHttpApp().getApp().use("/test", testRouter);
}

if (options.logToolEnable) {
	const logRouter = require("./logData.index");
    gnServer.getHttpApp().getApp().use("/log", logRouter);
}

gnServer.addHandler(new TestRequestHandler(gnServer));

postIndex.setOptions(options);
postIndex.setGNServer(gnServer);
postIndex.run();

process.on("uncaughtException", (uncaughtException: Error) => {
    Debug.log(
        "Uncaught Exception at: %s - message: %s",
        uncaughtException.stack,
        uncaughtException.message
    );
});

process.on("uncaughtError", (uncaughtException: Error) => {
    Debug.log(
        "Uncaught Error at: %s - message: %s",
        uncaughtException.stack,
        uncaughtException.message
    );
});

process.on("unhandledRejection", (reason: Error) => {
    Debug.log(
        "Unhandled Rejection at: %s - message: %s",
        reason.stack,
        reason.message
    );
});' >index.ts
    echo 'create index.ts file success'

    return
}

init_create_postIndexTs() {
    echo 'import { GNServer, Debug } from "@xmobitea/gn-server";

export class PostIndex {
    private gnServer: GNServer;
    private options: {[k: string]: any};
    
    public setGNServer(gnServer: GNServer) {
        this.gnServer = gnServer;
    }

    public setOptions(options: {}) {
        this.options = options;
    }

    public run(): void {
        Debug.log("Ensure Index database");

        let database = this.gnServer.getDatabase();

        database.createIndex("System." + this.options.authInfoCollectionName, {
            AuthToken: 1,
        });
        database.createIndex(
            "System." +
                this.options.databaseGameName +
                this.options.configCollectionName,
            { ConfigName: 1 }
        );

        database.createIndex("System.Player", { Username: 1 });
        database.createIndex("System.Player", { Username: 1, Password: 1 });
        database.createIndex("System.Player", { TsCreate: -1 });
        database.createIndex("System.Player", { TsLastSeen: -1 });

        database.createIndex(
            "System.Player",
            { "UserEmail.Value": 1, "UserEmail.IsConfirm": -1 },
			{
                sparse: true
            }
        );

        database.createIndex(
            "System.Player",
            { "UserExternal.FacebookId": 1 },
			{
                sparse: true
            }
        );
        database.createIndex(
            "System.Player",
            { "UserExternal.DeviceInfo": 1 },
			{
                sparse: true
            }
        );
        database.createIndex(
            "System.Player",
            { "UserExternal.CustomId": 1 },
			{
                sparse: true
            }
        );
        database.createIndex(
            "System.Player",
            { "UserExternal.PublicAddress": 1 },
			{
                sparse: true
            }
        );
        database.createIndex(
            "System.Player",
            { "UserExternal.AppleUserId": 1 },
			{
                sparse: true
            }
        );
        database.createIndex(
            "System.Player",
            { "UserExternal.GoogleUserId": 1 },
			{
                sparse: true
            }
        );
		
        database.createIndex("System.ExternalFBAuthentication", { UserId: 1 });
        database.createIndex("System.ExternalFBAuthentication", {
            ExternalId: 1,
            IsRemove: -1,
        });

        database.createIndex("System.ExternalAppleAuthentication", {
            UserId: 1,
        });
        database.createIndex("System.ExternalAppleAuthentication", {
            ExternalId: 1,
            IsRemove: -1,
        });

        database.createIndex("System.ExternalGoogleAuthentication", {
            UserId: 1,
        });
        database.createIndex("System.ExternalGoogleAuthentication", {
            ExternalId: 1,
            IsRemove: -1,
        });

        database.createIndex("System.Friend", { UserId: 1 });
        database.createIndex(
            "System." + this.options.databaseGameName + "Player",
            { UserId: 1 }
        );
        database.createIndex(
            "System." + this.options.databaseGameName + "Player",
            { TsCreate: -1 }
        );
        database.createIndex(
            "System." + this.options.databaseGameName + "Player",
            { TsLastSeen: -1 }
        );
    }
}' >PostIndex.ts
    echo 'create PostIndex.ts file success'

    return
}

init_create_srcAppApiHandlerDir() {
    DIR_HANDLER="${DIR}/src/app-api/handler"
    mkdir -p "$DIR_HANDLER"
    echo 'create dir '$DIR_HANDLER

    cd "$DIR_HANDLER"

    echo 'import {
    AuthInfo,
    OperationRequest,
    OperationResponse,
    ParameterCode,
    RequestHandler,
    ReturnCode,
    GNHashtable,
    GNArray,
	DataMember,
    BooleanDataMember,
    NumberDataMember,
    StringDataMember,
    GNHashtableDataMember,
    GNArrayDataMember,

} from "@xmobitea/gn-server";
import { TestErrorCode } from "./../../common/constant/errorCode/TestErrorCode";
import { OperationCodeExtensions } from "./../../common/constant/OperationCode.ext";
import { TestParameterCode } from "./../../common/constant/parameterCode/TestParameterCode";

class TestOperationRequest extends OperationRequest {
    @BooleanDataMember({ code: TestParameterCode.Boolean, isOptional: true })
    booleanValue: boolean;
	
    @NumberDataMember({ code: TestParameterCode.Number, isOptional: true })
    numberValue: number;
	
    @StringDataMember({ code: TestParameterCode.String, isOptional: true })
    stringValue: string;
	
    @GNHashtableDataMember({ code: TestParameterCode.GNHashtable, isOptional: true })
    gnHashtableValue: GNHashtable;
	
    @GNArrayDataMember({ code: TestParameterCode.GNArray, isOptional: true })
    gnArrayValue: GNArray;

    public isValidRequest() {
        return true;
    }
}

export class TestRequestHandler extends RequestHandler {
    public getCode() {
        return OperationCodeExtensions.Test;
    }

    public async handle(
        authInfo: AuthInfo,
        operationRequest: OperationRequest
    ): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, TestOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        let operationResponse = new OperationResponse(
            request.getOperationCode(),
            request.getRequestId()
        );
        operationResponse.setReturnCode(ReturnCode.Ok);
        operationResponse.setScriptData(
            ParameterCode.ErrorCode,
            TestErrorCode.Ok
        );

        operationResponse.setScriptData(
            TestParameterCode.Boolean,
            request.booleanValue
        );
        operationResponse.setScriptData(
            TestParameterCode.Number,
            request.numberValue
        );
        operationResponse.setScriptData(
            TestParameterCode.String,
            request.stringValue
        );
        operationResponse.setScriptData(
            TestParameterCode.GNHashtable,
            request.gnHashtableValue
        );
        operationResponse.setScriptData(
            TestParameterCode.GNArray,
            request.gnArrayValue
        );

        return operationResponse;
    }
}' >TestRequestHandler.ts
    echo 'create TestRequestHandler.ts file success'

    return
}

init_create_srcCommonConstantDir() {
    DIR_CONTANST="${DIR}/src/common/constant"
    mkdir -p "$DIR_CONTANST"
    echo 'create dir '$DIR_CONTANST

    DIR_ENUM_TYPE="${DIR}/src/common/constant/enumType"
    mkdir -p "$DIR_ENUM_TYPE"
    echo 'create dir '$DIR_ENUM_TYPE

    DIR_PARAMETER_CODE="${DIR}/src/common/constant/parameterCode"
    mkdir -p "$DIR_PARAMETER_CODE"
    echo 'create dir '$DIR_PARAMETER_CODE

    DIR_ERROR_CODE="${DIR}/src/common/constant/errorCode"
    mkdir -p "$DIR_ERROR_CODE"
    echo 'create dir '$DIR_ERROR_CODE

    cd "$DIR_CONTANST"
    echo 'import { EventCode } from "@xmobitea/gn-server";

export class EventCodeExtensions extends EventCode {
    
}' >EventCode.ext.ts
    echo 'create EventCode.ext.ts file success'

    echo 'import { OperationCode } from "@xmobitea/gn-server";

export class OperationCodeExtensions extends OperationCode {
    public static readonly Test: number = 10;
}' >OperationCode.ext.ts
    echo 'create OperationCode.ext.ts success'

    cd "$DIR_ENUM_TYPE"
    echo 'export enum TestEnum {
    Value0 = 0,
    Value1 = 1,
}' >TestEnum.ts
    echo 'create TestEnum.ts file success'

    cd "$DIR_ERROR_CODE"
    echo 'export class TestErrorCode {
    public static readonly Ok: number = 1;
}' >TestErrorCode.ts
    echo 'create TestErrorCode.ts file success'

    cd "$DIR_PARAMETER_CODE"
    echo 'export class TestParameterCode {
    public static readonly String: string = "1";
    public static readonly Number: string = "2";
    public static readonly Boolean: string = "3";
    public static readonly GNHashtable: string = "4";
    public static readonly GNArray: string = "5";
}' >TestParameterCode.ts
    echo 'create TestParameterCode.ts file success'

    return
}

init_create_releaseSh() {
    cd "$DIR"

    #     echo 'export PM2_ID_THIS_APP=$(pm2 id '$PROJECT_NAME'.index)

    # if [ "$PM2_ID_THIS_APP" == "[]" ]; then
    # 	pm2 start '$PROJECT_NAME'.index.js
    # else
    # 	pm2 restart '$PROJECT_NAME'.index
    # fi

    # echo "Run release success"' >release.sh
    #     echo 'create release.sh file success'

    return
}

init_create_packageJson() {
    echo '{
  "name": "'$PROJECT_NAME'",
  "version": "1.0.0",
  "description": "",
  "main": "'$PROJECT_NAME'.index.js",
  "scripts": {
    "debug": "npm run build && node '$PROJECT_NAME'.index",
    "build": "tsc",
    "release": "npm run build && release.sh"
  },
  "author": "GN-Server-author",
  "license": "ISC",
  "devDependencies": {
    "typescript": "*"
  },
  "dependencies": {
	"@xmobitea/gn-server": "*"
  }
}' >package.json
    echo 'create package.json file success'

    return
}

init_create_tsconfigJson() {
    echo '{
    "compilerOptions": {
        "target": "es2016",
        "module": "commonjs",
        "declaration": false,
        "strict": false,
        "noImplicitAny": true,
        "noImplicitThis": true,
        "useUnknownInCatchVariables": false,
        "strictPropertyInitialization": false,
        "strictNullChecks": false,
        "noUnusedLocals": false,
        "noUnusedParameters": false,
        "noImplicitReturns": true,
        "noFallthroughCasesInSwitch": true,
        "moduleResolution": "node",
        "esModuleInterop": true,
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true,
        "forceConsistentCasingInFileNames": true,
        "lib": ["ES2020", "dom"],
        "allowSyntheticDefaultImports": true,
        "stripInternal": true,
        "skipLibCheck": true,
		"resolveJsonModule": true
    },
    "exclude": ["node_modules"]
}' >tsconfig.json
    echo 'create tsconfig.json file success'

    return
}

init_run_npmUpdate() {
    echo 'npm update'
    npm update --save

    return
}

createRequestHandler() {
    if [ -f $DIR/package.json ]; then
        echo 'creating request handler'
    else
        echo 'This is not GN server dir, please try cmd: gn.sh -i or gn.sh init'
        echo 'Create requesthandler failure'
        read -p 'Press enter to exit...'
        exit 1
    fi

    REQUEST_NAME=$1

    while [ -z $REQUEST_NAME ]; do
        echo 'enter request handler name: (request handler name must is string and does not contains space character, [0-9][A-Z][a-z] or _)'

        read REQUEST_NAME
    done

    # if [ -z $REQUEST_NAME ]; then
    #     echo 'request name must has a string.'
    #     echo 'create new request failed.'
    #     read -p "Press enter to exit..."
    #     exit 1
    # fi

    DIR_REQUEST_HANDLER=$DIR"/src/app-api/handler"
    DIR_ERROR_CODE=$DIR"/src/common/constant/errorCode"
    DIR_PARAMETER_CODE=$DIR"/src/common/constant/parameterCode"
    FULL_REQUEST_NAME=$REQUEST_NAME"RequestHandler.ts"
    DIR_HANDLER_THIS_REQUEST_HANDLER_PATH=$DIR_REQUEST_HANDLER"/"$FULL_REQUEST_NAME

    FULL_REQUEST_ERROR_CODE_NAME=$REQUEST_NAME"ErrorCode.ts"
    DIR_HANDLER_THIS_REQUEST_ERROR_CODE_PATH=$DIR_ERROR_CODE"/"$FULL_REQUEST_ERROR_CODE_NAME

    FULL_REQUEST_PARAMETER_CODE_NAME=$REQUEST_NAME"ParameterCode.ts"
    DIR_HANDLER_THIS_REQUEST_PARAMETER_CODE_PATH=$DIR_PARAMETER_CODE"/"$FULL_REQUEST_PARAMETER_CODE_NAME

    DIR_OPERATION_CODE_EXT_PATH=$DIR"/src/common/constant/OperationCode.ext.ts"

    if [ -f $DIR_HANDLER_THIS_REQUEST_HANDLER_PATH ]; then
        echo 'the file '$FULL_REQUEST_NAME' had exists, please try another.'
        read -p "Press enter to exit..."
        exit 1
    fi

    OPERATION_CMD_COUNT=$(wc -l $DIR_OPERATION_CODE_EXT_PATH)

    arrOPERATION_CMD_COUNT=(${OPERATION_CMD_COUNT// / })
    OPERATION_COUNT=${arrOPERATION_CMD_COUNT[0]}

    CONTENT_OPERATION=""
    MAX_VALUE=10

    n=0
    while read line; do
        if [ $n -ge 3 ]; then
            CONTENT_OPERATION+="\t"$line

            arrTEMP=(${line//=/ })
            TEMP_CURRENT_VALUE=${arrTEMP[5]}
            arrTEMP_CURRENT_VALUE=(${TEMP_CURRENT_VALUE//;/ })
            CURRENT_VALUE=${arrTEMP_CURRENT_VALUE[0]}

            if [ $MAX_VALUE -lt $CURRENT_VALUE ]; then
                MAX_VALUE=$CURRENT_VALUE
            fi
        else
            CONTENT_OPERATION+=$line
        fi

        if [ $n != $((OPERATION_COUNT - 1)) ]; then
            CONTENT_OPERATION+="\n"
        fi

        if [ $n == $((OPERATION_COUNT - 2)) ]; then
            CONTENT_OPERATION+="\tpublic static readonly "$REQUEST_NAME": number = "$((MAX_VALUE + 1))";"
            CONTENT_OPERATION+="\n"
            CONTENT_OPERATION+="}"
            break
        fi
        n=$((n + 1))
    done <$DIR_OPERATION_CODE_EXT_PATH

    echo -e $CONTENT_OPERATION >$DIR_OPERATION_CODE_EXT_PATH

    echo 'export class '$REQUEST_NAME'ErrorCode {
    public static readonly Ok: number = 1;
}' >$DIR_HANDLER_THIS_REQUEST_ERROR_CODE_PATH

    echo 'export class '$REQUEST_NAME'ParameterCode {
    public static readonly Var1: string = "1";
}' >$DIR_HANDLER_THIS_REQUEST_PARAMETER_CODE_PATH

    echo 'import {
    AuthInfo,
    OperationRequest,
    OperationResponse,
    ParameterCode,
    RequestHandler,
    ReturnCode,
    GNHashtable,
    GNArray,
    DataMember,
    BooleanDataMember,
    NumberDataMember,
    StringDataMember,
    GNHashtableDataMember,
    GNArrayDataMember,
    
} from "@xmobitea/gn-server";
import { OperationCodeExtensions } from "./../../common/constant/OperationCode.ext";
import { '$REQUEST_NAME'ErrorCode } from "./../../common/constant/errorCode/'$REQUEST_NAME'ErrorCode";
import { '$REQUEST_NAME'ParameterCode } from "./../../common/constant/parameterCode/'$REQUEST_NAME'ParameterCode";

class '$REQUEST_NAME'OperationRequest extends OperationRequest {
    @DataMember({ code: '$REQUEST_NAME'ParameterCode.Var1, isOptional: true })
    var1: number;

    public isValidRequest() {
        return true;
    }
}

export class '$REQUEST_NAME'RequestHandler extends RequestHandler {
    public getCode() {
        return OperationCodeExtensions.'$REQUEST_NAME';
    }

    public async handle(
        authInfo: AuthInfo,
        operationRequest: OperationRequest
    ): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, '$REQUEST_NAME'OperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        // let gamePlayer = await this.gnServer.getDatabase().loadGamePlayer(authInfo.getUserId());

        let operationResponse = new OperationResponse(
            request.getOperationCode(),
            request.getRequestId()
        );

        operationResponse.setReturnCode(ReturnCode.Ok);
        operationResponse.setScriptData(
            ParameterCode.ErrorCode,
            '$REQUEST_NAME'ErrorCode.Ok
        );

        operationResponse.setScriptData(
            '$REQUEST_NAME'ParameterCode.Var1,
            request.var1
        );

        return operationResponse;
    }
}' >$DIR_HANDLER_THIS_REQUEST_HANDLER_PATH

    echo "create "$REQUEST_NAME" request handler success!"
    read -p "Press enter to exit..."

    return
}

version() {
    echo "GN Bash version $VERSION"

    return
}

main "$@"
exit
