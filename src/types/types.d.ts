import { AuthInfo } from "./../GN-common/entity/AuthInfo";
import { SecretInfo } from "./../GN-common/entity/SecretInfo";
import "child_process";

declare module "child_process" {
    interface ChildProcess {
        nextRefreshAuthToken: number;
        cloudScriptUserId: string;
    }
}

declare global {
    namespace Express {
        interface Request {
            isAuthenticated: boolean;
            authInfo: AuthInfo;
            secretInfo: SecretInfo;
            xip: string;
            fileName: string;
        }
    }
}
