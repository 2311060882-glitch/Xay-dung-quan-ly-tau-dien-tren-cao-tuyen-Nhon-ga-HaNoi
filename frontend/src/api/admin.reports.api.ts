import axiosInstance from './axios';

export interface TicketSalesQuery {
  from?: string;
  to?: string;
  line_id?: number;
  ticket_type_id?: number;
  group_by?: 'day' | 'line' | 'ticket_type';
}

export const adminReportsApi = {
  // Sửa ticketSales.php -> ticket-sales.php chuẩn theo backend
  getTicketSales: (params?: TicketSalesQuery) =>
    axiosInstance.get('/api/admin/reports/ticket-sales.php', { params }),
    
  getTraffic: (params?: Record<string, string | number>) =>
    axiosInstance.get('/api/admin/reports/traffic.php', { params }),
};