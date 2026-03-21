import { xDatetime } from "./../../GN-library/xdatetime/lib/xDatetime";
import { GNServer } from "./../../GNServer";
import { BigAnalyticsItem, IAnalyticsService } from "./IAnalyticsService";
import si from "systeminformation";
import * as mongoDB from "mongodb";

export class AnalyticsService implements IAnalyticsService {
	// Stores the GearN server value used by this instance.
	private gnServer: GNServer;

	// Stores the current CCU value used by this instance.
	private currentCCU: number;

	// Stores the current DAU value used by this instance.
	private currentDAU: number;
	// Stores the current DAU since 0 h value used by this instance.
	private currentDAUSince0h: number;
	// Stores the current DNU value used by this instance.
	private currentDNU: number;
	// Stores the current DNU since 0 h value used by this instance.
	private currentDNUSince0h: number;
	// Stores the current DRT value used by this instance.
	private currentDRT: number;
	// Stores the current DRT since 0 h value used by this instance.
	private currentDRTSince0h: number;

	// Stores the current MAU value used by this instance.
	private currentMAU: number;
	// Stores the current MAU since 0 h 1 value used by this instance.
	private currentMAUSince0h1: number;
	// Stores the current MNU value used by this instance.
	private currentMNU: number;
	// Stores the current MNU since 0 h 1 value used by this instance.
	private currentMNUSince0h1: number;
	// Stores the current MRT value used by this instance.
	private currentMRT: number;
	// Stores the current MRT since 0 h 1 value used by this instance.
	private currentMRTSince0h1: number;
	// Stores the current analytics price value used by this instance.
	private currentAnalyticsPrice: number;

	// Stores the current country list used by this instance.
	private currentCountry: {
		// Stores the country code value used by this contract.
		countryCode: string,
		// Stores the regions list used by this contract.
		regions: {
			// Stores the region code value used by this contract.
			regionCode: string,
			// Stores the region name value used by this contract.
			regionName: string,
			// Stores the ccu value used by this contract.
			ccu: number,
			// Stores the latidute value used by this contract.
			latidute: number,
			// Stores the longitude value used by this contract.
			longitude: number,
		}[]
	}[];

	// Stores the current operation system value used by this instance.
	private currentOperationSystem: {
		// Stores the cpu usage value used by this contract.
		cpuUsage: number;
		// Stores the memory usage value used by this contract.
		memoryUsage: {
			// Stores the total memory in bytes value used by this contract.
			totalMemoryInBytes: number;
			// Stores the free memory in bytes value used by this contract.
			freeMemoryInBytes: number;
		}
		// Stores the storage usage list used by this contract.
		storageUsage: {
			// Stores the name value used by this contract.
			name: string;
			// Stores the fs total size in bytes value used by this contract.
			fsTotalSizeInBytes: number;
			// Stores the fs used size in bytes value used by this contract.
			fsUsedSizeInBytes: number;
		}[];
	};

	// Stores the current database system value used by this instance.
	private currentDatabaseSystem: {
		// Stores the fs total size in bytes value used by this contract.
		fsTotalSizeInBytes: number;
		// Stores the fs used size in bytes value used by this contract.
		fsUsedSizeInBytes: number;
		// Stores the total size in bytes value used by this contract.
		totalSizeInBytes: number;
		// Stores the collections value used by this contract.
		collections: number;
		// Stores the objects value used by this contract.
		objects: number;
		// Stores the indexes value used by this contract.
		indexes: number;
	};

	// Stores the current log database system value used by this instance.
	private currentLogDatabaseSystem: {
		// Stores the fs total size in bytes value used by this contract.
		fsTotalSizeInBytes: number;
		// Stores the fs used size in bytes value used by this contract.
		fsUsedSizeInBytes: number;
		// Stores the total size in bytes value used by this contract.
		totalSizeInBytes: number;
		// Stores the collections value used by this contract.
		collections: number;
		// Stores the objects value used by this contract.
		objects: number;
		// Stores the indexes value used by this contract.
		indexes: number;
	};

	// Stores the current request complete list used by this instance.
	private currentRequestComplete: {
		// Stores the event name value used by this contract.
		eventName: string;
		// Stores the results list used by this contract.
		results: {
			// Stores the error code value used by this contract.
			errorCode: number;
			// Stores the count value used by this contract.
			count: number;
		}[]
	}[];

	// Stores the current cost value used by this instance.
	private currentCost: {
		// Stores the request count value used by this contract.
		requestCount: number;
		// Stores the matchmaking request count value used by this contract.
		matchmakingRequestCount: number;
		// Stores the cloud script g bs value used by this contract.
		cloudScriptGBs: number;
		// Stores the storage size in bytes value used by this contract.
		storageSizeInBytes: number;
		// Stores the data transfer size in bytes value used by this contract.
		dataTransferSizeInBytes: number;
	}

	// Stores the current monthly cost value used by this instance.
	private currentMonthlyCost: {
		// Stores the request count value used by this contract.
		requestCount: number;
		// Stores the matchmaking request count value used by this contract.
		matchmakingRequestCount: number;
		// Stores the cloud script g bs value used by this contract.
		cloudScriptGBs: number;
		// Stores the storage size in bytes value used by this contract.
		storageSizeInBytes: number;
		// Stores the data transfer size in bytes value used by this contract.
		dataTransferSizeInBytes: number;
	}

	/**
	 * Sets the GearN server.
	 * @param gnServer Provides the GearN server value used by this operation.
	 */
	public setGNServer(gnServer: GNServer): void {
		this.gnServer = gnServer;
	}

	/**
	 * Returns the big analytics item.
	 * @param tsDate Provides the timestamp date value used by this operation.
	 * @returns Returns the big analytics item.
	 */
	public async getBigAnalyticsItem(tsDate?: number): Promise<BigAnalyticsItem> {
		// Stores the answer value used in the current execution flow.
		let answer: BigAnalyticsItem;

		if (!tsDate) {
			answer = {
				CCU: this.currentCCU,

				DAU: this.currentDAU,
				DAUSince0h: this.currentDAUSince0h,
				DNU: this.currentDNU,
				DNUSince0h: this.currentDNUSince0h,
				DRT: this.currentDRT,
				DRTSince0h: this.currentDRTSince0h,

				MAU: this.currentMAU,
				MAUSince0h1: this.currentMAUSince0h1,
				MNU: this.currentMNU,
				MNUSince0h1: this.currentMNUSince0h1,
				MRT: this.currentMRT,
				MRTSince0h1: this.currentMRTSince0h1,

				analyticsPrice: this.currentAnalyticsPrice,
				country: this.currentCountry,

				operationSystem: this.currentOperationSystem,
				requestComplete: this.currentRequestComplete,
				databaseSystem: this.currentDatabaseSystem,
				logDatabaseSystem: this.currentLogDatabaseSystem,

				cost: this.currentCost,
				monthlyCost: this.currentMonthlyCost,
			};
		}
		else {
			// Stores the analytics collection value used in the current execution flow.
			let analyticsCollection = this.gnServer.getDatabase().systemCollection("Analytics");

			// Stores the result value used in the current execution flow.
			let result = await analyticsCollection.findOne({ tsCreate: tsDate });

			if (result == null) {
				answer = {
					CCU: 0,

					DAU: 0,
					DAUSince0h: 0,
					DNU: 0,
					DNUSince0h: 0,
					DRT: 0,
					DRTSince0h: 0,

					MAU: 0,
					MAUSince0h1: 0,
					MNU: 0,
					MNUSince0h1: 0,
					MRT: 0,
					MRTSince0h1: 0,

					analyticsPrice: 0,
					country: null,
					operationSystem: null,
					requestComplete: null,
					databaseSystem: null,
					logDatabaseSystem: null,

					cost: null,
					monthlyCost: null,
				};
			}
			else {
				answer = {
					CCU: result["ccu"],

					DAU: result["dau"],
					DAUSince0h: result["dauSince0h"],
					DNU: result["dnu"],
					DNUSince0h: result["dnuSince0h"],
					DRT: result["drt"],
					DRTSince0h: result["drtSince0h"],

					MAU: result["mau"],
					MAUSince0h1: result["mauSince0h1"],
					MNU: result["mnu"],
					MNUSince0h1: result["mnuSince0h1"],
					MRT: result["mrt"],
					MRTSince0h1: result["mrtSince0h1"],

					analyticsPrice: result["analyticsPrice"],
					country: result["country"],
					operationSystem: result["operationSystem"],
					requestComplete: result["requestComplete"],
					databaseSystem: result["databaseSystem"],
					logDatabaseSystem: result["logDatabaseSystem"],

					cost: result["cost"],
					monthlyCost: result["monthlyCost"],
				};
			}
		}

		return answer;
	}

	/**
	 * Runs the current workflow.
	 */
	public run(): void {
		this.getAnalytics();

		// Stores the thiz value used in the current execution flow.
		let thiz = this;
		this.gnServer.getTimerService().subscriberEveryMinute(() => {
			// Stores the current date value used in the current execution flow.
			let currentDate = xDatetime.getCurrentDate();
			if (currentDate.getMinutes() % 15 == 0)
				thiz.analytics();
			else if (currentDate.getMinutes() % 5 == 0) {
				thiz.getAnalytics();
			}
		});
	}

	/**
	 * Executes the analytics workflow asynchronously.
	 */
	private async analytics(): Promise<void> {
		await this.getAnalytics();

		if (this.gnServer.isPrimary()) {
			await this.saveAnalytics();
		}
	}

	/**
	 * Returns the analytics.
	 */
	private async getAnalytics(): Promise<void> {
		// Stores the current milliseconds value used in the current execution flow.
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();
		// Stores the milliseconds since 0 h value used in the current execution flow.
		let millisecondsSince0h = xDatetime.getToday0hMilliseconds();
		// Stores the player collection value used in the current execution flow.
		let playerCollection = this.gnServer.getDatabase().systemCollection("MasterPlayer");

		// Stores the milliseconds at 15 minutes ago value used in the current execution flow.
		let millisecondsAt15MinutesAgo = currentMilliseconds - 15 * xDatetime.ONE_MINUTE_MILLISECOND;

		// CCU
		{
			this.currentCCU = await playerCollection.countDocuments({
				tsLastLogin: {
					$gt: millisecondsAt15MinutesAgo
				}
			});
		}

		{
			this.currentAnalyticsPrice = await this.gnServer.getDatabase().systemCollection("StoreAnalytics").countDocuments({
				tsCreate: {
					$gt: millisecondsAt15MinutesAgo
				}
			});
		}

		// DAU
		{
			// Stores the milliseconds at 1 day ago value used in the current execution flow.
			let millisecondsAt1DayAgo = currentMilliseconds - xDatetime.ONE_DAY_MILLISECOND;
			this.currentDAU = await playerCollection.countDocuments({
				tsLastLogin: {
					$gt: millisecondsAt1DayAgo
				}
			});
		}

		// DAUSince0h
		{
			this.currentDAUSince0h = await playerCollection.countDocuments({
				tsLastLogin: {
					$gt: millisecondsSince0h
				}
			});
		}

		// DNU
		{
			// Stores the milliseconds at 1 day ago value used in the current execution flow.
			let millisecondsAt1DayAgo = currentMilliseconds - xDatetime.ONE_DAY_MILLISECOND;
			this.currentDNU = await playerCollection.countDocuments({
				tsCreate: {
					$gt: millisecondsAt1DayAgo
				}
			});
		}

		// DNUSince0h
		{
			this.currentDNUSince0h = await playerCollection.countDocuments({
				tsCreate: {
					$gt: millisecondsSince0h
				}
			});
		}

		// MAU
		{
			// Stores the milliseconds at 1 month ago value used in the current execution flow.
			let millisecondsAt1MonthAgo = currentMilliseconds - xDatetime.ONE_MONTH_MILLISECOND;

			this.currentMAU = await playerCollection.countDocuments({
				tsLastLogin: {
					$gt: millisecondsAt1MonthAgo
				}
			});
		}

		// MAUSince0h1
		{
			// Stores the current date value used in the current execution flow.
			let currentDate = xDatetime.getCurrentDate();
			currentDate.setHours(0);
			currentDate.setMinutes(0);
			currentDate.setSeconds(0);
			currentDate.setMilliseconds(0);

			currentDate.setDate(1);

			// Stores the milliseconds since 0 h 1 value used in the current execution flow.
			let millisecondsSince0h1 = currentDate.getTime();

			this.currentMAUSince0h1 = await playerCollection.countDocuments({
				tsLastLogin: {
					$gt: millisecondsSince0h1
				}
			});
		}

		// MNU
		{
			// Stores the milliseconds at 1 day ago value used in the current execution flow.
			let millisecondsAt1DayAgo = currentMilliseconds - xDatetime.ONE_MONTH_MILLISECOND;

			this.currentMNU = await playerCollection.countDocuments({
				tsCreate: {
					$gt: millisecondsAt1DayAgo
				}
			});
		}

		// MNUSince0h1
		{
			// Stores the current date value used in the current execution flow.
			let currentDate = xDatetime.getCurrentDate();
			currentDate.setHours(0);
			currentDate.setMinutes(0);
			currentDate.setSeconds(0);
			currentDate.setMilliseconds(0);

			currentDate.setDate(1);

			// Stores the milliseconds since 0 h 1 value used in the current execution flow.
			let millisecondsSince0h1 = currentDate.getTime();

			this.currentMNUSince0h1 = await playerCollection.countDocuments({
				tsCreate: {
					$gt: millisecondsSince0h1
				}
			});
		}

		this.currentDRT = this.currentDAU - this.currentDNU;
		this.currentDRTSince0h = this.currentDAUSince0h - this.currentDNUSince0h;

		this.currentMRT = this.currentMAU - this.currentMNU;
		this.currentMRTSince0h1 = this.currentMAUSince0h1 - this.currentMNUSince0h1;

		{
			// Stores the GearN countrys value used in the current execution flow.
			let gnCountrys: {
				// Stores the country code value used by this contract.
				countryCode: string,
				// Stores the regions list used by this contract.
				regions: {
					// Stores the region code value used by this contract.
					regionCode: string,
					// Stores the region name value used by this contract.
					regionName: string,
					// Stores the ccu value used by this contract.
					ccu: number,
					// Stores the latidute value used by this contract.
					latidute: number,
					// Stores the longitude value used by this contract.
					longitude: number,
				}[]
			}[] = [];

			// Stores the country region collection value used in the current execution flow.
			let countryRegionCollection = this.gnServer.getDatabase().systemCollection("CountryRegion");

			// Stores the results value used in the current execution flow.
			let results = await countryRegionCollection.find({});

			while (await results.hasNext()) {
				// Stores the result value used in the current execution flow.
				let result = await results.next();

				// Stores the regions value used in the current execution flow.
				let regions = result["regions"];
				// Stores the name regions value used in the current execution flow.
				let nameRegions = result["nameRegions"];
				// Stores the IP address regions value used in the current execution flow.
				let ipAddressRegions = result["ipAddressRegions"];

				if (!regions || !nameRegions || !ipAddressRegions) continue;

				// Stores the GearN country value used in the current execution flow.
				let gnCountry: {
					// Stores the country code value used by this contract.
					countryCode: string,
					// Stores the regions list used by this contract.
					regions: {
						// Stores the region code value used by this contract.
						regionCode: string,
						// Stores the region name value used by this contract.
						regionName: string,
						// Stores the ccu value used by this contract.
						ccu: number,
						// Stores the latidute value used by this contract.
						latidute: number,
						// Stores the longitude value used by this contract.
						longitude: number,
					}[]
				} = {
					countryCode: result["countryCode"],
					regions: [],
				};

				// Stores the region keys value used in the current execution flow.
				let regionKeys = Object.keys(regions);

				for (let i = 0; i < regionKeys.length; i++) {
					// Stores the key value used in the current execution flow.
					let key = regionKeys[i];
					// Stores the IP address region value used in the current execution flow.
					let ipAddressRegion = ipAddressRegions[key];
					if (!ipAddressRegion) continue;

					// Stores the region value used in the current execution flow.
					let region = regions[key];
					if (!region) continue;

					// Stores the GearN region value used in the current execution flow.
					let gnRegion: {
						// Stores the region code value used by this contract.
						regionCode: string,
						// Stores the region name value used by this contract.
						regionName: string,
						// Stores the ccu value used by this contract.
						ccu: number,
						// Stores the latidute value used by this contract.
						latidute: number,
						// Stores the longitude value used by this contract.
						longitude: number,
					} = {
						regionCode: key,
						regionName: nameRegions[key],
						ccu: Object.keys(region).length,
						latidute: 0,
						longitude: 0,
					};

					// Stores the IP address region IP keys value used in the current execution flow.
					let ipAddressRegionIPKeys = Object.keys(ipAddressRegion);
					// Stores the IP address region IP key value used in the current execution flow.
					let ipAddressRegionIPKey = ipAddressRegionIPKeys[0];
					if (ipAddressRegionIPKey) {
						// Stores the IP address region IP value used in the current execution flow.
						let ipAddressRegionIP = ipAddressRegion[ipAddressRegionIPKey];

						gnRegion.latidute = ipAddressRegionIP["latitude"];
						gnRegion.longitude = ipAddressRegionIP["longitude"];
					}

					gnCountry.regions.push(gnRegion);
				}

				gnCountrys.push(gnCountry);
			}

			this.currentCountry = gnCountrys;
		}

		{
			// Stores the cpu value used in the current execution flow.
			const cpu = await si.currentLoad();
			// Stores the memory value used in the current execution flow.
			const memory = await si.mem();
			// Stores the fs size value used in the current execution flow.
			const fsSize = await si.fsSize();

			// Stores the storage usage value used in the current execution flow.
			let storageUsage: {
				// Stores the name value used by this contract.
				name: string;
				// Stores the fs total size in bytes value used by this contract.
				fsTotalSizeInBytes: number;
				// Stores the fs used size in bytes value used by this contract.
				fsUsedSizeInBytes: number;
			}[] = [];

			for (let i = 0; i < fsSize.length; i++) {
				// Stores the storage value used in the current execution flow.
				let storage = fsSize[i];

				storageUsage.push({
					name: storage.fs,
					fsTotalSizeInBytes: storage.size,
					fsUsedSizeInBytes: storage.used
				});
			}

			this.currentOperationSystem = {
				cpuUsage: cpu.currentLoad,
				memoryUsage: {
					freeMemoryInBytes: memory.available,
					totalMemoryInBytes: memory.total,
				},
				storageUsage: storageUsage
			}
		}

		// {
		//     let eventCallbackPostCollection = this.gnServer.getDatabase().logRuntimeCollection("EventCallback.PostLog");

		//     let results = await eventCallbackPostCollection.aggregate([
		//         {
		//             $match: {
		//                 _id: { $gt: mongoDB.ObjectId.createFromTime(millisecondsAt15MinutesAgo / 1000 - 1) }
		//             }
		//         },
		//         {
		//             $group: {
		//                 _id: { eventName: "$eventName", errorCode: "$operationResponse.parameters.errorCode" },
		//                 count: { $sum: 1 } // Đếm số lần xuất hiện
		//             }
		//         },
		//         {
		//             $group: {
		//                 _id: "$_id.eventName",
		//                 results: {
		//                     $push: {
		//                         errorCode: "$_id.errorCode",
		//                         count: "$count"
		//                     }
		//                 }
		//             }
		//         }
		//     ]);

		//     this.currentRequestComplete = [];

		//     while (await results.hasNext()) {
		//         let result = await results.next();

		//         this.currentRequestComplete.push({
		//             eventName: result["_id"],
		//             results: result.results,
		//         });
		//     }
		// }

		{
			// Stores the stats value used in the current execution flow.
			let stats = await this.gnServer.getDatabase().getDb().stats();

			if (stats.ok == 1) {
				this.currentDatabaseSystem = {
					collections: stats.collections,
					fsTotalSizeInBytes: stats.fsTotalSize,
					fsUsedSizeInBytes: stats.fsUsedSize,
					indexes: stats.indexes,
					objects: stats.objects,
					totalSizeInBytes: stats.totalSize,
				}
			}
		}

		{
			// Stores the stats value used in the current execution flow.
			let stats = await this.gnServer.getDatabase().getLogDb().stats();

			if (stats.ok == 1) {
				this.currentLogDatabaseSystem = {
					collections: stats.collections,
					fsTotalSizeInBytes: stats.fsTotalSize,
					fsUsedSizeInBytes: stats.fsUsedSize,
					indexes: stats.indexes,
					objects: stats.objects,
					totalSizeInBytes: stats.totalSize,
				}
			}
		}

		{
			// Stores the event callback post collection value used in the current execution flow.
			let eventCallbackPostCollection = this.gnServer.getDatabase().logRuntimeCollection("EventCallback.PostLog");

			// Stores the now value used in the current execution flow.
			let now = xDatetime.getCurrentDate();
			// Stores the month 0 h value used in the current execution flow.
			let month0h = new Date(now.getFullYear(), now.getMonth(), 1);

			// Stores the results value used in the current execution flow.
			let results = await eventCallbackPostCollection.find({ _id: { $gt: mongoDB.ObjectId.createFromTime(month0h.getTime() / 1000 - 1) } })

			this.currentCost = {
				requestCount: 0,
				matchmakingRequestCount: 0,
				cloudScriptGBs: 0,
				storageSizeInBytes: this.currentDatabaseSystem?.totalSizeInBytes ?? 0,
				dataTransferSizeInBytes: 0,
			}

			this.currentMonthlyCost = {
				requestCount: 0,
				matchmakingRequestCount: 0,
				cloudScriptGBs: 0,
				storageSizeInBytes: this.currentDatabaseSystem?.totalSizeInBytes ?? 0,
				dataTransferSizeInBytes: 0,
			}

			this.currentRequestComplete = [];

			while (await results.hasNext()) {
				// Stores the result value used in the current execution flow.
				let result = await results.next();

				// Stores the timestamp create value used in the current execution flow.
				let tsCreate = result["tsCreate"];
				// Stores the event name value used in the current execution flow.
				let eventName = result["eventName"];
				// Stores the operation response value used in the current execution flow.
				let operationResponse = result["operationResponse"];

				if (tsCreate > millisecondsAt15MinutesAgo) {
					// Stores the this current request complete value used in the current execution flow.
					let thisCurrentRequestComplete = this.currentRequestComplete.find(x => x.eventName == eventName);
					if (thisCurrentRequestComplete == null) {
						thisCurrentRequestComplete = {
							eventName: eventName,
							results: [],
						};

						this.currentRequestComplete.push(thisCurrentRequestComplete);
					}

					// Stores the error code value used in the current execution flow.
					let errorCode = operationResponse?.parameters?.errorCode;
					if (errorCode) {
						// Stores the this current request complete error code value used in the current execution flow.
						let thisCurrentRequestCompleteErrorCode = thisCurrentRequestComplete.results.find(x => x.errorCode == errorCode);
						if (thisCurrentRequestCompleteErrorCode == null) {
							thisCurrentRequestCompleteErrorCode = {
								errorCode: errorCode,
								count: 0,
							};

							thisCurrentRequestComplete.results.push(thisCurrentRequestCompleteErrorCode);
						}

						thisCurrentRequestCompleteErrorCode.count += 1;
					}

					if (!eventName.startsWith("dashboard_")) {
						if (!eventName.startsWith("system_")) {
							this.currentCost.requestCount += 1;
							this.currentMonthlyCost.requestCount += 1;

							if (eventName.startsWith("multiplayer_")) {
								this.currentCost.matchmakingRequestCount += 1;
								this.currentMonthlyCost.matchmakingRequestCount += 1;

							}
							else if (eventName.startsWith("cloudScript_")) {
								// Stores the parameters value used in the current execution flow.
								let parameters = operationResponse?.parameters;
								if (parameters) {
									// Stores the execution time in milliseconds value used in the current execution flow.
									let executionTimeInMs = parameters.executionTimeInMs;
									// Stores the memory used in bytes value used in the current execution flow.
									let memoryUsedInBytes = parameters.memoryUsedInBytes;

									if (executionTimeInMs != null && memoryUsedInBytes != null) {
										// Stores the cloud script g bs value used in the current execution flow.
										let cloudScriptGBs = (executionTimeInMs / 1000) * (memoryUsedInBytes / 1024 / 1024 / 1024);

										this.currentCost.cloudScriptGBs += cloudScriptGBs;
										this.currentMonthlyCost.cloudScriptGBs += cloudScriptGBs;
									}
								}
							}
						}

						this.currentCost.dataTransferSizeInBytes += result.responseSize ?? 0;
						this.currentMonthlyCost.dataTransferSizeInBytes += result.responseSize ?? 0;
					}
				}
				else {
					if (!eventName.startsWith("dashboard_")) {
						if (!eventName.startsWith("system_")) {
							this.currentMonthlyCost.requestCount += 1;

							if (eventName.startsWith("multiplayer_")) {
								this.currentMonthlyCost.matchmakingRequestCount += 1;
							}
							else if (eventName.startsWith("cloudScript_")) {
								// Stores the parameters value used in the current execution flow.
								let parameters = operationResponse?.parameters;
								if (parameters) {
									// Stores the execution time in milliseconds value used in the current execution flow.
									let executionTimeInMs = parameters.executionTimeInMs;
									// Stores the memory used in bytes value used in the current execution flow.
									let memoryUsedInBytes = parameters.memoryUsedInBytes;

									if (executionTimeInMs != null && memoryUsedInBytes != null) {
										// Stores the cloud script g bs value used in the current execution flow.
										let cloudScriptGBs = (executionTimeInMs / 1000) * (memoryUsedInBytes / 1024 / 1024 / 1024);

										this.currentMonthlyCost.cloudScriptGBs += cloudScriptGBs;
									}
								}
							}
						}

						this.currentMonthlyCost.dataTransferSizeInBytes += result.responseSize ?? 0;
					}
				}
			}
		}
	}

	/**
	 * Saves the analytics.
	 */
	private async saveAnalytics(): Promise<void> {
		// Stores the analytics collection value used in the current execution flow.
		let analyticsCollection = this.gnServer.getDatabase().systemCollection("Analytics");

		// Stores the current date value used in the current execution flow.
		let currentDate = xDatetime.getCurrentDate();
		currentDate.setMinutes(Math.floor(currentDate.getMinutes() / 15) * 15);
		currentDate.setSeconds(0);
		currentDate.setMilliseconds(0);

		analyticsCollection.insertOne({
			ccu: this.currentCCU,

			dau: this.currentDAU,
			dauSince0h: this.currentDAUSince0h,
			dnu: this.currentDNU,
			dnuSince0h: this.currentDNUSince0h,
			drt: this.currentDRT,
			drtSince0h: this.currentDRTSince0h,

			mau: this.currentMAU,
			mauSince0h1: this.currentMAUSince0h1,
			mnu: this.currentMNU,
			mnuSince0h1: this.currentMNUSince0h1,
			mrt: this.currentMRT,
			mrtSince0h1: this.currentMRTSince0h1,

			analyticsPrice: this.currentAnalyticsPrice,
			country: this.currentCountry,

			operationSystem: this.currentOperationSystem,
			requestComplete: this.currentRequestComplete,
			databaseSystem: this.currentDatabaseSystem,
			logDatabaseSystem: this.currentLogDatabaseSystem,

			cost: this.currentCost,
			monthlyCost: this.currentMonthlyCost,

			tsCreate: currentDate.getTime()
		});
	}

}
