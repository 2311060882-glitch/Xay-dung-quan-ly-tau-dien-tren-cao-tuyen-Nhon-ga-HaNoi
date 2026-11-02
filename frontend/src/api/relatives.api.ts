import axiosInstance from './axios';

export interface CreateRelativeData {
  full_name: string;
  id_card: string;
  date_of_birth: string;
  type: 'ADULT' | 'CHILD' | 'STUDENT' | 'SENIOR';
}

export const relativesApi = {
  // Trỏ đúng vào file php trong folder api/relatives
  getRelatives: () => axiosInstance.get('/api/relatives/indexRelatives.php'),
  
  createRelative: (data: CreateRelativeData) => axiosInstance.post('/api/relatives/indexRelatives.php', data),
  
  // Tùy thuộc vào cách bạn viết xử lý method DELETE trong file indexRelatives.php, có thể truyền param id như sau:
  deleteRelative: (id: number) => axiosInstance.delete(`/api/relatives/indexRelatives.php?id=${id}`),
};