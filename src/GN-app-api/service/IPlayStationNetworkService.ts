export interface IPlayStationNetworkService {
	verifyPSNToken(token: string): Promise<{ [k: string]: any }>;
}
