import { CloudScriptEventType, CloudScriptProcessBase } from "./CloudScriptEvent";

export class CloudScriptMail extends CloudScriptProcessBase {
	public async send(email: string, subject: string, contentHtml: string) {
		return await this.sendEvent({
			eventType: CloudScriptEventType.SendMailToOne,
			email: email,
			mailData: {
				subject: subject,
				contentHtml: contentHtml,
			}
		});
	}

	public async sendToMore(emails: string[], subject: string, contentHtml: string) {
		return await this.sendEvent({
			eventType: CloudScriptEventType.SendMailToMore,
			emails: emails,
			mailData: {
				subject: subject,
				contentHtml: contentHtml,
			}
		});
	}

}
