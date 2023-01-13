import * as mongoDB from "mongodb";
import { xPlayerBase } from "./xPlayerBase";

export class xGamePlayer extends xPlayerBase {
	private static readonly UserId: string = "UserId";
	private static readonly DisplayName: string = "DisplayName";
	private static readonly PushRegistrations: string = "PushRegistrations";
	private static readonly PushId: string = "PushId";

	private displayName: string;
	private pushRegistrations: { [k: string]: any }[];

	constructor(result: any, collection: mongoDB.Collection<mongoDB.Document>) {
		super(result, collection);
		this.setDocument(result);
	}

	private setDocument(result: mongoDB.WithId<mongoDB.Document>) {
		this.userId = result[xGamePlayer.UserId];

		this.displayName = result[xGamePlayer.DisplayName];
		this.pushRegistrations = result[xGamePlayer.PushRegistrations];
	}

	public getDisplayName(): string {
		return this.displayName;
	}

	public setDisplayName(displayName: string) {
		this.displayName = displayName;
		this.collection.updateOne(
			{ _id: this._id },
			{
				$set: {
					DisplayName: displayName,
				},
			}
		);
	}

	public getPush(pushId: string) {
		return this.pushRegistrations.find((x) => x[xGamePlayer.PushId] == pushId);
	}

	public addPush(pushData: { [k: string]: any }) {
		let thisPushData = this.getPush(pushData[xGamePlayer.PushId]);

		if (thisPushData) {
		} else {
			this.pushRegistrations.push(pushData);

			let updateQuery: { [k: string]: any } = {};
			updateQuery[xGamePlayer.PushRegistrations] = pushData;

			this.collection.updateOne(
				{ _id: this._id },
				{
					$push: updateQuery,
				}
			);
		}
	}

	public removePush(pushId: string) {
		let thisPushData = this.getPush(pushId);

		if (thisPushData) {
			let indexOf = this.pushRegistrations.indexOf(thisPushData);
			if (indexOf != -1) {
				this.pushRegistrations.splice(indexOf, 1);
			}

			let updateQuery: { [k: string]: any } = {};
			updateQuery[xGamePlayer.PushRegistrations] = {
				PushId: pushId,
			};

			this.collection.updateOne(
				{ _id: this._id },
				{
					$pull: updateQuery,
				}
			);
		}
	}

	public removeAllPush() {
		this.pushRegistrations = [];

		let updateQuery: { [k: string]: any } = {};
		updateQuery[xGamePlayer.PushRegistrations] = [];

		this.collection.updateOne(
			{ _id: this._id },
			{
				$set: updateQuery,
			}
		);
	}

}
