import axiosInstance from './axios';

export type AdminTripsQuery = Record<string, string | number | boolean | undefined>;

export type CreateAdminTripData = {
  line_id: number;
  trip_code: string;
  direction: 'OUTBOUND' | 'INBOUND';
  departure_time: string;
  capacity?: number;
};

export const adminTripsApi = {
  // Trỏ chuẩn vào api/admin/trips/listTrips.php
  getTrips: (params?: AdminTripsQuery) => 
    axiosInstance.get('/api/admin/trips/listTrips.php', { params }),

  // Trỏ chuẩn vào api/admin/trips/create.php
  createTrip: (data: CreateAdminTripData) => 
    axiosInstance.post('/api/admin/trips/create.php', data),

  // Trỏ chuẩn vào api/admin/trips/status.php
  updateTripStatus: (id: string | number, status: string) => 
    axiosInstance.post('/api/admin/trips/status.php', { id, status }),

  // Trỏ chuẩn vào api/admin/tickets/check-in.php
  checkInQR: (qr_code: string, trip_id: number, station_id: number) => 
    axiosInstance.post('/api/admin/tickets/check-in.php', { qr_code, trip_id, station_id }),

  // Trỏ chuẩn vào api/admin/tickets/check-out.php
  checkOutQR: (qr_code: string, trip_id: number, station_id: number) => 
    axiosInstance.post('/api/admin/tickets/check-out.php', { qr_code, trip_id, station_id }),
};