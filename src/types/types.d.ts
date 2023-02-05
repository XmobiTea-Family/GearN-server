import { AuthInfo } from "../GN-common/entity/AuthInfo";
import { SecretInfo } from "../GN-common/entity/SecretInfo";

declare global {
    namespace Express {
        interface Request {
            isAuthenticated: boolean,
            authInfo: AuthInfo,
            secretInfo: SecretInfo,
            xip: string,
        }
    }
}
