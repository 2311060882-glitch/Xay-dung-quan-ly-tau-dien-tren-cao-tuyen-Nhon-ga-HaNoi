import { useNavigate } from 'react-router-dom';
import { History, Users, CreditCard, Shield, LogOut, ChevronRight, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { authApi } from '../../api/auth.api';

interface UserProfile {
  fullname?: string;
  phone?: string;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    authApi.getProfile()
      .then(res => {
        if (res.data?.success) {
          setUser(res.data.data);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      localStorage.removeItem('csrf_token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 max-w-md mx-auto shadow-lg relative">
      {/* Header Profile */}
      <div className="bg-primary pt-10 pb-16 px-6 text-white rounded-b-[36px] text-center relative">
        <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-3 flex items-center justify-center border-2 border-white/50 shadow-md">
          <User size={40} className="text-white" />
        </div>
        <h1 className="text-xl font-bold">{user?.fullname || 'Hành khách'}</h1>
        <p className="text-xs text-blue-200 mt-1">{user?.phone || '098*****449'}</p>
      </div>

      {/* Menu danh mục */}
      <div className="px-4 -mt-8 space-y-3 relative z-10">
        <div className="bg-white rounded-2xl shadow-sm p-2 border border-gray-100">
          {/* Nút Lịch sử chuyến đi */}
          <button 
            onClick={() => navigate('/journeys')}
            className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 rounded-xl transition text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-primary rounded-lg">
                <History size={20} />
              </div>
              <span className="text-sm font-semibold text-gray-800">Lịch sử chuyến đi</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </button>

          {/* Nút Quản lý Định danh hộ */}
          <button 
            onClick={() => navigate('/relatives')}
            className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 rounded-xl transition text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Users size={20} />
              </div>
              <span className="text-sm font-semibold text-gray-800">Định danh hộ (Người thân)</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </button>

          {/* Nút Đăng ký ưu đãi */}
          <button 
            onClick={() => navigate('/registration/history')}
            className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 rounded-xl transition text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <Shield size={20} />
              </div>
              <span className="text-sm font-semibold text-gray-800">Đơn đăng ký vé ưu tiên</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </button>

          {/* Nút Nạp tiền / Ví */}
          <button 
            onClick={() => navigate('/wallet')}
            className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 rounded-xl transition text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <CreditCard size={20} />
              </div>
              <span className="text-sm font-semibold text-gray-800">Ví thanh toán</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Nút Đăng xuất */}
        <div className="bg-white rounded-2xl shadow-sm p-2 border border-gray-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-3.5 hover:bg-red-50 rounded-xl transition text-left text-red-600"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <LogOut size={20} />
              </div>
              <span className="text-sm font-bold">Đăng xuất tài khoản</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}