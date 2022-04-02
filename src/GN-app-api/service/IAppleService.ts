export interface IAppleService {
	verifyAppleToken(token: string): Promise<{ [k: string]: any }>;
}
