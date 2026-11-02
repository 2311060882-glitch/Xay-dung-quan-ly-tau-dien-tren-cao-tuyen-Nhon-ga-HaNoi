import axiosInstance from './axios';

export const adminApi = {
  // Trỏ vào file indexPriority.php của admin để lấy danh sách
  getAllRegistrations: () => 
    axiosInstance.get('/api/admin/priority/indexPriority.php'),
    
  // Vẫn trỏ vào file đó (hoặc tuỳ theo backend bro quy định route POST thế nào) để duyệt/từ chối
  updateRegistrationStatus: (id: string | number, status: 'APPROVED' | 'REJECTED', reason?: string) =>
    axiosInstance.post('/api/admin/priority/indexPriority.php', { 
      id: id, 
      status: status, 
      rejection_reason: reason 
    }),
};