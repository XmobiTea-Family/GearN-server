export interface IGoogleService {
	verifyGoogleTokenViaAccessToken(accessToken: string): Promise<{ [k: string]: any }>;
	verifyGoogleTokenViaIdToken(idToken: string): Promise<{ [k: string]: any }>;

}
