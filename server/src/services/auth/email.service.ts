import nodemailer, { type Transporter } from 'nodemailer';
import { Resend } from 'resend';
import { config } from '../../config/env.js';

class EmailService {
  private resendClient: Resend | null = null;
  private smtpTransporter: Transporter | null = null;

  constructor() {
    if (config.resend.apiKey) {
      this.resendClient = new Resend(config.resend.apiKey);
    }
  }

  private getSmtpTransporter(): Transporter | null {
    if (!this.smtpTransporter && config.smtp.user && config.smtp.pass) {
      this.smtpTransporter = nodemailer.createTransport({
        service: config.smtp.host.includes('gmail') ? 'gmail' : undefined,
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        auth: {
          user: config.smtp.user,
          pass: config.smtp.pass,
        },
        tls: {
          rejectUnauthorized: false,
        },
        family: 4, // Fuerza IPv4 para evitar timeouts en redes locales
        connectionTimeout: 5000,
      } as any);
    }
    return this.smtpTransporter;
  }

  private getHtmlTemplate(otpCode: string): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #040406; color: #f8fafc; margin: 0; padding: 40px 20px; }
          .card { max-width: 480px; margin: 0 auto; background-color: #0b1019; border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 12px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.8); }
          .header { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; border-bottom: 1px solid #1e293b; padding-bottom: 16px; }
          .title { color: #38bdf8; font-size: 1.25rem; font-weight: 800; margin: 0; letter-spacing: 0.5px; }
          .text { color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin: 0 0 20px 0; }
          .otp-box { background: rgba(2, 6, 23, 0.9); border: 2px dashed #0284c7; border-radius: 8px; text-align: center; padding: 18px; margin-bottom: 24px; }
          .otp-code { font-family: monospace; font-size: 2.2rem; font-weight: 800; letter-spacing: 8px; color: #38bdf8; }
          .footer { font-size: 0.75rem; color: #64748b; border-top: 1px solid #1e293b; padding-top: 16px; margin-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1 class="title">🛡️ QA-SEC SUITE</h1>
          </div>
          <p class="text">Has solicitado un código de verificación de un solo uso (OTP) para autenticarte en la plataforma DevSecOps.</p>
          <div class="otp-box">
            <span class="otp-code">${otpCode}</span>
          </div>
          <p class="text" style="font-size: 0.8rem;">Este código es de un solo uso y expirará en 10 minutos. Si no has solicitado este acceso, puedes ignorar este mensaje.</p>
          <div class="footer">
            Mensaje automático de seguridad. No respondas a esta dirección de correo.
          </div>
        </div>
      </body>
      </html>
    `;
  }

  public async sendOtpEmail(toEmail: string, otpCode: string): Promise<boolean> {
    const html = this.getHtmlTemplate(otpCode);
    const subject = `🔑 Tu código de acceso QA-Sec Suite: ${otpCode}`;
    const text = `Tu código de acceso OTP para QA-Sec Suite es: ${otpCode}. Expira en 10 minutos.`;

    // 1. INTENTO PRIMARIO: Resend API (HTTPS por puerto 443 - no bloqueable)
    if (config.resend.apiKey) {
      try {
        if (!this.resendClient) {
          this.resendClient = new Resend(config.resend.apiKey);
        }

        const resendRes = await this.resendClient.emails.send({
          from: config.resend.from,
          to: toEmail,
          subject,
          text,
          html,
        });

        if (!resendRes.error) {
          console.log(`[MAILER-RESEND] ✅ Código OTP entregado vía HTTPS a ${toEmail} (ID: ${resendRes.data?.id})`);
          return true;
        }

        console.warn(`[MAILER-RESEND] ⚠️ Resend reportó error:`, resendRes.error.message);
      } catch (err: any) {
        console.warn(`[MAILER-RESEND] ⚠️ Excepción con Resend: ${err.message}. Probando fallback SMTP...`);
      }
    }

    // 2. INTENTO SECUNDARIO (FAILOVER): SMTP / Nodemailer
    const transporter = this.getSmtpTransporter();
    if (transporter && config.smtp.user && config.smtp.pass) {
      try {
        await transporter.sendMail({
          from: config.smtp.from,
          to: toEmail,
          subject,
          text,
          html,
        });
        console.log(`[MAILER-SMTP] ✅ Código OTP entregado vía SMTP a ${toEmail}`);
        return true;
      } catch (err: any) {
        console.warn(`[MAILER-SMTP] ⚠️ Fallo en transporte SMTP: ${err.message}`);
      }
    }

    // 3. MODO DE CONTINGENCIA LOCAL: Si la red bloquea ambos, muestra el OTP en consola
    console.warn('=============================================');
    console.warn(`[MAILER-FALLBACK] No hubo salida de red externa.`);
    console.warn(`[MAILER-FALLBACK] Destinatario: ${toEmail}`);
    console.warn(`[MAILER-FALLBACK] CÓDIGO OTP: [ ${otpCode} ]`);
    console.warn('=============================================');
    return false;
  }
}

export const emailService = new EmailService();