interface IPDetail {
	countryCode: string; // VN
	countryName: string; // Vietnam
	regionCode: string; // SG
	regionName: string; // Ho Chi Minh
	city: string; // Ho Chi Minh City
	zipCode: string; // 700000
	latitude: number;
	longitude: number;
}

type StatusCode = "Ok" | "IPInvalid" | "IPNotFound" | "CantQuery";

export interface IPDetailResponse {
	detail?: IPDetail;
	statusCode: StatusCode;
}

export interface ICountryIPDetailService {
	getIPDetailResponse(ipAddress: string): Promise<IPDetailResponse>;
	updateUserIP(userId: string, ip: string, oldCountryCode: string, oldRegionCode: string, newCountryCode: string, newRegionCode: string): Promise<void>;
}
