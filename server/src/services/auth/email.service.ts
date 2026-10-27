export interface EmailSender {
  sendOtpEmail(targetEmail: string, otpCode: string): Promise<void>;
}

export class ConsoleEmailService implements EmailSender {
  async sendOtpEmail(targetEmail: string, otpCode: string): Promise<void> {
    console.log('\n===============================================');
    console.log(`[AUTH-EMAIL-DISPATCH] Para: ${targetEmail}`);
    console.log(`[AUTH-EMAIL-DISPATCH] Tu código OTP es: ${otpCode}`);
    console.log(`[AUTH-EMAIL-DISPATCH] Validez: 10 minutos`);
    console.log('===============================================\n');
  }
}

export const emailService: EmailSender = new ConsoleEmailService();