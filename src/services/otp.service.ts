import api from '@/lib/api';

export const otpService = {
  async send(email: string): Promise<void> {
    await api.post('/otp/send', { email });
  },
  async verify(email: string, otp: string): Promise<void> {
    await api.post('/otp/verify', { email, otp });
  },
};
