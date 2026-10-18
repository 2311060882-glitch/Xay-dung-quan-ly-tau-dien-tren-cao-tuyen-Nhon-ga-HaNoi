// src/api/metro.api.ts
import axiosInstance from './axios';

export const metroApi = {
  // 7. GET /api/v1/lines
  getLines: () => 
    axiosInstance.get('/lines'),

  // 8. GET /api/v1/lines/{id}/stations
  getStationsByLine: (lineId: number) => 
    axiosInstance.get(`/lines/${lineId}/stations`),

  // 9. GET /api/v1/ticket-types
  getTicketTypes: () => 
    axiosInstance.get('/ticket-types'),
};