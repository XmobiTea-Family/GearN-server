import { CloudScriptEventType, CloudScriptProcessBase } from "./CloudScriptEvent";

export class CloudScriptMail extends CloudScriptProcessBase {
	/**
	 * Executes the send workflow asynchronously.
	 * @param email Provides the email value used by this operation.
	 * @param subject Provides the subject value used by this operation.
	 * @param contentHtml Provides the content html value used by this operation.
	 */
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

	/**
	 * Sends the to more.
	 * @param emails Provides the emails value used by this operation.
	 * @param subject Provides the subject value used by this operation.
	 * @param contentHtml Provides the content html value used by this operation.
	 */
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
