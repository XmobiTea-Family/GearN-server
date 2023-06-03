#!/bin/bash
VERSION=1.0.9

COMMAND=$1
DIR="$(pwd)"

shopt -s extglob                 # enable +(...) glob syntax
PROJECT_NAME=${DIR%%+(/)}        # trim however many trailing slashes exist
PROJECT_NAME=${PROJECT_NAME##*/} # remove everything before the last / that still remains
PROJECT_NAME=${PROJECT_NAME:-/}  # correct for dirname=/ case

PATH_NAME_SPLIT=$(echo "$PROJECT_NAME" | tr " " "\n")
PROJECT_NAME=""
for path in $PATH_NAME_SPLIT; do
    if [ -z "$PROJECT_NAME" ]; then
        PROJECT_NAME=$path
    else
        PROJECT_NAME="$PROJECT_NAME"'_'"$path"
    fi
done

main() {
    if [ "$COMMAND" = 'init' ] || [ "$COMMAND" = '-i' ]; then
        init
    elif [ "$COMMAND" = 'createRequestHandler' ] || [ "$COMMAND" = '-c' ]; then
        createRequestHandler $2
    elif [ "$COMMAND" = 'version' ] || [ "$COMMAND" = '-v' ]; then
        version
    fi

    return
}

init() {
    if [ -f "$DIR"'/package.json' ]; then
        echo 'GN Server is already init on '"$DIR"
        echo 'Init failure'
        read -p 'Press enter to exit...'
        exit 1
    fi

    echo 'GN Server initing... on path '"$DIR"' with project name is '"$PROJECT_NAME"

    init_create_gitignore
    init_create_projectIndexJs
    init_create_GNConfigDebugJson
    init_create_indexTs
    init_create_postIndexTs
    init_create_srcAppApiHandlerDir
    init_create_srcCommonConstantDir
    init_create_releasePM2Sh
    init_create_packageJson
    init_create_tsconfigJson
    init_run_npmUpdate

    echo 'create '"$PROJECT_NAME"' project successs.'
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
GNconfig.release.json' > .gitignore

    echo 'create .gitignore file success'

    return
}

init_create_projectIndexJs() {
    echo 'process.env.ENVIROMENT = "debug";
require("./index");' > "$PROJECT_NAME"'.index.js'
    echo 'create '"$PROJECT_NAME"'.index.js file success'

    return
}

init_create_GNConfigDebugJson() {
    echo '{
    "name": "debug",
    "options": {
        "applicationSettings": {
			"port": 2202,
			"useSsl": false,
			"keyFilePath": "",
			"certFilePath": "",
			"licenseKeyFilePath": "",
			"expiredTokenInMs": 172800000
		},

		"httpAppSettings": {
			"enable": true,
			"allowOrigin": "*",
			"credentials": true,
			"allowMethods": ["GET", "POST"],
			"allowHeaders": ["a", "content-type"],
			"enableSendAndReceiveDebug": true,
			"enablePostViaMsgPack": true,
			"enablePostViaJson": true
		},

		"socketAppSettings": {
			"enable": true,
			"allowOrigin": "*",
			"credentials": true,
			"allowMethods": ["GET"],
			"allowHeaders": [],
			"enableSendAndReceiveDebug": true,
			"enablePostViaMsgPack": true,
			"enablePostViaJson": true,
			"pingInterval": 50000,
			"pingTimeout": 5000
		},

		"uploadFileSettings": {
			"enable": true,
			"uploadPath": "./file-upload",
			"maxSizeUpload": 52428800,
			"mimeTypeAccepts": ["image/png"]
		},

		"databaseSettings": {
			"connectionString": "mongodb://127.0.0.1:27017/",
			"databaseName": "XmobiTea",
			"databaseGameName": "GN",
			"options": {
			}
		},

		"otherSettings": {
			"packageName": "com.xmobitea.GNServer",
			"appleClientId": "com.xmobitea.GNServer",
			"googleClientId": "gn-server",
			"headerIP": "x-ip"
		},
		
		"mailSettings": {
			"enable": false,
			"sendFrom": "changx@xmobitea.com",
			"sendGridApiKey": "SG."
		},

		"adminViewSettings": {
			"enable": true,
			"debugHashs": ["hashhere"]
		},

		"logSettings": {
			"logToConsoleEnable": true,
			"logToFileEnable": true,
			"logPath": "./log/debug/Server.log"
		},

		"ddosSettings": {
			"socketMaxRequestPerSecondPerIp": 50,
			"socketMaxRequestPerSecondPerPeer": 20,
			"socketMaxPendingRequest": 1000,
			"socketMaxRequestSize": 1024,
			"httpMaxRequestPerSecondPerIp": 50,
			"httpMaxRequestPerSecondPerPeer": 20,
			"httpMaxPendingRequest": 1000,
			"httpMaxRequestSize": 1024,
			"maxUploadPendingRequest": 200,
			"maxDownloadPendingRequest": 200
		}
    }
}' > GNconfig.debug.json
    echo 'create GNconfig.debug.json file success'

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
});' > index.ts
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

        //database.createIndex("Runtime.ExampleCollection", {
        //    FieldNeedIndex: 1,
        //});
    }
}' > PostIndex.ts
    echo 'create PostIndex.ts file success'

    return
}

init_create_srcAppApiHandlerDir() {
    DIR_HANDLER="$DIR"'/src/app-api/handler'
    mkdir -p "$DIR_HANDLER"
    echo 'create dir '"$DIR_HANDLER"

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

    public override getCommonOperationRequest() {
        return TestOperationRequest;
    }

    public async handle(
        authInfo: AuthInfo,
        operationRequest: OperationRequest
    ): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

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
}' > TestRequestHandler.ts
    echo 'create TestRequestHandler.ts file success'

    return
}

init_create_srcCommonConstantDir() {
    DIR_CONTANST="$DIR"'/src/common/constant'
    mkdir -p "$DIR_CONTANST"
    echo 'create dir '"$DIR_CONTANST"

    DIR_ENUM_TYPE="$DIR"'/src/common/constant/enumType'
    mkdir -p "$DIR_ENUM_TYPE"
    echo 'create dir '"$DIR_ENUM_TYPE"

    DIR_PARAMETER_CODE="$DIR"'/src/common/constant/parameterCode'
    mkdir -p "$DIR_PARAMETER_CODE"
    echo 'create dir '"$DIR_PARAMETER_CODE"

    DIR_ERROR_CODE="$DIR"'/src/common/constant/errorCode'
    mkdir -p "$DIR_ERROR_CODE"
    echo 'create dir '"$DIR_ERROR_CODE"

    cd "$DIR_CONTANST"
    echo 'import { EventCode } from "@xmobitea/gn-server";

export class EventCodeExtensions extends EventCode {
    
}' > EventCode.ext.ts
    echo 'create EventCode.ext.ts file success'

    echo 'import { OperationCode } from "@xmobitea/gn-server";

export class OperationCodeExtensions extends OperationCode {
    public static readonly Test: number = 50;
}' > OperationCode.ext.ts
    echo 'create OperationCode.ext.ts success'

    cd "$DIR_ENUM_TYPE"
    echo 'export enum TestEnum {
    Value0 = 0,
    Value1 = 1,
}' > TestEnum.ts
    echo 'create TestEnum.ts file success'

    cd "$DIR_ERROR_CODE"
    echo 'export class TestErrorCode {
    public static readonly Ok: number = 1;
}' > TestErrorCode.ts
    echo 'create TestErrorCode.ts file success'

    cd "$DIR_PARAMETER_CODE"
    echo 'export class TestParameterCode {
    public static readonly String: string = "1";
    public static readonly Number: string = "2";
    public static readonly Boolean: string = "3";
    public static readonly GNHashtable: string = "4";
    public static readonly GNArray: string = "5";
}' > TestParameterCode.ts
    echo 'create TestParameterCode.ts file success'

    return
}

init_create_releasePM2Sh() {
    cd "$DIR"

    echo 'export PM2_ID_THIS_APP=$(pm2 id '$PROJECT_NAME'.index)

    if [ "$PM2_ID_THIS_APP" == "[]" ]; then
    	pm2 start '$PROJECT_NAME'.index.js
    else
    	pm2 restart '$PROJECT_NAME'.index
    fi

    echo "Run release success"' > releasePM2.sh

    echo 'create releasePM2.sh file success'

    return
}

init_create_packageJson() {
    echo '{
    "name": "'$PROJECT_NAME'",
    "version": "1.0.0",
    "description": "Description for '$PROJECT_NAME', you can edit description in package.json file.",
    "main": "'$PROJECT_NAME'.index.js",
    "scripts": {
        "debug": "npm run build && node '$PROJECT_NAME'.index",
        "build": "tsc",
        "releasePM2": "npm run build && ./releasePM2.sh"
    },
    "author": "GN-Server-author",
    "license": "ISC",
    "devDependencies": {
        "typescript": "*"
    },
    "dependencies": {
        "@xmobitea/gn-server": "*",
        "fs": "*"
    }
}' > package.json
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
}' > tsconfig.json
    echo 'create tsconfig.json file success'

    return
}

init_run_npmUpdate() {
    echo 'npm update --save'
    npm update --save

    return
}

createRequestHandler() {
    if [ -f "$DIR"'/package.json' ]; then
        echo 'creating request handler'
    else
        echo 'This is not GN server dir, please try cmd: gn.sh -i or gn.sh init'
        echo 'Create requesthandler failure'
        read -p 'Press enter to exit...'
        exit 1
    fi

    REQUEST_NAME=$1

    while [ -z "$REQUEST_NAME" ]; do
        echo 'enter request handler name: (request handler name must is string and does not contains space character, [0-9][A-Z][a-z] or _)'

        read REQUEST_NAME
    done

    # if [ -z $REQUEST_NAME ]; then
    #     echo 'request name must has a string.'
    #     echo 'create new request failed.'
    #     read -p "Press enter to exit..."
    #     exit 1
    # fi

    DIR_REQUEST_HANDLER="$DIR"'/src/app-api/handler'
    DIR_ERROR_CODE="$DIR"'/src/common/constant/errorCode'
    DIR_PARAMETER_CODE="$DIR"'/src/common/constant/parameterCode'
    FULL_REQUEST_NAME="$REQUEST_NAME"'RequestHandler.ts'
    DIR_HANDLER_THIS_REQUEST_HANDLER_PATH="$DIR_REQUEST_HANDLER"'/'"$FULL_REQUEST_NAME"

    FULL_REQUEST_ERROR_CODE_NAME="$REQUEST_NAME"'ErrorCode.ts'
    DIR_HANDLER_THIS_REQUEST_ERROR_CODE_PATH="$DIR_ERROR_CODE"'/'"$FULL_REQUEST_ERROR_CODE_NAME"

    FULL_REQUEST_PARAMETER_CODE_NAME="$REQUEST_NAME"'ParameterCode.ts'
    DIR_HANDLER_THIS_REQUEST_PARAMETER_CODE_PATH="$DIR_PARAMETER_CODE"'/'"$FULL_REQUEST_PARAMETER_CODE_NAME"

    DIR_OPERATION_CODE_EXT_PATH="$DIR"'/src/common/constant/OperationCode.ext.ts'

    echo "$DIR_OPERATION_CODE_EXT_PATH"

    if [ -f "$DIR_HANDLER_THIS_REQUEST_HANDLER_PATH" ]; then
        echo 'the file '"$FULL_REQUEST_NAME"' had exists, please try another.'
        read -p "Press enter to exit..."
        exit 1
    fi

    OPERATION_CMD_COUNT=$(wc -l "$DIR_OPERATION_CODE_EXT_PATH")

    arrOPERATION_CMD_COUNT=(${OPERATION_CMD_COUNT// / })
    OPERATION_COUNT=${arrOPERATION_CMD_COUNT[0]}

    CONTENT_OPERATION=""
    MAX_VALUE=50

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
    done < "$DIR_OPERATION_CODE_EXT_PATH"

    echo -e $CONTENT_OPERATION > "$DIR_OPERATION_CODE_EXT_PATH"

    echo 'export class '$REQUEST_NAME'ErrorCode {
    public static readonly Ok: number = 1;
}' > "$DIR_HANDLER_THIS_REQUEST_ERROR_CODE_PATH"

    echo 'export class '$REQUEST_NAME'ParameterCode {
    public static readonly Var1: string = "1";
}' > "$DIR_HANDLER_THIS_REQUEST_PARAMETER_CODE_PATH"

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

    public override getCommonOperationRequest() {
        return '$REQUEST_NAME'OperationRequest;
    }

    public async handle(
        authInfo: AuthInfo,
        operationRequest: OperationRequest
    ): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

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
}' > "$DIR_HANDLER_THIS_REQUEST_HANDLER_PATH"

    echo "create "$REQUEST_NAME" request handler success!"
    read -p "Press enter to exit..."

    return
}

version() {
    echo 'GN Bash version '"$VERSION"

    return
}

main "$@"
exit
