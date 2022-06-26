export interface IGoogleService {
	verifyGoogleToken(accessToken: string): Promise<{ [k: string]: any }>;
}
