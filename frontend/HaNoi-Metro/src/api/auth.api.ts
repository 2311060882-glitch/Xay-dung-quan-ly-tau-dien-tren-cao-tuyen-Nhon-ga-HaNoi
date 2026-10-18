// src/api/auth.api.ts
import axiosInstance from './axios';

export const authApi = {
  // 1. POST /api/v1/auth/register
  register: (data: { fullname: string; phone: string; password: string }) => 
    axiosInstance.post('/auth/register', data),

  // 2. POST /api/v1/auth/login
  login: (data: { phone: string; password: string }) => 
    axiosInstance.post('/auth/login', data),

  // 3. POST /api/v1/auth/logout
  logout: () => 
    axiosInstance.post('/auth/logout'),

  // 4. GET /api/v1/me
  getProfile: () => 
    axiosInstance.get('/me'),

  // 5. PUT /api/v1/me
  updateProfile: (data: { fullname: string; phone: string }) => 
    axiosInstance.put('/me', data),

  // 6. POST /api/v1/me/change-password
  changePassword: (data: { current_password: string; new_password: string }) => 
    axiosInstance.post('/me/change-password', data),
};