interface IPDetail {
    // Stores the country code value used by this contract.
    countryCode: string; // VN
    countryName: string; // Vietnam
    regionCode: string; // SG
    regionName: string; // Ho Chi Minh
    city: string; // Ho Chi Minh City
    zipCode: string; // 700000
    latitude: number;
    // Stores the longitude value used by this contract.
    longitude: number;
}

type StatusCode = "Ok" | "IPInvalid" | "IPNotFound" | "CantQuery";

export interface IPDetailResponse {
    // Stores the detail value used by this contract.
    detail?: IPDetail;
    // Stores the status code value used by this contract.
    statusCode: StatusCode;
}

export interface ICountryIPDetailService {
    /**
     * Returns the IP detail response.
     * @param ipAddress Provides the IP address value used by this operation.
     * @returns Returns the IP detail response.
     */
    getIPDetailResponse(ipAddress: string): Promise<IPDetailResponse>;
    /**
     * Executes the update user IP workflow.
     * @param userId Indicates whether r ID should be used.
     * @param ip Provides the IP value used by this operation.
     * @param oldCountryCode Provides the old country code value used by this operation.
     * @param oldRegionCode Provides the old region code value used by this operation.
     * @param newCountryCode Provides the new country code value used by this operation.
     * @param newRegionCode Provides the new region code value used by this operation.
     */
    updateUserIP(userId: string, ip: string, oldCountryCode: string, oldRegionCode: string, newCountryCode: string, newRegionCode: string): Promise<void>;
}
