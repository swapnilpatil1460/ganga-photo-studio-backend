"use strict";
// Mock Email Service
// Replace with actual nodemailer setup in production (e.g. SendGrid, SES)
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const sendEmail = async (to, subject, html) => {
    console.log('----------------------------------------------------');
    console.log(`[EMAIL MOCK] Sending email to: ${to}`);
    console.log(`[EMAIL MOCK] Subject: ${subject}`);
    console.log(`[EMAIL MOCK] Content Preview: ${html.substring(0, 50)}...`);
    console.log('----------------------------------------------------');
    // Simulate network delay
    return new Promise((resolve) => setTimeout(resolve, 500));
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=mailer.js.map