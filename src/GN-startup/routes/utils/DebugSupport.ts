import { Request } from "./../../../GN-common/entity/operationRequest/base/Request";
import { CodeHelper } from "./../../../GN-common/helper/CodeHelper";

export class DebugSupport {
    public static flatAndSecurityRequest(request: Request): Record<string, unknown> {
        const answer: Record<string, unknown> = {};

        answer.operationCode = request.getOperationCode();
        answer.requestType = CodeHelper.getRequestTypeName(request.getRequestType());
        answer.role = CodeHelper.getRequestRoleName(request.getRole());
        answer.requestId = request.getRequestId();
        answer.ip = request.getIP();

        const authInfo = request.getAuthInfo();
        if (authInfo) {
            answer.authInfo = {
                userId: authInfo.getUserId(),
                gnToken: authInfo.getGNToken(),
                isRemove: authInfo.isRemove(),
                tsExpire: authInfo.getTsExpire(),
                tsLastUpdate: authInfo.getTsLastUpdate(),
                tsCreate: authInfo.getTsCreate(),
                secretKey: this.securitySecretKey(authInfo.getSecretKey()),
                otherDatas: authInfo.getOtherDatas(),
            };
        } else {
            answer.authInfo = null;
        }

        const secretInfo = request.getSecretInfo();
        if (secretInfo) {
            answer.secretInfo = {
                gameId: secretInfo.getGameId(),
                secretKey: this.securitySecretKey(authInfo.getSecretKey()),
                isRemove: secretInfo.isRemove(),
                tsExpire: secretInfo.getTsExpire(),
                // description: secretInfo.getDescription(),
                // isDefault: secretInfo.getIsDefault(),
                // onlyMasterAdmin: secretInfo.getIsOnlyMasterAdmin(),
            };
        } else {
            answer.secretInfo = null;
        }

        const parameters = request.getParameters();
        if (parameters) {
            answer.parameters = this.securityParameters(parameters);
        } else {
            answer.parameters = null;
        }

        return answer;
    }

    public static flatAndSecurityFinalData(finalData: { returnCode: number; responseId?: string; parameters?: Record<string, unknown>; invalidRequestParameters?: (string | number)[][]; debugMessage?: string }): Record<string, unknown> {
        const answer: Record<string, unknown> = {};

        answer.returnCode = CodeHelper.getReturnCodeName(finalData.returnCode);
        answer.responseId = finalData.responseId ?? null;

        const parameters = finalData.parameters;
        if (parameters) {
            answer.parameters = this.securityParameters(parameters);
        } else {
            answer.parameters = null;
        }

        const invalidRequestParameters = finalData.invalidRequestParameters;

        if (invalidRequestParameters != null) {
            // Stores the invalid str value used in the current execution flow.
            let invalidStr = "";

            invalidRequestParameters.forEach((invalidMember) => {
                invalidStr += invalidMember[0] + "(" + CodeHelper.getInvalidMemberName(invalidMember[1] as number) + "): " + invalidMember[1] + ", ";
            });

            answer.invalidRequestParameters = invalidStr;
        }

        answer.debugMessage = finalData.debugMessage;

        return answer;
    }

    public static securitySecretKey(secretKey: string): string {
        if (!secretKey) return null;

        return secretKey.slice(0, 6) + "*".repeat(secretKey.length - 12) + secretKey.slice(secretKey.length - 6);
    }

    private static securityParameters(parameters: Record<string, unknown>): Record<string, unknown> {
        const answer: Record<string, unknown> = {};

        for (const key in parameters) {
            const value = parameters[key];
            const typeOfValue = typeof value;
            if (typeOfValue === "function" || typeOfValue == "undefined" || typeOfValue === "symbol") {
                continue;
            } else if (typeOfValue === "string") {
                const normalizedKey = key.toLowerCase();

                if (normalizedKey.includes("password") || normalizedKey.includes("secret") || normalizedKey.includes("publicrsakey") || normalizedKey.includes("token") || normalizedKey.includes("privatekey") || normalizedKey.includes("p8content")) {
                    answer[key] = "**********";
                }
            } else if (typeOfValue === "object") {
                if (Array.isArray(value)) {
                    const arrayAnswer = [];

                    for (const item of value) {
                        if (typeof item === "object") {
                            if (Array.isArray(item)) {
                                arrayAnswer.push(item);
                            } else {
                                arrayAnswer.push(this.securityParameters(item));
                            }
                        } else {
                            arrayAnswer.push(item);
                        }
                    }

                    answer[key] = arrayAnswer;
                } else {
                    if (key == "permissionParam") {
                        answer[key] = "...";
                    }
                    else {
                        answer[key] = this.securityParameters(value as Record<string, unknown>);
                    }
                }
            } else {
                answer[key] = value;
            }
        }

        return answer;
    }
}
