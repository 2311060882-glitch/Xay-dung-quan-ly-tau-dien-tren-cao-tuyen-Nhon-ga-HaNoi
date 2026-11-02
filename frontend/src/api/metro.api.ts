import axiosInstance from './axios';

export const metroApi = {
  // Lấy danh sách tuyến
  getLines: () => 
    axiosInstance.get('/metro/lineList.php'),

  // Lấy danh sách ga theo line_id (truyền qua query parameter)
  getStationsByLine: (lineId: number) => 
    axiosInstance.get(`/metro/stationsList.php?line_id=${lineId}`),
};