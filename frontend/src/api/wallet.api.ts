import axiosInstance from './axios';

export const walletApi = {
  // Xem số dư ví
  getBalance: () =>
    axiosInstance.get('/wallet/balance.php'),

  // Alias giữ tương thích với code cũ
  getWallet: () =>
    axiosInstance.get('/wallet/balance.php'),

  // Nạp tiền
  topup: (amount: number) =>
    axiosInstance.post('/wallet/topup.php', { amount }),

  // Alias giữ tương thích với code cũ
  topUp: (amount: number) =>
    axiosInstance.post('/wallet/topup.php', { amount }),

  // Lịch sử giao dịch
  getTransactions: () =>
    axiosInstance.get('/wallet/transactions.php'),
};