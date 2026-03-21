import axios from "axios";
import * as mongoDB from "mongodb";
import { ICountryIPDetailService, IPDetailResponse } from "./ICountryIPDetailService";
import { Debug } from "./../../GN-library/xdebug/lib/xDebug";
import { xDatetime } from "./../../GN-library/xdatetime/lib/xDatetime";

export class CountryIPDetailService implements ICountryIPDetailService {
	// Stores the get IP API URL value used by this instance.
	private getIPApiUrl: string;

	// Stores the country code region collection value used by this instance.
	private countryCodeRegionCollection: mongoDB.Collection;
	// Stores the IP address user collection value used by this instance.
	private ipAddressUserCollection: mongoDB.Collection;

	/**
	 * Executes the init workflow.
	 * @param getIPApiUrl Provides the get IP API URL value used by this operation.
	 * @param countryCodeRegionCollection Provides the country code region collection used by this operation.
	 * @param ipAddressUserCollection Provides the IP address user collection used by this operation.
	 */
	public init(getIPApiUrl: string, countryCodeRegionCollection: mongoDB.Collection, ipAddressUserCollection: mongoDB.Collection) {
		this.getIPApiUrl = getIPApiUrl;
		this.countryCodeRegionCollection = countryCodeRegionCollection;
		this.ipAddressUserCollection = ipAddressUserCollection;
	}

	/**
	 * Returns the IP address key in database.
	 * @param ipAddress Provides the IP address value used by this operation.
	 * @returns Returns the IP address key in database.
	 */
	private getIPAddressKeyInDb(ipAddress: string): string {
		return ipAddress.replace(/[.:]/g, "_");
	}

	/**
	 * Returns the IP detail response.
	 * @param ipAddress Provides the IP address value used by this operation.
	 * @returns Returns the IP detail response.
	 */
	public async getIPDetailResponse(ipAddress: string): Promise<IPDetailResponse> {
		if (!this.getIPApiUrl) return {
			statusCode: "CantQuery",
		};

		try {
			// Stores the response value used in the current execution flow.
			let response = await axios.get(this.getIPApiUrl + "/" + ipAddress, {
				timeout: 10000
			});

			// Stores the answer value used in the current execution flow.
			let answer: IPDetailResponse = response.data;

			if (answer.statusCode == "Ok") {
				// Stores the country code value used in the current execution flow.
				let countryCode = answer.detail.countryCode;
				// Stores the region code value used in the current execution flow.
				let regionCode = answer.detail.regionCode;

				if (countryCode && regionCode) {
					// Stores the update value used in the current execution flow.
					let update = {} as any;

					// Stores the IP address key value used in the current execution flow.
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

	/**
	 * Executes the update user IP workflow asynchronously.
	 * @param userId Indicates whether r ID should be used.
	 * @param ipAddress Provides the IP address value used by this operation.
	 * @param oldCountryCode Provides the old country code value used by this operation.
	 * @param oldRegionCode Provides the old region code value used by this operation.
	 * @param newCountryCode Provides the new country code value used by this operation.
	 * @param newRegionCode Provides the new region code value used by this operation.
	 */
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
			// Stores the update value used in the current execution flow.
			let update = {} as any;
			update["regions." + oldRegionCode + "." + userId] = null;

			this.countryCodeRegionCollection.updateOne({ countryCode: oldCountryCode }, {
				$unset: update
			});
		}

		if (newCountryCode && newRegionCode) {
			// Stores the update value used in the current execution flow.
			let update = {} as any;
			update["regions." + newRegionCode + "." + userId] = ipAddress;

			this.countryCodeRegionCollection.updateOne({ countryCode: newCountryCode }, {
				$set: update
			});
		}
	}
}
