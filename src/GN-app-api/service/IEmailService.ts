export interface OnSendMailSuccess {
    (): void;
}

export interface OnSendMailError {
    (error: string): void;
}

export interface IEmailService {
    /**
     * Sends the mail.
     * @param toEmail Provides the to email value used by this operation.
     * @param subject Provides the subject value used by this operation.
     * @param contentHtml Provides the content html value used by this operation.
     * @param onSendMailSuccess Provides the on send mail success value used by this operation.
     * @param onSendMailError Provides the on send mail error value used by this operation.
     */
    sendMail(toEmail: string, subject: string, contentHtml: string, onSendMailSuccess?: OnSendMailSuccess, onSendMailError?: OnSendMailError): void;
    /**
     * Sends the mail to more.
     * @param toEmails Provides the to emails value used by this operation.
     * @param subject Provides the subject value used by this operation.
     * @param contentHtml Provides the content html value used by this operation.
     * @param onSendMailSuccess Provides the on send mail success value used by this operation.
     * @param onSendMailError Provides the on send mail error value used by this operation.
     */
    sendMailToMore(toEmails: string[], subject: string, contentHtml: string, onSendMailSuccess?: OnSendMailSuccess, onSendMailError?: OnSendMailError): void;
}
