import { emailService } from './auth/email.service.js';

export const sendOtpEmail = async (toEmail: string, otpCode: string): Promise<boolean> => {
  return await emailService.sendOtpEmail(toEmail, otpCode);
};

export { emailService };