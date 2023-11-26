
const fs = require("fs");
const path = require("path");

let docs = [];

let tsLastUpdate = 1736498427663;

docs.push({
  "type": "system",
  "version": "FIRSTVER",
  "fullScript": "// first full script",
  "tsLastUpdate": tsLastUpdate,
  "childScripts": [
    {
        "eventName": "system_OnEveryMinute",
        "script": "\nsystemHandlers.system_OnEveryMinute = async (log: (log: any) => void) => {\n\n}\n",
        "hasEdit": false
    },
    {
      "eventName": "system_OnEveryHour",
      "script": "\nsystemHandlers.system_OnEveryHour = async (log: (log: any) => void) => {\n\n}\n",
      "hasEdit": false
    },
    {
      "eventName": "system_OnEveryDay",
      "script": "\nsystemHandlers.system_OnEveryDay = async (log: (log: any) => void) => {\n\n}\n",
      "hasEdit": false
    },
    {
      "eventName": "system_RequestServerDetail",
      "script": "\nsystemMatchmakingHandlers.system_RequestServerDetail = async (gameId: string, matchmakingTicketCanMatch: MatchmakingTicketCanMatch, log: (log: any) => void): Promise<{ success: boolean }> => {\n\t//call confirmServerDetail(gameId, { ipV4Address: '127.0.0.1', ports: [{ name: 'GamePort', publicPort: 2202, privatePort: 3000, protocol: 1 }] }); // after setup success a dedicated server;\n\treturn { success: false };\n}\n",
      "hasEdit": false
    }
  ]
})

docs.push(readAllTsFiles("authenticate"));
docs.push(readAllTsFiles("characterPlayer"));
docs.push(readAllTsFiles("cloudScript"));
docs.push(readAllTsFiles("content"));
docs.push(readAllTsFiles("dashboard"));
docs.push(readAllTsFiles("gamePlayer"));
docs.push(readAllTsFiles("group"));
docs.push(readAllTsFiles("inventory"));
docs.push(readAllTsFiles("masterPlayer"));
docs.push(readAllTsFiles("multiplayer"));
docs.push(readAllTsFiles("storeInventory"));

writeJson(docs);

function readAllTsFiles(name) {
    let directory = "./src/GN-app-api/handler/controller/handler/" + name;

    let answer = {
      type: name,
      version: "FIRSTVER",
      fullScript: "// first full script",
      tsLastUpdate: tsLastUpdate,
      childScripts: [],
    };

    try {
      // Lấy danh sách tất cả các file và folder trong thư mục
      const files = fs.readdirSync(directory, { withFileTypes: true });
  
      for (const file of files) {
        const filePath = path.join(directory, file.name);
  
        if (file.isDirectory()) {

        } else if (file.isFile() && !file.name.endsWith('BaseRequestHandler.ts') && file.name != "MatchmakingHandler.ts" && file.name.endsWith('.ts')) {
          // Nếu là file .ts, đọc nội dung file
          const content = fs.readFileSync(filePath, 'utf-8');

        let lines = content.split("\n");

            let line2;

            for (let i = 0; i < lines.length; i++) {
                let line = lines[i];

                let trim = line.trimStart();
                if (trim.startsWith("private async execute(")) {
                    line2 = line;
                    break;
                }
            }

            if (!line2) {
                console.log("filePath not has data " + filePath);
            }
            else {
              // line2 =     private async execute(request: { userId: string, eventCode: number, eventParameters: { [k: string]: any }, eventEncrypted: boolean }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {

              // line2.split("(")[1] = request: { userId: string, eventCode: number, eventParameters: { [k: string]: any }, eventEncrypted: boolean }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {

// line2 = private async execute(request: { serviceName: string, serviceData: { [k: string]: any }, createPlayerIfNotExists: boolean, infoRequestParam: InfoRequestParam, ipAddress: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
              
// line2s[0] = private async execute
// line2s[1] = request: { serviceName: string, serviceData: { [k: string]: any }, createPlayerIfNotExists: boolean, infoRequestParam: InfoRequestParam, ipAddress: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
// finalLine2 = request: { serviceName: string, serviceData: { [k: string]: any }, createPlayerIfNotExists: boolean, infoRequestParam: InfoRequestParam, ipAddress: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {

// line3s[0] = request: { serviceName: string, serviceData: { [k: string]: any }, createPlayerIfNotExists: boolean, infoRequestParam: InfoRequestParam, ipAddress: string }, secretInfo: SecretInfo, operationRequest: OperationRequest
// line3s[1] = : Promise<OperationResponse> {
// finalLine3 = request: { serviceName: string, serviceData: { [k: string]: any }, createPlayerIfNotExists: boolean, infoRequestParam: InfoRequestParam, ipAddress: string }, secretInfo: SecretInfo, operationRequest: OperationRequest

// line4s[0] = request: { serviceName: string, serviceData: { [k: string]: any 
// line4s[1] = , createPlayerIfNotExists: boolean, infoRequestParam: InfoRequestParam, ipAddress: string 
// line4s[2] = , secretInfo: SecretInfo, operationRequest: OperationRequest

              let line2s = line2.split("(");
              let finalLine2 = "";
              for (let i = 1; i < line2s.length; i++) {
                finalLine2 += line2s[i];
                if (i < line2s.length - 1) finalLine2 += "(";
              }

              let line3s = finalLine2.split(")");
              let finalLine3 = "";
              for (let i = 0; i < line3s.length - 1; i++) {
                finalLine3 += line3s[i];

                if (i < line3s.length - 2) finalLine3 += ")";
              }

//async (request: { androidDeviceId: string, createPlayerIfNotExists: boolean, infoRequestParam: authenticate_InfoRequestParam, ipAddress: string }, secretInfo: SecretInfo, operationRequest: OperationRequest)
//async (request: { gameId: string, requestParams: ServerGameDataRequestParams }, secretInfo: SecretInfo, operationRequest: OperationRequest)
              let line4s = finalLine3.split("}");
              let finalLine4 = "";
              for (let i = 0; i < line4s.length - 1; i++) {
                finalLine4 += line4s[i];

                if (i < line4s.length - 2) finalLine4 += "}";
              }

                let spls2 = finalLine4 + "}";

                spls2 = spls2
                    .replace("infoRequestParam: InfoRequestParam", "infoRequestParam: " + name + "_InfoRequestParam");
                    
                let childScript = {
                    eventName: name + "_" + file.name.replace("RequestHandler.ts", ""),
                    script: "",
                    hasEdit: false,

                }

                let script = "\n";
                script += "preHandlers." + childScript.eventName + " = async (" + spls2 + ", secretInfo: SecretInfo, operationRequest: OperationRequest, log: (log: any) => void) => {\n"
                script += "\n";
                script += "\treturn null;\n"
                script += "}\n";
                script += "\n";

                script += "postHandlers." + childScript.eventName + " = async (" + spls2 + ", secretInfo: SecretInfo, operationRequest: OperationRequest, operationResponse: OperationResponse, log: (log: any) => void) => {\n"
                script += "\n";
                script += "\treturn operationResponse;\n"
                script += "}\n";

                childScript.script = script;

                answer.childScripts.push(childScript);
            }
        }
      }
    } catch (error) {
      console.error('Error reading files:', error);
    }

    return answer;
  }

function writeJson(docs) {
    fs.writeFileSync("./src/GN-startup/cloudScript/eventCallbackCloudScriptData.json", JSON.stringify(docs, null, 4));
}