export interface IGooglePlayGameService {
    verifyToken(authCode: string): Promise<{ [k: string]: any }>;
}
