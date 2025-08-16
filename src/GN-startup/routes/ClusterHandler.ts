import express from "express";
import { wrap } from "./utils/wrap";
import { xDatetime } from "./../../GN-library/xdatetime/lib/xDatetime";
import axios from "axios";
import { Debug } from "./../../GN-library/xdebug/lib/xDebug";

interface NodeInfo {
	instanceId: string;
	fullUrl: string;
}

interface InstanceInfoStatus {
	instanceId: string;
	isPrimary: boolean;

	tsPrimary: number;

	currentInstanceIdPrimary: string;
	currentTsPrimary: number;

}

interface InstanceInfo extends InstanceInfoStatus {
	lostPing: number;

}

export class ClusterHandler {
	private router: express.Express;
	private clusterRouter: express.Router;

	private instanceId: string;
	private isPrimary: boolean;
	private privateKeyToken: string;
	private allNodes: NodeInfo[];

	private instanceInfoStatus: InstanceInfoStatus;
	private instanceInfos: InstanceInfo[];

	private onEventCallback: Map<string, (data: any) => void>;

	private isSingleNode: boolean;

	public setRouter(router: express.Express): void {
		this.router = router;
	}

	public setInstanceId(instanceId: string) {
		this.instanceId = instanceId;
	}

	public setIsPrimary(isPrimary: boolean) {
		this.isPrimary = isPrimary;
	}

	public getIsPrimary(): boolean {
		return this.isPrimary;
	}

	public getIsSingleNode(): boolean {
		return this.isSingleNode;
	}

	public getInstanceInfoStatus(): InstanceInfoStatus {
		return this.instanceInfoStatus;
	}

	public getInstanceInfos(): InstanceInfo[] {
		return this.instanceInfos;
	}

	public setPrivateKeyToken(privateKeyToken: string) {
		this.privateKeyToken = privateKeyToken;
	}

	public setAllNodes(allNodes: NodeInfo[]) {
		this.allNodes = allNodes;
	}

	public init(): void {
		this.clusterRouter = express.Router();
		this.router.use(
			"/cluster",
			wrap((req, res, next) => {
				let pkt = req.header("privateKeyToken");
				if (!pkt || pkt != this.privateKeyToken) {
					return res.sendStatus(401);
				}

				return next();
			}),
			this.clusterRouter
		);
	}

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

		let otherNode = this.allNodes.find(x => x.instanceId != this.instanceId);
		if (otherNode == null) this.isSingleNode = true;

		if (this.isPrimary && otherNode == null) {
			this.instanceInfoStatus.isPrimary = true;
			this.instanceInfoStatus.tsPrimary = xDatetime.getCurrentMilliseconds();
			this.instanceInfoStatus.currentInstanceIdPrimary = this.instanceId;
			this.instanceInfoStatus.currentTsPrimary = this.instanceInfoStatus.tsPrimary;
		}

		this.clusterRouter.post(
			"/status",
			async (req: express.Request, res: express.Response): Promise<any> => {
				return res.status(200).json(this.instanceInfoStatus);
			}
		);

		let thiz = this;

		this.clusterRouter.post(
			"/sendEvent/:name",
			async (req: express.Request, res: express.Response): Promise<any> => {
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

	private callbackInvoke(name: string, data: any): void {
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

	private async update(): Promise<void> {
		await this.checkInstanceStatus();

		await this.checkInstancePrimary();
	}

	private async checkInstanceStatus(): Promise<void> {
		let newInstanceInfoStatuss: InstanceInfoStatus[] = [];

		const statusResults = await Promise.allSettled(this.allNodes.map(node => node.instanceId != this.instanceId && axios.post(node.fullUrl + "/cluster/status", null, { headers: { "pkt": this.privateKeyToken }, timeout: 5000 })));

		statusResults.forEach((result, index) => {
			if (result.status === "fulfilled") {
				let response = result.value;
				let status = response.status;

				if (status == 200) {
					newInstanceInfoStatuss.push(response.data as InstanceInfoStatus);
				}
			}
		});

		let instanceIds: string[] = [];

		for (let i = 0; i < newInstanceInfoStatuss.length; i++) {
			let newInstanceInfoStatus = newInstanceInfoStatuss[i];
			instanceIds.push(newInstanceInfoStatus.instanceId);

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
			let instanceInfo = this.instanceInfos[i];

			if (!instanceIds.includes(instanceInfo.instanceId)) {
				instanceInfo.lostPing += 1;
			}
		}
	}

	private async checkInstancePrimary(): Promise<void> {
		if (this.instanceInfos.length == 0) return;
		let currentPrimaryInstanceInfos: InstanceInfo[] = [];

		for (let i = 0; i < this.instanceInfos.length; i++) {
			let instanceInfo = this.instanceInfos[i];

			if (instanceInfo.isPrimary) {
				currentPrimaryInstanceInfos.push(instanceInfo);
			}
		}

		let okPrimaryInstanceInfos: InstanceInfo[] = [];
		for (let i = 0; i < currentPrimaryInstanceInfos.length; i++) {
			let currentPrimaryInstanceInfo = currentPrimaryInstanceInfos[i];

			if (currentPrimaryInstanceInfo.lostPing > 1) {
				okPrimaryInstanceInfos.push(currentPrimaryInstanceInfo);
			}
		}

		if (okPrimaryInstanceInfos.length == 0) {
			if (!this.instanceInfoStatus.isPrimary) {
				this.instanceInfoStatus.isPrimary = true;
				this.instanceInfoStatus.tsPrimary = xDatetime.getCurrentMilliseconds();
				this.instanceInfoStatus.currentInstanceIdPrimary = this.instanceId;
				this.instanceInfoStatus.currentTsPrimary = this.instanceInfoStatus.tsPrimary;

				for (let i = 0; i < currentPrimaryInstanceInfos.length; i++) {
					let currentPrimaryInstanceInfo = currentPrimaryInstanceInfos[i];

					currentPrimaryInstanceInfo.isPrimary = false;
					currentPrimaryInstanceInfo.tsPrimary = this.instanceInfoStatus.tsPrimary;
					currentPrimaryInstanceInfo.currentInstanceIdPrimary = this.instanceId;
					currentPrimaryInstanceInfo.currentTsPrimary = this.instanceInfoStatus.tsPrimary;
				}
			}
		}
		else {
			okPrimaryInstanceInfos.sort((a, b) => a.tsPrimary - b.tsPrimary);

			let primaryInstanceInfo = okPrimaryInstanceInfos[0];

			// neu khong phai la primary thi cap nhat thong tin primary hien tai
			if (!this.instanceInfoStatus.isPrimary) {
				this.instanceInfoStatus.currentInstanceIdPrimary = primaryInstanceInfo.instanceId;
				this.instanceInfoStatus.currentTsPrimary = primaryInstanceInfo.tsPrimary;

				for (let i = 0; i < currentPrimaryInstanceInfos.length; i++) {
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
					this.instanceInfoStatus.isPrimary = false;
					this.instanceInfoStatus.tsPrimary = 0;
					this.instanceInfoStatus.currentInstanceIdPrimary = primaryInstanceInfo.instanceId;
					this.instanceInfoStatus.currentTsPrimary = primaryInstanceInfo.tsPrimary;
				}
				else {
					for (let i = 0; i < currentPrimaryInstanceInfos.length; i++) {
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

	public onEvent(name: string, onData: (data: any) => void) {
		this.onEventCallback.set(name, onData);
	}

	public async sendEvent(name: string, data?: any, includeMe: boolean = true) {
		for (let i = 0; i < this.allNodes.length; i++) {
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
			this.callbackInvoke(name, data);
		}
	}

	constructor() {
		this.instanceInfos = [];
		this.onEventCallback = new Map();
	}

}
