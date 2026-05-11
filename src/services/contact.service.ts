import api from '@/lib/api';
import type { ApiResponse, ContactMessage, SubmitContactBody } from '@/types/api';

export const contactService = {
  async submit(body: SubmitContactBody): Promise<ContactMessage> {
    const res = await api.post<ApiResponse<ContactMessage>>('/contact', body);
    return res.data.data;
  },

  async list(): Promise<ContactMessage[]> {
    const res = await api.get<ApiResponse<ContactMessage[]>>('/contact');
    return res.data.data;
  },

  async markRead(id: string): Promise<ContactMessage> {
    const res = await api.patch<ApiResponse<ContactMessage>>(`/contact/${id}/read`);
    return res.data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/contact/${id}`);
  },
};
