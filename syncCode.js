var secretPermissionItem = {
    authenticate: {
        loginByAccount: {},
        loginByAndroidDeviceId: {},
        loginByApple: {},
        loginByCustomDeviceId: {},
        loginByCustomId: {},
        loginByFacebook: {},
        loginByGenericService: {},
        loginByGoogle: {},
        loginByiOSDeviceId: {},
        loginByWindowsPhoneDeviceId: {},
        registerAccount: {},
        loginByEditorDeviceId: {},
        loginByLinuxDeviceId: {},
        loginByMacOSDeviceId: {},
        loginByWindowsDeviceId: {},
        refreshAuthToken: {},
    },
    masterPlayer: {
        linkAccount: {},
        linkAndroidDeviceId: {},
        linkApple: {},
        linkCustomDeviceId: {},
        linkCustomId: {},
        linkEditorDeviceId: {},
        linkFacebook: {},
        linkGenericService: {},
        linkGoogle: {},
        linkiOSDeviceId: {},
        linkLinuxDeviceId: {},
        linkMacOSDeviceId: {},
        linkWindowsDeviceId: {},
        linkWindowsPhoneDeviceId: {},

        unlinkAccount: {},
        unlinkAndroidDeviceId: {},
        unlinkApple: {},
        unlinkCustomDeviceId: {},
        unlinkCustomId: {},
        unlinkEditorDeviceId: {},
        unlinkFacebook: {},
        unlinkGenericService: {},
        unlinkGoogle: {},
        unlinkiOSDeviceId: {},
        unlinkLinuxDeviceId: {},
        unlinkMacOSDeviceId: {},
        unlinkWindowsDeviceId: {},
        unlinkWindowsPhoneDeviceId: {},

        addSegment: {},
        removeSegment: {},
        getSegment: {},

        setTag: {},
        removeTag: {},
        getTag: {},

        getDisplayName: {},
        setDisplayName: {},

        getTsCreate: {},
        getIpAddressCreate: {},

        setTsLastLogin: {},
        getTsLastLogin: {},

        setPlayerBan: {},
        getPlayerBan: {},

        setCountryCode: {},
        getCountryCode: {},

        changeAccountPassword: {},
        resetAccountPassword: {},

        setAvatar: {},
        getAvatar: {},

        setPlayerCurrency: {},
        getPlayerCurrency: {},

        setPlayerStatistics: {},
        getPlayerStatistics: {},

        getStatisticsLeaderboard: {},
        getStatisticsLeaderboardAroundPlayer: {},

        getCustomData: {},
        setCustomData: {},

        setPlayerData: {},
        getPlayerData: {},

        getPlayerInformation: {},

        getPlayersWithApple: {},
        getPlayersWithFacebook: {},
        getPlayersWithGoogle: {},
        getPlayersWithGenericService: {},
        getPlayersWithSegment: {},
        getPlayersWithTag: {},
        getExternal: {},

        getPlayersWithDisplayName: {},

        setEmail: {},
        getEmail: {},
    },
    gamePlayer: {
        addSegment: {},
        removeSegment: {},
        getSegment: {},

        setTag: {},
        removeTag: {},
        getTag: {},

        getDisplayName: {},
        setDisplayName: {},

        getTsCreate: {},
        getIpAddressCreate: {},
        getTsLastLogin: {},

        setPlayerBan: {},
        getPlayerBan: {},

        setCountryCode: {},
        getCountryCode: {},

        setAvatar: {},
        getAvatar: {},

        setPlayerCurrency: {},
        getPlayerCurrency: {},

        setPlayerStatistics: {},
        getPlayerStatistics: {},

        getStatisticsLeaderboard: {},
        getStatisticsLeaderboardAroundPlayer: {},

        getCustomData: {},
        setCustomData: {},

        setPlayerData: {},
        getPlayerData: {},

        getPlayerInformation: {},

        getPlayersWithSegment: {},
        getPlayersWithTag: {},

        getPlayerCharacter: {},
        getPlayerInventory: {},
        getPlayerGroup: {},
        getPlayerFriend: {},

        removePlayerItem: {},

        getOnlineStatus: {},
        grantGroup: {},
        grantPlayerItem: {},
        grantPlayerCharacter: {},

        addPlayerFriend: {},
        removePlayerFriend: {},

        removePlayerCharacter: {},

        joinGroup: {},
        leaveGroup: {},

        getPlayersWithDisplayName: {},

        getFriendStatisticsLeaderboardAroundPlayer: {},
        getFriendStatisticsLeaderboard: {},
    },
    characterPlayer: {
        addSegment: {},
        removeSegment: {},
        getSegment: {},

        setTag: {},
        removeTag: {},
        getTag: {},

        getDisplayName: {},
        setDisplayName: {},

        getTsCreate: {},
        getIpAddressCreate: {},
        getTsLastLogin: {},

        setPlayerBan: {},
        getPlayerBan: {},

        setCountryCode: {},
        getCountryCode: {},

        setAvatar: {},
        getAvatar: {},

        setPlayerCurrency: {},
        getPlayerCurrency: {},

        setPlayerStatistics: {},
        getPlayerStatistics: {},

        getStatisticsLeaderboard: {},
        getStatisticsLeaderboardAroundPlayer: {},

        getCustomData: {},
        setCustomData: {},

        setPlayerData: {},
        getPlayerData: {},

        getPlayerInformation: {},

        getPlayersWithSegment: {},
        getPlayersWithTag: {},

        getCatalogId: {},
        getOwner: {},
        getRemoveStatus: {},

        getPlayerFriend: {},
        getPlayerGroup: {},
        getPlayerInventory: {},
        removePlayerItem: {},
        grantPlayerItem: {},

        grantGroup: {},
        joinGroup: {},
        leaveGroup: {},

        setOwner: {},

        addPlayerFriend: {},
        removePlayerFriend: {},

        getPlayersWithDisplayName: {},

        setRemoveStatus: {},

        getFriendStatisticsLeaderboardAroundPlayer: {},
        getFriendStatisticsLeaderboard: {},
    },
    content: {
        getContentData: {},
        setContentData: {},
        createNewFileUploadInfo: {},
        getFileUploadInfo: {},
        requestDownloadFileUploadInfo: {},
        removeFileUploadInfo: {},
        getFileUploadInfoList: {},
    },
    group: {
        addSegment: {},
        removeSegment: {},
        getSegment: {},

        setTag: {},
        removeTag: {},
        getTag: {},

        getDisplayName: {},
        setDisplayName: {},

        getTsCreate: {},

        setAvatar: {},
        getAvatar: {},

        setGroupCurrency: {},
        getGroupCurrency: {},

        setGroupStatistics: {},
        getGroupStatistics: {},

        getStatisticsLeaderboard: {},
        getStatisticsLeaderboardAroundGroup: {},

        getCustomData: {},
        setCustomData: {},

        setGroupData: {},
        getGroupData: {},

        getGroupInformation: {},

        getGroupsWithSegment: {},
        getGroupsWithTag: {},

        getCatalogId: {},
        getRemoveStatus: {},

        getGroupInventory: {},
        removeGroupItem: {},
        grantGroupItem: {},

        getMembers: {},

        addMember: {},
        removeMember: {},
        sendGroupMessage: {},
        getGroupMessage: {},
        setRemoveStatus: {},

        getGroupsWithDisplayName: {},
    },
    inventory: {
        addSegment: {},
        removeSegment: {},
        getSegment: {},

        setTag: {},
        removeTag: {},
        getTag: {},

        getDisplayName: {},
        setDisplayName: {},

        getTsCreate: {},

        setAvatar: {},
        getAvatar: {},

        setItemStatistics: {},
        getItemStatistics: {},

        getStatisticsLeaderboard: {},
        getStatisticsLeaderboardAroundItem: {},

        getCustomData: {},
        setCustomData: {},

        setItemData: {},
        getItemData: {},

        getItemInformation: {},

        getItemsWithSegment: {},
        getItemsWithTag: {},

        getCatalogId: {},
        getClassId: {},
        getItemType: {},
        getAmount: {},
        getOwner: {},
        getRemoveStatus: {},

        setAmount: {},
        setOwner: {},

        setRemoveStatus: {},

        getItemsWithDisplayName: {},
    },
    storeInventory: {
        buyStoreItem: {},
        getStoreItemInformation: {},
        getStoreItemsWithTag: {},
        grantStoreItem: {},
        setRemoveStatus: {},
        setStoreItemInformation: {},
        validateAppleAppStoreReceipt: {},
        validateGooglePlayStoreReceipt: {},
        validateFacebookStoreReceipt: {},
    },
    masterAdmin: {
        setMasterGameSettings: {},
        grantAdminAccount: {},
        removeAdminAccount: {},
        setPasswordAdminAccount: {},
        setSecretKeyAdminAccount: {},
        setGameInformation: {},
        grantGame: {},
        changePasswordAdminAccount: {},
        getAdminAccountList: {},
        getGameInformation: {},
        getGameList: {},
        getMasterGameSettings: {},
        getServerLog: {},
        getSecretInfoInformation: {},
        getSecretInfoList: {},
        grantSecretInfo: {},
        setSecretInfoInformation: {},
    }
}

const fs = require("fs");

console.log("syncode running..........");

//mainCSharp();

//mainTypescript();

mainGetSecretInformation();

function mainGetSecretInformation() {
    let mainKeys = Object.keys(secretPermissionItem);

    let str = "\t\tlet gnPermission = new GNHashtable();\n\n";

    mainKeys.forEach(mainKey => {
        str += "\t\t{\n";

        let mainKeyName = mainKey[0].toUpperCase() + mainKey.substring(1);

        str += "\t\t\tlet gn" + mainKeyName + " = new GNHashtable();\n"
        str += "\t\t\tlet " + mainKey + " = permission." + mainKey + ";\n\n"

        let permissionItem = secretPermissionItem[mainKey];

        let childKeys = Object.keys(permissionItem);

        childKeys.forEach(childKey => {

            str += "\t\t\t{\n";
            str += "\t\t\t\tlet permissionRules = " + mainKey + "." + childKey + ";\n";
            str += "\t\t\t\tlet gnPermissionRules = new GNHashtable();\n\n";

            str += "\t\t\t\tgnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);\n";
            str += "\t\t\t\tgnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);\n";
            str += "\t\t\t\tgnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);\n";
            str += "\t\t\t\tgnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);\n\n";

            let childKeyName = childKey[0].toUpperCase() + childKey.substring(1);

            str += "\t\t\t\tgn" + mainKeyName + ".add(GNParameterCode." + childKeyName + ", permissionRules);\n"

            str += "\t\t\t}\n\n";
        });

        str += "\t\t}\n\n";
    });

    fs.writeFileSync("C:/GNServerFile/GetSecretInformation.ts", str);
}

function mainCSharp() {
    syncCodeCSharp("authenticate", ["LoginBaseRequestHandler.ts"], "Authenticate");
    syncCodeCSharp("characterPlayer", ["CharacterPlayerBaseRequestHandler.ts"], "CharacterPlayer");
    syncCodeCSharp("content", [], "Content");
    syncCodeCSharp("dashboard", [], "MasterAdmin");
    syncCodeCSharp("gamePlayer", ["GamePlayerBaseRequestHandler.ts"], "GamePlayer");
    syncCodeCSharp("group", ["GroupBaseRequestHandler.ts"], "Group");
    syncCodeCSharp("inventory", ["ItemBaseRequestHandler.ts"], "Inventory");
    syncCodeCSharp("masterPlayer", ["MasterPlayerBaseRequestHandler.ts"], "MasterPlayer");
    syncCodeCSharp("storeInventory", ["StoreItemBaseRequestHandler.ts"], "StoreInventory");

    syncModelCodeCSharp("authenticate", "Authenticate");
    syncModelCodeCSharp("characterPlayer", "CharacterPlayer");
    syncModelCodeCSharp("content", "Content");
    syncModelCodeCSharp("dashboard", "MasterAdmin");
    syncModelCodeCSharp("gamePlayer", "GamePlayer");
    syncModelCodeCSharp("group", "Group");
    syncModelCodeCSharp("inventory", "Inventory");
    syncModelCodeCSharp("masterPlayer", "MasterPlayer");
    syncModelCodeCSharp("storeInventory", "StoreInventory");
}

function syncCodeCSharp(dirName, ignoreFileLst, modelName) {
    let fileDir = __dirname + "/./src/GN-app-api/handler/controller/handler/" + dirName;
    let allFilePaths = fs.readdirSync(fileDir);

    let clientApiStr = "";
    clientApiStr += "public class " + modelName + "Api\n";
    clientApiStr += "{\n";
    clientApiStr += "\tpublic ServerApi server { get; } = new ServerApi();\n\n";
    clientApiStr += "\tpublic AdminApi admin { get; } = new AdminApi();\n\n";

    let serverApiStr = "";
    serverApiStr += "\tpublic class ServerApi\n";
    serverApiStr += "\t{\n";

    let adminApiStr = "";
    adminApiStr += "\tpublic class AdminApi\n";
    adminApiStr += "\t{\n";

    let clientModelFileStr = "";
    clientModelFileStr += "public partial class " + modelName + "Models\n";
    clientModelFileStr += "{\n";

    let clientRequestModelFileStr = "";
    clientRequestModelFileStr += "public class " + modelName + "RequestModels\n";
    clientRequestModelFileStr += "{\n";

    let clientResponseModelFileStr = "";
    clientResponseModelFileStr += "public class " + modelName + "ResponseModels\n";
    clientResponseModelFileStr += "{\n";

    for (let i = 0; i < allFilePaths.length; i++) {
        let filePath = allFilePaths[i];

        if (!filePath.includes(".ts"))
            continue;

        if (ignoreFileLst.indexOf(filePath) != -1)
            continue;


        let allLines = fs.readFileSync(fileDir + "/" + filePath).toString().split("\n");

        let name = filePath.replace(".ts", "").replace("RequestHandler", "");

        clientResponseModelFileStr += "\tpublic class " + name + "OperationResponse :  CustomOperationResponse<" + modelName + "Models.ResponseData>\n";
        clientResponseModelFileStr += "\t{\n\n";
        clientResponseModelFileStr += "\t}\n\n";

        let hasServer = false;
        let hasAdmin = false;

        for (let j = 0; j < allLines.length; j++) {
            let lineJ = allLines[j].trim();

            if (lineJ.startsWith("class ")) {
                if (lineJ.includes("RequestHandler")) { // requestModelFileStr += "\tpublic class " + name + "OperationRequest : CustomOperationRequest<AuthenticateModels.LoginByAccountRequestData>"
                } else {
                    let requestDataName = name + "RequestData";
                    let newRequestDataName = requestDataName;

                    let lineSpls = lineJ.split(" ");

                    if (lineSpls[1].startsWith("Admin")) {
                        newRequestDataName = "Admin" + requestDataName;
                        hasAdmin = true;
                    } else if (lineSpls[1].startsWith("Server")) {
                        newRequestDataName = "Server" + requestDataName;
                        hasServer = true;
                    }

                    if (lineSpls[3] == "OperationRequest") {
                        clientModelFileStr += "\tpublic class " + requestDataName + "\n";
                    } else {
                        clientModelFileStr += "\tpublic class " + newRequestDataName + " : " + requestDataName + "\n";
                    } clientModelFileStr += "\t{\n";

                    for (let k = j + 1; k < allLines.length; k++) {
                        let lineK = allLines[k];

                        if (lineK.startsWith("class ") || lineK.startsWith("export class ")) {
                            clientModelFileStr += "\t}\n\n";

                            break;
                        }

                        if (lineK.includes("@")) {
                            let lineKSpls = lineK.split("@"); // [ StringDataMember({ code: GNParameterCode.Username, minLength: 6, maxLength: 32, mustNonNull: true }) ]
                            let lineK2Spls = lineKSpls[1].split("("); // [ StringDataMember, { code: GNParameterCode.Username, minLength: 6, maxLength: 32, mustNonNull: true }) ]
                            let dataMemberName = lineK2Spls[0]; // StringDataMember
                            let lineK3Spls = lineK2Spls[1].split("{")[1].split("}")[0].split(","); // [ code: GNParameterCode.Username, minLength: 6, maxLength: 32, mustNonNull: true ]

                            let hasMustInt = false;
                            let isOptional = false;

                            clientModelFileStr += "\t\t[" + dataMemberName + "(";

                            for (let l = 0; l < lineK3Spls.length; l++) {
                                let lineK4Spls = lineK3Spls[l].split(":");

                                if (lineK4Spls.length <= 1) continue;

                                let key = lineK4Spls[0].trim();
                                let value = lineK4Spls[1].trim();

                                if (key == "elementCls") {
                                    if (value == "String") value = "string";
                                    clientModelFileStr += key + " = typeof(" + value + ")";
                                }
                                else
                                    clientModelFileStr += key + " = " + value;

                                if (l < lineK3Spls.length - 1)
                                    clientModelFileStr += ", ";

                                if (key == "mustInt" && value == "true")
                                    hasMustInt = true;
                                else if (key == "isOptional" && value == "true")
                                    isOptional = true;
                            }

                            clientModelFileStr += ")]\n";

                            k += 1;
                            let lineKNext = allLines[k];

                            let lineKNextUse = lineKNext.trim().split(";")[0];
                            let lineKNextUseSpls = lineKNextUse.split(":");

                            let type = lineKNextUseSpls[1].trim();

                            if (type == "boolean")
                                type = "bool";
                            else if (type == "number") {
                                if (hasMustInt)
                                    type = "long";
                                else
                                    type = "double";

                            } else if (type.startsWith("Array"))
                                type = type.replace("Array", "List");
                            else if (type == "any") type = "object";
                            //createPlayerIfNotExists?
                            if (isOptional) {
                                if (lineSpls[1].startsWith("Admin") || lineSpls[1].startsWith("Server"))
                                    clientModelFileStr += "\t\tpublic new " + type + "? " + lineKNextUseSpls[0].trim().split("?")[0] + ";\n\n";
                                else
                                    clientModelFileStr += "\t\tpublic " + type + "? " + lineKNextUseSpls[0].trim().split("?")[0] + ";\n\n";
                            }
                            else {
                                if (lineSpls[1].startsWith("Admin") || lineSpls[1].startsWith("Server"))
                                    clientModelFileStr += "\t\tpublic new " + type + " " + lineKNextUseSpls[0].trim().split("?")[0] + ";\n\n";
                                else
                                    clientModelFileStr += "\t\tpublic " + type + " " + lineKNextUseSpls[0].trim().split("?")[0] + ";\n\n";
                            }

                            j = k;
                        }
                    }
                }
            }
        }

        let name2 = name[0].toLowerCase() + name.substring(1);

        clientApiStr += "\tpublic void " + name2 + "(" + modelName + "Models." + name + "RequestData requestData, Action<" + modelName + "ResponseModels." + name + "OperationResponse> response = null, string overrideAuthToken = null, string overrideSecretKey = null, GNHashtable customTags = null, int timeout = OperationRequest.defaultTimeOut)\n";
        clientApiStr += "\t{\n";
        clientApiStr += "\t\tGNNetwork.sendViaHttp(new " + modelName + "RequestModels." + name + "OperationRequest(requestData, timeout), response, overrideAuthToken, overrideSecretKey, customTags);\n";
        clientApiStr += "\t}\n\n";

        clientRequestModelFileStr += "\tpublic class " + name + "OperationRequest : CustomOperationRequest<" + modelName + "Models." + name + "RequestData>\n";
        clientRequestModelFileStr += "\t{\n";
        clientRequestModelFileStr += "\t\tprotected override int operationCode => OperationCode." + name + ";\n";
        clientRequestModelFileStr += "\t\tprotected override bool operationEncrypted => true;\n";
        clientRequestModelFileStr += "\t\tprotected override RequestType requestType => RequestType." + modelName + ";\n";
        clientRequestModelFileStr += "\t\tprotected override RequestRole requestRole => RequestRole.Client;\n\n";

        clientRequestModelFileStr += "\t\tpublic " + name + "OperationRequest(" + modelName + "Models." + name + "RequestData requestData, int timeout = OperationRequest.defaultTimeOut) : base(requestData, timeout) { }\n";
        clientRequestModelFileStr += "\t}\n\n";

        if (hasServer) {
            serverApiStr += "\t\tpublic void " + name2 + "(" + modelName + "Models.Server" + name + "RequestData requestData, Action<" + modelName + "ResponseModels." + name + "OperationResponse> response = null, string overrideAuthToken = null, string overrideSecretKey = null, GNHashtable customTags = null, int timeout = OperationRequest.defaultTimeOut)\n";
            serverApiStr += "\t\t{\n";
            serverApiStr += "\t\t\tGNNetwork.sendViaHttp(new " + modelName + "RequestModels.Server" + name + "OperationRequest(requestData, timeout), response, overrideAuthToken, overrideSecretKey, customTags);\n";
            serverApiStr += "\t\t}\n\n";

            clientRequestModelFileStr += "\tpublic class Server" + name + "OperationRequest : " + name + "OperationRequest\n";
            clientRequestModelFileStr += "\t{\n";
            clientRequestModelFileStr += "\t\tprotected override RequestRole requestRole => RequestRole.Server;\n\n";

            clientRequestModelFileStr += "\t\tpublic Server" + name + "OperationRequest(" + modelName + "Models.Server" + name + "RequestData requestData, int timeout = OperationRequest.defaultTimeOut) : base(requestData, timeout) { }\n";
            clientRequestModelFileStr += "\t}\n\n";
        }

        if (hasAdmin) {
            adminApiStr += "\t\tpublic void " + name2 + "(" + modelName + "Models.Admin" + name + "RequestData requestData, Action<" + modelName + "ResponseModels." + name + "OperationResponse> response = null, string overrideAuthToken = null, string overrideSecretKey = null, GNHashtable customTags = null, int timeout = OperationRequest.defaultTimeOut)\n";
            adminApiStr += "\t\t{\n";
            adminApiStr += "\t\t\tGNNetwork.sendViaHttp(new " + modelName + "RequestModels.Admin" + name + "OperationRequest(requestData, timeout), response, overrideAuthToken, overrideSecretKey, customTags);\n";
            adminApiStr += "\t\t}\n\n";

            clientRequestModelFileStr += "\tpublic class Admin" + name + "OperationRequest : " + name + "OperationRequest\n";
            clientRequestModelFileStr += "\t{\n";
            clientRequestModelFileStr += "\t\tprotected override RequestRole requestRole => RequestRole.Admin;\n\n";

            clientRequestModelFileStr += "\t\tpublic Admin" + name + "OperationRequest(" + modelName + "Models.Admin" + name + "RequestData requestData, int timeout = OperationRequest.defaultTimeOut) : base(requestData, timeout) { }\n";
            clientRequestModelFileStr += "\t}\n\n";
        }

        clientRequestModelFileStr += "\n";
    }

    serverApiStr += "\t}\n";
    adminApiStr += "\t}\n";

    clientApiStr += "\n";
    clientApiStr += serverApiStr;
    clientApiStr += "\n";
    clientApiStr += adminApiStr;
    clientApiStr += "\n";

    clientApiStr += "}\n";
    clientModelFileStr += "}\n";
    clientRequestModelFileStr += "}\n";
    clientResponseModelFileStr += "}\n";

    fs.writeFileSync("C:/GNServerFile/" + modelName + "Api.cs", clientApiStr);
    fs.writeFileSync("C:/GNServerFile/" + modelName + "Models.cs", clientModelFileStr);
    fs.writeFileSync("C:/GNServerFile/" + modelName + "RequestModels.cs", clientRequestModelFileStr);
    fs.writeFileSync("C:/GNServerFile/" + modelName + "ResponseModels.cs", clientResponseModelFileStr);

    // console.log(clientApiStr);
    // console.log(clientModelFileStr);
    // console.log(clientRequestModelFileStr);
    // console.log(clientResponseModelFileStr);

    // fs.readFileSync();

}

function syncModelCodeCSharp(dirName, modelName) {
    let fileDir = __dirname + "/./src/GN-app-api/handler/controller/handler/" + dirName;
    let allFilePaths = fs.readdirSync(fileDir);

    let clientModelFileStr = "";
    clientModelFileStr += "public partial class " + modelName + "Models\n";
    clientModelFileStr += "{\n";

    for (let i = 0; i < allFilePaths.length; i++) {
        let filePath0 = allFilePaths[i];

        if (filePath0.includes(".ts"))
            continue;


        let allFilePaths2 = fs.readdirSync(fileDir + "/" + filePath0);

        for (let m = 0; m < allFilePaths2.length; m++) {
            let filePath = allFilePaths2[m];

            let allLines = fs.readFileSync(fileDir + "/" + filePath0 + "/" + filePath).toString().split("\n");

            let name = filePath.replace(".ts", "").replace("RequestHandler", "");

            for (let j = 0; j < allLines.length; j++) {
                let lineJ = allLines[j].trim();

                if (lineJ.startsWith("export class ")) {
                    let requestDataName = name;

                    clientModelFileStr += "\tpublic class " + requestDataName + "\n";

                    clientModelFileStr += "\t{\n";

                    for (let k = j + 1; k < allLines.length; k++) {
                        let lineK = allLines[k];

                        if (lineK.startsWith("class ") || lineK.startsWith("export class ")) {
                            clientModelFileStr += "\t}\n\n";

                            break;
                        }

                        if (lineK.includes("@")) {
                            let lineKSpls = lineK.split("@"); // [ StringDataMember({ code: GNParameterCode.Username, minLength: 6, maxLength: 32, mustNonNull: true }) ]
                            let lineK2Spls = lineKSpls[1].split("("); // [ StringDataMember, { code: GNParameterCode.Username, minLength: 6, maxLength: 32, mustNonNull: true }) ]
                            let dataMemberName = lineK2Spls[0]; // StringDataMember
                            let lineK3Spls = lineK2Spls[1].split("{")[1].split("}")[0].split(","); // [ code: GNParameterCode.Username, minLength: 6, maxLength: 32, mustNonNull: true ]

                            let hasMustInt = false;
                            let isOptional = false;

                            clientModelFileStr += "\t\t[" + dataMemberName + "(";

                            for (let l = 0; l < lineK3Spls.length; l++) {
                                let lineK4Spls = lineK3Spls[l].split(":");

                                if (lineK4Spls.length <= 1) continue;

                                let key = lineK4Spls[0].trim();
                                let value = lineK4Spls[1].trim();

                                if (key == "elementCls") {
                                    if (value == "String") value = "string";
                                    clientModelFileStr += key + " = typeof(" + value + ")";
                                }
                                else
                                    clientModelFileStr += key + " = " + value;


                                if (l < lineK3Spls.length - 1)
                                    clientModelFileStr += ", ";

                                if (key == "mustInt" && value == "true")
                                    hasMustInt = true;
                                else if (key == "isOptional" && value == "true")
                                    isOptional = true;

                            }

                            clientModelFileStr += ")]\n";

                            k += 1;
                            let lineKNext = allLines[k];

                            let lineKNextUse = lineKNext.trim().split(";")[0];
                            let lineKNextUseSpls = lineKNextUse.split(":");

                            let type = lineKNextUseSpls[1].trim();

                            if (type == "boolean")
                                type = "bool";
                            else if (type == "number") {
                                if (hasMustInt)
                                    type = "long";
                                else
                                    type = "double";

                            } else if (type.startsWith("Array"))
                                type = type.replace("Array", "List");
                            else if (type == "any") type = "object";

                            if (isOptional) {
                                clientModelFileStr += "\t\tpublic " + type + "? " + lineKNextUseSpls[0].trim().split("?")[0] + ";\n\n";
                            }
                            else {
                                clientModelFileStr += "\t\tpublic " + type + " " + lineKNextUseSpls[0].trim().split("?")[0] + ";\n\n";
                            }

                            j = k;
                        }
                    }

                    clientModelFileStr += "\t}\n\n";
                }
            }
        }
    }

    clientModelFileStr += "}\n";

    fs.writeFileSync("C:/GNServerFile/" + modelName + "Models.Partial.cs", clientModelFileStr);

    // console.log(clientApiStr);
    // console.log(clientModelFileStr);
    // console.log(clientRequestModelFileStr);
    // console.log(clientResponseModelFileStr);

    // fs.readFileSync();

}


function mainTypescript() {
    fixCodeTypescript("authenticate", ["LoginBaseRequestHandler.ts"], "Authenticate");
    fixCodeTypescript("characterPlayer", ["CharacterPlayerBaseRequestHandler.ts"], "CharacterPlayer");
    fixCodeTypescript("content", [], "Content");
    fixCodeTypescript("dashboard", [], "MasterAdmin");
    fixCodeTypescript("gamePlayer", ["GamePlayerBaseRequestHandler.ts"], "GamePlayer");
    fixCodeTypescript("group", ["GroupBaseRequestHandler.ts"], "Group");
    fixCodeTypescript("inventory", ["ItemBaseRequestHandler.ts"], "Inventory");
    fixCodeTypescript("masterPlayer", ["MasterPlayerBaseRequestHandler.ts"], "MasterPlayer");
    fixCodeTypescript("storeInventory", ["StoreItemBaseRequestHandler.ts"], "StoreInventory");

    syncModelCodeTypescript("authenticate", "Authenticate");
    syncModelCodeTypescript("characterPlayer", "CharacterPlayer");
    syncModelCodeTypescript("content", "Content");
    syncModelCodeTypescript("dashboard", "MasterAdmin");
    syncModelCodeTypescript("gamePlayer", "GamePlayer");
    syncModelCodeTypescript("group", "Group");
    syncModelCodeTypescript("inventory", "Inventory");
    syncModelCodeTypescript("masterPlayer", "MasterPlayer");
    syncModelCodeTypescript("storeInventory", "StoreInventory");
}

function fixCodeTypescript(dirName, ignoreFileLst, modelName) {
    let fileDir = __dirname + "/./src/GN-app-api/handler/controller/handler/" + dirName;
    let allFilePaths = fs.readdirSync(fileDir);

    for (let i = 0; i < allFilePaths.length; i++) {
        let filePath = allFilePaths[i];

        if (!filePath.includes(".ts"))
            continue;

        if (ignoreFileLst.indexOf(filePath) != -1)
            continue;

        let allLines = fs.readFileSync(fileDir + "/" + filePath).toString().split("\n");

        for (let j = 0; j < allLines.length - 1; j++) {
            let lineJ = allLines[j];

            if (lineJ.includes("@GNHashtable")
                || lineJ.includes("@String")
                || lineJ.includes("@Number")
                || lineJ.includes("@GNArray")
                || lineJ.includes("@Boolean")
                || lineJ.includes("@DataMember")) {
                let isOptional = false;

                let lineK = lineJ;

                let lineKSpls = lineK.split("@"); // [ StringDataMember({ code: GNParameterCode.Username, minLength: 6, maxLength: 32, mustNonNull: true }) ]
                let lineK2Spls = lineKSpls[1].split("("); // [ StringDataMember, { code: GNParameterCode.Username, minLength: 6, maxLength: 32, mustNonNull: true }) ]
                let lineK3Spls = lineK2Spls[1].split("{")[1].split("}")[0].split(","); // [ code: GNParameterCode.Username, minLength: 6, maxLength: 32, mustNonNull: true ]

                for (let l = 0; l < lineK3Spls.length; l++) {
                    let lineK4Spls = lineK3Spls[l].split(":");

                    if (lineK4Spls.length <= 1) continue;

                    let key = lineK4Spls[0].trim();
                    let value = lineK4Spls[1].trim();

                    if (key == "mustInt" && value == "true")
                        hasMustInt = true;
                    else if (key == "isOptional" && value == "true")
                        isOptional = true;
                }

                j += 1;

                if (isOptional) {
                    let lineKNext = allLines[j];

                    let lineKNextUse = lineKNext.split(";")[0];
                    let lineKNextUseSpls = lineKNextUse.split(":");

                    let type = lineKNextUseSpls[1];
                    let fieldName = lineKNextUseSpls[0].split("?")[0];

                    allLines[j] = fieldName + "?:" + type + ";";
                }
            }
        }

        let str = "";
        for (let j = 0; j < allLines.length; j++) {
            str += allLines[j];

            if (j < allLines.length - 1) str += "\n";
        }

        fs.writeFileSync(fileDir + "/" + filePath, str);
    }
}

function syncModelCodeTypescript(dirName, modelName) {
    let fileDir = __dirname + "/./src/GN-app-api/handler/controller/handler/" + dirName;
    let allFilePaths = fs.readdirSync(fileDir);

    for (let i = 0; i < allFilePaths.length; i++) {
        let filePath0 = allFilePaths[i];

        if (filePath0.includes(".ts"))
            continue;

        let allFilePaths2 = fs.readdirSync(fileDir + "/" + filePath0);

        for (let m = 0; m < allFilePaths2.length; m++) {
            let filePath = allFilePaths2[m];

            let allLines = fs.readFileSync(fileDir + "/" + filePath0 + "/" + filePath).toString().split("\n");

            for (let j = 0; j < allLines.length - 1; j++) {
                let lineJ = allLines[j];

                if (lineJ.includes("@GNHashtable")
                    || lineJ.includes("@String")
                    || lineJ.includes("@Number")
                    || lineJ.includes("@GNArray")
                    || lineJ.includes("@Boolean")
                    || lineJ.includes("@DataMember")) {
                    let isOptional = false;

                    let lineK = lineJ;

                    let lineKSpls = lineK.split("@"); // [ StringDataMember({ code: GNParameterCode.Username, minLength: 6, maxLength: 32, mustNonNull: true }) ]
                    let lineK2Spls = lineKSpls[1].split("("); // [ StringDataMember, { code: GNParameterCode.Username, minLength: 6, maxLength: 32, mustNonNull: true }) ]
                    let lineK3Spls = lineK2Spls[1].split("{")[1].split("}")[0].split(","); // [ code: GNParameterCode.Username, minLength: 6, maxLength: 32, mustNonNull: true ]

                    for (let l = 0; l < lineK3Spls.length; l++) {
                        let lineK4Spls = lineK3Spls[l].split(":");

                        if (lineK4Spls.length <= 1) continue;

                        let key = lineK4Spls[0].trim();
                        let value = lineK4Spls[1].trim();

                        if (key == "mustInt" && value == "true")
                            hasMustInt = true;
                        else if (key == "isOptional" && value == "true")
                            isOptional = true;
                    }

                    j += 1;

                    if (isOptional) {
                        let lineKNext = allLines[j];

                        let lineKNextUse = lineKNext.split(";")[0];
                        let lineKNextUseSpls = lineKNextUse.split(":");

                        let type = lineKNextUseSpls[1];
                        let fieldName = lineKNextUseSpls[0].split("?")[0];

                        allLines[j] = fieldName + "?:" + type + ";";
                    }
                }
            }

            let str = "";
            for (let j = 0; j < allLines.length; j++) {
                str += allLines[j];

                if (j < allLines.length - 1) str += "\n";
            }

            fs.writeFileSync(fileDir + "/" + filePath0 + "/" + filePath, str);
        }
    }

    // console.log(clientApiStr);
    // console.log(clientModelFileStr);
    // console.log(clientRequestModelFileStr);
    // console.log(clientResponseModelFileStr);

    // fs.readFileSync();

}

