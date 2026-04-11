import { xDatetime } from "./../../GN-library/xdatetime/lib/xDatetime";
import { GNServer } from "./../../GNServer";
import { BigAnalyticsItem, IAnalyticsService } from "./IAnalyticsService";
import si from "systeminformation";
import * as mongoDB from "mongodb";

/**
 * Periodically aggregates dashboard metrics from player activity, runtime logs, and host/database telemetry.
 */
export class AnalyticsService implements IAnalyticsService {
	// Runtime entry point used to access timer, database, and cluster state.
	private gnServer: GNServer;

	// Rolling player activity metrics exposed to the dashboard.
	private currentCCU: number;
	private currentDAU: number;
	private currentDAUSince0h: number;
	private currentDNU: number;
	private currentDNUSince0h: number;
	private currentDRT: number;
	private currentDRTSince0h: number;
	private currentMAU: number;
	private currentMAUSince0h1: number;
	private currentMNU: number;
	private currentMNUSince0h1: number;
	private currentMRT: number;
	private currentMRTSince0h1: number;
	private currentAnalyticsPrice: number;

	// Geo, machine, and storage snapshots returned by dashboard analytics.
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

	// Live MongoDB capacity snapshots for primary and log databases.
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

	// Rolling request/error aggregates used by the dashboard summary.
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

	// Estimated infra cost for the last 15-minute window and month-to-date window.
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
	 * Injects the runtime coordinator used to query databases and schedule refresh jobs.
	 * @param gnServer Runtime server instance.
	 */
	public setGNServer(gnServer: GNServer): void {
		this.gnServer = gnServer;
	}

	/**
	 * Returns the in-memory analytics snapshot or a persisted 15-minute snapshot when `tsDate` is provided.
	 * @param tsDate Snapshot timestamp persisted in the `Analytics` collection.
	 * @returns Dashboard-ready analytics payload.
	 */
	public async getBigAnalyticsItem(tsDate?: number): Promise<BigAnalyticsItem> {
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
			let analyticsCollection = this.gnServer.getDatabase().systemCollection("Analytics");

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
	 * Starts the analytics refresh loop.
	 * The service refreshes volatile metrics every 5 minutes and persists a snapshot every 15 minutes.
	 */
	public run(): void {
		this.getAnalytics();

		let thiz = this;
		this.gnServer.getTimerService().subscriberEveryMinute(() => {
			let currentDate = xDatetime.getCurrentDate();
			if (currentDate.getMinutes() % 15 == 0)
				thiz.analytics();
			else if (currentDate.getMinutes() % 5 == 0) {
				thiz.getAnalytics();
			}
		});
	}

	/**
	 * Refreshes the in-memory snapshot and persists it when running on the primary node.
	 */
	private async analytics(): Promise<void> {
		await this.getAnalytics();

		if (this.gnServer.isPrimary()) {
			await this.saveAnalytics();
		}
	}

	/**
	 * Recomputes every dashboard metric from the latest player, geo, system, and runtime log data.
	 */
	private async getAnalytics(): Promise<void> {
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();
		let millisecondsSince0h = xDatetime.getToday0hMilliseconds();
		let playerCollection = this.gnServer.getDatabase().systemCollection("MasterPlayer");

		// The near-real-time dashboard uses a 15-minute activity window for CCU and recent pricing counters.
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
			let millisecondsAt1MonthAgo = currentMilliseconds - xDatetime.ONE_MONTH_MILLISECOND;

			this.currentMAU = await playerCollection.countDocuments({
				tsLastLogin: {
					$gt: millisecondsAt1MonthAgo
				}
			});
		}

		// MAUSince0h1
		{
			// Month-based metrics are anchored to the first day of the current month at midnight.
			let currentDate = xDatetime.getCurrentDate();
			currentDate.setHours(0);
			currentDate.setMinutes(0);
			currentDate.setSeconds(0);
			currentDate.setMilliseconds(0);

			currentDate.setDate(1);

			let millisecondsSince0h1 = currentDate.getTime();

			this.currentMAUSince0h1 = await playerCollection.countDocuments({
				tsLastLogin: {
					$gt: millisecondsSince0h1
				}
			});
		}

		// MNU
		{
			let millisecondsAt1DayAgo = currentMilliseconds - xDatetime.ONE_MONTH_MILLISECOND;

			this.currentMNU = await playerCollection.countDocuments({
				tsCreate: {
					$gt: millisecondsAt1DayAgo
				}
			});
		}

		// MNUSince0h1
		{
			let currentDate = xDatetime.getCurrentDate();
			currentDate.setHours(0);
			currentDate.setMinutes(0);
			currentDate.setSeconds(0);
			currentDate.setMilliseconds(0);

			currentDate.setDate(1);

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
			// `CountryRegion` stores IP lookup buckets; this block compresses them into dashboard-friendly regions.
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

			let countryRegionCollection = this.gnServer.getDatabase().systemCollection("CountryRegion");

			let results = await countryRegionCollection.find({});

			while (await results.hasNext()) {
				let result = await results.next();

				let regions = result["regions"];
				let nameRegions = result["nameRegions"];
				let ipAddressRegions = result["ipAddressRegions"];

				if (!regions || !nameRegions || !ipAddressRegions) continue;

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

				let regionKeys = Object.keys(regions);

				for (let i = 0; i < regionKeys.length; i++) {
					let key = regionKeys[i];
					let ipAddressRegion = ipAddressRegions[key];
					if (!ipAddressRegion) continue;

					let region = regions[key];
					if (!region) continue;

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

					let ipAddressRegionIPKeys = Object.keys(ipAddressRegion);
					let ipAddressRegionIPKey = ipAddressRegionIPKeys[0];
					if (ipAddressRegionIPKey) {
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
			// Host resource usage reflects the current machine, not an aggregate across every cluster node.
			const cpu = await si.currentLoad();
			const memory = await si.mem();
			const fsSize = await si.fsSize();

			let storageUsage: {
				// Stores the name value used by this contract.
				name: string;
				// Stores the fs total size in bytes value used by this contract.
				fsTotalSizeInBytes: number;
				// Stores the fs used size in bytes value used by this contract.
				fsUsedSizeInBytes: number;
			}[] = [];

			for (let i = 0; i < fsSize.length; i++) {
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
		//                 count: { $sum: 1 } // Äáº¿m sá»‘ láº§n xuáº¥t hiá»‡n
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
			let eventCallbackPostCollection = this.gnServer.getDatabase().logRuntimeCollection("EventCallback.PostLog");

			let now = xDatetime.getCurrentDate();
			let month0h = new Date(now.getFullYear(), now.getMonth(), 1);

			let results = await eventCallbackPostCollection.find({ _id: { $gt: mongoDB.ObjectId.createFromTime(month0h.getTime() / 1000 - 1) } })

			// Build both the rolling 15-minute cost view and the month-to-date cost view from the same log stream.
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
				let result = await results.next();

				let tsCreate = result["tsCreate"];
				let eventName = result["eventName"];
				let operationResponse = result["operationResponse"];

				if (tsCreate > millisecondsAt15MinutesAgo) {
					let thisCurrentRequestComplete = this.currentRequestComplete.find(x => x.eventName == eventName);
					if (thisCurrentRequestComplete == null) {
						thisCurrentRequestComplete = {
							eventName: eventName,
							results: [],
						};

						this.currentRequestComplete.push(thisCurrentRequestComplete);
					}

					let errorCode = operationResponse?.parameters?.errorCode;
					if (errorCode) {
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
								let parameters = operationResponse?.parameters;
								if (parameters) {
									let executionTimeInMs = parameters.executionTimeInMs;
									let memoryUsedInBytes = parameters.memoryUsedInBytes;

									if (executionTimeInMs != null && memoryUsedInBytes != null) {
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
								let parameters = operationResponse?.parameters;
								if (parameters) {
									let executionTimeInMs = parameters.executionTimeInMs;
									let memoryUsedInBytes = parameters.memoryUsedInBytes;

									if (executionTimeInMs != null && memoryUsedInBytes != null) {
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
	 * Persists the current snapshot into the `Analytics` collection using a 15-minute bucket timestamp.
	 */
	private async saveAnalytics(): Promise<void> {
		let analyticsCollection = this.gnServer.getDatabase().systemCollection("Analytics");

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
