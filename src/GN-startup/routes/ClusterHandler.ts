import express from "express";
import { wrap } from "./utils/wrap";
import { xDatetime } from "./../../GN-library/xdatetime/lib/xDatetime";
import axios from "axios";
import { Debug } from "./../../GN-library/xdebug/lib/xDebug";

interface NodeInfo {
	// Stores the instance ID value used by this contract.
	instanceId: string;
	// Stores the full URL value used by this contract.
	fullUrl: string;
}

interface InstanceInfoStatus {
	// Stores the instance ID value used by this contract.
	instanceId: string;
	// Indicates whether primary.
	isPrimary: boolean;

	// Stores the timestamp primary value used by this contract.
	tsPrimary: number;

	// Stores the current instance ID primary value used by this contract.
	currentInstanceIdPrimary: string;
	// Stores the current timestamp primary value used by this contract.
	currentTsPrimary: number;

}

interface InstanceInfo extends InstanceInfoStatus {
	// Stores the lost ping value used by this contract.
	lostPing: number;

}

export class ClusterHandler {
	// Stores the router value used by this instance.
	private router: express.Express;
	// Stores the cluster router value used by this instance.
	private clusterRouter: express.Router;

	// Stores the instance ID value used by this instance.
	private instanceId: string;
	// Indicates whether primary.
	private isPrimary: boolean;
	// Stores the private key token value used by this instance.
	private privateKeyToken: string;
	// Stores the all nodes list used by this instance.
	private allNodes: NodeInfo[];

	// Stores the instance info status value used by this instance.
	private instanceInfoStatus: InstanceInfoStatus;
	// Stores the instance infos list used by this instance.
	private instanceInfos: InstanceInfo[];

	// Stores the on event callback collection used by this instance.
	private onEventCallback: Map<string, (data: any) => void>;

	// Indicates whether single node.
	private isSingleNode: boolean;

	/**
	 * Sets the router.
	 * @param router Provides the router value used by this operation.
	 */
	public setRouter(router: express.Express): void {
		this.router = router;
	}

	/**
	 * Sets the instance ID.
	 * @param instanceId Provides the instance ID value used by this operation.
	 */
	public setInstanceId(instanceId: string) {
		this.instanceId = instanceId;
	}

	/**
	 * Sets whether primary.
	 * @param isPrimary Indicates whether primary.
	 */
	public setIsPrimary(isPrimary: boolean) {
		this.isPrimary = isPrimary;
	}

	/**
	 * Returns whether primary.
	 * @returns Returns whether primary.
	 */
	public getIsPrimary(): boolean {
		return this.isPrimary;
	}

	/**
	 * Returns whether single node.
	 * @returns Returns whether single node.
	 */
	public getIsSingleNode(): boolean {
		return this.isSingleNode;
	}

	/**
	 * Returns the instance info status.
	 * @returns Returns the instance info status.
	 */
	public getInstanceInfoStatus(): InstanceInfoStatus {
		return this.instanceInfoStatus;
	}

	/**
	 * Returns the instance infos.
	 * @returns Returns the instance infos.
	 */
	public getInstanceInfos(): InstanceInfo[] {
		return this.instanceInfos;
	}

	/**
	 * Sets the private key token.
	 * @param privateKeyToken Provides the private key token value used by this operation.
	 */
	public setPrivateKeyToken(privateKeyToken: string) {
		this.privateKeyToken = privateKeyToken;
	}

	/**
	 * Sets the all nodes.
	 * @param allNodes Provides the all nodes value used by this operation.
	 */
	public setAllNodes(allNodes: NodeInfo[]) {
		this.allNodes = allNodes;
	}

	/**
	 * Executes the init workflow.
	 */
	public init(): void {
		this.clusterRouter = express.Router();
		this.router.use(
			"/cluster",
			wrap((req, res, next) => {
				// Stores the private key token value used in the current execution flow.
				let privateKeyToken = req.header("pkt");
				if (!privateKeyToken || privateKeyToken != this.privateKeyToken) {
					return res.sendStatus(401);
				}

				return next();
			}),
			this.clusterRouter
		);
	}

	/**
	 * Runs the current workflow.
	 */
	public run(): void {
		this.clusterRouter.use(express.json({ limit: "10mb" }));
		// this.clusterRouter.use(express.urlencoded({ extended: false, limit: "10mb" }));

		this.instanceInfoStatus = {
			instanceId: this.instanceId,
			isPrimary: false,
			tsPrimary: 0,
			currentInstanceIdPrimary: "",
			currentTsPrimary: 0,
		}

		// Stores the other node value used in the current execution flow.
		let otherNode = this.allNodes.find(x => x.instanceId != this.instanceId);
		if (otherNode == null) this.isSingleNode = true;

		// Stores the current milliseconds value used in the current execution flow.
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		if (this.isPrimary && otherNode == null) {
			this.instanceInfoStatus.isPrimary = true;
			this.instanceInfoStatus.tsPrimary = currentMilliseconds;
			this.instanceInfoStatus.currentInstanceIdPrimary = this.instanceId;
			this.instanceInfoStatus.currentTsPrimary = this.instanceInfoStatus.tsPrimary;
		}

		for (let i = 0; i < this.allNodes.length; i++) {
			// Stores the this node value used in the current execution flow.
			let thisNode = this.allNodes[i];
			if (thisNode.instanceId != this.instanceId) {
				this.instanceInfos.push({
					instanceId: thisNode.instanceId,
					currentInstanceIdPrimary: this.isPrimary ? this.instanceId : "",
					currentTsPrimary: currentMilliseconds,
					isPrimary: false,
					lostPing: 0,
					tsPrimary: currentMilliseconds
				});
			}
		}

		this.clusterRouter.post(
			"/status",
			async (req: express.Request, res: express.Response): Promise<any> => {
				return res.status(200).json(this.instanceInfoStatus);
			}
		);

		// Stores the thiz value used in the current execution flow.
		let thiz = this;

		this.clusterRouter.post(
			"/sendEvent/:name",
			async (req: express.Request, res: express.Response): Promise<any> => {
				// Stores the name value used in the current execution flow.
				let name = req.params.name;
				if (!name) return res.sendStatus(403);

				thiz.callbackInvoke(name, req.body);

				return res.sendStatus(200);
			}
		);

		// need remove
		this.clusterRouter.get(
			"/status",
			async (req: express.Request, res: express.Response): Promise<any> => {
				return res.status(200).json(this.instanceInfoStatus);
			}
		);

		setInterval(() => {
			thiz.update();
		}, 5000);
	}

	/**
	 * Executes the callback invoke workflow.
	 * @param name Provides the name value used by this operation.
	 * @param data Provides the data value used by this operation.
	 */
	private callbackInvoke(name: string, data: any): void {
		// Stores the callback value used in the current execution flow.
		let callback = this.onEventCallback.get(name);
		if (!callback) {
			return;
		}

		try {
			callback(data);
		}
		catch (err) {
			Debug.logError("[GearN] ClusterHandler receive event failed " + err.message);
		}
	}

	/**
	 * Executes the update workflow asynchronously.
	 */
	private async update(): Promise<void> {
		await this.checkInstanceStatus();

		await this.checkInstancePrimary();
	}

	/**
	 * Executes the check instance status workflow asynchronously.
	 */
	private async checkInstanceStatus(): Promise<void> {
		// Stores the new instance info statuss value used in the current execution flow.
		let newInstanceInfoStatuss: InstanceInfoStatus[] = [];

		// Stores the status results value used in the current execution flow.
		const statusResults = await Promise.allSettled(this.allNodes.map(node => node.instanceId != this.instanceId && axios.post(node.fullUrl + "/cluster/status", null, { headers: { "pkt": this.privateKeyToken }, timeout: 5000 })));

		statusResults.forEach((result, index) => {
			if (result.status === "fulfilled") {
				// Stores the response value used in the current execution flow.
				let response = result.value;
				// Stores the status value used in the current execution flow.
				let status = response.status;

				if (status == 200) {
					newInstanceInfoStatuss.push(response.data as InstanceInfoStatus);
				}
			}
		});

		// Stores the instance IDs value used in the current execution flow.
		let instanceIds: string[] = [];

		for (let i = 0; i < newInstanceInfoStatuss.length; i++) {
			// Stores the new instance info status value used in the current execution flow.
			let newInstanceInfoStatus = newInstanceInfoStatuss[i];
			instanceIds.push(newInstanceInfoStatus.instanceId);

			// Stores the instance info value used in the current execution flow.
			let instanceInfo = this.instanceInfos.find(x => x.instanceId == newInstanceInfoStatus.instanceId);

			if (instanceInfo == null) {
				instanceInfo = {
					instanceId: newInstanceInfoStatus.instanceId,
					isPrimary: newInstanceInfoStatus.isPrimary,
					tsPrimary: newInstanceInfoStatus.tsPrimary,
					currentInstanceIdPrimary: newInstanceInfoStatus.currentInstanceIdPrimary,
					currentTsPrimary: newInstanceInfoStatus.currentTsPrimary,
					lostPing: 0,
				};

				this.instanceInfos.push(instanceInfo);
			}
			else {
				instanceInfo.isPrimary = newInstanceInfoStatus.isPrimary;
				instanceInfo.tsPrimary = newInstanceInfoStatus.tsPrimary;
				instanceInfo.currentInstanceIdPrimary = newInstanceInfoStatus.currentInstanceIdPrimary;
				instanceInfo.currentTsPrimary = newInstanceInfoStatus.currentTsPrimary;
				instanceInfo.lostPing = 0;
			}
		}

		for (let i = 0; i < this.instanceInfos.length; i++) {
			// Stores the instance info value used in the current execution flow.
			let instanceInfo = this.instanceInfos[i];

			if (!instanceIds.includes(instanceInfo.instanceId)) {
				instanceInfo.lostPing += 1;
			}
		}
	}

	/**
	 * Executes the check instance primary workflow asynchronously.
	 */
	private async checkInstancePrimary(): Promise<void> {
		if (this.instanceInfos.length == 0) return;
		// Stores the current primary instance infos value used in the current execution flow.
		let currentPrimaryInstanceInfos: InstanceInfo[] = [];

		for (let i = 0; i < this.instanceInfos.length; i++) {
			// Stores the instance info value used in the current execution flow.
			let instanceInfo = this.instanceInfos[i];

			if (instanceInfo.isPrimary) {
				currentPrimaryInstanceInfos.push(instanceInfo);
			}
		}

		// Stores the ok primary instance infos value used in the current execution flow.
		let okPrimaryInstanceInfos: InstanceInfo[] = [];
		for (let i = 0; i < currentPrimaryInstanceInfos.length; i++) {
			// Stores the current primary instance info value used in the current execution flow.
			let currentPrimaryInstanceInfo = currentPrimaryInstanceInfos[i];

			if (currentPrimaryInstanceInfo.lostPing < 1) {
				okPrimaryInstanceInfos.push(currentPrimaryInstanceInfo);
			}
		}

		if (okPrimaryInstanceInfos.length == 0) {
			if (!this.instanceInfoStatus.isPrimary) {
				this.isPrimary = true;
				this.instanceInfoStatus.isPrimary = true;
				this.instanceInfoStatus.tsPrimary = xDatetime.getCurrentMilliseconds();
				this.instanceInfoStatus.currentInstanceIdPrimary = this.instanceId;
				this.instanceInfoStatus.currentTsPrimary = this.instanceInfoStatus.tsPrimary;

				for (let i = 0; i < currentPrimaryInstanceInfos.length; i++) {
					// Stores the current primary instance info value used in the current execution flow.
					let currentPrimaryInstanceInfo = currentPrimaryInstanceInfos[i];

					currentPrimaryInstanceInfo.isPrimary = false;
					currentPrimaryInstanceInfo.tsPrimary = this.instanceInfoStatus.tsPrimary;
					currentPrimaryInstanceInfo.currentInstanceIdPrimary = this.instanceId;
					currentPrimaryInstanceInfo.currentTsPrimary = this.instanceInfoStatus.tsPrimary;
				}
			}
		}
		else {
			okPrimaryInstanceInfos.sort((a, b) => a.tsPrimary < b.tsPrimary ? -1 : 1);

			// Stores the primary instance info value used in the current execution flow.
			let primaryInstanceInfo = okPrimaryInstanceInfos[0];

			// neu khong phai la primary thi cap nhat thong tin primary hien tai
			if (!this.instanceInfoStatus.isPrimary) {
				this.instanceInfoStatus.currentInstanceIdPrimary = primaryInstanceInfo.instanceId;
				this.instanceInfoStatus.currentTsPrimary = primaryInstanceInfo.tsPrimary;

				for (let i = 0; i < currentPrimaryInstanceInfos.length; i++) {
					// Stores the current primary instance info value used in the current execution flow.
					let currentPrimaryInstanceInfo = currentPrimaryInstanceInfos[i];
					if (currentPrimaryInstanceInfo.instanceId == primaryInstanceInfo.instanceId) continue;

					currentPrimaryInstanceInfo.isPrimary = false;
					currentPrimaryInstanceInfo.tsPrimary = 0;
					currentPrimaryInstanceInfo.currentInstanceIdPrimary = primaryInstanceInfo.instanceId;
					currentPrimaryInstanceInfo.currentTsPrimary = primaryInstanceInfo.tsPrimary;
				}
			}
			// neu dang la primary thi conflict va can phai thong nhat xem ai la primary
			else {
				if (this.instanceInfoStatus.tsPrimary > primaryInstanceInfo.tsPrimary) {
					this.isPrimary = false;
					this.instanceInfoStatus.isPrimary = false;
					this.instanceInfoStatus.tsPrimary = 0;
					this.instanceInfoStatus.currentInstanceIdPrimary = primaryInstanceInfo.instanceId;
					this.instanceInfoStatus.currentTsPrimary = primaryInstanceInfo.tsPrimary;
				}
				else {
					for (let i = 0; i < currentPrimaryInstanceInfos.length; i++) {
						// Stores the current primary instance info value used in the current execution flow.
						let currentPrimaryInstanceInfo = currentPrimaryInstanceInfos[i];

						currentPrimaryInstanceInfo.isPrimary = false;
						currentPrimaryInstanceInfo.tsPrimary = 0;
						currentPrimaryInstanceInfo.currentInstanceIdPrimary = this.instanceInfoStatus.instanceId;
						currentPrimaryInstanceInfo.currentTsPrimary = this.instanceInfoStatus.tsPrimary;
					}
				}
			}
		}

	}

	/**
	 * Executes the on event workflow.
	 * @param name Provides the name value used by this operation.
	 * @param onData Provides the on data value used by this operation.
	 */
	public onEvent(name: string, onData: (data: any) => void) {
		this.onEventCallback.set(name, onData);
	}

	/**
	 * Sends the event.
	 * @param name Provides the name value used by this operation.
	 * @param data Provides the data value used by this operation.
	 * @param includeMe Provides the include me value used by this operation.
	 */
	public async sendEvent(name: string, data?: any, includeMe: boolean = true) {
		for (let i = 0; i < this.allNodes.length; i++) {
			// Stores the node info value used in the current execution flow.
			let nodeInfo = this.allNodes[i];

			if (nodeInfo.instanceId != this.instanceId)
				axios.post(nodeInfo.fullUrl + "/cluster/sendEvent/" + name, data, { headers: { "pkt": this.privateKeyToken, "Content-Type": "application/json" } }).then(response => {
					if (response.status != 200) {
						Debug.logError("[GearN] ClusterHandler sendEvent failed with status " + response.status + ", instanceId: " + nodeInfo.instanceId);
					}
				}).catch(err => {
					Debug.logError("[GearN] ClusterHandler sendEvent failed " + err.message + ", instanceId: " + nodeInfo.instanceId);
				});
		}

		if (includeMe) {
			await this.callbackInvoke(name, data);
		}
	}

	/**
	 * Initializes a new cluster handler instance.
	 */
	constructor() {
		this.instanceInfos = [];
		this.onEventCallback = new Map();
	}

}
