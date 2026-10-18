// src/api/wallet.api.ts
import axiosInstance from './axios';

export const walletApi = {
  // GET /api/v1/wallet
  getWallet: () => 
    axiosInstance.get('/wallet'),

  // POST /api/v1/wallet/top-up
  topUp: (amount: number) => 
    axiosInstance.post('/wallet/top-up', { amount }),

  // GET /api/v1/wallet/transactions
  getTransactions: () => 
    axiosInstance.get('/wallet/transactions'),
};