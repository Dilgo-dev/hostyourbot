import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../config/env';
import fs from 'fs';
import path from 'path';

export class MailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.password,
      },
    });

    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('[MailService] Connexion SMTP établie avec succès');
    } catch (error) {
      console.error('[MailService] Erreur de connexion SMTP:', error);
    }
  }

  private loadTemplate(templateName: string): string {
    const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);
    return fs.readFileSync(templatePath, 'utf-8');
  }

  private replacePlaceholders(template: string, data: Record<string, string>): string {
    let result = template;
    Object.keys(data).forEach((key) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
    });
    return result;
  }

  async sendWelcomeEmail(to: string, userName: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const template = this.loadTemplate('welcome');
      const html = this.replacePlaceholders(template, {
        userName,
        appUrl: 'https://hostyourbot.app',
      });

      const info = await this.transporter.sendMail({
        from: config.smtp.from,
        to,
        subject: 'Bienvenue sur HostYourBot',
        html,
      });

      console.log('[MailService] Email de bienvenue envoyé:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('[MailService] Erreur envoi email bienvenue:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  async sendPasswordResetEmail(to: string, resetLink: string, userName: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const template = this.loadTemplate('password-reset');
      const html = this.replacePlaceholders(template, {
        userName,
        resetLink,
      });

      const info = await this.transporter.sendMail({
        from: config.smtp.from,
        to,
        subject: 'Réinitialisation de votre mot de passe',
        html,
      });

      console.log('[MailService] Email réinitialisation envoyé:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('[MailService] Erreur envoi email réinitialisation:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  async sendNotificationEmail(to: string, subject: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const template = this.loadTemplate('notification');
      const html = this.replacePlaceholders(template, {
        message,
      });

      const info = await this.transporter.sendMail({
        from: config.smtp.from,
        to,
        subject,
        html,
      });

      console.log('[MailService] Email notification envoyé:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('[MailService] Erreur envoi email notification:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  async sendCustomEmail(to: string, subject: string, htmlContent: string, textContent: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const info = await this.transporter.sendMail({
        from: config.smtp.from,
        to,
        subject,
        text: textContent,
        html: htmlContent,
      });

      console.log('[MailService] Email personnalisé envoyé:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('[MailService] Erreur envoi email personnalisé:', error);
      return { success: false, error: (error as Error).message };
    }
  }
}
