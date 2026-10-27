import { config } from '../../config/env.js';

class EmailService {
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
    const brevoApiKey = process.env.BREVO_API_KEY || (config as any).brevoApiKey;
    const senderEmail = process.env.SMTP_USER || config.smtp?.user || 'qa.testing.sec@gmail.com';

    if (!brevoApiKey) {
      console.warn('=============================================');
      console.warn('[MAILER-LOCAL] BREVO_API_KEY no configurada.');
      console.warn(`[MAILER-LOCAL] Destinatario: ${toEmail}`);
      console.warn(`[MAILER-LOCAL] CÓDIGO OTP: [ ${otpCode} ]`);
      console.warn('=============================================');
      return false;
    }

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': brevoApiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: 'QA-Sec Suite Security',
            email: senderEmail,
          },
          to: [{ email: toEmail }],
          subject: `🔑 Tu código de acceso QA-Sec Suite: ${otpCode}`,
          htmlContent: this.getHtmlTemplate(otpCode),
          textContent: `Tu código de acceso OTP para QA-Sec Suite es: ${otpCode}. Expira en 10 minutos.`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[MAILER-BREVO] ❌ Error en API HTTP:', errorData);
        console.warn(`[FALLBACK-OTP] Código para ${toEmail}: [ ${otpCode} ]`);
        return false;
      }

      console.log(`[MAILER-BREVO] ✅ Correo entregado a ${toEmail} desde ${senderEmail} vía HTTPS`);
      return true;
    } catch (error: any) {
      console.error('[MAILER-BREVO] ❌ Error de red al conectar con Brevo:', error.message);
      console.warn(`[FALLBACK-OTP] Código para ${toEmail}: [ ${otpCode} ]`);
      return false;
    }
  }
}

export const emailService = new EmailService();