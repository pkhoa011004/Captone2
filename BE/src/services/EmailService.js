import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

export class EmailService {
  constructor() {
    this.transporter = null;
  }

  async init() {
    try {
      // Create transporter with Gmail SMTP credentials
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      // Test connection
      await this.transporter.verify();
      logger.info('✅ Email service initialized successfully');
      return true;
    } catch (error) {
      logger.error('❌ Email service initialization failed:', error.message);
      return false;
    }
  }

  async sendVerificationEmail(userEmail, userName, verificationToken) {
    try {
      if (!this.transporter) {
        throw new Error('Email service not initialized');
      }

      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

      const htmlContent = `
Hi ${userName},

Thank you for registering with our platform! To complete your registration and start using your account, please verify your email address by clicking the link below:

${verificationUrl}

This verification link will expire in 24 hours.

If you didn't create this account, please ignore this email.

Best regards,
Capstone Project Team
      `.trim();

      const mailOptions = {
        from: `"Capstone Platform" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'Email Verification - Complete Your Registration',
        text: htmlContent,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`✅ Verification email sent to ${userEmail} (Message ID: ${info.messageId})`);
      return true;
    } catch (error) {
      logger.error(`❌ Failed to send verification email to ${userEmail}:`, error.message);
      throw error;
    }
  }

  async sendResendVerificationEmail(userEmail, userName, verificationToken) {
    try {
      if (!this.transporter) {
        throw new Error('Email service not initialized');
      }

      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

      const htmlContent = `
Hi ${userName},

We've sent you a new verification link for your email address. Please click the link below to verify:

${verificationUrl}

This verification link will expire in 24 hours.

Best regards,
Capstone Project Team
      `.trim();

      const mailOptions = {
        from: `"Capstone Platform" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'New Email Verification Link - Click to Verify',
        text: htmlContent,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`✅ Resend verification email sent to ${userEmail} (Message ID: ${info.messageId})`);
      return true;
    } catch (error) {
      logger.error(`❌ Failed to send resend verification email to ${userEmail}:`, error.message);
      throw error;
    }
  }
}

export default new EmailService();
