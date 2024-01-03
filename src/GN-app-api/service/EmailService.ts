import { IEmailService, OnSendMailError, OnSendMailSuccess } from "./IEmailService";
import sgMail from "@sendgrid/mail";

export class EmailService implements IEmailService {
    private isInit: boolean = false;

    private sendGridApiKey: string;
    private fromEmail: string;

    private needSetup: boolean = false;

    public init(sendGridApiKey: string, fromEmail: string): void {
        this.isInit = false;

        let oldSendGridApiKey = this.sendGridApiKey;

        this.sendGridApiKey = sendGridApiKey;
        this.fromEmail = fromEmail;

        if (oldSendGridApiKey != sendGridApiKey) {
            this.needSetup = true;
        }
    }

    public run(): void {
        if (!this.sendGridApiKey) return;
        if (!this.needSetup) return;

        sgMail.setApiKey(this.sendGridApiKey);
        this.isInit = true;
    }

    public async sendMail(toEmail: string, subject: string, contentHtml: string, onSendMailSuccess?: OnSendMailSuccess, onSendMailError?: OnSendMailError) {
        if (!this.isInit) return;

        let msg = {
            to: toEmail,
            from: this.fromEmail,
            subject: subject,
            html: contentHtml,
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

    public async sendMailToMore(toEmails: string[], subject: string, contentHtml: string, onSendMailSuccess?: OnSendMailSuccess, onSendMailError?: OnSendMailError) {
        if (!this.isInit) return;

        let msg = {
            to: toEmails,
            from: this.fromEmail,
            subject: subject,
            html: contentHtml,
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
