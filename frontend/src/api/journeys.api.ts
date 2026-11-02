import axiosInstance from './axios';

export const journeysApi = {
  // Trỏ chuẩn vào file PHP trong thư mục auth
  getMyJourneys: () => axiosInstance.get('auth/journeys.php'),
};