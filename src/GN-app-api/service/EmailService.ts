import { IEmailService, OnSendMailError, OnSendMailSuccess } from "./IEmailService";
import nodemailer, { Transporter } from "nodemailer";

export class EmailService implements IEmailService {
    private isInit: boolean = false;

    private host: string;
    private port: number;
    private secure: boolean;
    private username: string;
    private password: string;
    private fromEmail: string;

    private needSetup: boolean = false;

    private transporter: Transporter;

    public init(host: string, port: number, secure: boolean, username: string, password: string, fromEmail: string): void {
        this.isInit = false;

        let oldHost = this.host;
        let oldPort = this.port;
        let oldSecure = this.secure;
        let oldUsername = this.username;
        let oldPassword = this.password;

        this.host = host;
        this.port = port;
        this.secure = secure;
        this.username = username;
        this.password = password;
        this.fromEmail = fromEmail;

        if (oldHost != host || oldPort != port || oldSecure != secure || oldUsername != username || oldPassword != password) {
            this.needSetup = true;
        }
    }

    public run(): void {
        if (!this.host) return;
        if (!this.port) return;
        if (!this.username) return;
        if (!this.password) return;
        if (!this.needSetup) return;

        this.transporter = nodemailer.createTransport({
            host: this.host,
            port: this.port,
            secure: this.secure,
            auth: {
                user: this.username,
                pass: this.password,
            }
        });

        this.isInit = true;
    }

    public sendMail(toEmail: string, subject: string, contentHtml: string, onSendMailSuccess?: OnSendMailSuccess, onSendMailError?: OnSendMailError) {
        if (!this.isInit) return;

        let msg = {
            to: toEmail,
            from: this.fromEmail,
            subject: subject,
            html: contentHtml,
        };

        this.transporter.sendMail(msg, (error, info) => {
            if (error) {
                if (onSendMailError != null) onSendMailError(error.message);
            }
            else {

                if (onSendMailSuccess != null) onSendMailSuccess();
            }
        });
    }

    public sendMailToMore(toEmails: string[], subject: string, contentHtml: string, onSendMailSuccess?: OnSendMailSuccess, onSendMailError?: OnSendMailError) {
        if (!this.isInit) return;

        let msg = {
            to: toEmails,
            from: this.fromEmail,
            subject: subject,
            html: contentHtml,
        };

        this.transporter.sendMail(msg, (error, info) => {
            if (error) {
                if (onSendMailError != null) onSendMailError(error.message);
            }
            else {

                if (onSendMailSuccess != null) onSendMailSuccess();
            }
        });
    }

}
