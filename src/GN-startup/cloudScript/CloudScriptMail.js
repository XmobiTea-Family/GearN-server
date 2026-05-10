"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudScriptMail = void 0;
const CloudScriptEvent_1 = require("./CloudScriptEvent");
class CloudScriptMail extends CloudScriptEvent_1.CloudScriptProcessBase {
    async send(email, subject, contentHtml) {
        return await this.sendEvent({
            eventType: CloudScriptEvent_1.CloudScriptEventType.SendMailToOne,
            email: email,
            mailData: {
                subject: subject,
                contentHtml: contentHtml,
            },
        });
    }
    async sendToMore(emails, subject, contentHtml) {
        return await this.sendEvent({
            eventType: CloudScriptEvent_1.CloudScriptEventType.SendMailToMore,
            emails: emails,
            mailData: {
                subject: subject,
                contentHtml: contentHtml,
            },
        });
    }
}
exports.CloudScriptMail = CloudScriptMail;
