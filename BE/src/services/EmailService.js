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
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .button { display: inline-block; padding: 12px 30px; margin: 20px 0; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
            .footer { text-align: center; padding: 10px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Email Verification Required</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>Thank you for registering with our platform! To complete your registration and start using your account, please verify your email address by clicking the button below:</p>
              <center>
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </center>
              <p>Or copy and paste this link in your browser:</p>
              <p><a href="${verificationUrl}">${verificationUrl}</a></p>
              <p>This verification link will expire in 24 hours.</p>
              <p>If you didn't create this account, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Capstone Project. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"Capstone Platform" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'Email Verification - Complete Your Registration',
        html: htmlContent,
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
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .button { display: inline-block; padding: 12px 30px; margin: 20px 0; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; }
            .footer { text-align: center; padding: 10px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Verification Link</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>We've sent you a new verification link for your email address. Please click the button below to verify:</p>
              <center>
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </center>
              <p>Or copy and paste this link in your browser:</p>
              <p><a href="${verificationUrl}">${verificationUrl}</a></p>
              <p>This verification link will expire in 24 hours.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Capstone Project. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"Capstone Platform" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'New Email Verification Link - Click to Verify',
        html: htmlContent,
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
