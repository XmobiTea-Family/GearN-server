export interface IGoogleService {
    verifyGoogleTokenViaAccessToken(accessToken: string): Promise<{ [k: string]: any }>;
    verifyGoogleTokenViaIdToken(idToken: string): Promise<{ [k: string]: any }>;
    validateReceipt(payload: string): Promise<{
        success: boolean,
        productId?: string,
    }>;
}
