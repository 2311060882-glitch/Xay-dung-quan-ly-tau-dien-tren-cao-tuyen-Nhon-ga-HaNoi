import axiosInstance from './axios';

export const ticketApi = {
  buyTicket: (data: { 
    line_id: number; 
    ticket_type_id: number; 
    origin_station_id?: number; 
    destination_station_id?: number; 
    relative_id?: number 
  }) => {
    // Tạo 32 ký tự Hex ngẫu nhiên
    const idempotencyKey = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return axiosInstance.post('/tickets/buy.php', data, {
      headers: {
        'X-Idempotency-Key': idempotencyKey,
      },
    });
  },

  getMyTickets: () => axiosInstance.get('/tickets/ticketList.php'),
  getActiveQr: () => axiosInstance.get('/tickets/active-qr.php'),
  getTicketDetail: (id: number) => axiosInstance.get(`/tickets/detail.php?id=${id}`),
};