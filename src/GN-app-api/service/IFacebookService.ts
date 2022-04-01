export interface IFacebookService {
    getBasicInfoByAccessToken(accessToken: string): Promise<{[k: string]: any}>;
}