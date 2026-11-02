// src/pages/user/WalletPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Wallet, PlusCircle, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { walletApi } from '../../api/wallet.api';

export default function WalletPage() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number>(0);
  const [amount, setAmount] = useState<number | string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 1. Hàm lấy số dư linh hoạt với các kiểu response khác nhau từ Backend
  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true);
      const res = await walletApi.getBalance();
      console.log('GET Balance API Response:', res); // Log kiểm tra response thực tế

      const resPayload = res.data || res;
      const isSuccess = 
        resPayload.success === true || 
        resPayload.status === true || 
        resPayload.status === 200;

      if (isSuccess) {
        // Hỗ trợ cả trường hợp data nằm ở resPayload.data hoặc trực tiếp trong resPayload
        const innerData = resPayload.data || resPayload;
        const rawBalance = innerData.wallet_balance ?? innerData.balance ?? 0;
        setBalance(Number(rawBalance));
      } else {
        console.warn('Không thể lấy số dư:', resPayload.message);
      }
    } catch (err) {
      console.error('Lỗi khi gọi API lấy số dư:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadBalance = async () => {
      try {
        const res = await walletApi.getBalance();
        if (!active) return;

        const resPayload = res.data || res;
        const isSuccess =
          resPayload.success === true ||
          resPayload.status === true ||
          resPayload.status === 200;

        if (isSuccess) {
          const innerData = resPayload.data || resPayload;
          const rawBalance = innerData.wallet_balance ?? innerData.balance ?? 0;
          setBalance(Number(rawBalance));
        } else {
          console.warn('Không thể lấy số dư:', resPayload.message);
        }
      } catch (err) {
        if (active) console.error('Lỗi khi gọi API lấy số dư:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadBalance();

    return () => {
      active = false;
    };
  }, [fetchBalance]);

  // 2. Hàm gọi API nạp tiền
  const handleTopUp = async () => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      alert('Vui lòng nhập hoặc chọn số tiền nạp hợp lệ.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await walletApi.topup(numAmount);
      console.log('TOPUP API Response:', res); // Log kiểm tra sau nạp

      const resPayload = res.data || res;
      const isSuccess = 
        resPayload.success === true || 
        resPayload.status === true || 
        resPayload.status === 200 ||
        resPayload.status === 201;

      if (isSuccess) {
        alert(`Nạp thành công ${numAmount.toLocaleString('vi-VN')}đ vào ví!`);
        setAmount('');
        
        // Gọi lại hàm lấy số dư mới từ DB
        await fetchBalance();
      } else {
        alert(resPayload.message || 'Nạp tiền thất bại.');
      }
    } catch (error: unknown) {
      const apiError = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      alert(apiError.response?.data?.message || 'Có lỗi xảy ra khi nạp tiền.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center items-center">
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col relative pb-28 shadow-xl">

        {/* Header */}
        <div className="px-4 py-4 flex items-center gap-3 sticky top-0 z-10 bg-white border-b border-gray-100">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft size={22} className="text-gray-800" />
          </button>
          <h1 className="text-base font-bold text-gray-900">Ví thanh toán nội bộ</h1>
        </div>

        <div className="px-4 mt-4">
          {/* Card Số Dư Realtime */}
          <div className="bg-linear-to-r from-blue-600 to-blue-500 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/30 mb-6">
            <div className="flex items-center gap-2 mb-2 opacity-90">
              <Wallet size={18} />
              <span className="text-sm font-medium">Số dư khả dụng</span>
            </div>
            <h2 className="text-3xl font-black">
              {loading ? '---' : `${balance.toLocaleString('vi-VN')} đ`}
            </h2>
          </div>

          {/* Khu vực nạp tiền */}
          <h3 className="font-bold text-gray-800 mb-3 text-sm">Nạp tiền vào ví</h3>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[20000, 50000, 100000, 200000, 500000].map((val) => (
              <button
                key={val}
                onClick={() => setAmount(val)}
                className={`py-2 rounded-xl text-sm font-bold border transition ${
                  Number(amount) === val 
                    ? 'bg-blue-50 border-blue-500 text-blue-600' 
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {val.toLocaleString('vi-VN')}đ
              </button>
            ))}
          </div>

          <div className="flex gap-2 mb-8">
            <input 
              type="number" 
              placeholder="Nhập số tiền khác..." 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-blue-500"
            />
            <button 
              onClick={handleTopUp}
              disabled={isSubmitting}
              className={`bg-blue-600 text-white px-5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition active:scale-95 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <PlusCircle size={18} /> {isSubmitting ? 'Đang nạp...' : 'Nạp'}
            </button>
          </div>

          {/* Lịch sử giao dịch */}
          <div className="flex items-center gap-2 mb-3">
            <History size={18} className="text-gray-500" />
            <h3 className="font-bold text-gray-800 text-sm">Giao dịch gần đây</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 border border-gray-100 rounded-xl bg-gray-50">
              <div>
                <p className="text-sm font-bold text-gray-800">Biến động tài khoản</p>
                <p className="text-xs text-gray-500">Cập nhật trực tiếp từ hệ thống</p>
              </div>
              <p className="text-sm font-bold text-emerald-600">Đã đồng bộ DB</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}