export interface IFacebookService {
	getBasicInfoByAccessToken(accessToken: string): Promise<{ [k: string]: any }>;
	validateReceipt(payload: string): Promise<{
		success: boolean,
		productId?: string,
	}>;
}
