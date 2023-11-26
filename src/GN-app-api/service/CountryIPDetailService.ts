import axios from "axios";
import * as mongoDB from "mongodb";
import { ICountryIPDetailService, IPDetailResponse } from "./ICountryIPDetailService";
import { Debug } from "../../GN-library/xdebug/lib/xDebug";
import { xDatetime } from "../../GN-library/xdatetime/lib/xDatetime";

export class CountryIPDetailService implements ICountryIPDetailService {
    private getIPApiUrl: string;

    private countryCodeRegionCollection: mongoDB.Collection;
    private ipAddressUserCollection: mongoDB.Collection;

    public init(getIPApiUrl: string, countryCodeRegionCollection: mongoDB.Collection, ipAddressUserCollection: mongoDB.Collection) {
        this.getIPApiUrl = getIPApiUrl;
        this.countryCodeRegionCollection = countryCodeRegionCollection;
        this.ipAddressUserCollection = ipAddressUserCollection;
    }

    private getIPAddressKeyInDb(ipAddress: string): string {
        return ipAddress.replace(/[.:]/g, "_");
    }

    public async getIPDetailResponse(ipAddress: string): Promise<IPDetailResponse> {
        if (!this.getIPApiUrl) return {
            statusCode: "CantQuery",
        };

        try {
            let response = await axios.get(this.getIPApiUrl + "/" + ipAddress);

            let answer: IPDetailResponse = response.data;

            if (answer.statusCode == "Ok") {
                let countryCode = answer.detail.countryCode;
                let regionCode = answer.detail.regionCode;

                if (countryCode && regionCode) {
                    let update = {} as any;

                    let ipAddressKey = this.getIPAddressKeyInDb(ipAddress);

                    update["ipAddressRegions." + regionCode + "." + ipAddressKey] = {
                        latitude: answer.detail.latitude,
                        longitude: answer.detail.longitude,
                    }

                    update["nameRegions." + regionCode] = answer.detail.regionName;

                    await this.countryCodeRegionCollection.updateOne({ countryCode: countryCode }, {
                        $set: update
                    }, {
                        upsert: true
                    });
                }
            }

            return answer;
        }
        catch (err) {
            Debug.log(err);
        }

        return {
            statusCode: "CantQuery",
        }
    }

    public async updateUserIP(userId: string, ipAddress: string, oldCountryCode: string, oldRegionCode: string, newCountryCode: string, newRegionCode: string): Promise<void> {
        this.ipAddressUserCollection.updateOne({ userId: userId }, {
            $push: {
                totalIPs: {
                    ipAddress: ipAddress,
                    tsCreate: xDatetime.getCurrentMilliseconds(),
                    countryCode: newCountryCode,
                    regionCode: newRegionCode,
                }
            } as any
        }, {
            upsert: true
        });

        if (oldCountryCode && oldRegionCode) {
            let update = {} as any;
            update["regions." + oldRegionCode + "." + userId] = null;

            this.countryCodeRegionCollection.updateOne({ countryCode: oldCountryCode }, {
                $unset: update
            });
        }

        if (newCountryCode && newRegionCode) {
            let update = {} as any;
            update["regions." + newRegionCode + "." + userId] = ipAddress;

            this.countryCodeRegionCollection.updateOne({ countryCode: newCountryCode }, {
                $set: update
            });
        }
    }
}
