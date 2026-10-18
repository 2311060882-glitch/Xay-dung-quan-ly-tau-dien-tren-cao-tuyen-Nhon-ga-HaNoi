// src/api/ticket.api.ts
import axiosInstance from './axios';

export const ticketApi = {
  // 10. POST /api/v1/tickets/buy
  buyTicket: (data: { ticket_type_id: number; line_id: number }) => 
    axiosInstance.post('/tickets/buy', data),

  // 11. GET /api/v1/tickets
  getMyTickets: () => 
    axiosInstance.get('/tickets'),

  // 12. GET /api/v1/tickets/{id}
  getTicketDetail: (ticketId: number) => 
    axiosInstance.get(`/tickets/${ticketId}`),

  // 13. GET /api/v1/tickets/active-qr
  getActiveQr: () => 
    axiosInstance.get('/tickets/active-qr'),
};