import axiosInstance from './axios';

export const authApi = {
  // 1. POST /api/auth/register.php
  register: (data: { fullname: string; phone: string; password: string }) => 
    axiosInstance.post('/auth/register.php', data),

  // 2. POST /api/auth/login.php
  login: (data: { phone: string; password: string }) => 
    axiosInstance.post('/auth/login.php', data),

  // 3. POST /api/auth/logout.php
  logout: () => 
    axiosInstance.post('/auth/logout.php'),

  // 4. GET /api/auth/me.php
  getProfile: () => 
    axiosInstance.get('/auth/me.php'),

  // 5. PUT /api/auth/update.php
  updateProfile: (data: { fullname: string; phone: string }) => 
    axiosInstance.put('/auth/update.php', data),

  // 6. POST /api/auth/change-password.php
  changePassword: (data: { current_password: string; new_password: string }) => 
    axiosInstance.post('/auth/change-password.php', data),
};