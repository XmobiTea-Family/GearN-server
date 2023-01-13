import sgMail from "@sendgrid/mail";
import { OnRunSuccess } from "./../../xbuilder/lib/OnRunSuccess";

interface OnSendMailSuccess {
	(): void;
}

interface OnSendMailError {
	(error: string): void;
}

export class xMail {
	private isInit: boolean = false;

	private sendGridApiKey: string;
	private fromEmail: string;

	public init(sendGridApiKey: string, fromEmail: string): void {
		this.sendGridApiKey = sendGridApiKey;
		this.fromEmail = fromEmail;
	}

	public run(onRunSuccess?: OnRunSuccess): void {
		sgMail.setApiKey(this.sendGridApiKey);
		this.isInit = true;

		if (onRunSuccess != null) onRunSuccess();
	}

	public async sendMail(toEmail: string, subject: string, contentHTML: string, onSendMailSuccess?: OnSendMailSuccess, onSendMailError?: OnSendMailError) {
		if (!this.isInit) return;

		let msg = {
			to: toEmail,
			from: this.fromEmail,
			subject: subject,
			html: contentHTML,
		};

		try {
			let response = await sgMail.send(msg);
			let statusCode = response as any["statusCode"];

			if (statusCode > 399) {
				if (onSendMailError != null) onSendMailError(response.toString());
			} else {
				if (onSendMailSuccess != null) onSendMailSuccess();
			}
		} catch (err) {
			if (onSendMailError != null) onSendMailError(err.message);
		}
	}

}
