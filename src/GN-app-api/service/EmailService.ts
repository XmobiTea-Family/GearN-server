import { IEmailService, OnSendMailError, OnSendMailSuccess } from "./IEmailService";
import nodemailer, { Transporter } from "nodemailer";

export class EmailService implements IEmailService {
	// Indicates whether init.
	private isInit: boolean = false;

	// Stores the host value used by this instance.
	private host: string;
	// Stores the port value used by this instance.
	private port: number;
	// Indicates whether secure.
	private secure: boolean;
	// Indicates whether rname should be used.
	private username: string;
	// Stores the password value used by this instance.
	private password: string;
	// Stores the from email value used by this instance.
	private fromEmail: string;

	// Indicates whether need setup.
	private needSetup: boolean = false;

	// Stores the transporter value used by this instance.
	private transporter: Transporter;

	/**
	 * Executes the init workflow.
	 * @param host Provides the host value used by this operation.
	 * @param port Provides the port value used by this operation.
	 * @param secure Provides the secure value used by this operation.
	 * @param username Indicates whether rname should be used.
	 * @param password Provides the password value used by this operation.
	 * @param fromEmail Provides the from email value used by this operation.
	 */
	public init(host: string, port: number, secure: boolean, username: string, password: string, fromEmail: string): void {
		this.isInit = false;

		// Stores the old host value used in the current execution flow.
		let oldHost = this.host;
		// Stores the old port value used in the current execution flow.
		let oldPort = this.port;
		// Stores the old secure value used in the current execution flow.
		let oldSecure = this.secure;
		// Stores the old username value used in the current execution flow.
		let oldUsername = this.username;
		// Stores the old password value used in the current execution flow.
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

	/**
	 * Runs the current workflow.
	 */
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

	/**
	 * Sends the mail.
	 * @param toEmail Provides the to email value used by this operation.
	 * @param subject Provides the subject value used by this operation.
	 * @param contentHtml Provides the content html value used by this operation.
	 * @param onSendMailSuccess Provides the on send mail success value used by this operation.
	 * @param onSendMailError Provides the on send mail error value used by this operation.
	 */
	public sendMail(toEmail: string, subject: string, contentHtml: string, onSendMailSuccess?: OnSendMailSuccess, onSendMailError?: OnSendMailError) {
		if (!this.isInit) return;

		// Stores the msg value used in the current execution flow.
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

	/**
	 * Sends the mail to more.
	 * @param toEmails Provides the to emails value used by this operation.
	 * @param subject Provides the subject value used by this operation.
	 * @param contentHtml Provides the content html value used by this operation.
	 * @param onSendMailSuccess Provides the on send mail success value used by this operation.
	 * @param onSendMailError Provides the on send mail error value used by this operation.
	 */
	public sendMailToMore(toEmails: string[], subject: string, contentHtml: string, onSendMailSuccess?: OnSendMailSuccess, onSendMailError?: OnSendMailError) {
		if (!this.isInit) return;

		// Stores the msg value used in the current execution flow.
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
