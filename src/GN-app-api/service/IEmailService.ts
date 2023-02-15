export interface OnSendMailSuccess {
    (): void;
}

export interface OnSendMailError {
    (error: string): void;
}

export interface IEmailService {
    sendMail(toEmail: string, subject: string, contentHtml: string, onSendMailSuccess?: OnSendMailSuccess, onSendMailError?: OnSendMailError): void;
    sendMailToMore(toEmails: string[], subject: string, contentHtml: string, onSendMailSuccess?: OnSendMailSuccess, onSendMailError?: OnSendMailError): void;

}
